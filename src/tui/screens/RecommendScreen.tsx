import { useState } from 'react';
import { recommend } from '../../../lib/toolingAdvisor.js';
import type { ToolRecommendation } from '../../../lib/types.js';

interface Props { onBack: () => void; }

export function RecommendScreen({ onBack: _onBack }: Props) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ToolRecommendation[]>([]);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA"><strong>Recommend</strong> — Describe your use case</text>
      <text fg="#666666">ESC to go back</text>
      <box title="Use case" style={{ border: true, height: 3, width: 60, marginTop: 1 }}>
        <input
          placeholder="e.g. enforce code review standards..."
          focused={true}
          onInput={setInput}
          onSubmit={() => {
            if (input.trim()) setResults(recommend(input));
          }}
        />
      </box>

      {results.length > 0 && (
        <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' }, marginTop: 1 }} focused>
          {results.map((r, i) => (
            <box key={i} style={{ marginBottom: 1 }}>
              <text fg="#00FFAA"><strong>{r.toolType}</strong></text>
              <text fg="#AAAAAA">  {r.rationale}</text>
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  );
}
