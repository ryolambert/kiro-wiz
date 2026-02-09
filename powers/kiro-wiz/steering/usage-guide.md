---
inclusion: manual
---

# kiro-wiz Usage Guide

## Overview

`kiro-wiz` is the Kiro Wizard tool — a unified CLI, TUI, and MCP server for managing Kiro scaffolds, auditing workspaces, syncing documentation from kiro.dev, and getting tool recommendations.

## Quick Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `kiro-wiz scaffold <type> <name>` | Create a new Kiro tool scaffold |
| `kiro-wiz audit [path]` | Audit workspace for best practices |
| `kiro-wiz sync --all` | Sync knowledge base from kiro.dev |
| `kiro-wiz query [term]` | Search the knowledge base |
| `kiro-wiz install --scope local` | Install pre-built configs |
| `kiro-wiz validate <file>` | Validate a config file |
| `kiro-wiz recommend <use-case>` | Get tool recommendations |

### Tool Types

`spec`, `hook`, `steering-doc`, `skill`, `power`, `mcp-server`, `custom-agent`, `autonomous-agent`, `subagent`, `context-provider`

### MCP Tools

When running as MCP server (`kiro-kb --mcp`), the following tools are available:

- `scaffold_tool` — Generate tool scaffolds
- `audit_workspace` — Scan for best practices
- `sync_knowledge_base` — Crawl and update KB
- `query_knowledge_base` — Search KB
- `validate_config` — Validate configs
- `get_decision_matrix` — Tool selection matrix
- `get_template` — Get scaffold templates
- `install_tool` — Install scaffolded files
- `get_platform_guide` — Platform guidance

## When to Use

- **Scaffolding**: When creating new agents, hooks, steering docs, skills, powers, or MCP configs
- **Auditing**: When reviewing workspace configuration quality
- **Syncing**: When kiro.dev documentation has been updated
- **Querying**: When looking up Kiro best practices or reference material
- **Recommending**: When unsure which tool type fits a use case
