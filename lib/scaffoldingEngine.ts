import type {
  KiroToolType,
  ScaffoldResult,
  ScaffoldOptions,
} from './types.js';
import {
  generateAgent,
  generatePower,
  generateSkill,
} from './configGenerator.js';
import {
  toKebabCase,
  validateScaffoldOutput,
  checkTokenEfficiency,
  estimateTokens,
  mcpDocServerConfig,
  MCP_DOC_SERVER_NAME,
  MCP_DOC_SERVER_COMMAND,
  MCP_DOC_SERVER_ARGS,
  SKILL_DESC_MIN_CHARS,
  SKILL_DESC_MAX_CHARS,
  SKILL_METADATA_TOKEN_TARGET,
  SKILL_INSTRUCTION_TOKEN_LIMIT,
} from './scaffoldingEngineUtils.js';
import {
  scaffoldHook,
  scaffoldSteeringDoc,
  scaffoldMcpServer,
  scaffoldSpec,
  scaffoldAutonomousAgent,
  scaffoldSubagent,
  scaffoldContextProvider,
} from './scaffoldingEngineHelpers.js';

// ─── Main Entry Point ──────────────────────────────────────

export function scaffoldTool(
  toolType: KiroToolType,
  options: ScaffoldOptions
): ScaffoldResult {
  switch (toolType) {
    case 'power':
      return scaffoldPower(options);
    case 'custom-agent':
      return scaffoldAgent(options);
    case 'skill':
      return scaffoldSkill(options);
    case 'hook':
      return scaffoldHook(options);
    case 'steering-doc':
      return scaffoldSteeringDoc(options);
    case 'mcp-server':
      return scaffoldMcpServer(options);
    case 'spec':
      return scaffoldSpec(options);
    case 'autonomous-agent':
      return scaffoldAutonomousAgent(options);
    case 'subagent':
      return scaffoldSubagent(options);
    case 'context-provider':
      return scaffoldContextProvider(options);
  }
}

// ─── Power Scaffolding ─────────────────────────────────────

export function scaffoldPower(
  options: ScaffoldOptions
): ScaffoldResult {
  const kebabName = toKebabCase(options.name);
  const displayName = options.name;
  const keywords = [
    kebabName,
    ...kebabName.split('-').filter((w) => w.length > 2),
  ];

  const powerResult = generatePower({
    name: kebabName,
    displayName,
    description: options.description,
    keywords,
    bodyContent: [
      `# ${displayName}`,
      '',
      options.description,
      '',
      '## Getting Started',
      '',
      '<!-- TODO: Add onboarding instructions -->',
      '',
      '## Workflows',
      '',
      '<!-- TODO: Document supported workflows -->',
    ].join('\n'),
    mcpServers: {
      [MCP_DOC_SERVER_NAME]: mcpDocServerConfig(),
    },
    steeringFiles: [
      {
        filename: 'getting-started.md',
        inclusion: 'manual' as const,
        content: [
          `# Getting Started with ${displayName}`,
          '',
          '<!-- TODO: Add step-by-step guide -->',
        ].join('\n'),
      },
    ],
  });

  const powerConfig = {
    name: kebabName,
    displayName,
    description: options.description,
    keywords,
  };
  const validation = validateScaffoldOutput(
    'power',
    powerConfig
  );
  const tokenWarnings = checkTokenEfficiency(
    powerResult.powerMd
  );

  const basePath = `powers/${kebabName}`;
  const files: ScaffoldResult['files'] = [
    {
      path: `${basePath}/POWER.md`,
      content: powerResult.powerMd,
    },
  ];

  if (powerResult.mcpJson) {
    files.push({
      path: `${basePath}/mcp.json`,
      content: JSON.stringify(powerResult.mcpJson, null, 2),
    });
  }

  for (const sf of powerResult.steeringFiles) {
    files.push({
      path: `${basePath}/steering/${sf.filename}`,
      content: sf.content,
    });
  }

  const instructionParts = [
    `Power "${displayName}" scaffolded at ${basePath}/`,
  ];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map(
        (e) => `  - ${e.field}: ${e.message}`
      )
    );
  }

  if (tokenWarnings.length > 0) {
    instructionParts.push(
      'Token efficiency warnings:',
      ...tokenWarnings.map(
        (w) => `  - ${w.field}: ${w.message}`
      )
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Edit POWER.md with your power documentation',
    '2. Configure mcp.json if using MCP servers',
    '3. Add steering files for guided workflows'
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Agent Scaffolding ─────────────────────────────────────

export function scaffoldAgent(
  options: ScaffoldOptions
): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const agentConfig = generateAgent({
    name: kebabName,
    description: options.description,
    prompt: `file://agents/${kebabName}-prompt.md`,
    mcpServers: {
      [MCP_DOC_SERVER_NAME]: mcpDocServerConfig(),
    },
    tools: ['read', 'write', 'shell'],
    allowedTools: ['read'],
    welcomeMessage: [
      `Welcome to ${options.name}!`,
      '',
      'What would you like to do?',
      '1. Get started',
      '2. View documentation',
    ].join('\n'),
  });

  const validation = validateScaffoldOutput(
    'custom-agent',
    agentConfig
  );

  const promptContent = [
    `# ${options.name} Agent Prompt`,
    '',
    options.description,
    '',
    '## Instructions',
    '',
    '<!-- TODO: Add agent instructions -->',
    '',
    '## Available Tools',
    '',
    '- MCP Documentation Server for knowledge base access',
    '- File read/write for workspace operations',
  ].join('\n');

  const files: ScaffoldResult['files'] = [
    {
      path: `agents/${kebabName}.json`,
      content: JSON.stringify(agentConfig, null, 2),
    },
    {
      path: `agents/${kebabName}-prompt.md`,
      content: promptContent + '\n',
    },
  ];

  const instructionParts = [
    `Agent "${kebabName}" scaffolded.`,
  ];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation warnings:',
      ...validation.errors.map(
        (e) => `  - ${e.field}: ${e.message}`
      )
    );
  }

  instructionParts.push(
    '',
    'Next steps:',
    '1. Edit the agent prompt file',
    '2. Configure tools and allowedTools',
    '3. Test with: npx tsx bin/mcp-server.ts'
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Composite Scaffolding ─────────────────────────────────

export function scaffoldComposite(
  options: ScaffoldOptions
): ScaffoldResult {
  const powerResult = scaffoldPower(options);
  const agentResult = scaffoldAgent(options);

  const files = [...powerResult.files, ...agentResult.files];

  const kebabName = toKebabCase(options.name);
  const instructions = [
    `Composite integration "${options.name}" scaffolded.`,
    '',
    'Generated components:',
    `  - IDE Power: powers/${kebabName}/`,
    `  - CLI Agent: agents/${kebabName}.json`,
    `  - Shared MCP server: ${MCP_DOC_SERVER_NAME}`,
    '',
    'Both IDE power and CLI agent reference the same',
    `MCP Documentation Server (${MCP_DOC_SERVER_COMMAND} ` +
      `${MCP_DOC_SERVER_ARGS.join(' ')}).`,
    '',
    'Next steps:',
    '1. Customize POWER.md for IDE workflows',
    '2. Customize agent prompt for CLI workflows',
    '3. Add steering files for guided experiences',
    '4. Test both delivery paths',
  ].join('\n');

  return { files, instructions };
}

// ─── Skill Scaffolding ─────────────────────────────────────

export function scaffoldSkill(
  options: ScaffoldOptions
): ScaffoldResult {
  const kebabName = toKebabCase(options.name);

  const descWarnings: string[] = [];
  if (options.description.length < SKILL_DESC_MIN_CHARS) {
    descWarnings.push(
      `Description is ${options.description.length} chars, ` +
        `target ${SKILL_DESC_MIN_CHARS}-${SKILL_DESC_MAX_CHARS}`
    );
  }
  if (options.description.length > SKILL_DESC_MAX_CHARS) {
    descWarnings.push(
      `Description is ${options.description.length} chars, ` +
        `exceeds target max of ${SKILL_DESC_MAX_CHARS}`
    );
  }
  if (!options.description.includes('Use when')) {
    descWarnings.push(
      'Description should include a "Use when:" section'
    );
  }

  const metadataSection = [
    `# ${options.name}`,
    '',
    options.description,
  ].join('\n');

  const instructionSection = [
    '',
    '## Instructions',
    '',
    '<!-- TODO: Add detailed instructions (<5000 tokens) -->',
    '',
    '## Resources',
    '',
    '<!-- Resources loaded on demand -->',
  ].join('\n');

  const bodyContent = metadataSection + instructionSection;

  const metadataTokens = estimateTokens(metadataSection);
  const instructionTokens = estimateTokens(instructionSection);

  const tokenNotes: string[] = [];
  if (metadataTokens > SKILL_METADATA_TOKEN_TARGET) {
    tokenNotes.push(
      `Metadata section ~${metadataTokens} tokens ` +
        `(target ~${SKILL_METADATA_TOKEN_TARGET})`
    );
  }
  if (instructionTokens > SKILL_INSTRUCTION_TOKEN_LIMIT) {
    tokenNotes.push(
      `Instructions ~${instructionTokens} tokens ` +
        `(limit ${SKILL_INSTRUCTION_TOKEN_LIMIT})`
    );
  }

  const skillResult = generateSkill({
    frontmatter: {
      name: kebabName,
      description: options.description,
    },
    bodyContent,
    includeReferences: true,
  });

  const validation = validateScaffoldOutput('skill', {
    name: kebabName,
    description: options.description,
  });

  const files: ScaffoldResult['files'] = [
    {
      path: `${kebabName}/SKILL.md`,
      content: skillResult.skillMd,
    },
  ];

  for (const dir of skillResult.directories) {
    if (dir !== kebabName) {
      files.push({
        path: `${dir}/.gitkeep`,
        content: '',
      });
    }
  }

  const instructionParts = [
    `Skill "${kebabName}" scaffolded.`,
  ];

  if (!validation.isValid) {
    instructionParts.push(
      'Validation errors:',
      ...validation.errors.map(
        (e) => `  - ${e.field}: ${e.message}`
      )
    );
  }

  if (descWarnings.length > 0) {
    instructionParts.push(
      'Description quality:',
      ...descWarnings.map((w) => `  - ${w}`)
    );
  }

  if (tokenNotes.length > 0) {
    instructionParts.push(
      'Token budget:',
      ...tokenNotes.map((n) => `  - ${n}`)
    );
  }

  instructionParts.push(
    '',
    'Progressive disclosure model:',
    '  - Metadata (~100 tokens): name + description',
    '  - Instructions (<5000 tokens): loaded at activation',
    '  - Resources: loaded on demand',
    '',
    'Next steps:',
    '1. Write detailed instructions in SKILL.md',
    '2. Add reference files to references/ directory',
    '3. Validate with: npx tsx bin/validate-skill.ts ' +
      kebabName
  );

  return {
    files,
    instructions: instructionParts.join('\n'),
  };
}

// ─── Re-exports ────────────────────────────────────────────

export {
  scaffoldHook,
  scaffoldSteeringDoc,
  scaffoldMcpServer,
  scaffoldSpec,
  scaffoldAutonomousAgent,
  scaffoldSubagent,
  scaffoldContextProvider,
} from './scaffoldingEngineHelpers.js';
