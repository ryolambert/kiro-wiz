import type { SelectOption } from '@opentui/core';
import { useCallback, useState } from 'react';
import { install, previewInstall } from '../../../lib/fileInstaller.js';
import { scaffoldTool } from '../../../lib/scaffoldingEngine.js';
import { KIRO_TOOL_TYPES } from '../../../lib/types.js';
import type { KiroToolType, ScaffoldResult } from '../../../lib/types.js';
import { Spinner } from '../components/Spinner.js';
import { theme } from '../theme.js';

type Step = 'type' | 'name' | 'desc' | 'scope' | 'preview' | 'installing' | 'done';

const TYPE_OPTIONS: SelectOption[] = KIRO_TOOL_TYPES.map((t) => ({
  name: t,
  description: `Scaffold a ${t}`,
  value: t,
}));

const SCOPE_OPTIONS: SelectOption[] = [
  { name: 'workspace', description: 'Install to .kiro/ in current directory', value: 'workspace' },
  { name: 'global', description: 'Install to ~/.kiro/', value: 'global' },
];

interface Props {
  onBack: () => void;
}

export function ScaffoldScreen({ onBack }: Props) {
  const [step, setStep] = useState<Step>('type');
  const [toolType, setToolType] = useState<KiroToolType | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [scope, setScope] = useState<'workspace' | 'global'>('workspace');
  const [result, setResult] = useState<ScaffoldResult | null>(null);
  const [status, setStatus] = useState('');

  const doPreview = useCallback(() => {
    if (!toolType || !name) return;
    const r = scaffoldTool(toolType, { name, description: desc || `${name} ${toolType}` });
    setResult(r);
    setStep('preview');
  }, [toolType, name, desc]);

  const doInstall = useCallback(async () => {
    if (!result) return;
    setStep('installing');
    const installed = await install(result, { scope });
    const lines = installed.installedFiles.map((f) => `✓ ${f.relativePath}`);
    const errs = installed.errors.map((e) => `✗ ${e.path}: ${e.message}`);
    setStatus([...lines, ...errs].join('\n'));
    setStep('done');
  }, [result, scope]);

  const header = (subtitle: string) => (
    <box style={{ marginBottom: 1 }}>
      <text fg={theme.primary}>
        <strong>🔧 Scaffold{toolType ? ` ${toolType}` : ''}</strong>
      </text>
      <text fg={theme.dim}> — {subtitle}</text>
    </box>
  );

  if (step === 'type') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Select tool type')}
        <box style={{ border: true, borderStyle: 'rounded', borderColor: theme.border, height: 14 }}>
          <select
            style={{ height: 12 }}
            options={TYPE_OPTIONS}
            focused
            selectedBackgroundColor={theme.surfaceAlt}
            selectedTextColor={theme.primary}
            onSelect={(_i, opt) => {
              if (opt?.value) {
                setToolType(opt.value as KiroToolType);
                setStep('name');
              }
            }}
          />
        </box>
      </box>
    );
  }

  if (step === 'name') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Enter name')}
        <box
          title="Name"
          style={{
            border: true,
            borderStyle: 'rounded',
            borderColor: theme.border,
            height: 3,
            width: 50,
          }}
        >
          <input
            placeholder="my-tool-name"
            focused
            onInput={setName}
            onSubmit={() => {
              if (name.trim()) setStep('desc');
            }}
          />
        </box>
      </box>
    );
  }

  if (step === 'desc') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Enter description')}
        <box
          title="Description"
          style={{
            border: true,
            borderStyle: 'rounded',
            borderColor: theme.border,
            height: 3,
            width: 60,
          }}
        >
          <input
            placeholder="Brief description..."
            focused
            onInput={setDesc}
            onSubmit={() => setStep('scope')}
          />
        </box>
      </box>
    );
  }

  if (step === 'scope') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Install scope')}
        <box style={{ border: true, borderStyle: 'rounded', borderColor: theme.border, height: 6 }}>
          <select
            style={{ height: 4 }}
            options={SCOPE_OPTIONS}
            focused
            selectedBackgroundColor={theme.surfaceAlt}
            selectedTextColor={theme.primary}
            onSelect={(_i, opt) => {
              if (opt?.value) {
                setScope(opt.value as 'workspace' | 'global');
                doPreview();
              }
            }}
          />
        </box>
      </box>
    );
  }

  if (step === 'preview' && result) {
    const preview = previewInstall(result, { scope });
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Preview')}
        <text fg={theme.dim}>
          Files to create ({preview.scope} → {preview.targetRoot}):
        </text>
        <scrollbox style={{ rootOptions: { backgroundColor: theme.surface }, marginTop: 1 }} focused>
          {preview.installedFiles.map((f, i) => (
            <text key={i} fg={theme.text}>
              {'  📄 '}
              {f.relativePath}
            </text>
          ))}
        </scrollbox>
        <box style={{ marginTop: 1 }}>
          <text fg={theme.warning}>Press Enter to install, ESC to cancel</text>
        </box>
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
          <input
            placeholder="Press Enter to confirm..."
            focused
            onSubmit={() => {
              doInstall();
            }}
          />
        </box>
      </box>
    );
  }

  if (step === 'installing') {
    return (
      <box style={{ flexDirection: 'column', padding: 1 }}>
        {header('Installing')}
        <Spinner label="Installing files..." />
      </box>
    );
  }

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg={theme.success}>
          <strong>✅ Scaffold complete!</strong>
        </text>
      </box>
      <text fg={theme.text}>{status}</text>
      <text fg={theme.textMuted}>{'\n'} Press ESC to return to menu</text>
    </box>
  );
}
