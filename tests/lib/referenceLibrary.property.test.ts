import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { TOOL_TYPE_DISPLAY } from '../../lib/compilerData.js';
import { generate, generateAll } from '../../lib/referenceLibrary.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';
import type { DocType, KiroToolType } from '../../lib/types.js';

// ─── Arbitraries ───────────────────────────────────────────

const arbToolType: fc.Arbitrary<KiroToolType> = fc.constantFrom(...KIRO_TOOL_TYPES);

const DOC_TYPES: readonly DocType[] = ['best-practices', 'examples', 'templates'] as const;

const arbDocType: fc.Arbitrary<DocType> = fc.constantFrom(...DOC_TYPES);

// ─── Property 27 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 27: Reference library
 * per-tool-type coverage**
 * **Validates: Requirements 4.7, 4.8, 4.9**
 *
 * For any KiroToolType, `generate()` SHALL produce a
 * ReferenceDocument for each of the 3 doc types
 * (best-practices, examples, templates), and each document
 * SHALL have non-empty content with a title containing the
 * tool type display name.
 */
describe('Property 27: Reference library per-tool-type coverage', () => {
  it('generate() produces a document for each doc type with non-empty content and correct title', () => {
    fc.assert(
      fc.property(arbToolType, (toolType) => {
        const display = TOOL_TYPE_DISPLAY[toolType];

        for (const docType of DOC_TYPES) {
          const doc = generate(toolType, docType);

          // Correct tool type and doc type
          expect(doc.toolType).toBe(toolType);
          expect(doc.docType).toBe(docType);

          // Non-empty content
          expect(doc.content.length).toBeGreaterThan(0);

          // Title contains the tool type display name
          expect(doc.title).toContain(display);

          // Non-empty title
          expect(doc.title.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('generateAll() produces exactly 3 documents per tool type', () => {
    fc.assert(
      fc.property(arbToolType, (toolType) => {
        const all = generateAll();
        const forType = all.filter((d) => d.toolType === toolType);

        expect(forType).toHaveLength(3);

        const docTypes = forType.map((d) => d.docType).sort();
        expect(docTypes).toEqual(['best-practices', 'examples', 'templates']);
      }),
      { numRuns: 100 },
    );
  });

  it('generateAll() total count equals tool types * 3', () => {
    const all = generateAll();
    expect(all).toHaveLength(KIRO_TOOL_TYPES.length * 3);
  });
});

// ─── Property 28 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 28: Reference library
 * cross-referencing**
 * **Validates: Requirements 4.10**
 *
 * For any KiroToolType and any docType, the generated
 * document's crossRefs SHALL include a link to the master
 * reference and links to the other 2 sibling doc types
 * (but not itself).
 */
describe('Property 28: Reference library cross-referencing', () => {
  it('crossRefs include a master reference link', () => {
    fc.assert(
      fc.property(arbToolType, arbDocType, (toolType, docType) => {
        const doc = generate(toolType, docType);

        const hasMasterRef = doc.crossRefs.some(
          (ref) => ref.includes('Master Reference') && ref.includes('master-reference.md'),
        );

        expect(hasMasterRef).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('crossRefs include links to the other 2 sibling doc types but not itself', () => {
    fc.assert(
      fc.property(arbToolType, arbDocType, (toolType, docType) => {
        const doc = generate(toolType, docType);
        const siblings = DOC_TYPES.filter((d) => d !== docType);

        // Each sibling doc type has a link
        for (const sib of siblings) {
          const hasSiblingRef = doc.crossRefs.some((ref) => ref.includes(`${sib}.md`));
          expect(hasSiblingRef).toBe(true);
        }

        // No self-reference
        const hasSelfRef = doc.crossRefs.some(
          (ref) => ref.includes(`${docType}.md`) && !ref.includes('master-reference.md'),
        );
        expect(hasSelfRef).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('crossRefs contain exactly 3 entries (1 master + 2 siblings)', () => {
    fc.assert(
      fc.property(arbToolType, arbDocType, (toolType, docType) => {
        const doc = generate(toolType, docType);
        expect(doc.crossRefs).toHaveLength(3);
      }),
      { numRuns: 100 },
    );
  });
});
