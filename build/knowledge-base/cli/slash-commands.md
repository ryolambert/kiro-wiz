---
title: "Slash commands - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/reference/slash-commands/"
category: "cli"
lastUpdated: "2026-02-07T05:52:33.945Z"
---
# Slash commands

---

## Overview

Slash commands are special commands you can use within an interactive chat session to quickly perform actions without leaving the conversation. They start with a forward slash (`/`) and provide shortcuts for common tasks.

## Using slash commands

Slash commands are only available in interactive chat mode:

```bash
kiro chat
> /help

```

## Available commands

### /help

Switch to the Help Agent to ask questions about Kiro CLI features, or display classic help text.

```bash
# Switch to Help Agent
> /help

# Ask a question directly
> /help How do I configure MCP servers?

# Show classic help text
> /help --legacy

```

See [Help Agent](/docs/cli/chat/help-agent) for more details.

### /quit

Exit the interactive chat session.

```bash
> /quit

```

Aliases: /exit, /q

### /clear

Clear the current conversation history.

```bash
> /clear

```

Note: This only clears the display, not the saved conversation.

### /context

Manage context files and view context window usage. Context rules determine which files are included in your Kiro session and are derived from the current active agent.

```bash
# Display context rule configuration and matched files
> /context show

# Add context rules (filenames or glob patterns)
> /context add src/app.js
> /context add "*.py"
> /context add "src/**/*.js"

# Remove specified rules
> /context remove src/app.js

# Remove all rules
> /context clear

```

**Available subcommands:**

- show - Display the context rule configuration and matched files
- add - Add context rules (filenames or glob patterns)
- remove - Remove specified rules

**Notes:**

- You can add specific files or use glob patterns (e.g., *.py, src/**/*.js)
- Agent rules apply only to the current agent
- Context changes are NOT preserved between chat sessions. To make changes permanent, edit the agent config file.
- The files matched by these rules provide Kiro with additional information about your project or environment

See [Context Management](/docs/cli/chat/context) for detailed documentation.

### /model

Switch to a different AI model or set your default model preference.

```bash
# Show current model
> /model

# Save current model as default for future sessions
> /model set-current-as-default

```

**Available subcommands:**

- set-current-as-default - Persist your current model selection as the default for all future sessions

**Note:** The `set-current-as-default` command saves your current model preference to `~/.kiro/settings/cli.json`, so it will be used automatically in all future chat sessions.

### /agent

Manage agents and switch between different agent configurations.

```bash
# List all available agents
> /agent list

# Create a new agent
> /agent create my-agent

# Edit an existing agent configuration
> /agent edit my-agent

# Generate an agent configuration using AI
> /agent generate

# Show agent config schema
> /agent schema

# Set default agent for new chat sessions
> /agent set-default my-agent

# Swap to a different agent at runtime
> /agent swap code-reviewer

```

**Available subcommands:**

- list - List all available agents with their descriptions
- create - Create a new agent with the specified name
- edit - Edit an existing agent configuration
- generate - Generate an agent configuration using AI
- schema - Show agent config schema
- set-default - Define a default agent to use when kiro-cli chat launches
- swap - Swap to a new agent at runtime (shows agent descriptions for selection)

**Notes:**

- Agents can be stored globally in ~/.kiro/agents/ or per-workspace in .kiro/agents/
- Launch kiro-cli chat with a specific agent using kiro-cli chat --agent agent_name
- Set default agent with kiro-cli settings chat.defaultAgent agent_name

See [Custom Agents](/docs/cli/custom-agents) for detailed documentation.

### /chat

Manage chat sessions, including saving, loading, and switching between sessions. Kiro CLI automatically saves all chat sessions on every conversation turn.

```bash
# Open interactive session picker to resume a previous session
> /chat resume

# Save current session to a file
> /chat save /myproject/codereview.json

# Load a session from a file
> /chat load /myproject/codereview.json

```

**Available subcommands:**

- resume - Open interactive session picker to choose a session to resume
- save - Save current session to a file
- load - Load a session from a file (.json extension is optional)
- save-via-script - Save session using a custom script (receives JSON via stdin)
- load-via-script - Load session using a custom script (outputs JSON to stdout)

**Notes:**

- Sessions are automatically saved on every conversation turn
- Sessions are stored per directory, so each project has its own set of sessions
- The session picker shows session name, last activity, and message preview
- Use keyboard shortcuts in the picker: ↑/↓ to navigate, Enter to select, / to filter

#### Custom session storage

You can use custom scripts to control where chat sessions are saved to and loaded from. This allows you to store sessions in version control systems, cloud storage, databases, or any custom location.

**Save via script:**

```bash
> /chat save-via-script ./scripts/save-to-git.sh

```

Your script receives the chat session JSON via stdin. Example script to save to Git notes:

```bash
#!/bin/bash
set -ex
COMMIT=$(git rev-parse HEAD)
TEMP=$(mktemp)
cat > "$TEMP"
git notes --ref=kiro/notes add -F "$TEMP" "$COMMIT" --force
rm "$TEMP"
echo "Saved to commit ${COMMIT:0:8}" >&2

```

**Load via script:**

```bash
> /chat load-via-script ./scripts/load-from-git.sh

```

Your script should output the chat session JSON to stdout. Example script to load from Git notes:

```bash
#!/bin/bash
set -ex
COMMIT=$(git rev-parse HEAD)
git notes --ref=kiro/notes show "$COMMIT"

```

### /save

Save the current conversation to a file.

```bash
# Save <PATH>
> /chat save /myproject/codereview.json

```

### /load

Load a previously saved conversation.

```bash
# List available conversations
> /chat load /myproject/codereview.json

```

### /editor

Open your default editor (defaults to vi) to compose a prompt.

```bash
> /editor

```

Opens `$EDITOR` to compose a longer message.

### /reply

Open your editor with the most recent assistant message quoted for reply.

```bash
> /reply

```

Useful for referencing and responding to specific parts of the AI's response.

### /compact

Summarize the conversation to free up context space.

```bash
> /compact

```

Condenses the conversation history while preserving key information, useful when approaching context limits.

### /paste

Paste an image from clipboard.

```bash
> /paste

```

Adds an image from your system clipboard to the conversation.

### /tools

View tools and permissions. By default, Kiro will ask for your permission to use certain tools. You can control which tools you trust so that no confirmation is required.

```bash
# View all tools and their permissions
> /tools

# Show the input schema for all available tools
> /tools schema

# Trust a specific tool for the session
> /tools trust write

# Revert a tool to per-request confirmation
> /tools untrust write

# Trust all tools (equivalent to deprecated /acceptall)
> /tools trust-all

# Reset all tools to default permission levels
> /tools reset

```

**Available subcommands:**

- schema - Show the input schema for all available tools
- trust - Trust a specific tool or tools for the session
- untrust - Revert a tool or tools to per-request confirmation
- trust-all - Trust all tools (equivalent to deprecated /acceptall)
- reset - Reset all tools to default permission levels

**Note:** For permanent tool configuration, see [Agent Configuration Reference](/docs/cli/custom-agents/configuration-reference/#tools-field).

### /prompts

View and retrieve prompts. Prompts are reusable templates that help you quickly access common workflows and tasks. These templates are provided by the MCP servers you have installed and configured.

```bash
# List available prompts from a tool or show all available prompts
> /prompts list

# Show detailed information about a specific prompt
> /prompts details code-review

# Get a specific prompt by name
> /prompts get code-review [arg]

# Quick retrieval (without /prompts prefix)
> @code-review [arg]

# Create a new local prompt
> /prompts create my-prompt

# Edit an existing local prompt
> /prompts edit my-prompt

# Remove an existing local prompt
> /prompts remove my-prompt

```

**Available subcommands:**

- list - List available prompts from a tool or show all available prompts
- details - Show detailed information about a specific prompt
- get - Get a specific prompt by name
- create - Create a new local prompt
- edit - Edit an existing local prompt
- remove - Remove an existing local prompt

**Quick tip:** To retrieve a prompt directly, use `@<prompt name> [arg]` without the `/prompts get` prefix.

See [Manage Prompts](/docs/cli/chat/manage-prompts) for detailed documentation.

### /hooks

View context hooks.

```bash
> /hooks

```

Display active context hooks for the current session.

### /usage

Show billing and credits information.

```bash
> /usage

```

View your current usage statistics and remaining credits.

### /mcp

See MCP servers loaded.

```bash
> /mcp

```

Display Model Context Protocol servers currently active.

### /code

Manage code intelligence configuration and get feedback.

```bash
# Initialize LSP-powered code intelligence in the current directory
> /code init

# Force reinitialization in the current directory - restarts LSP servers
> /code init -f

# Get a complete overview of the workspace
> /code overview

# Get overview with cleaner output
> /code overview --silent

# Get workspace status and LSP server statuses
> /code status

# View LSP logs for troubleshooting
> /code logs # Show last 20 ERROR logs

> /code logs -l INFO            # Show INFO level and above

> /code logs -n 50              # Show last 50 entries

> /code logs -l DEBUG -n 100    # Show last 100 DEBUG+ logs

> /code logs -p ./lsp-logs.json # Export logs to JSON file


```

**Available subcommands:**

- init - Initialize LSP servers for enhanced code intelligence
- overview - Get a complete overview of the workspace structure
- status - Show the detailed status of the LSP servers and workspace status
- logs - View logs

### /experiment

Toggle experimental features.

```bash
> /experiment

```

Enable or disable experimental CLI features.

### /tangent

Create conversation checkpoints to explore side topics.

```bash
> /tangent

```

Enter or exit [tangent mode](/docs/cli/experimental/tangent-mode) to explore tangential topics without disrupting your main conversation. Use `Ctrl+T` as a keyboard shortcut (when tangent mode is enabled).

### /todos

View, manage, and resume to-do lists.

```bash
# View todo
> /todo

# Add todo
> /todo add "Fix authentication bug"

# Complete todo
> /todo complete 1

```

### /issue

Create a new GitHub issue or make a feature request.

```bash
> /issue

```

Opens a workflow to submit issues or feature requests to the Kiro team.

### /logdump

Create a zip file with logs for support investigation.

```bash
> /logdump

```

Generates a diagnostic log bundle for troubleshooting with support.

### /changelog

View changelog for Kiro CLI.

```bash
> /changelog

```

Display recent updates and changes to the CLI.

### Keyboard shortcuts

In interactive mode, you can also use:

- Ctrl+C - Cancel current input
- Ctrl+J - To insert new-line for multi-line prompt
- Ctrl+S - Fuzzy search commands and context files, use tab to select multiple items
- Ctrl+T - Toggle tangent mode for isolated conversations (if Tangent mode is enabled)
- Up/Down arrows - Navigate command history

## Next steps

- Learn about CLI Commands for terminal usage
- Explore Interactive Chat Mode
- Check Context Management for advanced context handling