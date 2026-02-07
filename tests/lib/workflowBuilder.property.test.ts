import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  gatherRequirements,
  buildIntegrationPlan,
  buildCompositePackage,
  generateBuildSummary,
} from '../../lib/workflowBuilder.js';
import { scaffoldTool } from '../../lib/scaffoldingEngine.js';
import {
  MCP_DOC_SERVER_NAME,
  MCP_DOC_SERVER_COMMAND,
  MCP_DOC_SERVER_ARGS,
} from '../../lib/scaffoldingEngineUtils.js';
import type {
  PlatformTarget,
  IntegrationRequirements,
  KiroToolType,
} from '../../lib/types.js';

// ─── Arbitraries ───────────────────────────────────────────

const VALID_PLATFORMS: ReadonlyArray<PlatformTarget> = [
  'ide',
  'cli',
  'both',
];

const arbPlatform: fc.Arbitrary<PlatformTarget> =
  fc.constantFrom<PlatformTarget>(...VALID_PLATFORMS);

const arbTargetTech: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 60 })
  .filter((s) => /[a-zA-Z0-9]/.test(s) && s.trim().length > 0);

const arbGoal: fc.Arbitrary<string> = fc.string({
  minLength: 1,
  maxLength: 80,
});

const arbGoals: fc.Arbitrary<string[]> = fc.array(arbGoal, {
  minLength: 0,
  maxLength: 5,
});

const arbRequirementsInput = fc.record({
  targetTech: arbTargetTech,
  automationGoals: arbGoals,
  workflowGoals: arbGoals,
  preferredPlatform: arbPlatform,
});

function toRequirements(input: {
  targetTech: string;
  automationGoals: string[];
  workflowGoals: string[];
  preferredPlatform: PlatformTarget;
}): IntegrationRequirements {
  return gatherRequirements(input);
}

// ─── Property 29 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 29: Recommendation
 * includes usage patterns and trade-offs**
 * **Validates: Requirements 10.3, 10.4**
 *
 * For any integration requirements, the Workflow Builder's
 * buildIntegrationPlan() SHALL produce recommendations that
 * include usage patterns (rationale) and trade-offs for each
 * recommended tool type.
 */
describe('Property 29: Recommendation includes usage patterns and trade-offs', () => {
  it('every recommendation has a non-empty rationale (usage pattern)', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);

        expect(plan.recommendations.length).toBeGreaterThanOrEqual(1);

        for (const rec of plan.recommendations) {
          expect(typeof rec.rationale).toBe('string');
          expect(rec.rationale.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('every recommendation has a tradeOffs array', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);

        for (const rec of plan.recommendations) {
          expect(Array.isArray(rec.tradeOffs)).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('plan contains at least one file entry', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);

        expect(plan.files.length).toBeGreaterThanOrEqual(1);

        for (const file of plan.files) {
          expect(typeof file.path).toBe('string');
          expect(file.path.length).toBeGreaterThan(0);
          expect(typeof file.purpose).toBe('string');
          expect(file.purpose.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('compositePackage is true when preferredPlatform is "both"', () => {
    const arbBothInput = fc.record({
      targetTech: arbTargetTech,
      automationGoals: arbGoals,
      workflowGoals: arbGoals,
      preferredPlatform: fc.constant('both' as PlatformTarget),
    });

    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);

        expect(plan.compositePackage).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('compositePackage is false when preferredPlatform is not "both"', () => {
    const arbNonBothPlatform = fc.constantFrom<PlatformTarget>(
      'ide',
      'cli',
    );

    const arbNonBothInput = fc.record({
      targetTech: arbTargetTech,
      automationGoals: arbGoals,
      workflowGoals: arbGoals,
      preferredPlatform: arbNonBothPlatform,
    });

    fc.assert(
      fc.property(arbNonBothInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);

        expect(plan.compositePackage).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 30 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 30: Workflow Builder
 * generated files are valid**
 * **Validates: Requirements 10.5, 10.8**
 *
 * For any approved recommendation, the Workflow Builder SHALL
 * generate configuration files that pass schema validation and
 * follow best practices from the Reference Library.
 */
describe('Property 30: Workflow Builder generated files are valid', () => {
  const arbBothRequirementsInput = fc.record({
    targetTech: arbTargetTech,
    automationGoals: arbGoals,
    workflowGoals: arbGoals,
    preferredPlatform: fc.constant('both' as PlatformTarget),
  });

  it('buildCompositePackage produces non-empty files for platform="both"', () => {
    fc.assert(
      fc.property(arbBothRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const result = buildCompositePackage(reqs);

        expect(result.files.length).toBeGreaterThanOrEqual(1);

        for (const file of result.files) {
          expect(file.content.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('scaffoldTool generates parseable JSON for JSON-producing tool types', () => {
    const jsonToolTypes: ReadonlyArray<KiroToolType> = [
      'hook',
      'mcp-server',
      'custom-agent',
      'autonomous-agent',
      'subagent',
    ];

    const arbJsonToolType = fc.constantFrom<KiroToolType>(
      ...jsonToolTypes,
    );

    const arbScaffoldOptions = fc.record({
      toolType: arbJsonToolType,
      name: arbTargetTech,
      description: fc.string({ minLength: 1, maxLength: 120 }),
    });

    fc.assert(
      fc.property(arbScaffoldOptions, ({ toolType, name, description }) => {
        const result = scaffoldTool(toolType, { name, description });

        const jsonFiles = result.files.filter(
          (f) => f.path.endsWith('.json'),
        );

        for (const file of jsonFiles) {
          expect(() => JSON.parse(file.content)).not.toThrow();
        }
      }),
      { numRuns: 100 },
    );
  });

  it('composite package files have non-empty content and valid paths', () => {
    fc.assert(
      fc.property(arbBothRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const result = buildCompositePackage(reqs);

        for (const file of result.files) {
          expect(typeof file.path).toBe('string');
          expect(file.path.trim().length).toBeGreaterThan(0);
          expect(typeof file.content).toBe('string');
          expect(file.content.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 31 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 31: Build summary
 * completeness**
 * **Validates: Requirements 10.10**
 *
 * When the Workflow Builder completes an integration build, it
 * SHALL produce a summary listing all created files, their
 * purposes, and instructions for testing the new integration.
 */
describe('Property 31: Build summary completeness', () => {
  it('createdFiles lists every scaffolded file', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);
        const scaffold = buildCompositePackage(reqs);
        const summary = generateBuildSummary(plan, scaffold);

        const createdPaths = summary.createdFiles.map(
          (f) => f.path,
        );
        for (const file of scaffold.files) {
          expect(createdPaths).toContain(file.path);
        }

        expect(summary.createdFiles.length).toBe(
          scaffold.files.length,
        );
      }),
      { numRuns: 100 },
    );
  });

  it('each createdFile has a non-empty path and purpose', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);
        const scaffold = buildCompositePackage(reqs);
        const summary = generateBuildSummary(plan, scaffold);

        for (const file of summary.createdFiles) {
          expect(typeof file.path).toBe('string');
          expect(file.path.trim().length).toBeGreaterThan(0);
          expect(typeof file.purpose).toBe('string');
          expect(file.purpose.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('testingInstructions is a non-empty string', () => {
    fc.assert(
      fc.property(arbRequirementsInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);
        const scaffold = buildCompositePackage(reqs);
        const summary = generateBuildSummary(plan, scaffold);

        expect(typeof summary.testingInstructions).toBe('string');
        expect(
          summary.testingInstructions.trim().length,
        ).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('composite packages mention cross-platform verification in testingInstructions', () => {
    const arbBothInput = fc.record({
      targetTech: arbTargetTech,
      automationGoals: arbGoals,
      workflowGoals: arbGoals,
      preferredPlatform: fc.constant('both' as PlatformTarget),
    });

    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = toRequirements(input);
        const plan = buildIntegrationPlan(reqs);
        const scaffold = buildCompositePackage(reqs);
        const summary = generateBuildSummary(plan, scaffold);

        expect(plan.compositePackage).toBe(true);
        expect(
          summary.testingInstructions.toLowerCase(),
        ).toContain('cross-platform');
      }),
      { numRuns: 100 },
    );
  });
});


// ─── Property 41 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 41: Workflow Builder
 * platform-coordinated output**
 * **Validates: Requirements 10.14**
 *
 * For any integration request with platform="both", the
 * Workflow_Builder output SHALL contain a shared MCP server
 * config, an IDE power, and a CLI agent, with all MCP server
 * references pointing to the same instance.
 */
describe('Property 41: Workflow Builder platform-coordinated output', () => {
  const arbBothInput = fc.record({
    targetTech: arbTargetTech,
    automationGoals: arbGoals,
    workflowGoals: arbGoals,
    preferredPlatform: fc.constant('both' as PlatformTarget),
  });

  it('output contains a POWER.md file (IDE power)', () => {
    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = gatherRequirements(input);
        const result = buildCompositePackage(reqs);

        const powerMdFiles = result.files.filter((f) =>
          f.path.endsWith('POWER.md'),
        );
        expect(powerMdFiles.length).toBeGreaterThanOrEqual(1);
        expect(powerMdFiles[0].content.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('output contains an mcp.json file (shared MCP server config)', () => {
    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = gatherRequirements(input);
        const result = buildCompositePackage(reqs);

        const mcpJsonFiles = result.files.filter((f) =>
          f.path.endsWith('mcp.json'),
        );
        expect(mcpJsonFiles.length).toBeGreaterThanOrEqual(1);
        expect(mcpJsonFiles[0].content.length).toBeGreaterThan(0);

        const parsed = JSON.parse(mcpJsonFiles[0].content);
        expect(parsed).toBeDefined();
        expect(parsed.mcpServers).toBeDefined();
      }),
      { numRuns: 100 },
    );
  });

  it('output contains an agent JSON file (CLI agent)', () => {
    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = gatherRequirements(input);
        const result = buildCompositePackage(reqs);

        const agentJsonFiles = result.files.filter(
          (f) =>
            f.path.endsWith('.json') &&
            f.path.includes('agents/'),
        );
        expect(agentJsonFiles.length).toBeGreaterThanOrEqual(1);
        expect(agentJsonFiles[0].content.length).toBeGreaterThan(0);

        const parsed = JSON.parse(agentJsonFiles[0].content);
        expect(parsed).toBeDefined();
        expect(parsed.mcpServers).toBeDefined();
      }),
      { numRuns: 100 },
    );
  });

  it('mcp.json and agent JSON reference the same MCP Documentation Server', () => {
    fc.assert(
      fc.property(arbBothInput, (input) => {
        const reqs = gatherRequirements(input);
        const result = buildCompositePackage(reqs);

        // Extract mcp.json from power
        const mcpJsonFile = result.files.find((f) =>
          f.path.endsWith('mcp.json'),
        );
        expect(mcpJsonFile).toBeDefined();
        const mcpJson = JSON.parse(mcpJsonFile!.content);

        // Extract agent JSON
        const agentJsonFile = result.files.find(
          (f) =>
            f.path.endsWith('.json') &&
            f.path.includes('agents/'),
        );
        expect(agentJsonFile).toBeDefined();
        const agentJson = JSON.parse(agentJsonFile!.content);

        // Both must reference the same MCP server name
        expect(mcpJson.mcpServers[MCP_DOC_SERVER_NAME]).toBeDefined();
        expect(agentJson.mcpServers[MCP_DOC_SERVER_NAME]).toBeDefined();

        // Both must use the same command
        const powerServer = mcpJson.mcpServers[MCP_DOC_SERVER_NAME];
        const agentServer = agentJson.mcpServers[MCP_DOC_SERVER_NAME];

        expect(powerServer.command).toBe(MCP_DOC_SERVER_COMMAND);
        expect(agentServer.command).toBe(MCP_DOC_SERVER_COMMAND);

        // Both must use the same args
        expect(powerServer.args).toEqual(MCP_DOC_SERVER_ARGS);
        expect(agentServer.args).toEqual(MCP_DOC_SERVER_ARGS);
      }),
      { numRuns: 100 },
    );
  });
});
