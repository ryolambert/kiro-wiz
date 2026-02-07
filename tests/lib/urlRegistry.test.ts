import { describe, it, expect, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import type { RegistryEntry } from '../../lib/types.js';
import {
  categorizeUrl,
  getAll,
  getByCategory,
  getActive,
  add,
  markStale,
  markFailed,
  updateLastCrawled,
  save,
  load,
  seedAgentSkillsUrls,
  seedSitemapUrls,
} from '../../lib/urlRegistry.js';

// ─── categorizeUrl ──────────────────────────────────────────

describe('categorizeUrl', () => {
  it('maps kiro.dev/docs/hooks/* to hooks', () => {
    expect(categorizeUrl('https://kiro.dev/docs/hooks/')).toBe('hooks');
    expect(categorizeUrl('https://kiro.dev/docs/hooks/overview')).toBe(
      'hooks'
    );
  });

  it('maps kiro.dev/docs/cli/* to cli', () => {
    expect(categorizeUrl('https://kiro.dev/docs/cli/custom-agents/')).toBe(
      'cli'
    );
  });

  it('maps kiro.dev/docs/specs/* to specs', () => {
    expect(categorizeUrl('https://kiro.dev/docs/specs/')).toBe('specs');
  });

  it('maps kiro.dev/docs/steering/* to steering', () => {
    expect(categorizeUrl('https://kiro.dev/docs/steering/')).toBe(
      'steering'
    );
  });

  it('maps kiro.dev/docs/skills/* to skills', () => {
    expect(categorizeUrl('https://kiro.dev/docs/skills/')).toBe('skills');
  });

  it('maps kiro.dev/docs/powers/* to powers', () => {
    expect(categorizeUrl('https://kiro.dev/docs/powers/')).toBe('powers');
  });

  it('maps kiro.dev/docs/mcp/* to mcp', () => {
    expect(categorizeUrl('https://kiro.dev/docs/mcp/')).toBe('mcp');
  });

  it('maps kiro.dev/docs/chat/* to chat', () => {
    expect(categorizeUrl('https://kiro.dev/docs/chat/')).toBe('chat');
  });

  it('maps kiro.dev/docs/editor/* to editor', () => {
    expect(categorizeUrl('https://kiro.dev/docs/editor/')).toBe('editor');
  });

  it('maps kiro.dev/docs/getting-started/* to getting-started', () => {
    expect(
      categorizeUrl('https://kiro.dev/docs/getting-started/')
    ).toBe('getting-started');
  });

  it('maps kiro.dev/docs/guides/* to guides', () => {
    expect(categorizeUrl('https://kiro.dev/docs/guides/')).toBe('guides');
  });

  it('maps kiro.dev/docs/autonomous-agent/* to autonomous-agent', () => {
    expect(
      categorizeUrl('https://kiro.dev/docs/autonomous-agent/')
    ).toBe('autonomous-agent');
  });

  it('maps kiro.dev/docs/privacy-and-security/* to privacy-and-security', () => {
    expect(
      categorizeUrl('https://kiro.dev/docs/privacy-and-security/')
    ).toBe('privacy-and-security');
  });

  it('maps kiro.dev/docs/enterprise/* to enterprise', () => {
    expect(
      categorizeUrl('https://kiro.dev/docs/enterprise/')
    ).toBe('enterprise');
  });

  it('maps kiro.dev/docs/context-providers/* to context-providers', () => {
    expect(
      categorizeUrl('https://kiro.dev/docs/context-providers/')
    ).toBe('context-providers');
  });

  it('maps kiro.dev/blog/* to blog', () => {
    expect(categorizeUrl('https://kiro.dev/blog/')).toBe('blog');
    expect(
      categorizeUrl('https://kiro.dev/blog/some-post')
    ).toBe('blog');
  });

  it('maps kiro.dev/changelog/* to changelog', () => {
    expect(categorizeUrl('https://kiro.dev/changelog/')).toBe(
      'changelog'
    );
  });

  it('maps agentskills.io/* to agent-skills-spec', () => {
    expect(categorizeUrl('https://agentskills.io/home')).toBe(
      'agent-skills-spec'
    );
    expect(
      categorizeUrl('https://agentskills.io/specification')
    ).toBe('agent-skills-spec');
  });

  it('returns unknown for kiro.dev root', () => {
    expect(categorizeUrl('https://kiro.dev/')).toBe('unknown');
  });

  it('returns unknown for unrecognized paths', () => {
    expect(categorizeUrl('https://kiro.dev/pricing')).toBe('unknown');
  });

  it('returns unknown for non-kiro domains', () => {
    expect(categorizeUrl('https://example.com/docs/hooks/')).toBe(
      'unknown'
    );
  });

  it('returns unknown for invalid URLs', () => {
    expect(categorizeUrl('not-a-url')).toBe('unknown');
  });
});

// ─── Query Functions ────────────────────────────────────────

const makeEntry = (
  overrides: Partial<RegistryEntry> = {}
): RegistryEntry => ({
  url: 'https://kiro.dev/docs/hooks/overview',
  category: 'hooks',
  source: 'sitemap',
  lastCrawled: null,
  lastmod: null,
  status: 'active',
  ...overrides,
});

describe('getAll', () => {
  it('returns a copy of all entries', () => {
    const entries = [makeEntry(), makeEntry({ url: 'https://kiro.dev/blog/' })];
    const result = getAll(entries);
    expect(result).toEqual(entries);
    expect(result).not.toBe(entries);
  });

  it('returns empty array for empty input', () => {
    expect(getAll([])).toEqual([]);
  });
});

describe('getByCategory', () => {
  it('filters entries by category', () => {
    const entries = [
      makeEntry({ category: 'hooks' }),
      makeEntry({ url: 'https://kiro.dev/blog/', category: 'blog' }),
      makeEntry({
        url: 'https://kiro.dev/docs/hooks/api',
        category: 'hooks',
      }),
    ];
    const result = getByCategory(entries, 'hooks');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === 'hooks')).toBe(true);
  });

  it('returns empty for no matches', () => {
    const entries = [makeEntry({ category: 'hooks' })];
    expect(getByCategory(entries, 'blog')).toEqual([]);
  });
});

describe('getActive', () => {
  it('excludes stale and failed entries', () => {
    const entries = [
      makeEntry({ status: 'active' }),
      makeEntry({
        url: 'https://kiro.dev/stale',
        status: 'stale',
      }),
      makeEntry({
        url: 'https://kiro.dev/failed',
        status: 'failed',
      }),
    ];
    const result = getActive(entries);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('active');
  });
});

// ─── Mutation Functions ─────────────────────────────────────

describe('add', () => {
  it('adds a new entry with auto-categorization', () => {
    const result = add([], 'https://kiro.dev/docs/hooks/overview', 'sitemap');
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('hooks');
    expect(result[0].source).toBe('sitemap');
    expect(result[0].status).toBe('active');
    expect(result[0].lastCrawled).toBeNull();
  });

  it('does not duplicate existing URLs', () => {
    const entries = [makeEntry()];
    const result = add(entries, entries[0].url, 'sitemap');
    expect(result).toHaveLength(1);
  });

  it('stores lastmod when provided', () => {
    const result = add(
      [],
      'https://kiro.dev/docs/hooks/',
      'sitemap',
      '2024-01-01'
    );
    expect(result[0].lastmod).toBe('2024-01-01');
  });

  it('returns a new array (immutable)', () => {
    const entries = [makeEntry()];
    const result = add(entries, 'https://kiro.dev/blog/', 'sitemap');
    expect(result).not.toBe(entries);
  });
});

describe('markStale', () => {
  it('sets status to stale for matching URL', () => {
    const entries = [makeEntry()];
    const result = markStale(entries, entries[0].url);
    expect(result[0].status).toBe('stale');
  });

  it('does not modify other entries', () => {
    const entries = [
      makeEntry(),
      makeEntry({ url: 'https://kiro.dev/blog/' }),
    ];
    const result = markStale(entries, entries[0].url);
    expect(result[1].status).toBe('active');
  });

  it('returns a new array', () => {
    const entries = [makeEntry()];
    const result = markStale(entries, entries[0].url);
    expect(result).not.toBe(entries);
  });
});

describe('markFailed', () => {
  it('sets status to failed for matching URL', () => {
    const entries = [makeEntry()];
    const result = markFailed(entries, entries[0].url);
    expect(result[0].status).toBe('failed');
  });
});

describe('updateLastCrawled', () => {
  it('sets lastCrawled to an ISO timestamp', () => {
    const entries = [makeEntry()];
    const before = new Date().toISOString();
    const result = updateLastCrawled(entries, entries[0].url);
    const after = new Date().toISOString();
    expect(result[0].lastCrawled).not.toBeNull();
    expect(result[0].lastCrawled! >= before).toBe(true);
    expect(result[0].lastCrawled! <= after).toBe(true);
  });

  it('returns a new array', () => {
    const entries = [makeEntry()];
    const result = updateLastCrawled(entries, entries[0].url);
    expect(result).not.toBe(entries);
  });
});

// ─── Persistence ────────────────────────────────────────────

describe('save / load', () => {
  const tmpDir = join(tmpdir(), 'url-registry-test');
  const filePath = join(tmpDir, 'registry.json');

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('round-trips entries through JSON', async () => {
    const entries = [
      makeEntry(),
      makeEntry({
        url: 'https://agentskills.io/home',
        category: 'agent-skills-spec',
        source: 'agentskills',
      }),
    ];
    await save(entries, filePath);
    const loaded = await load(filePath);
    expect(loaded).toEqual(entries);
  });

  it('creates parent directories', async () => {
    const nested = join(tmpDir, 'a', 'b', 'registry.json');
    await save([], nested);
    const raw = await readFile(nested, 'utf-8');
    expect(JSON.parse(raw)).toEqual([]);
  });
});

// ─── Seeding ────────────────────────────────────────────────

describe('seedAgentSkillsUrls', () => {
  it('adds all 4 agentskills.io URLs', () => {
    const result = seedAgentSkillsUrls([]);
    expect(result).toHaveLength(4);
    expect(
      result.every((e) => e.category === 'agent-skills-spec')
    ).toBe(true);
    expect(result.every((e) => e.source === 'agentskills')).toBe(true);
  });

  it('does not duplicate on repeated calls', () => {
    const first = seedAgentSkillsUrls([]);
    const second = seedAgentSkillsUrls(first);
    expect(second).toHaveLength(4);
  });
});

describe('seedSitemapUrls', () => {
  it('adds sitemap URLs with auto-categorization', () => {
    const sitemapUrls = [
      { url: 'https://kiro.dev/docs/hooks/overview', lastmod: '2024-06-01' },
      { url: 'https://kiro.dev/blog/launch', lastmod: null },
    ];
    const result = seedSitemapUrls([], sitemapUrls);
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('hooks');
    expect(result[0].lastmod).toBe('2024-06-01');
    expect(result[1].category).toBe('blog');
    expect(result[1].source).toBe('sitemap');
  });

  it('does not duplicate existing URLs', () => {
    const existing = [makeEntry()];
    const sitemapUrls = [
      { url: existing[0].url, lastmod: null },
      { url: 'https://kiro.dev/blog/new', lastmod: null },
    ];
    const result = seedSitemapUrls(existing, sitemapUrls);
    expect(result).toHaveLength(2);
  });
});
