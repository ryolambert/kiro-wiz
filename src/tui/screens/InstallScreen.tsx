import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SelectOption } from '@opentui/core';
import { useCallback, useState } from 'react';
import { Spinner } from '../components/Spinner.js';
import { theme } from '../theme.js';

type Step = 'scope' | 'preview' | 'installing' | 'done';

const INSTALL_DIR = resolve(fileURLToPath(import.meta.url), '../../../templates/_install');

const SCOPE_OPTIONS: SelectOption[] = [
  { name: '📁  Local', description: 'Install to .kiro/ in current directory', value: 'local' },
  { name: '🌐  Global', description: 'Install to ~/.kiro/', value: 'global' },
];

interface Props {
  onBack: () => void;
}

async function collectFiles(
  dir: string,
  prefix: string,
): Promise<Array<{ relativePath: string; content: string }>> {
  const results: Array<{ relativePath: string; content: string }> = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(join(dir, entry.name), rel)));
    } else {
      results.push({ relativePath: rel, content: await readFile(join(dir, entry.name), 'utf-8') });
    }
  }
  return results;
}

export function InstallScreen({ onBack: _onBack }: Props) {
  const [step, setStep] = useState<Step>('scope');
  const [scope, setScope] = useState<'local' | 'global'>('local');
  const [files, setFiles] = useState<Array<{ relativePath: string; content: string }>>([]);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const targetRoot = useCallback(
    (s: string) =>
      s === 'global' ? join(process.env.HOME ?? '~', '.kiro') : join(process.cwd(), '.kiro'),
    [],
  );

  const doPreview = useCallback(async (s: 'local' | 'global') => {
    try {
      const collected = await collectFiles(INSTALL_DIR, '');
      setFiles(collected);
      setScope(s);
      setStep('preview');
    } catch (err) {
      setError(`Failed to read templates: ${(err as Error).message}`);
      setStep('done');
    }
  }, []);

  const doInstall = useCallback(async () => {
    setStep('installing');
    const root = targetRoot(scope);
    const lines: string[] = [];
    for (const { relativePath, content } of files) {
      const dest = join(root, relativePath);
      try {
        await readFile(dest, 'utf-8');
        lines.push(`⊘ ${relativePath} (exists, skipped)`);
        continue;
      } catch {
        /* doesn't exist, proceed */
      }
      try {
        await mkdir(resolve(dest, '..'), { recursive: true });
        await writeFile(dest, content, 'utf-8');
        lines.push(`✓ ${relativePath}`);
      } catch (err) {
        lines.push(`✗ ${relativePath}: ${(err as Error).message}`);
      }
    }
    setResults(lines);
    setStep('done');
  }, [files, scope, targetRoot]);

  const header = (subtitle: string) => (
    <box style={{ marginBottom: 1 }}>
      <text fg={theme.primary}>
        <strong>📦 Install</strong>
      </text>
      <text fg={theme.dim}> — {subtitle}</text>
    </box>
  );

  if (step === 'scope') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Select install scope')}
        <box style={{ border: true, borderStyle: 'rounded', borderColor: theme.border, height: 6 }}>
          <select
            style={{ height: 4 }}
            options={SCOPE_OPTIONS}
            focused
            selectedBackgroundColor={theme.surfaceAlt}
            selectedTextColor={theme.primary}
            onSelect={(_i, opt) => {
              if (opt?.value) doPreview(opt.value as 'local' | 'global');
            }}
          />
        </box>
      </box>
    );
  }

  if (step === 'preview') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header(`Preview (${scope} → ${targetRoot(scope)})`)}
        <scrollbox
          style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }}
          focused
        >
          {files.map((f, i) => (
            <text key={i} fg={theme.text}>
              {'  📄 '}
              {f.relativePath}
            </text>
          ))}
        </scrollbox>
        <box
          title="Confirm"
          style={{
            border: true,
            borderStyle: 'rounded',
            borderColor: theme.border,
            height: 3,
            marginTop: 1,
          }}
        >
          <input placeholder="Press Enter to install..." focused onSubmit={doInstall} />
        </box>
      </box>
    );
  }

  if (step === 'installing') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Installing')}
        <Spinner label="Installing pre-built configs..." />
      </box>
    );
  }

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      {error ? (
        <text fg={theme.error}>
          <strong>❌ {error}</strong>
        </text>
      ) : (
        <text fg={theme.success}>
          <strong>✅ Install complete!</strong>
        </text>
      )}
      <scrollbox style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }} focused>
        {results.map((line, i) => (
          <text
            key={i}
            fg={
              line.startsWith('✓')
                ? theme.success
                : line.startsWith('✗')
                  ? theme.error
                  : theme.warning
            }
          >
            {'  '}
            {line}
          </text>
        ))}
      </scrollbox>
      <text fg={theme.textMuted}>{'\n'} Press ESC to return to menu</text>
    </box>
  );
}
