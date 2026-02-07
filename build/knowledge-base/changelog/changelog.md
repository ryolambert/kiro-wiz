---
title: "Changelog"
sourceUrl: "https://kiro.dev/changelog/"
category: "changelog"
lastUpdated: "2026-02-07T05:51:58.181Z"
---
Added support for Claude Opus 4.6 — Anthropic's most powerful model and the world's best for coding. Opus 4.6 excels on large-scale codebases and long-horizon projects, making it ideal for spec-driven development and sophisticated agents. Available with experimental support in both the [Kiro IDE](https://kiro.dev/) and [Kiro CLI](https://kiro.dev/cli/) for Pro, Pro+, and Power tier subscribers with a 2.2x credit multiplier. Restart your IDE to access it from the model selector.

This release brings powerful new ways to customize and extend Kiro's agentic capabilities. Define your own specialized subagents, import portable skill packages from the community, and intercept tool invocations with new hook triggers. Enterprise customers also get new governance controls for web tools.

## Custom Subagents

Define your own specialized agents to handle specific tasks in your workflow. Create a markdown file in **~/.kiro/agents** (global) or **.kiro/agents** (workspace) with a system prompt and optional attributes like model selection, tool access, and MCP server integration. Kiro automatically selects the right custom agent based on its description, or you can invoke one explicitly. [Learn more ->](https://kiro.dev/docs/chat/subagents/#custom-subagents)

## Agent Skills

Import and create portable instruction packages following the open [Agent Skills](https://agentskills.io/) standard. Skills bundle instructions, scripts, and templates that Kiro activates on-demand when relevant to your task. Share skills across projects or import them from the community. [Learn more ->](https://kiro.dev/docs/skills/)

## Pre and Post Tool Use Hooks

New hook triggers let you intercept agent tool invocations. Pre Tool Use hooks can block certain tools or provide additional context before execution. Post Tool Use hooks enable logging, code formatting, or follow-up instructions after a tool runs. Filter by tool categories (read, write, shell, web) or specific tool names with wildcard support. [Learn more -> ](https://kiro.dev/docs/hooks/types/#pre-tool-use)

## Web Tools Governance

Pro-tier customers using IAM Identity Center can now control web tools access for their organization. Administrators can disable web search and web fetch tools from the AWS console under Settings > Shared settings. [Learn more -> ](https://kiro.dev/docs/chat/webtools/)

### Improvements

### Fixes

This release adds Agent Client Protocol (ACP) support for integrating Kiro into ACP-compatible IDEs and clients, a Help Agent for instant CLI guidance, and a range of tool and configuration improvements.

## Agent Client Protocol (ACP) Support

ACP-compatible editors like JetBrains IDEs and Zed can now use Kiro as a custom agent. Run **kiro-cli acp** to start Kiro as an ACP-compliant agent that communicates over stdin/stdout using JSON-RPC. Kiro supports standard ACP methods plus extensions for slash commands, MCP tools, and session management. [Learn more -> ](https://kiro.dev/docs/cli/acp/)

## Help Agent

Get instant answers about Kiro CLI without leaving your conversation. The built-in Help Agent uses documentation to answer questions about commands, tools, settings, and configuration — and can even create config files in .kiro/ for you. Use **/help** to switch to the Help Agent, or **/help How do I configure MCP? to ask directly**. [Learn more ->](https://kiro.dev/docs/cli/chat/help-agent/)

## Enterprise Web Tools Governance

Administrators can now disable **web_search** and **web_fetch** tools organization-wide. Users see a notification in /tools when web access is disabled by their organization. [Learn more ->](https://kiro.dev/docs/cli/enterprise/settings/#web-tools)

## Subagent Access Control

New **availableAgents** and **trustedAgents** settings give fine-grained control over which agents can be spawned as subagents. Both support glob patterns like **test-***. [Learn more -> ](https://kiro.dev/docs/cli/chat/subagents/#configuring-subagent-access)

## Exit Codes for CI/CD

Kiro CLI now returns structured exit codes for automation. Use **--require-mcp-startup** to exit with code 3 when MCP servers fail to start — ideal for CI/CD pipelines that depend on MCP tools. [Learn more ->](https://kiro.dev/docs/cli/reference/exit-codes/)

### Improvements

### Fixes

This release introduces web tools for searching and fetching content from the internet, enhanced hooks with new action types, subagents for parallel task execution, and improved supervised mode with per-file review capabilities.

## Web tools

Kiro can now search the web and fetch content from URLs directly in chat. Use web tools to look up current documentation, find the latest library versions, or research solutions to technical problems. This keeps your development workflow in one place without switching to a browser.

## Contextual hooks

Introducing contextual hooks with two new triggers: Prompt Submit and Agent Stop. These hooks fire at key moments in the agent workflow, letting you inject context or run commands before the agent acts. Choose between Agent Prompt actions to instruct the agent with natural language, or Shell Command actions to run commands locally without consuming credits.

## Subagents

Introducing subagents for parallel task execution. Kiro can now run multiple tasks simultaneously or delegate to specialized subagents. Two built-in subagents are available: a context gatherer for exploring projects and a general-purpose agent for parallelizing tasks. Each subagent has its own context window, keeping the main agent context clean. Use subagents to investigate multiple data sources in parallel, analyze GitHub issues across repositories, or extend your context window limits without requiring summarization.

## Enhanced Supervised Mode

Supervised mode now offers granular control over code changes with per-file review capabilities. When Kiro makes changes to multiple files, you can review each file individually and selectively accept or reject changes. This turn-based approach works in both vibe chat and spec chat sessions, giving you full visibility into each modification.

### Improvements

### Fixes

### Patches

This release brings custom diff tools, built-in code intelligence for 18 languages, skills for progressive context loading, remote authentication, granular web_fetch tool permissions, and conversation compaction to keep long sessions running smoothly.

## Progressive Context Loading with Skills

Skills are a new resource type designed for large documentation sets. Only metadata (name and description) loads at startup — full content loads on demand when the agent needs it. Skill files require YAML frontmatter with descriptive metadata. Write specific descriptions so the agent reliably knows when to load the full content. [Learn more ->](https://kiro.dev/docs/cli/custom-agents/configuration-reference/#skill-resources)

## Custom diff tools

View code changes your way. Configure external diff tools like delta, difftastic, or VS Code instead of the built-in inline diff. Set your preference with `chat.diffTool` in your settings. Popular options include delta for syntax highlighting with side-by-side view, difftastic for structural diffs that understand code syntax, and GUI diff tools for visual comparison. [Learn more ->](https://kiro.dev/docs/cli/chat/diff-tools/)

## Precise Refactoring with AST Pattern Tools

New **pattern-search** and **pattern-rewrite** tools let the agent find and transform code using syntax-tree patterns rather than text regex. No more false matches on string literals or comments.

## Improved Code Intelligence

Out-of-the-box code understanding for 18 languages — no LSP setup required. Agents can now search symbols, navigate definitions, and perform structural code searches immediately. The new **/code overview** command gives you a complete picture of any workspace in seconds. Use **--silent** for cleaner output when diving into unfamiliar packages. Built-in support includes Bash, C, C++, C#, Elixir, Go, Java, JavaScript, Kotlin, Lua, PHP, Python, Ruby, Rust, Scala, Swift, TSX, and TypeScript. [Learn more ->](https://kiro.dev/docs/cli/code-intelligence/)

## Conversation Compaction

Free up context space with the **/compact** command. When you're approaching context limits, compaction summarizes your conversation history while preserving key information. Compaction also triggers automatically when your context window overflows. Configure retention with **compaction.excludeMessages** (minimum message pairs to keep) and **compaction.excludeContextWindowPercent** (minimum % to retain). Compaction creates a new session — resume the original anytime via **/chat resume**. [Learn more ->](https://kiro.dev/docs/cli/chat/context/#conversation-compaction)

## Granular URL Permissions for web_fetch tool

Control which URLs agents can access through your agent configuration. Use regex patterns to auto-allow trusted domains or block specific sites. Blocked patterns take precedence over trusted ones. URLs not matching trusted patterns will prompt for approval. [Learn more ->](https://kiro.dev/docs/cli/reference/built-in-tools/#web-search-and-fetch)

## Remote Authentication

Sign in with Google or GitHub when running Kiro CLI on remote machines. Whether you're connected via SSH, SSM, or containers, authentication now works with port forwarding. For Builder ID and IAM Identity Center, device code authentication works out of the box — just enter the URL and code in your local browser. [Learn more ->](https://kiro.dev/docs/cli/authentication/#sign-in-from-a-remote-machine)

### Improvements

### Fixes

This release introduces subagents for delegating complex tasks with live progress tracking, a built-in Plan agent for breaking down complex tasks into structured implementation plans, new grep and glob tools for fast file searching, multi-session support with an interactive session picker, and MCP registry support for governance.

## Subagents

Delegate complex tasks to specialized agents with live progress tracking. Subagents run autonomously with their own context, enabling parallel task execution while keeping the main agent context focused. A default subagent is included for general-purpose tasks. You can also spawn subagents using your own agent configurations, allowing you to create specialized subagents tailored to specific workflows. Subagents have access to core tools including file read/write, shell commands, and MCP tools.

This feature introduces a new built-in tool: **subagent**. If you have an existing agent configuration that restricts available tools, add **subagent** to your allowed tools list.

## Plan agent

The Plan agent is a specialized built-in agent that transforms ideas into structured implementation plans. Access it with **Shift + Tab** or the **/plan** command. Here's the workflow:

1. Requirements gathering - Structured questions with multiple choice options to refine your idea
2. Research & analysis - Explores your codebase using code intelligence, grep, and glob tools
3. Implementation plan - Creates detailed task breakdowns with clear objectives and demo descriptions
4. Handoff - Transfers the approved plan to the execution agent

The Planning agent operates in read-only mode—it can explore your codebase but cannot modify files, keeping focus on planning.

## Grep and Glob Tools

Two new built-in tools for fast file searching:

- grep - Fast content search using regex. Respects `.gitignore`. Use instead of `grep`, `rg`, or `ag` commands in bash.
- glob - Fast file discovery using glob patterns. Respects `.gitignore`. Use instead of `find` command in bash.

Both tools are trusted by default in the current working directory and can be configured with allowedPaths and deniedPaths in your agent configuration.

## Multi-Session Support

Work across multiple chat sessions with the new interactive session picker:

- kiro-cli chat --resume-picker - Open the session picker from command line
- kiro-cli chat --list-sessions - List all saved sessions
- /chat resume - Open session picker from within a chat

Sessions are automatically saved on every turn. The picker shows session name, last activity, and message preview.

## MCP Registry Support

MCP registry support adds governance capabilities for MCP tools. Organizations can manage and control which MCP tools are available, ensuring consistency and security across teams.

### Patches

We've added support for Claude Opus 4.5 to AWS IAM Identity Center users in both **us-east-1** and **eu-central-1** regions. Claude Opus 4.5 is available in both the [Kiro IDE](/docs/chat/model-selection/#claude-opus-45) and [Kiro CLI](/docs/cli/chat/model-selection/#claude-opus-45) for Pro, Pro+, and Power tier subscribers.

This release introduces Powers for dynamic MCP tool loading, conversation summarization to manage context windows, and slash commands for quick access to hooks and steering files.

## Powers

Introducing [Powers](/docs/powers/), a new way to give Kiro's agent instant expertise for any framework or tool. Powers package MCP servers, steering files, and hooks into reusable bundles that activate on-demand based on your conversation context. Instead of loading all MCP tools upfront and overwhelming your context window, powers load dynamically when you mention relevant keywords. Browse curated powers from launch partners including Datadog, Dynatrace, Figma, Neon, Netlify, Postman, Supabase, Stripe, and more—or [create your own](/docs/powers/create/).

## Summarization

Adds automatic [conversation summarization](/docs/chat/summarization/) to manage long conversations. When your conversation reaches 80% of the model's context window limit, Kiro automatically summarizes previous messages to bring context usage back below the limit. A new context usage meter in the chat panel shows what percentage of the model's context is being used.

## Slash commands

Introducing [slash commands](/docs/chat/slash-commands/) for quick access to hooks and steering files directly from the chat input. Type **/** to see available commands and execute them instantly. Hooks with manual triggers and steering files configured with manual inclusion appear in the slash command menu, letting you run tests, sync documentation, or pull in specific guidance on demand.

### Patches

This release introduces code intelligence through LSP integration, knowledge index with agent schema configuration, enhanced auto-compaction, and improved guardrails for file reading.

## Code Intelligence

Introducing [Code Intelligence](/docs/cli/code-intelligence/), bringing Language Server Protocol (LSP) integration to the Kiro CLI. The agent now has access to the same code understanding that powers Kiro IDE—go-to-definition, find references, hover information, and diagnostics. This enables more accurate code navigation, refactoring suggestions, and context-aware assistance across your entire codebase.

## Knowledge Index

Adds Knowledge Index with agent schema configuration for [Knowledge Bases](/docs/cli/experimental/knowledge-management/) and auto-indexing support. Define custom knowledge sources in your agent configuration to give it domain-specific context that automatically stays in sync with your codebase.

### Improvements

### Fixes

Kiro autonomous agent works independently on development tasks, from implementing features to fixing bugs. It operates asynchronously in isolated sandbox environments, learning from your code reviews and building deep understanding of your codebase and patterns.

Kiro autonomous agent is starting to roll out for individual developers in preview to Kiro Pro, Pro+, and Power subscribers. There's no cost during the preview period, and usage is subject to weekly limits. Teams can [join the waitlist](https://pages.awscloud.com/Kiro-autonomous-agent-contact.html) to get early access. [Learn more ->](https://kiro.dev/blog/introducing-kiro-autonomous-agent/)