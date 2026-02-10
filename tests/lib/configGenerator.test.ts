import { describe, expect, it } from 'vitest';
import {
  VALID_HOOK_TRIGGERS,
  VALID_INCLUSION_MODES,
  generateAgent,
  generateHook,
  generateMcpConfig,
  generatePower,
  generateSkill,
  generateSteering,
  validate,
} from '../../lib/configGenerator.js';
import type { HookConfig, McpServerConfig, SteeringConfig } from '../../lib/types.js';

// ─── generateHook ──────────────────────────────────────────

describe('generateHook', () => {
  it('produces valid hook with all trigger types', () => {
    for (const trigger of VALID_HOOK_TRIGGERS) {
      const hook = generateHook({
        name: `test-${trigger}`,
        triggerType: trigger,
        actionType: 'runCommand',
        command: 'echo ok',
      });

      expect(hook.when.type).toBe(trigger);
      expect(hook.then.type).toBe('runCommand');
      expect(hook.version).toBe('1.0.0');
    }
  });

  it('produces valid hook with askAgent action', () => {
    const hook = generateHook({
      name: 'agent-hook',
      triggerType: 'fileSaved',
      actionType: 'askAgent',
      prompt: 'Review this file',
      patterns: ['**/*.ts'],
    });

    expect(hook.then.type).toBe('askAgent');
    expect(hook.then.prompt).toBe('Review this file');
    expect(hook.when.patterns).toEqual(['**/*.ts']);
  });

  it('includes toolTypes for preToolUse trigger', () => {
    const hook = generateHook({
      name: 'pre-tool',
      triggerType: 'preToolUse',
      actionType: 'askAgent',
      prompt: 'Check safety',
      toolTypes: ['write'],
    });

    expect(hook.when.toolTypes).toEqual(['write']);
  });

  it('includes optional description', () => {
    const hook = generateHook({
      name: 'desc-hook',
      description: 'A test hook',
      triggerType: 'userTriggered',
      actionType: 'runCommand',
      command: 'npm test',
    });

    expect(hook.description).toBe('A test hook');
  });
});

// ─── generateAgent ─────────────────────────────────────────

describe('generateAgent', () => {
  it('produces agent with required fields', () => {
    const agent = generateAgent({
      name: 'test-agent',
      description: 'A test agent',
    });

    expect(agent.name).toBe('test-agent');
    expect(agent.description).toBe('A test agent');
  });

  it('includes all optional fields when provided', () => {
    const agent = generateAgent({
      name: 'full-agent',
      description: 'Full schema agent',
      prompt: 'file://prompt.md',
      model: 'sonnet',
      tools: ['read', 'write', 'shell'],
      allowedTools: ['read'],
      toolAliases: { r: 'read' },
      toolsSettings: { shell: { timeout: 30 } },
      mcpServers: {
        kb: { command: 'node', args: ['server.js'] },
      },
      resources: ['file://docs/**'],
      hooks: { onStart: { type: 'askAgent' } },
      includeMcpJson: true,
      keyboardShortcut: 'ctrl+shift+k',
      welcomeMessage: 'Welcome!',
    });

    expect(agent.prompt).toBe('file://prompt.md');
    expect(agent.model).toBe('sonnet');
    expect(agent.tools).toEqual(['read', 'write', 'shell']);
    expect(agent.allowedTools).toEqual(['read']);
    expect(agent.toolAliases).toEqual({ r: 'read' });
    expect(agent.toolsSettings).toEqual({
      shell: { timeout: 30 },
    });
    expect(agent.mcpServers).toBeDefined();
    expect(agent.resources).toEqual(['file://docs/**']);
    expect(agent.hooks).toBeDefined();
    expect(agent.includeMcpJson).toBe(true);
    expect(agent.keyboardShortcut).toBe('ctrl+shift+k');
    expect(agent.welcomeMessage).toBe('Welcome!');
  });

  it('omits undefined optional fields', () => {
    const agent = generateAgent({
      name: 'minimal',
      description: 'Minimal agent',
    });

    expect(agent).not.toHaveProperty('prompt');
    expect(agent).not.toHaveProperty('model');
    expect(agent).not.toHaveProperty('tools');
    expect(agent).not.toHaveProperty('mcpServers');
  });
});

// ─── generatePower ─────────────────────────────────────────

describe('generatePower', () => {
  it('produces POWER.md with frontmatter', () => {
    const result = generatePower({
      name: 'my-power',
      displayName: 'My Power',
      description: 'A test power',
      keywords: ['test', 'demo'],
    });

    expect(result.powerMd).toContain('---');
    expect(result.powerMd).toContain('name: my-power');
    expect(result.powerMd).toContain('displayName: My Power');
    expect(result.powerMd).toContain('description: A test power');
    expect(result.powerMd).toContain('keywords: test, demo');
    expect(result.powerMd).toContain('# My Power');
  });

  it('returns null mcpJson when no servers provided', () => {
    const result = generatePower({
      name: 'no-mcp',
      displayName: 'No MCP',
      description: 'No MCP server',
      keywords: ['test'],
    });

    expect(result.mcpJson).toBeNull();
    expect(result.steeringFiles).toEqual([]);
  });

  it('includes mcp.json when servers provided', () => {
    const result = generatePower({
      name: 'with-mcp',
      displayName: 'With MCP',
      description: 'Has MCP',
      keywords: ['mcp'],
      mcpServers: {
        kb: { command: 'node', args: ['server.js'] },
      },
    });

    expect(result.mcpJson).not.toBeNull();
    expect(result.mcpJson?.mcpServers.kb).toBeDefined();
  });

  it('generates steering files', () => {
    const result = generatePower({
      name: 'steered',
      displayName: 'Steered Power',
      description: 'Has steering',
      keywords: ['steering'],
      steeringFiles: [
        {
          filename: 'guide.md',
          inclusion: 'always',
          content: '# Guide\n\nSome guidance.',
        },
      ],
    });

    expect(result.steeringFiles).toHaveLength(1);
    expect(result.steeringFiles[0].filename).toBe('guide.md');
    expect(result.steeringFiles[0].content).toContain('inclusion: always');
    expect(result.steeringFiles[0].content).toContain('# Guide');
  });

  it('uses custom body content when provided', () => {
    const result = generatePower({
      name: 'custom-body',
      displayName: 'Custom',
      description: 'Custom body',
      keywords: ['custom'],
      bodyContent: '# Custom Title\n\nCustom content here.',
    });

    expect(result.powerMd).toContain('# Custom Title');
    expect(result.powerMd).toContain('Custom content here.');
  });
});

// ─── generateSteering ──────────────────────────────────────

describe('generateSteering', () => {
  it('produces always-mode steering', () => {
    const md = generateSteering({
      inclusion: 'always',
      content: '# Rules\n\nFollow these rules.',
    });

    expect(md).toContain('inclusion: always');
    expect(md).toContain('# Rules');
    expect(md).not.toContain('fileMatchPattern');
  });

  it('produces fileMatch-mode with pattern', () => {
    const md = generateSteering({
      inclusion: 'fileMatch',
      fileMatchPattern: '**/*.tsx',
      content: '# React Rules',
    });

    expect(md).toContain('inclusion: fileMatch');
    expect(md).toContain('fileMatchPattern: "**/*.tsx"');
  });

  it('produces manual-mode steering', () => {
    const md = generateSteering({
      inclusion: 'manual',
      content: '# Manual Guide',
    });

    expect(md).toContain('inclusion: manual');
  });

  for (const mode of VALID_INCLUSION_MODES) {
    it(`validates ${mode} as valid inclusion mode`, () => {
      const result = validate({
        toolType: 'steering-doc',
        config: {
          inclusion: mode,
          content: 'test content',
          ...(mode === 'fileMatch' ? { fileMatchPattern: '*.ts' } : {}),
        } as SteeringConfig,
      });

      expect(result.isValid).toBe(true);
    });
  }
});

// ─── generateSkill ─────────────────────────────────────────

describe('generateSkill', () => {
  it('produces SKILL.md with compliant frontmatter', () => {
    const result = generateSkill({
      frontmatter: {
        name: 'my-skill',
        description: 'A reusable skill for testing. ' + 'Use when: writing tests.',
      },
      bodyContent: '# My Skill\n\nInstructions here.',
    });

    expect(result.skillMd).toContain('name: my-skill');
    expect(result.skillMd).toContain('description: >-');
    expect(result.skillMd).toContain('# My Skill');
    expect(result.directories).toContain('my-skill');
  });

  it('includes optional directories', () => {
    const result = generateSkill({
      frontmatter: {
        name: 'full-skill',
        description: 'Full skill with all dirs.',
      },
      bodyContent: '# Full Skill',
      includeScripts: true,
      includeReferences: true,
      includeAssets: true,
    });

    expect(result.directories).toContain('full-skill/scripts');
    expect(result.directories).toContain('full-skill/references');
    expect(result.directories).toContain('full-skill/assets');
  });

  it('includes optional frontmatter fields', () => {
    const result = generateSkill({
      frontmatter: {
        name: 'licensed-skill',
        description: 'A licensed skill.',
        license: 'MIT',
        compatibility: 'kiro >= 1.0',
        metadata: { author: 'test', version: '1.0' },
        allowedTools: 'read write shell',
      },
      bodyContent: '# Licensed',
    });

    expect(result.skillMd).toContain('license: MIT');
    expect(result.skillMd).toContain('compatibility: kiro >= 1.0');
    expect(result.skillMd).toContain('metadata:');
    expect(result.skillMd).toContain('  author: test');
    expect(result.skillMd).toContain('allowed-tools: read write shell');
  });
});

// ─── generateMcpConfig ─────────────────────────────────────

describe('generateMcpConfig', () => {
  it('produces local server config', () => {
    const result = generateMcpConfig([
      {
        name: 'local-server',
        type: 'local',
        command: 'node',
        args: ['server.js'],
      },
    ]);

    const server = result.mcpServers['local-server'];
    expect(server).toBeDefined();
    expect('command' in server).toBe(true);
  });

  it('produces remote server config', () => {
    const result = generateMcpConfig([
      {
        name: 'remote-server',
        type: 'remote',
        url: 'https://api.example.com/mcp',
        headers: { Authorization: 'Bearer token' },
      },
    ]);

    const server = result.mcpServers['remote-server'];
    expect(server).toBeDefined();
    expect('url' in server).toBe(true);
  });

  it('supports mixed local and remote servers', () => {
    const result = generateMcpConfig([
      {
        name: 'local',
        type: 'local',
        command: 'node',
        args: ['a.js'],
      },
      {
        name: 'remote',
        type: 'remote',
        url: 'https://example.com',
      },
    ]);

    expect(Object.keys(result.mcpServers)).toHaveLength(2);
    expect('command' in result.mcpServers.local).toBe(true);
    expect('url' in result.mcpServers.remote).toBe(true);
  });

  it('defaults command to node when not provided', () => {
    const result = generateMcpConfig([{ name: 'default', type: 'local' }]);

    const server = result.mcpServers.default as {
      command: string;
    };
    expect(server.command).toBe('node');
  });
});

// ─── validate ──────────────────────────────────────────────

describe('validate', () => {
  describe('hook validation', () => {
    it('passes for valid hook', () => {
      const hook = generateHook({
        name: 'valid-hook',
        triggerType: 'fileSaved',
        actionType: 'runCommand',
        command: 'npm test',
      });

      const result = validate({
        toolType: 'hook',
        config: hook,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails for invalid trigger type', () => {
      const hook: HookConfig = {
        name: 'bad-hook',
        version: '1.0.0',
        when: {
          type: 'invalidTrigger' as HookConfig['when']['type'],
        },
        then: { type: 'runCommand', command: 'echo' },
      };

      const result = validate({
        toolType: 'hook',
        config: hook,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'when.type')).toBe(true);
    });

    it('fails for askAgent without prompt', () => {
      const hook = generateHook({
        name: 'no-prompt',
        triggerType: 'fileSaved',
        actionType: 'askAgent',
      });

      const result = validate({
        toolType: 'hook',
        config: hook,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'then.prompt')).toBe(true);
    });

    it('fails for runCommand without command', () => {
      const hook = generateHook({
        name: 'no-cmd',
        triggerType: 'fileSaved',
        actionType: 'runCommand',
      });

      const result = validate({
        toolType: 'hook',
        config: hook,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'then.command')).toBe(true);
    });
  });

  describe('agent validation', () => {
    it('passes for valid agent', () => {
      const agent = generateAgent({
        name: 'valid-agent',
        description: 'A valid agent',
      });

      const result = validate({
        toolType: 'custom-agent',
        config: agent,
      });

      expect(result.isValid).toBe(true);
    });

    it('fails for missing name', () => {
      const result = validate({
        toolType: 'custom-agent',
        config: { name: '', description: 'desc' },
      });

      expect(result.isValid).toBe(false);
    });

    it('validates nested mcpServers', () => {
      const result = validate({
        toolType: 'custom-agent',
        config: {
          name: 'agent',
          description: 'desc',
          mcpServers: {
            bad: {} as McpServerConfig,
          },
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field.startsWith('mcpServers.bad'))).toBe(true);
    });
  });

  describe('power validation', () => {
    it('passes for valid power', () => {
      const result = validate({
        toolType: 'power',
        config: {
          name: 'my-power',
          displayName: 'My Power',
          description: 'A power',
          keywords: ['test'],
        },
      });

      expect(result.isValid).toBe(true);
    });

    it('fails for empty keywords', () => {
      const result = validate({
        toolType: 'power',
        config: {
          name: 'p',
          displayName: 'P',
          description: 'D',
          keywords: [],
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'keywords')).toBe(true);
    });
  });

  describe('steering validation', () => {
    it('fails for fileMatch without pattern', () => {
      const result = validate({
        toolType: 'steering-doc',
        config: {
          inclusion: 'fileMatch',
          content: 'content',
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'fileMatchPattern')).toBe(true);
    });
  });

  describe('skill validation', () => {
    it('passes for valid skill', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'my-skill',
          description: 'A valid skill description.',
        },
      });

      expect(result.isValid).toBe(true);
    });

    it('fails for name with leading hyphen', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: '-bad-name',
          description: 'desc',
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for name with trailing hyphen', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'bad-name-',
          description: 'desc',
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for name with consecutive hyphens', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'bad--name',
          description: 'desc',
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for name with uppercase', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'BadName',
          description: 'desc',
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for name over 64 chars', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'a'.repeat(65),
          description: 'desc',
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for description over 1024 chars', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'ok-name',
          description: 'x'.repeat(1025),
        },
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for compatibility over 500 chars', () => {
      const result = validate({
        toolType: 'skill',
        config: {
          name: 'ok',
          description: 'desc',
          compatibility: 'x'.repeat(501),
        },
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('mcp-server validation', () => {
    it('passes for local server', () => {
      const result = validate({
        toolType: 'mcp-server',
        config: { command: 'node', args: ['s.js'] },
      });

      expect(result.isValid).toBe(true);
    });

    it('passes for remote server', () => {
      const result = validate({
        toolType: 'mcp-server',
        config: { url: 'https://example.com' },
      });

      expect(result.isValid).toBe(true);
    });

    it('fails for neither command nor url', () => {
      const result = validate({
        toolType: 'mcp-server',
        config: {} as McpServerConfig,
      });

      expect(result.isValid).toBe(false);
    });

    it('fails for both command and url', () => {
      const result = validate({
        toolType: 'mcp-server',
        config: {
          command: 'node',
          url: 'https://example.com',
        },
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('unsupported tool type', () => {
    it('returns error for unknown tool type', () => {
      const result = validate({
        toolType: 'spec' as 'hook',
        config: {} as HookConfig,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'toolType')).toBe(true);
    });
  });
});
