import { resolve } from 'node:path';
import {
  load,
  save,
  getActive,
  getByCategory,
  updateLastCrawled,
  markFailed,
  seedSitemapUrls,
  seedAgentSkillsUrls,
} from '../../../lib/urlRegistry.js';
import { fetchWithRetry } from '../../../lib/crawler.js';
import { parseHtml } from '../../../lib/contentParser.js';
import { write, urlToSlug, urlToCategory, updateIndex } from '../../../lib/knowledgeBase.js';
import { fetchSitemap } from '../../../lib/changeDetector.js';
import type { RegistryEntry, UrlCategory } from '../../../lib/types.js';

const REGISTRY_PATH = resolve('knowledge-base/registry.json');
const KB_BASE_DIR = resolve('knowledge-base');
const SITEMAP_URL = 'https://kiro.dev/sitemap.xml';

export async function run(args: string[], flags: Set<string>): Promise<void> {
  const all = flags.has('--all') || args.includes('--all');
  const url = getFlagValue(args, '--url');
  const category = getFlagValue(args, '--category');

  if (!url && !all && !category) {
    console.error('Usage: kiro-wiz sync --all | --url <url> | --category <cat>');
    process.exit(1);
  }

  let entries: RegistryEntry[];
  try {
    entries = await load(REGISTRY_PATH);
  } catch {
    entries = [];
  }

  // Auto-seed on first --all run
  if (entries.length === 0 && all) {
    console.error('No registry found. Seeding from sitemap...');
    try {
      const sitemapEntries = await fetchSitemap(SITEMAP_URL);
      entries = seedSitemapUrls(entries, sitemapEntries.map(e => ({ url: e.url, lastmod: e.lastmod })));
      console.error(`  Seeded ${sitemapEntries.length} URLs from sitemap`);
    } catch (err) {
      console.error(`  Failed to fetch sitemap: ${(err as Error).message}`);
    }
    entries = seedAgentSkillsUrls(entries);
    await save(entries, REGISTRY_PATH);
  }

  let targets: RegistryEntry[];
  if (url) {
    targets = entries.filter(e => e.url === url);
    if (targets.length === 0) {
      console.error(`URL not in registry, crawling directly: ${url}`);
      entries = await crawlUrl(url, entries);
      await save(entries, REGISTRY_PATH);
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
  await updateIndex(KB_BASE_DIR);
  console.error('Done.');
}

async function crawlUrl(url: string, entries: RegistryEntry[]): Promise<RegistryEntry[]> {
  console.error(`Crawling: ${url}`);
  try {
    const result = await fetchWithRetry(url);
    const parsed = parseHtml(result.html);
    const slug = urlToSlug(url);
    const category = urlToCategory(url);

    await write({
      slug, category,
      title: parsed.title,
      content: parsed.markdown,
      sourceUrl: url,
      lastUpdated: new Date().toISOString(),
    }, KB_BASE_DIR);

    console.error(`  ✓ Saved: ${category}/${slug}.md`);
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
