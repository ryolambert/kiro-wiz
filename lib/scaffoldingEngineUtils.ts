import { validate } from './configGenerator.js';
import type { KiroToolType, ValidationResult } from './types.js';

// ─── Constants ─────────────────────────────────────────────

export const MCP_DOC_SERVER_NAME = 'kiro-wiz';
export const MCP_DOC_SERVER_COMMAND = 'npx';
export const MCP_DOC_SERVER_ARGS = ['tsx', 'bin/mcp-server.ts'];

export const POWER_MD_LINE_WARN_THRESHOLD = 500;
export const SKILL_DESC_MIN_CHARS = 250;
export const SKILL_DESC_MAX_CHARS = 350;
export const SKILL_METADATA_TOKEN_TARGET = 100;
export const SKILL_INSTRUCTION_TOKEN_LIMIT = 5000;

// ─── Helpers ───────────────────────────────────────────────

export function toKebabCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

export function countLines(text: string): number {
  return text.split('\n').length;
}

export interface TokenWarning {
  field: string;
  message: string;
}

export function checkTokenEfficiency(powerMd: string): TokenWarning[] {
  const warnings: TokenWarning[] = [];
  const lines = countLines(powerMd);
  if (lines > POWER_MD_LINE_WARN_THRESHOLD) {
    warnings.push({
      field: 'POWER.md',
      message: `POWER.md is ${lines} lines, exceeding the recommended ~${POWER_MD_LINE_WARN_THRESHOLD} line threshold`,
    });
  }
  return warnings;
}

export function validateScaffoldOutput(toolType: KiroToolType, config: unknown): ValidationResult {
  const validatable = mapToValidatable(toolType, config);
  if (!validatable) {
    return { isValid: true, errors: [] };
  }
  return validate(validatable);
}

function mapToValidatable(
  toolType: KiroToolType,
  config: unknown,
): Parameters<typeof validate>[0] | null {
  switch (toolType) {
    case 'hook':
      return {
        toolType: 'hook',
        config: config as never,
      };
    case 'custom-agent':
      return {
        toolType: 'custom-agent',
        config: config as never,
      };
    case 'power':
      return {
        toolType: 'power',
        config: config as never,
      };
    case 'steering-doc':
      return {
        toolType: 'steering-doc',
        config: config as never,
      };
    case 'skill':
      return {
        toolType: 'skill',
        config: config as never,
      };
    case 'mcp-server':
      return {
        toolType: 'mcp-server',
        config: config as never,
      };
    default:
      return null;
  }
}

export function mcpDocServerConfig(): {
  command: string;
  args: string[];
} {
  return {
    command: MCP_DOC_SERVER_COMMAND,
    args: [...MCP_DOC_SERVER_ARGS],
  };
}
