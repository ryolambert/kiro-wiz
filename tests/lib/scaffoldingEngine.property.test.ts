import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  scaffoldPower,
  scaffoldAgent,
  scaffoldComposite,
} from '../../lib/scaffoldingEngine.js';
import {
  MCP_DOC_SERVER_NAME,
  MCP_DOC_SERVER_COMMAND,
  MCP_DOC_SERVER_ARGS,
} from '../../lib/scaffoldingEngineUtils.js';

// ─── Arbitraries ───────────────────────────────────────────

/**
 * Generates non-empty alphanumeric names suitable for
 * toKebabCase conversion in the scaffolding engine.
 */
const arbName: fc.Arbitrary<string> = fc
  .string({
    unit: fc.constantFrom(
      ...'abcdefghijklmnopqrstuvwxyz0123456789 '.split('')
    ),
    minLength: 1,
    maxLength: 30,
  })
  .filter((s) => /[a-z0-9]/i.test(s));

const arbDescription: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 200 })
  .filter((s) => s.trim().length > 0);

// ─── Property 39 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 39: Scaffolding
 * platform-aware MCP references**
 * **Validates: Requirements 11.10, 11.11**
 *
 * For any scaffolded power, the output SHALL include an
 * mcp.json referencing the MCP_Documentation_Server. For any
 * scaffolded CLI agent, the output SHALL include an mcpServers
 * config referencing the same server.
 */
describe('Property 39: Scaffolding platform-aware MCP references', () => {
  it('scaffolded power includes mcp.json with MCP Documentation Server reference', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldPower({ name, description });

        // Find the mcp.json file in the output
        const mcpJsonFile = result.files.find((f) =>
          f.path.endsWith('/mcp.json')
        );

        expect(mcpJsonFile).toBeDefined();

        const mcpJson = JSON.parse(mcpJsonFile!.content);

        // Must contain the MCP Documentation Server
        expect(mcpJson.mcpServers).toBeDefined();
        expect(mcpJson.mcpServers[MCP_DOC_SERVER_NAME]).toBeDefined();

        const server = mcpJson.mcpServers[MCP_DOC_SERVER_NAME];
        expect(server.command).toBe(MCP_DOC_SERVER_COMMAND);
        expect(server.args).toEqual(MCP_DOC_SERVER_ARGS);
      }),
      { numRuns: 100 }
    );
  });

  it('scaffolded agent includes mcpServers with MCP Documentation Server reference', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldAgent({ name, description });

        // Find the agent JSON file in the output
        const agentJsonFile = result.files.find((f) =>
          f.path.endsWith('.json')
        );

        expect(agentJsonFile).toBeDefined();

        const agentConfig = JSON.parse(agentJsonFile!.content);

        // Must contain mcpServers with the MCP Documentation Server
        expect(agentConfig.mcpServers).toBeDefined();
        expect(
          agentConfig.mcpServers[MCP_DOC_SERVER_NAME]
        ).toBeDefined();

        const server =
          agentConfig.mcpServers[MCP_DOC_SERVER_NAME];
        expect(server.command).toBe(MCP_DOC_SERVER_COMMAND);
        expect(server.args).toEqual(MCP_DOC_SERVER_ARGS);
      }),
      { numRuns: 100 }
    );
  });

  it('power and agent reference the same MCP server name, command, and args', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const powerResult = scaffoldPower({ name, description });
        const agentResult = scaffoldAgent({ name, description });

        // Extract mcp.json from power
        const mcpJsonFile = powerResult.files.find((f) =>
          f.path.endsWith('/mcp.json')
        );
        expect(mcpJsonFile).toBeDefined();
        const mcpJson = JSON.parse(mcpJsonFile!.content);

        // Extract agent JSON
        const agentJsonFile = agentResult.files.find((f) =>
          f.path.endsWith('.json')
        );
        expect(agentJsonFile).toBeDefined();
        const agentConfig = JSON.parse(agentJsonFile!.content);

        // Both must reference the same server name
        const powerServerNames = Object.keys(
          mcpJson.mcpServers
        );
        const agentServerNames = Object.keys(
          agentConfig.mcpServers
        );

        expect(powerServerNames).toContain(MCP_DOC_SERVER_NAME);
        expect(agentServerNames).toContain(MCP_DOC_SERVER_NAME);

        // Same command and args
        const powerServer =
          mcpJson.mcpServers[MCP_DOC_SERVER_NAME];
        const agentServer =
          agentConfig.mcpServers[MCP_DOC_SERVER_NAME];

        expect(powerServer.command).toBe(agentServer.command);
        expect(powerServer.args).toEqual(agentServer.args);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 40 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 40: Composite
 * integration completeness**
 * **Validates: Requirements 11.12**
 *
 * For any composite integration request, the
 * Scaffolding_Engine output SHALL contain an MCP server
 * config, an IDE power directory, and a CLI agent JSON,
 * all referencing the same MCP_Documentation_Server instance.
 */
describe('Property 40: Composite integration completeness', () => {
  it('composite output contains POWER.md (IDE power)', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldComposite({ name, description });

        const powerMd = result.files.find((f) =>
          f.path.endsWith('/POWER.md')
        );
        expect(powerMd).toBeDefined();
        expect(powerMd!.content.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('composite output contains mcp.json (MCP server config)', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldComposite({ name, description });

        const mcpJson = result.files.find((f) =>
          f.path.endsWith('/mcp.json')
        );
        expect(mcpJson).toBeDefined();

        const parsed = JSON.parse(mcpJson!.content);
        expect(parsed.mcpServers).toBeDefined();
        expect(
          parsed.mcpServers[MCP_DOC_SERVER_NAME]
        ).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('composite output contains CLI agent JSON', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldComposite({ name, description });

        const agentJson = result.files.find(
          (f) =>
            f.path.startsWith('agents/') &&
            f.path.endsWith('.json')
        );
        expect(agentJson).toBeDefined();

        const parsed = JSON.parse(agentJson!.content);
        expect(parsed.mcpServers).toBeDefined();
        expect(
          parsed.mcpServers[MCP_DOC_SERVER_NAME]
        ).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('mcp.json and agent JSON reference the same MCP Documentation Server', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldComposite({ name, description });

        const mcpJsonFile = result.files.find((f) =>
          f.path.endsWith('/mcp.json')
        );
        const agentJsonFile = result.files.find(
          (f) =>
            f.path.startsWith('agents/') &&
            f.path.endsWith('.json')
        );

        expect(mcpJsonFile).toBeDefined();
        expect(agentJsonFile).toBeDefined();

        const mcpJson = JSON.parse(mcpJsonFile!.content);
        const agentConfig = JSON.parse(agentJsonFile!.content);

        // Both reference the same server name
        expect(
          mcpJson.mcpServers[MCP_DOC_SERVER_NAME]
        ).toBeDefined();
        expect(
          agentConfig.mcpServers[MCP_DOC_SERVER_NAME]
        ).toBeDefined();

        const powerServer =
          mcpJson.mcpServers[MCP_DOC_SERVER_NAME];
        const agentServer =
          agentConfig.mcpServers[MCP_DOC_SERVER_NAME];

        // Same command and args
        expect(powerServer.command).toBe(
          MCP_DOC_SERVER_COMMAND
        );
        expect(agentServer.command).toBe(
          MCP_DOC_SERVER_COMMAND
        );
        expect(powerServer.args).toEqual(MCP_DOC_SERVER_ARGS);
        expect(agentServer.args).toEqual(MCP_DOC_SERVER_ARGS);

        // Cross-check: identical references
        expect(powerServer.command).toBe(agentServer.command);
        expect(powerServer.args).toEqual(agentServer.args);
      }),
      { numRuns: 100 }
    );
  });

  it('composite output contains steering files', () => {
    fc.assert(
      fc.property(arbName, arbDescription, (name, description) => {
        const result = scaffoldComposite({ name, description });

        const steeringFiles = result.files.filter((f) =>
          f.path.includes('/steering/')
        );
        expect(steeringFiles.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
