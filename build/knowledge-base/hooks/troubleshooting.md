---
title: "Troubleshooting Hooks - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/hooks/troubleshooting/"
category: "hooks"
lastUpdated: "2026-02-07T05:52:05.993Z"
---
# Troubleshooting Hooks

---

### Common issues

**Hook Not Triggering**

- For file-related hooks, verify the file pattern matches your target files
- Check that the hook is enabled
- Ensure the event type is correct

**Unexpected Hook Behavior**

- Review the hook instructions for clarity
- Check for conflicting hooks
- Verify file patterns aren't too broad

**Performance Issues**

- For file-related hooks, limit hook scope with more specific file patterns
- For hooks with an agent prompt action, simplify any complex hook instructions
- For hooks with a shell command action, ensure that the command completes quickly
- Reduce the frequency of triggering events

For additional information, consult the [troubleshooting guide](/docs/troubleshooting)