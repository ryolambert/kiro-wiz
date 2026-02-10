#!/usr/bin/env npx tsx

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { compile, serialize } from '../lib/compiler.js';
import { loadKB } from '../lib/knowledgeBase.js';
import { writeAll } from '../lib/referenceLibrary.js';

const KB_JSON = resolve('dist/knowledge-base.json');
const MASTER_REF_PATH = resolve('master-reference.md');
const REF_LIBRARY_DIR = resolve('reference-library');

async function main(): Promise<void> {
  console.error('Loading knowledge base...');
  await loadKB(KB_JSON);

  console.error('Compiling master reference...');
  const compiled = await compile();
  const markdown = serialize(compiled);

  await writeFile(MASTER_REF_PATH, markdown, 'utf-8');
  console.error(`  ✓ Master reference: ${MASTER_REF_PATH}`);
  console.error(
    `    ${compiled.sections.length} sections, ` +
      `${compiled.decisionMatrix.length} matrix entries`,
  );

  console.error('Generating reference library...');
  const written = await writeAll(REF_LIBRARY_DIR);
  console.error(`  ✓ Reference library: ${written.length} files`);

  console.error('Done.');
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
