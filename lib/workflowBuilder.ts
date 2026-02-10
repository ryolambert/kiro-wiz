import { install, previewInstall, resolveTargetRoot, rewritePath } from './fileInstaller.js';
import { scaffoldComposite } from './scaffoldingEngine.js';
import { recommend } from './toolingAdvisor.js';
import type {
  AuditFinding,
  AuditReport,
  BuildSummary,
  InstallResult,
  InstallTarget,
  IntegrationPlan,
  IntegrationRequirements,
  KiroToolType,
  OptimizationStep,
  PlatformTarget,
  ScaffoldResult,
  Severity,
} from './types.js';

// ─── Path Mapping ──────────────────────────────────────────

const TOOL_TYPE_PATH_PREFIX: Record<KiroToolType, string> = {
  hook: '.kiro/hooks',
  'steering-doc': '.kiro/steering',
  skill: '.kiro/skills',
  spec: '.kiro/specs',
  power: 'custom-powers',
  'mcp-server': '.kiro/settings',
  'custom-agent': '',
  'autonomous-agent': '',
  subagent: '',
  'context-provider': '.kiro/steering',
} as const;

function toolTypePath(toolType: KiroToolType, name: string): string {
  const prefix = TOOL_TYPE_PATH_PREFIX[toolType];

  switch (toolType) {
    case 'hook':
      return `${prefix}/${name}.kiro.hook`;
    case 'steering-doc':
      return `${prefix}/${name}.md`;
    case 'skill':
      return `${prefix}/${name}/SKILL.md`;
    case 'spec':
      return `${prefix}/${name}/requirements.md`;
    case 'power':
      return `${prefix}/${name}/POWER.md`;
    case 'mcp-server':
      return `${prefix}/mcp.json`;
    case 'custom-agent':
      return 'AGENTS.md';
    case 'autonomous-agent':
      return 'AGENTS.md';
    case 'subagent':
      return 'AGENTS.md';
    case 'context-provider':
      return `${prefix}/${name}-context.md`;
  }
}

// ─── Gather Requirements ───────────────────────────────────

const VALID_PLATFORMS: ReadonlyArray<PlatformTarget> = ['ide', 'cli', 'both'];

export function gatherRequirements(input: {
  targetTech: string;
  automationGoals: string[];
  workflowGoals: string[];
  preferredPlatform: PlatformTarget;
}): IntegrationRequirements {
  const targetTech = input.targetTech.trim();
  if (targetTech.length === 0) {
    throw new Error('targetTech must be a non-empty string');
  }

  const automationGoals = input.automationGoals.map((g) => g.trim()).filter((g) => g.length > 0);

  const workflowGoals = input.workflowGoals.map((g) => g.trim()).filter((g) => g.length > 0);

  const preferredPlatform = VALID_PLATFORMS.includes(input.preferredPlatform)
    ? input.preferredPlatform
    : 'ide';

  return {
    targetTech,
    automationGoals,
    workflowGoals,
    preferredPlatform,
  };
}

// ─── Build Integration Plan ────────────────────────────────

export function buildIntegrationPlan(requirements: IntegrationRequirements): IntegrationPlan {
  const scenario = buildScenarioString(requirements);
  const recommendations = recommend(scenario);

  const files = recommendations.map((rec) => ({
    path: toolTypePath(rec.toolType, toKebab(requirements.targetTech)),
    purpose: rec.rationale,
  }));

  const compositePackage = requirements.preferredPlatform === 'both';

  return { recommendations, files, compositePackage };
}

function buildScenarioString(requirements: IntegrationRequirements): string {
  const parts = [requirements.targetTech];

  if (requirements.automationGoals.length > 0) {
    parts.push(requirements.automationGoals.join(' '));
  }

  if (requirements.workflowGoals.length > 0) {
    parts.push(requirements.workflowGoals.join(' '));
  }

  parts.push(`platform:${requirements.preferredPlatform}`);

  return parts.join(' ');
}

function toKebab(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Build Composite Package ───────────────────────────────

export function buildCompositePackage(requirements: IntegrationRequirements): ScaffoldResult {
  const name = toKebab(requirements.targetTech);
  const description = [
    `Integration for ${requirements.targetTech}.`,
    requirements.automationGoals.length > 0
      ? `Automation: ${requirements.automationGoals.join(', ')}.`
      : '',
    requirements.workflowGoals.length > 0
      ? `Workflows: ${requirements.workflowGoals.join(', ')}.`
      : '',
  ]
    .filter((s) => s.length > 0)
    .join(' ');

  return scaffoldComposite({ name, description });
}

// ─── Install Integration ───────────────────────────────────

export async function installIntegration(
  scaffoldResult: ScaffoldResult,
  target: InstallTarget,
): Promise<InstallResult> {
  return install(scaffoldResult, target);
}

export function previewIntegrationInstall(
  scaffoldResult: ScaffoldResult,
  target: InstallTarget,
): InstallResult {
  return previewInstall(scaffoldResult, target);
}

export function resolveIntegrationPaths(
  plan: IntegrationPlan,
  target: InstallTarget,
): Array<{ path: string; absolutePath: string; purpose: string }> {
  const root = resolveTargetRoot(target);
  return plan.files.map((f) => {
    const rewritten = rewritePath(f.path, target.scope);
    return {
      path: rewritten,
      absolutePath: `${root}/${rewritten}`,
      purpose: f.purpose,
    };
  });
}

// ─── Build Optimization Steps ──────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  recommended: 1,
  optional: 2,
};

export function buildOptimizationSteps(report: AuditReport): OptimizationStep[] {
  const sorted = [...report.findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return sorted.map((finding) => ({
    finding,
    action: buildAction(finding),
    preview: buildPreview(finding),
    applied: false,
  }));
}

function buildAction(finding: AuditFinding): string {
  if (finding.suggestion.length > 0) {
    return finding.suggestion;
  }
  return `Fix ${finding.category} issue in ${finding.file ?? 'workspace'}`;
}

function buildPreview(finding: AuditFinding): string {
  const lines: string[] = [`[${finding.severity.toUpperCase()}] ${finding.message}`];

  if (finding.file) {
    lines.push(`File: ${finding.file}`);
  }

  lines.push(`Action: ${finding.suggestion}`);

  if (finding.kbRef) {
    lines.push(`Reference: ${finding.kbRef}`);
  }

  return lines.join('\n');
}

// ─── Apply Optimization ────────────────────────────────────

export function applyOptimization(step: OptimizationStep): OptimizationStep {
  return { ...step, applied: true };
}

// ─── Generate Build Summary ────────────────────────────────

export function generateBuildSummary(
  plan: IntegrationPlan,
  scaffoldResult: ScaffoldResult,
): BuildSummary {
  const createdFiles = scaffoldResult.files.map((f) => ({
    path: f.path,
    purpose: findPurpose(f.path, plan),
  }));

  const modifiedFiles: BuildSummary['modifiedFiles'] = [];

  const testingInstructions = buildTestingInstructions(plan, scaffoldResult);

  return { createdFiles, modifiedFiles, testingInstructions };
}

function findPurpose(filePath: string, plan: IntegrationPlan): string {
  const match = plan.files.find((f) => f.path === filePath);
  if (match) return match.purpose;

  if (filePath.endsWith('POWER.md')) {
    return 'IDE power manifest';
  }
  if (filePath.endsWith('mcp.json')) {
    return 'MCP server configuration';
  }
  if (filePath.endsWith('.json') && filePath.includes('agents/')) {
    return 'CLI agent configuration';
  }
  if (filePath.endsWith('-prompt.md')) {
    return 'Agent prompt file';
  }
  if (filePath.includes('steering/')) {
    return 'Steering file for guided workflows';
  }

  return 'Generated integration file';
}

function buildTestingInstructions(plan: IntegrationPlan, scaffoldResult: ScaffoldResult): string {
  const lines: string[] = ['## Testing Instructions', ''];

  const hasPower = scaffoldResult.files.some((f) => f.path.endsWith('POWER.md'));
  const hasAgent = scaffoldResult.files.some(
    (f) => f.path.endsWith('.json') && f.path.includes('agents/'),
  );
  const hasMcpJson = scaffoldResult.files.some((f) => f.path.endsWith('mcp.json'));

  if (hasMcpJson) {
    lines.push(
      '### MCP Server',
      '1. Start the MCP server: `npx tsx bin/mcp-server.ts`',
      '2. Verify it responds to health check',
      '',
    );
  }

  if (hasPower) {
    lines.push(
      '### IDE Power',
      '1. Open Kiro IDE',
      '2. Activate the power from the Powers panel',
      '3. Verify steering files load correctly',
      '',
    );
  }

  if (hasAgent) {
    lines.push(
      '### CLI Agent',
      '1. Run the agent via Kiro CLI',
      '2. Verify MCP server connection',
      '3. Test each workflow option',
      '',
    );
  }

  if (plan.compositePackage) {
    lines.push(
      '### Cross-Platform Verification',
      '1. Verify IDE power and CLI agent reference the same MCP server',
      '2. Test identical queries through both delivery paths',
      '3. Confirm consistent results',
      '',
    );
  }

  lines.push('### Generated Files', ...scaffoldResult.files.map((f) => `- \`${f.path}\``), '');

  return lines.join('\n');
}
