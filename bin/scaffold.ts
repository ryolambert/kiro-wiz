#!/usr/bin/env npx tsx

import type {
  KiroToolType,
  InstallScope,
  InstallTarget,
} from '../lib/types.js';
import { KIRO_TOOL_TYPES } from '../lib/types.js';
import { scaffoldTool, scaffoldComposite } from '../lib/scaffoldingEngine.js';
import { install, previewInstall } from '../lib/fileInstaller.js';

// ─── Arg Parsing ───────────────────────────────────────────

interface CliArgs {
  toolType: KiroToolType | 'composite';
  name: string;
  description: string;
  scope: InstallScope;
  targetDir: string | undefined;
  dryRun: boolean;
}

const VALID_SCOPES = ['workspace', 'global', 'custom'] as const;

function printUsage(): void {
  console.error(`
Usage: scaffold <toolType> --name <name> --desc <description> [options]

Tool types: ${KIRO_TOOL_TYPES.join(', ')}, composite

Options:
  --name <name>        Tool name (required)
  --desc <description> Tool description (required)
  --scope <scope>      Install scope: workspace, global, custom
                       (default: workspace)
  --target <path>      Target directory (required for custom scope)
  --global             Shorthand for --scope global
  --dry-run            Preview files without writing
  --help               Show this help

Examples:
  # Install hook to current workspace .kiro/
  scaffold hook --name lint-on-save --desc "Lint TS on save"

  # Install steering doc globally to ~/.kiro/
  scaffold steering-doc --name api-rules --desc "API conventions" --global

  # Install power to a specific project
  scaffold power --name my-power --desc "My power" \\
    --scope custom --target /path/to/project

  # Preview what would be created
  scaffold skill --name code-review --desc "Review PRs" --dry-run
`);
}

function parseArgs(argv: string[]): CliArgs | null {
  const positional = argv[2];
  if (!positional || positional === '--help') {
    printUsage();
    return null;
  }

  const allTypes = [...KIRO_TOOL_TYPES, 'composite'] as const;
  if (!allTypes.includes(positional as typeof allTypes[number])) {
    console.error(`Unknown tool type: ${positional}`);
    console.error(`Valid types: ${allTypes.join(', ')}`);
    return null;
  }

  let name = '';
  let description = '';
  let scope: InstallScope = 'workspace';
  let targetDir: string | undefined;
  let dryRun = false;

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--name':
        name = argv[++i] ?? '';
        break;
      case '--desc':
        description = argv[++i] ?? '';
        break;
      case '--scope':
        scope = argv[++i] as InstallScope;
        if (!VALID_SCOPES.includes(scope as typeof VALID_SCOPES[number])) {
          console.error(`Invalid scope: ${scope}`);
          return null;
        }
        break;
      case '--target':
        targetDir = argv[++i];
        break;
      case '--global':
        scope = 'global';
        break;
      case '--dry-run':
        dryRun = true;
        break;
      default:
        console.error(`Unknown flag: ${arg}`);
        return null;
    }
  }

  if (!name) {
    console.error('--name is required');
    return null;
  }
  if (!description) {
    console.error('--desc is required');
    return null;
  }
  if (scope === 'custom' && !targetDir) {
    console.error('--target is required for custom scope');
    return null;
  }

  return {
    toolType: positional as KiroToolType | 'composite',
    name,
    description,
    scope,
    targetDir,
    dryRun,
  };
}

// ─── Main ──────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  if (!args) {
    process.exit(1);
  }

  const installTarget: InstallTarget = {
    scope: args.scope,
    targetDir: args.targetDir,
  };

  const scaffoldResult =
    args.toolType === 'composite'
      ? scaffoldComposite({
          name: args.name,
          description: args.description,
        })
      : scaffoldTool(args.toolType, {
          name: args.name,
          description: args.description,
        });

  if (args.dryRun) {
    const preview = previewInstall(scaffoldResult, installTarget);
    console.log('Dry run — files that would be created:\n');
    for (const f of preview.installedFiles) {
      console.log(`  ${f.absolutePath}`);
    }
    console.log(`\nTarget root: ${preview.targetRoot}`);
    console.log(`Scope: ${preview.scope}`);
    console.log(`\n${scaffoldResult.instructions}`);
    return;
  }

  const result = await install(scaffoldResult, installTarget);

  if (result.errors.length > 0) {
    console.error('Errors during install:');
    for (const e of result.errors) {
      console.error(`  ${e.path}: ${e.message}`);
    }
  }

  console.log(`Installed ${result.installedFiles.length} file(s):\n`);
  for (const f of result.installedFiles) {
    console.log(`  ${f.absolutePath}`);
  }
  console.log(`\nTarget root: ${result.targetRoot}`);
  console.log(`Scope: ${result.scope}`);
  console.log(`\n${scaffoldResult.instructions}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
