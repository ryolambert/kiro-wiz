import { resolve } from 'node:path';
import { useCallback, useState } from 'react';
import { fetchSitemap } from '../../../lib/changeDetector.js';
import { parseHtml } from '../../../lib/contentParser.js';
import { fetchWithRetry } from '../../../lib/crawler.js';
import { saveKB, urlToCategory, urlToSlug, write } from '../../../lib/knowledgeBase.js';
import type { RegistryEntry } from '../../../lib/types.js';
import {
  getActive,
  load,
  markFailed,
  save,
  seedAgentSkillsUrls,
  seedSitemapUrls,
  updateLastCrawled,
} from '../../../lib/urlRegistry.js';
import { Spinner } from '../components/Spinner.js';
import { theme } from '../theme.js';

const REGISTRY_PATH = resolve('crawl-registry.json');
const KB_JSON = resolve('dist/knowledge-base.json');

interface Props {
  onBack: () => void;
}

export function SyncScreen({ onBack: _onBack }: Props) {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const doSync = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setStatus('Syncing...');
    setLogs([]);

    try {
      let entries: RegistryEntry[];
      try {
        entries = await load(REGISTRY_PATH);
      } catch {
        entries = [];
      }

      if (entries.length === 0) {
        addLog('No registry found. Seeding from sitemap...');
        try {
          const sitemap = await fetchSitemap('https://kiro.dev/sitemap.xml');
          entries = seedSitemapUrls(
            entries,
            sitemap.map((e) => ({ url: e.url, lastmod: e.lastmod })),
          );
          addLog(`Seeded ${sitemap.length} URLs from sitemap`);
        } catch (err) {
          addLog(`Sitemap failed: ${(err as Error).message}`);
        }
        entries = seedAgentSkillsUrls(entries);
        await save(entries, REGISTRY_PATH);
      }

      const targets = getActive(entries);
      addLog(`Crawling ${targets.length} URL(s)...`);

      for (const target of targets) {
        try {
          const result = await fetchWithRetry(target.url);
          const parsed = parseHtml(result.html);
          write({
            slug: urlToSlug(target.url),
            category: urlToCategory(target.url),
            title: parsed.title,
            content: parsed.markdown,
            sourceUrl: target.url,
            lastUpdated: new Date().toISOString(),
          });
          entries = updateLastCrawled([...entries], target.url);
          addLog(`✓ ${urlToCategory(target.url)}/${urlToSlug(target.url)}`);
        } catch (err) {
          entries = markFailed([...entries], target.url);
          addLog(`✗ ${target.url}: ${(err as Error).message}`);
        }
      }

      await save(entries, REGISTRY_PATH);
      await saveKB(KB_JSON);
      setStatus('Sync complete');
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  }, [running, addLog]);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg={theme.primary}>
          <strong>🔄 Sync KB</strong>
        </text>
        <text fg={theme.dim}> — Crawl kiro.dev documentation</text>
      </box>

      {running && <Spinner label={status} />}
      {!running && status && (
        <text fg={status.startsWith('Error') ? theme.error : theme.success}>
          {'  '}
          {status}
        </text>
      )}

      {!running && logs.length === 0 && (
        <box
          title="Start"
          style={{
            border: true,
            borderStyle: 'rounded',
            borderColor: theme.border,
            height: 3,
            width: 40,
            marginTop: 1,
          }}
        >
          <input placeholder="Press Enter to sync..." focused onSubmit={doSync} />
        </box>
      )}

      {logs.length > 0 && (
        <scrollbox
          style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }}
          focused
        >
          {logs.map((log, i) => (
            <text
              key={i}
              fg={
                log.startsWith('✓') ? theme.success : log.startsWith('✗') ? theme.error : theme.text
              }
            >
              {'  '}
              {log}
            </text>
          ))}
        </scrollbox>
      )}
    </box>
  );
}
