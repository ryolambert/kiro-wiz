# Skills Best Practices

> Skills — best-practices

## Progressive Disclosure Model

Skills follow a three-tier loading strategy:

1. **Discovery** (~100 tokens): Name + description from
   SKILL.md frontmatter. Loaded when listing available skills.
2. **Activation** (<5000 tokens): Full SKILL.md instructions.
   Loaded when the skill is activated by keyword match.
3. **Resources** (on demand): Files in references/, scripts/,
   and assets/ directories. Loaded only when explicitly needed.

## Authoring Guidelines

- **Name**: 1-64 chars, lowercase alphanumeric + hyphens,
  no leading/trailing/consecutive hyphens
- **Description**: 250-350 characters with a "Use when:"
  section explaining activation triggers
- Keep SKILL.md instructions under 5000 tokens
- Place large reference material in references/ directory

## Directory Structure

```text
skills/my-skill/
  SKILL.md          # Frontmatter + instructions
  scripts/          # Optional executable scripts
  references/       # Optional reference documents
  assets/           # Optional static assets
```

## Patterns

- Write descriptions that clearly state activation triggers
- Use "Use when:" prefix in description for discoverability
- Keep instructions actionable and concise
- Validate with `skills-ref` CLI before publishing

## Anti-Patterns

- Exceeding 5000 tokens in SKILL.md instructions
- Vague descriptions without activation triggers
- Putting all content in SKILL.md instead of references/

## Related Resources

- [Skills in Master Reference](../master-reference.md#skill)
- [Skills examples](./examples.md)
- [Skills templates](./templates.md)
