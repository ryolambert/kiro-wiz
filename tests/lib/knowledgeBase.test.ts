import { describe, it, expect, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rm, readFile, mkdir } from 'node:fs/promises';
import type { KnowledgeBaseEntry } from '../../lib/types.js';
import {
  urlToSlug,
  urlToCategory,
  write,
  read,
  list,
  updateIndex,
} from '../../lib/knowledgeBase.js';

// ─── urlToSlug ──────────────────────────────────────────────

describe('urlToSlug', () => {
  it('extracts last path segment as kebab-case', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/overview')
    ).toBe('overview');
  });

  it('strips trailing slashes', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/overview/')
    ).toBe('overview');
  });

  it('converts multi-word segments to kebab-case', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/getting-started/quick-start')
    ).toBe('quick-start');
  });

  it('strips .html extension', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/overview.html')
    ).toBe('overview');
  });

  it('replaces non-alphanumeric chars with hyphens', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/my_hook%20test')
    ).toBe('my-hook-20test');
  });

  it('lowercases the slug', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/MyHook')
    ).toBe('myhook');
  });

  it('handles root-only URL by using hostname', () => {
    expect(urlToSlug('https://kiro.dev/')).toBe('kiro-dev');
  });

  it('returns unknown for invalid URLs', () => {
    expect(urlToSlug('not-a-url')).toBe('unknown');
  });

  it('handles agentskills.io URLs', () => {
    expect(
      urlToSlug('https://agentskills.io/specification')
    ).toBe('specification');
  });

  it('collapses consecutive hyphens', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/my--hook')
    ).toBe('my-hook');
  });

  it('strips leading and trailing hyphens from slug', () => {
    expect(
      urlToSlug('https://kiro.dev/docs/hooks/-overview-')
    ).toBe('overview');
  });
});

// ─── urlToCategory ──────────────────────────────────────────

describe('urlToCategory', () => {
  it('delegates to categorizeUrl for kiro.dev docs', () => {
    expect(
      urlToCategory('https://kiro.dev/docs/hooks/overview')
    ).toBe('hooks');
  });

  it('maps agentskills.io to agent-skills-spec', () => {
    expect(
      urlToCategory('https://agentskills.io/specification')
    ).toBe('agent-skills-spec');
  });

  it('maps blog URLs to blog', () => {
    expect(
      urlToCategory('https://kiro.dev/blog/launch')
    ).toBe('blog');
  });

  it('returns unknown for unrecognized URLs', () => {
    expect(
      urlToCategory('https://example.com/page')
    ).toBe('unknown');
  });
});

// ─── write / read / list / updateIndex ──────────────────────

describe('Knowledge Base FS operations', () => {
  const baseDir = join(
    tmpdir(),
    `kb-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const makeEntry = (
    overrides: Partial<KnowledgeBaseEntry> = {}
  ): KnowledgeBaseEntry => ({
    slug: 'overview',
    category: 'hooks',
    title: 'Hooks Overview',
    content: '# Hooks\n\nHooks let you automate actions.',
    sourceUrl: 'https://kiro.dev/docs/hooks/overview',
    lastUpdated: '2024-06-01T00:00:00.000Z',
    ...overrides,
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  describe('write', () => {
    it('creates file in correct category directory', async () => {
      const entry = makeEntry();
      const filePath = await write(entry, baseDir);
      expect(filePath).toBe(join(baseDir, 'hooks', 'overview.md'));

      const raw = await readFile(filePath, 'utf-8');
      expect(raw).toContain('title: "Hooks Overview"');
      expect(raw).toContain('# Hooks');
    });

    it('creates parent directories automatically', async () => {
      const entry = makeEntry({ category: 'mcp', slug: 'setup' });
      const filePath = await write(entry, baseDir);
      const raw = await readFile(filePath, 'utf-8');
      expect(raw).toContain('category: "mcp"');
    });

    it('writes agent-skills-spec to agent-skills-spec dir', async () => {
      const entry = makeEntry({
        category: 'agent-skills-spec',
        slug: 'specification',
        title: 'Agent Skills Spec',
        sourceUrl: 'https://agentskills.io/specification',
      });
      const filePath = await write(entry, baseDir);
      expect(filePath).toBe(
        join(baseDir, 'agent-skills-spec', 'specification.md')
      );
    });

    it('writes unknown category to uncategorized dir', async () => {
      const entry = makeEntry({
        category: 'unknown',
        slug: 'misc',
      });
      const filePath = await write(entry, baseDir);
      expect(filePath).toContain('uncategorized');
    });

    it('includes frontmatter with metadata', async () => {
      const entry = makeEntry();
      const filePath = await write(entry, baseDir);
      const raw = await readFile(filePath, 'utf-8');
      expect(raw).toMatch(/^---\n/);
      expect(raw).toContain('sourceUrl:');
      expect(raw).toContain('lastUpdated:');
    });

    it('escapes double quotes in title', async () => {
      const entry = makeEntry({ title: 'My "Special" Hook' });
      const filePath = await write(entry, baseDir);
      const raw = await readFile(filePath, 'utf-8');
      expect(raw).toContain('title: "My \\"Special\\" Hook"');
    });
  });

  describe('read', () => {
    it('reads back a written entry', async () => {
      const entry = makeEntry();
      await write(entry, baseDir);
      const result = await read('hooks', 'overview', baseDir);
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Hooks Overview');
      expect(result!.slug).toBe('overview');
      expect(result!.category).toBe('hooks');
      expect(result!.content).toContain('# Hooks');
    });

    it('returns null for non-existent file', async () => {
      const result = await read('hooks', 'nonexistent', baseDir);
      expect(result).toBeNull();
    });

    it('returns null for non-existent category', async () => {
      const result = await read('mcp', 'overview', baseDir);
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('lists all categories and files', async () => {
      await write(makeEntry(), baseDir);
      await write(
        makeEntry({
          category: 'mcp',
          slug: 'setup',
          title: 'MCP Setup',
        }),
        baseDir
      );

      const result = await list(baseDir);
      expect(result).toHaveLength(2);

      const hooks = result.find((r) => r.category === 'hooks');
      expect(hooks).toBeDefined();
      expect(hooks!.files).toContain('overview');

      const mcp = result.find((r) => r.category === 'mcp');
      expect(mcp).toBeDefined();
      expect(mcp!.files).toContain('setup');
    });

    it('returns empty array for non-existent base dir', async () => {
      const result = await list(join(baseDir, 'nonexistent'));
      expect(result).toEqual([]);
    });

    it('skips empty directories', async () => {
      await mkdir(join(baseDir, 'empty-cat'), { recursive: true });
      await write(makeEntry(), baseDir);

      const result = await list(baseDir);
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('hooks');
    });

    it('sorts categories and files alphabetically', async () => {
      await write(
        makeEntry({ category: 'steering', slug: 'beta' }),
        baseDir
      );
      await write(
        makeEntry({ category: 'hooks', slug: 'alpha' }),
        baseDir
      );
      await write(
        makeEntry({ category: 'hooks', slug: 'zeta' }),
        baseDir
      );

      const result = await list(baseDir);
      expect(result[0].category).toBe('hooks');
      expect(result[1].category).toBe('steering');
      expect(result[0].files).toEqual(['alpha', 'zeta']);
    });
  });

  describe('updateIndex', () => {
    it('generates index.md with all categories and files', async () => {
      await write(makeEntry(), baseDir);
      await write(
        makeEntry({
          category: 'mcp',
          slug: 'setup',
          title: 'MCP Setup',
        }),
        baseDir
      );

      await updateIndex(baseDir);

      const indexPath = join(baseDir, 'index.md');
      const raw = await readFile(indexPath, 'utf-8');

      expect(raw).toContain('# Knowledge Base Index');
      expect(raw).toContain('## Hooks');
      expect(raw).toContain('## Mcp');
      expect(raw).toContain('[Overview](hooks/overview.md)');
      expect(raw).toContain('[Setup](mcp/setup.md)');
    });

    it('creates index.md even for empty knowledge base', async () => {
      await mkdir(baseDir, { recursive: true });
      await updateIndex(baseDir);

      const indexPath = join(baseDir, 'index.md');
      const raw = await readFile(indexPath, 'utf-8');
      expect(raw).toContain('# Knowledge Base Index');
    });

    it('updates index when new file is added', async () => {
      await write(makeEntry(), baseDir);
      await updateIndex(baseDir);

      await write(
        makeEntry({
          category: 'cli',
          slug: 'custom-agents',
          title: 'Custom Agents',
        }),
        baseDir
      );
      await updateIndex(baseDir);

      const raw = await readFile(
        join(baseDir, 'index.md'),
        'utf-8'
      );
      expect(raw).toContain('## Cli');
      expect(raw).toContain(
        '[Custom Agents](cli/custom-agents.md)'
      );
      expect(raw).toContain('[Overview](hooks/overview.md)');
    });

    it('formats multi-word category titles', async () => {
      await write(
        makeEntry({
          category: 'agent-skills-spec',
          slug: 'intro',
        }),
        baseDir
      );
      await updateIndex(baseDir);

      const raw = await readFile(
        join(baseDir, 'index.md'),
        'utf-8'
      );
      expect(raw).toContain('## Agent Skills Spec');
    });
  });
});
