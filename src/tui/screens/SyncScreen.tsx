import { useState, useCallback } from 'react';
import { resolve } from 'node:path';
import { load, save, getActive, seedSitemapUrls, seedAgentSkillsUrls, updateLastCrawled, markFailed } from '../../../lib/urlRegistry.js';
import { fetchWithRetry } from '../../../lib/crawler.js';
import { parseHtml } from '../../../lib/contentParser.js';
import { write, urlToSlug, urlToCategory, updateIndex } from '../../../lib/knowledgeBase.js';
import { fetchSitemap } from '../../../lib/changeDetector.js';
import type { RegistryEntry } from '../../../lib/types.js';

const REGISTRY_PATH = resolve('knowledge-base/registry.json');
const KB_BASE_DIR = resolve('knowledge-base');

interface Props { onBack: () => void; }

export function SyncScreen({ onBack: _onBack }: Props) {
  const [status, setStatus] = useState('Press Enter to start sync');
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
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
          entries = seedSitemapUrls(entries, sitemap.map(e => ({ url: e.url, lastmod: e.lastmod })));
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
          await write({
            slug: urlToSlug(target.url),
            category: urlToCategory(target.url),
            title: parsed.title,
            content: parsed.markdown,
            sourceUrl: target.url,
            lastUpdated: new Date().toISOString(),
          }, KB_BASE_DIR);
          entries = updateLastCrawled([...entries], target.url);
          addLog(`✓ ${urlToCategory(target.url)}/${urlToSlug(target.url)}`);
        } catch (err) {
          entries = markFailed([...entries], target.url);
          addLog(`✗ ${target.url}: ${(err as Error).message}`);
        }
      }

      await save(entries, REGISTRY_PATH);
      await updateIndex(KB_BASE_DIR);
      setStatus('Sync complete');
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  }, [running, addLog]);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA"><strong>Sync KB</strong> — Crawl kiro.dev documentation</text>
      <text fg="#666666">ESC to go back</text>
      <text fg="#FFFF00">{status}</text>

      {!running && logs.length === 0 && (
        <box title="Start" style={{ border: true, height: 3, width: 40, marginTop: 1 }}>
          <input placeholder="Press Enter to sync..." focused={true} onSubmit={doSync} />
        </box>
      )}

      {logs.length > 0 && (
        <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' } }} focused>
          {logs.map((log, i) => (
            <text key={i} fg={log.startsWith('✓') ? '#00FF00' : log.startsWith('✗') ? '#FF4444' : '#AAAAAA'}>
              {log}
            </text>
          ))}
        </scrollbox>
      )}
    </box>
  );
}
