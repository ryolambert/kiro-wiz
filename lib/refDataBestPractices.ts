import type { KiroToolType } from './types';

export const BEST_PRACTICES_CONTENT: Record<KiroToolType, string> = {
  spec: `
## When to Use Specs

- Complex features requiring formal planning
- Multi-step implementations with dependencies
- Features needing requirements traceability

## Patterns

- Write requirements in EARS notation (WHEN/SHALL)
- Keep acceptance criteria testable and specific
- Link tasks back to requirements for traceability
- Use checkpoints between implementation phases

## Anti-Patterns

- Using specs for trivial bug fixes
- Skipping the design phase for complex features
- Writing vague acceptance criteria without testable conditions
`,

  hook: `
## Trigger Types

| Trigger | Fires When |
| --- | --- |
| fileEdited | A file is saved after editing |
| fileCreated | A new file is created |
| fileDeleted | A file is removed |
| promptSubmit | User submits a chat prompt |
| agentStop | Agent completes execution |
| preToolUse | Before a tool is invoked |
| postToolUse | After a tool completes |
| userTriggered | Manual invocation by user |

## Action Types

| Action | Description | Credit Cost |
| --- | --- | --- |
| askAgent | Sends a prompt to the agent | Medium (consumes credits) |
| runCommand | Runs a shell command | None (free) |

## Shell Command Availability

\`runCommand\` actions execute in the workspace shell.
They have access to the full PATH and can run any CLI tool
installed in the environment. Use for linting, formatting,
builds, and other deterministic operations.

## Patterns

- Prefer \`runCommand\` for deterministic tasks (linting, formatting)
- Use \`askAgent\` only when AI reasoning is needed
- Scope file patterns narrowly to avoid unnecessary triggers
- Combine \`preToolUse\` hooks with tool type filters

## Anti-Patterns

- Using \`askAgent\` for tasks a shell command can handle
- Overly broad file patterns triggering on every save
- Missing error handling in shell commands
`,

  'steering-doc': `
## Inclusion Modes

| Mode | Behavior |
| --- | --- |
| always | Loaded into every agent conversation |
| fileMatch | Loaded when edited files match the pattern |
| manual | Only loaded when explicitly referenced via # |

## AGENTS.md Support

The \`AGENTS.md\` file at workspace root acts as a global
steering document. It is always included in agent context
and serves as the top-level project guidance.

## File Reference Syntax

Use \`#\` prefix in chat to reference steering docs:
- \`#steering/my-guide.md\` — loads a specific steering file
- \`#file:path/to/file\` — loads any workspace file as context

## Patterns

- Use \`always\` mode for universal project rules
- Use \`fileMatch\` for language-specific or path-specific guidance
- Keep steering docs focused on a single concern
- Use YAML frontmatter for inclusion mode configuration

## Anti-Patterns

- Putting everything in a single massive steering doc
- Using \`always\` mode for rarely-needed guidance
- Missing frontmatter (defaults may not match intent)
`,

  skill: `
## Progressive Disclosure Model

Skills follow a three-tier loading strategy:

1. **Discovery** (~100 tokens): Name + description from
   SKILL.md frontmatter. Loaded when listing available skills.
2. **Activation** (<5000 tokens): Full SKILL.md instructions.
   Loaded when the skill is activated by keyword match.
3. **Resources** (on demand): Files in references/, scripts/,
   and assets/ directories. Loaded only when explicitly needed.

## Authoring Guidelines

- **Name**: 1-64 chars, lowercase alphanumeric + hyphens,
  no leading/trailing/consecutive hyphens
- **Description**: 250-350 characters with a "Use when:"
  section explaining activation triggers
- Keep SKILL.md instructions under 5000 tokens
- Place large reference material in references/ directory

## Directory Structure

\`\`\`text
skills/my-skill/
  SKILL.md          # Frontmatter + instructions
  scripts/          # Optional executable scripts
  references/       # Optional reference documents
  assets/           # Optional static assets
\`\`\`

## Patterns

- Write descriptions that clearly state activation triggers
- Use "Use when:" prefix in description for discoverability
- Keep instructions actionable and concise
- Validate with \`skills-ref\` CLI before publishing

## Anti-Patterns

- Exceeding 5000 tokens in SKILL.md instructions
- Vague descriptions without activation triggers
- Putting all content in SKILL.md instead of references/
`,

  power: `
## POWER.md Frontmatter

\`\`\`yaml
---
name: my-power
displayName: My Power
description: What this power does
keywords: keyword1, keyword2, keyword3
---
\`\`\`

## Keyword-Based Activation

Powers are activated when user messages match keywords.
Choose keywords that reflect the power's domain:
- Use specific technical terms
- Include common synonyms
- Avoid overly generic words

## Steering File Mapping

\`\`\`text
custom-powers/my-power/
  POWER.md              # Manifest with frontmatter
  mcp.json              # Optional MCP server config
  steering/
    workflow-guide.md   # Workflow-specific guidance
    templates.md        # Starter templates
\`\`\`

## Patterns

- Use kebab-case for power directory names
- Keep POWER.md under ~500 lines
- Include an onboarding section with dependency checks
- Map steering files to specific workflow scenarios

## Anti-Patterns

- Overly generic keywords causing false activations
- Monolithic POWER.md without steering file delegation
- Missing mcp.json when the power needs tool access
`,

  'mcp-server': `
## Server Types

| Type | Config | Use Case |
| --- | --- | --- |
| Local stdio | command + args | Development, single-user |
| Remote HTTP/SSE | url + headers | Shared team use |

## Patterns

- One tool per concern (single responsibility)
- Return structured errors with descriptive messages
- Implement graceful degradation for unavailable backends
- Cache frequently requested data with configurable TTL
- Use environment variables for secrets, never hardcode

## Anti-Patterns

- Exposing too many tools in a single server
- Missing error classification (all errors look the same)
- Hardcoded API keys or secrets in mcp.json
- No health check endpoint for monitoring
`,

  'custom-agent': `
## Full Config Schema

\`\`\`json
{
  "name": "my-agent",
  "description": "What this agent does",
  "prompt": "file://agents/my-agent-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "toolAliases": {},
  "toolsSettings": {},
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server"]
    }
  },
  "resources": ["file://docs/**"],
  "hooks": {},
  "includeMcpJson": true,
  "keyboardShortcut": "ctrl+shift+k",
  "welcomeMessage": "How can I help?"
}
\`\`\`

## Knowledge Base Resources

Use \`resources\` to give agents access to documentation:
- \`file://path/to/docs/**\` — glob pattern for file access
- Resources are loaded into agent context on demand

## Hooks in Agents

Agents can define hooks that trigger during agent lifecycle:
- \`agentSpawn\` — runs when the agent starts
- Use hooks to scan workspace or load initial context

## Patterns

- Use \`file://\` URIs for prompt files (keeps JSON clean)
- Scope \`allowedTools\` to minimum needed permissions
- Include a descriptive \`welcomeMessage\` with options
- Reference MCP servers for external tool access

## Anti-Patterns

- Inline prompts in JSON (use file:// references)
- Granting all tools without scoping
- Missing welcomeMessage (poor user experience)
`,

  'autonomous-agent': `
## Overview

Autonomous agents run in the cloud, executing tasks
independently without real-time user interaction.

## Patterns

- Design tasks to be self-contained and idempotent
- Include clear success/failure criteria in prompts
- Use for CI/CD integration and background processing
- Monitor execution via cloud logging

## Anti-Patterns

- Tasks requiring interactive user input
- Short tasks better suited to local hooks
- Missing error handling for cloud failures
`,

  subagent: `
## Overview

Subagents are delegated by the main IDE agent to handle
focused sub-tasks. They run in the same IDE context.

## Patterns

- Break complex tasks into focused, independent sub-tasks
- Give each subagent a clear, specific objective
- Use for parallel execution of independent work items
- Keep subagent scope narrow for better results

## Anti-Patterns

- Delegating trivial single-step operations
- Overlapping subagent responsibilities
- Missing context in subagent prompts
`,

  'context-provider': `
## Overview

Context providers use \`#\`-prefixed references to inject
files, folders, specs, and other context into chat.

## Reference Types

| Prefix | Injects |
| --- | --- |
| #file:path | A specific file |
| #folder:path | All files in a folder |
| #spec:name | A spec's requirements, design, tasks |
| #steering:name | A steering document |

## Patterns

- Reference specific files rather than entire directories
- Use spec references for feature-related conversations
- Combine multiple references for comprehensive context

## Anti-Patterns

- Injecting large directories (token overflow)
- Referencing files unrelated to the current task
`,
};
