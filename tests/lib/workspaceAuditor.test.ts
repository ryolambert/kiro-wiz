import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  audit,
  compareAgainstBestPractices,
  formatReportMarkdown,
  generateReport,
  scan,
} from '../../lib/workspaceAuditor.js';

// ─── Test Helpers ──────────────────────────────────────────

async function createFile(base: string, relPath: string, content: string): Promise<void> {
  const full = path.join(base, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf-8');
}

async function createDir(base: string, relPath: string): Promise<void> {
  await fs.mkdir(path.join(base, relPath), {
    recursive: true,
  });
}

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ws-audit-'));
});

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// ─── scan() ────────────────────────────────────────────────

describe('scan', () => {
  it('finds steering files', async () => {
    const ws = path.join(tmpDir, 'scan-steering');
    await createFile(ws, '.kiro/steering/code-style.md', '---\ninclusion: always\n---\n\nContent');
    const files = await scan(ws);
    expect(files).toContain('.kiro/steering/code-style.md');
  });

  it('finds hook files', async () => {
    const ws = path.join(tmpDir, 'scan-hooks');
    await createFile(
      ws,
      '.kiro/hooks/lint.kiro.hook',
      JSON.stringify({
        name: 'lint',
        version: '1.0.0',
        when: { type: 'fileSaved' },
        then: { type: 'runCommand', command: 'npm run lint' },
      }),
    );
    const files = await scan(ws);
    expect(files).toContain('.kiro/hooks/lint.kiro.hook');
  });

  it('finds skill SKILL.md files recursively', async () => {
    const ws = path.join(tmpDir, 'scan-skills');
    await createFile(
      ws,
      '.kiro/skills/my-skill/SKILL.md',
      '---\nname: my-skill\ndescription: A skill\n---\n',
    );
    const files = await scan(ws);
    expect(files).toContain('.kiro/skills/my-skill/SKILL.md');
  });

  it('finds spec directories', async () => {
    const ws = path.join(tmpDir, 'scan-specs');
    await createDir(ws, '.kiro/specs/my-feature');
    const files = await scan(ws);
    expect(files).toContain('.kiro/specs/my-feature');
  });

  it('finds POWER.md in custom-powers', async () => {
    const ws = path.join(tmpDir, 'scan-powers');
    await createFile(
      ws,
      'custom-powers/my-power/POWER.md',
      '---\nname: my-power\ndisplayName: My Power\ndescription: desc\nkeywords: test\n---\n',
    );
    const files = await scan(ws);
    expect(files).toContain('custom-powers/my-power/POWER.md');
  });

  it('finds single config files', async () => {
    const ws = path.join(tmpDir, 'scan-singles');
    await createFile(ws, '.kiro/settings/mcp.json', '{"mcpServers":{}}');
    await createFile(ws, 'AGENTS.md', '# Agents');
    const files = await scan(ws);
    expect(files).toContain('.kiro/settings/mcp.json');
    expect(files).toContain('AGENTS.md');
  });

  it('returns empty for non-existent workspace', async () => {
    const files = await scan('/tmp/nonexistent-ws-12345');
    expect(files).toEqual([]);
  });
});

// ─── compareAgainstBestPractices() ─────────────────────────

describe('compareAgainstBestPractices', () => {
  it('flags steering with missing frontmatter', async () => {
    const ws = path.join(tmpDir, 'check-steering-bad');
    await createFile(ws, '.kiro/steering/no-fm.md', 'Just content, no frontmatter');
    const findings = await compareAgainstBestPractices(ws, ['.kiro/steering/no-fm.md']);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].category).toBe('steering');
  });

  it('passes valid steering', async () => {
    const ws = path.join(tmpDir, 'check-steering-good');
    await createFile(
      ws,
      '.kiro/steering/valid.md',
      '---\ninclusion: always\n---\n\nSome content here',
    );
    const findings = await compareAgainstBestPractices(ws, ['.kiro/steering/valid.md']);
    expect(findings).toEqual([]);
  });

  it('flags invalid hook JSON', async () => {
    const ws = path.join(tmpDir, 'check-hook-bad');
    await createFile(ws, '.kiro/hooks/bad.kiro.hook', 'not json');
    const findings = await compareAgainstBestPractices(ws, ['.kiro/hooks/bad.kiro.hook']);
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].category).toBe('hooks');
  });

  it('flags hook with invalid trigger type', async () => {
    const ws = path.join(tmpDir, 'check-hook-trigger');
    await createFile(
      ws,
      '.kiro/hooks/bad-trigger.kiro.hook',
      JSON.stringify({
        name: 'test',
        version: '1.0.0',
        when: { type: 'invalidTrigger' },
        then: { type: 'askAgent', prompt: 'do stuff' },
      }),
    );
    const findings = await compareAgainstBestPractices(ws, ['.kiro/hooks/bad-trigger.kiro.hook']);
    const triggerFinding = findings.find((f) => f.message.includes('when.type'));
    expect(triggerFinding).toBeDefined();
    expect(triggerFinding?.severity).toBe('critical');
  });

  it('flags skill with name/directory mismatch', async () => {
    const ws = path.join(tmpDir, 'check-skill-mismatch');
    await createFile(
      ws,
      '.kiro/skills/wrong-dir/SKILL.md',
      '---\nname: correct-name\ndescription: A test skill\n---\n',
    );
    const findings = await compareAgainstBestPractices(ws, ['.kiro/skills/wrong-dir/SKILL.md']);
    const mismatch = findings.find((f) => f.message.includes('does not match'));
    expect(mismatch).toBeDefined();
  });

  it('flags power with missing frontmatter fields', async () => {
    const ws = path.join(tmpDir, 'check-power-bad');
    await createFile(ws, 'custom-powers/my-power/POWER.md', '---\nname: my-power\n---\n');
    const findings = await compareAgainstBestPractices(ws, ['custom-powers/my-power/POWER.md']);
    expect(findings.length).toBeGreaterThan(0);
    const displayNameErr = findings.find((f) => f.message.includes('displayName'));
    expect(displayNameErr).toBeDefined();
  });

  it('flags MCP config with hardcoded secrets', async () => {
    const ws = path.join(tmpDir, 'check-mcp-secrets');
    await createFile(
      ws,
      '.kiro/settings/mcp.json',
      JSON.stringify({
        mcpServers: {
          test: {
            url: 'https://api.example.com',
            headers: {
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc',
            },
          },
        },
      }),
    );
    const findings = await compareAgainstBestPractices(ws, ['.kiro/settings/mcp.json']);
    const secretFinding = findings.find((f) => f.message.includes('secret'));
    expect(secretFinding).toBeDefined();
    expect(secretFinding?.severity).toBe('critical');
  });

  it('validates MCP server configs', async () => {
    const ws = path.join(tmpDir, 'check-mcp-invalid');
    await createFile(
      ws,
      '.kiro/settings/mcp.json',
      JSON.stringify({
        mcpServers: {
          broken: {},
        },
      }),
    );
    const findings = await compareAgainstBestPractices(ws, ['.kiro/settings/mcp.json']);
    const serverErr = findings.find((f) => f.message.includes('broken'));
    expect(serverErr).toBeDefined();
  });

  it('flags empty AGENTS.md', async () => {
    const ws = path.join(tmpDir, 'check-agents-empty');
    await createFile(ws, 'AGENTS.md', '');
    const findings = await compareAgainstBestPractices(ws, ['AGENTS.md']);
    expect(findings[0].category).toBe('agents');
    expect(findings[0].severity).toBe('recommended');
  });
});

// ─── generateReport() ─────────────────────────────────────

describe('generateReport', () => {
  it('groups findings by severity in summary', () => {
    const findings = [
      {
        severity: 'critical' as const,
        category: 'hooks',
        message: 'bad hook',
        file: 'a.hook',
        suggestion: 'fix it',
        kbRef: null,
      },
      {
        severity: 'recommended' as const,
        category: 'steering',
        message: 'missing pattern',
        file: 'b.md',
        suggestion: 'add pattern',
        kbRef: null,
      },
      {
        severity: 'critical' as const,
        category: 'mcp',
        message: 'secrets',
        file: 'c.json',
        suggestion: 'use env vars',
        kbRef: null,
      },
    ];
    const report = generateReport(findings, ['a', 'b', 'c']);
    expect(report.summary.critical).toBe(2);
    expect(report.summary.recommended).toBe(1);
    expect(report.summary.optional).toBe(0);
    expect(report.scannedFiles).toEqual(['a', 'b', 'c']);
  });
});

// ─── formatReportMarkdown() ────────────────────────────────

describe('formatReportMarkdown', () => {
  it('produces severity-grouped markdown', () => {
    const report = generateReport(
      [
        {
          severity: 'critical',
          category: 'hooks',
          message: 'Invalid hook',
          file: 'test.hook',
          suggestion: 'Fix it',
          kbRef: 'hooks/bp',
        },
        {
          severity: 'optional',
          category: 'steering',
          message: 'Could improve',
          file: 'test.md',
          suggestion: 'Consider updating',
          kbRef: null,
        },
      ],
      ['test.hook', 'test.md'],
    );
    const md = formatReportMarkdown(report);
    expect(md).toContain('# Workspace Audit Report');
    expect(md).toContain('## Critical');
    expect(md).toContain('## Optional');
    expect(md).toContain('Invalid hook');
    expect(md).toContain('## Scanned Files');
  });

  it('shows no issues message for clean workspace', () => {
    const report = generateReport([], ['a.md']);
    const md = formatReportMarkdown(report);
    expect(md).toContain('No Issues Found');
  });
});

// ─── audit() (full pipeline) ──────────────────────────────

describe('audit', () => {
  it('runs full scan + check + report pipeline', async () => {
    const ws = path.join(tmpDir, 'full-audit');
    await createFile(ws, '.kiro/steering/valid.md', '---\ninclusion: always\n---\n\nContent');
    await createFile(
      ws,
      '.kiro/hooks/good.kiro.hook',
      JSON.stringify({
        name: 'good',
        version: '1.0.0',
        when: { type: 'fileSaved', patterns: ['*.ts'] },
        then: { type: 'runCommand', command: 'npm test' },
      }),
    );
    const report = await audit(ws);
    expect(report.scannedFiles.length).toBe(2);
    expect(report.summary.critical).toBe(0);
  });
});
