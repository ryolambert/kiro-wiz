# Steering Docs Templates

> Steering Docs — templates

## Steering Doc Starter Template

```markdown
---
inclusion: {{INCLUSION_MODE}}
fileMatchPattern: "{{PATTERN}}"
---

# {{TITLE}}

## Guidelines

- {{GUIDELINE_1}}
- {{GUIDELINE_2}}

## Examples

{{EXAMPLE_CODE_OR_TEXT}}
```

**Placeholders:**
- `{{INCLUSION_MODE}}`: always, fileMatch, or manual
- `{{PATTERN}}`: Required only for fileMatch mode

## Related Resources

- [Steering Docs in Master Reference](../master-reference.md#steering-doc)
- [Steering Docs best-practices](./best-practices.md)
- [Steering Docs examples](./examples.md)
