import type {
  AuditFinding,
  HookConfig,
  SteeringConfig,
  SkillFrontmatter,
  PowerConfig,
  McpServerConfig,
} from './types';
import {
  validateHook,
  validateSteering,
  validateSkill,
  validatePower,
  validateMcpServer,
  VALID_INCLUSION_MODES,
} from './configGeneratorValidators';
import * as yaml from 'js-yaml';

// ─── Frontmatter Parsing ───────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

export function parseFrontmatter(
  content: string
): Record<string, unknown> | null {
  const match = FRONTMATTER_RE.exec(content);
  if (!match) return null;
  try {
    const parsed = yaml.load(match[1]);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Secret Detection ──────────────────────────────────────

const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}/i,
  /(?:secret|token|password|passwd)\s*[:=]\s*["']?[A-Za-z0-9_\-]{8,}/i,
  /sk-[A-Za-z0-9]{20,}/,
  /ghp_[A-Za-z0-9]{36}/,
  /xox[bpas]-[A-Za-z0-9\-]{10,}/,
  /AKIA[0-9A-Z]{16}/,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
];

export function detectHardcodedSecrets(
  content: string
): string[] {
  const found: string[] = [];
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      found.push(pattern.source);
    }
  }
  return found;
}

// ─── Steering Check ────────────────────────────────────────

export function checkSteering(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const fm = parseFrontmatter(content);

  if (!fm) {
    findings.push({
      severity: 'critical',
      category: 'steering',
      message: 'Missing or invalid YAML frontmatter',
      file: filePath,
      suggestion:
        'Add valid YAML frontmatter with an inclusion mode ' +
        '(always, fileMatch, or manual)',
      kbRef: 'steering/best-practices',
    });
    return findings;
  }

  const inclusion = fm['inclusion'] as string | undefined;
  if (
    !inclusion ||
    !(VALID_INCLUSION_MODES as readonly string[]).includes(
      inclusion
    )
  ) {
    findings.push({
      severity: 'critical',
      category: 'steering',
      message: `Invalid or missing inclusion mode: "${inclusion ?? 'undefined'}"`,
      file: filePath,
      suggestion:
        `Set inclusion to one of: ${VALID_INCLUSION_MODES.join(', ')}`,
      kbRef: 'steering/best-practices',
    });
  }

  if (inclusion === 'fileMatch' && !fm['fileMatchPattern']) {
    findings.push({
      severity: 'recommended',
      category: 'steering',
      message:
        'fileMatch inclusion mode without fileMatchPattern',
      file: filePath,
      suggestion: 'Add a fileMatchPattern to specify which files trigger this steering doc',
      kbRef: 'steering/best-practices',
    });
  }

  const steeringConfig: SteeringConfig = {
    inclusion: (inclusion as SteeringConfig['inclusion']) ?? 'always',
    fileMatchPattern: fm['fileMatchPattern'] as string | undefined,
    content: content.replace(FRONTMATTER_RE, '').trim(),
  };

  const result = validateSteering(steeringConfig);
  for (const err of result.errors) {
    if (
      err.field === 'inclusion' ||
      (err.field === 'fileMatchPattern' && inclusion === 'fileMatch')
    ) {
      continue; // Already reported above
    }
    findings.push({
      severity: 'recommended',
      category: 'steering',
      message: `${err.field}: ${err.message}`,
      file: filePath,
      suggestion: `Fix the ${err.field} field`,
      kbRef: 'steering/best-practices',
    });
  }

  return findings;
}

// ─── Hook Check ────────────────────────────────────────────

export function checkHook(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    findings.push({
      severity: 'critical',
      category: 'hooks',
      message: 'Invalid JSON in hook file',
      file: filePath,
      suggestion: 'Fix the JSON syntax in the hook file',
      kbRef: 'hooks/best-practices',
    });
    return findings;
  }

  const hookConfig = parsed as HookConfig;

  if (!hookConfig.when) {
    findings.push({
      severity: 'critical',
      category: 'hooks',
      message: 'Missing "when" block in hook',
      file: filePath,
      suggestion:
        'Add a "when" block with a valid trigger type',
      kbRef: 'hooks/best-practices',
    });
  }

  if (!hookConfig.then) {
    findings.push({
      severity: 'critical',
      category: 'hooks',
      message: 'Missing "then" block in hook',
      file: filePath,
      suggestion:
        'Add a "then" block with a valid action type',
      kbRef: 'hooks/best-practices',
    });
  }

  const result = validateHook(hookConfig);
  for (const err of result.errors) {
    const severity =
      err.field === 'when.type' || err.field === 'then.type'
        ? 'critical'
        : 'recommended';
    findings.push({
      severity,
      category: 'hooks',
      message: `${err.field}: ${err.message}`,
      file: filePath,
      suggestion: `Fix the ${err.field} field`,
      kbRef: 'hooks/best-practices',
    });
  }

  return findings;
}

// ─── Skill Check ───────────────────────────────────────────

export function checkSkill(
  filePath: string,
  content: string,
  directoryName: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const fm = parseFrontmatter(content);

  if (!fm) {
    findings.push({
      severity: 'critical',
      category: 'skills',
      message: 'Missing or invalid YAML frontmatter in SKILL.md',
      file: filePath,
      suggestion:
        'Add valid YAML frontmatter with name and description fields',
      kbRef: 'skills/best-practices',
    });
    return findings;
  }

  const skillFm: SkillFrontmatter = {
    name: (fm['name'] as string) ?? '',
    description: (fm['description'] as string) ?? '',
    license: fm['license'] as string | undefined,
    compatibility: fm['compatibility'] as string | undefined,
    metadata: fm['metadata'] as
      | Record<string, string>
      | undefined,
    allowedTools: (fm['allowed-tools'] ??
      fm['allowedTools']) as string | undefined,
  };

  const result = validateSkill(skillFm);
  for (const err of result.errors) {
    findings.push({
      severity: err.field === 'name' || err.field === 'description'
        ? 'critical'
        : 'recommended',
      category: 'skills',
      message: `${err.field}: ${err.message}`,
      file: filePath,
      suggestion: `Fix the ${err.field} field in SKILL.md frontmatter`,
      kbRef: 'skills/best-practices',
    });
  }

  if (
    skillFm.name &&
    skillFm.name !== directoryName
  ) {
    findings.push({
      severity: 'recommended',
      category: 'skills',
      message:
        `Skill name "${skillFm.name}" does not match ` +
        `directory name "${directoryName}"`,
      file: filePath,
      suggestion:
        'Rename the directory or update the skill name to match',
      kbRef: 'skills/best-practices',
    });
  }

  return findings;
}

// ─── Power Check ───────────────────────────────────────────

export function checkPower(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const fm = parseFrontmatter(content);

  if (!fm) {
    findings.push({
      severity: 'critical',
      category: 'powers',
      message: 'Missing or invalid YAML frontmatter in POWER.md',
      file: filePath,
      suggestion:
        'Add valid YAML frontmatter with name, displayName, description, and keywords',
      kbRef: 'powers/best-practices',
    });
    return findings;
  }

  const powerConfig: PowerConfig = {
    name: (fm['name'] as string) ?? '',
    displayName: (fm['displayName'] as string) ?? '',
    description: (fm['description'] as string) ?? '',
    keywords: Array.isArray(fm['keywords'])
      ? (fm['keywords'] as string[])
      : typeof fm['keywords'] === 'string'
        ? (fm['keywords'] as string)
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean)
        : [],
  };

  const result = validatePower(powerConfig);
  for (const err of result.errors) {
    findings.push({
      severity: 'critical',
      category: 'powers',
      message: `${err.field}: ${err.message}`,
      file: filePath,
      suggestion: `Fix the ${err.field} field in POWER.md frontmatter`,
      kbRef: 'powers/best-practices',
    });
  }

  return findings;
}

// ─── MCP Config Check ──────────────────────────────────────

export function checkMcpConfig(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    findings.push({
      severity: 'critical',
      category: 'mcp',
      message: 'Invalid JSON in MCP config file',
      file: filePath,
      suggestion: 'Fix the JSON syntax in the MCP config',
      kbRef: 'mcp/best-practices',
    });
    return findings;
  }

  const secrets = detectHardcodedSecrets(content);
  if (secrets.length > 0) {
    findings.push({
      severity: 'critical',
      category: 'mcp',
      message:
        'Possible hardcoded secrets detected in MCP config',
      file: filePath,
      suggestion:
        'Use environment variables instead of hardcoded secrets',
      kbRef: 'mcp/best-practices',
    });
  }

  const config = parsed as Record<string, unknown>;
  const servers =
    (config['mcpServers'] as
      | Record<string, McpServerConfig>
      | undefined) ?? {};

  for (const [name, server] of Object.entries(servers)) {
    const result = validateMcpServer(
      server as McpServerConfig
    );
    for (const err of result.errors) {
      findings.push({
        severity: 'critical',
        category: 'mcp',
        message: `Server "${name}": ${err.field}: ${err.message}`,
        file: filePath,
        suggestion: `Fix the ${err.field} for server "${name}"`,
        kbRef: 'mcp/best-practices',
      });
    }
  }

  return findings;
}

// ─── Settings Check ────────────────────────────────────────

export function checkSettings(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  try {
    JSON.parse(content);
  } catch {
    findings.push({
      severity: 'critical',
      category: 'settings',
      message: 'Invalid JSON in settings file',
      file: filePath,
      suggestion: 'Fix the JSON syntax in the settings file',
      kbRef: null,
    });
  }

  return findings;
}
