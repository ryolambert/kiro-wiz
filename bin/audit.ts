#!/usr/bin/env npx tsx

import {
  scan,
  compareAgainstBestPractices,
  generateReport,
  formatReportMarkdown,
} from '../lib/workspaceAuditor.js';

function parseArgs(argv: string[]): { workspace: string } {
  let workspace = process.cwd();

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--workspace' && i + 1 < argv.length) {
      workspace = argv[++i];
    }
  }

  return { workspace };
}

async function main(): Promise<void> {
  const { workspace } = parseArgs(process.argv);

  console.error(`Auditing workspace: ${workspace}`);

  const scannedFiles = await scan(workspace);
  console.error(`  Scanned ${scannedFiles.length} file(s)`);

  const findings = await compareAgainstBestPractices(
    workspace,
    scannedFiles
  );
  const report = generateReport(findings, scannedFiles);
  const markdown = formatReportMarkdown(report);

  process.stdout.write(markdown);

  console.error(
    `\n  ${report.summary.critical} critical, ` +
      `${report.summary.recommended} recommended, ` +
      `${report.summary.optional} optional`
  );
}

main().catch((err: unknown) => {
  console.error('Fatal:', err);
  process.exit(1);
});
