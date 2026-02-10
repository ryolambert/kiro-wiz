import { useEffect, useState } from 'react';
import type { AuditReport } from '../../../lib/types.js';
import {
  compareAgainstBestPractices,
  generateReport,
  scan,
} from '../../../lib/workspaceAuditor.js';
import { Spinner } from '../components/Spinner.js';

interface Props {
  onBack: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF4444',
  recommended: '#FFAA00',
  optional: '#666666',
};

const SEVERITY_ICONS: Record<string, string> = {
  critical: '🔴',
  recommended: '🟡',
  optional: '⚪',
};

export function AuditScreen({ onBack: _onBack }: Props) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AuditReport | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const workspace = process.cwd();
        setStatus('Scanning workspace...');
        const files = await scan(workspace);
        setStatus(`Scanned ${files.length} files. Analyzing...`);
        const findings = await compareAgainstBestPractices(workspace, files);
        setReport(generateReport(findings, files));
      } catch (err) {
        setStatus(`Error: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <box style={{ flexDirection: 'column', padding: 1 }}>
      <box style={{ marginBottom: 1 }}>
        <text fg="#00FFAA">
          <strong>🔍 Audit</strong>
        </text>
        <text fg="#555555"> — Workspace best practices</text>
        <text fg="#444444">{'\n'}  ESC to go back</text>
      </box>

      {loading ? (
        <Spinner label={status || 'Scanning workspace...'} />
      ) : !report ? (
        <text fg="#FF4444">{status}</text>
      ) : (
        <>
          <box style={{ border: true, borderStyle: 'rounded', borderColor: '#333333', padding: 1, marginBottom: 1 }}>
            <text>
              📊 Scanned {report.scannedFiles.length} files — {report.findings.length} findings ({report.summary.critical} critical, {report.summary.recommended} recommended, {report.summary.optional} optional)
            </text>
          </box>
          <scrollbox style={{ rootOptions: { backgroundColor: '#1a1a26' } }} focused>
            {report.findings.map((f, i) => (
              <box key={i} style={{ marginBottom: 1 }}>
                <text fg={SEVERITY_COLORS[f.severity] ?? '#AAAAAA'}>
                  {SEVERITY_ICONS[f.severity] ?? '·'} [{f.severity}] [{f.category}] {f.message}
                </text>
                {f.file && <text fg="#555555">   📄 {f.file}</text>}
                <text fg="#666666">   → {f.suggestion}</text>
              </box>
            ))}
            {report.findings.length === 0 && (
              <text fg="#00FF00">✅ All scanned configurations follow best practices.</text>
            )}
          </scrollbox>
        </>
      )}
    </box>
  );
}
