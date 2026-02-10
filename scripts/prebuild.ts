#!/usr/bin/env bun
/**
 * Pre-build: crawl kiro.dev → write knowledge-base.json.
 * The build then imports this JSON directly into the binary.
 */
console.log('Syncing knowledge base from kiro.dev...');
const { run } = await import('../src/cli/commands/sync.js');
try {
  await run(['--all'], new Set(['--all']));
} catch (e) {
  console.error('Sync failed:', e instanceof Error ? e.message : e);
}

const { existsSync } = await import('node:fs');
if (existsSync('dist/knowledge-base.json')) {
  const { statSync } = await import('node:fs');
  const { size } = statSync('dist/knowledge-base.json');
  console.log(`✓ dist/knowledge-base.json (${(size / 1024).toFixed(0)}KB)`);
} else {
  console.error('✗ dist/knowledge-base.json not created');
  process.exit(1);
}
