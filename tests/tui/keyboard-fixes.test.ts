import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TUI_DIR = resolve(import.meta.dir, '../../src/tui');

function readScreen(name: string): string {
  return readFileSync(resolve(TUI_DIR, 'screens', name), 'utf-8');
}

describe('Keyboard fix verification', () => {
  describe('select components use onSelect (not onChange) for actions', () => {
    test('MainMenu uses onSelect for navigation', () => {
      const src = readScreen('MainMenu.tsx');
      expect(src).toContain('onSelect=');
      // Should NOT use onChange for the navigation action
      expect(src).not.toContain('onChange=');
    });

    test('ScaffoldScreen type select uses onSelect', () => {
      const src = readScreen('ScaffoldScreen.tsx');
      // All select components should use onSelect
      expect(src).toContain('onSelect=');
      expect(src).not.toContain('onChange=');
    });
  });

  describe('process.exit is not used directly', () => {
    test('MainMenu uses renderer.destroy instead of process.exit', () => {
      const src = readScreen('MainMenu.tsx');
      expect(src).not.toContain('process.exit');
      expect(src).toContain('renderer.destroy');
    });

    test('no screen uses process.exit directly', () => {
      const screens = [
        'MainMenu.tsx',
        'ScaffoldScreen.tsx',
        'AuditScreen.tsx',
        'SyncScreen.tsx',
        'QueryScreen.tsx',
        'RecommendScreen.tsx',
        'ValidateScreen.tsx',
      ];
      for (const screen of screens) {
        const src = readScreen(screen);
        expect(src).not.toContain('process.exit');
      }
    });
  });

  describe('focus is properly set on interactive components', () => {
    test('ScaffoldScreen preview confirm input is focused', () => {
      const src = readScreen('ScaffoldScreen.tsx');
      // The preview step's input should NOT have focused={false}
      expect(src).not.toContain('focused={false}');
    });

    test('all input components have focused prop', () => {
      const screens = [
        'ScaffoldScreen.tsx',
        'QueryScreen.tsx',
        'RecommendScreen.tsx',
        'ValidateScreen.tsx',
        'SyncScreen.tsx',
      ];
      for (const screen of screens) {
        const src = readScreen(screen);
        // Every <input should have focused
        const inputMatches = src.match(/<input[\s\S]*?\/>/g) ?? [];
        for (const match of inputMatches) {
          expect(match).toContain('focused');
        }
      }
    });
  });

  describe('Spinner component exists and is used', () => {
    test('Spinner component file exists', () => {
      const src = readFileSync(resolve(TUI_DIR, 'components', 'Spinner.tsx'), 'utf-8');
      expect(src).toContain('Spinner');
      expect(src).toContain('setInterval');
    });

    test('AuditScreen uses Spinner', () => {
      const src = readScreen('AuditScreen.tsx');
      expect(src).toContain('Spinner');
    });

    test('SyncScreen uses Spinner', () => {
      const src = readScreen('SyncScreen.tsx');
      expect(src).toContain('Spinner');
    });

    test('ValidateScreen uses Spinner', () => {
      const src = readScreen('ValidateScreen.tsx');
      expect(src).toContain('Spinner');
    });

    test('ScaffoldScreen uses Spinner for installing step', () => {
      const src = readScreen('ScaffoldScreen.tsx');
      expect(src).toContain('Spinner');
      expect(src).toContain('installing');
    });
  });

  describe('UI improvements are in place', () => {
    test('MainMenu uses rounded border style', () => {
      const src = readScreen('MainMenu.tsx');
      expect(src).toContain('borderStyle');
      expect(src).toContain('rounded');
    });

    test('MainMenu uses useRenderer for proper exit', () => {
      const src = readScreen('MainMenu.tsx');
      expect(src).toContain('useRenderer');
    });

    test('screens have consistent header pattern', () => {
      const screens = [
        'AuditScreen.tsx',
        'SyncScreen.tsx',
        'QueryScreen.tsx',
        'RecommendScreen.tsx',
        'ValidateScreen.tsx',
      ];
      for (const screen of screens) {
        const src = readScreen(screen);
        expect(src).toContain('ESC to go back');
      }
    });
  });
});
