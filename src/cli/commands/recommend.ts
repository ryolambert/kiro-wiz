import { recommend, getDecisionMatrix } from '../../lib/toolingAdvisor.js';

export async function run(args: string[], flags: Set<string>): Promise<void> {
  if (flags.has('--matrix')) {
    console.log(getDecisionMatrix());
    return;
  }

  const useCase = args.join(' ').trim();

  if (!useCase) {
    console.error('Usage: kiro-wiz recommend <use-case description>');
    console.error('       kiro-wiz recommend --matrix');
    process.exit(1);
  }

  const recommendations = recommend(useCase);

  console.log(`Recommendations for: "${useCase}"\n`);
  for (const rec of recommendations) {
    console.log(`  ${rec.toolType}`);
    console.log(`    ${rec.rationale}\n`);
  }
}
