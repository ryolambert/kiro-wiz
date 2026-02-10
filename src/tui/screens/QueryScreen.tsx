import { resolve } from 'node:path';
import { useEffect, useState } from 'react';
import { list, read } from '../../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry } from '../../../lib/types.js';

const KB_BASE_DIR = resolve('knowledge-base');

interface Props {
  onBack: () => void;
}

export function QueryScreen({ onBack: _onBack }: Props) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ category: string; files: string[] }>>([]);
  const [selected, setSelected] = useState<KnowledgeBaseEntry | null>(null);
  const [results, setResults] = useState<Array<{ category: string; file: string }>>([]);

  useEffect(() => {
    list(KB_BASE_DIR).then(setCategories);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(
        categories.flatMap((c) => c.files.map((f) => ({ category: c.category, file: f }))),
      );
    } else {
      const q = query.toLowerCase();
      setResults(
        categories.flatMap((c) =>
          c.files
            .filter((f) => f.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
            .map((f) => ({ category: c.category, file: f })),
        ),
      );
    }
  }, [query, categories]);

  if (selected) {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        <text fg="#00FFAA">
          <strong>{selected.title}</strong>
        </text>
        <text fg="#666666">
          Source: {selected.sourceUrl} | Updated: {selected.lastUpdated}
        </text>
        <text fg="#666666">ESC to go back</text>
        <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' }, marginTop: 1 }} focused>
          <text>{selected.content}</text>
        </scrollbox>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA">
        <strong>Query KB</strong> — Search knowledge base ({results.length} entries)
      </text>
      <text fg="#666666">ESC to go back</text>
      <box title="Search" style={{ border: true, height: 3, width: 50, marginTop: 1 }}>
        <input
          placeholder="Filter..."
          focused={true}
          onInput={setQuery}
          onSubmit={async () => {
            if (results.length > 0) {
              const r = results[0];
              const entry = await read(r.category as any, r.file, KB_BASE_DIR);
              if (entry) setSelected(entry);
            }
          }}
        />
      </box>
      <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' }, marginTop: 1 }}>
        {results.map((r, i) => (
          <text key={i} fg="#AAAAAA">
            {r.category}/{r.file}
          </text>
        ))}
        {results.length === 0 && (
          <text fg="#888888">No entries found. Run "kiro-wiz sync --all" to populate.</text>
        )}
      </scrollbox>
    </box>
  );
}
