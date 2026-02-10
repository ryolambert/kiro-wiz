import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkChangelog, run } from '../../lib/changeDetector.js';
import { URL_CATEGORIES } from '../../lib/types.js';
import type { RegistryEntry, SitemapEntry, UrlCategory } from '../../lib/types.js';

// ─── Shared Arbitraries ─────────────────────────────────────

const arbCategory: fc.Arbitrary<UrlCategory> = fc.constantFrom(...URL_CATEGORIES);

const arbSource = fc.constantFrom('sitemap' as const, 'agentskills' as const, 'manual' as const);

const arbStatus = fc.constantFrom('active' as const, 'stale' as const, 'failed' as const);

const arbSafeDate = fc
  .date({
    min: new Date('2020-01-01T00:00:00.000Z'),
    max: new Date('2030-12-31T00:00:00.000Z'),
    noInvalidDate: true,
  })
  .map((d) => d.toISOString().slice(0, 10));

const arbUrl = fc.integer({ min: 1, max: 9999 }).map((n) => `https://kiro.dev/docs/page-${n}`);

const arbSitemapEntry: fc.Arbitrary<SitemapEntry> = fc.record({
  url: arbUrl,
  lastmod: fc.option(arbSafeDate, { nil: null }),
  changefreq: fc.constant(null),
  priority: fc.constant(null),
});

const arbRegistryEntry: fc.Arbitrary<RegistryEntry> = fc.record({
  url: arbUrl,
  category: arbCategory,
  source: arbSource,
  lastCrawled: fc.option(arbSafeDate, { nil: null }),
  lastmod: fc.option(arbSafeDate, { nil: null }),
  status: arbStatus,
});

function buildSitemapXml(entries: readonly SitemapEntry[]): string {
  const urls = entries
    .map((e) => {
      let block = `<url><loc>${e.url}</loc>`;
      if (e.lastmod) block += `<lastmod>${e.lastmod}</lastmod>`;
      block += '</url>';
      return block;
    })
    .join('\n');
  return `<?xml version="1.0"?><urlset>${urls}</urlset>`;
}

function makeMockFetch(sitemapXml: string, changelogHtml: string) {
  return async (url: string) => {
    if (url.includes('sitemap')) {
      return { ok: true, text: async () => sitemapXml };
    }
    if (url.includes('changelog')) {
      return { ok: true, text: async () => changelogHtml };
    }
    return { ok: false, text: async () => 'Not Found' };
  };
}

// ─── Property 15: Change detection correctness ──────────────

/**
 * **Feature: kiro-knowledge-base, Property 15: Change detection correctness**
 * **Validates: Requirements 12.1, 12.2**
 *
 * For any set of sitemap entries and registry entries, `run()`
 * SHALL correctly identify new URLs (in sitemap but not registry),
 * modified URLs (lastmod changed), and removed URLs (in registry
 * from sitemap source but not in sitemap).
 */
describe('Property 15: Change detection correctness', () => {
  it('new URLs are exactly those in sitemap but not in registry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSitemapEntry, { minLength: 0, maxLength: 10 }),
        fc.array(
          arbRegistryEntry.map((e) => ({ ...e, source: 'sitemap' as const })),
          { minLength: 0, maxLength: 10 },
        ),
        async (sitemapEntries, registryEntries) => {
          // Deduplicate by URL
          const sitemapDeduped = [...new Map(sitemapEntries.map((e) => [e.url, e])).values()];
          const registryDeduped = [...new Map(registryEntries.map((e) => [e.url, e])).values()];

          const xml = buildSitemapXml(sitemapDeduped);
          const tmpDir = await mkdtemp(join(tmpdir(), 'p15-'));

          try {
            const { result } = await run(registryDeduped, {
              fetchFn: makeMockFetch(xml, '<p>No dates</p>'),
              statePath: join(tmpDir, 'state.json'),
            });

            const registryUrlSet = new Set(registryDeduped.map((e) => e.url));
            const sitemapUrlSet = new Set(sitemapDeduped.map((e) => e.url));

            // New = in sitemap but not registry
            const expectedNew = sitemapDeduped
              .filter((e) => !registryUrlSet.has(e.url))
              .map((e) => e.url);
            expect(result.newUrls).toEqual(expectedNew);

            // Removed = in registry (source=sitemap) but not in sitemap
            const expectedRemoved = registryDeduped
              .filter((e) => e.source === 'sitemap' && !sitemapUrlSet.has(e.url))
              .map((e) => e.url);
            expect(result.removedUrls).toEqual(expectedRemoved);
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it('modified URLs have newer lastmod in sitemap than registry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.tuple(arbSafeDate, arbSafeDate).chain(([d1, d2]) => {
            const older = d1 < d2 ? d1 : d2;
            const newer = d1 < d2 ? d2 : d1;
            return fc.record({
              url: arbUrl,
              registryLastmod: fc.constant(older),
              sitemapLastmod: fc.constant(newer),
            });
          }),
          { minLength: 1, maxLength: 8 },
        ),
        async (pairs) => {
          // Deduplicate
          const deduped = [...new Map(pairs.map((p) => [p.url, p])).values()];

          const sitemapEntries: SitemapEntry[] = deduped.map((p) => ({
            url: p.url,
            lastmod: p.sitemapLastmod,
            changefreq: null,
            priority: null,
          }));

          const registryEntries: RegistryEntry[] = deduped.map((p) => ({
            url: p.url,
            category: 'unknown' as const,
            source: 'sitemap' as const,
            lastCrawled: null,
            lastmod: p.registryLastmod,
            status: 'active' as const,
          }));

          const xml = buildSitemapXml(sitemapEntries);
          const tmpDir = await mkdtemp(join(tmpdir(), 'p15m-'));

          try {
            const { result } = await run(registryEntries, {
              fetchFn: makeMockFetch(xml, '<p>No dates</p>'),
              statePath: join(tmpDir, 'state.json'),
            });

            // Every entry where sitemapLastmod > registryLastmod is modified
            const expectedModified = deduped
              .filter((p) => p.sitemapLastmod > p.registryLastmod)
              .map((p) => p.url);

            expect(result.modifiedUrls).toEqual(expectedModified);
            expect(result.newUrls).toEqual([]);
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 16: Changelog timestamp comparison ────────────

/**
 * **Feature: kiro-knowledge-base, Property 16: Changelog timestamp comparison**
 * **Validates: Requirements 12.3**
 *
 * For any two ISO date strings where date1 > date2,
 * `checkChangelog()` with `since=date2` and HTML containing date1
 * SHALL report `hasNewEntries=true`. When date1 <= date2, SHALL
 * report `hasNewEntries=false`.
 */
describe('Property 16: Changelog timestamp comparison', () => {
  it('hasNewEntries=true when latest changelog date > since', async () => {
    await fc.assert(
      fc.asyncProperty(arbSafeDate, arbSafeDate, async (date1, date2) => {
        // Ensure date1 > date2 (strictly newer)
        const newer = date1 > date2 ? date1 : date2;
        const older = date1 > date2 ? date2 : date1;
        if (newer === older) return; // skip equal dates

        const html = `<h2>${newer}</h2><p>Update</p>`;
        const result = await checkChangelog('https://kiro.dev/changelog', older, { rawHtml: html });

        expect(result.hasNewEntries).toBe(true);
        expect(result.latestTimestamp).toBe(newer);
      }),
      { numRuns: 100 },
    );
  });

  it('hasNewEntries=false when latest changelog date <= since', async () => {
    await fc.assert(
      fc.asyncProperty(arbSafeDate, arbSafeDate, async (date1, date2) => {
        // Ensure date1 <= date2 (since is newer or equal)
        const older = date1 < date2 ? date1 : date2;
        const newer = date1 < date2 ? date2 : date1;

        const html = `<h2>${older}</h2><p>Old entry</p>`;
        const result = await checkChangelog('https://kiro.dev/changelog', newer, { rawHtml: html });

        expect(result.hasNewEntries).toBe(false);
        expect(result.latestTimestamp).toBe(older);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 17: Error preservation of registry state ──────

/**
 * **Feature: kiro-knowledge-base, Property 17: Error preservation of registry state**
 * **Validates: Requirements 12.5**
 *
 * For any registry entries, when `run()` encounters a fetch error,
 * the returned `updatedEntries` SHALL be identical to the input
 * registry entries (state preserved).
 */
describe('Property 17: Error preservation of registry state', () => {
  it('updatedEntries equals input entries on fetch error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbRegistryEntry, { minLength: 0, maxLength: 15 }),
        async (entries) => {
          const deduped = [...new Map(entries.map((e) => [e.url, e])).values()];

          const failFetch = async (): Promise<never> => {
            throw new Error('Network error');
          };

          const tmpDir = await mkdtemp(join(tmpdir(), 'p17-'));

          try {
            const { result, updatedEntries } = await run(deduped, {
              fetchFn: failFetch,
              statePath: join(tmpDir, 'state.json'),
            });

            // State preserved: updatedEntries identical to input
            expect(updatedEntries).toEqual(deduped);

            // Result arrays are empty on error
            expect(result.newUrls).toEqual([]);
            expect(result.modifiedUrls).toEqual([]);
            expect(result.removedUrls).toEqual([]);
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      ),
      { numRuns: 50 },
    );
  });
});

// ─── Property 18: Run result completeness ───────────────────

/**
 * **Feature: kiro-knowledge-base, Property 18: Run result completeness**
 * **Validates: Requirements 12.6**
 *
 * For any successful `run()`, the result SHALL contain a valid ISO
 * timestamp, and the arrays newUrls/modifiedUrls/removedUrls SHALL
 * be disjoint (no URL appears in more than one array).
 */
describe('Property 18: Run result completeness', () => {
  it('result has valid ISO timestamp and disjoint URL arrays', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSitemapEntry, { minLength: 0, maxLength: 10 }),
        fc.array(
          arbRegistryEntry.map((e) => ({ ...e, source: 'sitemap' as const })),
          { minLength: 0, maxLength: 10 },
        ),
        async (sitemapEntries, registryEntries) => {
          const sitemapDeduped = [...new Map(sitemapEntries.map((e) => [e.url, e])).values()];
          const registryDeduped = [...new Map(registryEntries.map((e) => [e.url, e])).values()];

          const xml = buildSitemapXml(sitemapDeduped);
          const tmpDir = await mkdtemp(join(tmpdir(), 'p18-'));

          try {
            const before = new Date().toISOString();
            const { result } = await run(registryDeduped, {
              fetchFn: makeMockFetch(xml, '<p>No dates</p>'),
              statePath: join(tmpDir, 'state.json'),
            });
            const after = new Date().toISOString();

            // Valid ISO timestamp
            const parsed = new Date(result.timestamp);
            expect(parsed.toISOString()).toBe(result.timestamp);
            expect(result.timestamp >= before).toBe(true);
            expect(result.timestamp <= after).toBe(true);

            // Disjoint arrays: no URL in more than one array
            const newSet = new Set(result.newUrls);
            const modSet = new Set(result.modifiedUrls);
            const remSet = new Set(result.removedUrls);

            for (const url of result.newUrls) {
              expect(modSet.has(url)).toBe(false);
              expect(remSet.has(url)).toBe(false);
            }
            for (const url of result.modifiedUrls) {
              expect(newSet.has(url)).toBe(false);
              expect(remSet.has(url)).toBe(false);
            }
            for (const url of result.removedUrls) {
              expect(newSet.has(url)).toBe(false);
              expect(modSet.has(url)).toBe(false);
            }
          } finally {
            await rm(tmpDir, { recursive: true, force: true });
          }
        },
      ),
      { numRuns: 50 },
    );
  });
});
