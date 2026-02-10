import {
  VALID_HOOK_ACTIONS,
  VALID_HOOK_TRIGGERS,
  VALID_INCLUSION_MODES,
  validateAgent,
  validateHook,
  validateMcpServer,
  validatePower,
  validateSkill,
  validateSteering,
} from './configGeneratorValidators';
import type {
  AgentConfig,
  HookConfig,
  McpServerConfig,
  PowerConfig,
  PowerMcpJson,
  SkillFrontmatter,
  SteeringConfig,
  ValidationResult,
} from './types';

// ─── Hook Generator ────────────────────────────────────────

interface GenerateHookOptions {
  name: string;
  description?: string;
  triggerType: HookConfig['when']['type'];
  actionType: HookConfig['then']['type'];
  patterns?: string[];
  toolTypes?: string[];
  prompt?: string;
  command?: string;
}

export function generateHook(options: GenerateHookOptions): HookConfig {
  const config: HookConfig = {
    name: options.name,
    version: '1.0.0',
    description: options.description,
    when: {
      type: options.triggerType,
      ...(options.patterns && { patterns: options.patterns }),
      ...(options.toolTypes && { toolTypes: options.toolTypes }),
    },
    then: {
      type: options.actionType,
      ...(options.prompt && { prompt: options.prompt }),
      ...(options.command && { command: options.command }),
    },
  };

  return config;
}

// ─── Agent Generator ───────────────────────────────────────

interface GenerateAgentOptions {
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

export function generateAgent(options: GenerateAgentOptions): AgentConfig {
  const config: AgentConfig = {
    name: options.name,
    description: options.description,
    ...(options.prompt && { prompt: options.prompt }),
    ...(options.model && { model: options.model }),
    ...(options.tools && { tools: options.tools }),
    ...(options.allowedTools && {
      allowedTools: options.allowedTools,
    }),
    ...(options.toolAliases && {
      toolAliases: options.toolAliases,
    }),
    ...(options.toolsSettings && {
      toolsSettings: options.toolsSettings,
    }),
    ...(options.mcpServers && {
      mcpServers: options.mcpServers,
    }),
    ...(options.resources && { resources: options.resources }),
    ...(options.hooks && { hooks: options.hooks }),
    ...(options.includeMcpJson !== undefined && {
      includeMcpJson: options.includeMcpJson,
    }),
    ...(options.keyboardShortcut && {
      keyboardShortcut: options.keyboardShortcut,
    }),
    ...(options.welcomeMessage && {
      welcomeMessage: options.welcomeMessage,
    }),
  };

  return config;
}

// ─── Power Generator ───────────────────────────────────────

interface GeneratePowerOptions {
  name: string;
  displayName: string;
  description: string;
  keywords: string[];
  bodyContent?: string;
  mcpServers?: Record<
    string,
    { command: string; args: string[] } | { url: string; headers?: Record<string, string> }
  >;
  steeringFiles?: Array<{
    filename: string;
    inclusion: SteeringConfig['inclusion'];
    content: string;
    fileMatchPattern?: string;
  }>;
}

interface GeneratePowerResult {
  powerMd: string;
  mcpJson: PowerMcpJson | null;
  steeringFiles: Array<{ filename: string; content: string }>;
}

export function generatePower(options: GeneratePowerOptions): GeneratePowerResult {
  const frontmatter = [
    '---',
    `name: ${options.name}`,
    `displayName: ${options.displayName}`,
    `description: ${options.description}`,
    `keywords: ${options.keywords.join(', ')}`,
    '---',
  ].join('\n');

  const body = options.bodyContent
    ? options.bodyContent
    : [`# ${options.displayName}`, '', options.description].join('\n');

  const powerMd = `${frontmatter}\n\n${body}\n`;

  const mcpJson: PowerMcpJson | null = options.mcpServers
    ? { mcpServers: options.mcpServers }
    : null;

  const steeringFiles = (options.steeringFiles ?? []).map((sf) => ({
    filename: sf.filename,
    content: generateSteering({
      inclusion: sf.inclusion,
      fileMatchPattern: sf.fileMatchPattern,
      content: sf.content,
    }),
  }));

  return { powerMd, mcpJson, steeringFiles };
}

// ─── Steering Generator ────────────────────────────────────

export function generateSteering(config: SteeringConfig): string {
  const frontmatterLines = ['---', `inclusion: ${config.inclusion}`];

  if (config.inclusion === 'fileMatch' && config.fileMatchPattern) {
    frontmatterLines.push(`fileMatchPattern: "${config.fileMatchPattern}"`);
  }

  frontmatterLines.push('---');

  return `${frontmatterLines.join('\n')}\n\n${config.content}\n`;
}

// ─── Skill Generator ───────────────────────────────────────

interface GenerateSkillOptions {
  frontmatter: SkillFrontmatter;
  bodyContent: string;
  includeScripts?: boolean;
  includeReferences?: boolean;
  includeAssets?: boolean;
}

interface GenerateSkillResult {
  skillMd: string;
  directories: string[];
}

export function generateSkill(options: GenerateSkillOptions): GenerateSkillResult {
  const fm = options.frontmatter;
  const fmLines = ['---', `name: ${fm.name}`];

  fmLines.push('description: >-');
  fmLines.push(`  ${fm.description}`);

  if (fm.license) {
    fmLines.push(`license: ${fm.license}`);
  }

  if (fm.compatibility) {
    fmLines.push(`compatibility: ${fm.compatibility}`);
  }

  if (fm.metadata) {
    fmLines.push('metadata:');
    for (const [k, v] of Object.entries(fm.metadata)) {
      fmLines.push(`  ${k}: ${v}`);
    }
  }

  if (fm.allowedTools) {
    fmLines.push(`allowed-tools: ${fm.allowedTools}`);
  }

  fmLines.push('---');

  const skillMd = `${fmLines.join('\n')}\n\n${options.bodyContent}\n`;

  const directories: string[] = [fm.name];

  if (options.includeScripts) {
    directories.push(`${fm.name}/scripts`);
  }

  if (options.includeReferences) {
    directories.push(`${fm.name}/references`);
  }

  if (options.includeAssets) {
    directories.push(`${fm.name}/assets`);
  }

  return { skillMd, directories };
}

// ─── MCP Config Generator ──────────────────────────────────

interface McpConfigEntry {
  name: string;
  type: 'local' | 'remote';
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  disabled?: boolean;
  autoApprove?: string[];
}

export function generateMcpConfig(servers: McpConfigEntry[]): PowerMcpJson {
  const mcpServers: PowerMcpJson['mcpServers'] = {};

  for (const server of servers) {
    if (server.type === 'local') {
      mcpServers[server.name] = {
        command: server.command ?? 'node',
        args: server.args ?? [],
      };
    } else {
      const remote: {
        url: string;
        headers?: Record<string, string>;
      } = {
        url: server.url ?? '',
      };

      if (server.headers) {
        remote.headers = server.headers;
      }

      mcpServers[server.name] = remote;
    }
  }

  return { mcpServers };
}

// ─── Unified Validate ──────────────────────────────────────

type ValidatableConfig =
  | { toolType: 'hook'; config: HookConfig }
  | { toolType: 'custom-agent'; config: AgentConfig }
  | { toolType: 'power'; config: PowerConfig }
  | { toolType: 'steering-doc'; config: SteeringConfig }
  | { toolType: 'skill'; config: SkillFrontmatter }
  | { toolType: 'mcp-server'; config: McpServerConfig };

const VALIDATOR_MAP: Record<string, (config: never) => ValidationResult> = {
  hook: validateHook as (config: never) => ValidationResult,
  'custom-agent': validateAgent as (config: never) => ValidationResult,
  power: validatePower as (config: never) => ValidationResult,
  'steering-doc': validateSteering as (config: never) => ValidationResult,
  skill: validateSkill as (config: never) => ValidationResult,
  'mcp-server': validateMcpServer as (config: never) => ValidationResult,
};

export function validate(input: ValidatableConfig): ValidationResult {
  const validator = VALIDATOR_MAP[input.toolType];

  if (!validator) {
    return {
      isValid: false,
      errors: [
        {
          field: 'toolType',
          message: `No validator for tool type "${input.toolType}"`,
        },
      ],
    };
  }

  return validator(input.config as never);
}

// ─── Re-exports for convenience ────────────────────────────

export {
  validateHook,
  validateAgent,
  validatePower,
  validateSteering,
  validateSkill,
  validateMcpServer,
  VALID_HOOK_TRIGGERS,
  VALID_HOOK_ACTIONS,
  VALID_INCLUSION_MODES,
};

export type {
  GenerateHookOptions,
  GenerateAgentOptions,
  GeneratePowerOptions,
  GeneratePowerResult,
  GenerateSkillOptions,
  GenerateSkillResult,
  McpConfigEntry,
  ValidatableConfig,
};
