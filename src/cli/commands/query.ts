import { list, read, search } from '../../../lib/knowledgeBase.js';

export async function run(args: string[], _flags: Set<string>): Promise<void> {
  const searchTerm = args.join(' ').trim();

  if (!searchTerm) {
    const categories = list();
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

  const results = search(searchTerm);
  if (results.length === 0) {
    console.log(`No entries matching "${searchTerm}". Run "kiro-wiz query" to list all.`);
    return;
  }

  for (const entry of results) {
    console.log(`\n--- ${entry.category}/${entry.slug} ---`);
    console.log(`Title: ${entry.title}`);
    console.log(`Source: ${entry.sourceUrl}`);
    console.log(`Updated: ${entry.lastUpdated}\n`);
    console.log(entry.content.slice(0, 500));
    if (entry.content.length > 500) console.log('...(truncated)');
  }
}
