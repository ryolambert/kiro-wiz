#!/usr/bin/env npx tsx

import { resolve } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  validateName,
  validateDirectory,
  validateFrontmatter,
  parseFrontmatter,
} from '../lib/skillsValidator.js';

async function main(): Promise<void> {
  const dirArg = process.argv[2];

  if (!dirArg) {
    console.error('Usage: validate-skill.ts <skill-directory>');
    process.exit(1);
  }

  const skillDir = resolve(dirArg);
  const dirName = basename(skillDir);

  console.error(`Validating skill: ${skillDir}`);

  // Check directory structure
  let hasSkillMd = false;
  const directories: string[] = [];

  try {
    const entries = await readdir(skillDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name === 'SKILL.md') {
        hasSkillMd = true;
      }
      if (entry.isDirectory()) {
        directories.push(entry.name);
      }
    }
  } catch {
    console.error(`Cannot read directory: ${skillDir}`);
    process.exit(1);
  }

  const dirResult = validateDirectory(
    { hasSkillMd, directories },
    dirName
  );

  // Validate name
  const nameResult = validateName(dirName);

  // Validate frontmatter if SKILL.md exists
  let fmErrors: Array<{ field: string; message: string }> = [];
  if (hasSkillMd) {
    const skillMdPath = join(skillDir, 'SKILL.md');
    const content = await readFile(skillMdPath, 'utf-8');
    const { frontmatter, errors: parseErrors } =
      parseFrontmatter(content);

    fmErrors = [...parseErrors];

    if (frontmatter) {
      const fmResult = validateFrontmatter(frontmatter, dirName);
      fmErrors.push(...fmResult.errors);
    }
  }

  // Collect all errors
  const allErrors = [
    ...nameResult.errors,
    ...dirResult.errors,
    ...fmErrors,
  ];

  if (allErrors.length === 0) {
    process.stdout.write(`✓ Skill "${dirName}" is valid\n`);
  } else {
    process.stdout.write(`✗ Skill "${dirName}" has errors:\n`);
    for (const err of allErrors) {
      process.stdout.write(`  [${err.field}] ${err.message}\n`);
    }
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
