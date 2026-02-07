---
title: "Session Management - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/chat/session-management/"
category: "cli"
lastUpdated: "2026-02-07T05:52:19.625Z"
---
# Session Management

---

Kiro CLI automatically saves all chat sessions on every conversation turn. Sessions are stored per-directory in the database, allowing you to resume from any previous session, export to files, or integrate with custom storage solutions.

## Auto-save

**Automatic**: Every conversation turn saved to database

**Scope**: Per-directory (each project has own sessions)

**Storage**: Local database (`~/.kiro/`)

**Session ID**: UUID for each session

## Managing sessions

### From command line

```bash
# Resume most recent session
kiro-cli chat --resume

# Interactive picker
kiro-cli chat --resume-picker

# List all sessions
kiro-cli chat --list-sessions

# Delete session
kiro-cli chat --delete-session <SESSION_ID>

```

### From chat

```bash
# Resume session (interactive)
/chat resume

# Save to file
/chat save <path>

# Load from file
/chat load <path>

```

The `.json` extension is optional when loading sessions.

## Custom storage via scripts

Use custom scripts to save/load sessions from version control, cloud storage, or databases.

### Save via script

```bash
/chat save-via-script <script-path>

```

Script receives session JSON via stdin.

**Example: Save to Git Notes**

```bash
#!/bin/bash
COMMIT=$(git rev-parse HEAD)
TEMP=$(mktemp)
cat > "$TEMP"
git notes --ref=kiro/notes add -F "$TEMP" "$COMMIT" --force
rm "$TEMP"
echo "Saved to commit ${COMMIT:0:8}" >&2

```

### Load via script

```bash
/chat load-via-script <script-path>

```

Script outputs session JSON to stdout.

**Example: Load from Git Notes**

```bash
#!/bin/bash
COMMIT=$(git rev-parse HEAD)
git notes --ref=kiro/notes show "$COMMIT"

```

## Session storage

**Database**: Sessions auto-saved per-directory

**Files**: Manual export via `/chat save`

**Custom**: Script-based integration

**Session ID**: UUID format (e.g., `f2946a26-3735-4b08-8d05-c928010302d5`)

## Examples

### Resume last session

```bash
kiro-cli chat --resume

```

Continues most recent conversation.

### Pick session interactively

```bash
kiro-cli chat --resume-picker

```

Shows list of sessions to choose from.

### Export to file

```
/chat save backup.json

```

Exports current session to file.

### Version control integration

```bash
# Save to git notes
/chat save-via-script ./scripts/save-to-git.sh

# Load from git notes
/chat load-via-script ./scripts/load-from-git.sh

```

## Troubleshooting

### No sessions to resume

**Symptom**: "No saved chat sessions"

**Cause**: No sessions in current directory

**Solution**: Sessions are per-directory. Navigate to correct directory.

### Script save fails

**Symptom**: Script exits with error

**Cause**: Script returned non-zero exit code

**Solution**: Test script manually. Ensure it exits 0 on success.

### Script load fails

**Symptom**: Can't load session

**Cause**: Script didn't output valid JSON

**Solution**: Test script outputs valid session JSON to stdout.

## Limitations

- Sessions stored per-directory
- Auto-save to database only (not files)
- Session IDs are UUIDs (not human-readable)
- No cloud sync (use scripts for custom storage)
- No session search by content

## Technical details

**Storage**: SQLite database in `~/.kiro/`

**Scope**: Sessions keyed by directory path

**Auto-save**: After every conversation turn

**Script interface**:

- Save: JSON via stdin, exit 0 on success
- Load: JSON via stdout, exit 0 on success

## Next steps

- Learn about Chat Commands
- See Interactive Chat Mode
- Review Context Management