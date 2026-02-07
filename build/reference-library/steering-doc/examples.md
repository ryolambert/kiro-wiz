# Steering Docs Examples

> Steering Docs — examples

## Always-Included Steering Doc

```markdown
---
inclusion: always
---

# Project Coding Standards

- Use TypeScript strict mode
- No \`any\` types
- Prefer interfaces over type aliases for objects
```

## File-Match Steering Doc

```markdown
---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts"
---

# Testing Guidelines

- Use vitest for all tests
- Write property-based tests for core logic
```

## Related Resources

- [Steering Docs in Master Reference](../master-reference.md#steering-doc)
- [Steering Docs best-practices](./best-practices.md)
- [Steering Docs templates](./templates.md)
