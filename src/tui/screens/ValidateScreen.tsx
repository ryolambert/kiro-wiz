import { readFile } from 'node:fs/promises';
import { useState } from 'react';
import { validate } from '../../../lib/configGenerator.js';
import type { ValidationResult } from '../../../lib/types.js';
import { Spinner } from '../components/Spinner.js';
import { theme } from '../theme.js';

interface Props {
  onBack: () => void;
}

export function ValidateScreen({ onBack: _onBack }: Props) {
  const [filePath, setFilePath] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doValidate = async () => {
    if (!filePath.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg={theme.primary}>
          <strong>✅ Validate</strong>
        </text>
        <text fg={theme.dim}> — Check a Kiro config file</text>
      </box>
      <box
        title="File path"
        style={{
          border: true,
          borderStyle: 'rounded',
          borderColor: theme.border,
          height: 3,
          width: 60,
        }}
      >
        <input
          placeholder=".kiro/agents/my-agent.json"
          focused
          onInput={setFilePath}
          onSubmit={doValidate}
        />
      </box>

      {loading && <Spinner label="Validating..." />}
      {error && (
        <text fg={theme.error}>
          {'  '}❌ {error}
        </text>
      )}

      {result && (
        <box style={{ marginTop: 1 }}>
          {result.isValid ? (
            <text fg={theme.success}>{'  '}✅ Config is valid.</text>
          ) : (
            <scrollbox style={{ rootOptions: { backgroundColor: theme.surface } }}>
              <text fg={theme.error}>{'  '}❌ Validation errors:</text>
              {result.errors.map((e, i) => (
                <text key={i} fg={theme.warning}>
                  {'    '}• {e.field}: {e.message}
                </text>
              ))}
            </scrollbox>
          )}
        </box>
      )}
    </box>
  );
}
