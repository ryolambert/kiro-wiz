---
inclusion: manual
---

# CLI Workflows

Guides for creating custom agents, CLI hooks, and
knowledge base resources in Kiro CLI.

## Creating Custom Agents

Custom agents are JSON configs stored in the `agents/`
directory at workspace root.

### Agent JSON Schema

```json
{
  "name": "my-agent",
  "description": "What this agent does",
  "prompt": "file://agents/my-agent-prompt.md",
  "model": "sonnet",
  "tools": ["read", "write", "shell"],
  "allowedTools": ["read"],
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  },
  "resources": ["file://docs/**/*.md"],
  "hooks": {},
  "welcomeMessage": "Choose an option:\n1. Do X\n2. Do Y"
}
```

### Key Fields

- `prompt`: Inline string or `file://` URI to a prompt
  markdown file
- `model`: `sonnet` (default), `haiku`, or `opus`
- `tools`: Tool categories — `read`, `write`, `shell`,
  `web`, `spec`
- `allowedTools`: Auto-approved without confirmation
- `toolAliases`: Rename tools for clarity
- `toolsSettings`: Per-tool configuration overrides
- `includeMcpJson`: `true` to inherit workspace MCP
  servers from `settings/mcp.json`
- `keyboardShortcut`: Keyboard shortcut to invoke agent
- `welcomeMessage`: Shown when agent starts; use for
  mode selection menus

### Agent Prompt File

Store complex prompts in a separate markdown file:

```text
agents/
  my-agent.json
  my-agent-prompt.md
```

Reference it in the agent JSON:

```json
{
  "prompt": "file://agents/my-agent-prompt.md"
}
```

## CLI Hooks

CLI agents support hooks in their JSON config. These
fire during agent lifecycle events.

### Hook Structure in Agent JSON

```json
{
  "hooks": {
    "agentSpawn": {
      "command": "ls .kiro/"
    },
    "agentStop": {
      "command": "echo 'Agent finished'"
    }
  }
}
```

### Available CLI Hook Events

| Event        | Fires When                    |
| ------------ | ----------------------------- |
| `agentSpawn` | Agent starts up               |
| `agentStop`  | Agent finishes execution      |

## Knowledge Base Resources

Resources give CLI agents access to file-based knowledge
without consuming tool calls.

### Resource Patterns

```json
{
  "resources": [
    "file://knowledge-base/**/*.md",
    "file://docs/api-reference.md",
    "file://reference-library/**"
  ]
}
```

- Use `file://` URI scheme with glob patterns
- Resources are loaded into agent context at startup
- Keep total resource size manageable to avoid token
  overflow

### Organizing Knowledge Base Files

```text
knowledge-base/
  hooks/
    creating-hooks.md
    hook-triggers.md
  steering/
    inclusion-modes.md
  skills/
    agent-skills-spec.md
  index.md              # Root index listing all files
```

## MCP Servers in CLI Agents

CLI agents connect to MCP servers via `mcpServers`:

```json
{
  "mcpServers": {
    "kiro-kb": {
      "command": "node",
      "args": ["lib/mcpServer.js"]
    }
  }
}
```

Remote MCP servers:

```json
{
  "mcpServers": {
    "remote-api": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

### MCP + Resources Together

Combine MCP tools with file resources for maximum
capability:

```json
{
  "mcpServers": {
    "kiro-kb": {
      "command": "node",
      "args": ["lib/mcpServer.js"]
    }
  },
  "resources": ["file://knowledge-base/**/*.md"]
}
```

- MCP tools: dynamic queries, scaffolding, validation
- Resources: static reference docs loaded at startup

## AGENTS.md

The `AGENTS.md` file at workspace root provides global
instructions to all CLI agents. It acts like an
`always`-mode steering doc for the CLI platform.

```markdown
# Project Guidelines

- Use TypeScript strict mode
- Follow kebab-case for file names
- Run tests before committing
```
