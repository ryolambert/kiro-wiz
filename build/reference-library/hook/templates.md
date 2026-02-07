# Hooks Templates

> Hooks — templates

## Hook Starter Template

```json
{
  "name": "{{HOOK_NAME}}",
  "version": "1.0.0",
  "description": "{{DESCRIPTION}}",
  "when": {
    "type": "{{TRIGGER_TYPE}}",
    "patterns": ["{{FILE_PATTERN}}"]
  },
  "then": {
    "type": "{{ACTION_TYPE}}",
    "command": "{{SHELL_COMMAND}}"
  }
}
```

**Placeholders:**
- `{{TRIGGER_TYPE}}`: One of fileEdited, fileCreated,
  fileDeleted, promptSubmit, agentStop, preToolUse,
  postToolUse, userTriggered
- `{{ACTION_TYPE}}`: One of askAgent, runCommand
- `{{FILE_PATTERN}}`: Glob pattern like `**/*.ts`

## Related Resources

- [Hooks in Master Reference](../master-reference.md#hook)
- [Hooks best-practices](./best-practices.md)
- [Hooks examples](./examples.md)
