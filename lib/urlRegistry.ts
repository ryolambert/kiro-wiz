import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { RegistryEntry, UrlCategory } from './types';

// ─── URL Categorization ────────────────────────────────────

const KIRO_DOC_SEGMENTS: Record<string, UrlCategory> = {
  'getting-started': 'getting-started',
  editor: 'editor',
  specs: 'specs',
  chat: 'chat',
  hooks: 'hooks',
  steering: 'steering',
  skills: 'skills',
  powers: 'powers',
  mcp: 'mcp',
  guides: 'guides',
  cli: 'cli',
  'autonomous-agent': 'autonomous-agent',
  'privacy-and-security': 'privacy-and-security',
  enterprise: 'enterprise',
  'context-providers': 'context-providers',
};

export function categorizeUrl(url: string): UrlCategory {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'unknown';
  }

  const host = parsed.hostname;

  if (host === 'agentskills.io' || host === 'www.agentskills.io') {
    return 'agent-skills-spec';
  }

  if (host !== 'kiro.dev' && host !== 'www.kiro.dev') {
    return 'unknown';
  }

  const path = parsed.pathname.replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'blog') return 'blog';
  if (segments[0] === 'changelog') return 'changelog';

  if (segments[0] === 'docs' && segments.length >= 2) {
    const docSegment = segments[1];
    const category = KIRO_DOC_SEGMENTS[docSegment];
    if (category) return category;
  }

  return 'unknown';
}

// ─── Query Functions ────────────────────────────────────────

export function getAll(entries: readonly RegistryEntry[]): RegistryEntry[] {
  return [...entries];
}

export function getByCategory(
  entries: readonly RegistryEntry[],
  category: UrlCategory,
): RegistryEntry[] {
  return entries.filter((e) => e.category === category);
}

export function getActive(entries: readonly RegistryEntry[]): RegistryEntry[] {
  return entries.filter((e) => e.status !== 'stale' && e.status !== 'failed');
}

// ─── Mutation Functions (immutable) ─────────────────────────

export function add(
  entries: readonly RegistryEntry[],
  url: string,
  source: RegistryEntry['source'],
  lastmod?: string | null,
): RegistryEntry[] {
  const existing = entries.find((e) => e.url === url);
  if (existing) return [...entries];

  const entry: RegistryEntry = {
    url,
    category: categorizeUrl(url),
    source,
    lastCrawled: null,
    lastmod: lastmod ?? null,
    status: 'active',
  };

  return [...entries, entry];
}

export function markStale(entries: readonly RegistryEntry[], url: string): RegistryEntry[] {
  return entries.map((e) => (e.url === url ? { ...e, status: 'stale' as const } : e));
}

export function markFailed(entries: readonly RegistryEntry[], url: string): RegistryEntry[] {
  return entries.map((e) => (e.url === url ? { ...e, status: 'failed' as const } : e));
}

export function updateLastCrawled(entries: readonly RegistryEntry[], url: string): RegistryEntry[] {
  const now = new Date().toISOString();
  return entries.map((e) => (e.url === url ? { ...e, lastCrawled: now } : e));
}

// ─── Persistence ────────────────────────────────────────────

export async function save(entries: readonly RegistryEntry[], filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function load(filePath: string): Promise<RegistryEntry[]> {
  const raw = await readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed as RegistryEntry[];
}

// ─── Seeding ────────────────────────────────────────────────

const AGENTSKILLS_URLS = [
  'https://agentskills.io/home',
  'https://agentskills.io/what-are-skills',
  'https://agentskills.io/specification',
  'https://agentskills.io/integrate-skills',
] as const;

export function seedAgentSkillsUrls(entries: readonly RegistryEntry[]): RegistryEntry[] {
  let result = [...entries];
  for (const url of AGENTSKILLS_URLS) {
    result = add(result, url, 'agentskills');
  }
  return result;
}

export function seedSitemapUrls(
  entries: readonly RegistryEntry[],
  sitemapUrls: ReadonlyArray<{ url: string; lastmod: string | null }>,
): RegistryEntry[] {
  let result = [...entries];
  for (const { url, lastmod } of sitemapUrls) {
    result = add(result, url, 'sitemap', lastmod);
  }
  return result;
}
