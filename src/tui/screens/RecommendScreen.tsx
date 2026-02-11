import { useState } from 'react';
import { recommend } from '../../../lib/toolingAdvisor.js';
import type { ToolRecommendation } from '../../../lib/types.js';
import { theme } from '../theme.js';

interface Props {
  onBack: () => void;
}

export function RecommendScreen({ onBack: _onBack }: Props) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ToolRecommendation[]>([]);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg={theme.primary}>
          <strong>💡 Recommend</strong>
        </text>
        <text fg={theme.dim}> — Describe your use case</text>
      </box>
      <box
        title="Use case"
        style={{
          border: true,
          borderStyle: 'rounded',
          borderColor: theme.border,
          height: 3,
          width: 60,
        }}
      >
        <input
          placeholder="e.g. enforce code review standards..."
          focused
          onInput={setInput}
          onSubmit={() => {
            if (input.trim()) setResults(recommend(input));
          }}
        />
      </box>

      {results.length > 0 && (
        <scrollbox
          style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }}
          focused
        >
          {results.map((r, i) => (
            <box key={i} style={{ marginBottom: 1 }}>
              <text fg={theme.primary}>
                <strong> 🔧 {r.toolType}</strong>
              </text>
              <text fg={theme.text}>
                {'     '}
                {r.rationale}
              </text>
            </box>
          ))}
        </scrollbox>
      )}
    </box>
  );
}
