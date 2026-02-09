# Kiro Knowledge Base — OpenTUI CLI Rewrite Specification

## Overview

Unified rewrite of the kiro-knowledge-base tool: replace the disconnected plain-JS CLI (`src/cli.js`) and fragmented build system (`build.js`, `install.js`) with a single TypeScript entry point that exposes an interactive OpenTUI React TUI, scriptable CLI subcommands, and an MCP server — all sharing the existing `lib/` core modules. The tool is self-aware within the Kiro ecosystem, accessible to its own agents, hooks, and powers for self-updating via kiro.dev documentation crawling.

## Problem Statement

The kiro-knowledge-base has a powerful TypeScript backend (28 lib modules, MCP server, scaffolding engine, auditor, crawler, etc.) but its user-facing CLI is a disconnected plain-JS scaffold generator. The JS CLI (`src/cli.js` + `src/index.js` + `src/templates/`) and the TS backend (`lib/` + `bin/`) are separate systems that don't talk to each other. The `build.js` just copies `src/` → `dist/` with no TypeScript compilation.

## Requirements

### Core Architecture
- **Hybrid interface**: CLI subcommands for scripting + interactive TUI mode via OpenTUI React
- **Single npm package**: `kiro-knowledge-base` with one binary (`kiro-kb`) exposing TUI, CLI, and MCP server via flags/subcommands
- **Bun for development**: Use bun as dev runtime/build tool; output npm-installable compiled JS to `dist/`
- **Clean rewrite**: Replace `src/cli.js`, `src/index.js`, `src/templates/` (JS), `build.js`, `install.js` with TypeScript entry points importing from `lib/`

### Interface Modes
- `kiro-kb` (no args) → Launch interactive OpenTUI React TUI
- `kiro-kb <command> [options]` → Run CLI subcommand
- `kiro-kb --mcp [--port N]` → Start MCP server (stdio or HTTP)
- `kiro-kb --tui` → Force TUI mode
- `kiro-kb --help` → Show unified help

### Self-Update Mechanism
- **Self-update = kiro.dev doc crawler sync** (not package version upgrades)
- Major structural/package updates come from npm or git separately
- The upgrade functionality is for crawling kiro.dev documentation updates
- Exposed three ways: TUI menu item, CLI `sync` subcommand, MCP `sync_knowledge_base` tool

### Kiro IDE Integration
- Power invocation via `powers/kiro-kb/` with POWER.md + mcp.json
- Manual hook trigger via `.kiro/hooks/kb-sync.kiro.hook`
- Steering doc for agent awareness via `.kiro/steering/kiro-kb-context.md`
- All capabilities accessible to Kiro agents via MCP tools

### TUI Design
- **Progressive architecture**: Start focused (main menu → core workflow screens), architect for pluggable growth
- Main menu with select list: Scaffold, Audit, Sync KB, Query KB, Recommend Tool, Validate Config, Install Configs, Exit
- Graceful fallback: if OpenTUI fails to initialize, print error suggesting CLI subcommands

## Architecture

```
kiro-knowledge-base/
├── package.json              # Single npm package, bun build → dist/
├── tsconfig.json             # JSX support for OpenTUI React
├── src/
│   ├── main.ts               # Unified entry: dispatches to TUI, CLI, or MCP
│   ├── cli/
│   │   ├── router.ts         # Subcommand parser and dispatcher
│   │   └── commands/
│   │       ├── scaffold.ts   # → lib/scaffoldingEngine
│   │       ├── audit.ts      # → lib/workspaceAuditor
│   │       ├── sync.ts       # → lib/crawler + changeDetector + knowledgeBase
│   │       ├── query.ts      # → lib/knowledgeBase
│   │       ├── install.ts    # → lib/fileInstaller
│   │       ├── validate.ts   # → lib/configGenerator
│   │       ├── recommend.ts  # → lib/toolingAdvisor
│   │       └── mcp.ts        # → lib/mcpServer
│   └── tui/
│       ├── index.ts           # createCliRenderer + createRoot bootstrap
│       ├── App.tsx            # Root component, screen router, useKeyboard
│       └── screens/
│           ├── MainMenu.tsx       # Select list of all workflows
│           ├── ScaffoldScreen.tsx # Multi-step scaffold wizard
│           ├── AuditScreen.tsx    # Workspace audit with colored findings
│           ├── SyncScreen.tsx     # KB crawl with progress
│           ├── QueryScreen.tsx    # KB search and browse
│           ├── RecommendScreen.tsx # Tool recommendation
│           └── ValidateScreen.tsx  # Config validation
├── lib/                       # EXISTING — all 28 modules stay as-is
│   ├── mcpServer.ts           # + new sync_knowledge_base MCP tool
│   ├── scaffoldingEngine.ts
│   ├── workspaceAuditor.ts
│   ├── crawler.ts
│   ├── knowledgeBase.ts
│   ├── configGenerator.ts
│   ├── toolingAdvisor.ts
│   ├── fileInstaller.ts
│   ├── types.ts
│   └── ... (20 more modules)
├── powers/
│   └── kiro-kb/
│       ├── POWER.md           # IDE power manifest
│       ├── mcp.json           # Points to kiro-kb --mcp
│       └── steering/
│           └── usage-guide.md # Manual inclusion steering doc
├── tests/                     # EXISTING — all test files preserved
├── bin/                       # EXISTING — kept as reference/aliases
└── dist/                      # Build output (npm-distributable JS)
    └── main.js                # Compiled entry point
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    kiro-kb binary                     │
├──────────┬──────────────────┬────────────────────────┤
│  --tui   │   <subcommand>   │        --mcp           │
│          │                  │                        │
│ OpenTUI  │   CLI Router     │   MCP Server           │
│ React    │   (router.ts)    │   (mcpServer.ts)       │
│ App      │                  │                        │
├──────────┴──────────────────┴────────────────────────┤
│                    lib/ core modules                  │
│  scaffoldingEngine · workspaceAuditor · crawler       │
│  knowledgeBase · configGenerator · toolingAdvisor     │
│  fileInstaller · compiler · contentParser · etc.      │
└──────────────────────────────────────────────────────┘
         ↑                    ↑                ↑
    Developer            Kiro Agent        Kiro Hook/Power
    (terminal)           (via MCP)         (via CLI)
```

## Design Decisions

1. **Single package, multiple modes**: One npm install gets TUI + CLI + MCP. No monorepo complexity.
2. **Lazy TUI import**: `src/main.ts` uses dynamic `import()` for TUI code so CLI/MCP paths don't load OpenTUI deps.
3. **Bun dev, npm dist**: Develop with bun (OpenTUI requires it for TUI), but `bun build` outputs standard JS to `dist/` for npm distribution.
4. **Existing lib/ untouched**: All 28 lib modules and their tests remain as-is. New code only adds entry points and UI.
5. **Progressive TUI**: Start with focused screens (Task 4-7), architect with screen router pattern so new screens are pluggable.
6. **Graceful degradation**: TUI mode catches initialization errors and suggests CLI subcommands as fallback.

## Files to Delete (Clean Rewrite)

- `src/cli.js` — replaced by `src/main.ts` + `src/cli/router.ts`
- `src/index.js` — replaced by direct `lib/` imports
- `src/templates/index.js` — replaced by `lib/scaffoldingEngine.ts`
- `src/templates/agent.js` — replaced by `lib/configGenerator.ts`
- `src/templates/steering.js` — replaced by `lib/configGenerator.ts`
- `src/templates/hook.js` — replaced by `lib/configGenerator.ts`
- `src/templates/prompt.js` — replaced by `lib/configGenerator.ts`
- `src/templates/skill.js` — replaced by `lib/configGenerator.ts`
- `src/templates/mcp.js` — replaced by `lib/configGenerator.ts`
- `src/templates/settings.js` — replaced by `lib/configGenerator.ts`
- `build.js` — replaced by `bun build` in package.json scripts
- `install.js` — replaced by `kiro-kb install` subcommand

### Files to Keep
- `src/templates/_install/` — pre-built configs, referenced by install command
- All `lib/` modules
- All `tests/` files
- All `bin/` scripts (as reference/aliases)
- `.kiro/specs/`, `.kiro/steering/`, `.kiro/settings/`

## Task Breakdown

### Task 1: Project restructure and build pipeline
Create `src/main.ts` entry point, `src/cli/router.ts`, update `package.json` with OpenTUI deps and bun build, update `tsconfig.json` for JSX, remove old JS files.

### Task 2: CLI subcommand layer
Implement `src/cli/commands/` for scaffold, audit, sync, query, install, validate, recommend — each importing from `lib/`.

### Task 3: MCP server entry point
Wire `lib/mcpServer.ts` into unified binary via `--mcp` flag, add `sync_knowledge_base` MCP tool.

### Task 4: OpenTUI React app shell — main menu
Create `src/tui/App.tsx`, `MainMenu.tsx` with select component, `src/tui/index.ts` renderer bootstrap, graceful fallback.

### Task 5: TUI Scaffold screen
Multi-step interactive scaffold: tool type select, name/desc inputs, scope select, file preview in scrollbox, confirm/install.

### Task 6: TUI Audit and Sync screens
AuditScreen with severity-colored findings in scrollbox, SyncScreen with crawl progress and results.

### Task 7: TUI Query, Recommend, and Validate screens
QueryScreen with search+browse, RecommendScreen with use-case input, ValidateScreen with config validation.

### Task 8: Kiro IDE integration — Power, Hook, Steering doc
Create `powers/kiro-kb/` with POWER.md+mcp.json, kb-sync hook, kiro-kb-context steering doc, update `_install/` templates.

### Task 9: Self-update wiring and install command
Wire crawler sync as upgrade path across CLI/TUI/MCP, install command for pre-built configs with `--scope`.

### Task 10: Final integration, cleanup, and documentation
Delete dead JS files, update README, verify existing tests pass, add smoke tests.

## Dependencies

### New (to add)
- `@opentui/core` — Terminal renderer
- `@opentui/react` — React reconciler for terminal
- `react` — React runtime

### Existing (keep)
- `@modelcontextprotocol/sdk` — MCP server
- `cheerio` — HTML parsing for crawler
- `js-yaml` — YAML frontmatter parsing

### Dev (keep)
- `typescript`, `tsx`, `vitest`, `fast-check`, `@vitest/coverage-v8`
- `@types/node`, `@types/js-yaml`

## Success Criteria

1. `kiro-kb --help` prints unified help with all subcommands
2. `kiro-kb` launches interactive TUI with main menu
3. `kiro-kb scaffold hook --name test --desc "test" --dry-run` prints file preview
4. `kiro-kb audit` scans workspace and prints findings
5. `kiro-kb sync --all` crawls kiro.dev and updates local KB
6. `kiro-kb --mcp` starts MCP server responding to all 9 tools (8 existing + sync)
7. All existing `vitest` tests pass unchanged
8. Kiro IDE can activate kiro-kb power and call MCP tools
9. Kiro agents can trigger KB sync via MCP or hook
