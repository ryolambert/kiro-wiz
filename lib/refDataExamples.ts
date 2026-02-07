import type { KiroToolType } from './types';

export const EXAMPLES_CONTENT: Record<KiroToolType, string> = {
  spec: `
## Feature Spec Example

\`\`\`markdown
# Requirements

### Requirement 1: User Authentication
**User Story:** As a developer, I want secure login,
so that my workspace is protected.

#### Acceptance Criteria
1. WHEN a user provides valid credentials
   THE SYSTEM SHALL grant access and create a session
2. WHEN a user provides invalid credentials
   THE SYSTEM SHALL display an error message
\`\`\`
`,

  hook: `
## Lint on Save Hook

\`\`\`json
{
  "name": "lint-on-save",
  "version": "1.0.0",
  "description": "Run ESLint when TypeScript files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts", "**/*.tsx"]
  },
  "then": {
    "type": "runCommand",
    "command": "npx eslint --fix {{filePath}}"
  }
}
\`\`\`

## Code Review Hook

\`\`\`json
{
  "name": "review-on-create",
  "version": "1.0.0",
  "description": "Review new files for best practices",
  "when": {
    "type": "fileCreated",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Review this new file for best practices"
  }
}
\`\`\`
`,

  'steering-doc': `
## Always-Included Steering Doc

\`\`\`markdown
---
inclusion: always
---

# Project Coding Standards

- Use TypeScript strict mode
- No \\\`any\\\` types
- Prefer interfaces over type aliases for objects
\`\`\`

## File-Match Steering Doc

\`\`\`markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts"
---

# Testing Guidelines

- Use vitest for all tests
- Write property-based tests for core logic
\`\`\`
`,

  skill: `
## Skill SKILL.md Example

\`\`\`markdown
---
name: react-best-practices
description: >
  React and Next performance optimization guidelines.
  Use when: writing, reviewing, or refactoring React/Next
  code to ensure optimal performance patterns.
license: MIT
---

# React Best Practices

## Component Patterns

- Use functional components with hooks
- Memoize expensive computations with useMemo
- Use useCallback for stable function references
\`\`\`
`,

  power: `
## Power Directory Example

\`\`\`text
custom-powers/my-power/
  POWER.md
  mcp.json
  steering/
    getting-started.md
    advanced-patterns.md
\`\`\`

## POWER.md Example

\`\`\`markdown
---
name: my-power
displayName: My Power
description: Helps with X, Y, and Z
keywords: x, y, z, workflow
---

# My Power

## Overview
This power provides guidance for X workflows.

## Getting Started
1. Install dependencies
2. Configure settings
\`\`\`
`,

  'mcp-server': `
## Local MCP Server Config

\`\`\`json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["dist/server"]
    }
  }
}
\`\`\`

## Remote MCP Server Config

\`\`\`json
{
  "mcpServers": {
    "shared-server": {
      "url": "https://mcp.example.com/sse",
      "headers": {
        "Authorization": "Bearer \${MCP_TOKEN}"
      }
    }
  }
}
\`\`\`
`,

  'custom-agent': `
## CLI Agent Example

\`\`\`json
{
  "name": "docs-assistant",
  "description": "Helps write and maintain documentation",
  "prompt": "file://agents/docs-prompt.md",
  "tools": ["read", "write"],
  "allowedTools": ["read"],
  "mcpServers": {
    "docs-server": {
      "command": "node",
      "args": ["lib/docsServer"]
    }
  },
  "resources": ["file://docs/**"],
  "welcomeMessage": "I can help with docs. Options:\\n1. Write new docs\\n2. Review existing\\n3. Update outdated"
}
\`\`\`
`,

  'autonomous-agent': `
## Autonomous Agent Task Example

\`\`\`text
Task: Update all dependency versions
Success criteria: All tests pass after update
Timeout: 30 minutes
\`\`\`
`,

  subagent: `
## Subagent Delegation Example

\`\`\`text
Main agent delegates:
  1. Subagent A: Refactor auth module
  2. Subagent B: Update test suite
  3. Subagent C: Update documentation
\`\`\`
`,

  'context-provider': `
## Context Provider Usage

\`\`\`text
User in chat:
  "Review #file:src/auth.ts against #steering:security-rules.md"

Result: Both files injected into agent context
\`\`\`
`,
};
