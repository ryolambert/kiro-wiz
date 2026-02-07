import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateFrontmatter,
  validateDirectory,
  serializeFrontmatter,
  parseFrontmatter,
} from '../../lib/skillsValidator.js';
import type { SkillFrontmatter } from '../../lib/types.js';

describe('skillsValidator', () => {
  describe('validateName', () => {
    it('accepts valid lowercase alphanumeric names', () => {
      const result = validateName('my-skill');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts single character names', () => {
      const result = validateName('a');
      expect(result.isValid).toBe(true);
    });

    it('accepts names with numbers', () => {
      const result = validateName('skill-123');
      expect(result.isValid).toBe(true);
    });

    it('rejects empty names', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('required');
    });

    it('rejects names with uppercase letters', () => {
      const result = validateName('My-Skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('lowercase');
    });

    it('rejects names with leading hyphens', () => {
      const result = validateName('-my-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('leading/trailing');
    });

    it('rejects names with trailing hyphens', () => {
      const result = validateName('my-skill-');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('leading/trailing');
    });

    it('rejects names with consecutive hyphens', () => {
      const result = validateName('my--skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('consecutive');
    });

    it('rejects names longer than 64 characters', () => {
      const longName = 'a'.repeat(65);
      const result = validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('1-64');
    });

    it('rejects names with special characters', () => {
      const result = validateName('my_skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('lowercase');
    });

    it('validates name matches parent directory', () => {
      const result = validateName('my-skill', 'my-skill');
      expect(result.isValid).toBe(true);
    });

    it('rejects name that does not match parent directory', () => {
      const result = validateName('my-skill', 'other-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('must match parent directory');
    });
  });

  describe('validateFrontmatter', () => {
    it('accepts valid minimal frontmatter', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts frontmatter with all optional fields', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        license: 'MIT',
        compatibility: 'Works with all versions',
        metadata: { author: 'Test', version: '1.0' },
        allowedTools: 'tool1 tool2 tool3',
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(true);
    });

    it('rejects missing name', () => {
      const frontmatter = {
        description: 'A test skill',
      } as SkillFrontmatter;
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('rejects missing description', () => {
      const frontmatter = {
        name: 'my-skill',
      } as SkillFrontmatter;
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'description')).toBe(true);
    });

    it('rejects description longer than 1024 characters', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'x'.repeat(1025),
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('1-1024');
    });

    it('rejects compatibility longer than 500 characters', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        compatibility: 'x'.repeat(501),
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'compatibility')).toBe(true);
    });

    it('rejects non-string metadata values', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        metadata: { count: 123 } as unknown as Record<string, string>,
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field.startsWith('metadata'))).toBe(true);
    });

    it('rejects non-string allowedTools', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        allowedTools: ['tool1', 'tool2'] as unknown as string,
      };
      const result = validateFrontmatter(frontmatter);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'allowedTools')).toBe(true);
    });

    it('validates name matches parent directory when provided', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
      };
      const result = validateFrontmatter(frontmatter, 'my-skill');
      expect(result.isValid).toBe(true);
    });

    it('rejects name mismatch with parent directory', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
      };
      const result = validateFrontmatter(frontmatter, 'other-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('parent directory'))).toBe(
        true
      );
    });
  });

  describe('validateDirectory', () => {
    it('accepts valid directory with SKILL.md', () => {
      const structure = {
        hasSkillMd: true,
        directories: [],
      };
      const result = validateDirectory(structure, 'my-skill');
      expect(result.isValid).toBe(true);
    });

    it('accepts valid optional directories', () => {
      const structure = {
        hasSkillMd: true,
        directories: ['scripts', 'references', 'assets'],
      };
      const result = validateDirectory(structure, 'my-skill');
      expect(result.isValid).toBe(true);
    });

    it('rejects missing SKILL.md', () => {
      const structure = {
        hasSkillMd: false,
        directories: [],
      };
      const result = validateDirectory(structure, 'my-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('SKILL.md must exist');
    });

    it('rejects invalid directories', () => {
      const structure = {
        hasSkillMd: true,
        directories: ['invalid', 'bad-dir'],
      };
      const result = validateDirectory(structure, 'my-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('Invalid directories');
    });

    it('accepts mix of valid and reports invalid directories', () => {
      const structure = {
        hasSkillMd: true,
        directories: ['scripts', 'invalid', 'references'],
      };
      const result = validateDirectory(structure, 'my-skill');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toContain('invalid');
    });
  });

  describe('serializeFrontmatter', () => {
    it('serializes minimal frontmatter', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
      };
      const yaml = serializeFrontmatter(frontmatter);
      expect(yaml).toContain('name: my-skill');
      expect(yaml).toContain('description: A test skill');
    });

    it('serializes frontmatter with all fields', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        license: 'MIT',
        compatibility: 'All versions',
        metadata: { author: 'Test', version: '1.0' },
        allowedTools: 'tool1 tool2',
      };
      const yaml = serializeFrontmatter(frontmatter);
      expect(yaml).toContain('name: my-skill');
      expect(yaml).toContain('description: A test skill');
      expect(yaml).toContain('license: MIT');
      expect(yaml).toContain('compatibility: All versions');
      expect(yaml).toContain('metadata:');
      expect(yaml).toContain('author: Test');
      expect(yaml).toContain('allowed-tools: tool1 tool2');
    });

    it('omits undefined optional fields', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
      };
      const yaml = serializeFrontmatter(frontmatter);
      expect(yaml).not.toContain('license');
      expect(yaml).not.toContain('compatibility');
      expect(yaml).not.toContain('metadata');
      expect(yaml).not.toContain('allowed-tools');
    });
  });

  describe('parseFrontmatter', () => {
    it('parses valid frontmatter', () => {
      const markdown = `---
name: my-skill
description: A test skill
---

# My Skill

This is the body content.`;

      const result = parseFrontmatter(markdown);
      expect(result.errors).toHaveLength(0);
      expect(result.frontmatter).not.toBeNull();
      expect(result.frontmatter?.name).toBe('my-skill');
      expect(result.frontmatter?.description).toBe('A test skill');
      expect(result.body).toContain('# My Skill');
    });

    it('parses frontmatter with all optional fields', () => {
      const markdown = `---
name: my-skill
description: A test skill
license: MIT
compatibility: All versions
metadata:
  author: Test
  version: "1.0"
allowed-tools: tool1 tool2
---

Body content`;

      const result = parseFrontmatter(markdown);
      expect(result.errors).toHaveLength(0);
      expect(result.frontmatter?.license).toBe('MIT');
      expect(result.frontmatter?.compatibility).toBe('All versions');
      expect(result.frontmatter?.metadata?.author).toBe('Test');
      expect(result.frontmatter?.allowedTools).toBe('tool1 tool2');
    });

    it('handles missing opening delimiter', () => {
      const markdown = `name: my-skill
description: A test skill
---

Body`;

      const result = parseFrontmatter(markdown);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('Missing opening');
      expect(result.frontmatter).toBeNull();
    });

    it('handles missing closing delimiter', () => {
      const markdown = `---
name: my-skill
description: A test skill

Body`;

      const result = parseFrontmatter(markdown);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('Missing closing');
      expect(result.frontmatter).toBeNull();
    });

    it('handles invalid YAML', () => {
      const markdown = `---
name: my-skill
description: [invalid yaml
---

Body`;

      const result = parseFrontmatter(markdown);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('Failed to parse YAML');
      expect(result.frontmatter).toBeNull();
    });

    it('handles non-object YAML', () => {
      const markdown = `---
- item1
- item2
---

Body`;

      const result = parseFrontmatter(markdown);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('must be a YAML object');
      expect(result.frontmatter).toBeNull();
    });

    it('extracts body correctly', () => {
      const markdown = `---
name: my-skill
description: A test skill
---

# Heading

Paragraph 1

Paragraph 2`;

      const result = parseFrontmatter(markdown);
      expect(result.body).toBe(`# Heading

Paragraph 1

Paragraph 2`);
    });

    it('handles empty body', () => {
      const markdown = `---
name: my-skill
description: A test skill
---`;

      const result = parseFrontmatter(markdown);
      expect(result.body).toBe('');
    });
  });

  describe('round-trip serialization', () => {
    it('serializes and parses back to same frontmatter', () => {
      const original: SkillFrontmatter = {
        name: 'my-skill',
        description: 'A test skill',
        license: 'MIT',
        compatibility: 'All versions',
        metadata: { author: 'Test', version: '1.0' },
        allowedTools: 'tool1 tool2',
      };

      const yaml = serializeFrontmatter(original);
      const markdown = `---\n${yaml}---\n\nBody content`;
      const parsed = parseFrontmatter(markdown);

      expect(parsed.errors).toHaveLength(0);
      expect(parsed.frontmatter?.name).toBe(original.name);
      expect(parsed.frontmatter?.description).toBe(original.description);
      expect(parsed.frontmatter?.license).toBe(original.license);
      expect(parsed.frontmatter?.compatibility).toBe(original.compatibility);
      expect(parsed.frontmatter?.metadata).toEqual(original.metadata);
      expect(parsed.frontmatter?.allowedTools).toBe(original.allowedTools);
    });
  });
});
