# Hooks Best Practices

> Hooks — best-practices

## Trigger Types

| Trigger | Fires When |
| --- | --- |
| fileEdited | A file is saved after editing |
| fileCreated | A new file is created |
| fileDeleted | A file is removed |
| promptSubmit | User submits a chat prompt |
| agentStop | Agent completes execution |
| preToolUse | Before a tool is invoked |
| postToolUse | After a tool completes |
| userTriggered | Manual invocation by user |

## Action Types

| Action | Description | Credit Cost |
| --- | --- | --- |
| askAgent | Sends a prompt to the agent | Medium (consumes credits) |
| runCommand | Runs a shell command | None (free) |

## Shell Command Availability

`runCommand` actions execute in the workspace shell.
They have access to the full PATH and can run any CLI tool
installed in the environment. Use for linting, formatting,
builds, and other deterministic operations.

## Patterns

- Prefer `runCommand` for deterministic tasks (linting, formatting)
- Use `askAgent` only when AI reasoning is needed
- Scope file patterns narrowly to avoid unnecessary triggers
- Combine `preToolUse` hooks with tool type filters

## Anti-Patterns

- Using `askAgent` for tasks a shell command can handle
- Overly broad file patterns triggering on every save
- Missing error handling in shell commands

## Related Resources

- [Hooks in Master Reference](../master-reference.md#hook)
- [Hooks examples](./examples.md)
- [Hooks templates](./templates.md)
