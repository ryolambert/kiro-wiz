---
title: "Agent Sandbox - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/sandbox/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:36.215Z"
---
# Agent Sandbox

---

The agent sandbox provides a secure, isolated environment where Kiro autonomous agent executes tasks. Each task runs in its own sandbox with configurable access controls, ensuring your code and resources remain protected.

## How it works

When you assign a task, Kiro autonomous agent:

1. Spins up an isolated sandbox environment
2. Clones authorized repositories into the sandbox
3. Configures the environment based on your Dockerfile or detected project settings
4. Executes the task with access only to explicitly permitted resources
5. Tears down the sandbox when the task completes

## Configuration

Configure sandbox access and behavior for your tasks.