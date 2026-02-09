# Kiro Knowledge Base - Analysis & Improvement Plan

## Current State Assessment

Based on the introspect documentation review, the `.kiro` directory supports:

### Documented Directory Structure
```
~/.kiro/                          # Global (user-wide)
├── agents/                       # Global agent configs (.json)
├── settings/
│   └── cli.json                  # Global settings
├── prompts/                      # Prompt templates
├── sessions/                     # Saved conversations
└── mcp.json                      # Global MCP server config

.kiro/                            # Workspace (project-local)
├── agents/                       # Local agent configs (.json)
├── settings/
│   └── cli.json                  # Workspace settings
├── steering/                     # Steering documents (always-included context)
├── hooks/                        # Context hooks
├── prompts/                      # Local prompt templates
├── skills/                       # Skill resources (progressive loading)
│   └── **/SKILL.md              # Skill files with YAML frontmatter
├── tools/                        # Custom tool projects
└── specs/                        # Specification documents
```

### Key Kiro Primitives
1. **Agents** - JSON configs defining tools, prompts, hooks, MCP servers
2. **Steering** - Markdown docs with `inclusion: always` frontmatter
3. **Hooks** - Commands at trigger points (agentSpawn, userPromptSubmit, preToolUse, postToolUse, stop)
4. **Prompts** - Reusable prompt templates
5. **Skills** - Progressive-load resources with YAML frontmatter
6. **MCP Servers** - External tool providers via Model Context Protocol
7. **Settings** - Global/workspace configuration (cli.json)
8. **Resources** - Context files via file:// and skill:// URIs

### Install Scopes
- **Local**: `.kiro/` in current workspace
- **Global**: `~/.kiro/` in home directory
- Local takes precedence over global for same-named items
