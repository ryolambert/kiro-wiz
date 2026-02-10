import { afterEach, describe, expect, test } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { ScaffoldScreen } from '../../src/tui/screens/ScaffoldScreen.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('ScaffoldScreen', () => {
  test('renders type selection step initially', async () => {
    testSetup = await testRender(<ScaffoldScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Scaffold');
    expect(frame).toContain('Select tool type');
    expect(frame).toContain('ESC to go back');
  });

  test('shows tool type options', async () => {
    testSetup = await testRender(<ScaffoldScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('hook');
    expect(frame).toContain('spec');
  });

  test('shows focused select indicator', async () => {
    testSetup = await testRender(<ScaffoldScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('▶');
  });

  test('matches snapshot for type step', async () => {
    testSetup = await testRender(<ScaffoldScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatchSnapshot();
  });
});
