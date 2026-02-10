import { resolve } from 'node:path';
import { createMcpServer } from '../../../lib/mcpServer.js';

export async function runMcp(args: string[]): Promise<void> {
  let transport: 'stdio' | 'http' = 'stdio';
  let port = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--http') transport = 'http';
    if (args[i] === '--port' && i + 1 < args.length) {
      const p = parseInt(args[++i], 10);
      if (!Number.isNaN(p) && p > 0) port = p;
    }
  }

  const server = createMcpServer({
    basePath: resolve('.'),
    transport,
    port,
  });

  await server.start();
}

export async function run(args: string[], _flags: Set<string>): Promise<void> {
  await runMcp(args);
}
