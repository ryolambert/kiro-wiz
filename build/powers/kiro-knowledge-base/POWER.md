---
name: "kiro-knowledge-base"
displayName: "Kiro Knowledge Base"
description: "Authoritative reference for all Kiro IDE, CLI, and Autonomous Agent tooling. Query documentation, get tool recommendations, scaffold new integrations, audit workspace configs, and generate valid configurations for hooks, steering, skills, powers, MCP servers, custom agents, specs, and subagents."
keywords:
  [
    "kiro",
    "knowledge base",
    "hooks",
    "steering",
    "skills",
    "powers",
    "mcp",
    "mcp server",
    "specs",
    "agents",
    "custom agent",
    "autonomous agent",
    "subagent",
    "context provider",
    "workflow",
    "audit",
    "scaffold",
    "template",
    "config",
    "best practices",
    "decision matrix",
    "tool recommendation",
    "kiro cli",
    "kiro ide",
    "POWER.md",
    "SKILL.md",
    "AGENTS.md",
    "steering doc",
    "hook config",
    "agent skills",
    "workspace audit",
    "config generator",
    "platform delivery",
  ]
---

# Kiro Knowledge Base

## Overview

The Kiro Knowledge Base power provides comprehensive,
structured access to all Kiro IDE, CLI, and Autonomous Agent
documentation. It serves as the authoritative reference for
developers and AI agents building Kiro integrations.

Key capabilities:

- **Query documentation** by topic, tool type, or search term
- **Get tool recommendations** with rationale, trade-offs,
  platform availability, and credit cost awareness
- **Scaffold new integrations** for any Kiro tool type with
  best-practice templates and guided Q&A
- **Audit workspace configs** against best practices with
  severity-grouped findings and suggested fixes
- **Generate valid configurations** for all 10 Kiro tool
  types: specs, hooks, steering docs, skills, powers, MCP
  servers, custom agents, autonomous agents, subagents, and
  context providers
- **Platform-aware output** tailored for IDE, CLI, or both

## Onboarding

### Prerequisites

Before using this power, verify the following:

```bash
# Node.js >= 20 required
node --version  # Must be v20.x or higher

# Verify npm packages are installed
npm ls cheerio @modelcontextprotocol/sdk js-yaml
```

### Required Dependencies

| Package                       | Purpose                    |
| ----------------------------- | -------------------------- |
| `cheerio`                     | HTML parsing for crawling  |
| `@modelcontextprotocol/sdk`   | MCP server implementation  |
| `js-yaml`                     | YAML frontmatter parsing   |

### Quick Start

1. Ensure dependencies are installed: `npm install`
2. The MCP server starts automatically via `mcp.json`
3. Use steering files for guided workflows (see below)

## Available Steering Files

Load steering files on-demand using `readSteering` action
with `powerName="kiro-knowledge-base"`:

| Steering File                  | When to Use                        |
| ------------------------------ | ---------------------------------- |
| `ide-workflows.md`             | Creating powers, hooks, steering   |
|                                | docs for Kiro IDE                  |
| `cli-workflows.md`             | Creating custom agents, CLI hooks, |
|                                | knowledge base resources           |
| `cross-platform.md`            | Building MCP servers, skills, and  |
|                                | steering that work on both         |
|                                | platforms                          |
| `tooling-decision-guide.md`    | Choosing which Kiro tool type to   |
|                                | use for a given scenario           |
| `workspace-audit-guide.md`     | Auditing workspace configs against |
|                                | best practices                     |
| `tool-templates.md`            | Starter templates for all 10 Kiro  |
|                                | tool types                         |

### Steering File Selection Guide

- **"I want to build something for the IDE"**
  → `ide-workflows.md`
- **"I want to build a CLI agent or tool"**
  → `cli-workflows.md`
- **"I need something that works everywhere"**
  → `cross-platform.md`
- **"I don't know which tool type to use"**
  → `tooling-decision-guide.md`
- **"I want to check my existing configs"**
  → `workspace-audit-guide.md`
- **"I need a starter template"**
  → `tool-templates.md`

## MCP Server Tools

The knowledge base exposes these tools via the MCP server:

| Tool                    | Description                          |
| ----------------------- | ------------------------------------ |
| `query_knowledge_base`  | Search docs by topic, tool type, or  |
|                         | keyword                              |
| `get_decision_matrix`   | Compare all Kiro tool types with     |
|                         | use cases and trade-offs             |
| `get_template`          | Get a starter template for a tool    |
|                         | type                                 |
| `scaffold_tool`         | Create a new Kiro tool with guided   |
|                         | scaffolding                          |
| `validate_config`       | Validate a config against its schema |
| `audit_workspace`       | Audit workspace configs against best |
|                         | practices                            |
| `get_platform_guide`    | Get platform-specific setup guide    |
|                         | (IDE, CLI, or both)                  |

## Kiro Tool Types Reference

The knowledge base covers all 10 Kiro tool types:

| Tool Type          | Platform  | Description                    |
| ------------------ | --------- | ------------------------------ |
| `spec`             | IDE only  | Structured feature specs       |
| `hook`             | Both      | Event-driven automation        |
| `steering-doc`     | Both      | Context injection for agents   |
| `skill`            | Both      | Portable agent capabilities    |
| `power`            | IDE only  | Bundled IDE extensions         |
| `mcp-server`       | Both      | Tool servers via MCP protocol  |
| `custom-agent`     | CLI only  | CLI agent configurations       |
| `autonomous-agent` | Cloud     | Long-running cloud agents      |
| `subagent`         | IDE only  | Delegated IDE agent tasks      |
| `context-provider` | IDE only  | #-prefixed context references  |

## Common Workflows

### Create a New Kiro Integration

1. Activate this power
2. Read `tooling-decision-guide.md` steering file
3. Use `get_decision_matrix` to compare tool types
4. Use `scaffold_tool` to generate the integration
5. Use `validate_config` to verify the output

### Audit Existing Workspace

1. Activate this power
2. Read `workspace-audit-guide.md` steering file
3. Use `audit_workspace` to scan all `.kiro/` configs
4. Review severity-grouped findings
5. Apply suggested fixes

### Build Cross-Platform Integration

1. Activate this power
2. Read `cross-platform.md` steering file
3. Use `get_platform_guide` with `platform: "both"`
4. Use `scaffold_tool` for IDE power and CLI agent
5. Both will share the same MCP server backend

## References

- [Kiro Documentation](https://kiro.dev/docs/)
- [Agent Skills Specification](https://agentskills.io)
- [MCP Protocol](https://modelcontextprotocol.io)
