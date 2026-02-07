import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  generatePower,
  generateAgent,
} from '../../lib/configGenerator.js';
import type { McpServerConfig } from '../../lib/types.js';

// ─── Arbitraries ───────────────────────────────────────────

const arbNonEmptyString: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

const arbAlphaString: fc.Arbitrary<string> = fc.string({
  unit: fc.constantFrom(
    ...'abcdefghijklmnopqrstuvwxyz'.split('')
  ),
  minLength: 1,
  maxLength: 20,
});

const arbKeywords: fc.Arbitrary<string[]> = fc.array(
  arbNonEmptyString,
  { minLength: 1, maxLength: 5 }
);

const arbArgs: fc.Arbitrary<string[]> = fc.array(
  arbNonEmptyString,
  { minLength: 0, maxLength: 5 }
);

/**
 * Generates a local MCP server definition with command + args,
 * used by both power mcp.json and agent mcpServers.
 */
const arbLocalMcpDef = fc.record({
  command: arbNonEmptyString,
  args: arbArgs,
});

/**
 * Generates a shared MCP server name and definition that will
 * be used identically in both IDE power and CLI agent configs.
 */
const arbSharedMcpServer = fc.record({
  serverName: arbAlphaString,
  serverDef: arbLocalMcpDef,
});

// ─── Property 42 ───────────────────────────────────────────

/**
 * **Feature: kiro-knowledge-base, Property 42: Cross-platform
 * MCP server consistency**
 * **Validates: Requirements 13.5**
 *
 * For any generated IDE power and CLI agent pair, the MCP
 * server reference in the power's mcp.json SHALL match the
 * MCP server reference in the agent's mcpServers config,
 * ensuring consistent knowledge base access.
 */
describe('Property 42: Cross-platform MCP server consistency', () => {
  it('power mcp.json and agent mcpServers reference the same MCP server name', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        arbKeywords,
        arbNonEmptyString,
        arbNonEmptyString,
        arbSharedMcpServer,
        (
          powerName,
          displayName,
          description,
          keywords,
          agentName,
          agentDesc,
          shared
        ) => {
          const mcpServers: Record<
            string,
            { command: string; args: string[] }
          > = {
            [shared.serverName]: shared.serverDef,
          };

          const power = generatePower({
            name: powerName,
            displayName,
            description,
            keywords,
            mcpServers,
          });

          const agentMcpServers: Record<
            string,
            McpServerConfig
          > = {
            [shared.serverName]: {
              command: shared.serverDef.command,
              args: shared.serverDef.args,
            },
          };

          const agent = generateAgent({
            name: agentName,
            description: agentDesc,
            mcpServers: agentMcpServers,
          });

          // Power mcp.json must exist
          expect(power.mcpJson).not.toBeNull();

          const powerServerNames = Object.keys(
            power.mcpJson!.mcpServers
          );
          const agentServerNames = Object.keys(
            agent.mcpServers ?? {}
          );

          // Same server names
          expect(powerServerNames).toEqual(agentServerNames);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('power mcp.json and agent mcpServers use the same command and args', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        arbKeywords,
        arbNonEmptyString,
        arbNonEmptyString,
        arbSharedMcpServer,
        (
          powerName,
          displayName,
          description,
          keywords,
          agentName,
          agentDesc,
          shared
        ) => {
          const mcpServers: Record<
            string,
            { command: string; args: string[] }
          > = {
            [shared.serverName]: shared.serverDef,
          };

          const power = generatePower({
            name: powerName,
            displayName,
            description,
            keywords,
            mcpServers,
          });

          const agentMcpServers: Record<
            string,
            McpServerConfig
          > = {
            [shared.serverName]: {
              command: shared.serverDef.command,
              args: shared.serverDef.args,
            },
          };

          const agent = generateAgent({
            name: agentName,
            description: agentDesc,
            mcpServers: agentMcpServers,
          });

          expect(power.mcpJson).not.toBeNull();

          const powerServer =
            power.mcpJson!.mcpServers[shared.serverName];
          const agentServer = (agent.mcpServers ?? {})[
            shared.serverName
          ];

          expect(agentServer).toBeDefined();

          // Both must be local servers with command + args
          expect('command' in powerServer).toBe(true);

          if ('command' in powerServer) {
            expect(powerServer.command).toBe(
              agentServer.command
            );
            expect(powerServer.args).toEqual(
              agentServer.args
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple MCP servers in power and agent maintain pairwise consistency', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        arbKeywords,
        arbNonEmptyString,
        arbNonEmptyString,
        fc.array(arbSharedMcpServer, {
          minLength: 1,
          maxLength: 4,
        }),
        (
          powerName,
          displayName,
          description,
          keywords,
          agentName,
          agentDesc,
          servers
        ) => {
          // Deduplicate server names
          const seen = new Set<string>();
          const uniqueServers = servers.filter((s) => {
            if (seen.has(s.serverName)) return false;
            seen.add(s.serverName);
            return true;
          });

          const powerMcpServers: Record<
            string,
            { command: string; args: string[] }
          > = {};
          const agentMcpServers: Record<
            string,
            McpServerConfig
          > = {};

          for (const s of uniqueServers) {
            powerMcpServers[s.serverName] = s.serverDef;
            agentMcpServers[s.serverName] = {
              command: s.serverDef.command,
              args: s.serverDef.args,
            };
          }

          const power = generatePower({
            name: powerName,
            displayName,
            description,
            keywords,
            mcpServers: powerMcpServers,
          });

          const agent = generateAgent({
            name: agentName,
            description: agentDesc,
            mcpServers: agentMcpServers,
          });

          expect(power.mcpJson).not.toBeNull();

          const powerKeys = Object.keys(
            power.mcpJson!.mcpServers
          ).sort();
          const agentKeys = Object.keys(
            agent.mcpServers ?? {}
          ).sort();

          expect(powerKeys).toEqual(agentKeys);

          // Each server pair must match command + args
          for (const key of powerKeys) {
            const ps = power.mcpJson!.mcpServers[key];
            const as_ = (agent.mcpServers ?? {})[key];

            expect(as_).toBeDefined();

            if ('command' in ps) {
              expect(ps.command).toBe(as_.command);
              expect(ps.args).toEqual(as_.args);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('power without mcpServers and agent without mcpServers are consistently empty', () => {
    fc.assert(
      fc.property(
        arbNonEmptyString,
        arbNonEmptyString,
        arbNonEmptyString,
        arbKeywords,
        arbNonEmptyString,
        arbNonEmptyString,
        (
          powerName,
          displayName,
          description,
          keywords,
          agentName,
          agentDesc
        ) => {
          const power = generatePower({
            name: powerName,
            displayName,
            description,
            keywords,
          });

          const agent = generateAgent({
            name: agentName,
            description: agentDesc,
          });

          // Both should have no MCP servers
          expect(power.mcpJson).toBeNull();
          expect(agent.mcpServers).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
