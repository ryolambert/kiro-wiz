import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { platformForToolType } from '../../lib/compilerData.js';
import { getPlatformAvailability, recommend } from '../../lib/toolingAdvisor.js';
import { USE_CASE_KEYWORDS } from '../../lib/toolingAdvisorData.js';
import { KIRO_TOOL_TYPES, TOOL_PLATFORM } from '../../lib/types.js';
import type { KiroToolType, PlatformTarget } from '../../lib/types.js';

// ─── Arbitraries ───────────────────────────────────────────

const VALID_PLATFORMS = ['ide', 'cli', 'both'] as const;
const VALID_CREDIT_COSTS = ['none', 'low', 'medium', 'high'] as const;

/**
 * Generates use case strings that mix real keywords from the
 * USE_CASE_KEYWORDS map with arbitrary filler text. This
 * ensures we test both keyword-matching and fallback paths.
 */
const allKeywords = Object.values(USE_CASE_KEYWORDS).flat();

const arbKeywordUseCase: fc.Arbitrary<string> = fc
  .tuple(fc.constantFrom(...allKeywords), fc.string({ minLength: 0, maxLength: 50 }))
  .map(([keyword, filler]) => `${filler} ${keyword} ${filler}`);

const arbArbitraryUseCase: fc.Arbitrary<string> = fc.string({
  minLength: 1,
  maxLength: 100,
});

const arbUseCase: fc.Arbitrary<string> = fc.oneof(
  { weight: 3, arbitrary: arbKeywordUseCase },
  { weight: 1, arbitrary: arbArbitraryUseCase },
);

// ─── Property 19 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 19: Recommendation
 * completeness**
 * **Validates: Requirements 6.1, 6.2, 6.3**
 *
 * For any use case string, the recommend() function SHALL
 * return recommendations where each recommendation has:
 * - A valid KiroToolType
 * - A non-empty rationale
 * - At least one KB reference
 * - A non-null template
 * - At least one trade-off
 * - A valid platform value
 * - A valid creditCost value
 */
describe('Property 19: Recommendation completeness', () => {
  it('recommend() returns at least one recommendation for any use case', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);
        expect(results.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a valid KiroToolType', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(KIRO_TOOL_TYPES).toContain(rec.toolType);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a non-empty rationale', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(rec.rationale.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has at least one KB reference', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(rec.kbRefs.length).toBeGreaterThanOrEqual(1);
          for (const ref of rec.kbRefs) {
            expect(ref.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a non-null template', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(rec.template).not.toBeNull();
          expect(typeof rec.template === 'string' && rec.template.length > 0).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has at least one trade-off', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(rec.tradeOffs.length).toBeGreaterThanOrEqual(1);
          for (const tradeOff of rec.tradeOffs) {
            expect(tradeOff.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a valid platform value', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(VALID_PLATFORMS).toContain(rec.platform);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a valid creditCost value', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(VALID_CREDIT_COSTS).toContain(rec.creditCost);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Platform Classification Constants ─────────────────────

const IDE_ONLY_TOOLS: KiroToolType[] = ['power', 'spec', 'subagent', 'context-provider'];

const CLI_ONLY_TOOLS: KiroToolType[] = ['custom-agent'];

const CROSS_PLATFORM_TOOLS: KiroToolType[] = ['hook', 'steering-doc', 'skill', 'mcp-server'];

const CLOUD_TOOLS: KiroToolType[] = ['autonomous-agent'];

const EXPECTED_PLATFORM: Record<KiroToolType, PlatformTarget> = {
  spec: 'ide',
  hook: 'both',
  'steering-doc': 'both',
  skill: 'both',
  power: 'ide',
  'mcp-server': 'both',
  'custom-agent': 'cli',
  'autonomous-agent': 'both',
  subagent: 'ide',
  'context-provider': 'ide',
};

// ─── Tool-Type Targeted Arbitrary ──────────────────────────

/**
 * Generates a use case string guaranteed to match a specific
 * tool type by embedding one of its keywords.
 */
function arbUseCaseForToolType(toolType: KiroToolType): fc.Arbitrary<string> {
  const keywords = USE_CASE_KEYWORDS[toolType];

  return fc
    .tuple(fc.constantFrom(...keywords), fc.string({ minLength: 0, maxLength: 30 }))
    .map(([kw, filler]) => `${filler} ${kw}`);
}

const arbToolType: fc.Arbitrary<KiroToolType> = fc.constantFrom(...KIRO_TOOL_TYPES);

// ─── Property 20 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 20: Platform
 * compatibility correctness**
 * **Validates: Requirements 6.4**
 *
 * For any recommendation returned by recommend(), the platform
 * field SHALL correctly reflect the TOOL_PLATFORM mapping:
 * - IDE-only tools (powers, specs, subagents,
 *   context-provider) → platform 'ide'
 * - CLI-only tools (custom-agent) → platform 'cli'
 * - Cross-platform tools (hooks, steering, skills, MCP)
 *   → platform 'both'
 * - Cloud tools (autonomous-agent) → platform 'both'
 *
 * The Tooling_Advisor SHALL distinguish between IDE-only,
 * CLI-only, cross-platform, and cloud features.
 */
describe('Property 20: Platform compatibility correctness', () => {
  it('every recommendation platform matches TOOL_PLATFORM mapping', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          const expected = EXPECTED_PLATFORM[rec.toolType];
          expect(rec.platform).toBe(expected);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('IDE-only tools always map to platform "ide"', () => {
    fc.assert(
      fc.property(fc.constantFrom(...IDE_ONLY_TOOLS), (toolType) => {
        const keywords = USE_CASE_KEYWORDS[toolType];
        const useCase = keywords.join(' ');
        const results = recommend(useCase);
        const match = results.find((r) => r.toolType === toolType);

        expect(match).toBeDefined();
        expect(match?.platform).toBe('ide');
      }),
      { numRuns: 100 },
    );
  });

  it('CLI-only tools always map to platform "cli"', () => {
    fc.assert(
      fc.property(fc.constantFrom(...CLI_ONLY_TOOLS), (toolType) => {
        const keywords = USE_CASE_KEYWORDS[toolType];
        const useCase = keywords.join(' ');
        const results = recommend(useCase);
        const match = results.find((r) => r.toolType === toolType);

        expect(match).toBeDefined();
        expect(match?.platform).toBe('cli');
      }),
      { numRuns: 100 },
    );
  });

  it('cross-platform tools always map to platform "both"', () => {
    fc.assert(
      fc.property(fc.constantFrom(...CROSS_PLATFORM_TOOLS), (toolType) => {
        const keywords = USE_CASE_KEYWORDS[toolType];
        const useCase = keywords.join(' ');
        const results = recommend(useCase);
        const match = results.find((r) => r.toolType === toolType);

        expect(match).toBeDefined();
        expect(match?.platform).toBe('both');
      }),
      { numRuns: 100 },
    );
  });

  it('cloud tools (autonomous-agent) map to platform "both"', () => {
    fc.assert(
      fc.property(fc.constantFrom(...CLOUD_TOOLS), (toolType) => {
        const keywords = USE_CASE_KEYWORDS[toolType];
        const useCase = keywords.join(' ');
        const results = recommend(useCase);
        const match = results.find((r) => r.toolType === toolType);

        expect(match).toBeDefined();
        expect(match?.platform).toBe('both');
      }),
      { numRuns: 100 },
    );
  });

  it('TOOL_PLATFORM covers all KIRO_TOOL_TYPES', () => {
    fc.assert(
      fc.property(arbToolType, (toolType) => {
        const rawPlatform = TOOL_PLATFORM[toolType];
        expect(rawPlatform).toBeDefined();
        expect(['ide-only', 'cli-only', 'both', 'cloud']).toContain(rawPlatform);
      }),
      { numRuns: 100 },
    );
  });

  it('platformForToolType converts raw platform to PlatformTarget correctly', () => {
    fc.assert(
      fc.property(arbToolType, (toolType) => {
        const raw = TOOL_PLATFORM[toolType];
        const converted = platformForToolType(toolType);

        if (raw === 'ide-only') {
          expect(converted).toBe('ide');
        } else if (raw === 'cli-only') {
          expect(converted).toBe('cli');
        } else {
          expect(converted).toBe('both');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('getPlatformAvailability returns correct mapping for all tool types', () => {
    fc.assert(
      fc.property(arbToolType, (toolType) => {
        const availability = getPlatformAvailability();
        const raw = availability[toolType];

        expect(raw).toBe(TOOL_PLATFORM[toolType]);
      }),
      { numRuns: 100 },
    );
  });

  it('keyword-targeted use cases produce recommendations with correct platform', () => {
    fc.assert(
      fc.property(
        arbToolType.chain((tt) => arbUseCaseForToolType(tt).map((uc) => [tt, uc] as const)),
        ([toolType, useCase]) => {
          const results = recommend(useCase);
          const match = results.find((r) => r.toolType === toolType);

          if (match) {
            expect(match.platform).toBe(EXPECTED_PLATFORM[toolType]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Scoring Helper (mirrors lib/toolingAdvisor.ts) ────────

/**
 * Replicates the scoring logic from toolingAdvisor.ts so we
 * can independently verify ranking order in property tests.
 */
function scoreToolType(useCase: string, toolType: KiroToolType): number {
  const lower = useCase.toLowerCase();
  const keywords = USE_CASE_KEYWORDS[toolType];
  let score = 0;

  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      score += 1;
    }
  }

  return score;
}

// ─── Multi-Match Arbitrary ─────────────────────────────────

/**
 * Generates a use case string that matches at least two
 * different tool types by embedding keywords from two
 * distinct tool types.
 */
const arbMultiMatchUseCase: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom(...KIRO_TOOL_TYPES),
    fc.constantFrom(...KIRO_TOOL_TYPES),
    fc.string({ minLength: 0, maxLength: 20 }),
  )
  .filter(([a, b]) => a !== b)
  .map(([typeA, typeB, filler]) => {
    const kwA = USE_CASE_KEYWORDS[typeA][0];
    const kwB = USE_CASE_KEYWORDS[typeB][0];
    return `${filler} ${kwA} ${kwB}`;
  });

// ─── Property 21 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 21: Ranking and
 * trade-offs**
 * **Validates: Requirements 6.5**
 *
 * For any use case where multiple tool types match:
 * - The recommendations SHALL be ranked by relevance
 *   (keyword match score)
 * - Each recommendation SHALL include trade-offs explaining
 *   why it may or may not be the best fit
 * - Credit cost implications SHALL be included in trade-offs
 *   or creditCost field
 * - When multiple tools match, the first recommendation
 *   should have the highest keyword match score
 */
describe('Property 21: Ranking and trade-offs', () => {
  it('recommendations are sorted by descending keyword match score', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        if (results.length < 2) return;

        const scores = results.map((r) => scoreToolType(useCase, r.toolType));

        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('first recommendation has the highest keyword match score when multiple match', () => {
    fc.assert(
      fc.property(arbMultiMatchUseCase, (useCase) => {
        const results = recommend(useCase);

        expect(results.length).toBeGreaterThanOrEqual(2);

        const firstScore = scoreToolType(useCase, results[0].toolType);

        for (const rec of results.slice(1)) {
          const score = scoreToolType(useCase, rec.toolType);
          expect(firstScore).toBeGreaterThanOrEqual(score);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation includes non-empty trade-offs', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          expect(rec.tradeOffs.length).toBeGreaterThanOrEqual(1);

          for (const tradeOff of rec.tradeOffs) {
            expect(typeof tradeOff).toBe('string');
            expect(tradeOff.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has credit cost in creditCost field or trade-offs', () => {
    fc.assert(
      fc.property(arbUseCase, (useCase) => {
        const results = recommend(useCase);
        const validCosts = ['none', 'low', 'medium', 'high'];

        for (const rec of results) {
          const hasCreditCostField = validCosts.includes(rec.creditCost);
          const hasCreditInTradeOffs = rec.tradeOffs.some(
            (t) =>
              t.toLowerCase().includes('credit') ||
              t.toLowerCase().includes('cost') ||
              t.toLowerCase().includes('free'),
          );

          expect(hasCreditCostField || hasCreditInTradeOffs).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('only matching tool types are returned when keywords match', () => {
    fc.assert(
      fc.property(arbMultiMatchUseCase, (useCase) => {
        const results = recommend(useCase);

        for (const rec of results) {
          const score = scoreToolType(useCase, rec.toolType);
          expect(score).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('keyword-targeted use case ranks the targeted tool type first or tied-first', () => {
    fc.assert(
      fc.property(
        arbToolType.chain((tt) => arbUseCaseForToolType(tt).map((uc) => [tt, uc] as const)),
        ([toolType, useCase]) => {
          const results = recommend(useCase);
          const targetScore = scoreToolType(useCase, toolType);
          const firstScore = scoreToolType(useCase, results[0].toolType);

          // The targeted tool type should score at least
          // as high as the first result (tied-first) or
          // appear in the results
          expect(firstScore).toBeGreaterThanOrEqual(targetScore);

          const match = results.find((r) => r.toolType === toolType);

          if (match) {
            const matchScore = scoreToolType(useCase, match.toolType);
            expect(matchScore).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
