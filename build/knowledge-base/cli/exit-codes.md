---
title: "Exit codes - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/reference/exit-codes/"
category: "cli"
lastUpdated: "2026-02-07T05:52:34.449Z"
---
# Exit codes

---

Kiro CLI returns specific exit codes to indicate operation status. Use these in scripts and CI/CD pipelines to detect success, failures, and specific error conditions.

## Exit code reference

| Code | Name | Description |
| --- | --- | --- |
| 0 | Success | Command completed successfully |
| 1 | Failure | General failure (auth error, invalid args, operation failed) |
| 3 | MCP Startup Failure | MCP server failed to start (requires --require-mcp-startup) |

## Requiring MCP servers

By default, MCP server failures are logged as warnings but don't affect the exit code. Use `--require-mcp-startup` to fail fast when MCP servers are critical to your workflow:

```bash
kiro-cli chat --require-mcp-startup --no-interactive "Run task"

```

If any configured MCP server fails to start, the CLI exits immediately with code 3.

Use `--require-mcp-startup` in CI/CD pipelines where MCP tools are essential. This prevents silent failures where tasks complete without the expected tooling.

## Scripting examples

Handle different exit codes to take appropriate action in your automation:

### Bash script

```bash
#!/bin/bash
kiro-cli chat --require-mcp-startup --no-interactive --trust-all-tools "Run analysis"
exit_code=$?

case $exit_code in
    0) echo "Success" ;;
    3) echo "MCP servers failed to start"; exit 1 ;;
    *) echo "Failed with code $exit_code"; exit $exit_code ;;
esac

```

### CI/CD pipeline

```yaml
- name: Run Kiro task
  run: |
    kiro-cli chat --require-mcp-startup --no-interactive --trust-all-tools "Analyze code"
  continue-on-error: false

```

## Hook exit codes

[Hooks](/docs/cli/hooks) use a separate set of exit codes to control tool execution:

| Code | Behavior |
| --- | --- |
| 0 | Hook succeeded |
| 2 | (PreToolUse only) Block tool execution; STDERR returned to LLM |
| Other | Hook failed; STDERR shown as warning |

## Best practices

- Use --require-mcp-startup in CI/CD when your tasks depend on MCP tools
- Add verbose logging (-v or -vv) when debugging exit code issues
- Check exit codes explicitly rather than relying on implicit shell behavior
- Separate MCP failures from general failures to provide better error messages to users