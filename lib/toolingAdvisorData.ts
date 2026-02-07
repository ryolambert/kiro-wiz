import type { KiroToolType } from './types';

// ─── Credit Cost Mapping ───────────────────────────────────

export const CREDIT_COST: Record<
  KiroToolType,
  'none' | 'low' | 'medium' | 'high'
> = {
  spec: 'high',
  hook: 'none',
  'steering-doc': 'none',
  skill: 'none',
  power: 'medium',
  'mcp-server': 'low',
  'custom-agent': 'medium',
  'autonomous-agent': 'high',
  subagent: 'medium',
  'context-provider': 'none',
} as const;

// ─── Hook-Specific Credit Costs ────────────────────────────

export const HOOK_ACTION_CREDIT_COST = {
  runCommand: 'none',
  askAgent: 'medium',
} as const;

// ─── KB Reference Paths ────────────────────────────────────

export const KB_REFS: Record<KiroToolType, string[]> = {
  spec: [
    'knowledge-base/specs/',
    'reference-library/spec/best-practices.md',
  ],
  hook: [
    'knowledge-base/hooks/',
    'reference-library/hook/best-practices.md',
  ],
  'steering-doc': [
    'knowledge-base/steering/',
    'reference-library/steering-doc/best-practices.md',
  ],
  skill: [
    'knowledge-base/skills/',
    'knowledge-base/agent-skills-spec/',
    'reference-library/skill/best-practices.md',
  ],
  power: [
    'knowledge-base/powers/',
    'reference-library/power/best-practices.md',
  ],
  'mcp-server': [
    'knowledge-base/mcp/',
    'reference-library/mcp-server/best-practices.md',
  ],
  'custom-agent': [
    'knowledge-base/cli/',
    'reference-library/custom-agent/best-practices.md',
  ],
  'autonomous-agent': [
    'knowledge-base/autonomous-agent/',
    'reference-library/autonomous-agent/best-practices.md',
  ],
  subagent: [
    'reference-library/subagent/best-practices.md',
  ],
  'context-provider': [
    'knowledge-base/context-providers/',
    'reference-library/context-provider/best-practices.md',
  ],
} as const;

// ─── Use-Case Keyword Matching ─────────────────────────────

export const USE_CASE_KEYWORDS: Record<
  KiroToolType,
  readonly string[]
> = {
  spec: [
    'plan', 'requirements', 'design', 'complex feature',
    'tracking', 'formal', 'architecture', 'multi-step',
  ],
  hook: [
    'automate', 'file save', 'trigger', 'on save',
    'on create', 'on delete', 'lint', 'format', 'event',
    'pre-commit', 'post-commit', 'file change',
  ],
  'steering-doc': [
    'guidelines', 'rules', 'standards', 'coding style',
    'conventions', 'instructions', 'always include',
    'project rules', 'best practices',
  ],
  skill: [
    'reusable', 'portable', 'share', 'domain knowledge',
    'cross-agent', 'agent skill', 'skill',
  ],
  power: [
    'ide integration', 'power', 'rich integration',
    'mcp tools', 'guided workflow', 'ide extension',
  ],
  'mcp-server': [
    'api', 'external service', 'tool server', 'mcp',
    'json-rpc', 'expose tools', 'protocol',
  ],
  'custom-agent': [
    'cli', 'command line', 'cli agent', 'custom agent',
    'terminal', 'cli workflow',
  ],
  'autonomous-agent': [
    'background', 'ci/cd', 'cloud', 'autonomous',
    'long-running', 'unattended', 'scheduled',
  ],
  subagent: [
    'sub-task', 'delegate', 'parallel', 'break down',
    'focused task', 'subagent',
  ],
  'context-provider': [
    'context', 'inject', 'reference', 'chat context',
    '#file', '#folder', '#spec',
  ],
} as const;

// ─── Trade-Off Descriptions ────────────────────────────────

export const TRADE_OFFS: Record<KiroToolType, string[]> = {
  spec: [
    'High upfront effort for formal planning',
    'Best for complex features; overkill for quick fixes',
    'Consumes credits for AI-assisted spec generation',
  ],
  hook: [
    'Shell hooks (runCommand) are free; agent hooks (askAgent) consume credits',
    'Limited to event-driven triggers; not for complex workflows',
    'File pattern scoping is critical to avoid excessive triggers',
  ],
  'steering-doc': [
    'Zero credit cost — loaded as static context',
    'No runtime logic; purely declarative guidance',
    'Always-mode docs consume tokens in every conversation',
  ],
  skill: [
    'Portable across agents and platforms',
    'Progressive disclosure keeps token usage efficient',
    'Requires Agent Skills spec compliance for publishing',
  ],
  power: [
    'Rich IDE integration with MCP tools and steering',
    'IDE-only — not available in CLI workflows',
    'Medium credit cost when MCP tools invoke agent reasoning',
  ],
  'mcp-server': [
    'Cross-platform — works in IDE and CLI',
    'Adds ~10-50ms latency per tool call (stdio)',
    'Requires server process management',
  ],
  'custom-agent': [
    'CLI-only — not available in IDE',
    'Full control over tools, prompts, and resources',
    'Medium credit cost for agent interactions',
  ],
  'autonomous-agent': [
    'Runs independently in the cloud',
    'High credit cost for cloud execution',
    'No real-time user interaction during execution',
  ],
  subagent: [
    'Enables parallel task execution in IDE',
    'IDE-only — delegated by the main agent',
    'Medium credit cost per subagent invocation',
  ],
  'context-provider': [
    'Zero credit cost — injects static context',
    'IDE-only — uses # prefix in chat',
    'Large context injections can overflow token limits',
  ],
} as const;

// ─── Skill-Specific Recommendation Addendum ────────────────

export const SKILL_AUTHORING_REFS = [
  'Agent Skills spec: https://agentskills.io/specification',
  'Validate with skills-ref CLI before publishing',
  'Follow progressive disclosure: ~100 tokens discovery, <5000 tokens activation',
] as const;
