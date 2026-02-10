import type { CrawlError, CrawlResult } from './types';

// ─── Options ────────────────────────────────────────────────

export interface CrawlerOptions {
  maxRetries: number;
  concurrency: number;
  delayFn: (ms: number) => Promise<void>;
}

const defaultDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_OPTIONS: CrawlerOptions = {
  maxRetries: 3,
  concurrency: 3,
  delayFn: defaultDelay,
};

// ─── Errors ─────────────────────────────────────────────────

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly url: string,
    public readonly retryAfter: number | null,
  ) {
    super(`HTTP ${statusCode} for ${url}`);
    this.name = 'HttpError';
  }
}

// ─── Helpers ────────────────────────────────────────────────

function parseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function parseRetryAfter(value: string | null): number | null {
  if (value === null) return null;
  const seconds = Number(value);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const date = Date.parse(value);
  if (!Number.isNaN(date)) {
    const delayMs = date - Date.now();
    return delayMs > 0 ? delayMs : 0;
  }
  return null;
}

// ─── Core Functions ─────────────────────────────────────────

export async function fetchUrl(url: string): Promise<CrawlResult> {
  const response = await fetch(url);
  const html = await response.text();
  const headers = parseHeaders(response.headers);

  if (!response.ok) {
    const retryAfter = parseRetryAfter(response.headers.get('retry-after'));
    throw new HttpError(response.status, url, retryAfter);
  }

  return {
    url,
    html,
    statusCode: response.status,
    headers,
  };
}

export async function fetchWithRetry(
  url: string,
  maxRetries?: number,
  options?: Partial<Pick<CrawlerOptions, 'delayFn'>>,
): Promise<CrawlResult> {
  const retries = maxRetries ?? DEFAULT_OPTIONS.maxRetries;
  const delay = options?.delayFn ?? DEFAULT_OPTIONS.delayFn;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchUrl(url);
    } catch (err: unknown) {
      lastError = err;

      if (err instanceof HttpError) {
        // 404 → throw immediately, no retry
        if (err.statusCode === 404) {
          throw err;
        }

        // 429 → respect Retry-After header if present
        if (err.statusCode === 429 && attempt < retries) {
          const retryDelay = err.retryAfter ?? backoffDelay(attempt);
          await delay(retryDelay);
          continue;
        }
      }

      // Network errors or other HTTP errors → retry with backoff
      if (attempt < retries) {
        await delay(backoffDelay(attempt));
      }
    }
  }

  throw lastError;
}

function backoffDelay(attempt: number): number {
  // 1s, 2s, 4s exponential backoff
  return 1000 * 2 ** attempt;
}

export async function fetchBatch(
  urls: string[],
  concurrency?: number,
  options?: Partial<Pick<CrawlerOptions, 'delayFn' | 'maxRetries'>>,
): Promise<Array<CrawlResult | CrawlError>> {
  const limit = concurrency ?? DEFAULT_OPTIONS.concurrency;
  const maxRetries = options?.maxRetries ?? DEFAULT_OPTIONS.maxRetries;
  const delayFn = options?.delayFn ?? DEFAULT_OPTIONS.delayFn;

  const results: Array<CrawlResult | CrawlError> = new Array(urls.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < urls.length) {
      const idx = nextIndex;
      nextIndex++;
      const url = urls[idx];

      try {
        results[idx] = await fetchWithRetry(url, maxRetries, {
          delayFn,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results[idx] = {
          url,
          error: errorMessage,
          retryCount: maxRetries,
        };
      }
    }
  }

  const workers: Promise<void>[] = [];
  const workerCount = Math.min(limit, urls.length);
  for (let i = 0; i < workerCount; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  return results;
}
