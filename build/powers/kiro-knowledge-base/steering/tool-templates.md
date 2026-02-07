---
inclusion: manual
---

# Tool Templates

Starter templates for all 10 Kiro tool types. Copy and
fill in `{{...}}` placeholders.

## Hook

```json
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
```

- `when.type`: `fileEdited`, `fileCreated`,
  `fileDeleted`, `promptSubmit`, `agentStop`,
  `preToolUse`, `postToolUse`, `userTriggered`
- `then.type`: `runCommand` (free) or `askAgent`
  (medium credits; use `prompt` instead of `command`)

## Steering Doc

```markdown
---
inclusion: {{MODE}}
fileMatchPattern: "{{PATTERN}}"
---

# {{TITLE}}

## Guidelines

- {{GUIDELINE_1}}
- {{GUIDELINE_2}}
```

- `inclusion`: `always`, `fileMatch`, or `manual`
- Remove `fileMatchPattern` unless using `fileMatch`

## Skill (SKILL.md)

```markdown
---
name: {{SKILL_NAME}}
description: >
  {{DESCRIPTION_250_350_CHARS}}.
  Use when: {{ACTIVATION_TRIGGERS}}.
license: MIT
---

# {{DISPLAY_NAME}}

## Overview

{{WHAT_THIS_SKILL_DOES}}

## Instructions

{{GUIDANCE_UNDER_5000_TOKENS}}
```

- `name`: 1-64 chars, lowercase + hyphens only
- Directory name must match `name` field

## Power (POWER.md + mcp.json)

```markdown
---
name: "{{POWER_NAME}}"
displayName: "{{DISPLAY_NAME}}"
description: "{{DESCRIPTION}}"
keywords: ["{{KW_1}}", "{{KW_2}}"]
---

# {{DISPLAY_NAME}}

## Overview

{{WHAT_THIS_POWER_DOES}}

## Onboarding

{{PREREQUISITES}}

## Available Steering Files

| File | When to Use |
| ---- | ----------- |
| `{{FILE}}.md` | {{USE_CASE}} |
```

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "{{COMMAND}}",
      "args": ["{{ARG_1}}"]
    }
  }
}
```

## MCP Server Config

### Local (stdio)

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "{{COMMAND}}",
      "args": ["{{ARG_1}}"],
      "env": { "{{ENV_VAR}}": "{{VALUE}}" }
    }
  }
}
```

### Remote (HTTP/SSE)

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "url": "{{SERVER_URL}}",
      "headers": {
        "Authorization": "Bearer ${{{ENV_VAR}}}"
      }
    }
  }
}
```

## Custom Agent

```json
{
  "name": "{{AGENT_NAME}}",
  "description": "{{DESCRIPTION}}",
  "prompt": "file://agents/{{AGENT_NAME}}-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "mcpServers": {
    "{{SERVER}}": {
      "command": "node",
      "args": ["{{SERVER_PATH}}"]
    }
  },
  "resources": ["file://{{RESOURCE_GLOB}}"],
  "welcomeMessage": "{{WELCOME}}"
}
```

## Spec

```markdown
# Requirements

### Requirement 1: {{FEATURE_NAME}}

**User Story:** As a {{PERSONA}}, I want {{GOAL}},
so that {{BENEFIT}}.

#### Acceptance Criteria

1. WHEN {{CONDITION}}
   THE SYSTEM SHALL {{BEHAVIOR}}
```

## Autonomous Agent

```text
Task: {{TASK_DESCRIPTION}}
Success Criteria: {{SUCCESS_CRITERIA}}
Timeout: {{TIMEOUT_MINUTES}} minutes
```

## Subagent

```text
Objective: {{SPECIFIC_OBJECTIVE}}
Context: {{RELEVANT_CONTEXT}}
Expected Output: {{OUTPUT_FORMAT}}
```

## Context Provider

```text
#file:{{FILE_PATH}}
#folder:{{FOLDER_PATH}}
#spec:{{SPEC_NAME}}
#steering:{{STEERING_NAME}}
```
