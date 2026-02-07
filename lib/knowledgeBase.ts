import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { KnowledgeBaseEntry, UrlCategory } from './types';
import { categorizeUrl } from './urlRegistry';

// ─── Constants ──────────────────────────────────────────────

const DEFAULT_BASE_DIR = 'knowledge-base';

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

// ─── Category → Directory Name ──────────────────────────────

function categoryDir(category: UrlCategory): string {
  if (category === 'unknown') return 'uncategorized';
  return category;
}

// ─── Write ──────────────────────────────────────────────────

export async function write(
  entry: KnowledgeBaseEntry,
  baseDir: string = DEFAULT_BASE_DIR
): Promise<string> {
  const dir = join(baseDir, categoryDir(entry.category));
  await mkdir(dir, { recursive: true });

  const filename = `${entry.slug}.md`;
  const filePath = join(dir, filename);

  const frontmatter = [
    '---',
    `title: "${entry.title.replace(/"/g, '\\"')}"`,
    `sourceUrl: "${entry.sourceUrl}"`,
    `category: "${entry.category}"`,
    `lastUpdated: "${entry.lastUpdated}"`,
    '---',
    '',
  ].join('\n');

  const content = frontmatter + entry.content;
  await writeFile(filePath, content, 'utf-8');

  return filePath;
}

// ─── Read ───────────────────────────────────────────────────

export async function read(
  category: UrlCategory,
  slug: string,
  baseDir: string = DEFAULT_BASE_DIR
): Promise<KnowledgeBaseEntry | null> {
  const dir = categoryDir(category);
  const filePath = join(baseDir, dir, `${slug}.md`);

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }

  return parseEntry(raw, slug, category);
}

// ─── List ───────────────────────────────────────────────────

export interface ListResult {
  category: string;
  files: string[];
}

export async function list(
  baseDir: string = DEFAULT_BASE_DIR
): Promise<ListResult[]> {
  let dirs: string[];
  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }

  const results: ListResult[] = [];

  for (const dir of dirs) {
    const dirPath = join(baseDir, dir);
    let files: string[];
    try {
      const dirEntries = await readdir(dirPath);
      files = dirEntries
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''))
        .sort();
    } catch {
      files = [];
    }

    if (files.length > 0) {
      results.push({ category: dir, files });
    }
  }

  return results;
}

// ─── Update Index ───────────────────────────────────────────

export async function updateIndex(
  baseDir: string = DEFAULT_BASE_DIR
): Promise<void> {
  const categories = await list(baseDir);

  const lines: string[] = [
    '# Knowledge Base Index',
    '',
  ];

  for (const cat of categories) {
    lines.push(`## ${formatCategoryTitle(cat.category)}`);
    lines.push('');
    for (const file of cat.files) {
      const title = formatFileTitle(file);
      lines.push(`- [${title}](${cat.category}/${file}.md)`);
    }
    lines.push('');
  }

  const indexPath = join(baseDir, 'index.md');
  await mkdir(baseDir, { recursive: true });
  await writeFile(indexPath, lines.join('\n'), 'utf-8');
}

// ─── Helpers ────────────────────────────────────────────────

function parseEntry(
  raw: string,
  slug: string,
  category: UrlCategory
): KnowledgeBaseEntry {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);

  let title = slug;
  let sourceUrl = '';
  let lastUpdated = '';
  let content = raw;

  if (fmMatch) {
    const fm = fmMatch[1];
    title = extractFmField(fm, 'title') ?? slug;
    sourceUrl = extractFmField(fm, 'sourceUrl') ?? '';
    lastUpdated = extractFmField(fm, 'lastUpdated') ?? '';
    content = raw.slice(fmMatch[0].length);
  }

  return {
    slug,
    category,
    title,
    content,
    sourceUrl,
    lastUpdated,
  };
}

function extractFmField(
  fm: string,
  field: string
): string | undefined {
  const re = new RegExp(`^${field}:\\s*"?(.*?)"?\\s*$`, 'm');
  const match = fm.match(re);
  return match ? match[1] : undefined;
}

function formatCategoryTitle(category: string): string {
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatFileTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
