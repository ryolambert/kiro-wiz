#!/usr/bin/env npx tsx

import { resolve } from 'node:path';
import { fetchSitemap } from '../lib/changeDetector.js';
import { parseHtml } from '../lib/contentParser.js';
import { fetchWithRetry } from '../lib/crawler.js';
import { urlToCategory, urlToSlug, write } from '../lib/knowledgeBase.js';
import type { RegistryEntry, UrlCategory } from '../lib/types.js';
import {
  getActive,
  getByCategory,
  load,
  markFailed,
  save,
  seedAgentSkillsUrls,
  seedSitemapUrls,
  updateLastCrawled,
} from '../lib/urlRegistry.js';

const REGISTRY_PATH = resolve('knowledge-base/registry.json');
const KB_BASE_DIR = resolve('knowledge-base');

function parseArgs(argv: string[]): {
  url: string | null;
  all: boolean;
  category: string | null;
} {
  let url: string | null = null;
  let all = false;
  let category: string | null = null;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--url' && i + 1 < argv.length) {
      url = argv[++i];
    } else if (arg === '--all') {
      all = true;
    } else if (arg === '--category' && i + 1 < argv.length) {
      category = argv[++i];
    }
  }

  return { url, all, category };
}

async function crawlUrl(url: string, entries: readonly RegistryEntry[]): Promise<RegistryEntry[]> {
  console.error(`Crawling: ${url}`);
  try {
    const result = await fetchWithRetry(url);
    const parsed = parseHtml(result.html);
    const slug = urlToSlug(url);
    const category = urlToCategory(url);

    await write(
      {
        slug,
        category,
        title: parsed.title,
        content: parsed.markdown,
        sourceUrl: url,
        lastUpdated: new Date().toISOString(),
      },
      KB_BASE_DIR,
    );

    console.error(`  ✓ Saved: ${category}/${slug}.md`);
    return updateLastCrawled([...entries], url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ Failed: ${msg}`);
    return markFailed([...entries], url);
  }
}

async function main(): Promise<void> {
  const { url, all, category } = parseArgs(process.argv);

  if (!url && !all && !category) {
    console.error('Usage: crawl.ts --url <url> | --all | --category <cat>');
    process.exit(1);
  }

  let entries: RegistryEntry[];
  try {
    entries = await load(REGISTRY_PATH);
  } catch {
    entries = [];
  }

  // Auto-seed registry on first run with --all
  if (entries.length === 0 && all) {
    console.error('No registry found. Seeding from sitemap...');
    const SITEMAP_URL = 'https://kiro.dev/sitemap.xml';
    try {
      const sitemapEntries = await fetchSitemap(SITEMAP_URL);
      entries = seedSitemapUrls(
        entries,
        sitemapEntries.map((e) => ({
          url: e.url,
          lastmod: e.lastmod,
        })),
      );
      console.error(`  Seeded ${sitemapEntries.length} URLs from sitemap`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  Failed to fetch sitemap: ${msg}`);
    }
    entries = seedAgentSkillsUrls(entries);
    console.error(`  Seeded Agent Skills URLs (total: ${entries.length})`);
    await save(entries, REGISTRY_PATH);
  }

  let targets: RegistryEntry[];

  if (url) {
    targets = entries.filter((e) => e.url === url);
    if (targets.length === 0) {
      console.error(`URL not in registry, crawling directly: ${url}`);
      const result = await crawlUrl(url, entries);
      await save(result, REGISTRY_PATH);
      return;
    }
  } else if (category) {
    targets = getByCategory(getActive(entries), category as UrlCategory);
  } else {
    targets = getActive(entries);
  }

  console.error(`Crawling ${targets.length} URL(s)...`);

  let current = entries;
  for (const target of targets) {
    current = await crawlUrl(target.url, current);
  }

  await save(current, REGISTRY_PATH);
  console.error('Done.');
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
