import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { add } from '../../lib/urlRegistry.js';
import { URL_CATEGORIES } from '../../lib/types.js';
import type { RegistryEntry, UrlCategory } from '../../lib/types.js';

/**
 * **Feature: kiro-knowledge-base, Property 1: Registry entry completeness**
 * **Validates: Requirements 1.3**
 *
 * For any valid URL string and any valid source, when `add()` is called,
 * the resulting entry SHALL have all required RegistryEntry fields with
 * correct types and initial values.
 */

const SOURCE_VALUES = ['sitemap', 'agentskills', 'manual'] as const;

const arbSource = fc.constantFrom(...SOURCE_VALUES);

const arbKiroDocUrl = fc.constantFrom(
  'getting-started',
  'editor',
  'specs',
  'chat',
  'hooks',
  'steering',
  'skills',
  'powers',
  'mcp',
  'guides',
  'cli',
  'autonomous-agent',
  'privacy-and-security',
  'enterprise',
  'context-providers'
).map((seg) => `https://kiro.dev/docs/${seg}/page`);

const arbBlogUrl = fc.constant('https://kiro.dev/blog/some-post');
const arbChangelogUrl = fc.constant('https://kiro.dev/changelog/v1');
const arbAgentSkillsUrl = fc.constantFrom(
  'https://agentskills.io/home',
  'https://agentskills.io/specification',
  'https://agentskills.io/what-are-skills',
  'https://agentskills.io/integrate-skills'
);

const arbUrl = fc.oneof(
  arbKiroDocUrl,
  arbBlogUrl,
  arbChangelogUrl,
  arbAgentSkillsUrl
);

describe('Property 1: Registry entry completeness', () => {
  it('add() produces a complete RegistryEntry with correct fields', () => {
    fc.assert(
      fc.property(arbUrl, arbSource, (url, source) => {
        const result = add([], url, source);

        expect(result).toHaveLength(1);

        const entry: RegistryEntry = result[0];

        // url matches input
        expect(entry.url).toBe(url);

        // category is a valid UrlCategory
        expect(URL_CATEGORIES).toContain(entry.category);

        // source matches input
        expect(entry.source).toBe(source);

        // lastCrawled is initially null
        expect(entry.lastCrawled).toBeNull();

        // lastmod field exists (null when not provided)
        expect(entry).toHaveProperty('lastmod');
        expect(entry.lastmod).toBeNull();

        // status is 'active'
        expect(entry.status).toBe('active');
      }),
      { numRuns: 20 }
    );
  });

  it('add() preserves lastmod when provided', () => {
    const arbLastmod = fc
      .integer({ min: 1577836800000, max: 1893456000000 })
      .map((ms) => new Date(ms).toISOString());

    fc.assert(
      fc.property(arbUrl, arbSource, arbLastmod, (url, source, lastmod) => {
        const result = add([], url, source, lastmod);
        const entry = result[0];

        expect(entry.lastmod).toBe(lastmod);
        expect(entry.lastCrawled).toBeNull();
        expect(entry.status).toBe('active');
      }),
      { numRuns: 20 }
    );
  });

  it('category is always a valid UrlCategory value', () => {
    const validCategories: ReadonlySet<string> = new Set(URL_CATEGORIES);

    fc.assert(
      fc.property(arbUrl, arbSource, (url, source) => {
        const result = add([], url, source);
        const entry = result[0];

        expect(validCategories.has(entry.category)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });
});

import { getByCategory } from '../../lib/urlRegistry.js';

/**
 * **Feature: kiro-knowledge-base, Property 2: Category filtering correctness**
 * **Validates: Requirements 1.4**
 *
 * For any list of RegistryEntry objects and any valid UrlCategory,
 * `getByCategory(entries, category)` SHALL return only entries whose
 * category matches the requested category, and SHALL return ALL such
 * entries.
 */

const arbCategory: fc.Arbitrary<UrlCategory> = fc.constantFrom(
  ...URL_CATEGORIES
);

const safeIsoDate = fc
  .integer({ min: 946684800000, max: 4102444799999 })
  .map((ms) => new Date(ms).toISOString());

const arbRegistryEntry: fc.Arbitrary<RegistryEntry> = fc.record({
  url: fc.webUrl(),
  category: arbCategory,
  source: fc.constantFrom(
    'sitemap' as const,
    'agentskills' as const,
    'manual' as const
  ),
  lastCrawled: fc.option(safeIsoDate, { nil: null }),
  lastmod: fc.option(safeIsoDate, { nil: null }),
  status: fc.constantFrom(
    'active' as const,
    'stale' as const,
    'failed' as const
  ),
});

describe('Property 2: Category filtering correctness', () => {
  it('getByCategory returns only entries matching the requested category', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 0, maxLength: 50 }),
        arbCategory,
        (entries, category) => {
          const result = getByCategory(entries, category);

          // Every returned entry has the requested category
          for (const entry of result) {
            expect(entry.category).toBe(category);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getByCategory returns ALL entries with the requested category', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 0, maxLength: 50 }),
        arbCategory,
        (entries, category) => {
          const result = getByCategory(entries, category);
          const expectedCount = entries.filter(
            (e) => e.category === category
          ).length;

          expect(result).toHaveLength(expectedCount);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('getByCategory result is a subset of the original entries', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 0, maxLength: 50 }),
        arbCategory,
        (entries, category) => {
          const result = getByCategory(entries, category);

          // Every returned entry exists in the original array
          for (const entry of result) {
            expect(entries).toContainEqual(entry);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});

import { getActive, markStale, markFailed } from '../../lib/urlRegistry.js';

/**
 * **Feature: kiro-knowledge-base, Property 3: Stale URL exclusion invariant**
 * **Validates: Requirements 1.5**
 *
 * For any list of RegistryEntry objects, `getActive(entries)` SHALL never
 * return entries with status 'stale' or 'failed'. Additionally, for any
 * entry that is marked stale via `markStale()`, it SHALL not appear in
 * `getActive()` results.
 */

describe('Property 3: Stale URL exclusion invariant', () => {
  it('getActive never returns stale or failed entries', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 0, maxLength: 50 }),
        (entries) => {
          const result = getActive(entries);

          for (const entry of result) {
            expect(entry.status).not.toBe('stale');
            expect(entry.status).not.toBe('failed');
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it('after markStale, the URL is excluded from getActive', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 1, maxLength: 50 }),
        (entries) => {
          // Pick a random entry to mark stale
          const targetUrl = entries[0].url;
          const updated = markStale(entries, targetUrl);
          const active = getActive(updated);

          // No active entry should have the stale URL
          for (const entry of active) {
            if (entry.url === targetUrl) {
              expect(entry.status).not.toBe('stale');
            }
          }

          // Verify the target was actually marked stale
          const staleEntry = updated.find((e) => e.url === targetUrl);
          expect(staleEntry?.status).toBe('stale');

          // Verify stale entry is not in active results
          const activeUrls = active.filter((e) => e.url === targetUrl);
          expect(activeUrls).toHaveLength(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('after markFailed, the URL is excluded from getActive', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry, { minLength: 1, maxLength: 50 }),
        (entries) => {
          // Pick a random entry to mark failed
          const targetUrl = entries[0].url;
          const updated = markFailed(entries, targetUrl);
          const active = getActive(updated);

          // No active entry should have the failed URL
          for (const entry of active) {
            if (entry.url === targetUrl) {
              expect(entry.status).not.toBe('failed');
            }
          }

          // Verify the target was actually marked failed
          const failedEntry = updated.find((e) => e.url === targetUrl);
          expect(failedEntry?.status).toBe('failed');

          // Verify failed entry is not in active results
          const activeUrls = active.filter((e) => e.url === targetUrl);
          expect(activeUrls).toHaveLength(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});
