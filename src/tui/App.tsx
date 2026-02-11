import { useKeyboard, useRenderer } from '@opentui/react';
import { useState } from 'react';
import type { HelpHint } from './components/HelpBar.js';
import { Layout } from './components/Layout.js';
import { AuditScreen } from './screens/AuditScreen.js';
import { InstallScreen } from './screens/InstallScreen.js';
import { MainMenu } from './screens/MainMenu.js';
import { QueryScreen } from './screens/QueryScreen.js';
import { RecommendScreen } from './screens/RecommendScreen.js';
import { ScaffoldScreen } from './screens/ScaffoldScreen.js';
import { SyncScreen } from './screens/SyncScreen.js';
import { ValidateScreen } from './screens/ValidateScreen.js';

export type Screen = 'menu' | 'scaffold' | 'audit' | 'sync' | 'query' | 'recommend' | 'validate' | 'install';

const MENU_HINTS: HelpHint[] = [
  { keys: '↑↓', action: 'navigate' },
  { keys: 'Enter/→', action: 'select' },
  { keys: '1-8', action: 'jump' },
  { keys: 'Ctrl+Q', action: 'quit' },
];

const SCREEN_HINTS: HelpHint[] = [
  { keys: '←/ESC', action: 'back' },
  { keys: '↑↓', action: 'scroll' },
  { keys: 'Enter', action: 'confirm' },
  { keys: 'Ctrl+Q', action: 'quit' },
];

export function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const renderer = useRenderer();

  useKeyboard((key) => {
    if ((key.name === 'escape' || key.name === 'left') && screen !== 'menu') {
      setScreen('menu');
    }
    if (key.ctrl && key.name === 'q') {
      renderer.destroy();
    }
  });

  const hints = screen === 'menu' ? MENU_HINTS : SCREEN_HINTS;
  const back = () => setScreen('menu');

  return (
    <Layout hints={hints}>
      {(() => {
        switch (screen) {
          case 'menu':     return <MainMenu onSelect={setScreen} />;
          case 'scaffold': return <ScaffoldScreen onBack={back} />;
          case 'audit':    return <AuditScreen onBack={back} />;
          case 'sync':     return <SyncScreen onBack={back} />;
          case 'query':    return <QueryScreen onBack={back} />;
          case 'recommend':return <RecommendScreen onBack={back} />;
          case 'validate': return <ValidateScreen onBack={back} />;
          case 'install':  return <InstallScreen onBack={back} />;
        }
      })()}
    </Layout>
  );
}
