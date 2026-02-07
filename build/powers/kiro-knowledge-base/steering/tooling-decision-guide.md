---
inclusion: manual
---

# Tooling Decision Guide

When to use which Kiro tool type, with platform
availability and credit costs.

## Decision Matrix

| Tool Type        | Platform | Credits | Best For             |
| ---------------- | -------- | ------- | -------------------- |
| Spec             | IDE      | High    | Complex feature      |
|                  |          |         | planning             |
| Hook             | Both     | None*   | Event-driven         |
|                  |          |         | automation           |
| Steering Doc     | Both     | None    | Persistent agent     |
|                  |          |         | guidelines           |
| Skill            | Both     | None    | Portable domain      |
|                  |          |         | knowledge            |
| Power            | IDE      | Medium  | Rich IDE extensions  |
| MCP Server       | Both     | Low     | Tool servers for     |
|                  |          |         | agents               |
| Custom Agent     | CLI      | Medium  | CLI-specific         |
|                  |          |         | workflows            |
| Autonomous Agent | Cloud    | High    | Background/CI tasks  |
| Subagent         | IDE      | Medium  | Delegated sub-tasks  |
| Context Provider | IDE      | None    | Chat context via #   |

*Hook credit cost depends on action type:
- `runCommand`: **none** (shell execution only)
- `askAgent`: **medium** (invokes agent reasoning)

## Quick Decision Flow

### "I want to automate something"

- On file save/create/delete → **Hook**
- On chat prompt submit → **Hook** (promptSubmit)
- Complex multi-step workflow → **Custom Agent** (CLI)
  or **Power** (IDE)

### "I want to provide guidance to agents"

- Always-on project rules → **Steering Doc** (always)
- File-specific rules → **Steering Doc** (fileMatch)
- Reusable across projects → **Skill**
- Reference guide on demand → **Steering Doc** (manual)

### "I want to expose tools or APIs"

- External API for agents → **MCP Server**
- Rich IDE integration → **Power** (with MCP server)
- CLI tool access → **Custom Agent** (with mcpServers)

### "I want to plan a feature"

- Formal requirements + design + tasks → **Spec**
- Quick guidelines only → **Steering Doc**

### "I need cross-platform support"

Tools that work on both IDE and CLI:

- **Hook** — event triggers on both platforms
- **Steering Doc** — IDE via frontmatter, CLI via
  AGENTS.md or resources
- **Skill** — portable agent capabilities
- **MCP Server** — shared tool backend

### "I want background/cloud execution"

- Unattended cloud tasks → **Autonomous Agent**
- CI/CD integration → **Autonomous Agent**
- Parallel IDE sub-tasks → **Subagent**

## Platform Availability

### IDE Only

- **Spec** — structured feature planning
- **Power** — bundled IDE extensions
- **Subagent** — delegated agent tasks
- **Context Provider** — # references in chat

### CLI Only

- **Custom Agent** — CLI agent configurations

### Both Platforms

- **Hook** — event-driven automation
- **Steering Doc** — agent context injection
- **Skill** — portable agent skills
- **MCP Server** — tool servers via MCP protocol

### Cloud

- **Autonomous Agent** — long-running cloud agents

## Credit Cost Details

### None (Free)

- **Steering Doc**: Static context, no agent calls
- **Skill**: Static content loaded on activation
- **Context Provider**: File/folder injection
- **Hook** (`runCommand`): Shell execution only

### Low

- **MCP Server**: JSON-RPC overhead only, no agent
  reasoning unless tools trigger agent calls

### Medium

- **Power**: MCP tools may invoke agent reasoning
- **Custom Agent**: Agent interactions per session
- **Subagent**: Per-invocation agent cost
- **Hook** (`askAgent`): Agent prompt per trigger

### High

- **Spec**: AI-assisted spec generation and execution
- **Autonomous Agent**: Cloud compute + agent time

## Combining Tool Types

Common combinations for maximum effectiveness:

- **Power + MCP Server + Steering**: Rich IDE
  integration with tools and guided workflows
- **Custom Agent + MCP Server + Resources**: CLI
  workflow with tool access and knowledge base
- **Hook + Steering Doc**: Automated checks with
  persistent guidelines
- **Skill + MCP Server**: Portable knowledge with
  dynamic tool access
- **Power + Custom Agent + MCP Server**: Full
  cross-platform integration sharing one backend
