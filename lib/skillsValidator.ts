import { dump, load } from 'js-yaml';
import type { SkillFrontmatter, SkillValidationResult } from './types';

// ─── Constants ─────────────────────────────────────────────

const SKILL_NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SKILL_NAME_CONSECUTIVE_HYPHENS = /--/;
const SKILL_NAME_MIN = 1;
const SKILL_NAME_MAX = 64;
const SKILL_DESC_MIN = 1;
const SKILL_DESC_MAX = 1024;
const SKILL_COMPAT_MAX = 500;

// ─── Name Validation ───────────────────────────────────────

const VALID_DIRECTORIES = ['scripts', 'references', 'assets'] as const;

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

// ─── Name Validation ───────────────────────────────────────

/**
 * Validates skill name against Agent Skills spec rules:
 * - 1-64 characters
 * - Lowercase alphanumeric + hyphens only
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 * - Must match parent directory name
 */
export function validateName(name: string, parentDirName?: string): SkillValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!isNonEmptyString(name)) {
    pushError(errors, 'name', 'name is required and must be non-empty');
    return { isValid: false, errors };
  }

  if (name.length < SKILL_NAME_MIN || name.length > SKILL_NAME_MAX) {
    pushError(errors, 'name', `name must be ${SKILL_NAME_MIN}-${SKILL_NAME_MAX} characters`);
  }

  if (!SKILL_NAME_PATTERN.test(name)) {
    pushError(
      errors,
      'name',
      'name must be lowercase alphanumeric with hyphens, no leading/trailing hyphens',
    );
  }

  if (SKILL_NAME_CONSECUTIVE_HYPHENS.test(name)) {
    pushError(errors, 'name', 'name must not contain consecutive hyphens');
  }

  if (parentDirName !== undefined && name !== parentDirName) {
    pushError(errors, 'name', `name "${name}" must match parent directory name "${parentDirName}"`);
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Frontmatter Validation ────────────────────────────────

/**
 * Validates skill frontmatter against Agent Skills spec:
 * - Required: name, description
 * - Optional: license, compatibility (max 500 chars), metadata (key-value map), allowedTools (space-delimited)
 */
export function validateFrontmatter(
  frontmatter: SkillFrontmatter,
  parentDirName?: string,
): SkillValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Name validation
  if (!isNonEmptyString(frontmatter.name)) {
    pushError(errors, 'name', 'name is required');
  } else {
    const nameResult = validateName(frontmatter.name, parentDirName);
    errors.push(...nameResult.errors);
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

  // Optional: license (no specific constraints beyond being a string)
  if (frontmatter.license !== undefined && typeof frontmatter.license !== 'string') {
    pushError(errors, 'license', 'license must be a string');
  }

  // Optional: compatibility length
  if (frontmatter.compatibility !== undefined) {
    if (typeof frontmatter.compatibility !== 'string') {
      pushError(errors, 'compatibility', 'compatibility must be a string');
    } else if (frontmatter.compatibility.length > SKILL_COMPAT_MAX) {
      pushError(
        errors,
        'compatibility',
        `compatibility must be at most ${SKILL_COMPAT_MAX} characters`,
      );
    }
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
  if (frontmatter.allowedTools !== undefined) {
    if (typeof frontmatter.allowedTools !== 'string') {
      pushError(errors, 'allowedTools', 'allowedTools must be a space-delimited string');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Directory Validation ──────────────────────────────────

interface DirectoryStructure {
  hasSkillMd: boolean;
  directories: string[];
}

/**
 * Validates skill directory structure:
 * - SKILL.md must exist at root
 * - Optional: scripts/, references/, assets/ directories
 */
export function validateDirectory(
  structure: DirectoryStructure,
  skillName: string,
): SkillValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!structure.hasSkillMd) {
    pushError(errors, 'directory', `SKILL.md must exist at root of ${skillName}/ directory`);
  }

  // Check for invalid directories
  const invalidDirs = structure.directories.filter(
    (dir) => !VALID_DIRECTORIES.includes(dir as never),
  );

  if (invalidDirs.length > 0) {
    pushError(
      errors,
      'directory',
      `Invalid directories found: ${invalidDirs.join(', ')}. ` +
        `Only ${VALID_DIRECTORIES.join(', ')} are allowed`,
    );
  }

  return { isValid: errors.length === 0, errors };
}

// ─── Frontmatter Serialization ─────────────────────────────

/**
 * Serializes skill frontmatter to YAML format
 */
export function serializeFrontmatter(frontmatter: SkillFrontmatter): string {
  const yamlObj: Record<string, unknown> = {
    name: frontmatter.name,
    description: frontmatter.description,
  };

  if (frontmatter.license) {
    yamlObj.license = frontmatter.license;
  }

  if (frontmatter.compatibility) {
    yamlObj.compatibility = frontmatter.compatibility;
  }

  if (frontmatter.metadata) {
    yamlObj.metadata = frontmatter.metadata;
  }

  if (frontmatter.allowedTools) {
    yamlObj['allowed-tools'] = frontmatter.allowedTools;
  }

  return dump(yamlObj, {
    lineWidth: 80,
    noRefs: true,
    quotingType: '"',
  });
}

// ─── Frontmatter Parsing ───────────────────────────────────

const FRONTMATTER_DELIMITER = '---';

interface ParseFrontmatterResult {
  frontmatter: SkillFrontmatter | null;
  body: string;
  errors: Array<{ field: string; message: string }>;
}

/**
 * Extracts and parses YAML frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): ParseFrontmatterResult {
  const errors: Array<{ field: string; message: string }> = [];
  const lines = markdown.split('\n');

  // Check for frontmatter delimiters
  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    pushError(errors, 'frontmatter', 'Missing opening frontmatter delimiter (---)');
    return { frontmatter: null, body: markdown, errors };
  }

  // Find closing delimiter
  const closingIndex = lines.findIndex(
    (line, idx) => idx > 0 && line.trim() === FRONTMATTER_DELIMITER,
  );

  if (closingIndex === -1) {
    pushError(errors, 'frontmatter', 'Missing closing frontmatter delimiter (---)');
    return { frontmatter: null, body: markdown, errors };
  }

  // Extract frontmatter and body
  const frontmatterLines = lines.slice(1, closingIndex);
  const bodyLines = lines.slice(closingIndex + 1);
  const frontmatterYaml = frontmatterLines.join('\n');
  const body = bodyLines.join('\n').trim();

  // Parse YAML
  let parsed: unknown;
  try {
    parsed = load(frontmatterYaml);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown YAML parse error';
    pushError(errors, 'frontmatter', `Failed to parse YAML: ${message}`);
    return { frontmatter: null, body, errors };
  }

  // Validate parsed object
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    pushError(errors, 'frontmatter', 'Frontmatter must be a YAML object');
    return { frontmatter: null, body, errors };
  }

  const obj = parsed as Record<string, unknown>;

  // Map allowed-tools to allowedTools
  const frontmatter: SkillFrontmatter = {
    name: typeof obj.name === 'string' ? obj.name : '',
    description: typeof obj.description === 'string' ? obj.description : '',
    license: typeof obj.license === 'string' ? obj.license : undefined,
    compatibility: typeof obj.compatibility === 'string' ? obj.compatibility : undefined,
    metadata:
      typeof obj.metadata === 'object' && obj.metadata !== null
        ? (obj.metadata as Record<string, string>)
        : undefined,
    allowedTools: typeof obj['allowed-tools'] === 'string' ? obj['allowed-tools'] : undefined,
  };

  return { frontmatter, body, errors };
}
