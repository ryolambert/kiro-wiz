#!/usr/bin/env node

declare const PKG_VERSION: string;

import { resolve } from 'node:path';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

async function main(): Promise<void> {
  // MCP server mode
  if (flags.has('--mcp')) {
    const { runMcp } = await import('./cli/commands/mcp.js');
    await runMcp(args);
    return;
  }

  // Help
  if (flags.has('--help') || flags.has('-h')) {
    printHelp();
    return;
  }

  // Version
  if (flags.has('--version') || flags.has('-v')) {
    const v = typeof PKG_VERSION !== 'undefined' ? PKG_VERSION : '0.0.0-development';
    console.log(`kiro-wiz ${v}`);
    return;
  }

  // CLI subcommand mode
  if (positional.length > 0) {
    const { route } = await import('./cli/router.js');
    await route(positional, flags);
    return;
  }

  // TUI mode (default: no args, or --tui)
  try {
    const { launch } = await import('./tui/index.js');
    await launch();
  } catch (err) {
    console.error('Failed to start TUI:', (err as Error).message);
    console.error('Use "kiro-wiz --help" for CLI subcommands instead.');
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
kiro-wiz — Kiro Wizard CLI & TUI

Usage:
  kiro-wiz                        Launch interactive TUI
  kiro-wiz <command> [options]     Run CLI subcommand
  kiro-wiz --mcp                  Start MCP server (stdio)
  kiro-wiz --help                 Show this help

Commands:
  scaffold <type> <name>         Scaffold a Kiro tool (agent, hook, steering, etc.)
  audit [path]                   Audit workspace for best practices
  sync [--all]                   Sync knowledge base from kiro.dev
  query <search-term>            Search the knowledge base
  install [--scope local|global] Install pre-built configs
  validate <file>                Validate a Kiro config file
  recommend <use-case>           Get tool recommendations

Options:
  --mcp          Start as MCP server (stdio transport)
  --tui          Force TUI mode
  --dry-run      Preview without writing files
  --scope        Install scope: local (default) or global
  --force        Overwrite existing files
  --help, -h     Show help
  --version, -v  Show version
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
