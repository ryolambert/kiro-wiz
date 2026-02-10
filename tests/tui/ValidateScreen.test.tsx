import { describe, expect, test, afterEach } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { ValidateScreen } from '../../src/tui/screens/ValidateScreen.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('ValidateScreen', () => {
  test('renders header and input', async () => {
    testSetup = await testRender(<ValidateScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Validate');
    expect(frame).toContain('Check a Kiro config file');
    expect(frame).toContain('ESC to go back');
  });

  test('renders file path input placeholder', async () => {
    testSetup = await testRender(<ValidateScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('.kiro/agents/my-agent.json');
  });

  test('matches snapshot', async () => {
    testSetup = await testRender(<ValidateScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatchSnapshot();
  });
});
