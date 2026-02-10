import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const POWER_DIR = path.join(PROJECT_ROOT, 'powers', 'kiro-wiz');
const STEERING_DIR = path.join(POWER_DIR, 'steering');

interface McpServerDef {
  command: string;
  args: string[];
}

interface PowerMcpJson {
  mcpServers: Record<string, McpServerDef>;
}

describe('Platform Delivery Configs', () => {
  describe('IDE Power structure', () => {
    it('should have POWER.md in the power directory', () => {
      expect(fs.existsSync(path.join(POWER_DIR, 'POWER.md'))).toBe(true);
    });

    it('should have mcp.json in the power directory', () => {
      expect(fs.existsSync(path.join(POWER_DIR, 'mcp.json'))).toBe(true);
    });

    it('should have a steering directory', () => {
      expect(fs.existsSync(STEERING_DIR)).toBe(true);
    });

    it('should have at least one steering file', () => {
      const files = fs.readdirSync(STEERING_DIR);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('MCP server config', () => {
    let mcpJson: PowerMcpJson;

    it('should parse mcp.json as valid JSON', () => {
      const raw = fs.readFileSync(path.join(POWER_DIR, 'mcp.json'), 'utf-8');
      mcpJson = JSON.parse(raw) as PowerMcpJson;
      expect(mcpJson.mcpServers).toBeDefined();
    });

    it('should have a kiro-wiz server entry', () => {
      const raw = fs.readFileSync(path.join(POWER_DIR, 'mcp.json'), 'utf-8');
      mcpJson = JSON.parse(raw) as PowerMcpJson;
      expect(mcpJson.mcpServers['kiro-wiz']).toBeDefined();
    });

    it('should have command and args for the server', () => {
      const raw = fs.readFileSync(path.join(POWER_DIR, 'mcp.json'), 'utf-8');
      mcpJson = JSON.parse(raw) as PowerMcpJson;
      const server = mcpJson.mcpServers['kiro-wiz'];
      expect(server.command).toBeDefined();
      expect(Array.isArray(server.args)).toBe(true);
    });
  });
});
