---
title: "Dev servers - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/dev-servers/"
category: "chat"
lastUpdated: "2026-02-07T05:52:02.493Z"
---
# Dev servers

---

## Overview

Dev server support allows the Kiro agent to run background processes to access long-running terminal commands and background processes. This transforms your development workflow by eliminating context switching and manual terminal management. Instead of juggling multiple terminal windows, starting servers manually, and constantly checking build output, you can ask Kiro to handle it all. Start a dev server, continue your conversation about implementing features, and ask Kiro to validate compilation—all without leaving the chat. You stay focused on building, not managing infrastructure.

## How it works

When you ask Kiro to run a long-running command, it automatically:

1. Creates a dedicated terminal with a descriptive name (e.g., "Kiro: npm run dev")
2. Starts the process in the background
3. Returns control immediately so you can continue working
4. Tracks the process so you can check its status or output anytime

Background processes run in dedicated terminals that are visible in your terminal list, show the command they're running (e.g., "Kiro: npm run dev"), and persist until you stop them or close Kiro.

## Starting a dev server

Simply ask Kiro to run a long-running command in natural language:

- "Start the development server"
- "Run npm run watch"
- "Start the webpack build watcher"

Kiro recognizes common long-running commands and automatically manages them as background processes. The process starts immediately in a dedicated terminal, and you can continue your conversation with Kiro while it runs.

### Process reuse

If you ask Kiro to start a process that's already running (same command in the same directory), it reuses the existing process instead of creating a duplicate. This prevents multiple instances of the same server or watcher from conflicting with each other.

## Monitoring process output

You can ask Kiro to check on your background processes at any time:

- "Check the output of the dev server"
- "What does the npm run watch process show?"
- "Are there any errors in the build watcher?"

Kiro reads the terminal output and can help you:

- Identify compilation errors and suggest fixes
- Confirm successful startup of servers
- Debug issues by analyzing error messages
- Monitor progress of long-running tasks

## Listing active processes

To see all your running background processes:

- "List all background processes"
- "What processes are running?"

Kiro shows you each process with its command, working directory, and current status.

## Stopping a process

When you're done with a background process:

- "Stop the development server"
- "Terminate the npm run watch process"
- "Kill all background processes"

Kiro terminates the process and closes its terminal, cleaning up resources.

## Automating with Steering

You can configure Kiro to automatically check background processes as part of your workflow using [steering rules](/docs/steering). For example:

```markdown
# Development Workflow

After making code changes:
1. Always check the output of the `npm run dev` process
2. Look for compilation errors or warnings
3. If errors exist, suggest fixes before proceeding

```

This ensures Kiro validates your changes against the dev server automatically, catching errors faster.

## Combining with code diagnostics

Background processes work alongside Kiro's code diagnostics tool to give you complete validation coverage. While your dev server or build watcher catches runtime compilation issues, diagnostics surface static analysis problems like type errors and lint warnings—all in one conversation.

Ask Kiro to check both at once: **"Check the build watcher output and show me any TypeScript errors"**

This dual-layer approach means you catch issues faster without switching between terminals and your IDE's problems panel. Everything you need to validate your changes is available through chat.

## Common use cases

**Development servers** - Keep your Next.js, React, or other framework dev server running while you code. Check output after changes to confirm successful compilation.

**Build watchers** - Run webpack, TypeScript, or other build tools in watch mode. Validate that your changes compile without errors.

**Test runners** - Start test watchers to get continuous feedback. Review results anytime to see which tests pass or fail.

## Troubleshooting

### Process won't start

If a background process fails to start, check the terminal output for error messages, verify the command is correct, and ensure dependencies are installed.

### Can't find process output

If Kiro can't read process output, make sure the process is still running by checking your terminal list.

### Multiple processes conflict

If you have port conflicts, list all running processes to identify duplicates and stop unnecessary ones. Kiro automatically reuses existing processes when possible.