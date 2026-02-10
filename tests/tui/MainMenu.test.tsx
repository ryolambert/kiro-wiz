import { describe, expect, test, afterEach } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { MainMenu } from '../../src/tui/screens/MainMenu.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('MainMenu', () => {
  test('renders all menu options', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('kiro-wiz');
    expect(frame).toContain('Scaffold');
    expect(frame).toContain('Audit');
    expect(frame).toContain('Sync KB');
    expect(frame).toContain('Query KB');
    expect(frame).toContain('Recommend');
    expect(frame).toContain('Validate');
    expect(frame).toContain('Exit');
  });

  test('renders navigation hints', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('navigate');
    expect(frame).toContain('Enter');
    expect(frame).toContain('Ctrl+C');
  });

  test('renders menu item descriptions', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Create a new Kiro tool');
    expect(frame).toContain('Audit workspace for best practices');
    expect(frame).toContain('Sync knowledge base');
    expect(frame).toContain('Search the knowledge base');
    expect(frame).toContain('Get tool recommendations');
    expect(frame).toContain('Validate a config file');
    expect(frame).toContain('Quit kiro-wiz');
  });

  test('renders Kiro Wizard subtitle', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Kiro Ecosystem Wizard');
  });

  test('renders with focused select (shows selection indicator)', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    // The focused select should show a selection indicator (▶) on the first item
    expect(frame).toContain('▶');
  });

  test('matches snapshot', async () => {
    testSetup = await testRender(<MainMenu onSelect={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatchSnapshot();
  });
});
