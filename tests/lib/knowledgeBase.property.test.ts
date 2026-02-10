import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  initKB,
  list,
  loadKB,
  saveKB,
  urlToCategory,
  urlToSlug,
  write,
} from '../../lib/knowledgeBase.js';
import { URL_CATEGORIES } from '../../lib/types.js';
import type { KnowledgeBaseEntry, UrlCategory } from '../../lib/types.js';

const KNOWN_CATEGORIES = URL_CATEGORIES.filter((c) => c !== 'unknown') as UrlCategory[];

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

const arbKnownCategory: fc.Arbitrary<UrlCategory> = fc.constantFrom(...KNOWN_CATEGORIES);

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-'.split('');

const arbSlug = fc
  .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 30 })
  .map((chars) => chars.join(''))
  .filter((s) => !s.startsWith('-') && !s.endsWith('-') && !s.includes('--'));

const arbEntry = (category: fc.Arbitrary<UrlCategory>): fc.Arbitrary<KnowledgeBaseEntry> =>
  fc.record({
    slug: arbSlug,
    category,
    title: fc.string({ minLength: 1, maxLength: 80 }),
    content: fc.string({ minLength: 0, maxLength: 200 }),
    sourceUrl: fc.webUrl(),
    lastUpdated: fc
      .integer({ min: 946684800000, max: 1893456000000 })
      .map((ms) => new Date(ms).toISOString()),
  });

describe('Property 8: Correct directory placement', () => {
  beforeEach(() => initKB([]));

  it('write() places files in a directory named after the entry category', () => {
    fc.assert(
      fc.property(arbEntry(arbKnownCategory), (entry) => {
        initKB([]);
        write(entry);
        const result = list();
        const cat = result.find((r) => r.category === entry.category);
        expect(cat).toBeDefined();
        expect(cat?.files).toContain(entry.slug);
      }),
      { numRuns: 100 },
    );
  });

  it('urlToCategory() returns the matching category for kiro.dev doc URLs', () => {
    const arbDocSection = fc.constantFrom(...Object.keys(KIRO_DOC_SECTIONS));
    const arbSubPath = fc
      .array(fc.constantFrom(...SLUG_CHARS), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(''))
      .filter((s) => !s.startsWith('-') && !s.endsWith('-'));

    fc.assert(
      fc.property(arbDocSection, arbSubPath, (section, subPath) => {
        const url = `https://kiro.dev/docs/${section}/${subPath}`;
        expect(urlToCategory(url)).toBe(KIRO_DOC_SECTIONS[section]);
      }),
      { numRuns: 100 },
    );
  });

  it('urlToCategory() returns agent-skills-spec for agentskills.io URLs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('home', 'what-are-skills', 'specification', 'integrate-skills'),
        (path) => {
          expect(urlToCategory(`https://agentskills.io/${path}`)).toBe('agent-skills-spec');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('urlToCategory() returns blog for kiro.dev/blog/* URLs', () => {
    fc.assert(
      fc.property(arbSlug, (slug) => {
        expect(urlToCategory(`https://kiro.dev/blog/${slug}`)).toBe('blog');
      }),
      { numRuns: 100 },
    );
  });

  it('urlToCategory() returns changelog for kiro.dev/changelog/* URLs', () => {
    fc.assert(
      fc.property(arbSlug, (slug) => {
        expect(urlToCategory(`https://kiro.dev/changelog/${slug}`)).toBe('changelog');
      }),
      { numRuns: 100 },
    );
  });

  it('write() places unknown category entries in the db with category unknown', () => {
    fc.assert(
      fc.property(arbEntry(fc.constant('unknown' as UrlCategory)), (entry) => {
        initKB([]);
        write(entry);
        const result = list();
        expect(result.some((r) => r.category === 'unknown')).toBe(true);
      }),
      { numRuns: 20 },
    );
  });
});

describe('Property 9: Kebab-case filename transformation', () => {
  it('urlToSlug() produces valid kebab-case for any web URL', () => {
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const slug = urlToSlug(url);
        expect(slug.length).toBeGreaterThan(0);
        expect(slug).toMatch(/^[a-z0-9-]+$/);
        expect(slug.startsWith('-')).toBe(false);
        expect(slug.endsWith('-')).toBe(false);
        expect(slug).not.toMatch(/--/);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property 10: Index completeness invariant', () => {
  beforeEach(() => initKB([]));

  const arbUniqueEntries: fc.Arbitrary<KnowledgeBaseEntry[]> = fc
    .array(arbEntry(arbKnownCategory), { minLength: 1, maxLength: 8 })
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

  it('list() contains every written entry', () => {
    fc.assert(
      fc.property(arbUniqueEntries, (entries) => {
        initKB([]);
        for (const entry of entries) write(entry);

        const listed = list();
        for (const entry of entries) {
          const cat = listed.find((r) => r.category === entry.category);
          expect(cat).toBeDefined();
          expect(cat?.files).toContain(entry.slug);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('every category with files appears in list()', () => {
    fc.assert(
      fc.property(arbUniqueEntries, (entries) => {
        initKB([]);
        for (const entry of entries) write(entry);

        const categories = new Set(entries.map((e) => e.category));
        const listed = list();
        for (const cat of categories) {
          expect(listed.some((r) => r.category === cat)).toBe(true);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('list() has no phantom entries — only references written entries', () => {
    fc.assert(
      fc.property(arbUniqueEntries, (entries) => {
        initKB([]);
        for (const entry of entries) write(entry);

        const written = new Set(entries.map((e) => `${e.category}/${e.slug}`));
        const listed = list();
        for (const cat of listed) {
          for (const file of cat.files) {
            expect(written.has(`${cat.category}/${file}`)).toBe(true);
          }
        }
      }),
      { numRuns: 50 },
    );
  });
});
