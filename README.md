# Kiro Knowledge Base

Self-updating knowledge base and MCP documentation server
for Kiro IDE, CLI, and Autonomous Agent tooling.

Crawls [kiro.dev](https://kiro.dev) and
[agentskills.io](https://agentskills.io), parses content
into structured markdown, compiles a master reference, and
serves it via an MCP server consumed by both the IDE power
and CLI agents.

## Prerequisites

- Node.js >= 20
- npm

## Setup

```bash
cd tools/kiro-knowledge-base
npm install
```

## CLI Commands

All commands run via `npx tsx`:

```bash
# Crawl documentation sources
npm run crawl -- --all             # crawl all registered URLs
npm run crawl -- --url <url>       # crawl a single URL
npm run crawl -- --category hooks  # crawl by category

# Compile knowledge base
npm run compile              # build master-reference.md
                             # and reference library

# Detect changes in upstream docs
npm run detect-changes

# Audit a workspace against best practices
npm run audit                        # audit current dir
npm run audit -- --workspace /path   # audit target dir

# Validate an Agent Skills spec directory
npm run validate-skill -- /path/to/skill

# Start the MCP documentation server
npm run mcp-server                   # stdio (default)
npm run mcp-server -- --http         # HTTP/SSE transport
npm run mcp-server -- --http --port 8080
```

## Testing

```bash
npm test              # run all tests (vitest)
npm run test:coverage # with v8 coverage
npm run test:watch    # watch mode
```

574 tests across 27 files covering unit tests and
property-based tests (fast-check).

## Project Structure

```
tools/kiro-knowledge-base/
├── bin/                  # CLI entry points
│   ├── crawl.ts
│   ├── compile.ts
│   ├── detect-changes.ts
│   ├── audit.ts
│   ├── validate-skill.ts
│   └── mcp-server.ts
├── lib/                  # Core modules
│   ├── types.ts          # Shared type definitions
│   ├── urlRegistry.ts    # URL registry + categorization
│   ├── crawler.ts        # HTTP fetcher with retry
│   ├── contentParser.ts  # HTML → markdown parser
│   ├── knowledgeBase.ts  # File system storage
│   ├── compiler.ts       # Master reference compiler
│   ├── referenceLibrary.ts  # Best practices + templates
│   ├── changeDetector.ts # Sitemap diff detection
│   ├── toolingAdvisor.ts # Tool recommendations
│   ├── configGenerator.ts   # Config generation + validation
│   ├── skillsValidator.ts   # Agent Skills spec validation
│   ├── workspaceAuditor.ts  # Workspace config auditor
│   ├── scaffoldingEngine.ts # Tool scaffolding engine
│   ├── workflowBuilder.ts   # Integration plan builder
│   └── mcpServer.ts      # MCP documentation server
├── tests/lib/            # Unit + property-based tests
├── powers/kiro-knowledge-base/
│   ├── POWER.md          # IDE power manifest
│   ├── mcp.json          # MCP server config for IDE
│   └── steering/         # Workflow-specific guides
├── agents/               # CLI agent configs
│   ├── kiro-knowledge-base-agent.json
│   └── kiro-workflow-builder.json
└── knowledge-base/       # Generated output (gitignored)
```

## MCP Server Tools

The MCP server exposes 7 tools:

| Tool                   | Description                        |
| ---------------------- | ---------------------------------- |
| `query_knowledge_base` | Search docs by topic or tool type  |
| `get_decision_matrix`  | Compare all 10 Kiro tool types     |
| `get_template`         | Starter template for a tool type   |
| `scaffold_tool`        | Guided scaffolding for new tools   |
| `validate_config`      | Schema validation per tool type    |
| `audit_workspace`      | Audit configs against best practices |
| `get_platform_guide`   | Platform-specific setup guide      |

## Using as an IDE Power

Copy or symlink `powers/kiro-knowledge-base/` into your
project's `custom-powers/` directory. The `mcp.json` starts
the MCP server automatically when the power is activated.

## Using as a CLI Agent

Reference `agents/kiro-knowledge-base-agent.json` in your
CLI agent configuration. The agent connects to the same MCP
server backend as the IDE power.

## Pipeline Overview

```
kiro.dev/sitemap.xml
        │
        ▼
  URL Registry ──► Crawler ──► Content Parser
        │                            │
        │                            ▼
        │                     Knowledge Base (markdown files)
        │                            │
        ▼                            ▼
  Change Detector            Compiler + Reference Library
                                     │
                                     ▼
                              MCP Documentation Server
                               ╱              ╲
                         IDE Power        CLI Agents
```

## Kiro Tool Types

The knowledge base covers all 10 Kiro tool types:

| Tool Type          | Platform  |
| ------------------ | --------- |
| `spec`             | IDE only  |
| `hook`             | Both      |
| `steering-doc`     | Both      |
| `skill`            | Both      |
| `power`            | IDE only  |
| `mcp-server`       | Both      |
| `custom-agent`     | CLI only  |
| `autonomous-agent` | Cloud     |
| `subagent`         | IDE only  |
| `context-provider` | IDE only  |

## License

Private — internal tooling.
