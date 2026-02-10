import { resolve } from 'node:path';
import { fetchSitemap } from '../../../lib/changeDetector.js';
import { parseHtml } from '../../../lib/contentParser.js';
import { fetchWithRetry } from '../../../lib/crawler.js';
import { loadKB, saveKB, urlToCategory, urlToSlug, write } from '../../../lib/knowledgeBase.js';
import type { RegistryEntry, UrlCategory } from '../../../lib/types.js';
import {
  getActive,
  getByCategory,
  load,
  markFailed,
  save,
  seedAgentSkillsUrls,
  seedSitemapUrls,
  updateLastCrawled,
} from '../../../lib/urlRegistry.js';

const KB_JSON = resolve('dist/knowledge-base.json');
const REGISTRY_PATH = resolve('crawl-registry.json');
const SITEMAP_URL = 'https://kiro.dev/sitemap.xml';

export async function run(args: string[], flags: Set<string>): Promise<void> {
  const all = flags.has('--all') || args.includes('--all');
  const url = getFlagValue(args, '--url');
  const category = getFlagValue(args, '--category');

  if (!url && !all && !category) {
    console.error('Usage: kiro-wiz sync --all | --url <url> | --category <cat>');
    process.exit(1);
  }

  // Load existing KB
  try {
    await loadKB(KB_JSON);
  } catch {
    /* fresh start */
  }

  let entries: RegistryEntry[];
  try {
    entries = await load(REGISTRY_PATH);
  } catch {
    entries = [];
  }

  if (entries.length === 0 && all) {
    console.error('No registry found. Seeding from sitemap...');
    try {
      const sitemapEntries = await fetchSitemap(SITEMAP_URL);
      entries = seedSitemapUrls(
        entries,
        sitemapEntries.map((e) => ({ url: e.url, lastmod: e.lastmod })),
      );
      console.error(`  Seeded ${sitemapEntries.length} URLs from sitemap`);
    } catch (err) {
      console.error(`  Failed to fetch sitemap: ${(err as Error).message}`);
    }
    entries = seedAgentSkillsUrls(entries);
    await save(entries, REGISTRY_PATH);
  }

  let targets: RegistryEntry[];
  if (url) {
    targets = entries.filter((e) => e.url === url);
    if (targets.length === 0) {
      console.error(`URL not in registry, crawling directly: ${url}`);
      entries = await crawlUrl(url, entries);
      await save(entries, REGISTRY_PATH);
      await saveKB(KB_JSON);
      return;
    }
  } else if (category) {
    targets = getByCategory(getActive(entries), category as UrlCategory);
  } else {
    targets = getActive(entries);
  }

  console.error(`Crawling ${targets.length} URL(s)...`);
  for (const target of targets) {
    entries = await crawlUrl(target.url, entries);
  }

  await save(entries, REGISTRY_PATH);
  await saveKB(KB_JSON);
  console.error('Done.');
}

async function crawlUrl(url: string, entries: RegistryEntry[]): Promise<RegistryEntry[]> {
  console.error(`Crawling: ${url}`);
  try {
    const result = await fetchWithRetry(url);
    const parsed = parseHtml(result.html);
    write({
      slug: urlToSlug(url),
      category: urlToCategory(url),
      title: parsed.title,
      content: parsed.markdown,
      sourceUrl: url,
      lastUpdated: new Date().toISOString(),
    });
    console.error(`  ✓ Saved: ${urlToCategory(url)}/${urlToSlug(url)}`);
    return updateLastCrawled([...entries], url);
  } catch (err) {
    console.error(`  ✗ Failed: ${(err as Error).message}`);
    return markFailed([...entries], url);
  }
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
