---
inclusion: manual
---

# Workspace Audit Guide

How to audit Kiro workspace configurations against
best practices and apply fixes.

## Running an Audit

### Via MCP Tool

Use the `audit_workspace` MCP tool:

```text
Tool: audit_workspace
Parameters: { "workspacePath": "." }
```

Returns an `AuditReport` with findings grouped by
severity and a list of all scanned files.

### Via CLI

```bash
npx tsx bin/audit.ts --workspace .
```

## What Gets Scanned

The auditor checks these locations:

| Path Pattern                    | Tool Type     |
| ------------------------------- | ------------- |
| `.kiro/steering/*.md`           | Steering docs |
| `.kiro/hooks/*.kiro.hook`       | Hooks         |
| `.kiro/skills/*/SKILL.md`       | Skills        |
| `.kiro/specs/*/`                | Specs         |
| `custom-powers/*/POWER.md`      | Powers        |
| `.kiro/settings/mcp.json`       | MCP config    |
| `.kiro/settings/settings.json`  | Settings      |
| `AGENTS.md`                     | CLI steering  |

## Understanding Findings

Findings are grouped into three severity levels:

### Critical

Must fix — configs are broken or insecure.

- Missing required frontmatter fields
- Invalid hook trigger or action types
- Hardcoded secrets in MCP server configs
- Malformed JSON in hook or agent configs
- SKILL.md name doesn't match directory name

### Recommended

Should fix — configs work but miss best practices.

- Steering doc missing inclusion mode frontmatter
- Power POWER.md missing keywords
- Skill description too short (under 100 chars)
- Hook missing file patterns for file-based triggers
- MCP server missing `env` for secret management
- Spec missing requirements or design file

### Optional

Nice to have — minor improvements.

- Steering doc over 200 lines (token efficiency)
- POWER.md over 500 lines
- Skill missing `license` field
- Hook description could be more descriptive
- No AGENTS.md for CLI steering

## Finding Format

Each finding includes:

```text
[SEVERITY] category: message
  File: path/to/config
  Suggestion: how to fix it
  KB Ref: knowledge-base/section/relevant-doc.md
```

## Applying Fixes

### Manual Fixes

Review each finding and apply the suggestion:

1. Read the finding's suggestion
2. Check the KB reference for detailed guidance
3. Edit the config file
4. Re-run the audit to verify

### Automated Fixes via Workflow Builder

Use the Workflow Builder agent for guided fixes:

1. Invoke the workflow builder agent
2. Select "Optimize Existing Workflows"
3. Review the audit findings presented
4. Approve or skip each suggested fix
5. Fixes are applied with validation

## Common Audit Patterns

### Steering Doc Fixes

```yaml
# Before (missing frontmatter)
# My Guidelines
...

# After (valid frontmatter)
---
inclusion: always
---
# My Guidelines
...
```

### Hook Fixes

```json
// Before (invalid trigger type)
{ "when": { "type": "onSave" } }

// After (valid trigger type)
{ "when": { "type": "fileEdited" } }
```

### Skill Fixes

```yaml
# Before (name violates spec)
---
name: My_Skill
description: "A skill"
---

# After (spec-compliant)
---
name: my-skill
description: >
  Detailed description (250-350 chars).
  Use when: building X or debugging Y.
---
```

### MCP Config Fixes

```json
// Before (hardcoded secret)
{
  "headers": {
    "Authorization": "Bearer sk-abc123"
  }
}

// After (environment variable)
{
  "headers": {
    "Authorization": "Bearer ${API_KEY}"
  }
}
```

## Audit Checklist

Quick manual checklist for common issues:

- [ ] All steering docs have valid YAML frontmatter
- [ ] All hooks use valid trigger and action types
- [ ] All skills pass Agent Skills spec validation
- [ ] All powers have complete POWER.md frontmatter
- [ ] No hardcoded secrets in MCP configs
- [ ] AGENTS.md exists if using CLI agents
- [ ] Specs have requirements.md, design.md, tasks.md
