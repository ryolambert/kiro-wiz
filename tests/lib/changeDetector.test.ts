import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import {
  fetchSitemap,
  checkChangelog,
  parseChangelogDates,
  loadState,
  saveState,
  run,
} from '../../lib/changeDetector.js';
import type { RegistryEntry } from '../../lib/types.js';

// ─── fetchSitemap ───────────────────────────────────────────

describe('fetchSitemap', () => {
  it('parses sitemap XML with all fields', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kiro.dev/docs/hooks</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kiro.dev/docs/skills</loc>
    <lastmod>2025-01-10</lastmod>
  </url>
</urlset>`;

    const entries = await fetchSitemap('https://kiro.dev/sitemap.xml', { rawXml: xml });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      url: 'https://kiro.dev/docs/hooks',
      lastmod: '2025-01-15',
      changefreq: 'weekly',
      priority: 0.8,
    });
    expect(entries[1]).toEqual({
      url: 'https://kiro.dev/docs/skills',
      lastmod: '2025-01-10',
      changefreq: null,
      priority: null,
    });
  });

  it('returns empty array for empty sitemap', async () => {
    const xml = `<?xml version="1.0"?><urlset></urlset>`;
    const entries = await fetchSitemap('https://kiro.dev/sitemap.xml', { rawXml: xml });
    expect(entries).toEqual([]);
  });

  it('skips url blocks without loc', async () => {
    const xml = `<urlset><url><lastmod>2025-01-01</lastmod></url></urlset>`;
    const entries = await fetchSitemap('https://kiro.dev/sitemap.xml', { rawXml: xml });
    expect(entries).toEqual([]);
  });

  it('handles invalid priority as null', async () => {
    const xml = `<urlset><url><loc>https://kiro.dev/</loc><priority>abc</priority></url></urlset>`;
    const entries = await fetchSitemap('https://kiro.dev/sitemap.xml', { rawXml: xml });
    expect(entries[0].priority).toBeNull();
  });

  it('uses fetchFn when no rawXml provided', async () => {
    const xml = `<urlset><url><loc>https://kiro.dev/docs</loc></url></urlset>`;
    const mockFetch = async () => ({
      ok: true,
      text: async () => xml,
    });

    const entries = await fetchSitemap('https://kiro.dev/sitemap.xml', { fetchFn: mockFetch });
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe('https://kiro.dev/docs');
  });

  it('throws on HTTP error', async () => {
    const mockFetch = async () => ({
      ok: false,
      text: async () => 'Not Found',
    });

    await expect(
      fetchSitemap('https://kiro.dev/sitemap.xml', { fetchFn: mockFetch })
    ).rejects.toThrow('Failed to fetch sitemap');
  });
});

// ─── parseChangelogDates ────────────────────────────────────

describe('parseChangelogDates', () => {
  it('extracts ISO dates from HTML', () => {
    const html = `<h2>2025-06-15</h2><p>New feature</p><h2>2025-05-01</h2><p>Bug fix</p>`;
    const dates = parseChangelogDates(html);
    expect(dates).toEqual(['2025-06-15', '2025-05-01']);
  });

  it('deduplicates dates', () => {
    const html = `<p>2025-01-01</p><p>2025-01-01</p>`;
    const dates = parseChangelogDates(html);
    expect(dates).toEqual(['2025-01-01']);
  });

  it('returns sorted descending', () => {
    const html = `<p>2024-01-01</p><p>2025-06-01</p><p>2024-12-15</p>`;
    const dates = parseChangelogDates(html);
    expect(dates).toEqual(['2025-06-01', '2024-12-15', '2024-01-01']);
  });

  it('returns empty for no dates', () => {
    expect(parseChangelogDates('<p>No dates here</p>')).toEqual([]);
  });
});

// ─── checkChangelog ─────────────────────────────────────────

describe('checkChangelog', () => {
  it('detects new entries when since is null', async () => {
    const html = `<h2>2025-06-15</h2><p>Update</p>`;
    const result = await checkChangelog('https://kiro.dev/changelog', null, { rawHtml: html });
    expect(result.hasNewEntries).toBe(true);
    expect(result.latestTimestamp).toBe('2025-06-15');
  });

  it('detects new entries when latest > since', async () => {
    const html = `<h2>2025-06-15</h2>`;
    const result = await checkChangelog('https://kiro.dev/changelog', '2025-06-01', { rawHtml: html });
    expect(result.hasNewEntries).toBe(true);
    expect(result.latestTimestamp).toBe('2025-06-15');
  });

  it('no new entries when latest <= since', async () => {
    const html = `<h2>2025-06-01</h2>`;
    const result = await checkChangelog('https://kiro.dev/changelog', '2025-06-15', { rawHtml: html });
    expect(result.hasNewEntries).toBe(false);
  });

  it('no new entries for empty changelog', async () => {
    const result = await checkChangelog('https://kiro.dev/changelog', null, { rawHtml: '<p>Empty</p>' });
    expect(result.hasNewEntries).toBe(false);
    expect(result.latestTimestamp).toBeNull();
  });

  it('throws on HTTP error', async () => {
    const mockFetch = async () => ({ ok: false, text: async () => '' });
    await expect(
      checkChangelog('https://kiro.dev/changelog', null, { fetchFn: mockFetch })
    ).rejects.toThrow('Failed to fetch changelog');
  });
});

// ─── loadState / saveState ──────────────────────────────────

describe('state persistence', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'cd-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('saveState writes and loadState reads back', async () => {
    const path = join(tmpDir, 'state.json');
    const state = {
      lastRun: '2025-06-15T00:00:00.000Z',
      lastChangelogTimestamp: '2025-06-10',
      knownUrls: ['https://kiro.dev/docs/hooks'],
    };

    await saveState(path, state);
    const loaded = await loadState(path);
    expect(loaded).toEqual(state);
  });

  it('loadState returns default for missing file', async () => {
    const loaded = await loadState(join(tmpDir, 'nonexistent.json'));
    expect(loaded).toEqual({
      lastRun: null,
      lastChangelogTimestamp: null,
      knownUrls: [],
    });
  });

  it('loadState returns default for invalid JSON', async () => {
    const path = join(tmpDir, 'bad.json');
    const { writeFile: wf } = await import('node:fs/promises');
    await wf(path, 'not json', 'utf-8');
    const loaded = await loadState(path);
    expect(loaded).toEqual({
      lastRun: null,
      lastChangelogTimestamp: null,
      knownUrls: [],
    });
  });

  it('loadState returns default for JSON missing required fields', async () => {
    const path = join(tmpDir, 'partial.json');
    const { writeFile: wf } = await import('node:fs/promises');
    await wf(path, JSON.stringify({ lastRun: null }), 'utf-8');
    const loaded = await loadState(path);
    expect(loaded).toEqual({
      lastRun: null,
      lastChangelogTimestamp: null,
      knownUrls: [],
    });
  });

  it('saveState creates directories as needed', async () => {
    const path = join(tmpDir, 'nested', 'deep', 'state.json');
    await saveState(path, {
      lastRun: null,
      lastChangelogTimestamp: null,
      knownUrls: [],
    });
    const raw = await readFile(path, 'utf-8');
    expect(JSON.parse(raw)).toEqual({
      lastRun: null,
      lastChangelogTimestamp: null,
      knownUrls: [],
    });
  });
});

// ─── run ────────────────────────────────────────────────────

describe('run', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'cd-run-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  const makeFetchFn = (sitemapXml: string, changelogHtml: string) => {
    return async (url: string) => {
      if (url.includes('sitemap')) {
        return { ok: true, text: async () => sitemapXml };
      }
      if (url.includes('changelog')) {
        return { ok: true, text: async () => changelogHtml };
      }
      return { ok: false, text: async () => 'Not Found' };
    };
  };

  it('detects new URLs not in registry', async () => {
    const xml = `<urlset>
      <url><loc>https://kiro.dev/docs/hooks</loc><lastmod>2025-01-15</lastmod></url>
      <url><loc>https://kiro.dev/docs/new-page</loc><lastmod>2025-06-01</lastmod></url>
    </urlset>`;

    const existing: RegistryEntry[] = [{
      url: 'https://kiro.dev/docs/hooks',
      category: 'hooks',
      source: 'sitemap',
      lastCrawled: null,
      lastmod: '2025-01-15',
      status: 'active',
    }];

    const { result, updatedEntries } = await run(existing, {
      fetchFn: makeFetchFn(xml, '<p>No dates</p>'),
      statePath: join(tmpDir, 'state.json'),
    });

    expect(result.newUrls).toEqual(['https://kiro.dev/docs/new-page']);
    expect(result.modifiedUrls).toEqual([]);
    expect(updatedEntries).toHaveLength(2);
    expect(updatedEntries.find(e => e.url === 'https://kiro.dev/docs/new-page')).toBeDefined();
  });

  it('detects modified URLs by lastmod comparison', async () => {
    const xml = `<urlset>
      <url><loc>https://kiro.dev/docs/hooks</loc><lastmod>2025-06-15</lastmod></url>
    </urlset>`;

    const existing: RegistryEntry[] = [{
      url: 'https://kiro.dev/docs/hooks',
      category: 'hooks',
      source: 'sitemap',
      lastCrawled: null,
      lastmod: '2025-01-15',
      status: 'active',
    }];

    const { result } = await run(existing, {
      fetchFn: makeFetchFn(xml, '<p>No dates</p>'),
      statePath: join(tmpDir, 'state.json'),
    });

    expect(result.modifiedUrls).toEqual(['https://kiro.dev/docs/hooks']);
  });

  it('detects removed URLs (in registry but not in sitemap)', async () => {
    const xml = `<urlset></urlset>`;

    const existing: RegistryEntry[] = [{
      url: 'https://kiro.dev/docs/hooks',
      category: 'hooks',
      source: 'sitemap',
      lastCrawled: null,
      lastmod: '2025-01-15',
      status: 'active',
    }];

    const { result } = await run(existing, {
      fetchFn: makeFetchFn(xml, '<p>No dates</p>'),
      statePath: join(tmpDir, 'state.json'),
    });

    expect(result.removedUrls).toEqual(['https://kiro.dev/docs/hooks']);
  });

  it('does not flag manual entries as removed', async () => {
    const xml = `<urlset></urlset>`;

    const existing: RegistryEntry[] = [{
      url: 'https://agentskills.io/home',
      category: 'agent-skills-spec',
      source: 'agentskills',
      lastCrawled: null,
      lastmod: null,
      status: 'active',
    }];

    const { result } = await run(existing, {
      fetchFn: makeFetchFn(xml, '<p>No dates</p>'),
      statePath: join(tmpDir, 'state.json'),
    });

    expect(result.removedUrls).toEqual([]);
  });

  it('preserves registry on fetch error (Req 12.5)', async () => {
    const failFetch = async () => {
      throw new Error('Network error');
    };

    const existing: RegistryEntry[] = [{
      url: 'https://kiro.dev/docs/hooks',
      category: 'hooks',
      source: 'sitemap',
      lastCrawled: null,
      lastmod: '2025-01-15',
      status: 'active',
    }];

    const { result, updatedEntries } = await run(existing, {
      fetchFn: failFetch,
      statePath: join(tmpDir, 'state.json'),
    });

    expect(result.newUrls).toEqual([]);
    expect(result.modifiedUrls).toEqual([]);
    expect(result.removedUrls).toEqual([]);
    expect(updatedEntries).toEqual(existing);
  });

  it('records run timestamp (Req 12.6)', async () => {
    const xml = `<urlset></urlset>`;
    const statePath = join(tmpDir, 'state.json');

    const before = new Date().toISOString();
    const { result } = await run([], {
      fetchFn: makeFetchFn(xml, '<p>No dates</p>'),
      statePath,
    });
    const after = new Date().toISOString();

    expect(result.timestamp >= before).toBe(true);
    expect(result.timestamp <= after).toBe(true);

    const savedState = await loadState(statePath);
    expect(savedState.lastRun).toBe(result.timestamp);
  });

  it('records run timestamp even on error', async () => {
    const statePath = join(tmpDir, 'state.json');
    const failFetch = async () => { throw new Error('fail'); };

    await run([], { fetchFn: failFetch, statePath });

    const savedState = await loadState(statePath);
    expect(savedState.lastRun).not.toBeNull();
  });
});
