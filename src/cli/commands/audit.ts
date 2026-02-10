import {
  scan,
  compareAgainstBestPractices,
  generateReport,
  formatReportMarkdown,
} from '../../../lib/workspaceAuditor.js';

export async function run(args: string[], _flags: Set<string>): Promise<void> {
  const workspace = args[0] ?? process.cwd();

  console.error(`Auditing workspace: ${workspace}`);

  const scannedFiles = await scan(workspace);
  console.error(`  Scanned ${scannedFiles.length} file(s)`);

  const findings = await compareAgainstBestPractices(workspace, scannedFiles);
  const report = generateReport(findings, scannedFiles);
  const markdown = formatReportMarkdown(report);

  process.stdout.write(markdown);

  const { critical, recommended, optional } = report.summary;
  console.error(`\nSummary: ${critical} critical, ${recommended} recommended, ${optional} optional`);
}
