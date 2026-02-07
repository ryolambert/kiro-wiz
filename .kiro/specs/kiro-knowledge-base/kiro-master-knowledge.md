# Kiro IDE & CLI — Master Knowledge Document

> Compiled from kiro.dev sitemap (February 2026) and agentskills.io specification.
> Source: 90+ pages crawled across docs, blog, changelog, and community resources.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Specs (Specifications)](#2-specs)
3. [Hooks (Agent Hooks)](#3-hooks)
4. [Steering](#4-steering)
5. [Skills (Agent Skills)](#5-skills)
6. [Powers](#6-powers)
7. [MCP (Model Context Protocol)](#7-mcp)
8. [Custom Agents (CLI)](#8-custom-agents-cli)
9. [Chat & Subagents](#9-chat--subagents)
10. [Autonomous Agent](#10-autonomous-agent)
11. [CLI Overview](#11-cli-overview)
12. [Tool Decision Matrix](#12-tool-decision-matrix)
13. [Configuration File Reference](#13-configuration-file-reference)
14. [Directory Structure Reference](#14-directory-structure-reference)
15. [Agent Skills Specification (agentskills.io)](#15-agent-skills-specification)

---

## 1. Platform Overview

Kiro is an agentic IDE (and CLI) built by AWS. It provides three surfaces:

- **Kiro IDE** — A VS Code-based desktop IDE with specs, hooks, steering, skills, powers, MCP, chat/subagents, and an autonomous agent.
- **Kiro CLI** — A terminal-based agent with chat, custom agents, hooks, steering, MCP, knowledge bases, and experimental features (tangent mode, todo lists, checkpointing, delegate).
- **Kiro Autonomous Agent** — A cloud-based agent that works asynchronously in isolated sandboxes, connected to GitHub for autonomous PR/issue handling.

**Pricing tiers:** Free, Pro, Pro+, Power, Enterprise.

**Models supported:** Claude Opus 4.6, Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5.

**Install CLI:** `curl -fsSL https://cli.kiro.dev/install | bash`

---

## 2. Specs

### What They Are
Specs (specifications) are structured artifacts that formalize the development process. They transform high-level ideas into detailed implementation plans with clear tracking. Kiro generates three files per spec:

- **requirements.md** — User stories with acceptance criteria in EARS notation
- **design.md** — Technical architecture, sequence diagrams, implementation considerations
- **tasks.md** — Detailed implementation plan with discrete, trackable tasks

### EARS Notation
```
WHEN [condition/event]
THE SYSTEM SHALL [expected behavior]
```

### Workflow
Requirements → Design → Implementation Plan → Execution (with task tracking)

### Key Capabilities
- Run all tasks in a spec with "Run all tasks" button (only incomplete required tasks)
- Reference specs in chat via `#spec:spec-name`
- Update specs iteratively: modify requirements.md → Refine design → Update tasks
- Import from JIRA/Confluence via MCP or manual copy
- Start spec from vibe session by saying "Generate spec"
- Multiple specs per repo recommended (one per feature)

### File Location
`.kiro/specs/<spec-name>/` containing requirements.md, design.md, tasks.md

### Best Practices
- Create one spec per feature, not one for entire codebase
- Store specs in version control alongside code
- Check which tasks are already complete via "Update tasks"
- Use `#spec:name` in chat for context-aware implementation

---

## 3. Hooks

### What They Are
Agent hooks are automated triggers that execute predefined agent prompts or shell commands when specific events occur in the IDE.

### Trigger Types (8 total)

| Trigger | Description | Environment Variables |
|---------|-------------|---------------------|
| **Prompt Submit** | User submits a prompt | `USER_PROMPT` |
| **Agent Stop** | Agent finishes responding | — |
| **Pre Tool Use** | Before agent invokes a tool | Tool name field (wildcarding supported) |
| **Post Tool Use** | After agent invokes a tool | Tool name field |
| **File Create** | New files matching patterns created | File pattern |
| **File Save** | Files matching patterns saved | File pattern |
| **File Delete** | Files matching patterns deleted | File pattern |
| **Manual Trigger** | On-demand execution | — |

### Special Tool Names for Pre/Post Tool Use
- `read` — all built-in file read tools
- `write` — all built-in file write tools
- `shell` — all built-in shell command tools
- `web` — all built-in web tools

### Action Types

1. **Agent Prompt** — Natural language instruction sent to the agent (consumes credits)
2. **Shell Command** — Deterministic command executed locally (free, faster)
   - Exit code 0: stdout added to agent context
   - Non-zero: stderr sent to agent as error notification
   - Only available for PromptSubmit and AgentStop triggers

### Hook File Format (IDE)
Hooks live in `.kiro/hooks/` as `.kiro.hook` files containing JSON:
```json
{
  "enabled": true,
  "name": "Hook Name",
  "description": "What this hook does",
  "version": "1",
  "when": {
    "type": "fileSaved",
    "filePattern": "src/**/*.ts"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Review the saved file for security issues"
  }
}
```

### CLI Hook Format
CLI hooks use JSON in agent config `hooks` field:
```json
{
  "hooks": {
    "agentSpawn": [{ "command": "git status" }],
    "userPromptSubmit": [{ "command": "ls -la" }],
    "preToolUse": [{ "matcher": "execute_bash", "command": "audit-cmd" }],
    "postToolUse": [{ "matcher": "fs_write", "command": "cargo fmt --all" }],
    "stop": [{ "command": "echo done" }]
  }
}
```

### Best Practices
- One specific task per hook
- Write detailed, unambiguous agent prompts
- Use numbered steps for complex operations
- Start with limited file patterns before expanding
- Test with edge cases before deploying
- Prefer Shell Command for deterministic tasks (cheaper, faster)
- Store hook configurations in version control
- Document hook purposes and expected behavior

### Important Limitations
- Hooks do NOT trigger in subagents
- Shell Command action only available for PromptSubmit and AgentStop

---

## 4. Steering

### What It Is
Steering gives Kiro persistent knowledge about your workspace through markdown files. Instead of explaining conventions in every chat, steering files ensure Kiro consistently follows your patterns.

### Scope Levels

| Scope | Location | Precedence |
|-------|----------|-----------|
| **Workspace** | `.kiro/steering/*.md` | Highest (overrides global) |
| **Global** | `~/.kiro/steering/*.md` | Applies to all workspaces |
| **Team** | `~/.kiro/steering/*.md` (via MDM/Group Policy) | Same as global |

### Inclusion Modes (Frontmatter)

```yaml
---
inclusion: always          # Default — loaded in every interaction
---

---
inclusion: fileMatch
fileMatchPattern: "components/**/*.tsx"   # Auto-loaded for matching files
---

---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx"]  # Multiple patterns
---

---
inclusion: manual          # Load on-demand via #steering-file-name
---
```

### Foundational Steering Files (Auto-Generated)
1. **product.md** — Product purpose, target users, key features, business objectives
2. **tech.md** — Frameworks, libraries, development tools, technical constraints
3. **structure.md** — File organization, naming conventions, import patterns, architecture

### File References
Reference live workspace files: `#[[file:api/openapi.yaml]]`

### AGENTS.md Support
Kiro supports the AGENTS.md standard. Place in workspace root or `~/.kiro/steering/`. Always included (no inclusion modes).

### CLI Steering
CLI also supports steering at `.kiro/steering/` and `~/.kiro/steering/`.

### Best Practices
- One domain per file
- Use descriptive filenames: `api-rest-conventions.md`, `testing-unit-patterns.md`
- Include context (why decisions were made, not just what)
- Provide code examples and before/after comparisons
- Never include API keys or passwords
- Review during sprint planning and architecture changes

---

## 5. Skills

### What They Are
Skills are portable instruction packages following the open [Agent Skills](https://agentskills.io) standard. They bundle instructions, scripts, and templates into reusable packages that Kiro activates when relevant.

### Progressive Disclosure Model
1. **Discovery** (~100 tokens) — At startup, only name + description loaded
2. **Activation** (<5000 tokens) — When request matches description, full SKILL.md loaded
3. **Execution** (as needed) — Scripts/references loaded only when needed

### Directory Structure
```
my-skill/
├── SKILL.md           # Required
├── scripts/           # Optional executable code
├── references/        # Optional documentation
└── assets/            # Optional templates
```

### SKILL.md Format
```yaml
---
name: pr-review
description: Review pull requests for code quality, security issues, and test coverage.
license: Apache-2.0
compatibility: Requires git
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read
---

## Review process
1. Check for security vulnerabilities
2. Verify error handling
...
```

### Frontmatter Fields

| Field | Required | Constraints |
|-------|----------|------------|
| `name` | Yes | 1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens, must match parent directory |
| `description` | Yes | 1-1024 chars, non-empty, describes what + when to use |
| `license` | No | License name or reference |
| `compatibility` | No | Max 500 chars, environment requirements |
| `metadata` | No | Arbitrary key-value mapping |
| `allowed-tools` | No | Space-delimited pre-approved tools (experimental) |

### Scope
- **Workspace:** `.kiro/skills/`
- **Global:** `~/.kiro/skills/`
- Workspace overrides global on name conflicts

### Import Sources
- GitHub public repositories
- Local filesystem folders

### Validation
Use `skills-ref validate ./my-skill` (from agentskills.io reference library)

### Skills vs Steering vs Powers
- **Skills** — Portable, open standard, load on-demand, include scripts. For reusable workflows.
- **Steering** — Kiro-specific, shapes behavior, supports inclusion modes. For project standards.
- **Powers** — Bundle MCP tools + knowledge + workflows. For integrations needing tools + guidance.

---

## 6. Powers

### What They Are
Powers package tools, workflows, and best practices into a format Kiro activates on-demand via keyword matching. They solve context overload by loading dynamically.

### How They Work
1. Kiro reads task description
2. Evaluates installed powers against keywords
3. Loads only relevant powers (MCP tools + POWER.md steering)
4. When you switch contexts, powers swap automatically

### Directory Structure
```
power-name/
├── POWER.md            # Required — metadata, onboarding, steering mappings
├── mcp.json            # Optional — MCP server configuration
└── steering/           # Optional — workflow-specific guidance files
    ├── workflow-a.md
    └── workflow-b.md
```

### POWER.md Format
```yaml
---
name: "supabase"
displayName: "Supabase with local CLI"
description: "Build fullstack applications with Supabase"
keywords: ["database", "postgres", "auth", "storage", "realtime"]
---

# Onboarding
## Step 1: Validate tools work
...

# When to Load Steering Files
- Setting up a database → `database-setup-workflow.md`
- Writing SQL → `supabase-code-format-sql.md`
```

### MCP Server Configuration (mcp.json)
```json
{
  "mcpServers": {
    "supabase-local": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}"
      }
    }
  }
}
```

### Key Features
- **Dynamic MCP tool loading** — Tools loaded on-demand vs all upfront
- **Keyword-based activation** — Powers activate when conversation matches keywords
- **One-click install** — From kiro.dev/powers or in-IDE
- **Open ecosystem** — GitHub-based sharing

### Installation Sources
- Kiro powers marketplace (kiro.dev/powers)
- GitHub repository URL
- Local path

### Testing
Install locally via Powers panel → "Add power from Local Path"

---

## 7. MCP (Model Context Protocol)

### What It Is
MCP extends Kiro's capabilities by connecting to specialized servers that provide additional tools and context.

### Configuration Locations
- **Workspace:** `.kiro/settings/mcp.json`
- **User/Global:** `~/.kiro/settings/mcp.json`
- Workspace takes precedence when both exist

### Configuration Format
```json
{
  "mcpServers": {
    "local-server": {
      "command": "npx",
      "args": ["-y", "@some/mcp-server"],
      "env": { "API_KEY": "${API_KEY}" },
      "disabled": false,
      "autoApprove": ["tool_name"],
      "disabledTools": ["unwanted_tool"]
    },
    "remote-server": {
      "url": "https://mcp.example.com/sse",
      "headers": { "Authorization": "Bearer ${TOKEN}" },
      "disabled": false,
      "autoApprove": ["*"]
    }
  }
}
```

### Server Types
- **Local (stdio):** `command` + `args` — spawns a local process
- **Remote (SSE):** `url` + optional `headers` — connects via HTTPS

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | String | Yes (local) | Command to run the server |
| `args` | Array | Yes (local) | Command arguments |
| `url` | String | Yes (remote) | HTTPS endpoint |
| `headers` | Object | No | Connection headers |
| `env` | Object | No | Environment variables (supports `${VAR}` expansion) |
| `disabled` | Boolean | No | Temporarily disable (default: false) |
| `autoApprove` | Array | No | Tools to auto-approve (`"*"` for all) |
| `disabledTools` | Array | No | Tools to omit |

### Security Best Practices
- Use `${ENV_VAR}` references, never hardcode secrets
- Never commit config files with credentials
- Only connect to trusted remote servers
- Review tool permissions before autoApprove

---

## 8. Custom Agents (CLI)

### What They Are
Custom agents tailor Kiro CLI behavior for specific tasks by defining available tools, permissions, context, and prompt.

### Configuration File Location
- **Local (project):** `.kiro/agents/<name>.json`
- **Global (user):** `~/.kiro/agents/<name>.json`
- Local overrides global on name conflicts

### Full Configuration Schema

```json
{
  "name": "my-agent",
  "description": "Agent description",
  "prompt": "You are a helpful coding assistant",
  "model": "claude-sonnet-4",
  "tools": ["read", "write", "shell", "@git"],
  "allowedTools": ["read", "@git/git_status", "@server/read_*"],
  "toolAliases": { "@github-mcp/get_issues": "github_issues" },
  "toolsSettings": { "write": { "allowedPaths": ["~/**"] } },
  "mcpServers": {
    "fetch": { "command": "fetch3.1", "args": [] }
  },
  "resources": [
    "file://README.md",
    "file://.kiro/steering/**/*.md",
    "skill://.kiro/skills/**/SKILL.md",
    {
      "type": "knowledgeBase",
      "source": "file://./docs",
      "name": "ProjectDocs",
      "description": "Project documentation",
      "indexType": "best",
      "autoUpdate": true
    }
  ],
  "hooks": {
    "agentSpawn": [{ "command": "git status" }],
    "preToolUse": [{ "matcher": "execute_bash", "command": "audit" }],
    "postToolUse": [{ "matcher": "fs_write", "command": "cargo fmt" }],
    "stop": [{ "command": "echo done" }]
  },
  "includeMcpJson": true,
  "keyboardShortcut": "ctrl+shift+a",
  "welcomeMessage": "Welcome! What would you like to work on?"
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `name` | Agent identifier |
| `description` | Human-readable description |
| `prompt` | System prompt (inline string or `file://path.md`) |
| `model` | Model ID (e.g., `claude-sonnet-4`, `claude-opus-4-5`) |
| `tools` | Available tools (`"*"` for all, `"@builtin"`, `"@server"`, `"read"`, `"write"`, `"shell"`) |
| `allowedTools` | Auto-approved tools (supports glob patterns: `@server/read_*`) |
| `toolAliases` | Remap tool names to resolve collisions |
| `mcpServers` | MCP server definitions |
| `resources` | Files, skills, knowledge bases loaded into context |
| `hooks` | Lifecycle hooks (agentSpawn, userPromptSubmit, preToolUse, postToolUse, stop) |
| `includeMcpJson` | Whether to include MCP servers from mcp.json files |
| `keyboardShortcut` | Quick-switch shortcut |
| `welcomeMessage` | Displayed when switching to agent |

### Resource Types
- `file://` — Loaded at startup
- `skill://` — Metadata at startup, full content on-demand
- `knowledgeBase` — Indexed documentation with search capability

### Usage
```bash
kiro-cli --agent my-agent           # Start with specific agent
> /agent swap                        # Switch agents in session
> /agent generate                    # Create new agent interactively
```

---

## 9. Chat & Subagents

### Chat Modes
- **Vibe mode** — Freeform conversation, rapid prototyping
- **Spec mode** — Structured requirements → design → tasks workflow

### Context Providers (`#` prefix)

| Provider | Description |
|----------|-------------|
| `#codebase` | Auto-find relevant files |
| `#file` | Reference specific files |
| `#folder` | Reference folder contents |
| `#git diff` | Current git changes |
| `#terminal` | Recent terminal output |
| `#problems` | Current file problems |
| `#url` | Web documentation |
| `#code` | Code snippets |
| `#repository` | Repo structure map |
| `#current` | Active file |
| `#steering` | Specific steering files |
| `#docs` | Documentation files |
| `#spec` | All files from a spec |
| `#mcp` | MCP tools/services |

### Subagents
- Run multiple tasks in parallel
- Two built-in: "context gathering" and "general purpose"
- Each has own context window (doesn't pollute main agent)
- Results automatically returned to main agent
- **Steering and MCP work in subagents**
- **Specs do NOT work in subagents**
- **Hooks do NOT trigger in subagents**

### Other Chat Features
- **Autopilot** — Smart intent detection (info vs action requests)
- **Dev Servers** — Long-running processes in background
- **Diagnostics** — IDE diagnostic integration
- **Notifications** — Agent activity notifications
- **Checkpoints** — Save/restore conversation state
- **Summarization** — Context window management
- **Web Tools** — Web search and browsing

---

## 10. Autonomous Agent

- Works independently in isolated sandbox environments
- Operates asynchronously (no need for IDE to be open)
- Connected to GitHub for PR/issue handling
- Learns from code reviews
- Preview feature (Pro, Pro+, Power users)
- Configurable sandbox: internet access, environment variables, MCP servers

---

## 11. CLI Overview

### Installation
```bash
curl -fsSL https://cli.kiro.dev/install | bash
cd my-project && kiro-cli
```

### Core Features
- Interactive chat with model selection
- Custom agents with full configuration
- MCP integration (local + remote servers)
- Smart hooks (lifecycle triggers)
- Agent steering (workspace + global)
- Auto-complete
- Code intelligence
- Knowledge base resources (indexed docs)
- Subagents and delegation
- Session management

### Experimental Features
- Knowledge management
- Tangent mode
- Todo lists
- Extended thinking
- Checkpointing
- Delegate (spawn sub-tasks)

### CLI Commands Reference
- `/agent generate` — Create new agent
- `/agent swap` — Switch agents
- `/agent list` — List available agents
- Standard slash commands for chat management

---

## 12. Tool Decision Matrix

| Scenario | Primary Tool | Why | Alternatives |
|----------|-------------|-----|-------------|
| **Project coding standards** | Steering | Always-loaded, shapes all interactions | Skills (if portable) |
| **Automated code review on save** | Hook (File Save) | Event-driven, automatic | Manual review |
| **External API integration** | Power (with MCP) | Bundles tools + knowledge | Raw MCP + Steering |
| **Reusable team workflow** | Skill | Portable, open standard | Steering |
| **CI/CD pipeline automation** | Custom Agent (CLI) | Terminal-based, scriptable | Hook |
| **Complex multi-step feature** | Spec | Structured requirements → tasks | Vibe mode |
| **One-off quick change** | Vibe chat | Fast, conversational | Spec |
| **Tool/service connection** | MCP Server | Standard protocol | Power (if needs guidance) |
| **Background autonomous work** | Autonomous Agent | Runs without IDE open | CLI agent |
| **Pre-commit validation** | Hook (Agent Stop) | Catches issues before commit | Shell script |
| **Domain-specific guidance** | Power | Keyword-activated context | Multiple steering files |
| **Parallel task execution** | Subagents | Concurrent with isolated context | Sequential chat |

### When to Use What

**Use Steering when:** You need persistent project context that shapes every interaction. Standards, conventions, architecture decisions.

**Use Hooks when:** You want automatic responses to IDE events. File saves, agent completions, tool invocations.

**Use Skills when:** You have portable, reusable workflows. Code review checklists, deployment procedures, analysis pipelines.

**Use Powers when:** You need MCP tools bundled with domain knowledge. External service integrations with best practices.

**Use Custom Agents when:** You want specialized CLI behavior. Restricted tool access, custom prompts, dedicated resources.

**Use Specs when:** You're building complex features. Multi-step implementation with requirements tracking.

**Use MCP when:** You need to connect to external tools/data. APIs, databases, documentation servers.

---

## 13. Configuration File Reference

### File Paths Summary

| Tool | IDE Location | CLI Location | Format |
|------|-------------|-------------|--------|
| Steering | `.kiro/steering/*.md` | `.kiro/steering/*.md` | Markdown with YAML frontmatter |
| Hooks | `.kiro/hooks/*.kiro.hook` | Agent config `hooks` field | JSON |
| Skills | `.kiro/skills/<name>/SKILL.md` | `.kiro/skills/<name>/SKILL.md` | Markdown with YAML frontmatter |
| Powers | Installed via marketplace | N/A (IDE only) | POWER.md + mcp.json + steering/ |
| MCP | `.kiro/settings/mcp.json` | `.kiro/settings/mcp.json` | JSON |
| Agents | N/A (IDE uses powers) | `.kiro/agents/<name>.json` | JSON |
| Specs | `.kiro/specs/<name>/` | N/A (IDE only) | Markdown (3 files) |
| Settings | `.kiro/settings/settings.json` | `~/.kiro/settings/` | JSON |
| AGENTS.md | Workspace root | Workspace root | Markdown |

### Global Locations
- `~/.kiro/steering/` — Global steering files
- `~/.kiro/skills/` — Global skills
- `~/.kiro/agents/` — Global CLI agents
- `~/.kiro/settings/mcp.json` — Global MCP config

---

## 14. Directory Structure Reference

### Standard Kiro Workspace
```
.kiro/
├── settings/
│   ├── mcp.json           # MCP server config
│   └── settings.json      # IDE settings
├── steering/
│   ├── product.md         # Product overview
│   ├── tech.md            # Technology stack
│   ├── structure.md       # Project structure
│   └── custom-rules.md    # Custom conventions
├── hooks/
│   ├── lint-on-save.kiro.hook
│   └── security-review.kiro.hook
├── skills/
│   └── pr-review/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── specs/
│   ├── user-auth/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   └── shopping-cart/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── agents/                # CLI only
    └── backend-specialist.json
```

### Power Directory
```
power-name/
├── POWER.md
├── mcp.json
└── steering/
    ├── workflow-a.md
    └── workflow-b.md
```

### Skill Directory (Agent Skills Spec)
```
skill-name/
├── SKILL.md           # Required (frontmatter + instructions)
├── scripts/           # Optional (executable code)
├── references/        # Optional (detailed docs)
└── assets/            # Optional (templates, data)
```

---

## 15. Agent Skills Specification

> Source: agentskills.io — the open standard for portable agent skills.

### Name Validation Rules
- 1-64 characters
- Lowercase letters, numbers, and hyphens only (`a-z`, `0-9`, `-`)
- Must not start or end with `-`
- Must not contain consecutive hyphens (`--`)
- Must match parent directory name

### Description Rules
- 1-1024 characters
- Must describe both what the skill does AND when to use it
- Include specific keywords for agent matching

### Progressive Disclosure
1. **Metadata** (~100 tokens) — name + description at startup
2. **Instructions** (<5000 tokens recommended) — full SKILL.md on activation
3. **Resources** (as needed) — scripts/, references/, assets/ on demand

### Validation
```bash
skills-ref validate ./my-skill
```

### File Reference Convention
Use relative paths from skill root. Keep references one level deep.

### Best Practices
- Keep SKILL.md under 500 lines
- Move detailed reference material to separate files
- Scripts should be self-contained with helpful error messages
- Write precise descriptions with specific keywords
- Use scripts for deterministic tasks (validation, file generation, API calls)
