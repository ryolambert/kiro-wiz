import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  initKB,
  list,
  loadKB,
  read,
  saveKB,
  search,
  urlToCategory,
  urlToSlug,
  write,
} from '../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry } from '../../lib/types.js';

// ─── urlToSlug ──────────────────────────────────────────────

describe('urlToSlug', () => {
  it('extracts last path segment as kebab-case', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/overview')).toBe('overview');
  });

  it('strips trailing slashes', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/overview/')).toBe('overview');
  });

  it('converts multi-word segments to kebab-case', () => {
    expect(urlToSlug('https://kiro.dev/docs/getting-started/quick-start')).toBe('quick-start');
  });

  it('strips .html extension', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/overview.html')).toBe('overview');
  });

  it('replaces non-alphanumeric chars with hyphens', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/my_hook%20test')).toBe('my-hook-20test');
  });

  it('lowercases the slug', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/MyHook')).toBe('myhook');
  });

  it('handles root-only URL by using hostname', () => {
    expect(urlToSlug('https://kiro.dev/')).toBe('kiro-dev');
  });

  it('returns unknown for invalid URLs', () => {
    expect(urlToSlug('not-a-url')).toBe('unknown');
  });

  it('handles agentskills.io URLs', () => {
    expect(urlToSlug('https://agentskills.io/specification')).toBe('specification');
  });

  it('collapses consecutive hyphens', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/my--hook')).toBe('my-hook');
  });

  it('strips leading and trailing hyphens from slug', () => {
    expect(urlToSlug('https://kiro.dev/docs/hooks/-overview-')).toBe('overview');
  });
});

// ─── urlToCategory ──────────────────────────────────────────

describe('urlToCategory', () => {
  it('delegates to categorizeUrl for kiro.dev docs', () => {
    expect(urlToCategory('https://kiro.dev/docs/hooks/overview')).toBe('hooks');
  });

  it('maps agentskills.io to agent-skills-spec', () => {
    expect(urlToCategory('https://agentskills.io/specification')).toBe('agent-skills-spec');
  });

  it('maps blog URLs to blog', () => {
    expect(urlToCategory('https://kiro.dev/blog/launch')).toBe('blog');
  });

  it('returns unknown for unrecognized URLs', () => {
    expect(urlToCategory('https://example.com/page')).toBe('unknown');
  });
});

// ─── write / read / list / search / persistence ─────────────

describe('Knowledge Base operations', () => {
  const makeEntry = (overrides: Partial<KnowledgeBaseEntry> = {}): KnowledgeBaseEntry => ({
    slug: 'overview',
    category: 'hooks',
    title: 'Hooks Overview',
    content: '# Hooks\n\nHooks let you automate actions.',
    sourceUrl: 'https://kiro.dev/docs/hooks/overview',
    lastUpdated: '2024-06-01T00:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    initKB([]);
  });

  describe('write', () => {
    it('adds entry to the database', () => {
      write(makeEntry());
      const result = read('hooks', 'overview');
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Hooks Overview');
    });

    it('upserts existing entry', () => {
      write(makeEntry());
      write(makeEntry({ title: 'Updated Title' }));
      const result = read('hooks', 'overview');
      expect(result?.title).toBe('Updated Title');
      expect(list()).toHaveLength(1);
    });

    it('stores all entry fields', () => {
      const entry = makeEntry();
      write(entry);
      const result = read('hooks', 'overview');
      expect(result?.slug).toBe('overview');
      expect(result?.category).toBe('hooks');
      expect(result?.content).toContain('# Hooks');
      expect(result?.sourceUrl).toBe('https://kiro.dev/docs/hooks/overview');
      expect(result?.lastUpdated).toBe('2024-06-01T00:00:00.000Z');
    });
  });

  describe('read', () => {
    it('reads back a written entry', () => {
      write(makeEntry());
      const result = read('hooks', 'overview');
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Hooks Overview');
    });

    it('returns null for non-existent entry', () => {
      expect(read('hooks', 'nonexistent')).toBeNull();
    });

    it('returns null for non-existent category', () => {
      expect(read('mcp', 'overview')).toBeNull();
    });
  });

  describe('list', () => {
    it('lists all categories and files', () => {
      write(makeEntry());
      write(makeEntry({ category: 'mcp', slug: 'setup', title: 'MCP Setup' }));

      const result = list();
      expect(result).toHaveLength(2);
      expect(result.find((r) => r.category === 'hooks')?.files).toContain('overview');
      expect(result.find((r) => r.category === 'mcp')?.files).toContain('setup');
    });

    it('returns empty array when no entries', () => {
      expect(list()).toEqual([]);
    });

    it('sorts categories and files alphabetically', () => {
      write(makeEntry({ category: 'steering', slug: 'beta' }));
      write(makeEntry({ category: 'hooks', slug: 'alpha' }));
      write(makeEntry({ category: 'hooks', slug: 'zeta' }));

      const result = list();
      expect(result[0].category).toBe('hooks');
      expect(result[1].category).toBe('steering');
      expect(result[0].files).toEqual(['alpha', 'zeta']);
    });

    it('deduplicates slugs within a category', () => {
      write(makeEntry({ slug: 'overview' }));
      write(makeEntry({ slug: 'overview', title: 'Updated' }));
      const result = list();
      expect(result[0].files).toEqual(['overview']);
    });
  });

  describe('search', () => {
    it('finds entries by slug', () => {
      write(makeEntry());
      expect(search('overview')).toHaveLength(1);
    });

    it('finds entries by category', () => {
      write(makeEntry());
      expect(search('hooks')).toHaveLength(1);
    });

    it('finds entries by title', () => {
      write(makeEntry());
      expect(search('Hooks Overview')).toHaveLength(1);
    });

    it('finds entries by content', () => {
      write(makeEntry());
      expect(search('automate actions')).toHaveLength(1);
    });

    it('returns empty for no match', () => {
      write(makeEntry());
      expect(search('nonexistent-xyz')).toHaveLength(0);
    });

    it('is case-insensitive', () => {
      write(makeEntry());
      expect(search('HOOKS')).toHaveLength(1);
    });
  });

  describe('persistence', () => {
    const tmpPath = join(
      tmpdir(),
      `kb-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
    );

    afterEach(async () => {
      await rm(tmpPath, { force: true });
    });

    it('saves and loads from JSON file', async () => {
      write(makeEntry());
      write(makeEntry({ category: 'mcp', slug: 'setup', title: 'MCP Setup' }));
      await saveKB(tmpPath);

      initKB([]);
      expect(list()).toHaveLength(0);

      await loadKB(tmpPath);
      expect(list()).toHaveLength(2);
      expect(read('hooks', 'overview')?.title).toBe('Hooks Overview');
      expect(read('mcp', 'setup')?.title).toBe('MCP Setup');
    });

    it('persists as valid JSON', async () => {
      write(makeEntry());
      await saveKB(tmpPath);

      const raw = await readFile(tmpPath, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].slug).toBe('overview');
    });

    it('initKB replaces all data', () => {
      write(makeEntry());
      expect(list()).toHaveLength(1);

      initKB([
        makeEntry({ category: 'mcp', slug: 'a' }),
        makeEntry({ category: 'mcp', slug: 'b' }),
      ]);
      expect(list()).toHaveLength(1); // one category
      expect(read('hooks', 'overview')).toBeNull();
      expect(read('mcp', 'a')).not.toBeNull();
    });
  });
});
