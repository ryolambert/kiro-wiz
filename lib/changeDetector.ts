import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type {
  ChangeDetectorResult,
  ChangeDetectorState,
  RegistryEntry,
  SitemapEntry,
} from './types';
import { add } from './urlRegistry';

// ─── Sitemap Parsing ────────────────────────────────────────

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

function parseSitemapXml(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g;
  let match: RegExpExecArray | null;

  while ((match = urlBlockRegex.exec(xml)) !== null) {
    const block = match[1];
    const loc = extractTag(block, 'loc');
    if (!loc) continue;

    const lastmod = extractTag(block, 'lastmod');
    const changefreq = extractTag(block, 'changefreq');
    const priorityStr = extractTag(block, 'priority');
    const priority = priorityStr !== null ? Number.parseFloat(priorityStr) : null;

    entries.push({
      url: loc,
      lastmod: lastmod ?? null,
      changefreq: changefreq ?? null,
      priority: Number.isNaN(priority) ? null : priority,
    });
  }

  return entries;
}

export interface FetchSitemapOptions {
  fetchFn?: (url: string) => Promise<{ ok: boolean; text: () => Promise<string> }>;
  rawXml?: string;
}

export async function fetchSitemap(
  url: string,
  options: FetchSitemapOptions = {},
): Promise<SitemapEntry[]> {
  if (options.rawXml !== undefined) {
    return parseSitemapXml(options.rawXml);
  }

  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const response = await fetchFn(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap from ${url}: HTTP error`);
  }
  const xml = await response.text();
  return parseSitemapXml(xml);
}

// ─── Changelog Checking ─────────────────────────────────────

export interface CheckChangelogOptions {
  fetchFn?: (url: string) => Promise<{ ok: boolean; text: () => Promise<string> }>;
  rawHtml?: string;
}

export function parseChangelogDates(html: string): string[] {
  const dates: string[] = [];
  // Match ISO date patterns (YYYY-MM-DD) or common date formats
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;
  let match: RegExpExecArray | null;

  while ((match = dateRegex.exec(html)) !== null) {
    dates.push(match[1]);
  }

  return [...new Set(dates)].sort().reverse();
}

export async function checkChangelog(
  url: string,
  since: string | null,
  options: CheckChangelogOptions = {},
): Promise<{ hasNewEntries: boolean; latestTimestamp: string | null }> {
  let html: string;

  if (options.rawHtml !== undefined) {
    html = options.rawHtml;
  } else {
    const fetchFn = options.fetchFn ?? globalThis.fetch;
    const response = await fetchFn(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch changelog from ${url}: HTTP error`);
    }
    html = await response.text();
  }

  const dates = parseChangelogDates(html);
  if (dates.length === 0) {
    return { hasNewEntries: false, latestTimestamp: null };
  }

  const latestTimestamp = dates[0];

  if (since === null) {
    return { hasNewEntries: true, latestTimestamp };
  }

  const hasNewEntries = latestTimestamp > since;
  return { hasNewEntries, latestTimestamp };
}

// ─── State Persistence ──────────────────────────────────────

const DEFAULT_STATE: ChangeDetectorState = {
  lastRun: null,
  lastChangelogTimestamp: null,
  knownUrls: [],
};

export async function loadState(path: string): Promise<ChangeDetectorState> {
  try {
    const raw = await readFile(path, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'lastRun' in parsed &&
      'lastChangelogTimestamp' in parsed &&
      'knownUrls' in parsed
    ) {
      return parsed as ChangeDetectorState;
    }
    return { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function saveState(path: string, state: ChangeDetectorState): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 2), 'utf-8');
}

// ─── Main Run Orchestrator ──────────────────────────────────

export interface RunOptions {
  sitemapUrl?: string;
  changelogUrl?: string;
  fetchFn?: (url: string) => Promise<{ ok: boolean; text: () => Promise<string> }>;
  statePath?: string;
}

const DEFAULT_SITEMAP_URL = 'https://kiro.dev/sitemap.xml';
const DEFAULT_CHANGELOG_URL = 'https://kiro.dev/changelog';

export async function run(
  registryEntries: readonly RegistryEntry[],
  options: RunOptions = {},
): Promise<{
  result: ChangeDetectorResult;
  updatedEntries: RegistryEntry[];
}> {
  const sitemapUrl = options.sitemapUrl ?? DEFAULT_SITEMAP_URL;
  const changelogUrl = options.changelogUrl ?? DEFAULT_CHANGELOG_URL;
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const statePath = options.statePath ?? 'change-stateon';

  let state: ChangeDetectorState;
  try {
    state = await loadState(statePath);
  } catch {
    state = { ...DEFAULT_STATE };
  }

  const newUrls: string[] = [];
  const modifiedUrls: string[] = [];
  const removedUrls: string[] = [];
  let updatedEntries = [...registryEntries];

  try {
    // Fetch and compare sitemap
    const sitemapEntries = await fetchSitemap(sitemapUrl, {
      fetchFn,
    });

    const registryUrlSet = new Set(registryEntries.map((e) => e.url));
    const sitemapUrlSet = new Set(sitemapEntries.map((e) => e.url));

    // Find new URLs (in sitemap but not in registry)
    for (const entry of sitemapEntries) {
      if (!registryUrlSet.has(entry.url)) {
        newUrls.push(entry.url);
        updatedEntries = add(updatedEntries, entry.url, 'sitemap', entry.lastmod);
      }
    }

    // Find modified URLs (lastmod changed)
    for (const entry of sitemapEntries) {
      if (!registryUrlSet.has(entry.url)) continue;

      const registryEntry = registryEntries.find((r) => r.url === entry.url);
      if (!registryEntry) continue;

      if (
        entry.lastmod !== null &&
        registryEntry.lastmod !== null &&
        entry.lastmod > registryEntry.lastmod
      ) {
        modifiedUrls.push(entry.url);
      }
    }

    // Find removed URLs (in registry from sitemap source but
    // not in current sitemap)
    for (const entry of registryEntries) {
      if (entry.source === 'sitemap' && !sitemapUrlSet.has(entry.url)) {
        removedUrls.push(entry.url);
      }
    }

    // Check changelog for new entries
    try {
      const changelogResult = await checkChangelog(changelogUrl, state.lastChangelogTimestamp, {
        fetchFn,
      });

      if (changelogResult.latestTimestamp !== null) {
        state.lastChangelogTimestamp = changelogResult.latestTimestamp;
      }
    } catch {
      // Changelog check failure is non-fatal; log and continue
    }
  } catch (error: unknown) {
    // On error, preserve existing registry state (Req 12.5)
    const timestamp = new Date().toISOString();
    const errorResult: ChangeDetectorResult = {
      newUrls: [],
      modifiedUrls: [],
      removedUrls: [],
      timestamp,
    };

    // Record run even on failure
    state.lastRun = timestamp;
    try {
      await saveState(statePath, state);
    } catch {
      // State save failure is non-fatal
    }

    return {
      result: errorResult,
      updatedEntries: [...registryEntries],
    };
  }

  // Record run state (Req 12.6)
  const timestamp = new Date().toISOString();
  state.lastRun = timestamp;
  state.knownUrls = [
    ...new Set([...state.knownUrls, ...newUrls, ...registryEntries.map((e) => e.url)]),
  ];

  try {
    await saveState(statePath, state);
  } catch {
    // State save failure is non-fatal
  }

  const result: ChangeDetectorResult = {
    newUrls,
    modifiedUrls,
    removedUrls,
    timestamp,
  };

  return { result, updatedEntries };
}
