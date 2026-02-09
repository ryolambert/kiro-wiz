# Kiro Wiz

Unified CLI, TUI, and MCP server for the Kiro ecosystem — scaffold generators, workspace auditing, knowledge base sync, and tool recommendations.

## Quick Start

```bash
cd ~/.kiro/tools/kiro-wiz
bun install

# Launch interactive TUI
bun run dev

# Or use CLI subcommands
bun run dev -- scaffold hook my-hook
bun run dev -- audit
bun run dev -- sync --all
bun run dev -- query hooks
bun run dev -- recommend "enforce code review standards"
bun run dev -- validate .kiro/agents/my-agent.json
bun run dev -- install --scope local

# Start MCP server
bun run dev:mcp
```

## Interface Modes

| Mode | Invocation | Description |
|------|-----------|-------------|
| TUI | `kiro-wiz` (no args) | Interactive terminal UI with menus |
| CLI | `kiro-wiz <command>` | Scriptable subcommands |
| MCP | `kiro-wiz --mcp` | MCP server for agent integration |

## CLI Commands

```
kiro-wiz scaffold <type> <name>   Scaffold a Kiro tool
kiro-wiz audit [path]             Audit workspace for best practices
kiro-wiz sync --all               Sync knowledge base from kiro.dev
kiro-wiz query [search-term]      Search the knowledge base
kiro-wiz install [--scope ...]    Install pre-built configs
kiro-wiz validate <file>          Validate a Kiro config file
kiro-wiz recommend <use-case>     Get tool recommendations
```

### Scaffold Types

`spec`, `hook`, `steering-doc`, `skill`, `power`, `mcp-server`, `custom-agent`, `autonomous-agent`, `subagent`, `context-provider`

### Options

| Flag | Description |
|------|-------------|
| `--mcp` | Start as MCP server (stdio) |
| `--tui` | Force TUI mode |
| `--dry-run` | Preview without writing files |
| `--scope local\|global` | Install scope |
| `--force` | Overwrite existing files |
| `--help` | Show help |

## MCP Tools

When running as MCP server, 9 tools are available:

| Tool | Description |
|------|-------------|
| `scaffold_tool` | Generate tool scaffolds |
| `install_tool` | Install scaffolded files |
| `audit_workspace` | Scan for best practices |
| `sync_knowledge_base` | Crawl and update KB |
| `query_knowledge_base` | Search KB |
| `validate_config` | Validate configs |
| `get_decision_matrix` | Tool selection matrix |
| `get_template` | Get scaffold templates |
| `get_platform_guide` | Platform guidance |

## Kiro IDE Integration

### Power

The `powers/kiro-wiz/` directory contains a Kiro IDE power that exposes all MCP tools to agents. Configure it in your agent's `mcpServers` field.

### Hook

`.kiro/hooks/kb-sync.kiro.hook` — manually triggered hook for KB sync.

### Steering

`.kiro/steering/kiro-wiz-context.md` — always-included context for agents working in this workspace.

## Architecture

```
src/main.ts          → Unified entry point (TUI / CLI / MCP)
src/cli/router.ts    → CLI subcommand dispatcher
src/cli/commands/    → 8 command handlers
src/tui/             → OpenTUI React terminal UI
lib/                 → 28 core modules (shared by all interfaces)
powers/kiro-wiz/     → Kiro IDE power integration
```

## Development

```bash
bun install          # Install dependencies
bun run dev          # Run in dev mode
bun run test         # Run tests
bun run build        # Build for distribution
```

## Pre-built Configs

Install best-practice configs to your workspace:

```bash
kiro-wiz install --scope local    # → .kiro/ in current directory
kiro-wiz install --scope global   # → ~/.kiro/
```

Includes: agents, steering docs, skills, and reference material.

## Scope Precedence

Local (`.kiro/`) overrides global (`~/.kiro/`) for agents, settings, and MCP configs.
