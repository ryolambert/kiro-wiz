# Custom Agents (CLI) Templates

> Custom Agents (CLI) — templates

## Custom Agent Starter Template

```json
{
  "name": "{{AGENT_NAME}}",
  "description": "{{DESCRIPTION}}",
  "prompt": "file://agents/{{AGENT_NAME}}-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "node",
      "args": ["{{SERVER_PATH}}"]
    }
  },
  "resources": ["file://{{RESOURCE_GLOB}}"],
  "welcomeMessage": "{{WELCOME_MESSAGE}}"
}
```

**Placeholders:**
- `{{AGENT_NAME}}`: kebab-case agent identifier
- `{{SERVER_NAME}}`: MCP server name for tool access
- `{{RESOURCE_GLOB}}`: Glob for knowledge base files

## Related Resources

- [Custom Agents (CLI) in Master Reference](../master-reference.md#custom-agent)
- [Custom Agents (CLI) best-practices](./best-practices.md)
- [Custom Agents (CLI) examples](./examples.md)
