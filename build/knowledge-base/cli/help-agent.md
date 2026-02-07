---
title: "Help Agent - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/chat/help-agent/"
category: "cli"
lastUpdated: "2026-02-07T05:52:20.174Z"
---
# Help Agent

---

The Help Agent is a built-in agent that answers questions about Kiro CLI features, commands, tools, and configuration. Unlike general AI responses, answers come from actual Kiro CLI documentation. It can also create agents, prompts, and LSP configs in your `.kiro/` directory.

## Quick start

Switch to the Help Agent:

```
> /help
✔ Switched to agent: kiro_help

[help] > 

```

Or ask a question directly:

```
> /help How do I configure MCP servers?

```

Use `/help --legacy` for the classic command listing.

## What you can ask

The Help Agent has access to comprehensive Kiro CLI documentation:

- Commands: Slash commands (/chat, /agent, /context) and CLI commands (kiro-cli chat, kiro-cli settings)
- Tools: Built-in tools like fs_read, code, grep, glob
- Settings: Any setting available via kiro-cli settings
- Features: Tangent Mode, Hooks, MCP, Code Intelligence, Subagents
- Shortcuts: Keyboard shortcuts and how to use them

## Creating configuration

The Help Agent can create and modify files in `.kiro/` directories:

```
[help] > Create an agent for writing tests

✔ Created .kiro/agents/test-writer.yaml

I've created a test-writing agent. Switch to it with:
/agent swap test-writer

```

It can create:

- Agents in .kiro/agents/
- Prompts in .kiro/prompts/
- LSP configs in .kiro/

## Examples

Here are some common questions and how the Help Agent responds.

### Ask about a command

```
[help] > How do I save a conversation?

Use `/chat save` to save your current conversation:

/chat save ~/my-session.json   # Save to a specific path

Saved conversations can be loaded later with /chat load.

```

### Ask about a tool

```
[help] > What does the code tool do?

The code tool provides code intelligence:

• search_symbols - Find symbol definitions by name
• lookup_symbols - Get details for specific symbols  
• get_document_symbols - List all symbols in a file
• pattern_search - AST-based structural search

It uses AST parsing for accurate code understanding across languages.

```

### Ask about configuration

```
[help] > How do I enable tangent mode?

Enable Tangent Mode with:

kiro-cli settings chat.enableTangentMode true

Or use /tangent during a chat session to toggle it.

```

## Returning to your previous agent

Run `/help` again while in the Help Agent to return to your previous agent:

```
[help] > /help
✔ Switched to agent: kiro_default

```

Or use `/agent swap <name>` to switch to a specific agent.

## Related

- Slash Commands - All available slash commands
- Custom Agents - Create your own agents
- Settings Reference - All configuration options