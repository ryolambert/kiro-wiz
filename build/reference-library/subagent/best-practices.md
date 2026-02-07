# Subagents Best Practices

> Subagents — best-practices

## Overview

Subagents are delegated by the main IDE agent to handle
focused sub-tasks. They run in the same IDE context.

## Patterns

- Break complex tasks into focused, independent sub-tasks
- Give each subagent a clear, specific objective
- Use for parallel execution of independent work items
- Keep subagent scope narrow for better results

## Anti-Patterns

- Delegating trivial single-step operations
- Overlapping subagent responsibilities
- Missing context in subagent prompts

## Related Resources

- [Subagents in Master Reference](../master-reference.md#subagent)
- [Subagents examples](./examples.md)
- [Subagents templates](./templates.md)
