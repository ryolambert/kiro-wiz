const { version } = await Bun.file('package.json').json();

const result = await Bun.build({
  entrypoints: ['src/main.ts'],
  outdir: 'dist',
  target: 'node',
  format: 'esm',
  define: { PKG_VERSION: JSON.stringify(version) },
  naming: 'main.js',
  external: [
    '@modelcontextprotocol/sdk',
    '@opentui/core',
    '@opentui/react',
    'react',
    'cheerio',
    'js-yaml',
  ],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const p = 'dist/main.js';
let c = await Bun.file(p).text();
c = c.replace(/^#!.*\n/, '');
await Bun.write(p, `#!/usr/bin/env node\n${c}`);
