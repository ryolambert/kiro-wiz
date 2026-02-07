import type { KiroToolType } from './types';

export const TEMPLATES_CONTENT: Record<KiroToolType, string> = {
  spec: `
## Spec Starter Template

\`\`\`markdown
# Requirements

### Requirement 1: {{FEATURE_NAME}}
**User Story:** As a {{PERSONA}}, I want {{GOAL}},
so that {{BENEFIT}}.

#### Acceptance Criteria
1. WHEN {{CONDITION}}
   THE SYSTEM SHALL {{BEHAVIOR}}

# Design

## Overview
{{ARCHITECTURE_DESCRIPTION}}

## Components
- {{COMPONENT_1}}: {{PURPOSE}}

# Tasks
- [ ] 1. {{FIRST_TASK}}
  - {{IMPLEMENTATION_STEP}}
  - _Requirements: 1.1_
\`\`\`
`,

  hook: `
## Hook Starter Template

\`\`\`json
{
  "name": "{{HOOK_NAME}}",
  "version": "1.0.0",
  "description": "{{DESCRIPTION}}",
  "when": {
    "type": "{{TRIGGER_TYPE}}",
    "patterns": ["{{FILE_PATTERN}}"]
  },
  "then": {
    "type": "{{ACTION_TYPE}}",
    "command": "{{SHELL_COMMAND}}"
  }
}
\`\`\`

**Placeholders:**
- \`{{TRIGGER_TYPE}}\`: One of fileEdited, fileCreated,
  fileDeleted, promptSubmit, agentStop, preToolUse,
  postToolUse, userTriggered
- \`{{ACTION_TYPE}}\`: One of askAgent, runCommand
- \`{{FILE_PATTERN}}\`: Glob pattern like \`**/*.ts\`
`,

  'steering-doc': `
## Steering Doc Starter Template

\`\`\`markdown
---
inclusion: {{INCLUSION_MODE}}
fileMatchPattern: "{{PATTERN}}"
---

# {{TITLE}}

## Guidelines

- {{GUIDELINE_1}}
- {{GUIDELINE_2}}

## Examples

{{EXAMPLE_CODE_OR_TEXT}}
\`\`\`

**Placeholders:**
- \`{{INCLUSION_MODE}}\`: always, fileMatch, or manual
- \`{{PATTERN}}\`: Required only for fileMatch mode
`,

  skill: `
## Skill Starter Template

\`\`\`markdown
---
name: {{SKILL_NAME}}
description: >
  {{SHORT_DESCRIPTION}}.
  Use when: {{ACTIVATION_TRIGGERS}}.
license: MIT
---

# {{DISPLAY_NAME}}

## Overview
{{WHAT_THIS_SKILL_DOES}}

## Instructions
{{DETAILED_GUIDANCE}}
\`\`\`

**Placeholders:**
- \`{{SKILL_NAME}}\`: 1-64 chars, lowercase + hyphens
- \`{{SHORT_DESCRIPTION}}\`: 250-350 characters
- Keep total SKILL.md under 5000 tokens
`,

  power: `
## Power Starter Template

### POWER.md

\`\`\`markdown
---
name: {{POWER_NAME}}
displayName: {{DISPLAY_NAME}}
description: {{DESCRIPTION}}
keywords: {{KEYWORD_1}}, {{KEYWORD_2}}
---

# {{DISPLAY_NAME}}

## Overview
{{WHAT_THIS_POWER_DOES}}

## Getting Started
1. {{SETUP_STEP_1}}
2. {{SETUP_STEP_2}}
\`\`\`

### mcp.json

\`\`\`json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "node",
      "args": ["{{SERVER_PATH}}"]
    }
  }
}
\`\`\`
`,

  'mcp-server': `
## MCP Server Starter Template

### mcp.json (local)

\`\`\`json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "{{COMMAND}}",
      "args": ["{{ARG_1}}"]
    }
  }
}
\`\`\`

### mcp.json (remote)

\`\`\`json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "url": "{{SERVER_URL}}",
      "headers": {
        "Authorization": "Bearer \${{{ENV_VAR}}}"
      }
    }
  }
}
\`\`\`
`,

  'custom-agent': `
## Custom Agent Starter Template

\`\`\`json
{
  "name": "{{AGENT_NAME}}",
  "description": "{{DESCRIPTION}}",
  "prompt": "file://agents/{{AGENT_NAME}}-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "node",
      "args": ["{{SERVER_PATH}}"]
    }
  },
  "resources": ["file://{{RESOURCE_GLOB}}"],
  "welcomeMessage": "{{WELCOME_MESSAGE}}"
}
\`\`\`

**Placeholders:**
- \`{{AGENT_NAME}}\`: kebab-case agent identifier
- \`{{SERVER_NAME}}\`: MCP server name for tool access
- \`{{RESOURCE_GLOB}}\`: Glob for knowledge base files
`,

  'autonomous-agent': `
## Autonomous Agent Starter Template

\`\`\`text
Task: {{TASK_DESCRIPTION}}
Success Criteria: {{SUCCESS_CRITERIA}}
Timeout: {{TIMEOUT_MINUTES}} minutes
Error Handling: {{ERROR_STRATEGY}}
\`\`\`
`,

  subagent: `
## Subagent Starter Template

\`\`\`text
Objective: {{SPECIFIC_OBJECTIVE}}
Context: {{RELEVANT_CONTEXT}}
Constraints: {{CONSTRAINTS}}
Expected Output: {{OUTPUT_FORMAT}}
\`\`\`
`,

  'context-provider': `
## Context Provider Usage Template

\`\`\`text
# In chat, reference context with # prefix:
#file:{{FILE_PATH}}
#folder:{{FOLDER_PATH}}
#spec:{{SPEC_NAME}}
#steering:{{STEERING_NAME}}
\`\`\`
`,
};
