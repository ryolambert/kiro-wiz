import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchUrl,
  fetchWithRetry,
  fetchBatch,
  HttpError,
} from '../../lib/crawler.js';

// ─── Mock fetch ─────────────────────────────────────────────

const noDelay = () => Promise.resolve();

function mockFetch(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): void {
  const h = new Headers(headers);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(body),
      headers: h,
    }),
  );
}

function mockFetchSequence(
  responses: Array<{
    status: number;
    body: string;
    headers?: Record<string, string>;
  }>,
): void {
  let callIndex = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() => {
      const resp = responses[callIndex] ?? responses.at(-1)!;
      callIndex++;
      const h = new Headers(resp.headers ?? {});
      return Promise.resolve({
        ok: resp.status >= 200 && resp.status < 300,
        status: resp.status,
        text: () => Promise.resolve(resp.body),
        headers: h,
      });
    }),
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── fetchUrl ───────────────────────────────────────────────

describe('fetchUrl', () => {
  it('returns CrawlResult on 200', async () => {
    mockFetch(200, '<html>ok</html>', { 'content-type': 'text/html' });
    const result = await fetchUrl('https://example.com');
    expect(result).toEqual({
      url: 'https://example.com',
      html: '<html>ok</html>',
      statusCode: 200,
      headers: expect.objectContaining({ 'content-type': 'text/html' }),
    });
  });

  it('throws HttpError on 404', async () => {
    mockFetch(404, 'Not Found');
    await expect(fetchUrl('https://example.com/missing')).rejects.toThrow(
      HttpError,
    );
    await expect(
      fetchUrl('https://example.com/missing'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws HttpError on 500', async () => {
    mockFetch(500, 'Server Error');
    await expect(fetchUrl('https://example.com')).rejects.toThrow(
      HttpError,
    );
  });

  it('throws HttpError on 429 with Retry-After header', async () => {
    mockFetch(429, 'Too Many Requests', { 'retry-after': '5' });
    try {
      await fetchUrl('https://example.com');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).retryAfter).toBe(5000);
    }
  });
});

// ─── fetchWithRetry ─────────────────────────────────────────

describe('fetchWithRetry', () => {
  it('returns on first success', async () => {
    mockFetch(200, '<html>ok</html>');
    const result = await fetchWithRetry('https://example.com', 3, {
      delayFn: noDelay,
    });
    expect(result.statusCode).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 and succeeds', async () => {
    mockFetchSequence([
      { status: 500, body: 'fail' },
      { status: 200, body: '<html>ok</html>' },
    ]);
    const result = await fetchWithRetry('https://example.com', 3, {
      delayFn: noDelay,
    });
    expect(result.statusCode).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 404', async () => {
    mockFetch(404, 'Not Found');
    await expect(
      fetchWithRetry('https://example.com/missing', 3, {
        delayFn: noDelay,
      }),
    ).rejects.toThrow(HttpError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and respects Retry-After', async () => {
    const delaySpy = vi.fn().mockResolvedValue(undefined);
    mockFetchSequence([
      { status: 429, body: 'rate limited', headers: { 'retry-after': '2' } },
      { status: 200, body: '<html>ok</html>' },
    ]);
    const result = await fetchWithRetry('https://example.com', 3, {
      delayFn: delaySpy,
    });
    expect(result.statusCode).toBe(200);
    expect(delaySpy).toHaveBeenCalledWith(2000);
  });

  it('retries on 429 with backoff when no Retry-After', async () => {
    const delaySpy = vi.fn().mockResolvedValue(undefined);
    mockFetchSequence([
      { status: 429, body: 'rate limited' },
      { status: 200, body: '<html>ok</html>' },
    ]);
    const result = await fetchWithRetry('https://example.com', 3, {
      delayFn: delaySpy,
    });
    expect(result.statusCode).toBe(200);
    // First attempt backoff: 1000 * 2^0 = 1000
    expect(delaySpy).toHaveBeenCalledWith(1000);
  });

  it('retries on network error', async () => {
    let callCount = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('ECONNRESET'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('<html>ok</html>'),
          headers: new Headers(),
        });
      }),
    );
    const result = await fetchWithRetry('https://example.com', 3, {
      delayFn: noDelay,
    });
    expect(result.statusCode).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries', async () => {
    mockFetch(500, 'Server Error');
    await expect(
      fetchWithRetry('https://example.com', 2, { delayFn: noDelay }),
    ).rejects.toThrow(HttpError);
    // 1 initial + 2 retries = 3 calls
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('uses exponential backoff delays (1s, 2s, 4s)', async () => {
    const delaySpy = vi.fn().mockResolvedValue(undefined);
    mockFetch(500, 'Server Error');
    await expect(
      fetchWithRetry('https://example.com', 3, { delayFn: delaySpy }),
    ).rejects.toThrow();
    expect(delaySpy).toHaveBeenCalledTimes(3);
    expect(delaySpy).toHaveBeenNthCalledWith(1, 1000);
    expect(delaySpy).toHaveBeenNthCalledWith(2, 2000);
    expect(delaySpy).toHaveBeenNthCalledWith(3, 4000);
  });

  it('defaults to 3 retries', async () => {
    mockFetch(500, 'Server Error');
    await expect(
      fetchWithRetry('https://example.com', undefined, {
        delayFn: noDelay,
      }),
    ).rejects.toThrow();
    // 1 initial + 3 retries = 4 calls
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});

// ─── fetchBatch ─────────────────────────────────────────────

describe('fetchBatch', () => {
  it('fetches all URLs successfully', async () => {
    mockFetch(200, '<html>ok</html>');
    const results = await fetchBatch(
      ['https://a.com', 'https://b.com', 'https://c.com'],
      3,
      { delayFn: noDelay },
    );
    expect(results).toHaveLength(3);
    results.forEach((r) => {
      expect('html' in r).toBe(true);
    });
  });

  it('returns CrawlError for failed URLs', async () => {
    mockFetch(404, 'Not Found');
    const results = await fetchBatch(['https://missing.com'], 3, {
      delayFn: noDelay,
      maxRetries: 0,
    });
    expect(results).toHaveLength(1);
    expect('error' in results[0]).toBe(true);
  });

  it('respects concurrency limit', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 10));
        concurrent--;
        return {
          ok: true,
          status: 200,
          text: () => Promise.resolve('<html>ok</html>'),
          headers: new Headers(),
        };
      }),
    );

    await fetchBatch(
      ['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com'],
      2,
      { delayFn: noDelay },
    );
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('defaults concurrency to 3', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 10));
        concurrent--;
        return {
          ok: true,
          status: 200,
          text: () => Promise.resolve('<html>ok</html>'),
          headers: new Headers(),
        };
      }),
    );

    await fetchBatch(
      Array.from({ length: 6 }, (_, i) => `https://${i}.com`),
      undefined,
      { delayFn: noDelay },
    );
    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });

  it('handles empty URL list', async () => {
    const results = await fetchBatch([], 3, { delayFn: noDelay });
    expect(results).toEqual([]);
  });

  it('mixes successes and failures', async () => {
    let callIndex = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        callIndex++;
        if (callIndex % 2 === 0) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve('Not Found'),
            headers: new Headers(),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('<html>ok</html>'),
          headers: new Headers(),
        });
      }),
    );

    const results = await fetchBatch(
      ['https://a.com', 'https://b.com'],
      2,
      { delayFn: noDelay, maxRetries: 0 },
    );
    expect(results).toHaveLength(2);
    // First succeeds, second fails (404)
    expect('html' in results[0]).toBe(true);
    expect('error' in results[1]).toBe(true);
  });
});
