import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  QUICK_REFERENCE_SCENARIOS,
  TOOL_TYPE_DISPLAY,
  buildDecisionMatrix,
  categoryToToolType,
  compile,
  deserialize,
  serialize,
  toAnchor,
} from '../../lib/compiler.js';
import { write } from '../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry } from '../../lib/types.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';

// ─── Helpers ────────────────────────────────────────────────

const baseDirs: string[] = [];

function freshBaseDir(): string {
  const dir = join(tmpdir(), `kb-compiler-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  baseDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(baseDirs.map((d) => rm(d, { recursive: true, force: true })));
  baseDirs.length = 0;
});

function makeEntry(overrides: Partial<KnowledgeBaseEntry>): KnowledgeBaseEntry {
  return {
    slug: 'test-entry',
    category: 'hooks',
    title: 'Test Entry',
    content: 'Some content here.',
    sourceUrl: 'https://kiro.dev/docs/hooks/test',
    lastUpdated: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ─── categoryToToolType ────────────────────────────────────

describe('categoryToToolType', () => {
  it('maps known categories to tool types', () => {
    expect(categoryToToolType('specs')).toBe('spec');
    expect(categoryToToolType('hooks')).toBe('hook');
    expect(categoryToToolType('steering')).toBe('steering-doc');
    expect(categoryToToolType('skills')).toBe('skill');
    expect(categoryToToolType('powers')).toBe('power');
    expect(categoryToToolType('mcp')).toBe('mcp-server');
    expect(categoryToToolType('cli')).toBe('custom-agent');
    expect(categoryToToolType('autonomous-agent')).toBe('autonomous-agent');
    expect(categoryToToolType('context-providers')).toBe('context-provider');
  });

  it('returns null for unmapped categories', () => {
    expect(categoryToToolType('blog')).toBeNull();
    expect(categoryToToolType('changelog')).toBeNull();
    expect(categoryToToolType('getting-started')).toBeNull();
    expect(categoryToToolType('unknown')).toBeNull();
  });
});

// ─── toAnchor ──────────────────────────────────────────────

describe('toAnchor', () => {
  it('converts headings to lowercase anchors', () => {
    expect(toAnchor('Decision Matrix')).toBe('decision-matrix');
    expect(toAnchor('MCP Servers')).toBe('mcp-servers');
    expect(toAnchor('Custom Agents (CLI)')).toBe('custom-agents-cli');
  });

  it('strips special characters', () => {
    expect(toAnchor('Hello! World?')).toBe('hello-world');
  });
});

// ─── buildDecisionMatrix ───────────────────────────────────

describe('buildDecisionMatrix', () => {
  it('returns entries for all 10 tool types when null', () => {
    const matrix = buildDecisionMatrix(null);
    expect(matrix).toHaveLength(10);

    const types = matrix.map((e) => e.toolType);
    for (const t of KIRO_TOOL_TYPES) {
      expect(types).toContain(t);
    }
  });

  it('filters to specified tool types', () => {
    const matrix = buildDecisionMatrix(['hook', 'spec']);
    expect(matrix).toHaveLength(2);
    expect(matrix[0].toolType).toBe('hook');
    expect(matrix[1].toolType).toBe('spec');
  });

  it('includes all required columns', () => {
    const matrix = buildDecisionMatrix(null);
    for (const entry of matrix) {
      expect(entry.whatItIs).toBeTruthy();
      expect(entry.whenToUse).toBeTruthy();
      expect(entry.whenNotToUse).toBeTruthy();
      expect(Array.isArray(entry.alternatives)).toBe(true);
      expect(['ide', 'cli', 'both']).toContain(entry.platform);
    }
  });
});

// ─── compile ───────────────────────────────────────────────

describe('compile', () => {
  it('compiles an empty knowledge base', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir);

    expect(ref.toc).toBeDefined();
    expect(ref.sections).toBeDefined();
    expect(ref.decisionMatrix).toHaveLength(10);
    expect(ref.quickReference.length).toBeGreaterThan(0);
  });

  it('includes entries organized by tool type', async () => {
    const baseDir = freshBaseDir();

    await write(makeEntry({ slug: 'hook-a', category: 'hooks', title: 'Hook A' }), baseDir);
    await write(makeEntry({ slug: 'spec-a', category: 'specs', title: 'Spec A' }), baseDir);

    const ref = await compile(baseDir);

    const hookSection = ref.sections.find((s) => s.toolType === 'hook');
    expect(hookSection).toBeDefined();
    expect(hookSection?.subsections.some((s) => s.title === 'Hook A')).toBe(true);

    const specSection = ref.sections.find((s) => s.toolType === 'spec');
    expect(specSection).toBeDefined();
    expect(specSection?.subsections.some((s) => s.title === 'Spec A')).toBe(true);
  });

  it('places uncategorized entries in General Reference', async () => {
    const baseDir = freshBaseDir();

    await write(makeEntry({ slug: 'blog-post', category: 'blog', title: 'Blog Post' }), baseDir);

    const ref = await compile(baseDir);

    const generalSection = ref.sections.find((s) => s.title === 'General Reference');
    expect(generalSection).toBeDefined();
    expect(generalSection?.subsections.some((s) => s.title === 'Blog Post')).toBe(true);
  });

  it('respects toolTypes filter option', async () => {
    const baseDir = freshBaseDir();

    await write(makeEntry({ slug: 'hook-a', category: 'hooks', title: 'Hook A' }), baseDir);
    await write(makeEntry({ slug: 'spec-a', category: 'specs', title: 'Spec A' }), baseDir);

    const ref = await compile(baseDir, { toolTypes: ['hook'] });

    const toolSections = ref.sections.filter((s) => s.toolType !== null);
    expect(toolSections).toHaveLength(1);
    expect(toolSections[0].toolType).toBe('hook');
  });

  it('respects includeDecisionMatrix=false', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir, { includeDecisionMatrix: false });
    expect(ref.decisionMatrix).toHaveLength(0);
  });

  it('respects includeQuickReference=false', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir, { includeQuickReference: false });
    expect(ref.quickReference).toHaveLength(0);
  });
});

// ─── serialize / deserialize round-trip ────────────────────

describe('serialize', () => {
  it('produces valid markdown with TOC', async () => {
    const baseDir = freshBaseDir();
    await write(makeEntry({ slug: 'hook-a', category: 'hooks', title: 'Hook A' }), baseDir);

    const ref = await compile(baseDir);
    const md = serialize(ref);

    expect(md).toContain('# Kiro Master Reference');
    expect(md).toContain('## Table of Contents');
    expect(md).toContain('## Hooks');
    expect(md).toContain('### Hook A');
    expect(md).toContain('## Decision Matrix');
    expect(md).toContain('## Quick Reference');
  });

  it('includes decision matrix table', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir);
    const md = serialize(ref);

    expect(md).toContain('| Tool Type | What | When to Use');
    expect(md).toContain('| hook |');
    expect(md).toContain('| spec |');
  });

  it('includes quick reference table', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir);
    const md = serialize(ref);

    expect(md).toContain('| Scenario | Recommended Tools | Rationale |');
    expect(md).toContain('I want to automate on file save');
  });
});

describe('deserialize', () => {
  it('parses serialized markdown back to CompiledReference', async () => {
    const baseDir = freshBaseDir();
    await write(makeEntry({ slug: 'hook-a', category: 'hooks', title: 'Hook A' }), baseDir);

    const ref = await compile(baseDir);
    const md = serialize(ref);
    const parsed = deserialize(md);

    expect(parsed.toc.length).toBeGreaterThan(0);
    expect(parsed.decisionMatrix).toHaveLength(ref.decisionMatrix.length);
    expect(parsed.quickReference).toHaveLength(ref.quickReference.length);
  });

  it('preserves decision matrix entries on round-trip', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir);
    const md = serialize(ref);
    const parsed = deserialize(md);

    for (const original of ref.decisionMatrix) {
      const found = parsed.decisionMatrix.find((e) => e.toolType === original.toolType);
      expect(found).toBeDefined();
      expect(found?.whatItIs).toBe(original.whatItIs);
      expect(found?.platform).toBe(original.platform);
    }
  });

  it('preserves quick reference entries on round-trip', async () => {
    const baseDir = freshBaseDir();
    const ref = await compile(baseDir);
    const md = serialize(ref);
    const parsed = deserialize(md);

    for (const original of ref.quickReference) {
      const found = parsed.quickReference.find((e) => e.scenario === original.scenario);
      expect(found).toBeDefined();
      expect(found?.recommendedTools).toEqual(original.recommendedTools);
    }
  });

  it('preserves section structure on round-trip', async () => {
    const baseDir = freshBaseDir();
    await write(makeEntry({ slug: 'hook-a', category: 'hooks', title: 'Hook A' }), baseDir);
    await write(makeEntry({ slug: 'spec-a', category: 'specs', title: 'Spec A' }), baseDir);

    const ref = await compile(baseDir);
    const md = serialize(ref);
    const parsed = deserialize(md);

    const hookSection = parsed.sections.find((s) => s.toolType === 'hook');
    expect(hookSection).toBeDefined();
    expect(hookSection?.subsections.some((s) => s.title === 'Hook A')).toBe(true);

    const specSection = parsed.sections.find((s) => s.toolType === 'spec');
    expect(specSection).toBeDefined();
    expect(specSection?.subsections.some((s) => s.title === 'Spec A')).toBe(true);
  });
});

// ─── TOOL_TYPE_DISPLAY coverage ────────────────────────────

describe('TOOL_TYPE_DISPLAY', () => {
  it('has a display name for every tool type', () => {
    for (const t of KIRO_TOOL_TYPES) {
      expect(TOOL_TYPE_DISPLAY[t]).toBeTruthy();
    }
  });
});

// ─── QUICK_REFERENCE_SCENARIOS coverage ────────────────────

describe('QUICK_REFERENCE_SCENARIOS', () => {
  it('has at least one scenario per tool type', () => {
    const coveredTools = new Set(QUICK_REFERENCE_SCENARIOS.flatMap((s) => s.recommendedTools));
    for (const t of KIRO_TOOL_TYPES) {
      expect(coveredTools.has(t)).toBe(true);
    }
  });
});
