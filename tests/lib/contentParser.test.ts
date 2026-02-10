import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import {
  extractCodeBlocks,
  extractDescription,
  extractFrontmatter,
  extractHeadings,
  extractLinks,
  extractMetadata,
  extractTables,
  extractTitle,
  parseHtml,
  stripBoilerplate,
  toMarkdown,
} from '../../lib/contentParser.js';

// ─── extractFrontmatter ────────────────────────────────────

describe('extractFrontmatter', () => {
  it('parses valid YAML frontmatter', () => {
    const html = `---
title: Hello
tags:
  - a
  - b
---
<html><body><p>Content</p></body></html>`;
    const result = extractFrontmatter(html);
    expect(result).toEqual({ title: 'Hello', tags: ['a', 'b'] });
  });

  it('returns null when no frontmatter', () => {
    expect(extractFrontmatter('<html></html>')).toBeNull();
  });

  it('returns null for invalid YAML', () => {
    const html = `---
: invalid: yaml: [
---
<p>hi</p>`;
    expect(extractFrontmatter(html)).toBeNull();
  });

  it('returns null for scalar YAML', () => {
    const html = `---
just a string
---`;
    expect(extractFrontmatter(html)).toBeNull();
  });
});

// ─── extractTitle ──────────────────────────────────────────

describe('extractTitle', () => {
  it('prefers og:title', () => {
    const doc = cheerio.load(
      '<meta property="og:title" content="OG Title">' + '<title>Title Tag</title><h1>H1 Title</h1>',
    );
    expect(extractTitle(doc)).toBe('OG Title');
  });

  it('falls back to h1', () => {
    const doc = cheerio.load('<title>Title Tag</title><h1>H1 Title</h1>');
    expect(extractTitle(doc)).toBe('H1 Title');
  });

  it('falls back to title tag', () => {
    const doc = cheerio.load('<title>Title Tag</title>');
    expect(extractTitle(doc)).toBe('Title Tag');
  });

  it('returns empty string when nothing found', () => {
    const doc = cheerio.load('<p>No title</p>');
    expect(extractTitle(doc)).toBe('');
  });
});

// ─── extractDescription ────────────────────────────────────

describe('extractDescription', () => {
  it('prefers og:description', () => {
    const doc = cheerio.load(
      '<meta property="og:description" content="OG Desc">' +
        '<meta name="description" content="Meta Desc">',
    );
    expect(extractDescription(doc)).toBe('OG Desc');
  });

  it('falls back to meta description', () => {
    const doc = cheerio.load('<meta name="description" content="Meta Desc">');
    expect(extractDescription(doc)).toBe('Meta Desc');
  });

  it('returns empty string when nothing found', () => {
    const doc = cheerio.load('<p>No desc</p>');
    expect(extractDescription(doc)).toBe('');
  });
});

// ─── extractHeadings ───────────────────────────────────────

describe('extractHeadings', () => {
  it('extracts all heading levels', () => {
    const doc = cheerio.load(
      '<h1>One</h1><h2>Two</h2><h3>Three</h3>' + '<h4>Four</h4><h5>Five</h5><h6>Six</h6>',
    );
    const headings = extractHeadings(doc);
    expect(headings).toEqual([
      { level: 1, text: 'One' },
      { level: 2, text: 'Two' },
      { level: 3, text: 'Three' },
      { level: 4, text: 'Four' },
      { level: 5, text: 'Five' },
      { level: 6, text: 'Six' },
    ]);
  });

  it('skips empty headings', () => {
    const doc = cheerio.load('<h1></h1><h2>Valid</h2>');
    expect(extractHeadings(doc)).toEqual([{ level: 2, text: 'Valid' }]);
  });
});

// ─── extractCodeBlocks ─────────────────────────────────────

describe('extractCodeBlocks', () => {
  it('extracts code with language class', () => {
    const doc = cheerio.load(
      '<pre><code class="language-typescript">' + 'const x = 1;</code></pre>',
    );
    const blocks = extractCodeBlocks(doc);
    expect(blocks).toEqual([{ language: 'typescript', content: 'const x = 1;' }]);
  });

  it('extracts code with lang- prefix', () => {
    const doc = cheerio.load('<pre><code class="lang-python">print("hi")</code></pre>');
    expect(extractCodeBlocks(doc)[0].language).toBe('python');
  });

  it('handles pre without code child', () => {
    const doc = cheerio.load('<pre>plain text</pre>');
    const blocks = extractCodeBlocks(doc);
    expect(blocks).toEqual([{ language: '', content: 'plain text' }]);
  });

  it('detects mermaid language', () => {
    const doc = cheerio.load(
      '<pre><code class="language-mermaid">' + 'graph TD\n  A-->B</code></pre>',
    );
    expect(extractCodeBlocks(doc)[0].language).toBe('mermaid');
  });

  it('uses data-language attribute', () => {
    const doc = cheerio.load('<pre><code data-language="rust">fn main() {}</code></pre>');
    expect(extractCodeBlocks(doc)[0].language).toBe('rust');
  });
});

// ─── extractTables ─────────────────────────────────────────

describe('extractTables', () => {
  it('converts HTML table to markdown', () => {
    const doc = cheerio.load(
      '<table>' +
        '<tr><th>Name</th><th>Age</th></tr>' +
        '<tr><td>Alice</td><td>30</td></tr>' +
        '</table>',
    );
    const tables = extractTables(doc);
    expect(tables).toHaveLength(1);
    expect(tables[0]).toContain('| Name | Age |');
    expect(tables[0]).toContain('| --- | --- |');
    expect(tables[0]).toContain('| Alice | 30 |');
  });

  it('handles uneven rows', () => {
    const doc = cheerio.load(
      '<table>' + '<tr><th>A</th><th>B</th><th>C</th></tr>' + '<tr><td>1</td></tr>' + '</table>',
    );
    const tables = extractTables(doc);
    expect(tables[0]).toContain('| 1 |  |  |');
  });

  it('returns empty for empty table', () => {
    const doc = cheerio.load('<table></table>');
    expect(extractTables(doc)).toEqual([]);
  });
});

// ─── extractLinks ──────────────────────────────────────────

describe('extractLinks', () => {
  it('extracts all href values', () => {
    const doc = cheerio.load(
      '<a href="https://example.com">Link 1</a>' + '<a href="/docs/page">Link 2</a>',
    );
    expect(extractLinks(doc)).toEqual(['https://example.com', '/docs/page']);
  });

  it('skips anchors without href', () => {
    const doc = cheerio.load('<a name="anchor">No href</a>');
    expect(extractLinks(doc)).toEqual([]);
  });
});

// ─── extractMetadata ───────────────────────────────────────

describe('extractMetadata', () => {
  it('extracts name-based meta tags', () => {
    const doc = cheerio.load(
      '<meta name="author" content="Alice">' + '<meta name="keywords" content="a,b,c">',
    );
    const meta = extractMetadata(doc);
    expect(meta.author).toBe('Alice');
    expect(meta.keywords).toBe('a,b,c');
  });

  it('extracts property-based meta tags', () => {
    const doc = cheerio.load('<meta property="og:title" content="Title">');
    expect(extractMetadata(doc)['og:title']).toBe('Title');
  });

  it('skips meta without content', () => {
    const doc = cheerio.load('<meta name="viewport">');
    expect(extractMetadata(doc)).toEqual({});
  });
});

// ─── stripBoilerplate ──────────────────────────────────────

describe('stripBoilerplate', () => {
  it('removes nav, footer, header, sidebar', () => {
    const doc = cheerio.load(
      '<nav>Nav</nav><header>Header</header>' +
        '<main><p>Content</p></main>' +
        '<footer>Footer</footer>' +
        '<div class="sidebar">Side</div>',
    );
    stripBoilerplate(doc);
    expect(doc('nav').length).toBe(0);
    expect(doc('footer').length).toBe(0);
    expect(doc('header').length).toBe(0);
    expect(doc('.sidebar').length).toBe(0);
    expect(doc('p').text()).toBe('Content');
  });

  it('removes script and style tags', () => {
    const doc = cheerio.load('<script>alert("x")</script>' + '<style>.x{}</style>' + '<p>Keep</p>');
    stripBoilerplate(doc);
    expect(doc('script').length).toBe(0);
    expect(doc('style').length).toBe(0);
    expect(doc('p').text()).toBe('Keep');
  });

  it('removes cookie banners', () => {
    const doc = cheerio.load(
      '<div class="cookie-banner">Cookies</div>' +
        '<div id="cookie-banner">More cookies</div>' +
        '<p>Content</p>',
    );
    stripBoilerplate(doc);
    expect(doc('.cookie-banner').length).toBe(0);
    expect(doc('#cookie-banner').length).toBe(0);
  });
});

// ─── toMarkdown ────────────────────────────────────────────

describe('toMarkdown', () => {
  it('converts headings to # syntax', () => {
    const doc = cheerio.load('<h1>Title</h1><h2>Sub</h2>');
    const md = toMarkdown(doc);
    expect(md).toContain('# Title');
    expect(md).toContain('## Sub');
  });

  it('converts paragraphs', () => {
    const doc = cheerio.load('<p>Hello world</p>');
    expect(toMarkdown(doc)).toContain('Hello world');
  });

  it('converts links to markdown syntax', () => {
    const doc = cheerio.load('<p><a href="https://example.com">Click</a></p>');
    expect(toMarkdown(doc)).toContain('[Click](https://example.com)');
  });

  it('converts inline code to backticks', () => {
    const doc = cheerio.load('<p>Use <code>npm install</code> to install</p>');
    expect(toMarkdown(doc)).toContain('`npm install`');
  });

  it('converts pre/code to fenced code blocks', () => {
    const doc = cheerio.load('<pre><code class="language-js">const x = 1;</code></pre>');
    const md = toMarkdown(doc);
    expect(md).toContain('```js');
    expect(md).toContain('const x = 1;');
    expect(md).toContain('```');
  });

  it('preserves mermaid code blocks', () => {
    const doc = cheerio.load(
      '<pre><code class="language-mermaid">' + 'graph TD\n  A-->B</code></pre>',
    );
    const md = toMarkdown(doc);
    expect(md).toContain('```mermaid');
    expect(md).toContain('graph TD');
  });

  it('converts unordered lists', () => {
    const doc = cheerio.load('<ul><li>Item 1</li><li>Item 2</li></ul>');
    const md = toMarkdown(doc);
    expect(md).toContain('- Item 1');
    expect(md).toContain('- Item 2');
  });

  it('converts ordered lists', () => {
    const doc = cheerio.load('<ol><li>First</li><li>Second</li></ol>');
    const md = toMarkdown(doc);
    expect(md).toContain('1. First');
    expect(md).toContain('2. Second');
  });

  it('converts tables to markdown', () => {
    const doc = cheerio.load(
      '<table>' +
        '<tr><th>Col A</th><th>Col B</th></tr>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '</table>',
    );
    const md = toMarkdown(doc);
    expect(md).toContain('| Col A | Col B |');
    expect(md).toContain('| --- | --- |');
    expect(md).toContain('| 1 | 2 |');
  });

  it('converts blockquotes', () => {
    const doc = cheerio.load('<blockquote>Important note</blockquote>');
    expect(toMarkdown(doc)).toContain('> Important note');
  });

  it('converts horizontal rules', () => {
    const doc = cheerio.load('<p>Above</p><hr><p>Below</p>');
    expect(toMarkdown(doc)).toContain('---');
  });

  it('handles bold and italic', () => {
    const doc = cheerio.load('<p><strong>Bold</strong> and <em>italic</em></p>');
    const md = toMarkdown(doc);
    expect(md).toContain('**Bold**');
    expect(md).toContain('*italic*');
  });
});

// ─── parseHtml (integration) ───────────────────────────────

describe('parseHtml', () => {
  it('extracts all fields from a full HTML page', () => {
    const html = `
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="A test page">
  <meta name="author" content="Tester">
</head>
<body>
  <nav><a href="/home">Home</a></nav>
  <h1>Main Title</h1>
  <p>Intro paragraph with <code>inline code</code>.</p>
  <h2>Section</h2>
  <pre><code class="language-typescript">const x = 1;</code></pre>
  <table>
    <tr><th>Key</th><th>Value</th></tr>
    <tr><td>a</td><td>1</td></tr>
  </table>
  <a href="https://example.com">Example</a>
  <footer>Footer content</footer>
</body>
</html>`;

    const result = parseHtml(html);

    expect(result.title).toBe('Main Title');
    expect(result.description).toBe('A test page');
    expect(result.headings).toContainEqual({ level: 1, text: 'Main Title' });
    expect(result.headings).toContainEqual({ level: 2, text: 'Section' });
    expect(result.codeBlocks).toContainEqual({ language: 'typescript', content: 'const x = 1;' });
    expect(result.tables).toHaveLength(1);
    expect(result.links).toContain('https://example.com');
    expect(result.metadata.description).toBe('A test page');
    expect(result.metadata.author).toBe('Tester');
    expect(result.frontmatter).toBeNull();

    // Markdown should not contain nav/footer
    expect(result.markdown).not.toContain('Home');
    expect(result.markdown).not.toContain('Footer content');
    // Should contain content
    expect(result.markdown).toContain('# Main Title');
    expect(result.markdown).toContain('`inline code`');
    expect(result.markdown).toContain('```typescript');
  });

  it('preserves YAML frontmatter in output', () => {
    const html = `---
title: My Doc
category: guide
---
<html><body>
<h1>My Doc</h1>
<p>Content here</p>
</body></html>`;

    const result = parseHtml(html);
    expect(result.frontmatter).toEqual({
      title: 'My Doc',
      category: 'guide',
    });
    expect(result.markdown).toMatch(/^---\n/);
    expect(result.markdown).toContain('title: My Doc');
    expect(result.markdown).toContain('# My Doc');
  });

  it('handles empty HTML', () => {
    const result = parseHtml('');
    expect(result.title).toBe('');
    expect(result.description).toBe('');
    expect(result.headings).toEqual([]);
    expect(result.codeBlocks).toEqual([]);
    expect(result.tables).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.frontmatter).toBeNull();
  });

  it('extracts links from nav before stripping', () => {
    const html = `
<html><body>
  <nav><a href="/nav-link">Nav</a></nav>
  <p><a href="/content-link">Content</a></p>
</body></html>`;

    const result = parseHtml(html);
    // Links are extracted before boilerplate stripping
    expect(result.links).toContain('/nav-link');
    expect(result.links).toContain('/content-link');
    // But markdown should not contain nav content
    expect(result.markdown).not.toContain('[Nav]');
  });

  it('handles nested lists', () => {
    const html = `
<html><body>
<ul>
  <li>Top
    <ul>
      <li>Nested</li>
    </ul>
  </li>
</ul>
</body></html>`;

    const result = parseHtml(html);
    expect(result.markdown).toContain('- Top');
    expect(result.markdown).toContain('  - Nested');
  });
});
