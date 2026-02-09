import { useState } from 'react';
import { readFile } from 'node:fs/promises';
import { validate } from '../../../lib/configGenerator.js';
import type { ValidationResult } from '../../../lib/types.js';

interface Props { onBack: () => void; }

export function ValidateScreen({ onBack: _onBack }: Props) {
  const [filePath, setFilePath] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');

  const doValidate = async () => {
    if (!filePath.trim()) return;
    setError('');
    setResult(null);

    try {
      const raw = await readFile(filePath, 'utf-8');
      const config = JSON.parse(raw);
      if (!config.toolType) {
        setError('Config must have a "toolType" field.');
        return;
      }
      setResult(validate({ toolType: config.toolType, config }));
    } catch (err) {
      setError(`Failed: ${(err as Error).message}`);
    }
  };

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA"><strong>Validate</strong> — Check a Kiro config file</text>
      <text fg="#666666">ESC to go back</text>
      <box title="File path" style={{ border: true, height: 3, width: 60, marginTop: 1 }}>
        <input
          placeholder=".kiro/agents/my-agent.json"
          focused={true}
          onInput={setFilePath}
          onSubmit={doValidate}
        />
      </box>

      {error && <text fg="#FF4444">{error}</text>}

      {result && (
        <box style={{ marginTop: 1 }}>
          {result.isValid ? (
            <text fg="#00FF00">✓ Config is valid.</text>
          ) : (
            <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' } }}>
              <text fg="#FF4444">✗ Validation errors:</text>
              {result.errors.map((e, i) => (
                <text key={i} fg="#FFAA00">  - {e.field}: {e.message}</text>
              ))}
            </scrollbox>
          )}
        </box>
      )}
    </box>
  );
}
