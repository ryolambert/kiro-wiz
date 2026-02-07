---
title: "Agent Notifications - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/notifications/"
category: "chat"
lastUpdated: "2026-02-07T05:52:02.929Z"
---
# Agent Notifications

---

Kiro agent notifications provide native system notifications for important agent execution events. These OS-level notifications ensure you stay informed about agent progress even when Kiro is running in the background or you're working in other applications.

You can also configure usage notifications to help you monitor your credit consumption and avoid unexpected charges. For more information, see [Managing proactive usage notifications](/docs/billing/proactive-usage-notifications).

### Agent notification types

- Action Required - Agent needs user input or approval to continue (e.g., permission to run shell commands)
- Success - Agent execution completes successfully (e.g., spec task completion, code generation finished)
- Failure - Agent execution encounters an error or fails (e.g., spec creation failure)

### Configuring agent notifications

1. Open Settings: Command Palette (⌘/Ctrl + Shift + P).
2. Search for Agent: Notifications. The various Agent notification types will be listed.
3. Select the specific Agent notification types that you'd like to enable.

You can disable notifications by unselecting the checkbox next to each notification type.

### Troubleshooting agent notifications

#### Agent notifications not appearing

1. Check notification settings - Ensure notifications are enabled in Kiro settings
2. Verify system permissions - Grant notification permissions to Kiro in your OS settings
3. Check Do Not Disturb - Ensure your system's Do Not Disturb mode isn't blocking notifications
4. Focus state - Remember that notifications are suppressed when Kiro is focused (if enabled)
5. Restart if needed - Restart Kiro if notifications stop working after system changes