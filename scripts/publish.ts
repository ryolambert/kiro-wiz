#!/usr/bin/env bun
import { $ } from 'bun';
import path from 'path';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = process.env.PKG_VERSION || pkg.version;
const dryRun = process.argv.includes('--dry-run');
const tag = process.argv.includes('--tag') ? process.argv[process.argv.indexOf('--tag') + 1] : undefined;

console.log(`Publishing kiro-wiz@${version}${dryRun ? ' (dry run)' : ''}\n`);

const distDir = path.resolve('dist');
const platformDirs = fs.readdirSync(distDir).filter((name) => {
  const full = path.join(distDir, name);
  return fs.statSync(full).isDirectory() && name.startsWith('kiro-wiz-');
});

console.log(`Found ${platformDirs.length} platform packages`);

// Build optionalDependencies map
const optionalDependencies: Record<string, string> = {};
for (const name of platformDirs) {
  optionalDependencies[name] = version;
}

// Create main package directory
const mainPkgDir = path.join(distDir, 'kiro-wiz');
await $`mkdir -p ${mainPkgDir}/bin`;
await $`cp ./bin/kiro-wiz ${mainPkgDir}/bin/kiro-wiz`;
await $`chmod +x ${mainPkgDir}/bin/kiro-wiz`;

await Bun.file(path.join(mainPkgDir, 'package.json')).write(
  JSON.stringify(
    {
      name: 'kiro-wiz',
      version,
      description: pkg.description,
      license: pkg.license,
      repository: pkg.repository,
      bin: { 'kiro-wiz': './bin/kiro-wiz' },
      optionalDependencies,
    },
    null,
    2,
  ),
);

console.log('optionalDependencies:', JSON.stringify(optionalDependencies, null, 2));

// Publish platform packages first (parallel)
const npmArgs = ['--access', 'public', ...(tag ? ['--tag', tag] : []), ...(dryRun ? ['--dry-run'] : [])];

await Promise.all(
  platformDirs.map(async (name) => {
    const dir = path.join(distDir, name);
    if (process.platform !== 'win32') await $`chmod -R 755 .`.cwd(dir);
    console.log(`Publishing ${name}@${version}...`);
    try {
      await $`npm publish ${npmArgs}`.cwd(dir);
      console.log(`  ✓ ${name}`);
    } catch (e) {
      const msg = String(e);
      if (msg.includes('403') || msg.includes('cannot publish over')) {
        console.log(`  ✓ ${name} (already published)`);
      } else {
        throw e;
      }
    }
  }),
);

// Publish main package last
console.log(`\nPublishing kiro-wiz@${version}...`);
try {
  await $`npm publish ${npmArgs}`.cwd(mainPkgDir);
  console.log(`✓ kiro-wiz@${version}`);
} catch (e) {
  const msg = String(e);
  if (msg.includes('403') || msg.includes('cannot publish over')) {
    console.log(`✓ kiro-wiz@${version} (already published)`);
  } else {
    throw e;
  }
}

console.log('\nPublish complete!');
