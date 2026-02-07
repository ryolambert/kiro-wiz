# Autonomous Agent Best Practices

> Autonomous Agent — best-practices

## Overview

Autonomous agents run in the cloud, executing tasks
independently without real-time user interaction.

## Patterns

- Design tasks to be self-contained and idempotent
- Include clear success/failure criteria in prompts
- Use for CI/CD integration and background processing
- Monitor execution via cloud logging

## Anti-Patterns

- Tasks requiring interactive user input
- Short tasks better suited to local hooks
- Missing error handling for cloud failures

## Related Resources

- [Autonomous Agent in Master Reference](../master-reference.md#autonomous-agent)
- [Autonomous Agent examples](./examples.md)
- [Autonomous Agent templates](./templates.md)
