---
name: kiro-agent-schema
description: Complete Kiro agent configuration schema reference. Use when creating or modifying agent JSON configs.
---

# Kiro Agent Configuration Schema

## File Location
- Local: `.kiro/agents/<name>.json`
- Global: `~/.kiro/agents/<name>.json`
- Local takes precedence over global with same name

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Agent identifier |
| description | string | no | Human-readable description |
| prompt | string | no | System prompt (inline or `file:///path`) |
| tools | array | no | Available tool names |
| allowedTools | array | no | Auto-approved tools (supports wildcards) |
| toolsSettings | object | no | Per-tool configuration |
| resources | array | no | Context files (`file://` and `skill://` URIs) |
| hooks | object | no | Commands at trigger points |
| mcpServers | object | no | MCP server configurations |
| toolAliases | object | no | Remap tool names |
| model | string | no | Model ID override |
| keyboardShortcut | string | no | Keyboard shortcut (e.g., `ctrl+shift+a`) |
| welcomeMessage | string | no | Message shown on agent switch |
| useLegacyMcpJson | boolean | no | Include legacy MCP configs |

## Tool Names
Built-in: `fs_read`, `fs_write`, `execute_bash`, `grep`, `glob`, `code`, `use_aws`, `introspect`, `knowledge`, `thinking`, `todo_list`, `delegate`

## allowedTools Patterns
- Exact: `"fs_read"`
- Wildcard: `"fs_*"`, `"*_bash"`
- MCP tool: `"@server/tool_name"`, `"@server/read_*"`
- All MCP: `"@server"`
- All built-in: `"@builtin"`

## Hook Triggers
- `agentSpawn` — agent initializes
- `userPromptSubmit` — user sends message
- `preToolUse` — before tool (supports `matcher`)
- `postToolUse` — after tool (supports `matcher`)
- `stop` — assistant finishes

## Resources URI Schemes
- `file://path` — always loaded
- `skill://path` — progressively loaded (requires YAML frontmatter)
- Both support glob patterns
