import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  DocType,
  KiroToolType,
  ReferenceDocument,
} from './types';
import { KIRO_TOOL_TYPES } from './types';
import { TOOL_TYPE_DISPLAY } from './compilerData';
import {
  buildCrossRefSection,
  buildCrossRefs,
  generateBestPracticesContent,
  generateExamplesContent,
  generateTemplatesContent,
} from './referenceLibraryData';

// ─── Doc Type Constants ────────────────────────────────────

const DOC_TYPES: readonly DocType[] = [
  'best-practices',
  'examples',
  'templates',
] as const;

// ─── Content Generators Map ────────────────────────────────

const CONTENT_GENERATORS: Record<
  DocType,
  (t: KiroToolType) => { title: string; body: string }
> = {
  'best-practices': generateBestPracticesContent,
  examples: generateExamplesContent,
  templates: generateTemplatesContent,
};

// ─── Generate Single Document ──────────────────────────────

export function generate(
  toolType: KiroToolType,
  docType: DocType
): ReferenceDocument {
  const gen = CONTENT_GENERATORS[docType];
  const { title, body } = gen(toolType);
  const crossRefSection = buildCrossRefSection(
    toolType,
    docType
  );
  const crossRefs = buildCrossRefs(toolType, docType);

  const content = [
    `# ${title}`,
    '',
    `> ${TOOL_TYPE_DISPLAY[toolType]} — ${docType}`,
    '',
    body,
    '',
    crossRefSection,
    '',
  ].join('\n');

  return {
    toolType,
    docType,
    title,
    content,
    crossRefs,
  };
}

// ─── Generate All Documents ────────────────────────────────

export function generateAll(): ReferenceDocument[] {
  const docs: ReferenceDocument[] = [];

  for (const toolType of KIRO_TOOL_TYPES) {
    for (const docType of DOC_TYPES) {
      docs.push(generate(toolType, docType));
    }
  }

  return docs;
}

// ─── Filter by Tool Type ───────────────────────────────────

export function getForToolType(
  toolType: KiroToolType,
  docType?: DocType
): ReferenceDocument[] {
  const all = generateAll();

  return all.filter(
    (doc) =>
      doc.toolType === toolType &&
      (docType === undefined || doc.docType === docType)
  );
}

// ─── Write All to Disk ────────────────────────────────────

export async function writeAll(
  baseDir: string
): Promise<string[]> {
  const docs = generateAll();
  const writtenPaths: string[] = [];

  for (const doc of docs) {
    const dir = join(baseDir, doc.toolType);
    await mkdir(dir, { recursive: true });

    const filePath = join(dir, `${doc.docType}.md`);
    await writeFile(filePath, doc.content, 'utf-8');
    writtenPaths.push(filePath);
  }

  return writtenPaths;
}
