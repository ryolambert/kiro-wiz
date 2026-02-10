import { afterEach, describe, expect, test } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { App } from '../../src/tui/App.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('App', () => {
  test('renders main menu on startup', async () => {
    testSetup = await testRender(<App />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('kiro-wiz');
    expect(frame).toContain('Scaffold');
    expect(frame).toContain('Audit');
  });

  test('renders with correct dimensions', async () => {
    testSetup = await testRender(<App />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    // Frame should have content (not empty)
    expect(frame.trim().length).toBeGreaterThan(0);
  });

  test('matches initial snapshot', async () => {
    testSetup = await testRender(<App />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatchSnapshot();
  });
});
