# Steering Docs Best Practices

> Steering Docs — best-practices

## Inclusion Modes

| Mode | Behavior |
| --- | --- |
| always | Loaded into every agent conversation |
| fileMatch | Loaded when edited files match the pattern |
| manual | Only loaded when explicitly referenced via # |

## AGENTS.md Support

The `AGENTS.md` file at workspace root acts as a global
steering document. It is always included in agent context
and serves as the top-level project guidance.

## File Reference Syntax

Use `#` prefix in chat to reference steering docs:
- `#steering/my-guide.md` — loads a specific steering file
- `#file:path/to/file` — loads any workspace file as context

## Patterns

- Use `always` mode for universal project rules
- Use `fileMatch` for language-specific or path-specific guidance
- Keep steering docs focused on a single concern
- Use YAML frontmatter for inclusion mode configuration

## Anti-Patterns

- Putting everything in a single massive steering doc
- Using `always` mode for rarely-needed guidance
- Missing frontmatter (defaults may not match intent)

## Related Resources

- [Steering Docs in Master Reference](../master-reference.md#steering-doc)
- [Steering Docs examples](./examples.md)
- [Steering Docs templates](./templates.md)
