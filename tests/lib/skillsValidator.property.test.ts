import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateName,
  validateDirectory,
  serializeFrontmatter,
  parseFrontmatter,
} from '../../lib/skillsValidator.js';

// ─── Arbitraries ───────────────────────────────────────────

/**
 * Generates valid skill names per Agent Skills spec:
 * - 1-64 characters
 * - Lowercase alphanumeric + hyphens only
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 */
const arbAlphaNum = fc.constantFrom(
  ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
);

const arbValidSkillName: fc.Arbitrary<string> = fc
  .tuple(
    fc.string({
      unit: arbAlphaNum,
      minLength: 1,
      maxLength: 10,
    }),
    fc.array(
      fc.tuple(
        fc.constant('-'),
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 8,
        })
      ),
      { minLength: 0, maxLength: 5 }
    )
  )
  .map(([prefix, segments]) => {
    const parts = segments.map(([h, s]) => `${h}${s}`);
    return `${prefix}${parts.join('')}`;
  })
  .filter((n) => n.length >= 1 && n.length <= 64);

/**
 * Generates invalid skill names that violate one or more rules:
 * - Empty strings
 * - Too long (>64 chars)
 * - Contains uppercase
 * - Contains special characters
 * - Leading/trailing hyphens
 * - Consecutive hyphens
 */
const arbInvalidSkillName: fc.Arbitrary<string> = fc.oneof(
  // Empty string
  fc.constant(''),
  // Too long
  fc
    .string({
      unit: arbAlphaNum,
      minLength: 65,
      maxLength: 100,
    })
    .map((s) => s.toLowerCase()),
  // Contains uppercase
  fc
    .string({
      unit: fc.constantFrom(
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-'.split(
          ''
        )
      ),
      minLength: 1,
      maxLength: 20,
    })
    .filter((s) => /[A-Z]/.test(s)),
  // Contains special characters (underscore, space, etc)
  fc
    .string({
      unit: fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyz0123456789_!@#$%^&*()+=[]{}|;:,.<>?/'.split(
          ''
        )
      ),
      minLength: 1,
      maxLength: 20,
    })
    .filter((s) => /[^a-z0-9-]/.test(s)),
  // Leading hyphen
  fc
    .string({
      unit: arbAlphaNum,
      minLength: 1,
      maxLength: 20,
    })
    .map((s) => `-${s}`),
  // Trailing hyphen
  fc
    .string({
      unit: arbAlphaNum,
      minLength: 1,
      maxLength: 20,
    })
    .map((s) => `${s}-`),
  // Consecutive hyphens
  fc
    .tuple(
      fc.string({
        unit: arbAlphaNum,
        minLength: 1,
        maxLength: 10,
      }),
      fc.string({
        unit: arbAlphaNum,
        minLength: 1,
        maxLength: 10,
      })
    )
    .map(([a, b]) => `${a}--${b}`)
);

// ─── Property 32 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 32: Agent Skills spec name validation**
 * **Validates: Requirements 5.3**
 *
 * For any skill name, the validateName function SHALL correctly enforce all
 * Agent Skills spec name rules:
 * - 1-64 characters
 * - Lowercase alphanumeric + hyphens only
 * - No leading/trailing hyphens
 * - No consecutive hyphens
 * - Optional parent directory name matching
 */
describe('Property 32: Agent Skills spec name validation', () => {
  it('accepts all valid skill names (1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens)', () => {
    fc.assert(
      fc.property(arbValidSkillName, (name) => {
        const result = validateName(name);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects all invalid skill names (empty, too long, uppercase, special chars, leading/trailing/consecutive hyphens)', () => {
    fc.assert(
      fc.property(arbInvalidSkillName, (name) => {
        const result = validateName(name);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('validates name matches parent directory when provided', () => {
    fc.assert(
      fc.property(arbValidSkillName, (name) => {
        // When parent directory matches, validation passes
        const resultMatch = validateName(name, name);
        expect(resultMatch.isValid).toBe(true);
        expect(resultMatch.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects name when parent directory does not match', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        arbValidSkillName,
        (name, parentDir) => {
          // Skip when they happen to be equal
          fc.pre(name !== parentDir);

          const result = validateName(name, parentDir);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('must match parent directory')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('enforces length constraint: 1-64 characters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0 }),
        fc.integer({ min: 65, max: 100 }),
        (_zeroLen, tooLong) => {
          // Empty string
          const emptyResult = validateName('');
          expect(emptyResult.isValid).toBe(false);
          expect(
            emptyResult.errors.some(
              (e) =>
                e.message.includes('required') ||
                e.message.includes('1-64')
            )
          ).toBe(true);

          // Too long
          const longName = 'a'.repeat(tooLong);
          const longResult = validateName(longName);
          expect(longResult.isValid).toBe(false);
          expect(
            longResult.errors.some((e) =>
              e.message.includes('1-64')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('enforces format: lowercase alphanumeric + hyphens only', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(
            ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!@#'.split(
              ''
            )
          ),
          minLength: 1,
          maxLength: 20,
        }),
        (name) => {
          // Skip valid names
          fc.pre(
            /[A-Z_!@#]/.test(name) && name.length <= 64
          );

          const result = validateName(name);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('lowercase')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('enforces no leading hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 20,
        }),
        (suffix) => {
          const name = `-${suffix}`;
          const result = validateName(name);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('leading/trailing')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('enforces no trailing hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 20,
        }),
        (prefix) => {
          const name = `${prefix}-`;
          const result = validateName(name);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('leading/trailing')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('enforces no consecutive hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 10,
        }),
        fc.string({
          unit: arbAlphaNum,
          minLength: 1,
          maxLength: 10,
        }),
        (prefix, suffix) => {
          const name = `${prefix}--${suffix}`;
          const result = validateName(name);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('consecutive')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validates single character names', () => {
    fc.assert(
      fc.property(arbAlphaNum, (char) => {
        const result = validateName(char);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('validates names at maximum length (64 chars)', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: arbAlphaNum,
          minLength: 64,
          maxLength: 64,
        }),
        (name) => {
          const result = validateName(name);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validates names with numbers', () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(
            ...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
          ),
          minLength: 1,
          maxLength: 20,
        }),
        (name) => {
          // Ensure it has at least one number and is valid format
          fc.pre(
            /\d/.test(name) &&
              /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name) &&
              !/--/.test(name)
          );

          const result = validateName(name);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 33 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 33: Agent Skills spec directory validation**
 * **Validates: Requirements 5.4**
 *
 * For any skill directory structure, the validateDirectory function SHALL correctly
 * enforce Agent Skills spec directory rules:
 * - SKILL.md must exist at root
 * - Only scripts/, references/, and assets/ directories are allowed
 */
describe('Property 33: Agent Skills spec directory validation', () => {
  // Arbitrary for valid directory names
  const arbValidDirectory = fc.constantFrom('scripts', 'references', 'assets');

  // Arbitrary for invalid directory names
  const arbInvalidDirectory = fc.oneof(
    fc.constant('src'),
    fc.constant('lib'),
    fc.constant('test'),
    fc.constant('docs'),
    fc.constant('config'),
    fc.constant('build'),
    fc.constant('dist'),
    fc.constant('node_modules'),
    fc.constant('.git'),
    fc.string({ minLength: 1, maxLength: 20 }).filter(
      (s) => !['scripts', 'references', 'assets'].includes(s)
    )
  );

  // Arbitrary for directory structure with valid directories
  const arbValidDirectoryStructure = fc.record({
    hasSkillMd: fc.constant(true),
    directories: fc.array(arbValidDirectory, { minLength: 0, maxLength: 3 }),
  });

  it('accepts directory structure with SKILL.md and no directories', () => {
    fc.assert(
      fc.property(arbValidSkillName, (skillName) => {
        const structure = {
          hasSkillMd: true,
          directories: [],
        };

        const result = validateDirectory(structure, skillName);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('accepts directory structure with SKILL.md and valid directories', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        arbValidDirectoryStructure,
        (skillName, structure) => {
          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects directory structure missing SKILL.md', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.array(arbValidDirectory, { minLength: 0, maxLength: 3 }),
        (skillName, directories) => {
          const structure = {
            hasSkillMd: false,
            directories,
          };

          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('SKILL.md must exist')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects directory structure with invalid directories', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.array(arbInvalidDirectory, { minLength: 1, maxLength: 5 }),
        (skillName, invalidDirs) => {
          const structure = {
            hasSkillMd: true,
            directories: invalidDirs,
          };

          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('Invalid directories found')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects directory structure with mixed valid and invalid directories', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.array(arbValidDirectory, { minLength: 0, maxLength: 2 }),
        fc.array(arbInvalidDirectory, { minLength: 1, maxLength: 3 }),
        (skillName, validDirs, invalidDirs) => {
          const structure = {
            hasSkillMd: true,
            directories: [...validDirs, ...invalidDirs],
          };

          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('Invalid directories found')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts all three valid directories together', () => {
    fc.assert(
      fc.property(arbValidSkillName, (skillName) => {
        const structure = {
          hasSkillMd: true,
          directories: ['scripts', 'references', 'assets'],
        };

        const result = validateDirectory(structure, skillName);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  it('accepts any subset of valid directories', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.subarray(['scripts', 'references', 'assets']),
        (skillName, directories) => {
          const structure = {
            hasSkillMd: true,
            directories,
          };

          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects when both SKILL.md is missing and invalid directories exist', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.array(arbInvalidDirectory, { minLength: 1, maxLength: 3 }),
        (skillName, invalidDirs) => {
          const structure = {
            hasSkillMd: false,
            directories: invalidDirs,
          };

          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(false);
          // Should have errors for both missing SKILL.md and invalid directories
          expect(result.errors.length).toBeGreaterThanOrEqual(2);
          expect(
            result.errors.some((e) =>
              e.message.includes('SKILL.md must exist')
            )
          ).toBe(true);
          expect(
            result.errors.some((e) =>
              e.message.includes('Invalid directories found')
            )
          ).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validates directory names are case-sensitive', () => {
    fc.assert(
      fc.property(arbValidSkillName, (skillName) => {
        // Test uppercase variants
        const invalidStructures = [
          { hasSkillMd: true, directories: ['Scripts'] },
          { hasSkillMd: true, directories: ['REFERENCES'] },
          { hasSkillMd: true, directories: ['Assets'] },
        ];

        for (const structure of invalidStructures) {
          const result = validateDirectory(structure, skillName);

          expect(result.isValid).toBe(false);
          expect(
            result.errors.some((e) =>
              e.message.includes('Invalid directories found')
            )
          ).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('handles duplicate directory names', () => {
    fc.assert(
      fc.property(arbValidSkillName, (skillName) => {
        const structure = {
          hasSkillMd: true,
          directories: ['scripts', 'scripts', 'references'],
        };

        const result = validateDirectory(structure, skillName);

        // Duplicates of valid directories should still be valid
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 34 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 34: Agent Skills spec frontmatter round-trip**
 * **Validates: Requirements 5.3, 5.4**
 *
 * For any valid skill frontmatter, serializing it to YAML and then parsing it back
 * SHALL produce the same frontmatter structure with all fields preserved.
 */
describe('Property 34: Agent Skills spec frontmatter round-trip', () => {

  // Arbitrary for valid metadata (key-value map of strings)
  const arbMetadata = fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_-]+$/.test(s)),
    fc.string({ minLength: 1, maxLength: 100 }),
    { minKeys: 0, maxKeys: 5 }
  );

  // Arbitrary for valid allowedTools (space-delimited string)
  const arbAllowedTools = fc
    .array(
      fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !/\s/.test(s)),
      { minLength: 1, maxLength: 10 }
    )
    .map((tools) => tools.join(' '));

  // Arbitrary for minimal valid frontmatter (name + description only)
  const arbMinimalFrontmatter = fc.record({
    name: arbValidSkillName,
    description: fc.string({ minLength: 1, maxLength: 1024 }),
  });

  // Arbitrary for full valid frontmatter (all fields populated)
  const arbFullFrontmatter = fc.record({
    name: arbValidSkillName,
    description: fc.string({ minLength: 1, maxLength: 1024 }),
    license: fc.string({ minLength: 1, maxLength: 100 }),
    compatibility: fc.string({ minLength: 1, maxLength: 500 }),
    metadata: arbMetadata,
    allowedTools: arbAllowedTools,
  });

  // Arbitrary for frontmatter with optional fields randomly populated
  const arbPartialFrontmatter = fc.record({
    name: arbValidSkillName,
    description: fc.string({ minLength: 1, maxLength: 1024 }),
    license: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
    compatibility: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
    metadata: fc.option(arbMetadata, { nil: undefined }),
    allowedTools: fc.option(arbAllowedTools, { nil: undefined }),
  });

  it('preserves minimal frontmatter (name + description only) through round-trip', () => {
    fc.assert(
      fc.property(arbMinimalFrontmatter, (original) => {
        // Serialize to YAML
        const yaml = serializeFrontmatter(original);

        // Wrap in frontmatter delimiters and parse back
        const markdown = `---\n${yaml}---\n\n# Content`;
        const { frontmatter, errors } = parseFrontmatter(markdown);

        // Should parse without errors
        expect(errors).toHaveLength(0);
        expect(frontmatter).not.toBeNull();

        // All fields should match
        expect(frontmatter!.name).toBe(original.name);
        expect(frontmatter!.description).toBe(original.description);
        expect(frontmatter!.license).toBeUndefined();
        expect(frontmatter!.compatibility).toBeUndefined();
        expect(frontmatter!.metadata).toBeUndefined();
        expect(frontmatter!.allowedTools).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('preserves full frontmatter (all fields populated) through round-trip', () => {
    fc.assert(
      fc.property(arbFullFrontmatter, (original) => {
        // Serialize to YAML
        const yaml = serializeFrontmatter(original);

        // Wrap in frontmatter delimiters and parse back
        const markdown = `---\n${yaml}---\n\n# Content`;
        const { frontmatter, errors } = parseFrontmatter(markdown);

        // Should parse without errors
        expect(errors).toHaveLength(0);
        expect(frontmatter).not.toBeNull();

        // All fields should match
        expect(frontmatter!.name).toBe(original.name);
        expect(frontmatter!.description).toBe(original.description);
        expect(frontmatter!.license).toBe(original.license);
        expect(frontmatter!.compatibility).toBe(original.compatibility);
        expect(frontmatter!.metadata).toEqual(original.metadata);
        expect(frontmatter!.allowedTools).toBe(original.allowedTools);
      }),
      { numRuns: 100 }
    );
  });

  it('preserves partial frontmatter (optional fields randomly populated) through round-trip', () => {
    fc.assert(
      fc.property(arbPartialFrontmatter, (original) => {
        // Serialize to YAML
        const yaml = serializeFrontmatter(original);

        // Wrap in frontmatter delimiters and parse back
        const markdown = `---\n${yaml}---\n\n# Content`;
        const { frontmatter, errors } = parseFrontmatter(markdown);

        // Should parse without errors
        expect(errors).toHaveLength(0);
        expect(frontmatter).not.toBeNull();

        // All fields should match
        expect(frontmatter!.name).toBe(original.name);
        expect(frontmatter!.description).toBe(original.description);
        expect(frontmatter!.license).toBe(original.license);
        expect(frontmatter!.compatibility).toBe(original.compatibility);
        expect(frontmatter!.metadata).toEqual(original.metadata);
        expect(frontmatter!.allowedTools).toBe(original.allowedTools);
      }),
      { numRuns: 100 }
    );
  });

  it('handles empty metadata object through round-trip', () => {
    fc.assert(
      fc.property(arbValidSkillName, fc.string({ minLength: 1, maxLength: 100 }), (name, desc) => {
        const original = {
          name,
          description: desc,
          metadata: {},
        };

        // Serialize to YAML
        const yaml = serializeFrontmatter(original);

        // Wrap in frontmatter delimiters and parse back
        const markdown = `---\n${yaml}---\n\n# Content`;
        const { frontmatter, errors } = parseFrontmatter(markdown);

        // Should parse without errors
        expect(errors).toHaveLength(0);
        expect(frontmatter).not.toBeNull();

        // Fields should match
        expect(frontmatter!.name).toBe(original.name);
        expect(frontmatter!.description).toBe(original.description);
        expect(frontmatter!.metadata).toEqual({});
      }),
      { numRuns: 100 }
    );
  });

  it('handles single-tool allowedTools through round-trip', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !/\s/.test(s)),
        (name, desc, tool) => {
          const original = {
            name,
            description: desc,
            allowedTools: tool,
          };

          // Serialize to YAML
          const yaml = serializeFrontmatter(original);

          // Wrap in frontmatter delimiters and parse back
          const markdown = `---\n${yaml}---\n\n# Content`;
          const { frontmatter, errors } = parseFrontmatter(markdown);

          // Should parse without errors
          expect(errors).toHaveLength(0);
          expect(frontmatter).not.toBeNull();

          // Fields should match
          expect(frontmatter!.name).toBe(original.name);
          expect(frontmatter!.description).toBe(original.description);
          expect(frontmatter!.allowedTools).toBe(original.allowedTools);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles special characters in description through round-trip', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.string({ minLength: 1, maxLength: 200 }),
        (name, desc) => {
          const original = {
            name,
            description: desc,
          };

          // Serialize to YAML
          const yaml = serializeFrontmatter(original);

          // Wrap in frontmatter delimiters and parse back
          const markdown = `---\n${yaml}---\n\n# Content`;
          const { frontmatter, errors } = parseFrontmatter(markdown);

          // Should parse without errors
          expect(errors).toHaveLength(0);
          expect(frontmatter).not.toBeNull();

          // Fields should match
          expect(frontmatter!.name).toBe(original.name);
          expect(frontmatter!.description).toBe(original.description);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('handles multiline compatibility through round-trip', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        (name, desc, compat) => {
          const original = {
            name,
            description: desc,
            compatibility: compat,
          };

          // Serialize to YAML
          const yaml = serializeFrontmatter(original);

          // Wrap in frontmatter delimiters and parse back
          const markdown = `---\n${yaml}---\n\n# Content`;
          const { frontmatter, errors } = parseFrontmatter(markdown);

          // Should parse without errors
          expect(errors).toHaveLength(0);
          expect(frontmatter).not.toBeNull();

          // Fields should match
          expect(frontmatter!.name).toBe(original.name);
          expect(frontmatter!.description).toBe(original.description);
          expect(frontmatter!.compatibility).toBe(original.compatibility);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('preserves metadata with various key-value patterns through round-trip', () => {
    fc.assert(
      fc.property(
        arbValidSkillName,
        fc.string({ minLength: 1, maxLength: 100 }),
        arbMetadata,
        (name, desc, metadata) => {
          const original = {
            name,
            description: desc,
            metadata,
          };

          // Serialize to YAML
          const yaml = serializeFrontmatter(original);

          // Wrap in frontmatter delimiters and parse back
          const markdown = `---\n${yaml}---\n\n# Content`;
          const { frontmatter, errors } = parseFrontmatter(markdown);

          // Should parse without errors
          expect(errors).toHaveLength(0);
          expect(frontmatter).not.toBeNull();

          // Fields should match
          expect(frontmatter!.name).toBe(original.name);
          expect(frontmatter!.description).toBe(original.description);
          expect(frontmatter!.metadata).toEqual(original.metadata);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('round-trip is idempotent (serialize-parse-serialize produces same YAML)', () => {
    fc.assert(
      fc.property(arbPartialFrontmatter, (original) => {
        // First round-trip
        const yaml1 = serializeFrontmatter(original);
        const markdown1 = `---\n${yaml1}---\n\n# Content`;
        const { frontmatter: parsed1 } = parseFrontmatter(markdown1);

        // Second round-trip
        const yaml2 = serializeFrontmatter(parsed1!);
        const markdown2 = `---\n${yaml2}---\n\n# Content`;
        const { frontmatter: parsed2 } = parseFrontmatter(markdown2);

        // Both parsed results should be identical
        expect(parsed2).toEqual(parsed1);
      }),
      { numRuns: 100 }
    );
  });
});

