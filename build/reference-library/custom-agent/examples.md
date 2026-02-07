# Custom Agents (CLI) Examples

> Custom Agents (CLI) — examples

## CLI Agent Example

```json
{
  "name": "docs-assistant",
  "description": "Helps write and maintain documentation",
  "prompt": "file://agents/docs-prompt.md",
  "tools": ["read", "write"],
  "allowedTools": ["read"],
  "mcpServers": {
    "docs-server": {
      "command": "node",
      "args": ["lib/docsServer"]
    }
  },
  "resources": ["file://docs/**"],
  "welcomeMessage": "I can help with docs. Options:\n1. Write new docs\n2. Review existing\n3. Update outdated"
}
```

## Related Resources

- [Custom Agents (CLI) in Master Reference](../master-reference.md#custom-agent)
- [Custom Agents (CLI) best-practices](./best-practices.md)
- [Custom Agents (CLI) templates](./templates.md)
