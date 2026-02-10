import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { fetchSitemap } from './changeDetector';
import { validate } from './configGenerator';
import { parseHtml } from './contentParser';
import { fetchWithRetry } from './crawler';
import { install, previewInstall } from './fileInstaller';
import { updateIndex, urlToCategory, urlToSlug, write as writeKb } from './knowledgeBase';
import { TEMPLATES_CONTENT } from './refDataTemplates';
import { getDecisionMatrix } from './toolingAdvisor';
import type {
  DocumentationSection,
  InstallTarget,
  KiroToolType,
  PlatformGuide,
  PlatformTarget,
  ScaffoldOptions,
  ScaffoldResult,
} from './types';
import type { RegistryEntry, UrlCategory } from './types';
import {
  getActive,
  getByCategory,
  load as loadRegistry,
  markFailed,
  save as saveRegistry,
  seedAgentSkillsUrls,
  seedSitemapUrls,
  updateLastCrawled,
} from './urlRegistry';
import { compareAgainstBestPractices, generateReport, scan } from './workspaceAuditor';

// ─── Cache Types ───────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  ttl: number; // milliseconds
}

// ─── Response Cache ────────────────────────────────────────

class ResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// ─── Knowledge Base Reader ─────────────────────────────────

async function readKnowledgeBase(basePath: string): Promise<Map<string, string>> {
  const kbPath = path.join(basePath, 'knowledge-base');
  const files = new Map<string, string>();

  try {
    await walkDirectory(kbPath, files);
  } catch (error) {
    console.error('Failed to read knowledge base:', error);
  }

  return files;
}

async function walkDirectory(dir: string, files: Map<string, string>): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        files.set(fullPath, content);
      }
    }
  } catch (error) {
    // Directory doesn't exist or not accessible
  }
}

// ─── Query Knowledge Base ──────────────────────────────────

async function queryKnowledgeBase(
  basePath: string,
  cache: ResponseCache,
  params: {
    topic?: string;
    toolType?: KiroToolType;
    searchTerm?: string;
  },
): Promise<DocumentationSection[]> {
  const cacheKey = `kb:${params.topic || ''}:${params.toolType || ''}:${params.searchTerm || ''}`;
  const cached = cache.get<DocumentationSection[]>(cacheKey);
  if (cached) return cached;

  const files = await readKnowledgeBase(basePath);
  const sections: DocumentationSection[] = [];

  for (const [filePath, content] of files) {
    const matches = matchesQuery(filePath, content, params);
    if (matches) {
      sections.push({
        topic: extractTopic(filePath),
        toolType: extractToolType(filePath),
        content: content.slice(0, 5000), // Limit content size
        source: filePath,
      });
    }
  }

  cache.set(cacheKey, sections);
  return sections;
}

function matchesQuery(
  filePath: string,
  content: string,
  params: {
    topic?: string;
    toolType?: KiroToolType;
    searchTerm?: string;
  },
): boolean {
  const lower = content.toLowerCase();
  const pathLower = filePath.toLowerCase();

  if (params.topic && !pathLower.includes(params.topic.toLowerCase())) {
    return false;
  }

  if (params.toolType && !pathLower.includes(params.toolType.toLowerCase())) {
    return false;
  }

  if (params.searchTerm && !lower.includes(params.searchTerm.toLowerCase())) {
    return false;
  }

  return true;
}

function extractTopic(filePath: string): string {
  const parts = filePath.split(path.sep);
  const kbIndex = parts.indexOf('knowledge-base');
  if (kbIndex >= 0 && kbIndex < parts.length - 1) {
    return parts[kbIndex + 1];
  }
  return 'general';
}

function extractToolType(filePath: string): KiroToolType | null {
  const pathLower = filePath.toLowerCase();
  if (pathLower.includes('hook')) return 'hook';
  if (pathLower.includes('skill')) return 'skill';
  if (pathLower.includes('power')) return 'power';
  if (pathLower.includes('steering')) return 'steering-doc';
  if (pathLower.includes('spec')) return 'spec';
  if (pathLower.includes('mcp')) return 'mcp-server';
  if (pathLower.includes('agent')) return 'custom-agent';
  return null;
}

// ─── Get Platform Guide ────────────────────────────────────

function getPlatformGuide(platform: PlatformTarget): PlatformGuide {
  const installNote =
    'Install scopes: workspace (project .kiro/), ' +
    'global (~/.kiro for all projects), or ' +
    'custom (any target directory). ' +
    'Use install_tool MCP tool or ' +
    'npx tsx bin/scaffold.ts --scope <scope>.';

  const guides: Record<PlatformTarget, PlatformGuide> = {
    ide: {
      platform: 'ide',
      setupInstructions: `Install Kiro IDE. Create custom-powers/ directory. Add POWER.md with frontmatter. Optionally add mcp.json and steering/ files. ${installNote}`,
      capabilities: [
        'Powers with POWER.md',
        'Specs with requirements/design/tasks',
        'Subagents for delegation',
        'Context providers (#-prefixed)',
        'Hooks (file events, agent events)',
        'Steering docs (always, fileMatch, manual)',
        'Skills (portable agent skills)',
        'MCP servers (via mcp.json)',
      ],
      workflows: [
        'Create power: custom-powers/{name}/POWER.md',
        'Create spec: .kiro/specs/{name}/',
        'Create hook: .kiro/hooks/{name}.kiro.hook',
        'Create steering: .kiro/steering/{name}.md',
        'Create skill: .kiro/skills/{name}/SKILL.md',
      ],
      configTemplate: {
        power: {
          name: 'my-power',
          displayName: 'My Power',
          description: 'Power description',
          keywords: ['keyword1', 'keyword2'],
        },
      },
    },
    cli: {
      platform: 'cli',
      setupInstructions: `Install Kiro CLI. Create AGENTS.md at workspace root. Define custom agents with mcpServers, resources, hooks. ${installNote}`,
      capabilities: [
        'Custom agents (.kiro/agents/)',
        'Knowledge bases (file:// resources)',
        'Hooks (file events, agent events)',
        'Steering docs (always, fileMatch, manual)',
        'Skills (portable agent skills)',
        'MCP servers (via mcpServers config)',
        'Delegate to other agents',
      ],
      workflows: [
        'Create agent: .kiro/agents/{name}.json',
        'Create hook: .kiro/hooks/{name}.kiro.hook',
        'Create steering: .kiro/steering/{name}.md',
        'Create skill: .kiro/skills/{name}/SKILL.md',
        'Add knowledge base: resources: ["file://path"]',
      ],
      configTemplate: {
        agent: {
          name: 'my-agent',
          description: 'Agent description',
          mcpServers: {},
          resources: [],
        },
      },
    },
    both: {
      platform: 'both',
      setupInstructions: `Install both Kiro IDE and CLI. Use cross-platform features: hooks, steering, skills, MCP servers. ${installNote}`,
      capabilities: [
        'Hooks (both platforms)',
        'Steering docs (both platforms)',
        'Skills (both platforms)',
        'MCP servers (both platforms)',
      ],
      workflows: [
        'Create hook: .kiro/hooks/{name}.kiro.hook',
        'Create steering: .kiro/steering/{name}.md',
        'Create skill: .kiro/skills/{name}/SKILL.md',
        'Create MCP server: .kiro/settings/mcp.json',
      ],
      configTemplate: {
        hook: {
          name: 'my-hook',
          version: '1.0.0',
          when: { type: 'fileSaved' },
          then: { type: 'askAgent', prompt: 'Review changes' },
        },
      },
    },
  };

  return guides[platform];
}

// ─── Scaffold Tool ─────────────────────────────────────────

function scaffoldTool(toolType: KiroToolType, options: ScaffoldOptions): ScaffoldResult {
  const template = TEMPLATES_CONTENT[toolType];
  const files: Array<{ path: string; content: string }> = [];

  // Generate files based on tool type
  switch (toolType) {
    case 'power':
      files.push({
        path: `custom-powers/${options.name}/POWER.md`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
      if (options.platform === 'ide' || options.platform === 'both') {
        files.push({
          path: `custom-powers/${options.name}/mcp.json`,
          content: JSON.stringify(
            {
              mcpServers: {
                'kiro-wiz': {
                  command: 'node',
                  args: ['lib/mcpServer'],
                },
              },
            },
            null,
            2,
          ),
        });
      }
      break;

    case 'custom-agent':
      files.push({
        path: `agents/${options.name}.json`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
      break;

    case 'hook':
      files.push({
        path: `.kiro/hooks/${options.name}.kiro.hook`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
      break;

    case 'steering-doc':
      files.push({
        path: `.kiro/steering/${options.name}.md`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
      break;

    case 'skill':
      files.push({
        path: `.kiro/skills/${options.name}/SKILL.md`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
      break;

    default:
      files.push({
        path: `${options.name}.md`,
        content: template
          .replace(/\{name\}/g, options.name)
          .replace(/\{description\}/g, options.description),
      });
  }

  return {
    files,
    instructions: `Created ${files.length} file(s) for ${toolType}. Review and customize as needed.`,
  };
}

// ─── MCP Server ────────────────────────────────────────────

export interface McpServerConfig {
  basePath: string;
  cacheTtl?: number;
  transport?: 'stdio' | 'http';
  port?: number;
}

export class KiroMcpServer {
  private server: Server;
  private cache: ResponseCache;
  private config: McpServerConfig;
  private isHealthy = true;

  constructor(config: McpServerConfig) {
    this.config = {
      cacheTtl: 300000, // 5 minutes default
      transport: 'stdio',
      ...config,
    };

    this.cache = new ResponseCache({
      ttl: this.config.cacheTtl!,
    });

    this.server = new Server(
      {
        name: 'kiro-wiz',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'query_knowledge_base',
          description: 'Query the Kiro knowledge base by topic, tool type, or search term',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: 'Topic category to filter by',
              },
              toolType: {
                type: 'string',
                description: 'Kiro tool type to filter by',
                enum: [
                  'spec',
                  'hook',
                  'steering-doc',
                  'skill',
                  'power',
                  'mcp-server',
                  'custom-agent',
                  'autonomous-agent',
                  'subagent',
                  'context-provider',
                ],
              },
              searchTerm: {
                type: 'string',
                description: 'Search term to find in content',
              },
            },
          },
        },
        {
          name: 'get_decision_matrix',
          description: 'Get the decision matrix comparing all Kiro tool types',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_template',
          description: 'Get a starter template for a specific Kiro tool type',
          inputSchema: {
            type: 'object',
            properties: {
              toolType: {
                type: 'string',
                description: 'The Kiro tool type',
                enum: [
                  'spec',
                  'hook',
                  'steering-doc',
                  'skill',
                  'power',
                  'mcp-server',
                  'custom-agent',
                  'autonomous-agent',
                  'subagent',
                  'context-provider',
                ],
              },
            },
            required: ['toolType'],
          },
        },
        {
          name: 'scaffold_tool',
          description: 'Scaffold a new Kiro tool with generated files',
          inputSchema: {
            type: 'object',
            properties: {
              toolType: {
                type: 'string',
                description: 'The Kiro tool type to scaffold',
                enum: [
                  'spec',
                  'hook',
                  'steering-doc',
                  'skill',
                  'power',
                  'mcp-server',
                  'custom-agent',
                  'autonomous-agent',
                  'subagent',
                  'context-provider',
                ],
              },
              options: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the tool',
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the tool',
                  },
                  platform: {
                    type: 'string',
                    description: 'Target platform',
                    enum: ['ide', 'cli', 'both'],
                  },
                },
                required: ['name', 'description'],
              },
            },
            required: ['toolType', 'options'],
          },
        },
        {
          name: 'validate_config',
          description: 'Validate a configuration against its schema',
          inputSchema: {
            type: 'object',
            properties: {
              toolType: {
                type: 'string',
                description: 'The Kiro tool type',
                enum: [
                  'spec',
                  'hook',
                  'steering-doc',
                  'skill',
                  'power',
                  'mcp-server',
                  'custom-agent',
                ],
              },
              config: {
                type: 'object',
                description: 'The configuration to validate',
              },
            },
            required: ['toolType', 'config'],
          },
        },
        {
          name: 'audit_workspace',
          description: 'Audit workspace Kiro configurations against best practices',
          inputSchema: {
            type: 'object',
            properties: {
              workspacePath: {
                type: 'string',
                description: 'Path to workspace root',
              },
            },
            required: ['workspacePath'],
          },
        },
        {
          name: 'get_platform_guide',
          description: 'Get platform-specific setup instructions and capabilities',
          inputSchema: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                description: 'Target platform',
                enum: ['ide', 'cli', 'both'],
              },
            },
            required: ['platform'],
          },
        },
        {
          name: 'install_tool',
          description:
            'Scaffold and install a Kiro tool to a target directory. ' +
            'Supports workspace (.kiro/), global (~/.kiro), or custom path.',
          inputSchema: {
            type: 'object',
            properties: {
              toolType: {
                type: 'string',
                description: 'The Kiro tool type to scaffold and install',
                enum: [
                  'spec',
                  'hook',
                  'steering-doc',
                  'skill',
                  'power',
                  'mcp-server',
                  'custom-agent',
                  'autonomous-agent',
                  'subagent',
                  'context-provider',
                ],
              },
              options: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the tool',
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the tool',
                  },
                  platform: {
                    type: 'string',
                    description: 'Target platform',
                    enum: ['ide', 'cli', 'both'],
                  },
                },
                required: ['name', 'description'],
              },
              installTarget: {
                type: 'object',
                description:
                  'Where to install. scope: workspace (cwd .kiro/), ' +
                  'global (~/.kiro), or custom (targetDir required).',
                properties: {
                  scope: {
                    type: 'string',
                    description: 'Install scope',
                    enum: ['workspace', 'global', 'custom'],
                  },
                  targetDir: {
                    type: 'string',
                    description: 'Absolute path for custom scope. Ignored for workspace/global.',
                  },
                },
                required: ['scope'],
              },
              dryRun: {
                type: 'boolean',
                description: 'If true, returns file paths without writing. Default false.',
              },
            },
            required: ['toolType', 'options', 'installTarget'],
          },
        },
        {
          name: 'sync_knowledge_base',
          description:
            'Sync the local knowledge base by crawling kiro.dev documentation. ' +
            'Can sync all URLs, a specific URL, or a specific category.',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                description: 'Sync mode: all (default), url, or category',
                enum: ['all', 'url', 'category'],
              },
              target: {
                type: 'string',
                description: 'URL or category name (required for url/category modes)',
              },
            },
          },
        },
      ],
    }));

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'query_knowledge_base': {
            const sections = await queryKnowledgeBase(
              this.config.basePath,
              this.cache,
              args as {
                topic?: string;
                toolType?: KiroToolType;
                searchTerm?: string;
              },
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(sections, null, 2),
                },
              ],
            };
          }

          case 'get_decision_matrix': {
            const matrix = getDecisionMatrix();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(matrix, null, 2),
                },
              ],
            };
          }

          case 'get_template': {
            const { toolType } = args as { toolType: KiroToolType };
            const template = TEMPLATES_CONTENT[toolType];
            return {
              content: [
                {
                  type: 'text',
                  text: template,
                },
              ],
            };
          }

          case 'scaffold_tool': {
            const { toolType, options } = args as {
              toolType: KiroToolType;
              options: ScaffoldOptions;
            };
            const result = scaffoldTool(toolType, options);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'validate_config': {
            const { toolType, config } = args as {
              toolType: KiroToolType;
              config: unknown;
            };
            const result = validate({ toolType, config } as never);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'audit_workspace': {
            const { workspacePath } = args as {
              workspacePath: string;
            };
            const scannedFiles = await scan(workspacePath);
            const findings = await compareAgainstBestPractices(workspacePath, scannedFiles);
            const report = generateReport(findings, scannedFiles);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(report, null, 2),
                },
              ],
            };
          }

          case 'get_platform_guide': {
            const { platform } = args as {
              platform: PlatformTarget;
            };
            const guide = getPlatformGuide(platform);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(guide, null, 2),
                },
              ],
            };
          }

          case 'install_tool': {
            const { toolType, options, installTarget, dryRun } = args as {
              toolType: KiroToolType;
              options: ScaffoldOptions;
              installTarget: InstallTarget;
              dryRun?: boolean;
            };

            const scaffoldResult = scaffoldTool(toolType, options);

            if (dryRun) {
              const preview = previewInstall(scaffoldResult, installTarget);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(
                      {
                        dryRun: true,
                        ...preview,
                        instructions: scaffoldResult.instructions,
                      },
                      null,
                      2,
                    ),
                  },
                ],
              };
            }

            const installResult = await install(scaffoldResult, installTarget);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      ...installResult,
                      instructions: scaffoldResult.instructions,
                    },
                    null,
                    2,
                  ),
                },
              ],
            };
          }

          case 'sync_knowledge_base': {
            const syncArgs = args as { mode?: string; target?: string };
            const mode = syncArgs.mode ?? 'all';
            const registryPath = path.resolve(this.config.basePath, 'knowledge-base/registry.json');
            const kbBaseDir = path.resolve(this.config.basePath, 'knowledge-base');

            let entries: RegistryEntry[];
            try {
              entries = await loadRegistry(registryPath);
            } catch {
              entries = [];
            }

            if (entries.length === 0 && mode === 'all') {
              try {
                const sitemap = await fetchSitemap('https://kiro.dev/sitemap.xml');
                entries = seedSitemapUrls(
                  entries,
                  sitemap.map((e) => ({ url: e.url, lastmod: e.lastmod })),
                );
              } catch {
                /* ignore */
              }
              entries = seedAgentSkillsUrls(entries);
              await saveRegistry(entries, registryPath);
            }

            let targets: RegistryEntry[];
            if (mode === 'url' && syncArgs.target) {
              targets = entries.filter((e) => e.url === syncArgs.target);
            } else if (mode === 'category' && syncArgs.target) {
              targets = getByCategory(getActive(entries), syncArgs.target as UrlCategory);
            } else {
              targets = getActive(entries);
            }

            const results: string[] = [];
            for (const target of targets) {
              try {
                const result = await fetchWithRetry(target.url);
                const parsed = parseHtml(result.html);
                await writeKb(
                  {
                    slug: urlToSlug(target.url),
                    category: urlToCategory(target.url),
                    title: parsed.title,
                    content: parsed.markdown,
                    sourceUrl: target.url,
                    lastUpdated: new Date().toISOString(),
                  },
                  kbBaseDir,
                );
                entries = updateLastCrawled([...entries], target.url);
                results.push(`✓ ${urlToCategory(target.url)}/${urlToSlug(target.url)}`);
              } catch (err) {
                entries = markFailed([...entries], target.url);
                results.push(
                  `✗ ${target.url}: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
            }

            await saveRegistry(entries, registryPath);
            await updateIndex(kbBaseDir);

            return {
              content: [
                { type: 'text', text: `Synced ${targets.length} URLs:\n${results.join('\n')}` },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: message,
                  isRetryable: false,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    if (this.config.transport === 'stdio') {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('MCP server started on stdio');
    } else {
      // HTTP/SSE transport would be implemented here
      throw new Error('HTTP transport not yet implemented');
    }
  }

  getHealthStatus(): { healthy: boolean; message: string } {
    return {
      healthy: this.isHealthy,
      message: this.isHealthy ? 'Server is healthy' : 'Server is unhealthy',
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ─── Export Factory ────────────────────────────────────────

export function createMcpServer(config: McpServerConfig): KiroMcpServer {
  return new KiroMcpServer(config);
}
