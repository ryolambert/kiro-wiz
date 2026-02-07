---
inclusion: manual
---

# Cross-Platform Tools

Building MCP servers, skills, and steering docs that
work on both Kiro IDE and CLI.

## MCP Servers

MCP servers are the only cross-platform tool integration
point. Both IDE powers and CLI agents consume them.

### Local Stdio Server

Best for development. ~10-50ms overhead per call.

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["lib/myServer.js"]
    }
  }
}
```

- IDE: place in `custom-powers/my-power/mcp.json`
- CLI: place in agent JSON `mcpServers` field
- Both reference the same server binary

### Remote HTTP/SSE Server

Best for shared team use or cloud deployment.

```json
{
  "mcpServers": {
    "my-server": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

### MCP Server Best Practices

- Single responsibility per tool
- Structured error messages with descriptive context
- Graceful degradation when backends are unavailable
- Cache frequently requested data with configurable TTL
- Never hardcode secrets — use environment variables
- Use `@modelcontextprotocol/sdk` for TypeScript servers

### Shared MCP Server Pattern

For cross-platform integrations, one MCP server serves
both IDE and CLI:

```text
lib/mcpServer.ts          # Shared server implementation

custom-powers/my-power/
  mcp.json                # IDE: points to lib/mcpServer.js

agents/my-agent.json      # CLI: mcpServers points to same
```

Both configs reference the same `command` and `args`,
ensuring consistent tool behavior across platforms.

## Installation Scopes

When creating tools, choose where to install them:

### Workspace Scope (default)

Installs to the current project directory. Best for
project-specific tools.

```text
<project>/
  .kiro/
    hooks/my-hook.kiro.hook
    steering/my-guide.md
    skills/my-skill/SKILL.md
    agents/my-agent.json
    settings/mcp.json
  custom-powers/my-power/POWER.md
```

CLI: `npx tsx bin/scaffold.ts hook --name my-hook \`
`  --desc "My hook"`

MCP: `install_tool` with
`installTarget: { scope: "workspace" }`

### Global Scope

Installs to `~/.kiro/`. Applies to all projects.
Best for personal tools and shared conventions.

```text
~/.kiro/
  hooks/my-hook.kiro.hook
  steering/my-guide.md
  skills/my-skill/SKILL.md
  agents/my-agent.json
  powers/my-power/POWER.md
```

CLI: `npx tsx bin/scaffold.ts hook --name my-hook \`
`  --desc "My hook" --global`

MCP: `install_tool` with
`installTarget: { scope: "global" }`

### Custom Scope

Installs to any directory. Best for targeting a
different project or shared team directory.

CLI: `npx tsx bin/scaffold.ts hook --name my-hook \`
`  --desc "My hook" --scope custom \`
`  --target /path/to/project`

MCP: `install_tool` with
`installTarget: { scope: "custom", targetDir: "/path" }`

### Dry Run Preview

Always preview before installing:

CLI: `npx tsx bin/scaffold.ts hook --name my-hook \`
`  --desc "My hook" --dry-run`

MCP: `install_tool` with `dryRun: true`

## Skills

Skills are portable agent capabilities following the
Agent Skills specification from agentskills.io.

### Directory Structure

```text
my-skill/
  SKILL.md                # Required: manifest + content
  scripts/                # Optional: executable scripts
  references/             # Optional: reference docs
  assets/                 # Optional: static assets
```

### SKILL.md Frontmatter

```yaml
---
name: my-skill
description: >
  Short description (250-350 chars recommended).
  Use when: building X, debugging Y, or optimizing Z.
license: MIT
compatibility: "Kiro IDE, Kiro CLI"
metadata:
  category: "development"
allowed-tools: "read write shell"
---
```

### Name Rules (Agent Skills Spec)

- 1-64 characters
- Lowercase alphanumeric and hyphens only
- No leading, trailing, or consecutive hyphens
- Must match parent directory name

### Progressive Disclosure Model

Skills use three-tier loading for token efficiency:

1. **Discovery** (~100 tokens): name + description only
2. **Activation** (<5000 tokens): full SKILL.md content
3. **On-demand**: scripts/, references/, assets/ loaded
   as needed

### Skill Best Practices

- Target 250-350 char descriptions with "Use when:"
- Keep SKILL.md under 5000 tokens total
- Put large reference material in `references/` dir
- Validate with `skills-ref` CLI before publishing
- Include activation triggers in description

## Steering Docs (Cross-Platform)

Steering docs work on both IDE and CLI with slightly
different delivery mechanisms.

### IDE Delivery

Stored in `.kiro/steering/` or `steering/` inside a
power directory. Uses YAML frontmatter for inclusion
mode.

```yaml
---
inclusion: always
---
```

### CLI Delivery

- `AGENTS.md` at workspace root acts as global steering
- Agent-specific steering via `prompt` field or
  `resources` in agent JSON
- No YAML frontmatter needed for AGENTS.md

### Writing Cross-Platform Steering

To make a steering doc work on both platforms:

1. Write the content as a standalone markdown file
2. Add YAML frontmatter for IDE inclusion mode
3. Reference the same file as a CLI agent resource

```json
{
  "resources": [
    "file://.kiro/steering/my-guide.md"
  ]
}
```

### Inclusion Mode Reference

| Mode        | IDE                  | CLI              |
| ----------- | -------------------- | ---------------- |
| `always`    | Every conversation   | Via AGENTS.md    |
| `fileMatch` | When editing matches | Not supported    |
| `manual`    | Via `readSteering`   | Via `resources`  |
