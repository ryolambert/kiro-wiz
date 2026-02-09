const COMMANDS: Record<string, string> = {
  scaffold: './commands/scaffold.js',
  audit: './commands/audit.js',
  sync: './commands/sync.js',
  query: './commands/query.js',
  install: './commands/install.js',
  validate: './commands/validate.js',
  recommend: './commands/recommend.js',
};

export async function route(positional: string[], flags: Set<string>): Promise<void> {
  const command = positional[0];
  const commandArgs = positional.slice(1);

  const modulePath = COMMANDS[command];
  if (!modulePath) {
    console.error(`Unknown command: ${command}`);
    console.error(`Run "kiro-wiz --help" for available commands.`);
    process.exit(1);
  }

  const mod = await import(modulePath);
  await mod.run(commandArgs, flags);
}
