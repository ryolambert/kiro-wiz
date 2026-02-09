import type { SelectOption } from '@opentui/core';
import type { Screen } from '../App.js';

const MENU_OPTIONS: (SelectOption & { value: Screen | 'exit' })[] = [
  { name: 'Scaffold', description: 'Create a new Kiro tool', value: 'scaffold' },
  { name: 'Audit', description: 'Audit workspace for best practices', value: 'audit' },
  { name: 'Sync KB', description: 'Sync knowledge base from kiro.dev', value: 'sync' },
  { name: 'Query KB', description: 'Search the knowledge base', value: 'query' },
  { name: 'Recommend', description: 'Get tool recommendations', value: 'recommend' },
  { name: 'Validate', description: 'Validate a config file', value: 'validate' },
  { name: 'Exit', description: 'Quit kiro-wiz', value: 'exit' },
];

interface Props {
  onSelect: (screen: Screen) => void;
}

export function MainMenu({ onSelect }: Props) {
  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA">
        <strong>kiro-wiz</strong> — Kiro Wizard
      </text>
      <text fg="#666666">Use ↑↓ to navigate, Enter to select, Ctrl+C to quit</text>
      <box style={{ border: true, marginTop: 1, height: 18 }}>
        <select
          style={{ height: 16 }}
          options={MENU_OPTIONS}
          focused={true}
          onChange={(_index, option) => {
            if (option?.value === 'exit') {
              process.exit(0);
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
