import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { URL_CATEGORIES } from '../../lib/types.js';
import type { KnowledgeBaseEntry, UrlCategory } from '../../lib/types.js';
import { write, urlToCategory } from '../../lib/knowledgeBase.js';

/**
 * **Feature: kiro-knowledge-base, Property 8: Correct directory placement**
 * **Validates: Requirements 3.1, 3.2**
 *
 * For any valid KnowledgeBaseEntry with a known category, the
 * `write()` function SHALL place the file in a directory named
 * after that category. For any URL belonging to a known
 * documentation section, `urlToCategory()` SHALL return the
 * matching category.
 */

const KNOWN_CATEGORIES = URL_CATEGORIES.filter(
  (c) => c !== 'unknown'
) as UrlCategory[];

const KIRO_DOC_SECTIONS: Record<string, UrlCategory> = {
  'getting-started': 'getting-started',
  editor: 'editor',
  specs: 'specs',
  chat: 'chat',
  hooks: 'hooks',
  steering: 'steering',
  skills: 'skills',
  powers: 'powers',
  mcp: 'mcp',
  guides: 'guides',
  cli: 'cli',
  'autonomous-agent': 'autonomous-agent',
  'privacy-and-security': 'privacy-and-security',
  enterprise: 'enterprise',
  'context-providers': 'context-providers',
};

const arbKnownCategory: fc.Arbitrary<UrlCategory> = fc.constantFrom(
  ...KNOWN_CATEGORIES
);

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-'.split('');

const arbSlug = fc
  .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 30 })
  .map((chars) => chars.join(''))
  .filter((s) => !s.startsWith('-') && !s.endsWith('-') && !s.includes('--'));

const arbEntry = (
  category: fc.Arbitrary<UrlCategory>
): fc.Arbitrary<KnowledgeBaseEntry> =>
  fc.record({
    slug: arbSlug,
    category,
    title: fc.string({ minLength: 1, maxLength: 80 }),
    content: fc.string({ minLength: 0, maxLength: 200 }),
    sourceUrl: fc.webUrl(),
    lastUpdated: fc
      .date({ min: new Date('2000-01-01'), max: new Date('2030-01-01') })
      .map((d) => d.toISOString()),
  });

describe('Property 8: Correct directory placement', () => {
  const baseDirs: string[] = [];

  const freshBaseDir = (): string => {
    const dir = join(
      tmpdir(),
      `kb-prop8-${Date.now()}-${Math.random().toString(36).slice(2)}`
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

  it('write() places files in a directory named after the entry category', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbEntry(arbKnownCategory),
        async (entry) => {
          const baseDir = freshBaseDir();
          const filePath = await write(entry, baseDir);

          const expectedDir = join(baseDir, entry.category);
          expect(filePath.startsWith(expectedDir)).toBe(true);

          const raw = await readFile(filePath, 'utf-8');
          expect(raw).toContain(`category: "${entry.category}"`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('urlToCategory() returns the matching category for kiro.dev doc URLs', () => {
    const arbDocSection = fc.constantFrom(
      ...Object.keys(KIRO_DOC_SECTIONS)
    );
    const arbSubPath = fc
      .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(''))
      .filter((s) => !s.startsWith('-') && !s.endsWith('-'));

    fc.assert(
      fc.property(arbDocSection, arbSubPath, (section, subPath) => {
        const url = `https://kiro.dev/docs/${section}/${subPath}`;
        const result = urlToCategory(url);
        expect(result).toBe(KIRO_DOC_SECTIONS[section]);
      }),
      { numRuns: 100 }
    );
  });

  it('urlToCategory() returns agent-skills-spec for agentskills.io URLs', () => {
    const arbPath = fc.constantFrom(
      'home',
      'what-are-skills',
      'specification',
      'integrate-skills'
    );

    fc.assert(
      fc.property(arbPath, (path) => {
        const url = `https://agentskills.io/${path}`;
        expect(urlToCategory(url)).toBe('agent-skills-spec');
      }),
      { numRuns: 100 }
    );
  });

  it('urlToCategory() returns blog for kiro.dev/blog/* URLs', () => {
    const arbSlugPath = fc
      .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(''))
      .filter((s) => !s.startsWith('-') && !s.endsWith('-'));

    fc.assert(
      fc.property(arbSlugPath, (slug) => {
        const url = `https://kiro.dev/blog/${slug}`;
        expect(urlToCategory(url)).toBe('blog');
      }),
      { numRuns: 100 }
    );
  });

  it('urlToCategory() returns changelog for kiro.dev/changelog/* URLs', () => {
    const arbSlugPath = fc
      .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(''))
      .filter((s) => !s.startsWith('-') && !s.endsWith('-'));

    fc.assert(
      fc.property(arbSlugPath, (slug) => {
        const url = `https://kiro.dev/changelog/${slug}`;
        expect(urlToCategory(url)).toBe('changelog');
      }),
      { numRuns: 100 }
    );
  });

  it('write() places unknown category entries in uncategorized/', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbEntry(fc.constant('unknown' as UrlCategory)),
        async (entry) => {
          const baseDir = freshBaseDir();
          const filePath = await write(entry, baseDir);

          const expectedDir = join(baseDir, 'uncategorized');
          expect(filePath.startsWith(expectedDir)).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * **Feature: kiro-knowledge-base, Property 9: Kebab-case filename transformation**
 * **Validates: Requirements 3.3**
 *
 * For any valid URL, `urlToSlug()` SHALL produce a string that:
 * 1. Contains only lowercase alphanumeric characters and hyphens
 * 2. Does not start or end with a hyphen
 * 3. Does not contain consecutive hyphens
 * 4. Is non-empty for valid URLs
 */

import { urlToSlug } from '../../lib/knowledgeBase.js';

describe('Property 9: Kebab-case filename transformation', () => {
  it('urlToSlug() produces valid kebab-case for any web URL', () => {
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const slug = urlToSlug(url);

        // 4. Non-empty for valid URLs
        expect(slug.length).toBeGreaterThan(0);

        // 1. Only lowercase alphanumeric and hyphens
        expect(slug).toMatch(/^[a-z0-9-]+$/);

        // 2. Does not start or end with a hyphen
        expect(slug.startsWith('-')).toBe(false);
        expect(slug.endsWith('-')).toBe(false);

        // 3. No consecutive hyphens
        expect(slug).not.toMatch(/--/);
      }),
      { numRuns: 100 }
    );
  });
});

import { list, updateIndex } from '../../lib/knowledgeBase.js';

/**
 * **Feature: kiro-knowledge-base, Property 10: Index completeness invariant**
 * **Validates: Requirements 3.4, 3.5**
 *
 * For any set of KnowledgeBaseEntry values written to the
 * knowledge base, after calling `updateIndex()`, the generated
 * index.md SHALL contain a reference to every written file and
 * every category that has files. No phantom entries appear.
 */

describe('Property 10: Index completeness invariant', () => {
  const baseDirs: string[] = [];

  const freshBaseDir = (): string => {
    const dir = join(
      tmpdir(),
      `kb-prop10-${Date.now()}-${Math.random().toString(36).slice(2)}`
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

  const arbSafeDate = fc
    .integer({ min: 1577836800000, max: 1893456000000 })
    .map((ts) => new Date(ts).toISOString());

  const arbSafeEntry = (
    category: fc.Arbitrary<UrlCategory>
  ): fc.Arbitrary<KnowledgeBaseEntry> =>
    fc.record({
      slug: arbSlug,
      category,
      title: fc.string({ minLength: 1, maxLength: 80 }),
      content: fc.string({ minLength: 0, maxLength: 200 }),
      sourceUrl: fc.constant('https://kiro.dev/docs/test'),
      lastUpdated: arbSafeDate,
    });

  const arbUniqueEntries: fc.Arbitrary<KnowledgeBaseEntry[]> = fc
    .array(arbSafeEntry(arbKnownCategory), { minLength: 1, maxLength: 8 })
    .map((entries) => {
      const seen = new Set<string>();
      return entries.filter((e) => {
        const key = `${e.category}/${e.slug}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })
    .filter((entries) => entries.length > 0);

  it('index.md contains a link for every written file after updateIndex()', async () => {
    await fc.assert(
      fc.asyncProperty(arbUniqueEntries, async (entries) => {
        const baseDir = freshBaseDir();

        for (const entry of entries) {
          await write(entry, baseDir);
        }

        await updateIndex(baseDir);

        const indexContent = await readFile(
          join(baseDir, 'index.md'),
          'utf-8'
        );

        for (const entry of entries) {
          const linkPattern = `${entry.category}/${entry.slug}.md`;
          expect(indexContent).toContain(linkPattern);
        }
      }),
      { numRuns: 50 }
    );
  });

  it('every category with files appears as a heading in index.md', async () => {
    await fc.assert(
      fc.asyncProperty(arbUniqueEntries, async (entries) => {
        const baseDir = freshBaseDir();

        for (const entry of entries) {
          await write(entry, baseDir);
        }

        await updateIndex(baseDir);

        const indexContent = await readFile(
          join(baseDir, 'index.md'),
          'utf-8'
        );

        const categories = new Set(entries.map((e) => e.category));

        for (const cat of categories) {
          const heading = cat
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          expect(indexContent).toContain(`## ${heading}`);
        }
      }),
      { numRuns: 50 }
    );
  });

  it('index.md has no phantom entries — only references files that exist', async () => {
    await fc.assert(
      fc.asyncProperty(arbUniqueEntries, async (entries) => {
        const baseDir = freshBaseDir();

        for (const entry of entries) {
          await write(entry, baseDir);
        }

        await updateIndex(baseDir);

        const indexContent = await readFile(
          join(baseDir, 'index.md'),
          'utf-8'
        );

        const linkRegex = /\[.*?\]\((.+?\.md)\)/g;
        const indexLinks: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = linkRegex.exec(indexContent)) !== null) {
          indexLinks.push(match[1]);
        }

        const listed = await list(baseDir);
        const existingFiles = new Set<string>();
        for (const cat of listed) {
          for (const file of cat.files) {
            existingFiles.add(`${cat.category}/${file}.md`);
          }
        }

        for (const link of indexLinks) {
          expect(existingFiles.has(link)).toBe(true);
        }
      }),
      { numRuns: 50 }
    );
  });
});
