import { DECISION_MATRIX_DATA, TOOL_TYPE_DISPLAY, platformForToolType } from './compilerData';
import { TEMPLATES_CONTENT } from './refDataTemplates';
import {
  CREDIT_COST,
  HOOK_ACTION_CREDIT_COST,
  KB_REFS,
  SKILL_AUTHORING_REFS,
  TRADE_OFFS,
  USE_CASE_KEYWORDS,
} from './toolingAdvisorData';
import type { DecisionMatrixEntry, KiroToolType, ToolRecommendation } from './types';
import { KIRO_TOOL_TYPES, TOOL_PLATFORM } from './types';

// ─── Use-Case Scoring ──────────────────────────────────────

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

// ─── Build Single Recommendation ───────────────────────────

function buildRecommendation(toolType: KiroToolType): ToolRecommendation {
  const isSkill = toolType === 'skill';
  const kbRefs = [...KB_REFS[toolType]];

  if (isSkill) {
    kbRefs.push(...SKILL_AUTHORING_REFS);
  }

  const rationale = buildRationale(toolType);

  return {
    toolType,
    rationale,
    kbRefs,
    template: TEMPLATES_CONTENT[toolType].trim(),
    tradeOffs: [...TRADE_OFFS[toolType]],
    platform: platformForToolType(toolType),
    creditCost: CREDIT_COST[toolType],
  };
}

function buildRationale(toolType: KiroToolType): string {
  const data = DECISION_MATRIX_DATA[toolType];
  const platform = TOOL_PLATFORM[toolType];
  const display = TOOL_TYPE_DISPLAY[toolType];

  const parts = [
    `${display}: ${data.whatItIs}.`,
    `Best when: ${data.whenToUse}.`,
    `Platform: ${platform}.`,
  ];

  if (toolType === 'skill') {
    parts.push(
      'Author with Agent Skills spec best practices ' + 'and validate with skills-ref CLI.',
    );
  }

  return parts.join(' ');
}

// ─── Recommend ─────────────────────────────────────────────

export function recommend(useCase: string): ToolRecommendation[] {
  const scored = KIRO_TOOL_TYPES.map((toolType) => ({
    toolType,
    score: scoreToolType(useCase, toolType),
  }));

  scored.sort((a, b) => b.score - a.score);

  const hasMatches = scored[0].score > 0;

  const ranked = hasMatches ? scored.filter((s) => s.score > 0) : scored.slice(0, 3);

  return ranked.map((s) => buildRecommendation(s.toolType));
}

// ─── Get Template ──────────────────────────────────────────

export function getTemplate(toolType: KiroToolType): string {
  return TEMPLATES_CONTENT[toolType].trim();
}

// ─── Get Decision Matrix ───────────────────────────────────

export function getDecisionMatrix(): string {
  const header = [
    '| Tool Type | What It Is | When to Use |',
    '| When NOT to Use | Alternatives | Platform |',
    '| Credit Cost |',
  ].join(' ');

  const separator = ['| --- | --- | --- | --- | --- | --- | --- |'].join('');

  const rows = KIRO_TOOL_TYPES.map((toolType) => {
    const d = DECISION_MATRIX_DATA[toolType];
    const platform = TOOL_PLATFORM[toolType];
    const cost = CREDIT_COST[toolType];
    const display = TOOL_TYPE_DISPLAY[toolType];
    const alts = d.alternatives.join(', ') || 'none';

    return (
      `| ${display} | ${d.whatItIs} | ${d.whenToUse} ` +
      `| ${d.whenNotToUse} | ${alts} | ${platform} ` +
      `| ${cost} |`
    );
  });

  return [header, separator, ...rows].join('\n');
}

// ─── Get Decision Matrix Entries ───────────────────────────

export function getDecisionMatrixEntries(): DecisionMatrixEntry[] {
  return KIRO_TOOL_TYPES.map((toolType) => ({
    toolType,
    ...DECISION_MATRIX_DATA[toolType],
    platform: platformForToolType(toolType),
  }));
}

// ─── Platform Availability ─────────────────────────────────

export function getPlatformAvailability(): Record<
  KiroToolType,
  'ide-only' | 'cli-only' | 'both' | 'cloud'
> {
  return { ...TOOL_PLATFORM };
}

// ─── Hook Credit Cost Helper ───────────────────────────────

export function getHookCreditCost(actionType: 'runCommand' | 'askAgent'): 'none' | 'medium' {
  return HOOK_ACTION_CREDIT_COST[actionType];
}
