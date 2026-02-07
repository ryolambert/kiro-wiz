# Powers Templates

> Powers — templates

## Power Starter Template

### POWER.md

```markdown
---
name: {{POWER_NAME}}
displayName: {{DISPLAY_NAME}}
description: {{DESCRIPTION}}
keywords: {{KEYWORD_1}}, {{KEYWORD_2}}
---

# {{DISPLAY_NAME}}

## Overview
{{WHAT_THIS_POWER_DOES}}

## Getting Started
1. {{SETUP_STEP_1}}
2. {{SETUP_STEP_2}}
```

### mcp.json

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "node",
      "args": ["{{SERVER_PATH}}"]
    }
  }
}
```

## Related Resources

- [Powers in Master Reference](../master-reference.md#power)
- [Powers best-practices](./best-practices.md)
- [Powers examples](./examples.md)
