#!/usr/bin/env bun

declare const PKG_VERSION: string;

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

async function main(): Promise<void> {
  // Load KB: try knowledge-base.json (compiled into binary or on disk)
  try {
    const { initKB } = await import('../lib/knowledgeBase.js');
    const data = await import('../dist/knowledge-base.json');
    initKB(data.default);
  } catch {
    // No KB data available — query/recommend will be empty until sync
  }

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
    console.error('TUI failed to start:', err instanceof Error ? err.message : err);
    console.error('Use CLI commands instead:');
    console.error('  kiro-wiz <command> [options]');
    console.error('  kiro-wiz --help');
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
