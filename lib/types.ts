// ─── URL & Registry Types ───────────────────────────────────

export type UrlCategory =
  | 'getting-started'
  | 'editor'
  | 'specs'
  | 'chat'
  | 'hooks'
  | 'steering'
  | 'skills'
  | 'powers'
  | 'mcp'
  | 'guides'
  | 'cli'
  | 'autonomous-agent'
  | 'blog'
  | 'changelog'
  | 'agent-skills-spec'
  | 'privacy-and-security'
  | 'enterprise'
  | 'context-providers'
  | 'unknown';

export const URL_CATEGORIES = [
  'getting-started',
  'editor',
  'specs',
  'chat',
  'hooks',
  'steering',
  'skills',
  'powers',
  'mcp',
  'guides',
  'cli',
  'autonomous-agent',
  'blog',
  'changelog',
  'agent-skills-spec',
  'privacy-and-security',
  'enterprise',
  'context-providers',
  'unknown',
] as const;

export interface RegistryEntry {
  url: string;
  category: UrlCategory;
  source: 'sitemap' | 'agentskills' | 'manual';
  lastCrawled: string | null;
  lastmod: string | null;
  status: 'active' | 'stale' | 'failed';
}

export interface SitemapEntry {
  url: string;
  lastmod: string | null;
  changefreq: string | null;
  priority: number | null;
}

// ─── Crawl Types ────────────────────────────────────────────

export interface CrawlResult {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
}

export interface CrawlError {
  url: string;
  error: string;
  retryCount: number;
}

// ─── Content Parser Types ───────────────────────────────────

export interface ParsedContent {
  title: string;
  description: string;
  headings: Array<{ level: number; text: string }>;
  markdown: string;
  codeBlocks: Array<{ language: string; content: string }>;
  tables: string[];
  links: string[];
  metadata: Record<string, string>;
  frontmatter: Record<string, unknown> | null;
}

// ─── Knowledge Base Types ───────────────────────────────────

export interface KnowledgeBaseEntry {
  slug: string;
  category: UrlCategory;
  title: string;
  content: string;
  sourceUrl: string;
  lastUpdated: string;
}

// ─── Kiro Tool Types ────────────────────────────────────────

export type KiroToolType =
  | 'spec'
  | 'hook'
  | 'steering-doc'
  | 'skill'
  | 'power'
  | 'mcp-server'
  | 'custom-agent'
  | 'autonomous-agent'
  | 'subagent'
  | 'context-provider';

export const KIRO_TOOL_TYPES = [
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
] as const;

export type PlatformTarget = 'ide' | 'cli' | 'both';

export const TOOL_PLATFORM: Record<KiroToolType, 'ide-only' | 'cli-only' | 'both' | 'cloud'> = {
  spec: 'ide-only',
  hook: 'both',
  'steering-doc': 'both',
  skill: 'both',
  power: 'ide-only',
  'mcp-server': 'both',
  'custom-agent': 'cli-only',
  'autonomous-agent': 'cloud',
  subagent: 'ide-only',
  'context-provider': 'ide-only',
} as const;

// ─── Compiled Reference Types ───────────────────────────────

export interface TocEntry {
  title: string;
  anchor: string;
  level: number;
}

export interface ReferenceSection {
  title: string;
  toolType: KiroToolType | null;
  content: string;
  subsections: ReferenceSection[];
}

export interface DecisionMatrixEntry {
  toolType: KiroToolType;
  whatItIs: string;
  whenToUse: string;
  whenNotToUse: string;
  alternatives: string[];
  platform: PlatformTarget;
}

export interface ScenarioMapping {
  scenario: string;
  recommendedTools: KiroToolType[];
  rationale: string;
}

export interface CompiledReference {
  toc: TocEntry[];
  sections: ReferenceSection[];
  decisionMatrix: DecisionMatrixEntry[];
  quickReference: ScenarioMapping[];
}

export interface CompilerOptions {
  includeDecisionMatrix: boolean;
  includeQuickReference: boolean;
  toolTypes: KiroToolType[] | null;
}

// ─── Change Detector Types ──────────────────────────────────

export interface ChangeDetectorResult {
  newUrls: string[];
  modifiedUrls: string[];
  removedUrls: string[];
  timestamp: string;
}

export interface ChangeDetectorState {
  lastRun: string | null;
  lastChangelogTimestamp: string | null;
  knownUrls: string[];
}

// ─── Severity & Audit Types ────────────────────────────────

export type Severity = 'critical' | 'recommended' | 'optional';

export const SEVERITY_LEVELS = ['critical', 'recommended', 'optional'] as const;

export interface AuditFinding {
  severity: Severity;
  category: string;
  message: string;
  file: string | null;
  suggestion: string;
  kbRef: string | null;
}

export interface AuditReport {
  findings: AuditFinding[];
  summary: { critical: number; recommended: number; optional: number };
  scannedFiles: string[];
}

// ─── Reference Library Types ────────────────────────────────

export type DocType = 'best-practices' | 'examples' | 'templates';

export interface ReferenceDocument {
  toolType: KiroToolType;
  docType: DocType;
  title: string;
  content: string;
  crossRefs: string[];
}

// ─── Tool Recommendation Types ──────────────────────────────

export interface ToolRecommendation {
  toolType: KiroToolType;
  rationale: string;
  kbRefs: string[];
  template: string | null;
  tradeOffs: string[];
  platform: PlatformTarget;
  creditCost: 'none' | 'low' | 'medium' | 'high';
}

// ─── Config Types ───────────────────────────────────────────

export interface HookConfig {
  name: string;
  version: string;
  description?: string;
  when: {
    type:
      | 'fileSaved'
      | 'fileCreated'
      | 'fileDeleted'
      | 'promptSubmit'
      | 'agentStop'
      | 'preToolUse'
      | 'postToolUse'
      | 'userTriggered';
    patterns?: string[];
    toolTypes?: string[];
  };
  then: {
    type: 'askAgent' | 'runCommand';
    prompt?: string;
    command?: string;
  };
}

export interface McpServerConfig {
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}

export interface AgentConfig {
  name: string;
  description: string;
  prompt?: string;
  model?: string;
  tools?: string[];
  allowedTools?: string[];
  toolAliases?: Record<string, string>;
  toolsSettings?: Record<string, unknown>;
  mcpServers?: Record<string, McpServerConfig>;
  resources?: string[];
  hooks?: Record<string, unknown>;
  includeMcpJson?: boolean;
  keyboardShortcut?: string;
  welcomeMessage?: string;
}

export interface CliAgentConfig extends AgentConfig {
  mcpServers: Record<string, McpServerConfig>;
}

export interface PowerConfig {
  name: string;
  displayName: string;
  description: string;
  keywords: string[];
}

export interface SteeringConfig {
  inclusion: 'always' | 'fileMatch' | 'manual';
  fileMatchPattern?: string;
  content: string;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string;
}

export interface SkillValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

// ─── MCP Server Types ───────────────────────────────────────

export type McpToolName =
  | 'query_knowledge_base'
  | 'get_decision_matrix'
  | 'get_template'
  | 'scaffold_tool'
  | 'install_tool'
  | 'validate_config'
  | 'audit_workspace'
  | 'get_platform_guide';

export interface KnowledgeBaseResource {
  uri: string;
  name: string;
  description: string;
}

export interface DocumentationSection {
  topic: string;
  toolType: KiroToolType | null;
  content: string;
  source: string;
}

export interface PlatformGuide {
  platform: PlatformTarget;
  setupInstructions: string;
  capabilities: string[];
  workflows: string[];
  configTemplate: Record<string, unknown>;
}

export interface ScaffoldResult {
  files: Array<{ path: string; content: string }>;
  instructions: string;
}

export type InstallScope = 'workspace' | 'global' | 'custom';

export interface InstallTarget {
  scope: InstallScope;
  targetDir?: string;
}

export interface ScaffoldOptions {
  name: string;
  description: string;
  platform?: PlatformTarget;
  interactive?: boolean;
  installTarget?: InstallTarget;
}

export interface InstallResult {
  installedFiles: Array<{
    relativePath: string;
    absolutePath: string;
  }>;
  targetRoot: string;
  scope: InstallScope;
  errors: Array<{ path: string; message: string }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface PowerMcpJson {
  mcpServers: Record<
    string,
    { command: string; args: string[] } | { url: string; headers?: Record<string, string> }
  >;
}

// ─── Workflow Builder Types ─────────────────────────────────

export interface IntegrationRequirements {
  targetTech: string;
  automationGoals: string[];
  workflowGoals: string[];
  preferredPlatform: PlatformTarget;
}

export interface IntegrationPlan {
  recommendations: ToolRecommendation[];
  files: Array<{ path: string; purpose: string }>;
  compositePackage: boolean;
}

export interface OptimizationStep {
  finding: AuditFinding;
  action: string;
  preview: string;
  applied: boolean;
}

export interface BuildSummary {
  createdFiles: Array<{ path: string; purpose: string }>;
  modifiedFiles: Array<{ path: string; purpose: string }>;
  testingInstructions: string;
}
