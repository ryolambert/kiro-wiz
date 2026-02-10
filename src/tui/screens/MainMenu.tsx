import type { SelectOption } from '@opentui/core';
import { useRenderer } from '@opentui/react';
import type { Screen } from '../App.js';

const MENU_OPTIONS: (SelectOption & { value: Screen | 'exit' })[] = [
  { name: '🔧  Scaffold', description: 'Create a new Kiro tool', value: 'scaffold' },
  { name: '🔍  Audit', description: 'Audit workspace for best practices', value: 'audit' },
  { name: '🔄  Sync KB', description: 'Sync knowledge base from kiro.dev', value: 'sync' },
  { name: '📖  Query KB', description: 'Search the knowledge base', value: 'query' },
  { name: '💡  Recommend', description: 'Get tool recommendations', value: 'recommend' },
  { name: '✅  Validate', description: 'Validate a config file', value: 'validate' },
  { name: '🚪  Exit', description: 'Quit kiro-wiz', value: 'exit' },
];

interface Props {
  onSelect: (screen: Screen) => void;
}

export function MainMenu({ onSelect }: Props) {
  const renderer = useRenderer();

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ border: true, borderStyle: 'rounded', borderColor: '#00FFAA', padding: 1, marginBottom: 1 }}>
        <text fg="#00FFAA">
          <strong>⚡ kiro-wiz</strong>
        </text>
        <text fg="#555555"> — Kiro Ecosystem Wizard</text>
      </box>
      <text fg="#555555">  ↑↓ navigate · Enter select · Ctrl+C quit</text>
      <box style={{ border: true, borderStyle: 'rounded', borderColor: '#333333', marginTop: 1, height: 18 }}>
        <select
          style={{ height: 16 }}
          options={MENU_OPTIONS}
          focused
          selectedBackgroundColor="#1a3a2a"
          selectedTextColor="#00FFAA"
          onSelect={(_index, option) => {
            if (option?.value === 'exit') {
              renderer.destroy();
              return;
            }
            if (option?.value) {
              onSelect(option.value as Screen);
            }
          }}
        />
      </box>
    </box>
  );
}
