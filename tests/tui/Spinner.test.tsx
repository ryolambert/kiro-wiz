import { describe, expect, test, afterEach } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { Spinner } from '../../src/tui/components/Spinner.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('Spinner', () => {
  test('renders with default label', async () => {
    testSetup = await testRender(<Spinner />, { width: 40, height: 5 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toContain('Loading...');
  });

  test('renders with custom label', async () => {
    testSetup = await testRender(<Spinner label="Syncing data..." />, { width: 40, height: 5 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toContain('Syncing data...');
  });

  test('contains a braille spinner character', async () => {
    testSetup = await testRender(<Spinner />, { width: 40, height: 5 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });

  test('renders with custom color without crashing', async () => {
    testSetup = await testRender(<Spinner color="#FF0000" label="Error..." />, { width: 40, height: 5 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toContain('Error...');
  });

  test('renders with empty label', async () => {
    testSetup = await testRender(<Spinner label="" />, { width: 40, height: 5 });
    await testSetup.renderOnce();
    // Should still render the spinner character
    expect(testSetup.captureCharFrame()).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
  });
});
