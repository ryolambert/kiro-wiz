---
title: "Slash commands - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/slash-commands/"
category: "chat"
lastUpdated: "2026-02-07T05:52:02.090Z"
---
# Slash commands

---

Slash commands let you run [hooks](/docs/hooks) and pull in [steering files](/docs/steering) on demand, directly from the chat. Type `/` in the chat input to see available commands and execute them instantly.

## Command types

### Hooks

[Hooks](/docs/hooks) with manual triggers appear in the slash command menu. When you select a hook, Kiro executes it immediately in your current session. Here are some examples of hooks you might create:

| Command | Description |
| --- | --- |
| /sync-source-to-docs | Syncs source file changes to documentation |
| /run-tests | Executes your configured test suite |
| /generate-changelog | Creates changelog from recent commits |

### Steering files

[Steering files](/docs/steering) configured with [manual inclusion](/docs/steering#manual-inclusion) appear as slash commands. Unlike always-on steering that's automatically included in every conversation, manual steering files let you pull in specific guidance only when you need it. When selected, the file's contents are added to your current conversation context. Here are some examples:

| Command | Description |
| --- | --- |
| /accessibility | Accessibility guidelines for UI components |
| /code-review | Code review checklist and feedback principles |
| /performance | React and Next.js performance optimization tips |
| /refactor | Refactoring rules and common patterns |
| /testing | Testing standards and Jest/RTL conventions |

## How it works

### Adding hooks

To add a hook as a slash command, set its trigger type to **Manual**. See [Hook types](/docs/hooks/types) for details.

### Adding steering files

To add a steering file as a slash command, set `inclusion: manual` in the frontmatter. See [Steering](/docs/steering#manual-inclusion) for configuration options.

### Using slash commands

1. Type / in the chat input field
2. Browse or search the available commands
3. Select a command and press Enter

## Best practices

- Use descriptive names — Clear names like /run-e2e-tests or /accessibility make commands easy to find
- Context switching — Create steering files for different workflows (frontend, backend, testing) and switch between them as needed
- Combine with # providers — Slash commands work alongside context providers for maximum control