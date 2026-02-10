import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parseHtml } from '../../lib/contentParser.js';

/**
 * **Feature: kiro-knowledge-base, Property 4: Content extraction
 * completeness**
 * **Validates: Requirements 2.2**
 *
 * For any valid HTML document containing headings, code blocks,
 * tables, and metadata, `parseHtml()` SHALL extract all of them
 * into the corresponding ParsedContent fields.
 */

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

const arbHeadingLevel = fc.constantFrom(...HEADING_LEVELS);

const arbHeadingText = fc.constantFrom(
  'Introduction',
  'Getting Started',
  'API Reference',
  'Configuration',
  'Usage',
  'Examples',
  'Advanced Topics',
  'Troubleshooting',
);

const arbHeading = fc.record({
  level: arbHeadingLevel,
  text: arbHeadingText,
});

const LANGUAGES = ['typescript', 'javascript', 'python', 'bash', 'json'] as const;

const arbLanguage = fc.constantFrom(...LANGUAGES);

const arbCodeContent = fc.constantFrom(
  'const x = 1',
  'function foo() {}',
  'print("hello")',
  'echo test',
  '{"key": "val"}',
);

const arbCodeBlock = fc.record({
  language: arbLanguage,
  content: arbCodeContent,
});

const arbCellText = fc.constantFrom(
  'Name',
  'Type',
  'Default',
  'Description',
  'Required',
  'string',
  'number',
  'true',
  'false',
  '',
);

const arbTableRow = fc.array(arbCellText, {
  minLength: 2,
  maxLength: 4,
});

const arbTable = fc.array(arbTableRow, { minLength: 2, maxLength: 4 }).map((rows) => {
  const maxCols = Math.max(...rows.map((r) => r.length));
  return rows.map((row) => {
    while (row.length < maxCols) row.push('');
    return row.slice(0, maxCols);
  });
});

const arbMetaName = fc.constantFrom('author', 'keywords', 'robots', 'viewport');

const arbMetaContent = fc.constantFrom(
  'Kiro Team',
  'kiro, ide, tools',
  'index, follow',
  'width=device-width',
);

const arbMetaTag = fc.record({
  name: arbMetaName,
  content: arbMetaContent,
});

const arbBoilerplateText = fc.constantFrom(
  'Home Navigation Link',
  'Footer Copyright Info',
  'Header Banner Text',
  'Sidebar Menu Items',
  'Skip to content',
);

// ─── HTML Builders ──────────────────────────────────────────

function buildHeadingHtml(h: { level: number; text: string }): string {
  return `<h${h.level}>${h.text}</h${h.level}>`;
}

function buildCodeBlockHtml(b: { language: string; content: string }): string {
  return `<pre><code class="language-${b.language}">` + `${b.content}</code></pre>`;
}

function buildTableHtml(rows: string[][]): string {
  const header = rows[0].map((c) => `<th>${c}</th>`).join('');
  const body = rows
    .slice(1)
    .map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('');
  return `<table><tr>${header}</tr>${body}</table>`;
}

function buildMetaHtml(m: { name: string; content: string }): string {
  return `<meta name="${m.name}" content="${m.content}">`;
}

interface DocParts {
  headings: Array<{ level: number; text: string }>;
  codeBlocks: Array<{ language: string; content: string }>;
  tables: string[][][];
  metaTags: Array<{ name: string; content: string }>;
  boilerplate?: {
    navText?: string;
    footerText?: string;
    headerText?: string;
    sidebarText?: string;
  };
  links?: Array<{ text: string; href: string }>;
  paragraphs?: string[];
}

function buildHtmlDocument(parts: DocParts): string {
  const metaHtml = parts.metaTags.map(buildMetaHtml).join('\n');
  const bodyParts: string[] = [];

  if (parts.boilerplate?.navText) {
    bodyParts.push(`<nav><a href="/home">${parts.boilerplate.navText}</a></nav>`);
  }
  if (parts.boilerplate?.headerText) {
    bodyParts.push(`<header><p>${parts.boilerplate.headerText}</p></header>`);
  }
  if (parts.boilerplate?.sidebarText) {
    bodyParts.push(`<div class="sidebar"><p>${parts.boilerplate.sidebarText}</p></div>`);
  }

  for (const p of parts.paragraphs ?? []) {
    bodyParts.push(`<p>${p}</p>`);
  }
  for (const h of parts.headings) {
    bodyParts.push(buildHeadingHtml(h));
  }
  for (const cb of parts.codeBlocks) {
    bodyParts.push(buildCodeBlockHtml(cb));
  }
  for (const tbl of parts.tables) {
    bodyParts.push(buildTableHtml(tbl));
  }
  for (const link of parts.links ?? []) {
    bodyParts.push(`<p><a href="${link.href}">${link.text}</a></p>`);
  }

  if (parts.boilerplate?.footerText) {
    bodyParts.push(`<footer><p>${parts.boilerplate.footerText}</p></footer>`);
  }

  return [
    '<!DOCTYPE html>',
    '<html><head>',
    metaHtml,
    '</head><body>',
    bodyParts.join('\n'),
    '</body></html>',
  ].join('\n');
}

// ─── Property 4: Content extraction completeness ────────────

describe('Property 4: Content extraction completeness', () => {
  it('extracts all headings from the content area', () => {
    fc.assert(
      fc.property(fc.array(arbHeading, { minLength: 1, maxLength: 6 }), (headings) => {
        const html = buildHtmlDocument({
          headings,
          codeBlocks: [],
          tables: [],
          metaTags: [],
        });
        const result = parseHtml(html);

        expect(result.headings).toHaveLength(headings.length);
        for (let i = 0; i < headings.length; i++) {
          expect(result.headings[i].level).toBe(headings[i].level);
          expect(result.headings[i].text).toBe(headings[i].text);
        }
      }),
      { numRuns: 10 },
    );
  });

  it('extracts all code blocks from the content area', () => {
    fc.assert(
      fc.property(fc.array(arbCodeBlock, { minLength: 1, maxLength: 5 }), (codeBlocks) => {
        const html = buildHtmlDocument({
          headings: [],
          codeBlocks,
          tables: [],
          metaTags: [],
        });
        const result = parseHtml(html);

        expect(result.codeBlocks).toHaveLength(codeBlocks.length);
        for (let i = 0; i < codeBlocks.length; i++) {
          expect(result.codeBlocks[i].language).toBe(codeBlocks[i].language);
          expect(result.codeBlocks[i].content).toBe(codeBlocks[i].content);
        }
      }),
      { numRuns: 10 },
    );
  });

  it('extracts all tables from the content area', () => {
    fc.assert(
      fc.property(fc.array(arbTable, { minLength: 1, maxLength: 3 }), (tables) => {
        const html = buildHtmlDocument({
          headings: [],
          codeBlocks: [],
          tables,
          metaTags: [],
        });
        const result = parseHtml(html);

        expect(result.tables).toHaveLength(tables.length);
      }),
      { numRuns: 10 },
    );
  });

  it('extracts metadata from meta tags', () => {
    fc.assert(
      fc.property(
        fc.array(arbMetaTag, { minLength: 1, maxLength: 4 }).filter((tags) => {
          const names = tags.map((t) => t.name);
          return new Set(names).size === names.length;
        }),
        (metaTags) => {
          const html = buildHtmlDocument({
            headings: [],
            codeBlocks: [],
            tables: [],
            metaTags,
          });
          const result = parseHtml(html);

          for (const tag of metaTags) {
            expect(result.metadata[tag.name]).toBe(tag.content);
          }
        },
      ),
      { numRuns: 10 },
    );
  });

  it('extracts all element types from a combined document', () => {
    fc.assert(
      fc.property(
        fc.array(arbHeading, { minLength: 1, maxLength: 4 }),
        fc.array(arbCodeBlock, { minLength: 1, maxLength: 3 }),
        fc.array(arbTable, { minLength: 1, maxLength: 2 }),
        fc.array(arbMetaTag, { minLength: 1, maxLength: 3 }).filter((tags) => {
          const names = tags.map((t) => t.name);
          return new Set(names).size === names.length;
        }),
        (headings, codeBlocks, tables, metaTags) => {
          const html = buildHtmlDocument({
            headings,
            codeBlocks,
            tables,
            metaTags,
          });
          const result = parseHtml(html);

          expect(result.headings).toHaveLength(headings.length);
          expect(result.codeBlocks).toHaveLength(codeBlocks.length);
          expect(result.tables).toHaveLength(tables.length);
          for (const tag of metaTags) {
            expect(result.metadata[tag.name]).toBe(tag.content);
          }
        },
      ),
      { numRuns: 10 },
    );
  });

  it('strips boilerplate while preserving content', () => {
    fc.assert(
      fc.property(
        fc.array(arbHeading, { minLength: 1, maxLength: 3 }),
        arbBoilerplateText,
        arbBoilerplateText,
        arbBoilerplateText,
        arbBoilerplateText,
        (headings, nav, footer, header, sidebar) => {
          const html = buildHtmlDocument({
            headings,
            codeBlocks: [],
            tables: [],
            metaTags: [],
            boilerplate: {
              navText: nav,
              footerText: footer,
              headerText: header,
              sidebarText: sidebar,
            },
          });
          const result = parseHtml(html);

          expect(result.markdown).not.toContain(nav);
          expect(result.markdown).not.toContain(footer);
          expect(result.markdown).not.toContain(header);
          expect(result.markdown).not.toContain(sidebar);
          expect(result.headings).toHaveLength(headings.length);
        },
      ),
      { numRuns: 10 },
    );
  });
});

// ─── Property 5: Structure preservation during parsing ──────

/**
 * **Feature: kiro-knowledge-base, Property 5: Structure
 * preservation during parsing**
 * **Validates: Requirements 2.3**
 *
 * For any valid HTML with heading hierarchy, code block language
 * annotations, table structure, and link references, the parsed
 * markdown output SHALL preserve heading levels (# vs ## vs ###),
 * code fence language tags, table pipe formatting, and link
 * [text](url) syntax.
 */

const arbLinkText = fc.constantFrom('docs', 'API guide', 'home', 'reference');

const arbLinkHref = fc.constantFrom(
  'https://kiro.dev/docs',
  'https://example.com/api',
  '/getting-started',
  '#section',
);

const arbLink = fc.record({
  text: arbLinkText,
  href: arbLinkHref,
});

describe('Property 5: Structure preservation during parsing', () => {
  it('preserves heading levels in markdown output', () => {
    fc.assert(
      fc.property(fc.array(arbHeading, { minLength: 1, maxLength: 6 }), (headings) => {
        const html = buildHtmlDocument({
          headings,
          codeBlocks: [],
          tables: [],
          metaTags: [],
        });
        const result = parseHtml(html);

        for (const h of headings) {
          const prefix = '#'.repeat(h.level);
          expect(result.markdown).toContain(`${prefix} ${h.text}`);
        }
      }),
      { numRuns: 10 },
    );
  });

  it('preserves code block language annotations', () => {
    fc.assert(
      fc.property(fc.array(arbCodeBlock, { minLength: 1, maxLength: 4 }), (codeBlocks) => {
        const html = buildHtmlDocument({
          headings: [],
          codeBlocks,
          tables: [],
          metaTags: [],
        });
        const result = parseHtml(html);

        for (const cb of codeBlocks) {
          expect(result.markdown).toContain(`\`\`\`${cb.language}`);
          expect(result.markdown).toContain(cb.content);
        }
      }),
      { numRuns: 10 },
    );
  });

  it('preserves table pipe formatting', () => {
    fc.assert(
      fc.property(fc.array(arbTable, { minLength: 1, maxLength: 2 }), (tables) => {
        const html = buildHtmlDocument({
          headings: [],
          codeBlocks: [],
          tables,
          metaTags: [],
        });
        const result = parseHtml(html);

        for (const tbl of tables) {
          // Header cells appear in pipe-delimited row
          for (const cell of tbl[0]) {
            if (cell) {
              expect(result.markdown).toContain(cell);
            }
          }
          // Separator row exists
          expect(result.markdown).toContain('| ---');
        }
      }),
      { numRuns: 10 },
    );
  });

  it('preserves link [text](url) syntax', () => {
    fc.assert(
      fc.property(fc.array(arbLink, { minLength: 1, maxLength: 4 }), (links) => {
        const html = buildHtmlDocument({
          headings: [],
          codeBlocks: [],
          tables: [],
          metaTags: [],
          links,
        });
        const result = parseHtml(html);

        for (const link of links) {
          expect(result.markdown).toContain(`[${link.text}](${link.href})`);
        }
      }),
      { numRuns: 10 },
    );
  });

  it('preserves YAML frontmatter in markdown output', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('My Title', 'Guide', 'Reference'),
        fc.constantFrom('A description', 'Overview text'),
        (title, description) => {
          const frontmatter = `---\ntitle: ${title}\n` + `description: ${description}\n---\n`;
          const html = `${frontmatter}<html><body><h1>Content</h1></body></html>`;
          const result = parseHtml(html);

          expect(result.frontmatter).not.toBeNull();
          expect(result.frontmatter?.title).toBe(title);
          expect(result.frontmatter?.description).toBe(description);
          expect(result.markdown).toMatch(/^---\n/);
        },
      ),
      { numRuns: 10 },
    );
  });

  it('preserves inline code formatting', () => {
    const html = buildHtmlDocument({
      headings: [],
      codeBlocks: [],
      tables: [],
      metaTags: [],
      paragraphs: ['Use <code>npm install</code> to install', 'Run <code>vitest</code> for tests'],
    });
    const result = parseHtml(html);

    expect(result.markdown).toContain('`npm install`');
    expect(result.markdown).toContain('`vitest`');
  });
});
