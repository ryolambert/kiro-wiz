import type {
  DecisionMatrixEntry,
  KiroToolType,
  PlatformTarget,
  ScenarioMapping,
  UrlCategory,
} from './types';
import { KIRO_TOOL_TYPES, TOOL_PLATFORM } from './types';

// ─── Category → Tool Type Mapping ──────────────────────────

const CATEGORY_TO_TOOL_TYPE: Partial<Record<UrlCategory, KiroToolType>> = {
  specs: 'spec',
  hooks: 'hook',
  steering: 'steering-doc',
  skills: 'skill',
  powers: 'power',
  mcp: 'mcp-server',
  cli: 'custom-agent',
  'autonomous-agent': 'autonomous-agent',
  'context-providers': 'context-provider',
};

export function categoryToToolType(category: UrlCategory): KiroToolType | null {
  return CATEGORY_TO_TOOL_TYPE[category] ?? null;
}

// ─── Anchor Generation ─────────────────────────────────────

export function toAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Tool Type Display Names ───────────────────────────────

export const TOOL_TYPE_DISPLAY: Record<KiroToolType, string> = {
  spec: 'Specs',
  hook: 'Hooks',
  'steering-doc': 'Steering Docs',
  skill: 'Skills',
  power: 'Powers',
  'mcp-server': 'MCP Servers',
  'custom-agent': 'Custom Agents (CLI)',
  'autonomous-agent': 'Autonomous Agent',
  subagent: 'Subagents',
  'context-provider': 'Context Providers',
};

// ─── Decision Matrix Data ──────────────────────────────────

export const DECISION_MATRIX_DATA: Record<
  KiroToolType,
  Omit<DecisionMatrixEntry, 'toolType' | 'platform'>
> = {
  spec: {
    whatItIs: 'Structured requirements, design, and task documents',
    whenToUse: 'Complex features needing formal planning and tracking',
    whenNotToUse: 'Quick fixes or simple changes',
    alternatives: ['steering-doc', 'skill'],
  },
  hook: {
    whatItIs: 'Automated actions triggered by IDE/CLI events',
    whenToUse: 'Automating repetitive tasks on file save, create, or delete',
    whenNotToUse: 'One-time operations or complex multi-step workflows',
    alternatives: ['steering-doc', 'custom-agent'],
  },
  'steering-doc': {
    whatItIs: 'Markdown instructions loaded into agent context',
    whenToUse: 'Providing persistent coding guidelines or project rules',
    whenNotToUse: 'Dynamic behavior that needs runtime logic',
    alternatives: ['skill', 'hook'],
  },
  skill: {
    whatItIs: 'Portable agent skills following the Agent Skills spec',
    whenToUse: 'Reusable domain knowledge shareable across agents',
    whenNotToUse: 'IDE-specific UI integrations or one-off scripts',
    alternatives: ['steering-doc', 'power'],
  },
  power: {
    whatItIs: 'IDE extension with docs, MCP servers, and steering',
    whenToUse: 'Rich IDE integrations with tool access and guided workflows',
    whenNotToUse: 'CLI-only workflows or simple text guidance',
    alternatives: ['skill', 'custom-agent'],
  },
  'mcp-server': {
    whatItIs: 'Model Context Protocol server exposing tools via JSON-RPC',
    whenToUse: 'Exposing external APIs or services to AI agents',
    whenNotToUse: 'Simple file-based knowledge or static documentation',
    alternatives: ['power', 'custom-agent'],
  },
  'custom-agent': {
    whatItIs: 'CLI agent with custom prompt, tools, and MCP servers',
    whenToUse: 'CLI-specific workflows with custom tool configurations',
    whenNotToUse: 'IDE-only features or simple steering',
    alternatives: ['power', 'hook'],
  },
  'autonomous-agent': {
    whatItIs: 'Cloud-hosted agent running tasks autonomously',
    whenToUse: 'Long-running tasks, CI/CD integration, background work',
    whenNotToUse: 'Interactive development or quick local operations',
    alternatives: ['custom-agent', 'hook'],
  },
  subagent: {
    whatItIs: 'Delegated agent invoked by the main IDE agent',
    whenToUse: 'Breaking complex tasks into focused sub-tasks',
    whenNotToUse: 'Simple single-step operations',
    alternatives: ['hook', 'steering-doc'],
  },
  'context-provider': {
    whatItIs: '#-prefixed references injecting context into chat',
    whenToUse: 'Providing files, folders, or specs as chat context',
    whenNotToUse: 'Automated workflows or programmatic tool access',
    alternatives: ['steering-doc', 'skill'],
  },
};

// ─── Quick Reference Scenarios ─────────────────────────────

export const QUICK_REFERENCE_SCENARIOS: ScenarioMapping[] = [
  {
    scenario: 'I want to automate on file save',
    recommendedTools: ['hook'],
    rationale: 'Hooks trigger on file events like save, create, delete',
  },
  {
    scenario: 'I want to enforce coding standards',
    recommendedTools: ['steering-doc', 'hook'],
    rationale: 'Steering docs provide persistent rules; hooks automate checks',
  },
  {
    scenario: 'I want to plan a complex feature',
    recommendedTools: ['spec'],
    rationale: 'Specs provide structured requirements, design, and task tracking',
  },
  {
    scenario: 'I want to share knowledge across agents',
    recommendedTools: ['skill', 'mcp-server'],
    rationale: 'Skills are portable; MCP servers expose tools to any agent',
  },
  {
    scenario: 'I want a rich IDE integration',
    recommendedTools: ['power'],
    rationale: 'Powers combine docs, MCP servers, and steering for IDE',
  },
  {
    scenario: 'I want to expose an API to AI agents',
    recommendedTools: ['mcp-server'],
    rationale: 'MCP servers expose tools via JSON-RPC to any MCP client',
  },
  {
    scenario: 'I want a CLI-specific workflow',
    recommendedTools: ['custom-agent'],
    rationale: 'Custom agents configure CLI-specific tools and prompts',
  },
  {
    scenario: 'I want to run tasks in the background',
    recommendedTools: ['autonomous-agent'],
    rationale: 'Autonomous agents run cloud-hosted tasks independently',
  },
  {
    scenario: 'I want to break a task into sub-tasks',
    recommendedTools: ['subagent'],
    rationale: 'Subagents handle focused sub-tasks delegated by the main agent',
  },
  {
    scenario: 'I want to inject context into chat',
    recommendedTools: ['context-provider'],
    rationale: 'Context providers use # references to inject files and specs',
  },
  {
    scenario: 'I want to validate configs on commit',
    recommendedTools: ['hook', 'custom-agent'],
    rationale: 'Hooks trigger on events; CLI agents run validation scripts',
  },
  {
    scenario: 'I want cross-platform tool access',
    recommendedTools: ['mcp-server', 'skill', 'steering-doc'],
    rationale: 'MCP, skills, and steering work on both IDE and CLI',
  },
];

// ─── Platform Mapping ──────────────────────────────────────

export function platformForToolType(toolType: KiroToolType): PlatformTarget {
  const p = TOOL_PLATFORM[toolType];
  if (p === 'ide-only') return 'ide';
  if (p === 'cli-only') return 'cli';
  return 'both';
}

// ─── Build Decision Matrix ─────────────────────────────────

export function buildDecisionMatrix(toolTypes: KiroToolType[] | null): DecisionMatrixEntry[] {
  const types = toolTypes ?? [...KIRO_TOOL_TYPES];

  return types.map((toolType) => ({
    toolType,
    ...DECISION_MATRIX_DATA[toolType],
    platform: platformForToolType(toolType),
  }));
}
