---
name: kiro-directory-layout
description: Reference for the .kiro directory structure and file locations. Use when setting up or organizing Kiro projects.
---

# Kiro Directory Layout

## Global (~/.kiro/)
```
~/.kiro/
├── agents/              # Global agent configs (.json)
├── settings/
│   └── cli.json         # Global settings
├── prompts/             # Global prompt templates
├── sessions/            # Saved conversations (SQLite)
├── mcp.json             # Global MCP server config
└── tools/               # Custom tool projects
```

## Workspace (.kiro/)
```
.kiro/
├── agents/              # Local agent configs (.json) — override global
├── settings/
│   └── cli.json         # Workspace settings — override global
├── steering/            # Steering docs (.md, inclusion: always)
├── hooks/               # Hook scripts
├── prompts/             # Local prompt templates
├── skills/              # Skill resources
│   └── <name>/
│       └── SKILL.md     # Requires YAML frontmatter (name, description)
├── tools/               # Custom tool projects
├── specs/               # Specification documents
└── mcp.json             # Workspace MCP config
```

## Precedence
- Workspace settings override global settings
- Local agents override global agents with same name
- Workspace MCP servers merge with global
- Steering docs are always included in context

## Key File Formats
- Agents: JSON (.json)
- Steering: Markdown with YAML frontmatter
- Skills: Markdown with YAML frontmatter (name + description required)
- Settings: JSON (cli.json)
- MCP: JSON (mcp.json or in agent mcpServers field)
- Prompts: Markdown or text, referenced via file:// URI
- Hooks: Shell scripts, referenced in agent hooks config
