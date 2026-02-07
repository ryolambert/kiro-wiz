# Hooks Examples

> Hooks — examples

## Lint on Save Hook

```json
{
  "name": "lint-on-save",
  "version": "1.0.0",
  "description": "Run ESLint when TypeScript files are saved",
  "when": {
    "type": "fileEdited",
    "patterns": ["**/*.ts", "**/*.tsx"]
  },
  "then": {
    "type": "runCommand",
    "command": "npx eslint --fix {{filePath}}"
  }
}
```

## Code Review Hook

```json
{
  "name": "review-on-create",
  "version": "1.0.0",
  "description": "Review new files for best practices",
  "when": {
    "type": "fileCreated",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Review this new file for best practices"
  }
}
```

## Related Resources

- [Hooks in Master Reference](../master-reference.md#hook)
- [Hooks best-practices](./best-practices.md)
- [Hooks templates](./templates.md)
