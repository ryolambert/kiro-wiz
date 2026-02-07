import { load as cheerioLoad } from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { Element as DomElement, Text as DomText } from 'domhandler';
import yaml from 'js-yaml';
import type { ParsedContent } from './types';

// ─── Frontmatter Extraction ────────────────────────────────

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

export function extractFrontmatter(
  html: string,
): Record<string, unknown> | null {
  const match = FRONTMATTER_RE.exec(html.trimStart());
  if (!match) return null;
  try {
    const parsed = yaml.load(match[1]);
    if (parsed !== null && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Boilerplate Stripping ─────────────────────────────────

const BOILERPLATE_SELECTORS = [
  'nav',
  'footer',
  'header',
  '.nav',
  '.navbar',
  '.footer',
  '.header',
  '.sidebar',
  '.cookie-banner',
  '.cookie-consent',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '#cookie-banner',
  '#nav',
  '#footer',
  '#header',
  '#sidebar',
  '.breadcrumb',
  '.breadcrumbs',
  '.skip-link',
  '.skip-nav',
] as const;

export function stripBoilerplate(doc: CheerioAPI): void {
  for (const selector of BOILERPLATE_SELECTORS) {
    doc(selector).remove();
  }
  // Remove script and style tags
  doc('script').remove();
  doc('style').remove();
  doc('noscript').remove();
}

// ─── Title Extraction ──────────────────────────────────────

export function extractTitle(doc: CheerioAPI): string {
  // Try og:title first
  const ogTitle = doc('meta[property="og:title"]').attr('content');
  if (ogTitle?.trim()) return ogTitle.trim();

  // Try <h1>
  const h1 = doc('h1').first().text().trim();
  if (h1) return h1;

  // Fall back to <title>
  const title = doc('title').text().trim();
  return title;
}

// ─── Description Extraction ────────────────────────────────

export function extractDescription(doc: CheerioAPI): string {
  const ogDesc = doc(
    'meta[property="og:description"]',
  ).attr('content');
  if (ogDesc?.trim()) return ogDesc.trim();

  const metaDesc = doc(
    'meta[name="description"]',
  ).attr('content');
  if (metaDesc?.trim()) return metaDesc.trim();

  return '';
}

// ─── Headings Extraction ───────────────────────────────────

export function extractHeadings(
  doc: CheerioAPI,
): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  doc('h1, h2, h3, h4, h5, h6').each((_i, el) => {
    const tagName = (el as DomElement).tagName.toLowerCase();
    const level = parseInt(tagName.charAt(1), 10);
    const text = doc(el).text().trim();
    if (text) {
      headings.push({ level, text });
    }
  });
  return headings;
}

// ─── Code Block Extraction ─────────────────────────────────

function detectLanguage(el: DomElement, doc: CheerioAPI): string {
  const codeEl = doc(el).find('code').first();
  const classAttr = codeEl.attr('class') ?? '';
  // Match language-xxx or lang-xxx patterns
  const langMatch = /(?:language|lang)-(\S+)/.exec(classAttr);
  if (langMatch) return langMatch[1];

  // Check data-language attribute
  const dataLang =
    codeEl.attr('data-language') ??
    doc(el).attr('data-language');
  if (dataLang) return dataLang;

  return '';
}

export function extractCodeBlocks(
  doc: CheerioAPI,
): Array<{ language: string; content: string }> {
  const blocks: Array<{ language: string; content: string }> = [];
  doc('pre').each((_i, el) => {
    const language = detectLanguage(el as DomElement, doc);
    const codeEl = doc(el).find('code');
    const content = codeEl.length > 0
      ? codeEl.text()
      : doc(el).text();
    blocks.push({ language, content });
  });
  return blocks;
}

// ─── Table Extraction ──────────────────────────────────────

export function extractTables(doc: CheerioAPI): string[] {
  const tables: string[] = [];
  doc('table').each((_i, tableEl) => {
    const rows: string[][] = [];
    let maxCols = 0;

    doc(tableEl).find('tr').each((_j, trEl) => {
      const cells: string[] = [];
      doc(trEl).find('th, td').each((_k, cellEl) => {
        cells.push(doc(cellEl).text().trim());
      });
      if (cells.length > maxCols) maxCols = cells.length;
      rows.push(cells);
    });

    if (rows.length === 0 || maxCols === 0) return;

    // Pad rows to maxCols
    for (const row of rows) {
      while (row.length < maxCols) row.push('');
    }

    const lines: string[] = [];
    // Header row
    const header = rows[0];
    lines.push(`| ${header.join(' | ')} |`);
    lines.push(`| ${header.map(() => '---').join(' | ')} |`);
    // Data rows
    for (let r = 1; r < rows.length; r++) {
      lines.push(`| ${rows[r].join(' | ')} |`);
    }
    tables.push(lines.join('\n'));
  });
  return tables;
}

// ─── Link Extraction ───────────────────────────────────────

export function extractLinks(doc: CheerioAPI): string[] {
  const links: string[] = [];
  doc('a[href]').each((_i, el) => {
    const href = doc(el).attr('href');
    if (href) links.push(href);
  });
  return links;
}

// ─── Metadata Extraction ───────────────────────────────────

export function extractMetadata(
  doc: CheerioAPI,
): Record<string, string> {
  const metadata: Record<string, string> = {};
  doc('meta').each((_i, el) => {
    const name =
      doc(el).attr('name') ?? doc(el).attr('property');
    const content = doc(el).attr('content');
    if (name && content) {
      metadata[name] = content;
    }
  });
  return metadata;
}

// ─── Markdown Conversion ───────────────────────────────────

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function convertTableToMarkdown(
  tableEl: DomElement,
  doc: CheerioAPI,
): string {
  const rows: string[][] = [];
  let maxCols = 0;

  doc(tableEl).find('tr').each((_j, trEl) => {
    const cells: string[] = [];
    doc(trEl).find('th, td').each((_k, cellEl) => {
      cells.push(escapeTableCell(doc(cellEl).text().trim()));
    });
    if (cells.length > maxCols) maxCols = cells.length;
    rows.push(cells);
  });

  if (rows.length === 0 || maxCols === 0) return '';

  for (const row of rows) {
    while (row.length < maxCols) row.push('');
  }

  const lines: string[] = [];
  lines.push(`| ${rows[0].join(' | ')} |`);
  lines.push(`| ${rows[0].map(() => '---').join(' | ')} |`);
  for (let r = 1; r < rows.length; r++) {
    lines.push(`| ${rows[r].join(' | ')} |`);
  }
  return lines.join('\n');
}

function convertListToMarkdown(
  listEl: DomElement,
  doc: CheerioAPI,
  indent: number,
): string {
  const isOrdered = (listEl as DomElement).tagName === 'ol';
  const lines: string[] = [];
  let counter = 1;

  doc(listEl).children('li').each((_i, liEl) => {
    // Get direct text content (not nested lists)
    const liClone = doc(liEl).clone();
    liClone.find('ul, ol').remove();
    const text = liClone.text().trim();

    const prefix = isOrdered ? `${counter}. ` : '- ';
    const indentStr = ' '.repeat(indent);
    if (text) {
      lines.push(`${indentStr}${prefix}${text}`);
    }
    counter++;

    // Process nested lists
    doc(liEl).children('ul, ol').each((_j, nestedList) => {
      const nested = convertListToMarkdown(
        nestedList as DomElement,
        doc,
        indent + 2,
      );
      if (nested) lines.push(nested);
    });
  });

  return lines.join('\n');
}

function processInlineContent(
  el: DomElement,
  doc: CheerioAPI,
): string {
  let result = '';
  const children = doc(el).contents();

  children.each((_i, child) => {
    if (child.type === 'text') {
      result += (child as DomText).data;
      return;
    }
    if (child.type !== 'tag') return;

    const tagEl = child as DomElement;
    const tag = tagEl.tagName.toLowerCase();

    switch (tag) {
      case 'code':
        result += `\`${doc(tagEl).text()}\``;
        break;
      case 'strong':
      case 'b':
        result += `**${doc(tagEl).text()}**`;
        break;
      case 'em':
      case 'i':
        result += `*${doc(tagEl).text()}*`;
        break;
      case 'a': {
        const href = doc(tagEl).attr('href') ?? '';
        const linkText = doc(tagEl).text();
        result += `[${linkText}](${href})`;
        break;
      }
      case 'br':
        result += '\n';
        break;
      case 'img': {
        const alt = doc(tagEl).attr('alt') ?? '';
        const src = doc(tagEl).attr('src') ?? '';
        result += `![${alt}](${src})`;
        break;
      }
      default:
        result += doc(tagEl).text();
    }
  });

  return result;
}

export function toMarkdown(doc: CheerioAPI): string {
  const parts: string[] = [];
  const body = doc('body').length > 0 ? doc('body') : doc.root();
  const bodyEl = (body as ReturnType<typeof doc>) ;

  bodyEl.children().each((_i, el) => {
    if (el.type !== 'tag') return;
    const tagEl = el as DomElement;
    const tag = tagEl.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag.charAt(1), 10);
      const text = doc(tagEl).text().trim();
      if (text) {
        parts.push(`${'#'.repeat(level)} ${text}`);
      }
      return;
    }

    // Paragraphs
    if (tag === 'p') {
      const text = processInlineContent(tagEl, doc).trim();
      if (text) parts.push(text);
      return;
    }

    // Pre/code blocks
    if (tag === 'pre') {
      const codeEl = doc(tagEl).find('code');
      let language = '';
      let content: string;

      if (codeEl.length > 0) {
        const classAttr = codeEl.attr('class') ?? '';
        const langMatch = /(?:language|lang)-(\S+)/.exec(classAttr);
        if (langMatch) language = langMatch[1];
        content = codeEl.text();
      } else {
        content = doc(tagEl).text();
      }

      parts.push(`\`\`\`${language}\n${content}\n\`\`\``);
      return;
    }

    // Lists
    if (tag === 'ul' || tag === 'ol') {
      const md = convertListToMarkdown(tagEl, doc, 0);
      if (md) parts.push(md);
      return;
    }

    // Tables
    if (tag === 'table') {
      const md = convertTableToMarkdown(tagEl, doc);
      if (md) parts.push(md);
      return;
    }

    // Blockquotes
    if (tag === 'blockquote') {
      const text = doc(tagEl).text().trim();
      if (text) {
        const quoted = text
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
        parts.push(quoted);
      }
      return;
    }

    // Horizontal rules
    if (tag === 'hr') {
      parts.push('---');
      return;
    }

    // Divs, sections, articles, main — recurse into children
    if (
      ['div', 'section', 'article', 'main', 'aside'].includes(tag)
    ) {
      const innerDoc = cheerioLoad(doc(tagEl).html() ?? '');
      stripBoilerplate(innerDoc);
      const inner = toMarkdown(innerDoc);
      if (inner.trim()) parts.push(inner.trim());
      return;
    }
  });

  return parts.join('\n\n');
}

// ─── Main Parse Function ───────────────────────────────────

export function parseHtml(html: string): ParsedContent {
  const frontmatter = extractFrontmatter(html);

  // Strip frontmatter from HTML before parsing
  const cleanedHtml = html.trimStart().replace(FRONTMATTER_RE, '');

  const doc = cheerioLoad(cleanedHtml);

  // Extract structured data before stripping boilerplate
  const title = extractTitle(doc);
  const description = extractDescription(doc);
  const headings = extractHeadings(doc);
  const codeBlocks = extractCodeBlocks(doc);
  const tables = extractTables(doc);
  const links = extractLinks(doc);
  const metadata = extractMetadata(doc);

  // Strip boilerplate for markdown conversion
  stripBoilerplate(doc);

  const markdown = toMarkdown(doc);

  // Prepend frontmatter to markdown if present
  let finalMarkdown = markdown;
  if (frontmatter) {
    const yamlStr = yaml.dump(frontmatter).trim();
    finalMarkdown = `---\n${yamlStr}\n---\n\n${markdown}`;
  }

  return {
    title,
    description,
    headings,
    markdown: finalMarkdown,
    codeBlocks,
    tables,
    links,
    metadata,
    frontmatter,
  };
}
