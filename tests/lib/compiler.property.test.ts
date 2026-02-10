import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import fc from 'fast-check';
import { afterEach, describe, expect, it } from 'vitest';
import { compile, serialize } from '../../lib/compiler.js';
import { write } from '../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry, UrlCategory } from '../../lib/types.js';

/**
 * **Feature: kiro-knowledge-base, Property 11: Compilation content coverage**
 * **Validates: Requirements 4.1**
 *
 * For any set of KnowledgeBaseEntry values written to the knowledge
 * base, after calling compile(), every entry's content SHALL appear
 * in at least one section of the compiled reference.
 */

// Categories that map to known tool types via categoryToToolType
const TOOL_CATEGORIES: UrlCategory[] = [
  'hooks',
  'specs',
  'steering',
  'skills',
  'powers',
  'mcp',
  'cli',
  'autonomous-agent',
  'context-providers',
];

const arbCategory = fc.constantFrom(...TOOL_CATEGORIES);

const arbSlug = fc
  .stringMatching(/^[a-z][a-z0-9-]{2,20}$/)
  .filter((s) => !s.endsWith('-') && !s.includes('--'));

const arbContent = fc
  .stringMatching(/^[A-Za-z0-9 .,!?:;\-()]{10,80}$/)
  .filter((s) => s.trim().length >= 10);

const arbTimestamp = fc
  .integer({ min: 1_600_000_000_000, max: 1_700_000_000_000 })
  .map((ms) => new Date(ms).toISOString());

const arbEntry: fc.Arbitrary<KnowledgeBaseEntry> = fc.record({
  slug: arbSlug,
  category: arbCategory,
  title: fc.stringMatching(/^[A-Z][A-Za-z0-9 ]{4,30}$/),
  content: arbContent,
  sourceUrl: arbSlug.map((s) => `https://kiro.dev/docs/${s}`),
  lastUpdated: arbTimestamp,
});

// Deduplicate entries by slug+category to avoid file overwrites
function dedup(entries: KnowledgeBaseEntry[]): KnowledgeBaseEntry[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.category}/${e.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })));
  dirs.length = 0;
});

describe('Property 11: Compilation content coverage', () => {
  it('every written entry content appears in the compiled reference', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(arbEntry, { minLength: 1, maxLength: 8 }), async (rawEntries) => {
        const entries = dedup(rawEntries);
        if (entries.length === 0) return;

        const tmpDir = await mkdtemp(join(tmpdir(), 'kb-prop11-'));
        dirs.push(tmpDir);

        for (const entry of entries) {
          await write(entry, tmpDir);
        }

        const compiled = await compile(tmpDir);
        const output = serialize(compiled);

        for (const entry of entries) {
          expect(
            output.includes(entry.content),
            `Content missing for ${entry.category}/${entry.slug}: "${entry.content.slice(0, 40)}..."`,
          ).toBe(true);
        }
      }),
      { numRuns: 50 },
    );
  }, 60_000);
});

/**
 * **Feature: kiro-knowledge-base, Property 12: Table of contents completeness**
 * **Validates: Requirements 4.2**
 *
 * For any compiled reference, the TOC SHALL contain an entry for
 * every section title, and every TOC anchor SHALL correspond to a
 * section heading in the serialized markdown output.
 */

describe('Property 12: Table of contents completeness', () => {
  it('TOC contains an entry for every section title and every TOC anchor maps to a heading', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(arbEntry, { minLength: 1, maxLength: 8 }), async (rawEntries) => {
        const entries = dedup(rawEntries);
        if (entries.length === 0) return;

        const tmpDir = await mkdtemp(join(tmpdir(), 'kb-prop12-'));
        dirs.push(tmpDir);

        for (const entry of entries) {
          await write(entry, tmpDir);
        }

        const compiled = await compile(tmpDir);
        const output = serialize(compiled);

        const tocTitles = new Set(compiled.toc.map((t) => t.title));

        // 1) Every section/subsection title appears in the TOC
        for (const section of compiled.sections) {
          expect(tocTitles.has(section.title), `Section "${section.title}" missing from TOC`).toBe(
            true,
          );

          for (const sub of section.subsections) {
            expect(tocTitles.has(sub.title), `Subsection "${sub.title}" missing from TOC`).toBe(
              true,
            );
          }
        }

        // 2) Every TOC anchor corresponds to a heading in
        //    the serialized markdown
        const headingPattern = /^#{1,6}\s+(.+)$/gm;
        const headings = new Set<string>();
        let match: RegExpExecArray | null;
        while ((match = headingPattern.exec(output)) !== null) {
          headings.add(match[1]);
        }

        for (const tocEntry of compiled.toc) {
          expect(
            headings.has(tocEntry.title),
            `TOC anchor "${tocEntry.anchor}" (title: "${tocEntry.title}") has no matching heading`,
          ).toBe(true);
        }
      }),
      { numRuns: 50 },
    );
  }, 60_000);
});

/**
 * **Feature: kiro-knowledge-base, Property 13: Decision matrix completeness per tool type**
 * **Validates: Requirements 4.4**
 *
 * For any subset of KiroToolType values, `buildDecisionMatrix()`
 * SHALL return an entry for each requested type, and each entry
 * SHALL have non-empty whatItIs, whenToUse, whenNotToUse, a
 * non-empty alternatives array, and a valid platform value.
 */

import { buildDecisionMatrix } from '../../lib/compiler.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';
import type { KiroToolType } from '../../lib/types.js';

const VALID_PLATFORMS = ['ide', 'cli', 'both'] as const;

const arbNonEmptySubset: fc.Arbitrary<KiroToolType[]> = fc
  .subarray([...KIRO_TOOL_TYPES], { minLength: 1 })
  .filter((arr) => arr.length > 0);

describe('Property 13: Decision matrix completeness per tool type', () => {
  it('returns a complete entry for every requested tool type', () => {
    fc.assert(
      fc.property(arbNonEmptySubset, (toolTypes) => {
        const matrix = buildDecisionMatrix(toolTypes);

        // 1) One entry per requested type
        expect(matrix).toHaveLength(toolTypes.length);

        const returnedTypes = matrix.map((e) => e.toolType);
        for (const tt of toolTypes) {
          expect(returnedTypes.includes(tt), `Missing entry for tool type "${tt}"`).toBe(true);
        }

        // 2) Each entry has all required non-empty fields
        for (const entry of matrix) {
          expect(entry.whatItIs.trim().length > 0, `whatItIs empty for "${entry.toolType}"`).toBe(
            true,
          );

          expect(entry.whenToUse.trim().length > 0, `whenToUse empty for "${entry.toolType}"`).toBe(
            true,
          );

          expect(
            entry.whenNotToUse.trim().length > 0,
            `whenNotToUse empty for "${entry.toolType}"`,
          ).toBe(true);

          expect(entry.alternatives.length > 0, `alternatives empty for "${entry.toolType}"`).toBe(
            true,
          );

          expect(
            (VALID_PLATFORMS as readonly string[]).includes(entry.platform),
            `Invalid platform "${entry.platform}" for "${entry.toolType}"`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('returns all tool types when called with null', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const matrix = buildDecisionMatrix(null);

        expect(matrix).toHaveLength(KIRO_TOOL_TYPES.length);

        for (const tt of KIRO_TOOL_TYPES) {
          const entry = matrix.find((e) => e.toolType === tt);
          expect(entry, `Missing entry for "${tt}" when called with null`).toBeDefined();
        }
      }),
      { numRuns: 1 },
    );
  });
});

/**
 * **Feature: kiro-knowledge-base, Property 14: Master reference round-trip**
 * **Validates: Requirements 4.6**
 *
 * For any compiled reference, `deserialize(serialize(ref))` SHALL
 * produce a CompiledReference with the same decision matrix entries,
 * quick reference entries, and section structure as the original.
 */

import { deserialize } from '../../lib/compiler.js';

// Title arbitrary that avoids trailing whitespace (trimmed by
// markdown heading round-trip) for round-trip fidelity.
const arbTrimmedTitle = fc
  .stringMatching(/^[A-Z][A-Za-z0-9 ]{4,30}$/)
  .filter((s) => s === s.trim() && s.trim().length >= 5);

const arbRoundTripEntry: fc.Arbitrary<KnowledgeBaseEntry> = fc.record({
  slug: arbSlug,
  category: arbCategory,
  title: arbTrimmedTitle,
  content: arbContent,
  sourceUrl: arbSlug.map((s) => `https://kiro.dev/docs/${s}`),
  lastUpdated: arbTimestamp,
});

describe('Property 14: Master reference round-trip', () => {
  it('deserialize(serialize(ref)) preserves decision matrix, quick reference, and section structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbRoundTripEntry, { minLength: 1, maxLength: 8 }),
        async (rawEntries) => {
          const entries = dedup(rawEntries);
          if (entries.length === 0) return;

          const tmpDir = await mkdtemp(join(tmpdir(), 'kb-prop14-'));
          dirs.push(tmpDir);

          for (const entry of entries) {
            await write(entry, tmpDir);
          }

          const compiled = await compile(tmpDir);
          const markdown = serialize(compiled);
          const restored = deserialize(markdown);

          // 1) Decision matrix entries match
          expect(restored.decisionMatrix).toHaveLength(compiled.decisionMatrix.length);
          for (let i = 0; i < compiled.decisionMatrix.length; i++) {
            const orig = compiled.decisionMatrix[i];
            const rest = restored.decisionMatrix[i];
            expect(rest.toolType).toBe(orig.toolType);
            expect(rest.whatItIs).toBe(orig.whatItIs);
            expect(rest.whenToUse).toBe(orig.whenToUse);
            expect(rest.whenNotToUse).toBe(orig.whenNotToUse);
            expect(rest.alternatives).toEqual(orig.alternatives);
            expect(rest.platform).toBe(orig.platform);
          }

          // 2) Quick reference entries match
          expect(restored.quickReference).toHaveLength(compiled.quickReference.length);
          for (let i = 0; i < compiled.quickReference.length; i++) {
            const orig = compiled.quickReference[i];
            const rest = restored.quickReference[i];
            expect(rest.scenario).toBe(orig.scenario);
            expect(rest.recommendedTools).toEqual(orig.recommendedTools);
            expect(rest.rationale).toBe(orig.rationale);
          }

          // 3) Section titles and tool types match
          expect(restored.sections).toHaveLength(compiled.sections.length);
          for (let i = 0; i < compiled.sections.length; i++) {
            const origSec = compiled.sections[i];
            const restSec = restored.sections[i];
            expect(restSec.title).toBe(origSec.title);
            expect(restSec.toolType).toBe(origSec.toolType);

            // Subsection titles and tool types match
            expect(restSec.subsections).toHaveLength(origSec.subsections.length);
            for (let j = 0; j < origSec.subsections.length; j++) {
              const origSub = origSec.subsections[j];
              const restSub = restSec.subsections[j];
              expect(restSub.title).toBe(origSub.title);
              expect(restSub.toolType).toBe(origSub.toolType);
            }
          }

          // 4) TOC entries match
          expect(restored.toc).toHaveLength(compiled.toc.length);
          for (let i = 0; i < compiled.toc.length; i++) {
            expect(restored.toc[i].title).toBe(compiled.toc[i].title);
            expect(restored.toc[i].anchor).toBe(compiled.toc[i].anchor);
            expect(restored.toc[i].level).toBe(compiled.toc[i].level);
          }
        },
      ),
      { numRuns: 50 },
    );
  }, 60_000);
});
