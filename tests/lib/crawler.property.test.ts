import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { fetchWithRetry, HttpError } from '../../lib/crawler.js';

/**
 * **Feature: kiro-knowledge-base, Property 6: Retry behavior on failure**
 * **Validates: Requirements 2.4**
 *
 * For any maxRetries value N (1-5), when fetchWithRetry encounters
 * persistent failures, it SHALL make exactly N+1 total attempts
 * (1 initial + N retries). For 404 errors, it SHALL make exactly
 * 1 attempt regardless of maxRetries.
 */

const noDelay = () => Promise.resolve();

function makeFetchAlwaysFailing(statusCode: number) {
  let callCount = 0;
  return {
    fn: () => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: statusCode,
        text: () => Promise.resolve(`Error ${statusCode}`),
        headers: new Headers(),
      });
    },
    getCalls: () => callCount,
    reset: () => { callCount = 0; },
  };
}

function makeFetchSucceedsOnAttempt(successAttempt: number) {
  let callCount = 0;
  return {
    fn: () => {
      callCount++;
      if (callCount < successAttempt) {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server Error'),
          headers: new Headers(),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('<html>ok</html>'),
        headers: new Headers(),
      });
    },
    getCalls: () => callCount,
    reset: () => { callCount = 0; },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const arbMaxRetries = fc.integer({ min: 1, max: 5 });

describe('Property 6: Retry behavior on failure', () => {
  it('persistent 500 errors result in exactly N+1 fetch calls', async () => {
    await fc.assert(
      fc.asyncProperty(arbMaxRetries, async (maxRetries) => {
        const mock = makeFetchAlwaysFailing(500);
        vi.stubGlobal('fetch', mock.fn);

        await expect(
          fetchWithRetry('https://example.com/fail', maxRetries, {
            delayFn: noDelay,
          }),
        ).rejects.toThrow(HttpError);

        expect(mock.getCalls()).toBe(maxRetries + 1);
      }),
      { numRuns: 20 },
    );
  });

  it('404 errors result in exactly 1 fetch call regardless of maxRetries', async () => {
    await fc.assert(
      fc.asyncProperty(arbMaxRetries, async (maxRetries) => {
        const mock = makeFetchAlwaysFailing(404);
        vi.stubGlobal('fetch', mock.fn);

        await expect(
          fetchWithRetry('https://example.com/missing', maxRetries, {
            delayFn: noDelay,
          }),
        ).rejects.toThrow(HttpError);

        expect(mock.getCalls()).toBe(1);
      }),
      { numRuns: 20 },
    );
  });

  it('if fetch succeeds on attempt K (K <= N+1), total calls equal K', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbMaxRetries.chain((maxRetries) =>
          fc.tuple(
            fc.constant(maxRetries),
            fc.integer({ min: 1, max: maxRetries + 1 }),
          ),
        ),
        async ([maxRetries, successAttempt]) => {
          const mock = makeFetchSucceedsOnAttempt(successAttempt);
          vi.stubGlobal('fetch', mock.fn);

          const result = await fetchWithRetry(
            'https://example.com/retry',
            maxRetries,
            { delayFn: noDelay },
          );

          expect(result.statusCode).toBe(200);
          expect(mock.getCalls()).toBe(successAttempt);
        },
      ),
      { numRuns: 20 },
    );
  });
});

import { updateLastCrawled } from '../../lib/urlRegistry.js';
import { URL_CATEGORIES } from '../../lib/types.js';
import type { RegistryEntry, UrlCategory } from '../../lib/types.js';

/**
 * **Feature: kiro-knowledge-base, Property 7: Timestamp update after crawl**
 * **Validates: Requirements 2.5**
 *
 * For any RegistryEntry, after calling `updateLastCrawled(entries, url)`,
 * the entry's lastCrawled field SHALL be a valid ISO timestamp that is
 * >= the time before the call and <= the time after the call.
 */

const arbCategory7: fc.Arbitrary<UrlCategory> = fc.constantFrom(
  ...URL_CATEGORIES
);

const arbValidDate = fc.date({ min: new Date('2000-01-01'), max: new Date('2030-01-01') });

const arbRegistryEntry7: fc.Arbitrary<RegistryEntry> = fc.record({
  url: fc.webUrl(),
  category: arbCategory7,
  source: fc.constantFrom(
    'sitemap' as const,
    'agentskills' as const,
    'manual' as const
  ),
  lastCrawled: fc.option(arbValidDate.map((d) => d.toISOString()), {
    nil: null,
  }),
  lastmod: fc.option(arbValidDate.map((d) => d.toISOString()), {
    nil: null,
  }),
  status: fc.constantFrom(
    'active' as const,
    'stale' as const,
    'failed' as const
  ),
});

describe('Property 7: Timestamp update after crawl', () => {
  it('updateLastCrawled sets a valid ISO timestamp between before and after', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry7, { minLength: 1, maxLength: 30 }),
        fc.nat({ max: 29 }),
        (entries, indexRaw) => {
          const index = indexRaw % entries.length;
          const targetUrl = entries[index].url;

          const before = new Date().toISOString();
          const result = updateLastCrawled(entries, targetUrl);
          const after = new Date().toISOString();

          const updated = result.find((e) => e.url === targetUrl);
          expect(updated).toBeDefined();
          expect(updated!.lastCrawled).not.toBeNull();

          // lastCrawled is a valid ISO string
          const parsed = new Date(updated!.lastCrawled!);
          expect(parsed.toISOString()).toBe(updated!.lastCrawled);

          // Timestamp is >= before and <= after
          expect(updated!.lastCrawled! >= before).toBe(true);
          expect(updated!.lastCrawled! <= after).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('updateLastCrawled does not modify other entries', () => {
    fc.assert(
      fc.property(
        fc.array(arbRegistryEntry7, { minLength: 2, maxLength: 30 }),
        fc.nat({ max: 29 }),
        (entries, indexRaw) => {
          const index = indexRaw % entries.length;
          const targetUrl = entries[index].url;

          const result = updateLastCrawled(entries, targetUrl);

          // Other entries remain unchanged
          for (let i = 0; i < entries.length; i++) {
            if (entries[i].url !== targetUrl) {
              expect(result[i]).toEqual(entries[i]);
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
