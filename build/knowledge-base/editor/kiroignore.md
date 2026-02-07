---
title: "Kiroignore - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/editor/kiroignore/"
category: "editor"
lastUpdated: "2026-02-07T05:52:00.118Z"
---
# Kiroignore

---

The `.kiroignore` file prevents Kiro from reading specific files in your workspace. Using familiar gitignore syntax, you define patterns for files that should remain private—credentials, secrets, or content you prefer to keep out of agent context.

## Why use .kiroignore?

- Security - Prevent Kiro from accessing files containing credentials, API keys, or other sensitive data
- Privacy - Exclude confidential information from AI interactions
- Compliance - Ensure Kiro doesn't access files that shouldn't be shared with external services
- Focus - Keep Kiro's context relevant by excluding large files or build artifacts

## Setting up workspace ignore

To exclude files in a specific project:

1. Create a .kiroignore file in your project root (or any subdirectory)
2. Add patterns for files you want to exclude:

```bash
# Secrets and credentials
.env
.env.*
!.env.example
*.pem
*.key

# Private directories
secrets/
private/

```

1. Open Settings (Cmd+, on Mac or Ctrl+, on Windows/Linux)
2. Search for Agent Ignore Files (setting: kiroAgent.agentIgnoreFiles)
3. Add .kiroignore to the array

Kiro will now skip any files matching your patterns.

Start with credentials and secrets—these are the highest priority files to protect. You can always expand your patterns as your project evolves.

### Setting options

The `kiroAgent.agentIgnoreFiles` setting accepts an array of filenames:

- Use multiple ignore file types simultaneously: [".gitignore", ".kiroignore"]
- Set to [] to disable workspace-level ignore files

### Subdirectory ignore files

Like `.gitignore`, you can place `.kiroignore` files in subdirectories to override or extend patterns from parent directories. Patterns in subdirectory ignore files take precedence for files within that subdirectory.

## Global ignore files

Kiro automatically honors global ignore files if they exist—no configuration needed:

- ~/.kiro/settings/kiroignore - Your global Kiro ignore patterns
- Git's global ignore file (configured via core.excludesfile in your git config) - only applied in git repositories

Use global ignore files for patterns you want applied across all your projects.

## Pattern syntax

`.kiroignore` uses standard gitignore syntax:

| Pattern | Effect |
| --- | --- |
| file.txt | Ignore specific file |
| *.log | Ignore by extension |
| folder/ | Ignore directory |
| **/temp | Ignore in any subdirectory |
| !keep.txt | Don't ignore (negation) |

You cannot re-include a file if a parent directory is excluded. For example, if you ignore `secrets/`, adding `!secrets/public.txt` won't work. To include specific files from a directory, use more specific patterns instead of excluding the entire directory.

## Examples

### Protecting API keys and secrets

```bash
# Environment files with credentials
.env
.env.local
.env.production

# Keep the template accessible
!.env.example

# Certificate and key files
*.pem
*.key
*.p12
credentials/

```

### Excluding build artifacts and data files

```bash
# Build outputs
dist/
build/
.next/

# Data files
*.sql
*.dump
data/exports/

```

### Team compliance setup

```bash
# Customer data directories
customer-data/
pii/

# Audit and compliance docs
compliance/internal/
audit-reports/

```

Use `.kiroignore` when you need different rules for agent access vs. version control, or to block files that are tracked in git but shouldn't be read by Kiro.

## Best practices

- Use comments to document why files are ignored—helpful for team members
- Test patterns by asking Kiro to read an ignored file—it will indicate access is blocked
- Review patterns periodically as your project structure evolves
- Coordinate with your team on global patterns for consistent behavior across workspaces