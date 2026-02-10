import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { KnowledgeBaseEntry, UrlCategory } from './types';
import { categorizeUrl } from './urlRegistry';

// ─── In-memory database ─────────────────────────────────────

let db: KnowledgeBaseEntry[] = [];

/** Load KB from a JSON file. */
export async function loadKB(jsonPath: string): Promise<void> {
  const raw = await readFile(jsonPath, 'utf-8');
  db = JSON.parse(raw);
}

/** Initialize KB from data directly (for compiled binaries). */
export function initKB(data: KnowledgeBaseEntry[]): void {
  db = data;
}

/** Save KB to a JSON file. */
export async function saveKB(jsonPath: string): Promise<void> {
  await mkdir(dirname(jsonPath), { recursive: true });
  await writeFile(jsonPath, JSON.stringify(db, null, 2), 'utf-8');
}

/** Get all entries. */
export function getEntries(): KnowledgeBaseEntry[] {
  return db;
}

// ─── URL → Slug ─────────────────────────────────────────────

export function urlToSlug(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'unknown';
  }

  const path = parsed.pathname.replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);

  const hostSlug = parsed.hostname
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  if (segments.length === 0) {
    return hostSlug || 'unknown';
  }

  const last = segments[segments.length - 1];

  const slug = last
    .replace(/\.html?$/i, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  if (slug.length === 0) {
    return hostSlug || 'unknown';
  }

  return slug;
}

// ─── URL → Category ────────────────────────────────────────

export function urlToCategory(url: string): UrlCategory {
  return categorizeUrl(url);
}

// ─── Write (upsert) ────────────────────────────────────────

export function write(entry: KnowledgeBaseEntry): void {
  const idx = db.findIndex((e) => e.category === entry.category && e.slug === entry.slug);
  if (idx >= 0) {
    db[idx] = entry;
  } else {
    db.push(entry);
  }
}

// ─── Read ───────────────────────────────────────────────────

export function read(
  category: UrlCategory | string,
  slug: string,
): KnowledgeBaseEntry | null {
  return db.find((e) => e.category === category && e.slug === slug) ?? null;
}

// ─── List ───────────────────────────────────────────────────

export interface ListResult {
  category: string;
  files: string[];
}

export function list(): ListResult[] {
  const map = new Map<string, string[]>();
  for (const e of db) {
    const files = map.get(e.category) ?? [];
    files.push(e.slug);
    map.set(e.category, files);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, files]) => ({ category, files: [...new Set(files)].sort() }));
}

// ─── Search ─────────────────────────────────────────────────

export function search(term: string): KnowledgeBaseEntry[] {
  const lower = term.toLowerCase();
  return db.filter(
    (e) =>
      e.slug.includes(lower) ||
      e.category.includes(lower) ||
      e.title.toLowerCase().includes(lower) ||
      e.content.toLowerCase().includes(lower),
  );
}
