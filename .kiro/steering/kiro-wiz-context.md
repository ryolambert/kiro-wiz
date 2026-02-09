---
inclusion: always
---

# kiro-wiz Context

This workspace contains the `kiro-wiz` tool — a unified CLI, TUI, and MCP server for Kiro ecosystem management.

## Architecture

- `src/main.ts` — Unified entry point dispatching to TUI (no args), CLI (subcommands), or MCP (`--mcp`)
- `src/cli/` — CLI subcommand handlers wrapping `lib/` modules
- `src/tui/` — OpenTUI React interactive terminal UI
- `lib/` — Core modules (scaffolding, auditing, crawling, KB, config validation, MCP server)
- `powers/kiro-wiz/` — Kiro IDE power integration (POWER.md + mcp.json)

## Key Commands

- `bun run src/main.ts` — Launch TUI
- `bun run src/main.ts scaffold hook my-hook` — CLI scaffold
- `bun run src/main.ts --mcp` — Start MCP server
- `bun run src/main.ts sync --all` — Sync KB from kiro.dev

## Development

- Runtime: Bun
- Build: `bun build src/main.ts --outdir dist`
- Test: `vitest run`
- All lib/ modules have corresponding tests in `tests/`
