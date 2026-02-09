import { resolve } from 'node:path';
import { list, read } from '../../lib/knowledgeBase.js';

const KB_BASE_DIR = resolve('knowledge-base');

export async function run(args: string[], _flags: Set<string>): Promise<void> {
  const searchTerm = args.join(' ').trim();

  if (!searchTerm) {
    // List all categories and entries
    const categories = await list(KB_BASE_DIR);
    if (categories.length === 0) {
      console.log('Knowledge base is empty. Run "kiro-wiz sync --all" to populate.');
      return;
    }
    for (const cat of categories) {
      console.log(`\n${cat.category}/ (${cat.files.length} entries)`);
      for (const file of cat.files) {
        console.log(`  ${file}`);
      }
    }
    return;
  }

  // Search across all entries
  const categories = await list(KB_BASE_DIR);
  let found = false;

  for (const cat of categories) {
    for (const file of cat.files) {
      if (file.includes(searchTerm) || cat.category.includes(searchTerm)) {
        const entry = await read(cat.category as any, file, KB_BASE_DIR);
        if (entry) {
          console.log(`\n--- ${cat.category}/${file} ---`);
          console.log(`Title: ${entry.title}`);
          console.log(`Source: ${entry.sourceUrl}`);
          console.log(`Updated: ${entry.lastUpdated}\n`);
          console.log(entry.content.slice(0, 500));
          if (entry.content.length > 500) console.log('...(truncated)');
          found = true;
        }
      }
    }
  }

  if (!found) {
    console.log(`No entries matching "${searchTerm}". Run "kiro-wiz query" to list all.`);
  }
}
