import type {
  AgentConfig,
  HookConfig,
  McpServerConfig,
  PowerConfig,
  SkillFrontmatter,
  SteeringConfig,
  ValidationResult,
} from './types';

// ─── Valid Enum Values ─────────────────────────────────────

export const VALID_HOOK_TRIGGERS = [
  'fileSaved',
  'fileCreated',
  'fileDeleted',
  'promptSubmit',
  'agentStop',
  'preToolUse',
  'postToolUse',
  'userTriggered',
] as const;

export const VALID_HOOK_ACTIONS = ['askAgent', 'runCommand'] as const;

export const VALID_INCLUSION_MODES = ['always', 'fileMatch', 'manual'] as const;

// ─── Skill Name Rules ──────────────────────────────────────

const SKILL_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SKILL_NAME_CONSECUTIVE_HYPHENS = /--/;
const SKILL_NAME_MIN = 1;
const SKILL_NAME_MAX = 64;
const SKILL_DESC_MIN = 1;
const SKILL_DESC_MAX = 1024;
const SKILL_COMPAT_MAX = 500;

// ─── Helpers ───────────────────────────────────────────────

function pushError(
  errors: Array<{ field: string; message: string }>,
  field: string,
  message: string,
): void {
  errors.push({ field, message });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// ─── Hook Validation ───────────────────────────────────────

export function validateHook(config: HookConfig): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!isNonEmptyString(config.name)) {
    pushError(errors, 'name', 'name is required');
  }

  if (!isNonEmptyString(config.version)) {
    pushError(errors, 'version', 'version is required');
  }

  if (!config.when) {
    pushError(errors, 'when', 'when block is required');
  } else {
    const validTriggers: readonly string[] = VALID_HOOK_TRIGGERS;
    if (!validTriggers.includes(config.when.type)) {
      pushError(
        errors,
        'when.type',
        `Invalid trigger type "${config.when.type}". ` +
          `Must be one of: ${VALID_HOOK_TRIGGERS.join(', ')}`,
      );
    }
  }

  if (!config.then) {
    pushError(errors, 'then', 'then block is required');
  } else {
    const validActions: readonly string[] = VALID_HOOK_ACTIONS;
    if (!validActions.includes(config.then.type)) {
      pushError(
        errors,
        'then.type',
        `Invalid action type "${config.then.type}". ` +
          `Must be one of: ${VALID_HOOK_ACTIONS.join(', ')}`,
      );
    }

    if (config.then.type === 'askAgent' && !isNonEmptyString(config.then.prompt)) {
      pushError(errors, 'then.prompt', 'prompt is required for askAgent action');
    }

    if (config.then.type === 'runCommand' && !isNonEmptyString(config.then.command)) {
      pushError(errors, 'then.command', 'command is required for runCommand action');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Agent Validation ──────────────────────────────────────

export function validateAgent(config: AgentConfig): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!isNonEmptyString(config.name)) {
    pushError(errors, 'name', 'name is required');
  }

  if (!isNonEmptyString(config.description)) {
    pushError(errors, 'description', 'description is required');
  }

  if (config.mcpServers) {
    for (const [key, server] of Object.entries(config.mcpServers)) {
      const result = validateMcpServer(server);
      for (const err of result.errors) {
        pushError(errors, `mcpServers.${key}.${err.field}`, err.message);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Power Validation ──────────────────────────────────────

export function validatePower(config: PowerConfig): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!isNonEmptyString(config.name)) {
    pushError(errors, 'name', 'name is required');
  }

  if (!isNonEmptyString(config.displayName)) {
    pushError(errors, 'displayName', 'displayName is required');
  }

  if (!isNonEmptyString(config.description)) {
    pushError(errors, 'description', 'description is required');
  }

  if (!Array.isArray(config.keywords) || config.keywords.length === 0) {
    pushError(errors, 'keywords', 'keywords must be a non-empty array');
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Steering Validation ───────────────────────────────────

export function validateSteering(config: SteeringConfig): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const validModes: readonly string[] = VALID_INCLUSION_MODES;
  if (!validModes.includes(config.inclusion)) {
    pushError(
      errors,
      'inclusion',
      `Invalid inclusion mode "${config.inclusion}". ` +
        `Must be one of: ${VALID_INCLUSION_MODES.join(', ')}`,
    );
  }

  if (config.inclusion === 'fileMatch' && !isNonEmptyString(config.fileMatchPattern)) {
    pushError(errors, 'fileMatchPattern', 'fileMatchPattern is required for fileMatch mode');
  }

  if (!isNonEmptyString(config.content)) {
    pushError(errors, 'content', 'content is required');
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Skill Validation ──────────────────────────────────────

export function validateSkill(frontmatter: SkillFrontmatter): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Name validation
  if (!isNonEmptyString(frontmatter.name)) {
    pushError(errors, 'name', 'name is required');
  } else {
    const name = frontmatter.name;

    if (name.length < SKILL_NAME_MIN || name.length > SKILL_NAME_MAX) {
      pushError(errors, 'name', `name must be ${SKILL_NAME_MIN}-${SKILL_NAME_MAX} characters`);
    }

    if (!SKILL_NAME_PATTERN.test(name)) {
      pushError(
        errors,
        'name',
        'name must be lowercase alphanumeric with hyphens, ' + 'no leading/trailing hyphens',
      );
    }

    if (SKILL_NAME_CONSECUTIVE_HYPHENS.test(name)) {
      pushError(errors, 'name', 'name must not contain consecutive hyphens');
    }
  }

  // Description validation
  if (!isNonEmptyString(frontmatter.description)) {
    pushError(errors, 'description', 'description is required');
  } else if (
    frontmatter.description.length < SKILL_DESC_MIN ||
    frontmatter.description.length > SKILL_DESC_MAX
  ) {
    pushError(
      errors,
      'description',
      `description must be ${SKILL_DESC_MIN}-${SKILL_DESC_MAX} characters`,
    );
  }

  // Optional: compatibility length
  if (
    frontmatter.compatibility !== undefined &&
    frontmatter.compatibility.length > SKILL_COMPAT_MAX
  ) {
    pushError(
      errors,
      'compatibility',
      `compatibility must be at most ${SKILL_COMPAT_MAX} characters`,
    );
  }

  // Optional: metadata must be key-value map of strings
  if (frontmatter.metadata !== undefined) {
    if (
      typeof frontmatter.metadata !== 'object' ||
      frontmatter.metadata === null ||
      Array.isArray(frontmatter.metadata)
    ) {
      pushError(errors, 'metadata', 'metadata must be a key-value map');
    } else {
      for (const [k, v] of Object.entries(frontmatter.metadata)) {
        if (typeof v !== 'string') {
          pushError(errors, `metadata.${k}`, 'metadata values must be strings');
        }
      }
    }
  }

  // Optional: allowedTools must be space-delimited string
  if (frontmatter.allowedTools !== undefined && typeof frontmatter.allowedTools !== 'string') {
    pushError(errors, 'allowedTools', 'allowedTools must be a space-delimited string');
  }

  return { isValid: errors.length === 0, errors };
}

// ─── MCP Server Validation ─────────────────────────────────

export function validateMcpServer(config: McpServerConfig): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const isLocal = config.command !== undefined;
  const isRemote = config.url !== undefined;

  if (!isLocal && !isRemote) {
    pushError(errors, 'server', 'Must specify either command (local) or url (remote)');
  }

  if (isLocal && isRemote) {
    pushError(errors, 'server', 'Cannot specify both command and url');
  }

  if (isLocal && !isNonEmptyString(config.command)) {
    pushError(errors, 'command', 'command must be non-empty');
  }

  if (isRemote && !isNonEmptyString(config.url)) {
    pushError(errors, 'url', 'url must be non-empty');
  }

  return { isValid: errors.length === 0, errors };
}
