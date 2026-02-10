import * as scaffold from './commands/scaffold.js';
import * as audit from './commands/audit.js';
import * as sync from './commands/sync.js';
import * as query from './commands/query.js';
import * as install from './commands/install.js';
import * as validate from './commands/validate.js';
import * as recommend from './commands/recommend.js';

const COMMANDS: Record<string, { run: (args: string[], flags: Set<string>) => Promise<void> }> = {
  scaffold,
  audit,
  sync,
  query,
  install,
  validate,
  recommend,
};

export async function route(positional: string[], flags: Set<string>): Promise<void> {
  const command = positional[0];
  const commandArgs = positional.slice(1);

  const mod = COMMANDS[command];
  if (!mod) {
    console.error(`Unknown command: ${command}`);
    console.error(`Run "kiro-wiz --help" for available commands.`);
    process.exit(1);
  }

  await mod.run(commandArgs, flags);
}
