import { scaffoldTool } from '../../lib/scaffoldingEngine.js';
import { previewInstall, install } from '../../lib/fileInstaller.js';
import type { KiroToolType, ScaffoldOptions } from '../../lib/types.js';
import { KIRO_TOOL_TYPES } from '../../lib/types.js';

export async function run(args: string[], flags: Set<string>): Promise<void> {
  const type = args[0] as KiroToolType;
  const name = args[1];

  if (!type || !name) {
    console.error(`Usage: kiro-wiz scaffold <type> <name> [--desc "..."] [--scope global] [--dry-run] [--force]`);
    console.error(`Types: ${KIRO_TOOL_TYPES.join(', ')}`);
    process.exit(1);
  }

  if (!KIRO_TOOL_TYPES.includes(type)) {
    console.error(`Unknown tool type: ${type}`);
    console.error(`Valid types: ${KIRO_TOOL_TYPES.join(', ')}`);
    process.exit(1);
  }

  const desc = getFlagValue(args, '--desc') ?? `${name} ${type}`;
  const scope = (getFlagValue(args, '--scope') ?? 'workspace') as 'workspace' | 'global';
  const dryRun = flags.has('--dry-run');

  const options: ScaffoldOptions = { name, description: desc };
  const result = scaffoldTool(type, options);

  const target = { scope };

  if (dryRun) {
    const preview = previewInstall(result, target);
    console.log('Files that would be created:');
    for (const f of preview.installedFiles) {
      console.log(`  ${f.absolutePath}`);
    }
    console.log(`\nTarget: ${preview.targetRoot} (${preview.scope})`);
    return;
  }

  const installed = await install(result, target);
  for (const f of installed.installedFiles) {
    console.log(`  ✓ ${f.relativePath}`);
  }
  for (const e of installed.errors) {
    console.error(`  ✗ ${e.path}: ${e.message}`);
  }
  console.log(result.instructions);
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
