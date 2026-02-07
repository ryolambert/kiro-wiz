# Powers Best Practices

> Powers — best-practices

## POWER.md Frontmatter

```yaml
---
name: my-power
displayName: My Power
description: What this power does
keywords: keyword1, keyword2, keyword3
---
```

## Keyword-Based Activation

Powers are activated when user messages match keywords.
Choose keywords that reflect the power's domain:
- Use specific technical terms
- Include common synonyms
- Avoid overly generic words

## Steering File Mapping

```text
custom-powers/my-power/
  POWER.md              # Manifest with frontmatter
  mcp.json              # Optional MCP server config
  steering/
    workflow-guide.md   # Workflow-specific guidance
    templates.md        # Starter templates
```

## Patterns

- Use kebab-case for power directory names
- Keep POWER.md under ~500 lines
- Include an onboarding section with dependency checks
- Map steering files to specific workflow scenarios

## Anti-Patterns

- Overly generic keywords causing false activations
- Monolithic POWER.md without steering file delegation
- Missing mcp.json when the power needs tool access

## Related Resources

- [Powers in Master Reference](../master-reference.md#power)
- [Powers examples](./examples.md)
- [Powers templates](./templates.md)
