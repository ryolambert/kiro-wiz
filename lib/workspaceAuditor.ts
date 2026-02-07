import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { AuditFinding, AuditReport } from './types';
import { SEVERITY_LEVELS } from './types';
import {
  checkSteering,
  checkHook,
  checkSkill,
  checkPower,
  checkMcpConfig,
  checkSettings,
} from './workspaceAuditorChecks';

// ─── Glob Patterns ─────────────────────────────────────────

interface ScanPattern {
  dir: string;
  pattern: RegExp;
  recursive: boolean;
}

const SCAN_PATTERNS: ScanPattern[] = [
  {
    dir: '.kiro/steering',
    pattern: /\.md$/,
    recursive: false,
  },
  {
    dir: '.kiro/hooks',
    pattern: /\.kiro\.hook$/,
    recursive: false,
  },
  {
    dir: '.kiro/skills',
    pattern: /^SKILL\.md$/,
    recursive: true,
  },
  {
    dir: '.kiro/specs',
    pattern: /.*/,
    recursive: false,
  },
  {
    dir: 'custom-powers',
    pattern: /^POWER\.md$/,
    recursive: true,
  },
];

const SINGLE_FILES = [
  '.kiro/settings/mcp.json',
  '.kiro/settings/settings.json',
  'AGENTS.md',
];

// ─── File Discovery ────────────────────────────────────────

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findMatchingFiles(
  basePath: string,
  scanPattern: ScanPattern
): Promise<string[]> {
  const dirPath = path.join(basePath, scanPattern.dir);
  const found: string[] = [];

  try {
    const dirStat = await fs.stat(dirPath);
    if (!dirStat.isDirectory()) return found;
  } catch {
    return found;
  }

  if (scanPattern.recursive) {
    await walkDirectory(dirPath, basePath, scanPattern.pattern, found);
  } else {
    try {
      const entries = await fs.readdir(dirPath, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        if (entry.isFile() && scanPattern.pattern.test(entry.name)) {
          found.push(
            path.relative(basePath, path.join(dirPath, entry.name))
          );
        } else if (
          entry.isDirectory() &&
          scanPattern.dir === '.kiro/specs'
        ) {
          found.push(
            path.relative(basePath, path.join(dirPath, entry.name))
          );
        }
      }
    } catch {
      // Directory not readable
    }
  }

  return found;
}

async function walkDirectory(
  dirPath: string,
  basePath: string,
  pattern: RegExp,
  results: string[]
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await walkDirectory(fullPath, basePath, pattern, results);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(path.relative(basePath, fullPath));
      }
    }
  } catch {
    // Directory not readable
  }
}

// ─── Scan ──────────────────────────────────────────────────

export async function scan(
  workspacePath: string
): Promise<string[]> {
  const scannedFiles: string[] = [];

  for (const pattern of SCAN_PATTERNS) {
    const files = await findMatchingFiles(workspacePath, pattern);
    scannedFiles.push(...files);
  }

  for (const singleFile of SINGLE_FILES) {
    const fullPath = path.join(workspacePath, singleFile);
    if (await fileExists(fullPath)) {
      scannedFiles.push(singleFile);
    }
  }

  return scannedFiles.sort();
}

// ─── Compare Against Best Practices ────────────────────────

export async function compareAgainstBestPractices(
  workspacePath: string,
  scannedFiles: string[]
): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  for (const file of scannedFiles) {
    const fullPath = path.join(workspacePath, file);
    const fileFindings = await checkFile(fullPath, file);
    findings.push(...fileFindings);
  }

  return findings;
}

async function checkFile(
  fullPath: string,
  relativePath: string
): Promise<AuditFinding[]> {
  // Spec directories are just tracked, not validated
  if (relativePath.startsWith('.kiro/specs/')) {
    try {
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) return [];
    } catch {
      return [];
    }
  }

  let content: string;
  try {
    content = await fs.readFile(fullPath, 'utf-8');
  } catch {
    return [
      {
        severity: 'critical',
        category: 'general',
        message: `Cannot read file: ${relativePath}`,
        file: relativePath,
        suggestion: 'Check file permissions',
        kbRef: null,
      },
    ];
  }

  if (relativePath.startsWith('.kiro/steering/')) {
    return checkSteering(relativePath, content);
  }

  if (relativePath.endsWith('.kiro.hook')) {
    return checkHook(relativePath, content);
  }

  if (relativePath.endsWith('/SKILL.md') || relativePath.includes('/skills/')) {
    const parts = relativePath.split('/');
    const skillIdx = parts.indexOf('skills');
    const dirName =
      skillIdx >= 0 && skillIdx + 1 < parts.length
        ? parts[skillIdx + 1]
        : '';
    return checkSkill(relativePath, content, dirName);
  }

  if (relativePath.endsWith('/POWER.md') || relativePath.includes('custom-powers/')) {
    return checkPower(relativePath, content);
  }

  if (relativePath === '.kiro/settings/mcp.json') {
    return checkMcpConfig(relativePath, content);
  }

  if (relativePath === '.kiro/settings/settings.json') {
    return checkSettings(relativePath, content);
  }

  if (relativePath === 'AGENTS.md') {
    return checkAgentsMd(relativePath, content);
  }

  return [];
}

function checkAgentsMd(
  filePath: string,
  content: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  if (content.trim().length === 0) {
    findings.push({
      severity: 'recommended',
      category: 'agents',
      message: 'AGENTS.md is empty',
      file: filePath,
      suggestion:
        'Add agent instructions to AGENTS.md for workspace-level guidance',
      kbRef: null,
    });
  }

  return findings;
}

// ─── Report Generation ─────────────────────────────────────

export function generateReport(
  findings: AuditFinding[],
  scannedFiles: string[]
): AuditReport {
  const summary = { critical: 0, recommended: 0, optional: 0 };

  for (const finding of findings) {
    summary[finding.severity]++;
  }

  return { findings, summary, scannedFiles };
}

export function formatReportMarkdown(
  report: AuditReport
): string {
  const lines: string[] = [
    '# Workspace Audit Report',
    '',
    `**Scanned files:** ${report.scannedFiles.length}`,
    `**Findings:** ${report.findings.length} ` +
      `(${report.summary.critical} critical, ` +
      `${report.summary.recommended} recommended, ` +
      `${report.summary.optional} optional)`,
    '',
  ];

  for (const severity of SEVERITY_LEVELS) {
    const grouped = report.findings.filter(
      (f) => f.severity === severity
    );
    if (grouped.length === 0) continue;

    lines.push(
      `## ${severity.charAt(0).toUpperCase() + severity.slice(1)}`,
      ''
    );

    for (const finding of grouped) {
      lines.push(
        `- **[${finding.category}]** ${finding.message}`
      );
      if (finding.file) {
        lines.push(`  - File: \`${finding.file}\``);
      }
      lines.push(`  - Suggestion: ${finding.suggestion}`);
      if (finding.kbRef) {
        lines.push(`  - Reference: ${finding.kbRef}`);
      }
      lines.push('');
    }
  }

  if (report.findings.length === 0) {
    lines.push(
      '## No Issues Found',
      '',
      'All scanned configurations follow best practices.',
      ''
    );
  }

  lines.push(
    '## Scanned Files',
    '',
    ...report.scannedFiles.map((f) => `- \`${f}\``),
    ''
  );

  return lines.join('\n');
}

// ─── Full Audit (convenience) ──────────────────────────────

export async function audit(
  workspacePath: string
): Promise<AuditReport> {
  const scannedFiles = await scan(workspacePath);
  const findings = await compareAgainstBestPractices(
    workspacePath,
    scannedFiles
  );
  return generateReport(findings, scannedFiles);
}
