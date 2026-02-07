---
title: "Checkpoints - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/checkpoints/"
category: "chat"
lastUpdated: "2026-02-07T05:52:03.196Z"
---
# Checkpoints

---

Each time you send a prompt to Kiro, it creates a “checkpoint”. Checkpoints appear as markers in your chat history. You can hit **Restore** on a checkpoint marker to rewind both your codebase and Kiro’s context back to that point in time. Any changes made to your codebase by Kiro after that checkpoint are reverted, and any context additions (chat interactions) after that point are discarded as well.

Checkpoints act as a safety net that enables you to confidently explore multiple approaches to a problem, try different models for a given task, recover from mistakes or misunderstandings by the agent, etc.

Checkpoints work by snapshotting the contents of a file each time the Kiro agent modifies it using one of its built-in file modification tools, and then restoring that snapshot when you revert to that checkpoint.

Note that Kiro does not track any changes to a file made *outside* of the Kiro agent. This means that if Kiro snapshots a file and then you, for example, manually edit that same file or run a code formatting tool on it, when you revert to that checkpoint, your changes will be lost. Kiro also does not track file changes made by any MCP tools or bash commands that it may run as part of its execution.

### Reverts vs. checkpoints

Whenever the Kiro agent modifies one or more files and then completes its turn, immediately above the chat input box, you will see an option to **Revert** the changes made by the agent.

Reverts are similar to checkpoints, but differ in two key aspects. First, reverts only undo changes made by the *latest* turn of the agent, whereas checkpoints can undo changes made over multiple turns. Second, reverts only revert *file* changes, whereas checkpoints undo file changes as well as discard context additions past the checkpoint.