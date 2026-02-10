import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate, generateAll, getForToolType, writeAll } from '../../lib/referenceLibrary.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';
import type { DocType } from '../../lib/types.js';

describe('referenceLibrary', () => {
  // ─── generate() ────────────────────────────────────────

  describe('generate', () => {
    it('returns a ReferenceDocument with correct fields', () => {
      const doc = generate('hook', 'best-practices');

      expect(doc.toolType).toBe('hook');
      expect(doc.docType).toBe('best-practices');
      expect(doc.title).toBe('Hooks Best Practices');
      expect(doc.content).toContain('# Hooks Best Practices');
      expect(doc.crossRefs.length).toBeGreaterThan(0);
    });

    it('includes cross-reference to master reference', () => {
      const doc = generate('skill', 'examples');

      expect(doc.crossRefs).toContain('[Skills in Master Reference](../master-reference.md#skill)');
    });

    it('includes sibling doc cross-references', () => {
      const doc = generate('power', 'best-practices');

      expect(doc.crossRefs).toContain('[Powers examples](./examples.md)');
      expect(doc.crossRefs).toContain('[Powers templates](./templates.md)');
      // Should NOT include self
      expect(doc.crossRefs).not.toContain('[Powers best-practices](./best-practices.md)');
    });

    it('skill best-practices includes progressive disclosure', () => {
      const doc = generate('skill', 'best-practices');

      expect(doc.content).toContain('Progressive Disclosure');
      expect(doc.content).toContain('Discovery');
      expect(doc.content).toContain('Activation');
      expect(doc.content).toContain('Resources');
      expect(doc.content).toContain('100 tokens');
      expect(doc.content).toContain('5000 tokens');
    });

    it('skill best-practices includes authoring guidelines', () => {
      const doc = generate('skill', 'best-practices');

      expect(doc.content).toContain('Authoring Guidelines');
      expect(doc.content).toContain('Use when:');
    });

    it('hook best-practices documents trigger types', () => {
      const doc = generate('hook', 'best-practices');
      const triggers = [
        'fileEdited',
        'fileCreated',
        'fileDeleted',
        'promptSubmit',
        'agentStop',
        'preToolUse',
        'postToolUse',
        'userTriggered',
      ];
      for (const t of triggers) {
        expect(doc.content).toContain(t);
      }
    });

    it('hook best-practices documents action types and credit costs', () => {
      const doc = generate('hook', 'best-practices');

      expect(doc.content).toContain('askAgent');
      expect(doc.content).toContain('runCommand');
      expect(doc.content).toContain('Credit Cost');
      expect(doc.content).toContain('None (free)');
    });

    it('hook best-practices documents shell command availability', () => {
      const doc = generate('hook', 'best-practices');

      expect(doc.content).toContain('Shell Command Availability');
    });

    it('steering best-practices documents inclusion modes', () => {
      const doc = generate('steering-doc', 'best-practices');

      expect(doc.content).toContain('always');
      expect(doc.content).toContain('fileMatch');
      expect(doc.content).toContain('manual');
    });

    it('steering best-practices documents AGENTS.md support', () => {
      const doc = generate('steering-doc', 'best-practices');

      expect(doc.content).toContain('AGENTS.md');
    });

    it('steering best-practices documents file reference syntax', () => {
      const doc = generate('steering-doc', 'best-practices');

      expect(doc.content).toContain('#steering');
      expect(doc.content).toContain('#file:');
    });

    it('power best-practices documents POWER.md frontmatter', () => {
      const doc = generate('power', 'best-practices');

      expect(doc.content).toContain('POWER.md Frontmatter');
      expect(doc.content).toContain('name:');
      expect(doc.content).toContain('displayName:');
      expect(doc.content).toContain('description:');
      expect(doc.content).toContain('keywords:');
    });

    it('power best-practices documents keyword-based activation', () => {
      const doc = generate('power', 'best-practices');

      expect(doc.content).toContain('Keyword-Based Activation');
    });

    it('power best-practices documents steering file mapping', () => {
      const doc = generate('power', 'best-practices');

      expect(doc.content).toContain('Steering File Mapping');
      expect(doc.content).toContain('steering/');
    });

    it('custom-agent best-practices documents full config schema', () => {
      const doc = generate('custom-agent', 'best-practices');

      expect(doc.content).toContain('Full Config Schema');
      expect(doc.content).toContain('resources');
      expect(doc.content).toContain('mcpServers');
      expect(doc.content).toContain('hooks');
      expect(doc.content).toContain('welcomeMessage');
    });

    it('custom-agent best-practices documents knowledge bases', () => {
      const doc = generate('custom-agent', 'best-practices');

      expect(doc.content).toContain('Knowledge Base Resources');
    });
  });

  // ─── generateAll() ─────────────────────────────────────

  describe('generateAll', () => {
    it('produces 30 documents (10 tool types × 3 doc types)', () => {
      const docs = generateAll();
      expect(docs).toHaveLength(30);
    });

    it('covers every tool type', () => {
      const docs = generateAll();
      const toolTypes = new Set(docs.map((d) => d.toolType));

      for (const tt of KIRO_TOOL_TYPES) {
        expect(toolTypes.has(tt)).toBe(true);
      }
    });

    it('covers every doc type for each tool type', () => {
      const docs = generateAll();
      const docTypes: DocType[] = ['best-practices', 'examples', 'templates'];

      for (const tt of KIRO_TOOL_TYPES) {
        const ttDocs = docs.filter((d) => d.toolType === tt);
        const types = ttDocs.map((d) => d.docType);
        for (const dt of docTypes) {
          expect(types).toContain(dt);
        }
      }
    });
  });

  // ─── getForToolType() ──────────────────────────────────

  describe('getForToolType', () => {
    it('returns 3 docs for a tool type without filter', () => {
      const docs = getForToolType('hook');
      expect(docs).toHaveLength(3);
      expect(docs.every((d) => d.toolType === 'hook')).toBe(true);
    });

    it('returns 1 doc with docType filter', () => {
      const docs = getForToolType('power', 'templates');
      expect(docs).toHaveLength(1);
      expect(docs[0].toolType).toBe('power');
      expect(docs[0].docType).toBe('templates');
    });

    it('returns empty for non-matching docType', () => {
      const docs = getForToolType('spec', 'best-practices');
      expect(docs).toHaveLength(1);
      expect(docs[0].docType).toBe('best-practices');
    });
  });

  // ─── writeAll() ────────────────────────────────────────

  describe('writeAll', () => {
    let tmpDir: string;

    beforeEach(async () => {
      tmpDir = await mkdtemp(join(tmpdir(), 'reflib-'));
    });

    afterEach(async () => {
      await rm(tmpDir, { recursive: true, force: true });
    });

    it('writes 30 files to disk', async () => {
      const paths = await writeAll(tmpDir);
      expect(paths).toHaveLength(30);
    });

    it('creates directories per tool type', async () => {
      await writeAll(tmpDir);
      const dirs = await readdir(tmpDir);

      for (const tt of KIRO_TOOL_TYPES) {
        expect(dirs).toContain(tt);
      }
    });

    it('writes valid markdown content', async () => {
      const paths = await writeAll(tmpDir);
      const content = await readFile(paths[0], 'utf-8');

      expect(content).toContain('#');
      expect(content.length).toBeGreaterThan(0);
    });

    it('creates correct file names', async () => {
      await writeAll(tmpDir);
      const hookDir = join(tmpDir, 'hook');
      const files = await readdir(hookDir);

      expect(files).toContain('best-practices.md');
      expect(files).toContain('examples.md');
      expect(files).toContain('templates.md');
    });
  });

  // ─── Cross-references ─────────────────────────────────

  describe('cross-references', () => {
    it('every document has cross-refs to master reference', () => {
      const docs = generateAll();

      for (const doc of docs) {
        const hasMasterRef = doc.crossRefs.some((r) => r.includes('master-reference.md'));
        expect(hasMasterRef).toBe(true);
      }
    });

    it('every document has cross-refs to sibling docs', () => {
      const docs = generateAll();

      for (const doc of docs) {
        // Should have 2 sibling refs + 1 master ref = 3
        expect(doc.crossRefs).toHaveLength(3);
      }
    });

    it('cross-refs appear in document content', () => {
      const docs = generateAll();

      for (const doc of docs) {
        expect(doc.content).toContain('Related Resources');
        expect(doc.content).toContain('master-reference.md');
      }
    });
  });
});
