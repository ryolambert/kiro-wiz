---
title: "Checkpointing - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/experimental/checkpointing/"
category: "cli"
lastUpdated: "2026-02-07T05:52:26.774Z"
---
# Checkpointing

---

Checkpointing enables session-scoped snapshots for tracking file changes using Git-like commands. This feature creates a shadow bare git repository to manage file state across your chat session.

## Overview

Checkpointing provides version control for your chat session, allowing you to:

- Create snapshots of file changes at any point
- Compare different states of your files
- Restore to previous checkpoints
- Track what changed during each turn of conversation

## Enabling checkpointing

```bash
kiro-cli settings chat.enableCheckpoint true

```

Or use the experiment command:

```bash
/experiment
# Select "Checkpointing" from the list

```

## How it works

### Automatic initialization

- In git repositories: Auto-enables when you start a chat session
- Non-git directories: Requires manual initialization with /checkpoint init
- Session-scoped: Shadow repository is cleaned up when session ends

### Shadow repository

Checkpointing creates a temporary bare git repository that:

- Tracks file changes without affecting your actual git repo
- Stores snapshots for each turn of conversation
- Allows comparison and restoration of file states
- Is automatically cleaned up when the session ends

## Commands

### /checkpoint init

Manually enable checkpoints (required if not in a git repository):

```bash
/checkpoint init

```

### /checkpoint list

Show turn-level checkpoints with file statistics:

```bash
/checkpoint list [--limit N]

```

**Example output:**

```
[0] 2025-09-18 14:00:00 - Initial checkpoint
[1] 2025-09-18 14:05:31 - add two_sum.py (+1 file)
[2] 2025-09-18 14:07:10 - add tests (modified 1)
[3] 2025-09-18 14:10:45 - refactor algorithm (modified 1)

```

### /checkpoint expand

Show tool-level checkpoints under a specific turn:

```bash
/checkpoint expand <tag>

```

**Example:**

```
> /checkpoint expand 2

[2] 2025-09-18 14:07:10 - add tests
 └─ [2.1] write: Add minimal test cases to two_sum.py (modified 1)

```

### /checkpoint diff

Compare checkpoints or compare with current state:

```bash
/checkpoint diff <tag1> [tag2|HEAD]

```

**Examples:**

```bash
/checkpoint diff 1 2        # Compare checkpoint 1 to checkpoint 2
/checkpoint diff 1 HEAD     # Compare checkpoint 1 to current state
/checkpoint diff 1          # Same as above (HEAD is default)

```

### /checkpoint restore

Restore to a checkpoint:

```bash
/checkpoint restore [<tag>] [--hard]

```

**Interactive picker**: If no tag specified, shows interactive selection

**Restore options:**

- Default: Reverts tracked changes and deletions; keeps files created after checkpoint
- --hard: Makes workspace exactly match checkpoint; deletes tracked files created after it

**Examples:**

```bash
/checkpoint restore 2       # Restore to checkpoint 2 (soft)
/checkpoint restore 2 --hard # Restore to checkpoint 2 (hard)
/checkpoint restore         # Interactive selection

```

### /checkpoint clean

Delete the session shadow repository:

```bash
/checkpoint clean

```

**Warning**: This removes all checkpoint data for the current session.

## Restore modes

### Default restore (soft)

Reverts tracked changes and deletions but keeps new files:

```bash
/checkpoint restore 2

```

**What happens:**

- Modified files are reverted to checkpoint state
- Deleted files are restored
- Files created after checkpoint are kept

**Use when:**

- You want to undo changes but keep new work
- Testing different approaches
- Reverting specific modifications

### Hard restore

Makes workspace exactly match checkpoint state:

```bash
/checkpoint restore 2 --hard

```

**What happens:**

- Modified files are reverted to checkpoint state
- Deleted files are restored
- Files created after checkpoint are deleted

**Use when:**

- You want exact checkpoint state
- Completely abandoning recent work
- Starting fresh from a known good state

**⚠️ Warning**: Hard restore permanently deletes files. Use with caution.

## Use cases

### Experimenting with changes

```
> Help me refactor this function

# Kiro makes changes...

> /checkpoint list
[0] Initial checkpoint
[1] Refactored function (modified 1)

> Actually, let's try a different approach

> /checkpoint restore 0
# Back to original state

> Now try using a different pattern...

```

### Comparing approaches

```
> Implement feature A

# Implementation complete

> /checkpoint list
[1] Implemented feature A (modified 2)

> Now show me an alternative implementation

# Alternative implementation

> /checkpoint list
[2] Alternative implementation (modified 2)

> /checkpoint diff 1 2
# See differences between approaches

```

### Tracking progress

```
> /checkpoint list
[0] Initial state
[1] Added user model (+1 file)
[2] Added authentication (+2 files)
[3] Added tests (modified 3)

> /checkpoint expand 2
[2] Added authentication
 └─ [2.1] write: Create auth.py (+1 file)
 └─ [2.2] write: Update routes.py (modified 1)

```

### Recovering from mistakes

```
> /checkpoint list
[0] Working code
[1] Attempted optimization (modified 1)
[2] More changes (modified 2)

# Realize the optimization broke things

> /checkpoint restore 0
# Back to working state

```

## Conversation history

When you restore to a checkpoint, the conversation history also unwinds to that point. This means:

- Messages after the checkpoint are removed
- Context returns to the checkpoint state
- Kiro's understanding resets to that point

This ensures consistency between file state and conversation context.

## Best practices

### When to use checkpointing

- Experimental changes: Try different approaches safely
- Complex refactoring: Track each step of major changes
- Learning: Compare different implementations
- Debugging: Isolate when problems were introduced

### Checkpoint management

- Review checkpoints regularly: Use /checkpoint list to see progress
- Use descriptive changes: Kiro's checkpoint messages help identify states
- Clean up when done: Use /checkpoint clean to remove session data
- Be cautious with --hard: Only use when you're sure

### Workflow integration

1. Enable at session start: Turn on for complex work
2. Check progress: Use /checkpoint list periodically
3. Compare approaches: Use /checkpoint diff to see changes
4. Restore when needed: Go back to known good states
5. Clean up: Remove shadow repo when session ends

## Limitations

### Session scope

- Checkpoints only exist for current session
- Shadow repository is cleaned up when session ends
- Cannot share checkpoints across sessions

### File tracking

- Only tracks files modified during session
- Doesn't track files outside working directory
- Binary files are tracked but diffs may not be useful

### Performance

- Large files may slow down checkpoint operations
- Many checkpoints can consume disk space
- Diff operations on large changes may be slow

## Troubleshooting

### Checkpointing not working

1. Verify it's enabled:
bashkiro-cli settings chat.enableCheckpoint
2. Initialize manually (if not in git repo):
bash/checkpoint init
3. Check for errors: Look for error messages in chat

### Cannot restore checkpoint

1. Verify checkpoint exists:
bash/checkpoint list
2. Check file permissions: Ensure write access to files
3. Try soft restore first: Use default restore before --hard

### Shadow repository issues

If shadow repository becomes corrupted:

1. Clean and reinitialize:
bash/checkpoint clean
/checkpoint init
2. Restart session: Start a new chat session

## Important notes

⚠️ **Checkpointing creates temporary git repositories** that are cleaned up when the session ends.

⚠️ **Use caution with --hard restore** as it permanently deletes files.

⚠️ **Checkpoints are session-scoped** and don't persist across sessions.

⚠️ **Conversation history unwinds** when restoring to maintain consistency.

## Related features

- Experimental Features
- Tangent Mode - Conversation checkpoints
- TODO Lists - Task tracking

## Next steps

- Enable other experimental features
- Learn about custom agents
- Configure settings