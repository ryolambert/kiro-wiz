import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { scan } from '../../lib/workspaceAuditor.js';

/**
 * **Feature: kiro-knowledge-base, Property 24: Workspace scan finds all config files**
 * **Validates: Requirements 9.1**
 *
 * For any workspace containing Kiro config files in the expected
 * locations:
 * - scan() SHALL find all steering files matching .kiro/steering/*.md
 * - scan() SHALL find all hook files matching .kiro/hooks/*.kiro.hook
 * - scan() SHALL find all skill files matching .kiro/skills/SKILL.md
 * - scan() SHALL find all spec directories matching .kiro/specs/
 * - scan() SHALL find all power files matching custom-powers/POWER.md
 * - scan() SHALL find .kiro/settings/mcp.json if it exists
 * - scan() SHALL find .kiro/settings/settings.json if it exists
 * - scan() SHALL find AGENTS.md if it exists
 */

// ─── Helpers ───────────────────────────────────────────────

async function createFile(
  base: string,
  relPath: string,
  content: string
): Promise<void> {
  const full = join(base, relPath);
  await mkdir(join(full, '..'), { recursive: true });
  await writeFile(full, content, 'utf-8');
}

async function createDir(
  base: string,
  relPath: string
): Promise<void> {
  await mkdir(join(base, relPath), { recursive: true });
}

// ─── Arbitraries ───────────────────────────────────────────

const SAFE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

const arbSafeName = fc
  .array(fc.constantFrom(...SAFE_CHARS), {
    minLength: 1,
    maxLength: 12,
  })
  .map((chars) => chars.join(''));

const arbSteeringNames = fc
  .array(arbSafeName, { minLength: 0, maxLength: 4 })
  .map((names) => [...new Set(names)]);

const arbHookNames = fc
  .array(arbSafeName, { minLength: 0, maxLength: 4 })
  .map((names) => [...new Set(names)]);

const arbSkillNames = fc
  .array(arbSafeName, { minLength: 0, maxLength: 4 })
  .map((names) => [...new Set(names)]);

const arbSpecNames = fc
  .array(arbSafeName, { minLength: 0, maxLength: 4 })
  .map((names) => [...new Set(names)]);

const arbPowerNames = fc
  .array(arbSafeName, { minLength: 0, maxLength: 4 })
  .map((names) => [...new Set(names)]);

interface WorkspaceLayout {
  steeringNames: string[];
  hookNames: string[];
  skillNames: string[];
  specNames: string[];
  powerNames: string[];
  hasMcpJson: boolean;
  hasSettingsJson: boolean;
  hasAgentsMd: boolean;
}

const arbWorkspaceLayout: fc.Arbitrary<WorkspaceLayout> = fc.record({
  steeringNames: arbSteeringNames,
  hookNames: arbHookNames,
  skillNames: arbSkillNames,
  specNames: arbSpecNames,
  powerNames: arbPowerNames,
  hasMcpJson: fc.boolean(),
  hasSettingsJson: fc.boolean(),
  hasAgentsMd: fc.boolean(),
});

async function buildWorkspace(
  base: string,
  layout: WorkspaceLayout
): Promise<void> {
  for (const name of layout.steeringNames) {
    await createFile(
      base,
      `.kiro/steering/${name}.md`,
      '---\ninclusion: always\n---\nContent'
    );
  }

  for (const name of layout.hookNames) {
    await createFile(
      base,
      `.kiro/hooks/${name}.kiro.hook`,
      JSON.stringify({
        name,
        version: '1.0.0',
        when: { type: 'fileSaved' },
        then: { type: 'runCommand', command: 'echo ok' },
      })
    );
  }

  for (const name of layout.skillNames) {
    await createFile(
      base,
      `.kiro/skills/${name}/SKILL.md`,
      `---\nname: ${name}\ndescription: A skill\n---\n`
    );
  }

  for (const name of layout.specNames) {
    await createDir(base, `.kiro/specs/${name}`);
  }

  for (const name of layout.powerNames) {
    await createFile(
      base,
      `custom-powers/${name}/POWER.md`,
      `---\nname: ${name}\ndisplayName: ${name}\ndescription: desc\nkeywords: test\n---\n`
    );
  }

  if (layout.hasMcpJson) {
    await createFile(
      base,
      '.kiro/settings/mcp.json',
      '{"mcpServers":{}}'
    );
  }

  if (layout.hasSettingsJson) {
    await createFile(
      base,
      '.kiro/settings/settings.json',
      '{}'
    );
  }

  if (layout.hasAgentsMd) {
    await createFile(base, 'AGENTS.md', '# Agents');
  }
}

function expectedFiles(layout: WorkspaceLayout): string[] {
  const expected: string[] = [];

  for (const name of layout.steeringNames) {
    expected.push(`.kiro/steering/${name}.md`);
  }
  for (const name of layout.hookNames) {
    expected.push(`.kiro/hooks/${name}.kiro.hook`);
  }
  for (const name of layout.skillNames) {
    expected.push(`.kiro/skills/${name}/SKILL.md`);
  }
  for (const name of layout.specNames) {
    expected.push(`.kiro/specs/${name}`);
  }
  for (const name of layout.powerNames) {
    expected.push(`custom-powers/${name}/POWER.md`);
  }
  if (layout.hasMcpJson) {
    expected.push('.kiro/settings/mcp.json');
  }
  if (layout.hasSettingsJson) {
    expected.push('.kiro/settings/settings.json');
  }
  if (layout.hasAgentsMd) {
    expected.push('AGENTS.md');
  }

  return expected.sort();
}

// ─── Tests ─────────────────────────────────────────────────

describe('Property 24: Workspace scan finds all config files', () => {
  const baseDirs: string[] = [];

  const freshBaseDir = (): string => {
    const dir = join(
      tmpdir(),
      `ws-prop24-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    baseDirs.push(dir);
    return dir;
  };

  afterEach(async () => {
    await Promise.all(
      baseDirs.map((d) => rm(d, { recursive: true, force: true }))
    );
    baseDirs.length = 0;
  });

  it('scan() finds every config file placed in the workspace', async () => {
    await fc.assert(
      fc.asyncProperty(arbWorkspaceLayout, async (layout) => {
        const base = freshBaseDir();
        await buildWorkspace(base, layout);

        const scanned = await scan(base);
        const expected = expectedFiles(layout);

        expect(scanned).toEqual(expected);
      }),
      { numRuns: 30 }
    );
  });

  it('scan() finds all steering files matching .kiro/steering/*.md', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSafeName, { minLength: 1, maxLength: 5 }).map(
          (names) => [...new Set(names)]
        ).filter((names) => names.length > 0),
        async (names) => {
          const base = freshBaseDir();
          for (const name of names) {
            await createFile(
              base,
              `.kiro/steering/${name}.md`,
              'content'
            );
          }

          const scanned = await scan(base);
          for (const name of names) {
            expect(scanned).toContain(`.kiro/steering/${name}.md`);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() finds all hook files matching .kiro/hooks/*.kiro.hook', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSafeName, { minLength: 1, maxLength: 5 }).map(
          (names) => [...new Set(names)]
        ).filter((names) => names.length > 0),
        async (names) => {
          const base = freshBaseDir();
          for (const name of names) {
            await createFile(
              base,
              `.kiro/hooks/${name}.kiro.hook`,
              '{}'
            );
          }

          const scanned = await scan(base);
          for (const name of names) {
            expect(scanned).toContain(
              `.kiro/hooks/${name}.kiro.hook`
            );
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() finds all skill files matching .kiro/skills/*/SKILL.md', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSafeName, { minLength: 1, maxLength: 5 }).map(
          (names) => [...new Set(names)]
        ).filter((names) => names.length > 0),
        async (names) => {
          const base = freshBaseDir();
          for (const name of names) {
            await createFile(
              base,
              `.kiro/skills/${name}/SKILL.md`,
              '---\nname: test\n---\n'
            );
          }

          const scanned = await scan(base);
          for (const name of names) {
            expect(scanned).toContain(
              `.kiro/skills/${name}/SKILL.md`
            );
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() finds all spec directories matching .kiro/specs/*/', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSafeName, { minLength: 1, maxLength: 5 }).map(
          (names) => [...new Set(names)]
        ).filter((names) => names.length > 0),
        async (names) => {
          const base = freshBaseDir();
          for (const name of names) {
            await createDir(base, `.kiro/specs/${name}`);
          }

          const scanned = await scan(base);
          for (const name of names) {
            expect(scanned).toContain(`.kiro/specs/${name}`);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() finds all power files matching custom-powers/*/POWER.md', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbSafeName, { minLength: 1, maxLength: 5 }).map(
          (names) => [...new Set(names)]
        ).filter((names) => names.length > 0),
        async (names) => {
          const base = freshBaseDir();
          for (const name of names) {
            await createFile(
              base,
              `custom-powers/${name}/POWER.md`,
              '---\nname: test\n---\n'
            );
          }

          const scanned = await scan(base);
          for (const name of names) {
            expect(scanned).toContain(
              `custom-powers/${name}/POWER.md`
            );
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() finds single config files when they exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasMcpJson: fc.boolean(),
          hasSettingsJson: fc.boolean(),
          hasAgentsMd: fc.boolean(),
        }),
        async ({ hasMcpJson, hasSettingsJson, hasAgentsMd }) => {
          const base = freshBaseDir();

          if (hasMcpJson) {
            await createFile(
              base,
              '.kiro/settings/mcp.json',
              '{}'
            );
          }
          if (hasSettingsJson) {
            await createFile(
              base,
              '.kiro/settings/settings.json',
              '{}'
            );
          }
          if (hasAgentsMd) {
            await createFile(base, 'AGENTS.md', '# Agents');
          }

          const scanned = await scan(base);

          if (hasMcpJson) {
            expect(scanned).toContain('.kiro/settings/mcp.json');
          } else {
            expect(scanned).not.toContain(
              '.kiro/settings/mcp.json'
            );
          }

          if (hasSettingsJson) {
            expect(scanned).toContain(
              '.kiro/settings/settings.json'
            );
          } else {
            expect(scanned).not.toContain(
              '.kiro/settings/settings.json'
            );
          }

          if (hasAgentsMd) {
            expect(scanned).toContain('AGENTS.md');
          } else {
            expect(scanned).not.toContain('AGENTS.md');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('scan() returns no false positives — only files that were created', async () => {
    await fc.assert(
      fc.asyncProperty(arbWorkspaceLayout, async (layout) => {
        const base = freshBaseDir();
        await buildWorkspace(base, layout);

        const scanned = await scan(base);
        const expected = new Set(expectedFiles(layout));

        for (const file of scanned) {
          expect(expected.has(file)).toBe(true);
        }
      }),
      { numRuns: 30 }
    );
  });
});

import { compareAgainstBestPractices } from '../../lib/workspaceAuditor.js';
import type { AuditFinding, Severity } from '../../lib/types.js';
import { SEVERITY_LEVELS } from '../../lib/types.js';

/**
 * **Feature: kiro-knowledge-base, Property 25: Finding completeness invariant**
 * **Validates: Requirements 9.3, 9.4**
 *
 * For any workspace with invalid configurations:
 * - compareAgainstBestPractices() SHALL produce findings for every invalid config
 * - Each finding SHALL have a valid severity (critical, recommended, optional)
 * - Each finding SHALL have a non-empty category, message, and suggestion
 * - Invalid steering (missing frontmatter) SHALL produce critical findings
 * - Invalid hooks (bad JSON or invalid trigger types) SHALL produce critical findings
 * - Invalid skills (name violations) SHALL produce findings
 * - Invalid powers (missing frontmatter fields) SHALL produce findings
 * - MCP configs with hardcoded secrets SHALL produce critical findings
 */

// ─── Helpers (Property 25) ─────────────────────────────────

function assertValidFinding(finding: AuditFinding): void {
  const validSeverities: readonly string[] = SEVERITY_LEVELS;
  expect(validSeverities).toContain(finding.severity);
  expect(finding.category.trim().length).toBeGreaterThan(0);
  expect(finding.message.trim().length).toBeGreaterThan(0);
  expect(finding.suggestion.trim().length).toBeGreaterThan(0);
}

function hasCriticalFinding(findings: AuditFinding[]): boolean {
  return findings.some((f) => f.severity === 'critical');
}

// ─── Arbitraries (Property 25) ──────────────────────────────

/** Generates steering content WITHOUT valid frontmatter */
const arbInvalidSteeringContent = fc.oneof(
  fc.constant('No frontmatter here, just text'),
  fc.constant('---\nbadyaml: [unclosed\n---\nContent'),
  fc.constant(''),
  fc.constant('---\n---\nEmpty frontmatter'),
  fc.constant('---\ninclusion: badMode\n---\nContent'),
);

/** Generates hook content that is invalid JSON or has bad trigger types */
const arbInvalidHookContent = fc.oneof(
  fc.constant('not json at all'),
  fc.constant('{invalid json}'),
  fc.constant('{"when":{"type":"badTrigger"},"then":{"type":"runCommand","command":"echo"}}'),
  fc.constant(JSON.stringify({
    name: 'test',
    version: '1.0.0',
    when: { type: 'invalidTriggerType' },
    then: { type: 'askAgent', prompt: 'do stuff' },
  })),
  fc.constant(JSON.stringify({
    name: 'test',
    version: '1.0.0',
    when: { type: 'fileSaved' },
    then: { type: 'badAction' },
  })),
);

/** Generates skill content with name violations */
const arbInvalidSkillContent = fc.oneof(
  fc.constant('No frontmatter'),
  fc.constant('---\nname: UPPERCASE\ndescription: A skill\n---\n'),
  fc.constant('---\nname: -leading-hyphen\ndescription: A skill\n---\n'),
  fc.constant('---\nname: trailing-hyphen-\ndescription: A skill\n---\n'),
  fc.constant('---\nname: double--hyphen\ndescription: A skill\n---\n'),
  fc.constant('---\nname: valid-name\ndescription: \n---\n'),
);

/** Generates power content with missing frontmatter fields */
const arbInvalidPowerContent = fc.oneof(
  fc.constant('No frontmatter at all'),
  fc.constant('---\nname: test\n---\nMissing displayName, description, keywords'),
  fc.constant('---\ndisplayName: Test\n---\nMissing name, description, keywords'),
  fc.constant('---\nname: \ndisplayName: \ndescription: \nkeywords: \n---\n'),
);

/** Generates MCP config content with hardcoded secrets */
const arbMcpWithSecrets = fc.oneof(
  fc.constant(JSON.stringify({
    mcpServers: {
      test: {
        command: 'node',
        args: ['server.js'],
        env: { API_KEY: 'sk-1234567890abcdefghijklmnop' },
      },
    },
  })),
  fc.constant(JSON.stringify({
    mcpServers: {
      test: {
        url: 'https://example.com',
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.test' },
      },
    },
  })),
  fc.constant(JSON.stringify({
    mcpServers: {
      test: {
        command: 'node',
        args: [],
        env: { token: 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh1234' },
      },
    },
  })),
);

/** Generates a random invalid config type for the workspace */
interface InvalidConfig {
  kind: 'steering' | 'hook' | 'skill' | 'power' | 'mcp';
  name: string;
  content: string;
}

const arbInvalidConfig: fc.Arbitrary<InvalidConfig> = fc.oneof(
  fc.record({
    kind: fc.constant('steering' as const),
    name: arbSafeName,
    content: arbInvalidSteeringContent,
  }),
  fc.record({
    kind: fc.constant('hook' as const),
    name: arbSafeName,
    content: arbInvalidHookContent,
  }),
  fc.record({
    kind: fc.constant('skill' as const),
    name: arbSafeName,
    content: arbInvalidSkillContent,
  }),
  fc.record({
    kind: fc.constant('power' as const),
    name: arbSafeName,
    content: arbInvalidPowerContent,
  }),
  fc.record({
    kind: fc.constant('mcp' as const),
    name: fc.constant('mcp'),
    content: arbMcpWithSecrets,
  }),
);

function relativePathForConfig(cfg: InvalidConfig): string {
  switch (cfg.kind) {
    case 'steering':
      return `.kiro/steering/${cfg.name}.md`;
    case 'hook':
      return `.kiro/hooks/${cfg.name}.kiro.hook`;
    case 'skill':
      return `.kiro/skills/${cfg.name}/SKILL.md`;
    case 'power':
      return `custom-powers/${cfg.name}/POWER.md`;
    case 'mcp':
      return '.kiro/settings/mcp.json';
  }
}

async function buildInvalidWorkspace(
  base: string,
  configs: InvalidConfig[]
): Promise<string[]> {
  const files: string[] = [];
  const seen = new Set<string>();

  for (const cfg of configs) {
    const rel = relativePathForConfig(cfg);
    if (seen.has(rel)) continue;
    seen.add(rel);
    await createFile(base, rel, cfg.content);
    files.push(rel);
  }

  return files.sort();
}

// ─── Tests (Property 25) ───────────────────────────────────

describe('Property 25: Finding completeness invariant', () => {
  const baseDirs: string[] = [];

  const freshBaseDir = (): string => {
    const dir = join(
      tmpdir(),
      `ws-prop25-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    baseDirs.push(dir);
    return dir;
  };

  afterEach(async () => {
    await Promise.all(
      baseDirs.map((d) => rm(d, { recursive: true, force: true }))
    );
    baseDirs.length = 0;
  });

  it('produces findings for every invalid config in the workspace', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbInvalidConfig, { minLength: 1, maxLength: 5 })
          .map((cfgs) => {
            const seen = new Set<string>();
            return cfgs.filter((c) => {
              const rel = relativePathForConfig(c);
              if (seen.has(rel)) return false;
              seen.add(rel);
              return true;
            });
          })
          .filter((cfgs) => cfgs.length > 0),
        async (configs) => {
          const base = freshBaseDir();
          const files = await buildInvalidWorkspace(base, configs);
          const findings = await compareAgainstBestPractices(
            base,
            files
          );

          // At least one finding per invalid config file
          for (const cfg of configs) {
            const rel = relativePathForConfig(cfg);
            if (!files.includes(rel)) continue;
            const fileFindings = findings.filter(
              (f) => f.file === rel
            );
            expect(fileFindings.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('every finding has valid severity, non-empty category, message, and suggestion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbInvalidConfig, { minLength: 1, maxLength: 5 })
          .map((cfgs) => {
            const seen = new Set<string>();
            return cfgs.filter((c) => {
              const rel = relativePathForConfig(c);
              if (seen.has(rel)) return false;
              seen.add(rel);
              return true;
            });
          })
          .filter((cfgs) => cfgs.length > 0),
        async (configs) => {
          const base = freshBaseDir();
          const files = await buildInvalidWorkspace(base, configs);
          const findings = await compareAgainstBestPractices(
            base,
            files
          );

          for (const finding of findings) {
            assertValidFinding(finding);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('invalid steering (missing frontmatter) produces critical findings', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbSafeName,
        arbInvalidSteeringContent,
        async (name, content) => {
          const base = freshBaseDir();
          const rel = `.kiro/steering/${name}.md`;
          await createFile(base, rel, content);

          const findings = await compareAgainstBestPractices(
            base,
            [rel]
          );

          expect(findings.length).toBeGreaterThan(0);
          expect(hasCriticalFinding(findings)).toBe(true);

          for (const f of findings) {
            assertValidFinding(f);
            expect(f.category).toBe('steering');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('invalid hooks (bad JSON or invalid trigger types) produce critical findings', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbSafeName,
        arbInvalidHookContent,
        async (name, content) => {
          const base = freshBaseDir();
          const rel = `.kiro/hooks/${name}.kiro.hook`;
          await createFile(base, rel, content);

          const findings = await compareAgainstBestPractices(
            base,
            [rel]
          );

          expect(findings.length).toBeGreaterThan(0);
          expect(hasCriticalFinding(findings)).toBe(true);

          for (const f of findings) {
            assertValidFinding(f);
            expect(f.category).toBe('hooks');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('invalid skills (name violations) produce findings', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbSafeName,
        arbInvalidSkillContent,
        async (name, content) => {
          const base = freshBaseDir();
          const rel = `.kiro/skills/${name}/SKILL.md`;
          await createFile(base, rel, content);

          const findings = await compareAgainstBestPractices(
            base,
            [rel]
          );

          expect(findings.length).toBeGreaterThan(0);

          for (const f of findings) {
            assertValidFinding(f);
            expect(f.category).toBe('skills');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('invalid powers (missing frontmatter fields) produce findings', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbSafeName,
        arbInvalidPowerContent,
        async (name, content) => {
          const base = freshBaseDir();
          const rel = `custom-powers/${name}/POWER.md`;
          await createFile(base, rel, content);

          const findings = await compareAgainstBestPractices(
            base,
            [rel]
          );

          expect(findings.length).toBeGreaterThan(0);

          for (const f of findings) {
            assertValidFinding(f);
            expect(f.category).toBe('powers');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('MCP configs with hardcoded secrets produce critical findings', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbMcpWithSecrets,
        async (content) => {
          const base = freshBaseDir();
          const rel = '.kiro/settings/mcp.json';
          await createFile(base, rel, content);

          const findings = await compareAgainstBestPractices(
            base,
            [rel]
          );

          expect(findings.length).toBeGreaterThan(0);
          expect(hasCriticalFinding(findings)).toBe(true);

          for (const f of findings) {
            assertValidFinding(f);
            expect(f.category).toBe('mcp');
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});

import { generateReport } from '../../lib/workspaceAuditor.js';

/**
 * **Feature: kiro-knowledge-base, Property 26: Audit report severity grouping**
 * **Validates: Requirements 9.5**
 *
 * For any audit report:
 * - The findings SHALL be correctly grouped by severity level
 * - The summary.critical count SHALL match the actual number of findings with severity='critical'
 * - The summary.recommended count SHALL match the actual number of findings with severity='recommended'
 * - The summary.optional count SHALL match the actual number of findings with severity='optional'
 * - This property holds for empty reports, single-severity reports, and mixed-severity reports
 */

// ─── Arbitraries (Property 26) ──────────────────────────────

const arbSeverity: fc.Arbitrary<Severity> = fc.constantFrom(
  'critical',
  'recommended',
  'optional'
);

const arbAuditFinding: fc.Arbitrary<AuditFinding> = fc.record({
  severity: arbSeverity,
  category: fc.constantFrom('steering', 'hooks', 'skills', 'powers', 'mcp', 'general'),
  message: fc.string({ minLength: 1, maxLength: 100 }),
  file: fc.oneof(
    fc.constant(null),
    fc.string({ minLength: 1, maxLength: 50 })
  ),
  suggestion: fc.string({ minLength: 1, maxLength: 100 }),
  kbRef: fc.oneof(
    fc.constant(null),
    fc.string({ minLength: 1, maxLength: 50 })
  ),
});

const arbAuditFindings = fc.array(arbAuditFinding, {
  minLength: 0,
  maxLength: 20,
});

const arbScannedFiles = fc.array(
  fc.string({ minLength: 1, maxLength: 50 }),
  { minLength: 0, maxLength: 10 }
);

// ─── Tests (Property 26) ───────────────────────────────────

describe('Property 26: Audit report severity grouping', () => {
  it('summary counts match actual findings by severity', () => {
    fc.assert(
      fc.property(
        arbAuditFindings,
        arbScannedFiles,
        (findings, scannedFiles) => {
          const report = generateReport(findings, scannedFiles);

          const actualCritical = findings.filter(
            (f) => f.severity === 'critical'
          ).length;
          const actualRecommended = findings.filter(
            (f) => f.severity === 'recommended'
          ).length;
          const actualOptional = findings.filter(
            (f) => f.severity === 'optional'
          ).length;

          expect(report.summary.critical).toBe(actualCritical);
          expect(report.summary.recommended).toBe(actualRecommended);
          expect(report.summary.optional).toBe(actualOptional);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('summary counts are correct for empty reports', () => {
    fc.assert(
      fc.property(arbScannedFiles, (scannedFiles) => {
        const report = generateReport([], scannedFiles);

        expect(report.summary.critical).toBe(0);
        expect(report.summary.recommended).toBe(0);
        expect(report.summary.optional).toBe(0);
        expect(report.findings).toEqual([]);
      }),
      { numRuns: 30 }
    );
  });

  it('summary counts are correct for single-severity reports', () => {
    fc.assert(
      fc.property(
        arbSeverity,
        fc.integer({ min: 1, max: 10 }),
        arbScannedFiles,
        (severity, count, scannedFiles) => {
          const findings: AuditFinding[] = Array.from(
            { length: count },
            (_, i) => ({
              severity,
              category: 'test',
              message: `Finding ${i}`,
              file: null,
              suggestion: 'Fix it',
              kbRef: null,
            })
          );

          const report = generateReport(findings, scannedFiles);

          if (severity === 'critical') {
            expect(report.summary.critical).toBe(count);
            expect(report.summary.recommended).toBe(0);
            expect(report.summary.optional).toBe(0);
          } else if (severity === 'recommended') {
            expect(report.summary.critical).toBe(0);
            expect(report.summary.recommended).toBe(count);
            expect(report.summary.optional).toBe(0);
          } else {
            expect(report.summary.critical).toBe(0);
            expect(report.summary.recommended).toBe(0);
            expect(report.summary.optional).toBe(count);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('summary counts are correct for mixed-severity reports', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        arbScannedFiles,
        (criticalCount, recommendedCount, optionalCount, scannedFiles) => {
          const findings: AuditFinding[] = [
            ...Array.from({ length: criticalCount }, (_, i) => ({
              severity: 'critical' as const,
              category: 'test',
              message: `Critical ${i}`,
              file: null,
              suggestion: 'Fix it',
              kbRef: null,
            })),
            ...Array.from({ length: recommendedCount }, (_, i) => ({
              severity: 'recommended' as const,
              category: 'test',
              message: `Recommended ${i}`,
              file: null,
              suggestion: 'Fix it',
              kbRef: null,
            })),
            ...Array.from({ length: optionalCount }, (_, i) => ({
              severity: 'optional' as const,
              category: 'test',
              message: `Optional ${i}`,
              file: null,
              suggestion: 'Fix it',
              kbRef: null,
            })),
          ];

          const report = generateReport(findings, scannedFiles);

          expect(report.summary.critical).toBe(criticalCount);
          expect(report.summary.recommended).toBe(recommendedCount);
          expect(report.summary.optional).toBe(optionalCount);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('report preserves all findings without modification', () => {
    fc.assert(
      fc.property(
        arbAuditFindings,
        arbScannedFiles,
        (findings, scannedFiles) => {
          const report = generateReport(findings, scannedFiles);

          expect(report.findings).toEqual(findings);
          expect(report.scannedFiles).toEqual(scannedFiles);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('total findings count equals sum of severity counts', () => {
    fc.assert(
      fc.property(
        arbAuditFindings,
        arbScannedFiles,
        (findings, scannedFiles) => {
          const report = generateReport(findings, scannedFiles);

          const totalFromSummary =
            report.summary.critical +
            report.summary.recommended +
            report.summary.optional;

          expect(report.findings.length).toBe(totalFromSummary);
        }
      ),
      { numRuns: 100 }
    );
  });
});
