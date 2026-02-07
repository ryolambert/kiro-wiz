---
title: "Environment Variables - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/sandbox/environment-variables/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:36.689Z"
---
# Environment Variables

---

Configure environment variables and secrets for autonomous agent execution.

## Environment Variables

Set environment variables that will be available to the agent during task execution. These are useful for configuration values that aren't sensitive.

## Secrets

Securely manage sensitive credentials and API keys in the sandbox. Secrets are encrypted at rest and exposed as environment variables in the isolated sandbox during task execution. The agent may exfiltrate these secrets through code changes, logs, or external requests, so only provide secrets necessary for the task and only use the agent with repositories you trust.

## Duplicate Keys

If the same key exists in both environment variables and secrets, the environment variable value takes precedence.