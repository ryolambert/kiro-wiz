#!/usr/bin/env npx tsx

import { resolve } from 'node:path';
import { createMcpServer } from '../lib/mcpServer.js';

function parseArgs(argv: string[]): {
  transport: 'stdio' | 'http';
  port: number;
} {
  let transport: 'stdio' | 'http' = 'stdio';
  let port = 3000;

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--http') {
      transport = 'http';
    } else if (arg === '--port' && i + 1 < argv.length) {
      const parsed = Number.parseInt(argv[++i], 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        port = parsed;
      }
    }
  }

  return { transport, port };
}

async function main(): Promise<void> {
  const { transport, port } = parseArgs(process.argv);
  const basePath = resolve('.');

  console.error(`Starting MCP server (${transport}, port: ${port})...`);

  const server = createMcpServer({
    basePath,
    transport,
    port,
  });

  await server.start();
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
