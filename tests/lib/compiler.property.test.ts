import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildDecisionMatrix, compile, deserialize, serialize } from '../../lib/compiler.js';
import { initKB, write } from '../../lib/knowledgeBase.js';
import type { KnowledgeBaseEntry, KiroToolType, UrlCategory } from '../../lib/types.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';

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

// Deduplicate entries by slug+category to avoid overwrites
function dedup(entries: KnowledgeBaseEntry[]): KnowledgeBaseEntry[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.category}/${e.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

beforeEach(() => {
  initKB([]);
});

describe('Property 11: Compilation content coverage', () => {
  it('every written entry content appears in the compiled reference', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(arbEntry, { minLength: 1, maxLength: 8 }), async (rawEntries) => {
        const entries = dedup(rawEntries);
        if (entries.length === 0) return;

        initKB([]);
        for (const entry of entries) {
          write(entry);
        }

        const compiled = await compile();
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

        initKB([]);
        for (const entry of entries) {
          write(entry);
        }

        const compiled = await compile();
        const output = serialize(compiled);

        const tocTitles = new Set(compiled.toc.map((t) => t.title));

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
 */

const VALID_PLATFORMS = ['ide', 'cli', 'both'] as const;

const arbNonEmptySubset: fc.Arbitrary<KiroToolType[]> = fc
  .subarray([...KIRO_TOOL_TYPES], { minLength: 1 })
  .filter((arr) => arr.length > 0);

describe('Property 13: Decision matrix completeness per tool type', () => {
  it('returns a complete entry for every requested tool type', () => {
    fc.assert(
      fc.property(arbNonEmptySubset, (toolTypes) => {
        const matrix = buildDecisionMatrix(toolTypes);

        expect(matrix).toHaveLength(toolTypes.length);

        const returnedTypes = matrix.map((e) => e.toolType);
        for (const tt of toolTypes) {
          expect(returnedTypes.includes(tt), `Missing entry for tool type "${tt}"`).toBe(true);
        }

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
          expect(matrix.find((e) => e.toolType === tt), `Missing entry for "${tt}"`).toBeDefined();
        }
      }),
      { numRuns: 1 },
    );
  });
});

/**
 * **Feature: kiro-knowledge-base, Property 14: Master reference round-trip**
 * **Validates: Requirements 4.6**
 */

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

          initKB([]);
          for (const entry of entries) {
            write(entry);
          }

          const compiled = await compile();
          const markdown = serialize(compiled);
          const restored = deserialize(markdown);

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

          expect(restored.quickReference).toHaveLength(compiled.quickReference.length);
          for (let i = 0; i < compiled.quickReference.length; i++) {
            const orig = compiled.quickReference[i];
            const rest = restored.quickReference[i];
            expect(rest.scenario).toBe(orig.scenario);
            expect(rest.recommendedTools).toEqual(orig.recommendedTools);
            expect(rest.rationale).toBe(orig.rationale);
          }

          expect(restored.sections).toHaveLength(compiled.sections.length);
          for (let i = 0; i < compiled.sections.length; i++) {
            const origSec = compiled.sections[i];
            const restSec = restored.sections[i];
            expect(restSec.title).toBe(origSec.title);
            expect(restSec.toolType).toBe(origSec.toolType);
            expect(restSec.subsections).toHaveLength(origSec.subsections.length);
            for (let j = 0; j < origSec.subsections.length; j++) {
              expect(restSec.subsections[j].title).toBe(origSec.subsections[j].title);
              expect(restSec.subsections[j].toolType).toBe(origSec.subsections[j].toolType);
            }
          }

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
