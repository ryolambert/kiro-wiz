import { afterEach, describe, expect, mock, test } from 'bun:test';
import { testRender } from '@opentui/react/test-utils';

// Mock the workspace auditor
mock.module('../../lib/workspaceAuditor.js', () => ({
  scan: async () => ['file1.json', 'file2.json', 'agents.md'],
  compareAgainstBestPractices: async () => [
    {
      severity: 'critical',
      category: 'security',
      message: 'Missing secret rotation',
      suggestion: 'Add secret rotation policy',
      file: '.kiro/settings.json',
    },
    {
      severity: 'recommended',
      category: 'structure',
      message: 'Missing steering doc',
      suggestion: 'Add a steering document',
    },
    {
      severity: 'optional',
      category: 'docs',
      message: 'No README found',
      suggestion: 'Add a README.md',
    },
  ],
  generateReport: (findings: any[], files: string[]) => ({
    scannedFiles: files,
    findings,
    summary: {
      critical: findings.filter((f: any) => f.severity === 'critical').length,
      recommended: findings.filter((f: any) => f.severity === 'recommended').length,
      optional: findings.filter((f: any) => f.severity === 'optional').length,
    },
  }),
}));

import { AuditScreen } from '../../src/tui/screens/AuditScreen.js';

let testSetup: Awaited<ReturnType<typeof testRender>> | null = null;

afterEach(() => {
  if (testSetup) {
    testSetup.renderer.destroy();
    testSetup = null;
  }
});

describe('AuditScreen', () => {
  test('renders header', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    expect(frame).toContain('Audit');
    expect(frame).toContain('ESC to go back');
  });

  test('shows loading state initially', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });
    await testSetup.renderOnce();
    const frame = testSetup.captureCharFrame();

    // Should show spinner with scanning text
    expect(frame).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/);
    expect(frame).toContain('Scanning');
  });

  test('shows results after loading', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });

    await new Promise((r) => setTimeout(r, 150));
    await testSetup.renderOnce();

    const frame = testSetup.captureCharFrame();
    expect(frame).toContain('3 findings');
    expect(frame).toContain('1 critical');
  });

  test('displays finding messages', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });

    await new Promise((r) => setTimeout(r, 150));
    await testSetup.renderOnce();

    const frame = testSetup.captureCharFrame();
    expect(frame).toContain('Missing secret rotation');
    expect(frame).toContain('[critical]');
    expect(frame).toContain('[security]');
  });

  test('displays file paths for findings', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });

    await new Promise((r) => setTimeout(r, 150));
    await testSetup.renderOnce();

    expect(testSetup.captureCharFrame()).toContain('settings.json');
  });

  test('displays suggestions', async () => {
    testSetup = await testRender(<AuditScreen onBack={() => {}} />, { width: 80, height: 30 });

    await new Promise((r) => setTimeout(r, 150));
    await testSetup.renderOnce();

    const frame = testSetup.captureCharFrame();
    expect(frame).toContain('Add secret rotation policy');
    expect(frame).toContain('Add a steering document');
  });
});
