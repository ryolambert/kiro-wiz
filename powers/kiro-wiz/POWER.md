# kiro-wiz Power

A Kiro IDE power that provides knowledge base management, scaffolding, auditing, and tool recommendations via MCP.

## Capabilities

- **scaffold_tool** — Generate Kiro tool scaffolds (agents, hooks, steering docs, skills, powers, MCP configs, specs)
- **audit_workspace** — Scan workspace for best-practice compliance
- **sync_knowledge_base** — Crawl kiro.dev documentation and update local knowledge base
- **query_knowledge_base** — Search and browse the local knowledge base
- **validate_config** — Validate Kiro configuration files
- **get_decision_matrix** — Get the tool selection decision matrix
- **get_template** — Get scaffold template for a specific tool type
- **install_tool** — Install scaffolded files to workspace or global scope
- **get_platform_guide** — Get platform-specific guidance

## Activation

This power is activated automatically when the kiro-wiz MCP server is running. Start it with:

```bash
kiro-wiz --mcp
```

Or configure it in your agent's `mcpServers` field using the `mcp.json` in this directory.

## Usage

Once active, Kiro agents can use any of the MCP tools listed above. For example:

- Ask an agent to "scaffold a new hook for pre-commit validation"
- Ask an agent to "audit this workspace"
- Ask an agent to "sync the knowledge base"
- Ask an agent to "recommend a tool for enforcing code standards"
