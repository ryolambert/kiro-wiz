import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  install,
  previewInstall,
  resolveFilePath,
  resolveTargetRoot,
  rewritePath,
  validateTargetDir,
} from '../../lib/fileInstaller.js';
import type { ScaffoldResult } from '../../lib/types.js';
import type { InstallTarget } from '../../lib/types.js';

// ─── resolveTargetRoot ─────────────────────────────────────

describe('resolveTargetRoot', () => {
  it('returns cwd for workspace scope', () => {
    const result = resolveTargetRoot({ scope: 'workspace' });
    expect(result).toBe(process.cwd());
  });

  it('returns ~/.kiro for global scope', () => {
    const result = resolveTargetRoot({ scope: 'global' });
    expect(result).toBe(join(homedir(), '.kiro'));
  });

  it('returns resolved targetDir for custom scope', () => {
    const result = resolveTargetRoot({
      scope: 'custom',
      targetDir: '/tmp/my-project',
    });
    expect(result).toBe(resolve('/tmp/my-project'));
  });

  it('throws for custom scope without targetDir', () => {
    expect(() => resolveTargetRoot({ scope: 'custom' })).toThrow('targetDir is required');
  });

  it('throws for custom scope with empty targetDir', () => {
    expect(() => resolveTargetRoot({ scope: 'custom', targetDir: '  ' })).toThrow(
      'targetDir is required',
    );
  });
});

// ─── rewritePath ───────────────────────────────────────────

describe('rewritePath', () => {
  describe('workspace scope', () => {
    it('rewrites agents/ to .kiro/agents/', () => {
      expect(rewritePath('agents/my-agent.json', 'workspace')).toBe('.kiro/agents/my-agent.json');
    });

    it('rewrites powers/ to custom-powers/', () => {
      expect(rewritePath('powers/my-power/POWER.md', 'workspace')).toBe(
        'custom-powers/my-power/POWER.md',
      );
    });

    it('passes through .kiro/ paths unchanged', () => {
      expect(rewritePath('.kiro/hooks/lint.kiro.hook', 'workspace')).toBe(
        '.kiro/hooks/lint.kiro.hook',
      );
    });

    it('passes through other paths unchanged', () => {
      expect(rewritePath('some/other/file.ts', 'workspace')).toBe('some/other/file.ts');
    });
  });

  describe('global scope', () => {
    it('strips .kiro/ prefix', () => {
      expect(rewritePath('.kiro/hooks/lint.kiro.hook', 'global')).toBe('hooks/lint.kiro.hook');
    });

    it('strips .kiro/ from steering paths', () => {
      expect(rewritePath('.kiro/steering/rules.md', 'global')).toBe('steering/rules.md');
    });

    it('keeps powers/ as-is', () => {
      expect(rewritePath('powers/my-power/POWER.md', 'global')).toBe('powers/my-power/POWER.md');
    });

    it('keeps agents/ as-is', () => {
      expect(rewritePath('agents/my-agent.json', 'global')).toBe('agents/my-agent.json');
    });

    it('passes through unmatched paths', () => {
      expect(rewritePath('bin/server.ts', 'global')).toBe('bin/server.ts');
    });
  });

  describe('custom scope', () => {
    it('uses workspace rewrites for custom scope', () => {
      expect(rewritePath('agents/my-agent.json', 'custom')).toBe('.kiro/agents/my-agent.json');
    });
  });
});

// ─── resolveFilePath ───────────────────────────────────────

describe('resolveFilePath', () => {
  it('resolves workspace path correctly', () => {
    const target: InstallTarget = { scope: 'workspace' };
    const result = resolveFilePath('.kiro/hooks/lint.kiro.hook', target);
    expect(result).toBe(resolve(process.cwd(), '.kiro/hooks/lint.kiro.hook'));
  });

  it('resolves global path correctly', () => {
    const target: InstallTarget = { scope: 'global' };
    const result = resolveFilePath('.kiro/hooks/lint.kiro.hook', target);
    expect(result).toBe(resolve(homedir(), '.kiro', 'hooks/lint.kiro.hook'));
  });

  it('resolves custom path correctly', () => {
    const target: InstallTarget = {
      scope: 'custom',
      targetDir: '/tmp/project',
    };
    const result = resolveFilePath('agents/my-agent.json', target);
    expect(result).toBe(resolve('/tmp/project', '.kiro/agents/my-agent.json'));
  });
});

// ─── previewInstall ────────────────────────────────────────

describe('previewInstall', () => {
  const scaffoldResult: ScaffoldResult = {
    files: [
      { path: '.kiro/hooks/lint.kiro.hook', content: '{}' },
      { path: 'agents/my-agent.json', content: '{}' },
      { path: 'powers/my-power/POWER.md', content: '# Power' },
    ],
    instructions: 'Test instructions',
  };

  it('returns correct file count', () => {
    const result = previewInstall(scaffoldResult, {
      scope: 'workspace',
    });
    expect(result.installedFiles).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
  });

  it('rewrites paths for workspace scope', () => {
    const result = previewInstall(scaffoldResult, {
      scope: 'workspace',
    });
    const paths = result.installedFiles.map((f) => f.relativePath);
    expect(paths).toContain('.kiro/hooks/lint.kiro.hook');
    expect(paths).toContain('.kiro/agents/my-agent.json');
    expect(paths).toContain('custom-powers/my-power/POWER.md');
  });

  it('rewrites paths for global scope', () => {
    const result = previewInstall(scaffoldResult, {
      scope: 'global',
    });
    const paths = result.installedFiles.map((f) => f.relativePath);
    expect(paths).toContain('hooks/lint.kiro.hook');
    expect(paths).toContain('agents/my-agent.json');
    expect(paths).toContain('powers/my-power/POWER.md');
  });

  it('sets correct targetRoot for global', () => {
    const result = previewInstall(scaffoldResult, {
      scope: 'global',
    });
    expect(result.targetRoot).toBe(join(homedir(), '.kiro'));
  });
});

// ─── install (writes to disk) ──────────────────────────────

describe('install', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'kiro-install-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('writes files to custom target directory', async () => {
    const scaffoldResult: ScaffoldResult = {
      files: [
        {
          path: '.kiro/hooks/lint.kiro.hook',
          content: '{"name":"lint"}',
        },
        {
          path: '.kiro/steering/rules.md',
          content: '# Rules',
        },
      ],
      instructions: 'Done',
    };

    const result = await install(scaffoldResult, {
      scope: 'custom',
      targetDir: tempDir,
    });

    expect(result.installedFiles).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.scope).toBe('custom');

    const hookContent = await readFile(join(tempDir, '.kiro/hooks/lint.kiro.hook'), 'utf-8');
    expect(hookContent).toBe('{"name":"lint"}');

    const steeringContent = await readFile(join(tempDir, '.kiro/steering/rules.md'), 'utf-8');
    expect(steeringContent).toBe('# Rules');
  });

  it('rewrites agent paths for custom scope', async () => {
    const scaffoldResult: ScaffoldResult = {
      files: [
        {
          path: 'agents/my-agent.json',
          content: '{"name":"test"}',
        },
      ],
      instructions: 'Done',
    };

    const result = await install(scaffoldResult, {
      scope: 'custom',
      targetDir: tempDir,
    });

    expect(result.installedFiles).toHaveLength(1);
    expect(result.installedFiles[0].relativePath).toBe('.kiro/agents/my-agent.json');

    const content = await readFile(join(tempDir, '.kiro/agents/my-agent.json'), 'utf-8');
    expect(content).toBe('{"name":"test"}');
  });

  it('rewrites power paths for custom scope', async () => {
    const scaffoldResult: ScaffoldResult = {
      files: [
        {
          path: 'powers/my-power/POWER.md',
          content: '# My Power',
        },
      ],
      instructions: 'Done',
    };

    const result = await install(scaffoldResult, {
      scope: 'custom',
      targetDir: tempDir,
    });

    expect(result.installedFiles[0].relativePath).toBe('custom-powers/my-power/POWER.md');

    const content = await readFile(join(tempDir, 'custom-powers/my-power/POWER.md'), 'utf-8');
    expect(content).toBe('# My Power');
  });

  it('creates nested directories automatically', async () => {
    const scaffoldResult: ScaffoldResult = {
      files: [
        {
          path: '.kiro/skills/review/SKILL.md',
          content: '---\nname: review\n---',
        },
      ],
      instructions: 'Done',
    };

    const result = await install(scaffoldResult, {
      scope: 'custom',
      targetDir: tempDir,
    });

    expect(result.installedFiles).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });
});

// ─── validateTargetDir ─────────────────────────────────────

describe('validateTargetDir', () => {
  it('returns valid for existing directory', async () => {
    const result = await validateTargetDir(process.cwd());
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for non-existent directory', async () => {
    const result = await validateTargetDir('/nonexistent/path/xyz123');
    expect(result.isValid).toBe(false);
  });
});
