import { resolve, dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { mkdir, writeFile, access } from 'node:fs/promises';
import type { ScaffoldResult } from './types.js';

// ─── Types ─────────────────────────────────────────────────

export type InstallScope = 'workspace' | 'global' | 'custom';

export interface InstallTarget {
  scope: InstallScope;
  /** Absolute path to target root. Required for 'custom'. */
  targetDir?: string;
}

export interface InstallResult {
  installedFiles: Array<{
    relativePath: string;
    absolutePath: string;
  }>;
  targetRoot: string;
  scope: InstallScope;
  errors: Array<{ path: string; message: string }>;
}

// ─── Path Constants ────────────────────────────────────────

const KIRO_GLOBAL_DIR = join(homedir(), '.kiro');

/**
 * Paths that belong inside `.kiro/` when installed to a
 * workspace. Powers go to `custom-powers/`, agents go to
 * `.kiro/agents/`, and everything else maps naturally.
 */
const WORKSPACE_PATH_REWRITES: ReadonlyArray<{
  match: RegExp;
  rewrite: (p: string) => string;
}> = [
  {
    // agents/foo.json → .kiro/agents/foo.json
    match: /^agents\//,
    rewrite: (p) => `.kiro/${p}`,
  },
  {
    // powers/foo/POWER.md → custom-powers/foo/POWER.md
    match: /^powers\//,
    rewrite: (p) => p.replace(/^powers\//, 'custom-powers/'),
  },
];

/**
 * For global installs, everything goes under ~/.kiro/.
 * Powers go to ~/.kiro/powers/, agents to ~/.kiro/agents/,
 * hooks/steering/skills/specs stay under ~/.kiro/.
 */
const GLOBAL_PATH_REWRITES: ReadonlyArray<{
  match: RegExp;
  rewrite: (p: string) => string;
}> = [
  {
    // .kiro/hooks/foo → hooks/foo (strip .kiro prefix)
    match: /^\.kiro\//,
    rewrite: (p) => p.replace(/^\.kiro\//, ''),
  },
  {
    // powers/foo/POWER.md stays as powers/foo/POWER.md
    match: /^powers\//,
    rewrite: (p) => p,
  },
  {
    // agents/foo.json stays as agents/foo.json
    match: /^agents\//,
    rewrite: (p) => p,
  },
];

// ─── Core Functions ────────────────────────────────────────

export function resolveTargetRoot(target: InstallTarget): string {
  switch (target.scope) {
    case 'global':
      return KIRO_GLOBAL_DIR;
    case 'custom': {
      if (!target.targetDir || target.targetDir.trim() === '') {
        throw new Error(
          'targetDir is required for custom install scope'
        );
      }
      return resolve(target.targetDir);
    }
    case 'workspace':
      return process.cwd();
  }
}

export function rewritePath(
  relativePath: string,
  scope: InstallScope
): string {
  const rewrites =
    scope === 'global'
      ? GLOBAL_PATH_REWRITES
      : WORKSPACE_PATH_REWRITES;

  for (const { match, rewrite } of rewrites) {
    if (match.test(relativePath)) {
      return rewrite(relativePath);
    }
  }

  return relativePath;
}

export function resolveFilePath(
  relativePath: string,
  target: InstallTarget
): string {
  const root = resolveTargetRoot(target);
  const rewritten = rewritePath(relativePath, target.scope);
  return resolve(root, rewritten);
}

// ─── Dry Run ───────────────────────────────────────────────

export function previewInstall(
  scaffoldResult: ScaffoldResult,
  target: InstallTarget
): InstallResult {
  const root = resolveTargetRoot(target);
  const installedFiles = scaffoldResult.files.map((f) => {
    const rewritten = rewritePath(f.path, target.scope);
    return {
      relativePath: rewritten,
      absolutePath: resolve(root, rewritten),
    };
  });

  return {
    installedFiles,
    targetRoot: root,
    scope: target.scope,
    errors: [],
  };
}

// ─── Write to Disk ─────────────────────────────────────────

export async function install(
  scaffoldResult: ScaffoldResult,
  target: InstallTarget
): Promise<InstallResult> {
  const root = resolveTargetRoot(target);
  const installedFiles: InstallResult['installedFiles'] = [];
  const errors: InstallResult['errors'] = [];

  for (const file of scaffoldResult.files) {
    const rewritten = rewritePath(file.path, target.scope);
    const absolutePath = resolve(root, rewritten);

    try {
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.content, 'utf-8');
      installedFiles.push({ relativePath: rewritten, absolutePath });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      errors.push({ path: rewritten, message });
    }
  }

  return {
    installedFiles,
    targetRoot: root,
    scope: target.scope,
    errors,
  };
}

// ─── Validation ────────────────────────────────────────────

export async function validateTargetDir(
  targetDir: string
): Promise<{ isValid: boolean; message: string }> {
  const resolved = resolve(targetDir);

  try {
    await access(resolved);
    return { isValid: true, message: `Target exists: ${resolved}` };
  } catch {
    return {
      isValid: false,
      message: `Target does not exist: ${resolved}`,
    };
  }
}

export function isKiroWorkspace(dir: string): boolean {
  const kiroDir = join(resolve(dir), '.kiro');
  try {
    // Synchronous check — used for quick validation only
    require('node:fs').accessSync(kiroDir);
    return true;
  } catch {
    return false;
  }
}
