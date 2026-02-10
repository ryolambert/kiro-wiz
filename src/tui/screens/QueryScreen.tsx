import { useEffect, useState } from 'react';
import { list, read, search } from '../../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry } from '../../../lib/types.js';
import { Spinner } from '../components/Spinner.js';

interface Props {
  onBack: () => void;
}

export function QueryScreen({ onBack: _onBack }: Props) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ category: string; files: string[] }>>([]);
  const [selected, setSelected] = useState<KnowledgeBaseEntry | null>(null);
  const [results, setResults] = useState<Array<{ category: string; file: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategories(list());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(
        categories.flatMap((c) => c.files.map((f) => ({ category: c.category, file: f }))),
      );
    } else {
      const matches = search(query);
      setResults(matches.map((e) => ({ category: e.category, file: e.slug })));
    }
  }, [query, categories]);

  if (selected) {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        <box style={{ marginBottom: 1 }}>
          <text fg="#00FFAA">
            <strong>📄 {selected.title}</strong>
          </text>
          <text fg="#555555">
            {'\n'}  Source: {selected.sourceUrl} | Updated: {selected.lastUpdated}
          </text>
          <text fg="#444444">{'\n'}  ESC to go back</text>
        </box>
        <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' } }} focused>
          <text>{selected.content}</text>
        </scrollbox>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg="#00FFAA">
          <strong>📖 Query KB</strong>
        </text>
        <text fg="#555555"> — Search knowledge base ({results.length} entries)</text>
        <text fg="#444444">{'\n'}  ESC to go back</text>
      </box>

      {loading ? (
        <Spinner label="Loading knowledge base..." />
      ) : (
        <>
          <box title="Search" style={{ border: true, borderStyle: 'rounded', borderColor: '#333333', height: 3, width: 50 }}>
            <input
              placeholder="Filter..."
              focused
              onInput={setQuery}
              onSubmit={() => {
                if (results.length > 0) {
                  const r = results[0];
                  const entry = read(r.category as any, r.file);
                  if (entry) setSelected(entry);
                }
              }}
            />
          </box>
          <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' }, marginTop: 1 }}>
            {results.map((r, i) => (
              <text key={i} fg="#AAAAAA">
                {'  '}{r.category}/{r.file}
              </text>
            ))}
            {results.length === 0 && (
              <text fg="#666666">{'  '}No entries found. Run "kiro-wiz sync --all" to populate.</text>
            )}
          </scrollbox>
        </>
      )}
    </box>
  );
}
