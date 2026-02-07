---
inclusion: manual
---

# IDE Workflows

Guides for creating powers, hooks, and steering docs
in Kiro IDE.

## Creating a Power

A power bundles documentation, MCP servers, and steering
files into a single IDE extension.

### Directory Structure

```text
custom-powers/my-power/
  POWER.md              # Required: manifest + docs
  mcp.json              # Optional: MCP server config
  steering/
    workflow-a.md       # Optional: on-demand guides
    workflow-b.md
```

### POWER.md Frontmatter

```yaml
---
name: "my-power"
displayName: "My Power"
description: "One-line description under 200 chars"
keywords:
  - "keyword-1"
  - "keyword-2"
---
```

- `name`: kebab-case, matches directory name
- `keywords`: trigger automatic activation when user
  mentions these terms in chat
- Keep POWER.md under ~500 lines for token efficiency

### POWER.md Body Sections

1. **Overview** — what the power does (2-3 sentences)
2. **Onboarding** — prerequisites, dependency checks
3. **Available Steering Files** — table mapping files
   to use cases
4. **MCP Server Tools** — table of exposed tools
5. **Common Workflows** — numbered step-by-step guides

### mcp.json for Powers

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

Remote servers use `url` instead of `command`:

```json
{
  "mcpServers": {
    "server-name": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

## Creating Hooks

Hooks automate actions on IDE events. Stored in
`.kiro/hooks/` as `*.kiro.hook` files.

### Hook Trigger Types

| Trigger          | Fires When                      |
| ---------------- | ------------------------------- |
| `fileEdited`     | File saved after edit           |
| `fileCreated`    | New file created                |
| `fileDeleted`    | File deleted                    |
| `promptSubmit`   | User submits a chat prompt      |
| `agentStop`      | Agent finishes execution        |
| `preToolUse`     | Before a tool is invoked        |
| `postToolUse`    | After a tool completes          |
| `userTriggered`  | Manual trigger by user          |

### Hook Action Types

| Action       | Credit Cost | Description              |
| ------------ | ----------- | ------------------------ |
| `runCommand` | None        | Runs a shell command     |
| `askAgent`   | Medium      | Sends prompt to agent    |

### Hook Creation via `createHook` Tool

```text
id: "lint-on-save"
name: "Lint on Save"
description: "Run ESLint when TS files change"
eventType: "fileEdited"
hookAction: "runCommand"
command: "npx eslint --fix ${file}"
filePatterns: "**/*.ts,**/*.tsx"
```

### Constraints

- `runCommand` is NOT valid with file events
  (`fileEdited`, `fileCreated`, `fileDeleted`)
- For file events that need commands, use `askAgent`
  with instructions to run the command
- `toolTypes` is required for `preToolUse`/`postToolUse`
  (categories: `read`, `write`, `shell`, `web`, `spec`,
  `*`, or regex for MCP tools)

## Creating Steering Docs

Steering docs inject markdown context into agent
conversations. Stored in `.kiro/steering/` or inside
a power's `steering/` directory.

### Inclusion Modes

```yaml
---
inclusion: always
---
```

| Mode        | Behavior                            |
| ----------- | ----------------------------------- |
| `always`    | Loaded in every conversation        |
| `fileMatch` | Loaded when editing matching files  |
| `manual`    | Loaded on-demand via `readSteering` |

### fileMatch Example

```yaml
---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx"
---
```

### Best Practices

- Use `always` sparingly — consumes tokens every turn
- Use `manual` for reference guides (like this file)
- Use `fileMatch` for language/framework-specific rules
- Keep steering docs under ~200 lines
- One topic per file for focused context injection
