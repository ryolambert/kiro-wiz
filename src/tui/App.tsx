import { useState } from 'react';
import { useKeyboard } from '@opentui/react';
import { MainMenu } from './screens/MainMenu.js';
import { ScaffoldScreen } from './screens/ScaffoldScreen.js';
import { AuditScreen } from './screens/AuditScreen.js';
import { SyncScreen } from './screens/SyncScreen.js';
import { QueryScreen } from './screens/QueryScreen.js';
import { RecommendScreen } from './screens/RecommendScreen.js';
import { ValidateScreen } from './screens/ValidateScreen.js';

export type Screen = 'menu' | 'scaffold' | 'audit' | 'sync' | 'query' | 'recommend' | 'validate';

export function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  useKeyboard((key) => {
    if (key.name === 'escape' && screen !== 'menu') {
      setScreen('menu');
    }
  });

  switch (screen) {
    case 'menu':
      return <MainMenu onSelect={setScreen} />;
    case 'scaffold':
      return <ScaffoldScreen onBack={() => setScreen('menu')} />;
    case 'audit':
      return <AuditScreen onBack={() => setScreen('menu')} />;
    case 'sync':
      return <SyncScreen onBack={() => setScreen('menu')} />;
    case 'query':
      return <QueryScreen onBack={() => setScreen('menu')} />;
    case 'recommend':
      return <RecommendScreen onBack={() => setScreen('menu')} />;
    case 'validate':
      return <ValidateScreen onBack={() => setScreen('menu')} />;
  }
}
