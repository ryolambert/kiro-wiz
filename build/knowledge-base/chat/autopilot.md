---
title: "Autopilot - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/autopilot/"
category: "chat"
lastUpdated: "2026-02-07T05:52:01.640Z"
---
# Autopilot

---

## What is Autopilot mode?

Autopilot mode is Kiro's autonomous execution mode that allows the agent to make code changes across your codebase and complete complex tasks with minimal intervention. It's a key feature that enables Kiro to work more independently on your behalf.

## How it works

### Autopilot mode (default)

Kiro works autonomously to complete tasks end-to-end. It can create files, modify code across multiple locations, run commands, and make architectural decisions without asking for approval at each step. You maintain control through the ability to view all changes, revert everything, or interrupt execution at any time.

### Supervised mode

Kiro pauses after each turn that contains file edits, presenting changes for your review before continuing. This turn-based approach gives you full visibility into each modification and lets you guide the development process while maintaining code quality standards.

## Switching between modes

You can toggle between Autopilot and Supervised modes at any time using the autopilot switch in the chat interface. This flexibility allows you to use the appropriate level of control for different tasks.

## When to use each mode

### Autopilot mode is best for:

- Experienced users familiar with Kiro's capabilities
- Repetitive or well-defined tasks
- Projects where you want to move quickly
- Tasks spanning multiple files or requiring several steps

### Supervised mode is best for:

- New users getting familiar with Kiro
- Critical or sensitive codebases
- Learning how Kiro approaches problems
- When you want to carefully review each change
- Working with unfamiliar code or complex systems

You can toggle between these modes at any time based on your current needs and comfort level with the task at hand.

## Kiro's change management features

### In Autopilot mode

In Autopilot mode, Kiro works autonomously and can make multiple changes to your codebase without requiring approval for each individual action.
However, you still maintain control over these changes through several key features:

1. View All Changes

- You can see a comprehensive list of all modifications made by selecting the "View all changes" option in the Chat module
- This gives you visibility into everything Kiro has done across your codebase
- Changes are presented in a diff view that clearly shows what was added, modified, or removed

1. Revert All Changes

- If you're not satisfied with the changes Kiro has made, you can select "Revert"
- This will restore your files to their previous state in the filesystem locally
- This is essentially an "undo" function for all of Kiro's modifications
- Note that you can also revert to a checkpoint, which will revert both file changes as well as context additions

1. Interrupt Execution

- You can interrupt Autopilot mid-execution to regain manual control
- This stops Kiro from making further changes if you notice something going wrong

### In Supervised mode

In Supervised mode, Kiro yields for your approval after each turn that contains file edits. This turn-based approach works in both vibe chat and spec chat sessions.

1. Turn-based approval

- Kiro pauses after each turn containing file changes
- Review the changes before Kiro continues to the next step

1. Per-file review

- When multiple files are edited, review each file individually
- Accept or reject changes on a per-file basis

1. Selective approval

- Accept or reject individual files during review
- When you select Accept All, only non-rejected files are applied
- This lets you cherry-pick which changes to keep from a turn
- Rejecting a file and then selecting Accept All will apply the other changes but stop execution, allowing you to provide guidance before Kiro continues

1. Accept All / Reject All

- Accept All applies all pending changes and continues execution
- Reject All reverts all changes and lets you provide feedback for a different approach