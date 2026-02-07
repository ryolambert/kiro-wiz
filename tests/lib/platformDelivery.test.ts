import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const POWER_DIR = path.join(
  PROJECT_ROOT,
  'powers',
  'kiro-knowledge-base'
);
const AGENT_PATH = path.join(
  PROJECT_ROOT,
  'agents',
  'kiro-knowledge-base-agent.json'
);
const STEERING_DIR = path.join(POWER_DIR, 'steering');

interface McpServerDef {
  command: string;
  args: string[];
}

interface PowerMcpJson {
  mcpServers: Record<string, McpServerDef>;
}

interface AgentConfig {
  name: string;
  description: string;
  mcpServers: Record<string, McpServerDef>;
  resources: string[];
  welcomeMessage: string;
  [key: string]: unknown;
}

describe('Platform Delivery Configs', () => {
  describe('IDE Power structure (Req 13.1)', () => {
    it('should have POWER.md in the power directory', () => {
      const powerMdPath = path.join(POWER_DIR, 'POWER.md');
      expect(fs.existsSync(powerMdPath)).toBe(true);
    });

    it('should have mcp.json in the power directory', () => {
      const mcpJsonPath = path.join(POWER_DIR, 'mcp.json');
      expect(fs.existsSync(mcpJsonPath)).toBe(true);
    });

    it('should have a steering directory', () => {
      expect(fs.existsSync(STEERING_DIR)).toBe(true);
    });
  });

  describe('CLI Agent required fields (Req 13.2)', () => {
    let agent: AgentConfig;

    beforeAll(() => {
      const raw = fs.readFileSync(AGENT_PATH, 'utf-8');
      agent = JSON.parse(raw) as AgentConfig;
    });

    it('should have a name field', () => {
      expect(agent.name).toBeDefined();
      expect(typeof agent.name).toBe('string');
      expect(agent.name.length).toBeGreaterThan(0);
    });

    it('should have a description field', () => {
      expect(agent.description).toBeDefined();
      expect(typeof agent.description).toBe('string');
      expect(agent.description.length).toBeGreaterThan(0);
    });

    it('should have mcpServers field', () => {
      expect(agent.mcpServers).toBeDefined();
      expect(typeof agent.mcpServers).toBe('object');
    });

    it('should have resources field', () => {
      expect(agent.resources).toBeDefined();
      expect(Array.isArray(agent.resources)).toBe(true);
    });

    it('should have welcomeMessage field', () => {
      expect(agent.welcomeMessage).toBeDefined();
      expect(typeof agent.welcomeMessage).toBe('string');
      expect(agent.welcomeMessage.length).toBeGreaterThan(0);
    });
  });

  describe('MCP server consistency (Req 13.5)', () => {
    let powerMcp: PowerMcpJson;
    let agent: AgentConfig;

    beforeAll(() => {
      const mcpRaw = fs.readFileSync(
        path.join(POWER_DIR, 'mcp.json'),
        'utf-8'
      );
      powerMcp = JSON.parse(mcpRaw) as PowerMcpJson;

      const agentRaw = fs.readFileSync(AGENT_PATH, 'utf-8');
      agent = JSON.parse(agentRaw) as AgentConfig;
    });

    it('should reference the same MCP server name', () => {
      const powerServerNames = Object.keys(powerMcp.mcpServers);
      const agentServerNames = Object.keys(agent.mcpServers);
      expect(powerServerNames).toEqual(agentServerNames);
    });

    it('should use the same command for the MCP server', () => {
      const powerServer = Object.values(powerMcp.mcpServers)[0];
      const agentServer = Object.values(agent.mcpServers)[0];
      expect(powerServer.command).toBe(agentServer.command);
    });

    it('should use the same args for the MCP server', () => {
      const powerServer = Object.values(powerMcp.mcpServers)[0];
      const agentServer = Object.values(agent.mcpServers)[0];
      expect(powerServer.args).toEqual(agentServer.args);
    });
  });

  describe('Steering directory contents (Req 13.6)', () => {
    const requiredFiles = [
      'ide-workflows.md',
      'cli-workflows.md',
      'cross-platform.md',
    ];

    requiredFiles.forEach((file) => {
      it(`should contain ${file}`, () => {
        const filePath = path.join(STEERING_DIR, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('CLI agent welcomeMessage (Req 13.7)', () => {
    let welcomeMessage: string;

    beforeAll(() => {
      const raw = fs.readFileSync(AGENT_PATH, 'utf-8');
      const agent = JSON.parse(raw) as AgentConfig;
      welcomeMessage = agent.welcomeMessage;
    });

    const requiredOptions = [
      'Create IDE Tool',
      'Create CLI Tool',
      'Create Cross-Platform Tool',
      'Audit Workspace',
      'Optimize Workflows',
    ];

    requiredOptions.forEach((option) => {
      it(`should contain "${option}"`, () => {
        expect(welcomeMessage).toContain(option);
      });
    });
  });
});
