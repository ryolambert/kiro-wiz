#!/usr/bin/env npx tsx

import { resolve } from 'node:path';
import { run } from '../lib/changeDetector.js';
import { load, save } from '../lib/urlRegistry.js';

const STATE_PATH = resolve('knowledge-base/change-state.json');
const REGISTRY_PATH = resolve('knowledge-base/registry.json');

async function main(): Promise<void> {
  console.error('Loading registry...');
  let entries;
  try {
    entries = await load(REGISTRY_PATH);
  } catch {
    console.error('No registry found. Initialize first.');
    process.exit(1);
  }

  console.error('Running change detection...');
  const { result, updatedEntries } = await run(entries, {
    statePath: STATE_PATH,
  });

  console.error(`  New URLs:      ${result.newUrls.length}`);
  console.error(`  Modified URLs: ${result.modifiedUrls.length}`);
  console.error(`  Removed URLs:  ${result.removedUrls.length}`);

  if (result.newUrls.length > 0) {
    console.error('  New:');
    for (const url of result.newUrls) {
      console.error(`    + ${url}`);
    }
  }

  if (result.modifiedUrls.length > 0) {
    console.error('  Modified:');
    for (const url of result.modifiedUrls) {
      console.error(`    ~ ${url}`);
    }
  }

  if (result.removedUrls.length > 0) {
    console.error('  Removed:');
    for (const url of result.removedUrls) {
      console.error(`    - ${url}`);
    }
  }

  await save(updatedEntries, REGISTRY_PATH);
  console.error('Registry updated.');
  console.error('Done.');
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
