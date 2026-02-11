import type { SelectOption } from '@opentui/core';
import { useKeyboard, useRenderer } from '@opentui/react';
import { useState } from 'react';
import type { Screen } from '../App.js';
import { Logo } from '../components/Logo.js';
import { theme } from '../theme.js';

const MENU_OPTIONS: (SelectOption & { value: Screen | 'exit'; longDesc: string })[] = [
  { name: '🔧  Scaffold', description: 'Create a new Kiro tool', value: 'scaffold', longDesc: 'Generate scaffolding for hooks, steering docs, skills, powers, MCP servers, agents, and more. Walks you through type selection, naming, and installs to your workspace.' },
  { name: '🔍  Audit', description: 'Audit workspace', value: 'audit', longDesc: 'Scan your workspace for Kiro best practices. Checks agent configs, steering docs, hooks, and directory structure for common issues.' },
  { name: '🔄  Sync KB', description: 'Sync knowledge base', value: 'sync', longDesc: 'Crawl kiro.dev documentation and update the local knowledge base. Keeps your tool recommendations and query results current.' },
  { name: '📖  Query KB', description: 'Search knowledge base', value: 'query', longDesc: 'Browse and search the local knowledge base by category or keyword. View full documentation entries inline.' },
  { name: '💡  Recommend', description: 'Get tool recommendations', value: 'recommend', longDesc: 'Describe a use case and get recommendations for which Kiro tool types (hooks, skills, agents, etc.) best fit your needs.' },
  { name: '✅  Validate', description: 'Validate a config file', value: 'validate', longDesc: 'Check a Kiro JSON config file for schema errors, missing fields, and invalid values.' },
  { name: '📦  Install', description: 'Install pre-built configs', value: 'install', longDesc: 'Install curated agents, steering docs, and skills to your workspace or global .kiro directory.' },
  { name: '🚪  Exit', description: 'Quit kiro-wiz', value: 'exit', longDesc: 'Exit the application.' },
];

interface Props {
  onSelect: (screen: Screen) => void;
}

export function MainMenu({ onSelect }: Props) {
  const renderer = useRenderer();
  const [hoveredIndex, setHoveredIndex] = useState(0);

  useKeyboard((key) => {
    // Number keys 1-8 for direct jump
    const num = parseInt(key.name, 10);
    if (num >= 1 && num <= MENU_OPTIONS.length) {
      const opt = MENU_OPTIONS[num - 1];
      if (opt.value === 'exit') {
        renderer.destroy();
      } else {
        onSelect(opt.value as Screen);
      }
    }
  });

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <Logo />
      <box
        style={{
          border: true,
          borderStyle: 'rounded',
          borderColor: theme.border,
          height: 18,
        }}
      >
        <select
          style={{ height: 16 }}
          options={MENU_OPTIONS}
          focused
          selectedBackgroundColor={theme.surfaceAlt}
          selectedTextColor={theme.primary}
          onIndexChange={setHoveredIndex}
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
      <box
        style={{
          border: true,
          borderStyle: 'rounded',
          borderColor: theme.border,
          padding: 1,
          marginTop: 1,
          backgroundColor: theme.surfaceAlt,
        }}
      >
        <text fg={theme.dim}>{MENU_OPTIONS[hoveredIndex]?.longDesc}</text>
      </box>
    </box>
  );
}
