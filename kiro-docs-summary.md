# Kiro Documentation Summary

## Guides

### 1. Guides Overview

[Source](https://kiro.dev/docs/guides/)

Kiro is an agentic IDE for spec-driven development. Core
features: specs (requirements → design → tasks), steering
files, hooks, and MCP servers. Guides cover language support,
a hands-on game tutorial, and VSCode migration.

### 2. Language Support Overview

[Source](https://kiro.dev/docs/guides/languages-and-frameworks/)

Kiro provides AI-assisted development across multiple
languages. Dedicated guides exist for TypeScript/JavaScript,
Python, and Java. Kiro supports extensions from Open VSX
to enhance language-specific workflows.

### 3. TypeScript and JavaScript Guide

[Source](https://kiro.dev/docs/guides/languages-and-frameworks/typescript-javascript-guide/)

**Prerequisites:** Node.js (latest), TypeScript, npm, Git.

**Recommended Extensions:**

- ESLint — real-time linting
- Prettier — auto-formatting
- Auto Rename Tag — paired HTML/JSX tag renaming
- JavaScript (ES6) code snippets

**AI Capabilities:**

- Code quality analysis, refactoring assistance, type
  inference (suggest TS types from JS code)
- Error explanation in plain language, solution suggestions,
  runtime debugging config
- Inline chat (`Cmd/Ctrl+I`), add to chat (`Cmd/Ctrl+L`),
  quick fix on hover

**Steering for TS/JS:** Create custom files like
`js-conventions.md` or `react-patterns.md` in
`.kiro/steering/` for naming conventions, component
structure, state management, and performance patterns.

**Hook Examples:** Test generation on save, TypeScript type
checking on save, ESLint auto-fix, component documentation
generation, dependency update checks.

**MCP Integration:** AWS Labs Frontend MCP Server for React
development guidance. Config via `mcp.json`.

**#docs System:** Built-in doc references — `#Node.js`,
`#TypeScript`, `#React`, `#Svelte`, `#Express`, `#Vue.js`,
`#Alpine.js`. Also supports `#URL` for arbitrary doc URLs.

### 4. Python Guide

[Source](https://kiro.dev/docs/guides/languages-and-frameworks/python-guide/)

**Prerequisites:** Python 3.8+, pip, virtual environment
(venv/virtualenv/conda), Git.

**Recommended Extensions:**

- Python (IntelliSense via Pylance, debugging, linting)
- PyLint — linting
- Jupyter — notebook support
- Python Debugger (debugpy)
- Rainbow CSV

**AI Capabilities:**

- PEP 8 compliance review, type hint suggestions,
  async/await conversion
- Traceback explanation, Django/Flask debugging help
- Pandas performance analysis

**Steering for Python:** Custom files for
`python-conventions.md` (snake_case, Black formatting,
88-char lines), `django-patterns.md` (model design, CBVs,
template organization), `data-science-patterns.md` (notebook
organization, model development, reproducibility).

**Hook Examples:** pytest generation on save, dependency
update checks, flake8/pylint on save, virtual environment
auto-install on `requirements.txt` change.

**#docs System:** `#Python`, `#Pytorch`, `#PySide6`, plus
`#URL` for arbitrary documentation.

### 5. Java Guide

[Source](https://kiro.dev/docs/guides/languages-and-frameworks/java-guide/)

Kiro provides AI-assisted development for Java projects
including writing, debugging, and maintaining code. Supports
Maven and Gradle build systems. Java 17 LTS or higher
recommended for latest language features and performance.

### 6. Learn by Playing

[Source](https://kiro.dev/docs/guides/learn-by-playing/)

**Spirit of Kiro** — an infinite crafting game (95% written
by prompting Kiro) used as a hands-on tutorial.

**Game Features:**

- Discover randomly generated objects
- Combine items via simulated interactions (cut, paint,
  glue, enchant)
- Sell creations to an AI appraiser

**Tutorial Structure:**

- Setup: local game client/server connected to AWS account
  (requires Docker Desktop or Podman)
- Tasks teach steering, vibe coding, specs, hooks, and MCP
- Lessons include: improving the homepage, fixing bugs,
  adding features, extending with MCP

### 7. Migrating from VSCode

[Source](https://kiro.dev/docs/guides/migrating-from-vscode/)

Kiro is built on the same foundation as VSCode, so migration
is straightforward.

**Profile Import:**

1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Select "Preferences: Open Profiles (UI)"
3. Open dropdown beside New Profile → Import Profile
4. Provide GitHub Gist URL or browse local export file

Extensions, settings, keybindings, and snippets transfer
via VSCode profile export/import.

---

## CLI Documentation

### 8. CLI Get Started

[Source](https://kiro.dev/docs/cli/)

Kiro CLI brings AI-assisted development to the terminal.
Build, test, and deploy using natural language commands and
automated workflows. Successor to Amazon Q Developer CLI.

**Key Features:**

- Interactive AI chat in terminal
- Custom agents for specialized workflows
- Steering files for persistent project context
- MCP server support (local and remote)
- Hooks for automation
- Auto agent (dynamically selects optimal model)
- Multimodal input (images, screenshots, diagrams)
- Credit usage tracking

**Auto Agent:** Default agent that balances speed, cost, and
quality. Tasks cost ~1x credits vs 1.3x for manual Sonnet 4
selection.

### 9. Installation

[Source](https://kiro.dev/docs/cli/installation/)

**Quick Install (macOS/Linux):**

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

**Homebrew (macOS):**

```bash
brew install kiro-cli
```

**Linux ZIP (aarch64):**

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  'https://desktop-release.q.us-east-1.amazonaws.com/latest/kirocli-aarch64-linux.zip' \
  -o 'kirocli.zip'
unzip kirocli.zip
bash ./kirocli/install.sh
```

**Requirements:** glibc 2.34+ (most distros since 2021).
musl variant available for Alpine/older distros.

**Verify:** `kiro-cli version`

**Diagnostics:** `kiro doctor` checks environment config.

**Upgrade from Q Developer CLI:** Auto-update migrated on
Nov 24, 2025. Manual: `q update` or check for updates.

### 10. Authentication Methods

[Source](https://kiro.dev/docs/cli/authentication/)

**Four methods supported:**

1. **GitHub** — seamless social login
2. **Google** — social login
3. **AWS Builder ID** — device code auth (URL + code in
   browser, no extra setup)
4. **AWS IAM Identity Center** — enterprise-grade,
   centralized management via AWS Management Console

Builder ID and IAM Identity Center use device code
authentication flow. Social logins (GitHub/Google) redirect
to browser.

**Enterprise:** IAM Identity Center enables admins to assign
subscription tiers, track spending, and consolidate billing.

### 11. Chat

[Source](https://kiro.dev/docs/cli/chat/)

Interactive chat mode for natural conversations with AI
directly in terminal.

**Start:** `kiro-cli chat`

**Key Commands:**

- `/model` — list/switch models (Auto, claude-sonnet-4.5,
  claude-sonnet-4, claude-haiku-4.5)
- `/context` — show context sources and usage percentage
- `/context add <file>` — add file to session context
- `/editor` — open text editor for multi-line prompts
- `/tools` — list available tools (including MCP)
- `/code overview` — complete workspace picture

**Context Management:**

- Agent Resources — persistent across sessions
- Session Context — temporary files
- Knowledge Bases — semantic search for large codebases
  (supports PDFs), doesn't consume context window

**Models and Credits:**

| Model | Credit Multiplier |
|---|---|
| Auto | 1x |
| claude-sonnet-4.5 | 1.3x |
| claude-sonnet-4 | 1.3x |
| claude-haiku-4.5 | 0.4x |

### 12. Custom Agents Overview

[Source](https://kiro.dev/docs/cli/custom-agents/)

Custom agents customize Kiro behavior for specific use
cases. Each agent is defined by a configuration file
specifying tools, permissions, and context.

**Use Cases:** Backend specialist, frontend expert, DevOps
agent, code review agent, debugging agent.

**Key Capabilities:**

- Pre-approved tools (no permission prompts)
- Persistent context (auto-load project files/docs)
- Controlled access (limit available tools)
- File path restrictions
- Workflow-specific configurations

**Invocation:** `kiro-cli chat --agent <agent-name>`

**Subagents:** Spawn specialized subagents from within an
agent session. Default subagent included for general tasks.
Subagents access core tools (file read/write, shell, MCP).

### 13. Creating Custom Agents

[Source](https://kiro.dev/docs/cli/custom-agents/creating/)

Custom agents tailor Kiro CLI behavior by defining available
tools, permissions, and auto-included context.

**Configuration File:** TOML format, placed in project or
global config directory.

**Key Sections:**

- `allowedTools` — tools usable without prompting
- `toolsSettings` — per-tool configuration
- `resources` — files/docs auto-loaded as context
- `hooks` — commands at specific trigger points
- System prompt / instructions

**External Prompts:** Reference external files using
`file://` URIs for long/complex prompts, keeping config
clean.

**Permission Patterns:**

- `@builtin` namespace — pre-approve all built-in tools
- Individual tool specification for precise control
- File path restrictions (e.g., `src/api/**`, `server.js`)

### 14. Agent Configuration Reference

[Source](https://kiro.dev/docs/cli/custom-agents/configuration-reference/)

**Top-Level Fields:**

- `allowedTools` — tools that run without prompting
- `toolsSettings` — configuration for specific tools
- `resources` — resources available to the agent
- `hooks` — commands at specific trigger points

**External File References:** Use `file://` URIs for
maintaining long prompts in separate files for better
organization and version control.

**Tool Permission Granularity:**

- `@builtin` — all built-in tools
- Individual tool names for fine-grained control
- Read tool can be configured with specific file/folder
  access patterns

### 15. Model Context Protocol (MCP)

[Source](https://kiro.dev/docs/cli/mcp/)

MCP allows Kiro to communicate with external servers for
specialized tools and information.

**Transport Protocols:**

- **stdio** — local MCP servers (subprocess communication)
- **Streamable HTTP** — remote servers (SSE streaming,
  resumability, session management)
- **HTTP+SSE** — deprecated but still supported

**Configuration:** `~/.kiro/settings/mcp.json` or
`.kiro/settings/mcp.json` (project-level).

**Example Config (stdio):**

```json
{
  "mcpServers": {
    "server_name": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "image:latest"],
      "env": {},
      "timeout": 60000
    }
  }
}
```

**Remote MCP Features:**

- Dynamic client registration (OAuth-style browser auth)
- Environment variables via `${ENV_VAR}` syntax
- Security prompt for new env var access
- One-click "Add to Kiro" button for curated servers

**IDE ↔ CLI Parity:** Same `mcp.json` config works in both
Kiro IDE and Kiro CLI.

### 16. Steering (CLI)

[Source](https://kiro.dev/docs/cli/steering/)

Steering provides persistent AI context through markdown
files. Replaces re-explaining conventions every chat.

**File Locations:**

- **Global:** `~/.kiro/steering/` — applies to all
  workspaces
- **Workspace:** `.kiro/steering/` — project-specific

**Default Files (auto-generated):**

- `product.md` — product purpose, users, features
- `tech.md` — frameworks, libraries, constraints
- `structure.md` — file organization, naming, architecture

**Inclusion Modes (via YAML front matter):**

- **Always (default)** — loaded every interaction
- **Conditional** — loaded when working with matching file
  patterns (e.g., `"*.tsx"`, `"app/api/**/*"`,
  `"**/*.test.*"`)
- **Manual** — on-demand via `#steering-file-name` in chat

**File References:** Link live project files with
`#[[file:path/to/file]]` syntax.

**Team Distribution:** Global steering files can be pushed
via MDM solutions, Group Policies, or downloaded from a
central repository.

**Compatibility:** Also supports `AGENTS.md` standard at
`~/.kiro/steering/` or workspace root.

### 17. Hooks (CLI)

[Source](https://kiro.dev/docs/cli/hooks/)

Hooks execute custom commands at specific points during
agent lifecycle and tool execution.

**Use Cases:** Security validation, logging, formatting,
context gathering, automated testing.

**Hook Types (IDE):**

- **On File Create** — new files matching patterns
- **On File Save** — saved files matching patterns
- **On File Delete** — deleted files matching patterns
- **Manual Trigger** — on-demand execution

**Hook Types (CLI — agent config):**

- **preToolUse** — before tool execution
- **postToolUse** — after tool execution
- Event-based triggers in agent configuration

**Three-Step Process:**

1. Event Detection — monitors IDE/CLI events
2. Prompt Execution — sends predefined prompt to agent
3. Automated Action — agent performs requested actions

**Management (IDE):**

- Create via Kiro panel (+) or Command Palette
- Toggle enable/disable with eye icon
- Edit settings (triggers, patterns, instructions)
- Run manual hooks with play button (▷)

**Practical Examples:**

- Security pre-commit scanner (scan for API keys, SQL
  injection, XSS)
- Internationalization helper (sync locale files)
- Documentation generator (on-demand)
- Test coverage maintainer (on save)

**MCP Integration:** Hooks can leverage MCP servers for
enhanced context and domain-specific knowledge (e.g.,
validate Figma designs via Figma MCP).

### 18. Agent Client Protocol (ACP)

[Source](https://kiro.dev/docs/cli/acp/)

ACP is an open standard (originated by Zed Industries) that
standardizes communication between code editors/IDEs and AI
coding agents.

**Key Facts:**

- JSON-RPC based protocol over stdio
- Similar to Language Server Protocol (LSP) but for AI
  agents instead of language tools
- Vendor-neutral: any ACP-compliant agent works with any
  ACP-compliant editor
- Decouples agents from editors (like LSP decoupled
  languages from editors)

**Capabilities:**

- Agents and clients communicate via exposed methods and
  event notifications
- Enables switching between different AI agents (Claude,
  Gemini, etc.) within the same editor
- Kiro CLI supports ACP for integration with external
  editors and tools

**Ecosystem:** Supported by Zed, Kiro, Gemini CLI, Obsidian
plugins, and growing. SDKs available in Rust and Python.

---

## Cross-Cutting Themes

**IDE ↔ CLI Parity:** `.kiro/` folder config (steering,
MCP, settings) works in both Kiro IDE and Kiro CLI.
Configure once, use everywhere.

**Spec-Driven Development:** Requirements (EARS notation) →
Design (architecture, sequence diagrams) → Tasks (trackable
implementation plan). Three files: `requirements.md`,
`design.md`, `tasks.md`.

**Authentication:** Four methods — GitHub, Google, AWS
Builder ID, AWS IAM Identity Center. Enterprise billing
via IAM Identity Center.

**Models:** Auto (default, optimal selection), Sonnet 4.5
(1.3x), Sonnet 4 (1.3x), Haiku 4.5 (0.4x).

*Content was rephrased for compliance with licensing
restrictions. All sources linked inline.*
