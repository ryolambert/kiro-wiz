import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const INSTALL_DIR = resolve(fileURLToPath(import.meta.url), '../../../src/templates/_install');

export async function run(args: string[], flags: Set<string>): Promise<void> {
  const scope = getFlagValue(args, '--scope') ?? 'local';
  const force = flags.has('--force');

  const targetRoot =
    scope === 'global' ? join(process.env.HOME ?? '~', '.kiro') : join(process.cwd(), '.kiro');

  console.log(`Installing pre-built configs to: ${targetRoot} (${scope})`);

  try {
    const files = await collectFiles(INSTALL_DIR, '');
    for (const { relativePath, content } of files) {
      const dest = join(targetRoot, relativePath);
      await mkdir(resolve(dest, '..'), { recursive: true });

      try {
        await readFile(dest, 'utf-8');
        if (!force) {
          console.log(`  ⊘ ${relativePath} (exists, use --force to overwrite)`);
          continue;
        }
      } catch {
        /* doesn't exist, proceed */
      }

      await writeFile(dest, content, 'utf-8');
      console.log(`  ✓ ${relativePath}`);
    }
    console.log('Done.');
  } catch (err) {
    console.error(`Install failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

async function collectFiles(
  dir: string,
  prefix: string,
): Promise<Array<{ relativePath: string; content: string }>> {
  const results: Array<{ relativePath: string; content: string }> = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(join(dir, entry.name), rel)));
    } else {
      results.push({ relativePath: rel, content: await readFile(join(dir, entry.name), 'utf-8') });
    }
  }
  return results;
}

function getFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
