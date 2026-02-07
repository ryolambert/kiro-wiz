# Context Providers Best Practices

> Context Providers — best-practices

## Overview

Context providers use `#`-prefixed references to inject
files, folders, specs, and other context into chat.

## Reference Types

| Prefix | Injects |
| --- | --- |
| #file:path | A specific file |
| #folder:path | All files in a folder |
| #spec:name | A spec's requirements, design, tasks |
| #steering:name | A steering document |

## Patterns

- Reference specific files rather than entire directories
- Use spec references for feature-related conversations
- Combine multiple references for comprehensive context

## Anti-Patterns

- Injecting large directories (token overflow)
- Referencing files unrelated to the current task

## Related Resources

- [Context Providers in Master Reference](../master-reference.md#context-provider)
- [Context Providers examples](./examples.md)
- [Context Providers templates](./templates.md)
