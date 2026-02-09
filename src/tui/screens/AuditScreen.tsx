import { useState, useEffect } from 'react';
import {
  scan,
  compareAgainstBestPractices,
  generateReport,
} from '../../../lib/workspaceAuditor.js';
import type { AuditReport } from '../../../lib/types.js';

interface Props { onBack: () => void; }

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF4444',
  recommended: '#FFAA00',
  optional: '#888888',
};

export function AuditScreen({ onBack: _onBack }: Props) {
  const [status, setStatus] = useState('Scanning workspace...');
  const [report, setReport] = useState<AuditReport | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const workspace = process.cwd();
        const files = await scan(workspace);
        setStatus(`Scanned ${files.length} files. Analyzing...`);
        const findings = await compareAgainstBestPractices(workspace, files);
        setReport(generateReport(findings, files));
        setStatus('Done');
      } catch (err) {
        setStatus(`Error: ${(err as Error).message}`);
      }
    })();
  }, []);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <text fg="#00FFAA"><strong>Audit</strong> — Workspace best practices</text>
      <text fg="#666666">ESC to go back</text>

      {!report ? (
        <text fg="#FFFF00">{status}</text>
      ) : (
        <>
          <text>
            Scanned {report.scannedFiles.length} files — {report.findings.length} findings
            ({report.summary.critical} critical, {report.summary.recommended} recommended, {report.summary.optional} optional)
          </text>
          <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' } }} focused>
            {report.findings.map((f, i) => (
              <box key={i} style={{ marginBottom: 1 }}>
                <text fg={SEVERITY_COLORS[f.severity] ?? '#AAAAAA'}>
                  [{f.severity}] [{f.category}] {f.message}
                </text>
                {f.file && <text fg="#666666">  File: {f.file}</text>}
                <text fg="#888888">  → {f.suggestion}</text>
              </box>
            ))}
            {report.findings.length === 0 && (
              <text fg="#00FF00">All scanned configurations follow best practices.</text>
            )}
          </scrollbox>
        </>
      )}
    </box>
  );
}
