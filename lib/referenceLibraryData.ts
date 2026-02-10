import { TOOL_TYPE_DISPLAY } from './compilerData';
import { BEST_PRACTICES_CONTENT } from './refDataBestPractices';
import { EXAMPLES_CONTENT } from './refDataExamples';
import { TEMPLATES_CONTENT } from './refDataTemplates';
import type { KiroToolType } from './types';

// ─── Content Types ─────────────────────────────────────────

interface DocContent {
  title: string;
  body: string;
}

// ─── Helpers ───────────────────────────────────────────────

function displayName(t: KiroToolType): string {
  return TOOL_TYPE_DISPLAY[t];
}

function toolAnchor(t: KiroToolType): string {
  return t;
}

function masterRefLink(t: KiroToolType): string {
  return `[${displayName(t)} in Master Reference]` + `(../master-reference.md#${toolAnchor(t)})`;
}

function siblingLink(t: KiroToolType, docType: string): string {
  return `[${displayName(t)} ${docType}](./${docType}.md)`;
}

// ─── Content Generator Functions ───────────────────────────

export function generateBestPracticesContent(toolType: KiroToolType): DocContent {
  return {
    title: `${displayName(toolType)} Best Practices`,
    body: BEST_PRACTICES_CONTENT[toolType].trim(),
  };
}

export function generateExamplesContent(toolType: KiroToolType): DocContent {
  return {
    title: `${displayName(toolType)} Examples`,
    body: EXAMPLES_CONTENT[toolType].trim(),
  };
}

export function generateTemplatesContent(toolType: KiroToolType): DocContent {
  return {
    title: `${displayName(toolType)} Templates`,
    body: TEMPLATES_CONTENT[toolType].trim(),
  };
}

// ─── Cross-Reference Builders ──────────────────────────────

export function buildCrossRefs(toolType: KiroToolType, docType: string): string[] {
  const refs: string[] = [];

  refs.push(masterRefLink(toolType));

  const siblings = ['best-practices', 'examples', 'templates'];
  for (const sib of siblings) {
    if (sib !== docType) {
      refs.push(siblingLink(toolType, sib));
    }
  }

  return refs;
}

export function buildCrossRefSection(toolType: KiroToolType, docType: string): string {
  const refs = buildCrossRefs(toolType, docType);
  const lines = ['## Related Resources', ''];
  for (const ref of refs) {
    lines.push(`- ${ref}`);
  }
  return lines.join('\n');
}
