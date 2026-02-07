# Custom Agents (CLI) Best Practices

> Custom Agents (CLI) — best-practices

## Full Config Schema

```json
{
  "name": "my-agent",
  "description": "What this agent does",
  "prompt": "file://agents/my-agent-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "toolAliases": {},
  "toolsSettings": {},
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server"]
    }
  },
  "resources": ["file://docs/**"],
  "hooks": {},
  "includeMcpJson": true,
  "keyboardShortcut": "ctrl+shift+k",
  "welcomeMessage": "How can I help?"
}
```

## Knowledge Base Resources

Use `resources` to give agents access to documentation:
- `file://path/to/docs/**` — glob pattern for file access
- Resources are loaded into agent context on demand

## Hooks in Agents

Agents can define hooks that trigger during agent lifecycle:
- `agentSpawn` — runs when the agent starts
- Use hooks to scan workspace or load initial context

## Patterns

- Use `file://` URIs for prompt files (keeps JSON clean)
- Scope `allowedTools` to minimum needed permissions
- Include a descriptive `welcomeMessage` with options
- Reference MCP servers for external tool access

## Anti-Patterns

- Inline prompts in JSON (use file:// references)
- Granting all tools without scoping
- Missing welcomeMessage (poor user experience)

## Related Resources

- [Custom Agents (CLI) in Master Reference](../master-reference.md#custom-agent)
- [Custom Agents (CLI) examples](./examples.md)
- [Custom Agents (CLI) templates](./templates.md)
