import {
  QUICK_REFERENCE_SCENARIOS,
  TOOL_TYPE_DISPLAY,
  buildDecisionMatrix,
  categoryToToolType,
  toAnchor,
} from './compilerData';
import { list, read } from './knowledgeBase';
import type {
  CompiledReference,
  CompilerOptions,
  KiroToolType,
  KnowledgeBaseEntry,
  PlatformTarget,
  ReferenceSection,
  ScenarioMapping,
  TocEntry,
  UrlCategory,
} from './types';
import { KIRO_TOOL_TYPES } from './types';

// Re-export for consumers
export {
  categoryToToolType,
  toAnchor,
  buildDecisionMatrix,
  TOOL_TYPE_DISPLAY,
  QUICK_REFERENCE_SCENARIOS,
} from './compilerData';

// ─── Read All KB Entries ───────────────────────────────────

export async function readAllEntries(baseDir?: string): Promise<KnowledgeBaseEntry[]> {
  const categories = await list(baseDir);
  const entries: KnowledgeBaseEntry[] = [];

  for (const cat of categories) {
    for (const slug of cat.files) {
      const entry = await read(cat.category as UrlCategory, slug, baseDir);
      if (entry) {
        entries.push(entry);
      }
    }
  }

  return entries;
}

// ─── Build Sections by Tool Type ───────────────────────────

export function buildSections(
  entries: KnowledgeBaseEntry[],
  toolTypes: KiroToolType[] | null,
): ReferenceSection[] {
  const types = toolTypes ?? [...KIRO_TOOL_TYPES];
  const sections: ReferenceSection[] = [];

  for (const toolType of types) {
    const matching = entries.filter((e) => categoryToToolType(e.category) === toolType);

    const subsections: ReferenceSection[] = matching.map((entry) => ({
      title: entry.title,
      toolType,
      content: entry.content,
      subsections: [],
    }));

    sections.push({
      title: TOOL_TYPE_DISPLAY[toolType],
      toolType,
      content: '',
      subsections,
    });
  }

  const uncategorized = entries.filter((e) => categoryToToolType(e.category) === null);

  if (uncategorized.length > 0) {
    const subsections: ReferenceSection[] = uncategorized.map((entry) => ({
      title: entry.title,
      toolType: null,
      content: entry.content,
      subsections: [],
    }));

    sections.push({
      title: 'General Reference',
      toolType: null,
      content: '',
      subsections,
    });
  }

  return sections;
}

// ─── Build TOC ─────────────────────────────────────────────

export function buildToc(
  sections: ReferenceSection[],
  includeDecisionMatrix: boolean,
  includeQuickReference: boolean,
): TocEntry[] {
  const toc: TocEntry[] = [];

  for (const section of sections) {
    toc.push({
      title: section.title,
      anchor: toAnchor(section.title),
      level: 1,
    });

    for (const sub of section.subsections) {
      toc.push({
        title: sub.title,
        anchor: toAnchor(sub.title),
        level: 2,
      });
    }
  }

  if (includeDecisionMatrix) {
    toc.push({
      title: 'Decision Matrix',
      anchor: 'decision-matrix',
      level: 1,
    });
  }

  if (includeQuickReference) {
    toc.push({
      title: 'Quick Reference',
      anchor: 'quick-reference',
      level: 1,
    });
  }

  return toc;
}

// ─── Compile ───────────────────────────────────────────────

const DEFAULT_OPTIONS: CompilerOptions = {
  includeDecisionMatrix: true,
  includeQuickReference: true,
  toolTypes: null,
};

export async function compile(
  baseDir?: string,
  options: Partial<CompilerOptions> = {},
): Promise<CompiledReference> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const entries = await readAllEntries(baseDir);
  const sections = buildSections(entries, opts.toolTypes);
  const decisionMatrix = opts.includeDecisionMatrix ? buildDecisionMatrix(opts.toolTypes) : [];
  const quickReference = opts.includeQuickReference ? QUICK_REFERENCE_SCENARIOS : [];
  const toc = buildToc(sections, opts.includeDecisionMatrix, opts.includeQuickReference);

  return { toc, sections, decisionMatrix, quickReference };
}

// ─── Serialize ─────────────────────────────────────────────

export function serialize(ref: CompiledReference): string {
  const lines: string[] = [];

  lines.push('# Kiro Master Reference');
  lines.push('');

  // TOC
  lines.push('## Table of Contents');
  lines.push('');
  for (const entry of ref.toc) {
    const indent = entry.level === 1 ? '' : '  ';
    lines.push(`${indent}- [${entry.title}](#${entry.anchor})`);
  }
  lines.push('');

  // Sections
  for (const section of ref.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');

    if (section.toolType) {
      lines.push(`<!-- toolType: ${section.toolType} -->`);
      lines.push('');
    }

    if (section.content) {
      lines.push(section.content);
      lines.push('');
    }

    for (const sub of section.subsections) {
      lines.push(`### ${sub.title}`);
      lines.push('');

      if (sub.toolType) {
        lines.push(`<!-- toolType: ${sub.toolType} -->`);
        lines.push('');
      }

      if (sub.content) {
        lines.push(sub.content);
        lines.push('');
      }
    }
  }

  // Decision Matrix
  if (ref.decisionMatrix.length > 0) {
    lines.push('## Decision Matrix');
    lines.push('');
    lines.push('| Tool Type | What | When to Use | When Not to Use | Alternatives | Platform |');
    lines.push('| --- | --- | --- | --- | --- | --- |');

    for (const entry of ref.decisionMatrix) {
      const alts = entry.alternatives.join(', ');
      lines.push(
        `| ${entry.toolType} | ${entry.whatItIs} | ${entry.whenToUse} | ${entry.whenNotToUse} | ${alts} | ${entry.platform} |`,
      );
    }
    lines.push('');
  }

  // Quick Reference
  if (ref.quickReference.length > 0) {
    lines.push('## Quick Reference');
    lines.push('');
    lines.push('| Scenario | Recommended Tools | Rationale |');
    lines.push('| --- | --- | --- |');

    for (const entry of ref.quickReference) {
      const tools = entry.recommendedTools.join(', ');
      lines.push(`| ${entry.scenario} | ${tools} | ${entry.rationale} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Deserialize ───────────────────────────────────────────

export function deserialize(markdown: string): CompiledReference {
  const toc = parseToc(markdown);
  const sections = parseSections(markdown);
  const decisionMatrix = parseDecisionMatrix(markdown);
  const quickReference = parseQuickReference(markdown);

  return { toc, sections, decisionMatrix, quickReference };
}

// ─── Parse TOC ─────────────────────────────────────────────

function parseToc(markdown: string): TocEntry[] {
  const tocMatch = markdown.match(
    /## Table of Contents\n\n([\s\S]*?)(?=\n## (?!Table of Contents))/,
  );
  if (!tocMatch) return [];

  const tocBlock = tocMatch[1];
  const entries: TocEntry[] = [];
  const linkRe = /^(\s*)- \[(.+?)\]\(#(.+?)\)/gm;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(tocBlock)) !== null) {
    entries.push({
      title: match[2],
      anchor: match[3],
      level: match[1].length >= 2 ? 2 : 1,
    });
  }

  return entries;
}

// ─── Parse Sections ────────────────────────────────────────

function parseSections(markdown: string): ReferenceSection[] {
  const sections: ReferenceSection[] = [];
  const skipHeadings = /^## (?!Table of Contents|Decision Matrix|Quick Reference)(.+)$/gm;
  const sectionStarts: Array<{
    title: string;
    index: number;
  }> = [];
  let match: RegExpExecArray | null;

  while ((match = skipHeadings.exec(markdown)) !== null) {
    sectionStarts.push({
      title: match[1].trim(),
      index: match.index,
    });
  }

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i];
    const endIndex =
      i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : findNextH2(markdown, start.index);

    const block = markdown.slice(start.index, endIndex);
    const toolType = extractToolType(block);
    const subsections = parseSubsections(block);
    const content = extractSectionContent(block);

    sections.push({
      title: start.title,
      toolType,
      content,
      subsections,
    });
  }

  return sections;
}

function findNextH2(md: string, after: number): number {
  const match = md.slice(after + 1).match(/^## /m);
  return match?.index !== undefined ? after + 1 + match.index : md.length;
}

function extractToolType(block: string): KiroToolType | null {
  const match = block.match(/<!-- toolType: (.+?) -->/);
  if (!match) return null;
  const val = match[1] as KiroToolType;
  return KIRO_TOOL_TYPES.includes(val as (typeof KIRO_TOOL_TYPES)[number]) ? val : null;
}

function extractSectionContent(block: string): string {
  const lines = block.split('\n');
  const result: string[] = [];
  let past = false;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      past = true;
      continue;
    }
    if (line.startsWith('### ')) break;
    if (past && !line.startsWith('<!-- toolType:')) result.push(line);
  }
  return result.join('\n').trim();
}

function parseSubsections(block: string): ReferenceSection[] {
  const subRe = /^### (.+)$/gm;
  const starts: Array<{ title: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = subRe.exec(block)) !== null) {
    starts.push({ title: match[1].trim(), index: match.index });
  }
  return starts.map((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : block.length;
    const sub = block.slice(start.index, end);
    const toolType = extractToolType(sub);
    const content = sub
      .split('\n')
      .slice(1)
      .filter((l) => !l.startsWith('<!-- toolType:'))
      .join('\n')
      .trim();
    return { title: start.title, toolType, content, subsections: [] };
  });
}

// ─── Parse Decision Matrix ─────────────────────────────────

function parseDecisionMatrix(markdown: string): import('./types').DecisionMatrixEntry[] {
  const m = markdown.match(/## Decision Matrix\n\n([\s\S]*?)(?=\n## |$)/);
  if (!m) return [];
  const rows = m[1]
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .slice(2);
  return rows
    .map((row) => {
      const c = row
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      if (c.length < 6) return null;
      return {
        toolType: c[0] as KiroToolType,
        whatItIs: c[1],
        whenToUse: c[2],
        whenNotToUse: c[3],
        alternatives: c[4]
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        platform: c[5] as PlatformTarget,
      };
    })
    .filter((e): e is import('./types').DecisionMatrixEntry => e !== null);
}

// ─── Parse Quick Reference ─────────────────────────────────

function parseQuickReference(markdown: string): ScenarioMapping[] {
  const m = markdown.match(/## Quick Reference\n\n([\s\S]*?)(?=\n## |$)/);
  if (!m) return [];
  const rows = m[1]
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .slice(2);
  return rows
    .map((row) => {
      const c = row
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);
      if (c.length < 3) return null;
      return {
        scenario: c[0],
        recommendedTools: c[1]
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean) as KiroToolType[],
        rationale: c[2],
      };
    })
    .filter((e): e is ScenarioMapping => e !== null);
}
