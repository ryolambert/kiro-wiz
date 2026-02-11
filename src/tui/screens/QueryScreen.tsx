import { useEffect, useState } from 'react';
import { list, read, search } from '../../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry } from '../../../lib/types.js';
import { Spinner } from '../components/Spinner.js';
import { theme } from '../theme.js';

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
          <text fg={theme.primary}>
            <strong>📄 {selected.title}</strong>
          </text>
          <text fg={theme.dim}>
            {'\n'} Source: {selected.sourceUrl} | Updated: {selected.lastUpdated}
          </text>
        </box>
        <scrollbox style={{ rootOptions: { backgroundColor: theme.surface } }} focused>
          <text fg={theme.text}>{selected.content}</text>
        </scrollbox>
      </box>
    );
  }

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg={theme.primary}>
          <strong>📖 Query KB</strong>
        </text>
        <text fg={theme.dim}> — Search knowledge base ({results.length} entries)</text>
      </box>

      {loading ? (
        <Spinner label="Loading knowledge base..." />
      ) : (
        <>
          <box
            title="Search"
            style={{
              border: true,
              borderStyle: 'rounded',
              borderColor: theme.border,
              height: 3,
              width: 50,
            }}
          >
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
          <scrollbox style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }}>
            {results.map((r, i) => (
              <text key={i} fg={theme.text}>
                {'  '}
                {r.category}/{r.file}
              </text>
            ))}
            {results.length === 0 && (
              <text fg={theme.textMuted}>
                {'  '}No entries found. Run "kiro-wiz sync --all" to populate.
              </text>
            )}
          </scrollbox>
        </>
      )}
    </box>
  );
}
