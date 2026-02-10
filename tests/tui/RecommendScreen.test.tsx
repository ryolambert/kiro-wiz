import { afterEach, describe, expect, test } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';
import { RecommendScreen } from '../../src/tui/screens/RecommendScreen.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('RecommendScreen', () => {
  test('renders use case input', async () => {
    testSetup = await testRender(<RecommendScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Recommend');
    expect(frame).toContain('Describe your use case');
    expect(frame).toContain('ESC to go back');
  });

  test('renders input placeholder', async () => {
    testSetup = await testRender(<RecommendScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('enforce code review standards');
  });

  test('shows no results initially', async () => {
    testSetup = await testRender(<RecommendScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    // Should not show any recommendation content
    expect(frame).not.toContain('rationale');
  });

  test('matches snapshot', async () => {
    testSetup = await testRender(<RecommendScreen onBack={() => {}} />, { width: 80, height: 20 });
    await testSetup.renderOnce();
    expect(testSetup.captureCharFrame()).toMatchSnapshot();
  });
});
