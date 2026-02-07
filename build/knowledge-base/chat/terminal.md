---
title: "Terminal integration - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/terminal/"
category: "chat"
lastUpdated: "2026-02-07T05:52:02.288Z"
---
# Terminal integration

---

## Overview

Transform your development workflow with Kiro's terminal integration. Instead of memorizing command syntax or switching between windows, describe what you want to accomplish and Kiro translates your requests into executable commands, maintains context across operations, and provides a secure approval system that keeps you in control while managing dependencies, navigating git workflows, or exploring your codebase.

## Getting started

Simply describe what you want to do in natural language. For example:

- "Install the project dependencies"
- "Check the git status"
- "Find all TypeScript files in the src folder"
- "Run the development server"

Kiro translates your request into the appropriate terminal command and asks for your approval before executing. You'll review the suggested command and choose to Modify, Reject, Run, or Run and Trust, then see the output directly in chat.

Long-running commands like [Dev Servers](/docs/chat/dev-servers) are automatically managed by Kiro, running in dedicated terminals without blocking your workflow.

## How it works

When Kiro suggests a command, you have four options:

- Modify - Edit the command before running
- Reject - Cancel execution
- Run - Execute once
- Run and Trust - Execute and trust similar commands in the future

## Command approval and security

For security, Kiro asks for approval before running any command. You can control this behavior through two complementary systems: trusted commands and command denylists.

### Trust commands

You can streamline the approval process by configuring which commands to trust automatically. Trusted commands use **prefix matching** to automatically approve commands that start with specific patterns.

The trust system puts responsibility on you to carefully configure trusted command patterns. Commands with potentially dangerous operations (like `rm -rf`) will be accepted if they match your trusted patterns and are not in the denylist.

Kiro trusted commands uses string prefix matching to determine if a command should be automatically trusted. You can configure trusted commands in `Settings → Kiro Agent: Trusted Commands` at both the user level (global across all workspaces) and workspace level (specific to your current project).

### Exact matching

Checks for the exact base string.

If you have trusted commands list as `["npm install", "git status"]`:

| Command | Result |
| --- | --- |
| npm install | ✅ Trusted and runs automatically |
| git status | ✅ Trusted and runs automatically |
| npm install --save | ❌ Requires approval (not exact match) |
| git status --short | ❌ Requires approval (not exact match) |

### Partial wildcard matching

Uses `*` to match variations of a specific command.

If you have trusted commands list as `["npm install *"]`:

| Command | Result |
| --- | --- |
| npm install | ✅ Trusted (matches "npm install *") |
| npm install --save | ✅ Trusted (matches "npm install *") |
| npm install express | ✅ Trusted (matches "npm install *") |
| npm run build | ❌ Requires approval (doesn't start with "npm install ") |
| npm test | ❌ Requires approval (doesn't start with "npm install ") |

### Full wildcard matching & complex commands

Uses `*` to trust any command string that starts with the specified prefix. The trust system only checks the beginning of the command string - if it matches, the entire command is trusted, including any chained commands, pipes, or redirects that follow.

If you have trusted commands list as `["npm *", "git *"]`:

| Command | Result |
| --- | --- |
| npm install | ✅ Trusted (matches "npm *") |
| npm install --save | ✅ Trusted (matches "npm *") |
| npm run build | ✅ Trusted (matches "npm *") |
| npm run build \| tee log | ✅ Trusted (starts with "npm ") |
| npm install && docker build . | ✅ Trusted (starts with "npm ") |
| git add . && git commit -m "update" | ✅ Trusted (starts with "git ") |
| docker build . | ❌ Requires approval (no matching prefix) |

### Universal trust

Using wildcards (*) in trusted commands is an over-permissive configuration. This automatically approves all terminal commands without review, which can pose significant security risks including data loss, system modifications, or unauthorized access. Only use wildcards if you completely trust the environment and understand all potential commands.

If you have trusted commands list as `["*"]`:

| Command | Result |
| --- | --- |
| Any command | ✅ Trusted - use with extreme caution |

### Command denylist

The command denylist provides a security layer that prevents auto-approval of commands containing specific patterns, regardless of your trust settings. This system uses **substring matching** - if any denied string appears anywhere in the command, it will require manual approval.

You can configure the denylist in `Settings → Kiro Agent: Command Denylist` at both user and workspace levels.

The denylist is checked **before** trust settings. Even if you trust all commands with `["*"]`, denied commands will still require manual approval.

The denylist uses substring matching to find dangerous patterns anywhere in the command:

If you have command denylist as `["rm -rf", "sudo", "--force"]`:

| Command | Result |
| --- | --- |
| npm install | ✅ Auto-approved (no denied patterns) |
| rm -rf /tmp/cache | ⚠️ Requires approval (contains "rm -rf") |
| sudo npm install | ⚠️ Requires approval (contains "sudo") |
| git push --force | ⚠️ Requires approval (contains "--force") |
| git push --force-with-lease | ⚠️ Requires approval (contains "--force") |
| npm install && rm -rf node_modules | ⚠️ Requires approval (contains "rm -rf") |

Consider adding these patterns to your denylist for enhanced security:

```json
{
  "kiroAgent.commandDenylist": [
    "rm -rf",
    "sudo",
    "chmod 777",
    "eval",
    "curl | sh",
    "wget | sh",
    "> /dev/",
    "mkfs",
    "dd if="
  ]
}

```

### How denylist and trust work together

The command approval system evaluates commands in this order:

1. Denylist check (highest priority) - If the command contains any denied pattern, manual approval is required
2. Trust check - If the command matches a trusted pattern, it's auto-approved
3. Default - If neither applies, manual approval is required

For example with configuration:

```json
{
  "kiroAgent.trustedCommands": ["npm *", "git *"],
  "kiroAgent.commandDenylist": ["--force", "sudo"]
}

```

| Command | Evaluation | Result |
| --- | --- | --- |
| npm install | Matches trust "npm *", no denied patterns | ✅ Auto-approved |
| git status | Matches trust "git *", no denied patterns | ✅ Auto-approved |
| npm install --force | Matches trust "npm *", but contains "--force" | ⚠️ Requires approval (denylist) |
| sudo npm install | Matches trust "npm *", but contains "sudo" | ⚠️ Requires approval (denylist) |
| git push --force | Matches trust "git *", but contains "--force" | ⚠️ Requires approval (denylist) |
| docker build . | No trust match, no denied patterns | ⚠️ Requires approval (default) |

Use the denylist to block dangerous patterns globally, then use trusted commands to streamline your common workflows. This provides both security and convenience.

## Using terminal context

Reference recent output from your active terminal in your conversations with `#terminal`. **Important: #terminal always refers to the currently active/visible terminal window.** If you have multiple terminals open, make sure the terminal you want to reference is active before using `#terminal` in your chat.

This feature allows Kiro to analyze command results, debug errors, and suggest solutions based on your actual terminal session.

```
#terminal analyze the error from the last npm run build

```

Kiro maintains awareness of command history and outputs, enabling:

- Error Analysis - Understanding why commands failed with specific error messages
- Output Interpretation - Explaining complex command results and logs
- Follow-up Actions - Suggesting next steps based on actual results
- Pattern Recognition - Identifying recurring issues across multiple commands
- Environment Debugging - Helping resolve system and dependency conflicts

## Troubleshooting

For issues with terminal integration and manual setup instructions, see the [Shell Integration troubleshooting guide](/docs/troubleshooting/#shell-integration-issues).