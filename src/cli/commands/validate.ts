import { readFile } from 'node:fs/promises';
import { validate } from '../../lib/configGenerator.js';

export async function run(args: string[], _flags: Set<string>): Promise<void> {
  const filePath = args[0];

  if (!filePath) {
    console.error('Usage: kiro-wiz validate <file>');
    process.exit(1);
  }

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (err) {
    console.error(`Cannot read file: ${(err as Error).message}`);
    process.exit(1);
  }

  let config: any;
  try {
    config = JSON.parse(raw);
  } catch {
    console.error('File is not valid JSON.');
    process.exit(1);
  }

  if (!config.toolType) {
    console.error('Config must have a "toolType" field.');
    process.exit(1);
  }

  const result = validate({ toolType: config.toolType, config });

  if (result.isValid) {
    console.log('✓ Config is valid.');
  } else {
    console.error('✗ Validation errors:');
    for (const err of result.errors) {
      console.error(`  - ${err.field}: ${err.message}`);
    }
    process.exit(1);
  }
}
