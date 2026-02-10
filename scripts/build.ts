#!/usr/bin/env bun
import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';

const pkg = await Bun.file('package.json').json();
const version = process.env.PKG_VERSION || pkg.version;
const singleTarget = process.argv.includes('--single');
const skipInstall = process.argv.includes('--skip-install');

// Clean platform build dirs, preserve dist/knowledge-base.json
if (fs.existsSync('dist')) {
  for (const dir of fs.readdirSync('dist')) {
    if (dir.startsWith('kiro-wiz-')) fs.rmSync(path.join('dist', dir), { recursive: true });
  }
}
fs.mkdirSync('dist', { recursive: true });

const allTargets: { os: string; arch: 'arm64' | 'x64' }[] = [
  { os: 'darwin', arch: 'arm64' },
  { os: 'darwin', arch: 'x64' },
  { os: 'linux', arch: 'x64' },
  { os: 'linux', arch: 'arm64' },
  { os: 'win32', arch: 'x64' },
];

const targets = singleTarget
  ? allTargets.filter((t) => t.os === process.platform && t.arch === process.arch)
  : allTargets;

console.log(`Building kiro-wiz v${version}`);
console.log(`Target platforms: ${targets.length}\n`);

// Install cross-platform OpenTUI native deps
if (!skipInstall) {
  console.log('Installing platform-specific dependencies...');
  await $`bun install --os="*" --cpu="*" @opentui/core@${pkg.dependencies?.['@opentui/core'] || pkg.devDependencies?.['@opentui/core'] || 'latest'}`;
  await $`bun install --os="*" --cpu="*" @opentui/react@${pkg.dependencies?.['@opentui/react'] || pkg.devDependencies?.['@opentui/react'] || 'latest'}`;
  console.log('');
}

const parserWorkerPath = path.resolve('node_modules/@opentui/core/parser.worker.js');
const hasParserWorker = fs.existsSync(parserWorkerPath);

for (const { os, arch } of targets) {
  // npm uses "windows" not "win32" in package names
  const platformOs = os === 'win32' ? 'windows' : os;
  const name = `kiro-wiz-${platformOs}-${arch}`;
  const ext = os === 'win32' ? '.exe' : '';

  console.log(`Building ${name}...`);
  await $`mkdir -p dist/${name}/bin`;

  const defines: Record<string, string> = {
    PKG_VERSION: JSON.stringify(version),
  };

  if (hasParserWorker) {
    const bunfsRoot = os === 'win32' ? 'B:/~BUN/root/' : '/$bunfs/root/';
    const workerRelative = path.relative(process.cwd(), parserWorkerPath).replaceAll('\\', '/');
    defines.OTUI_TREE_SITTER_WORKER_PATH = bunfsRoot + workerRelative;
  }

  const bunTarget = `bun-${os}-${arch}`;

  const result = await Bun.build({
    entrypoints: ['src/main.ts', ...(hasParserWorker ? [parserWorkerPath] : [])],
    conditions: ['browser'],
    target: 'bun',
    define: defines,
    compile: {
      autoloadBunfig: false,
      autoloadDotenv: false,
      target: bunTarget as any,
      outfile: `dist/${name}/bin/kiro-wiz${ext}`,
    },
  });

  if (!result.success) {
    console.error(`✗ ${name} failed`);
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }

  // Platform package.json with os/cpu fields for npm optionalDependencies
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version,
        os: [os],
        cpu: [arch],
      },
      null,
      2,
    ),
  );

  console.log(`✓ ${name}`);
}

console.log(`\nBuild complete! ${targets.length} platform(s)`);
