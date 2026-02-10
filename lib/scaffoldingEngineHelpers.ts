import {
  generateAgent,
  generateHook,
  generateMcpConfig,
  generateSteering,
} from './configGenerator.js';
import { toKebabCase, validateScaffoldOutput } from './scaffoldingEngineUtils.js';
import type { ScaffoldOptions, ScaffoldResult } from './types.js';

// ─── Hook Scaffolding ──────────────────────────────────────

export function scaffoldHook(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const hookConfig = generateHook({
    name: kebabName,
    description: options.description,
    triggerType: 'userTriggered',
    actionType: 'askAgent',
    prompt: `<!-- TODO: ${options.description} -->`,
  });

  const validation = validateScaffoldOutput('hook', hookConfig);

  const files: ScaffoldResult['files'] = [
    {
      path: `.kiro/hooks/${kebabName}.kiro.hook`,
      content: JSON.stringify(hookConfig, null, 2),
    },
  ];

  const instructionParts = [`Hook "${kebabName}" scaffolded.`];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map((e) => `  - ${e.field}: ${e.message}`),
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Set the trigger type (when.type)',
    '2. Configure the action (then.type + prompt/command)',
    '3. Add file patterns if using file-based triggers',
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Steering Doc Scaffolding ──────────────────────────────

export function scaffoldSteeringDoc(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const content = generateSteering({
    inclusion: 'manual',
    content: [
      `# ${options.name}`,
      '',
      options.description,
      '',
      '<!-- TODO: Add steering content -->',
    ].join('\n'),
  });

  const steeringConfig = {
    inclusion: 'manual' as const,
    content: options.description,
  };
  const validation = validateScaffoldOutput('steering-doc', steeringConfig);

  const files: ScaffoldResult['files'] = [
    {
      path: `.kiro/steering/${kebabName}.md`,
      content,
    },
  ];

  const instructionParts = [`Steering doc "${kebabName}" scaffolded.`];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map((e) => `  - ${e.field}: ${e.message}`),
    );
  }

  instructionParts.push(
    '',
    'Inclusion modes:',
    '  - always: loaded in every conversation',
    '  - fileMatch: loaded when matching files are open',
    '  - manual: loaded only when explicitly referenced',
    '',
    'Next steps:',
    '1. Set the inclusion mode in frontmatter',
    '2. Add steering content',
    '3. Add fileMatchPattern if using fileMatch mode',
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── MCP Server Scaffolding ───────────────────────────────

export function scaffoldMcpServer(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const mcpJson = generateMcpConfig([
    {
      name: kebabName,
      type: 'local',
      command: 'npx',
      args: ['tsx', `bin/${kebabName}.ts`],
    },
  ]);

  const validation = validateScaffoldOutput('mcp-server', {
    command: 'npx',
    args: ['tsx', `bin/${kebabName}.ts`],
  });

  const serverTemplate = [
    '// MCP Server entry point',
    `// ${options.description}`,
    '',
    '// TODO: Implement MCP server using',
    '// @modelcontextprotocol/sdk',
    '',
    'console.error("MCP server starting...");',
  ].join('\n');

  const files: ScaffoldResult['files'] = [
    {
      path: `bin/${kebabName}.ts`,
      content: `${serverTemplate}\n`,
    },
    {
      path: 'mcp.json',
      content: JSON.stringify(mcpJson, null, 2),
    },
  ];

  const instructionParts = [`MCP server "${kebabName}" scaffolded.`];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map((e) => `  - ${e.field}: ${e.message}`),
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Implement server tools in the entry point',
    '2. Register tools with @modelcontextprotocol/sdk',
    `3. Test with: npx tsx bin/${kebabName}.ts`,
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Spec Scaffolding ──────────────────────────────────────

export function scaffoldSpec(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const requirementsMd = [
    '# Requirements Document',
    '',
    '## Introduction',
    '',
    options.description,
    '',
    '## Requirements',
    '',
    `### Requirement 1: ${options.name}`,
    '',
    '**User Story:** As a developer, I want ..., so that ...',
    '',
    '#### Acceptance Criteria',
    '',
    '1. WHEN [condition] THE SYSTEM SHALL [behavior]',
  ].join('\n');

  const designMd = [
    `# Design Document: ${options.name}`,
    '',
    '## Overview',
    '',
    options.description,
    '',
    '## Architecture',
    '',
    '<!-- TODO: Add architecture diagram -->',
  ].join('\n');

  const tasksMd = [
    '# Implementation Plan',
    '',
    '## Tasks',
    '',
    '- [ ] 1. Initial implementation',
    '  - TODO: Add implementation steps',
    '  - _Requirements: 1.1_',
  ].join('\n');

  const files: ScaffoldResult['files'] = [
    {
      path: `.kiro/specs/${kebabName}/requirements.md`,
      content: `${requirementsMd}\n`,
    },
    {
      path: `.kiro/specs/${kebabName}/design.md`,
      content: `${designMd}\n`,
    },
    {
      path: `.kiro/specs/${kebabName}/tasks.md`,
      content: `${tasksMd}\n`,
    },
  ];

  return {
    files,
    instructions: [
      `Spec "${kebabName}" scaffolded at .kiro/specs/${kebabName}/`,
      '',
      'Next steps:',
      '1. Define requirements in requirements.md',
      '2. Design the solution in design.md',
      '3. Break down tasks in tasks.md',
    ].join('\n'),
  };
}

// ─── Autonomous Agent Scaffolding ──────────────────────────

export function scaffoldAutonomousAgent(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const agentConfig = generateAgent({
    name: kebabName,
    description: options.description,
    prompt: options.description,
    tools: ['read', 'write', 'shell'],
    allowedTools: ['read'],
  });

  const validation = validateScaffoldOutput('custom-agent', agentConfig);

  const files: ScaffoldResult['files'] = [
    {
      path: `agents/${kebabName}-autonomous.json`,
      content: JSON.stringify(agentConfig, null, 2),
    },
  ];

  const instructionParts = [`Autonomous agent "${kebabName}" scaffolded.`];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map((e) => `  - ${e.field}: ${e.message}`),
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Configure the agent prompt',
    '2. Set up tools and permissions',
    '3. Define hooks for autonomous triggers',
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Subagent Scaffolding ──────────────────────────────────

export function scaffoldSubagent(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const agentConfig = generateAgent({
    name: kebabName,
    description: options.description,
    prompt: options.description,
    tools: ['read'],
    allowedTools: ['read'],
  });

  const validation = validateScaffoldOutput('custom-agent', agentConfig);

  const files: ScaffoldResult['files'] = [
    {
      path: `agents/${kebabName}-subagent.json`,
      content: JSON.stringify(agentConfig, null, 2),
    },
  ];

  const instructionParts = [`Subagent "${kebabName}" scaffolded.`];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map((e) => `  - ${e.field}: ${e.message}`),
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Define the subagent scope and prompt',
    '2. Configure minimal tool permissions',
    '3. Wire into parent agent workflow',
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Context Provider Scaffolding ──────────────────────────

export function scaffoldContextProvider(options: ScaffoldOptions): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const steeringContent = generateSteering({
    inclusion: 'manual',
    content: [
      `# ${options.name} Context`,
      '',
      options.description,
      '',
      '<!-- This file is referenced via #context-provider -->',
    ].join('\n'),
  });

  const files: ScaffoldResult['files'] = [
    {
      path: `.kiro/steering/${kebabName}-context.md`,
      content: steeringContent,
    },
  ];

  return {
    files,
    instructions: [
      `Context provider "${kebabName}" scaffolded.`,
      '',
      'Context providers use #-prefixed references in chat.',
      'The steering file provides the context content.',
      '',
      'Next steps:',
      '1. Add context content to the steering file',
      `2. Reference via #${kebabName} in chat`,
    ].join('\n'),
  };
}
