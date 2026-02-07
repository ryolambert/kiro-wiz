---
title: "Creating tasks - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/using-the-agent/creating-tasks/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:35.994Z"
---
# Creating tasks

---

You can create tasks for Kiro autonomous agent (Preview) in several ways, depending on your workflow.

## From app.kiro.dev/agent

Navigate to [app.kiro.dev/agent](https://app.kiro.dev/agent) to start a new chat:

1. Optionally select multiple repositories when starting the chat
2. Describe what you want the agent to do
3. If you didn't select repositories at the start, you'll be prompted to choose them when you ask Kiro to work on something

The agent will analyze your request, break down the work, and begin execution.

Kiro autonomous agent can work across multiple repositories in a single task. When you assign work that spans multiple repos, it coordinates all changes and opens pull requests in each one. Only select repositories you trust, especially when mixing public and private repos, as the agent will learn from and follow instructions in the repository code even if these are malicious.

## From GitHub issues

You'll need to [connect GitHub](/docs/autonomous-agent/github) first.

**Using the /kiro command**

Mention `/kiro` in a comment on any issue to assign that specific task to Kiro autonomous agent.

**Using the Kiro label**

Add the `kiro` label to any issue. Kiro autonomous agent will start working on the task and listen to all comments on the issue for additional context or feedback.

## Task lifecycle

Tasks move through different states as the agent works:

**Queued**

The task is waiting to start. This happens when you've reached the limit of 10 concurrent tasks.

**In progress**

The agent is actively working on the task, analyzing requirements, writing code, or running tests.

**Needs attention**

The task needs input or the agent has a clarification question. Review the agent's message and provide the requested information to unblock the task.

**Completed**

The agent has finished the work and opened pull requests. Review the changes and provide feedback. Providing feedback moves the task to queued and then to in progress when a parallel task slot becomes available.

**Cancelled**

The task was cancelled and will not be completed. Cancelled tasks cannot be resumed.

## Task tips

Follow these best practices when creating tasks:

**Be specific about the outcome**

Clearly describe what you want the end result to look like. Instead of "improve the login flow," say "add password reset functionality to the login page with email verification."

**Describe the problem you're trying to solve**

Explain the context and why the work is needed. This helps the agent understand constraints and make better implementation decisions.

**Provide relevant context**

Link to related documentation, examples, or existing code that should inform the implementation.

**Define acceptance criteria**

List specific conditions that must be met for the task to be considered complete.

**Use steering files**

Kiro autonomous agent automatically looks for [steering files](/docs/steering) in the `.kiro/steering/` folder at the root of your repository. These markdown files define your team's standards, architecture, and conventions, ensuring the agent consistently follows your established patterns without needing to explain them in every task. Steering files are particularly useful for coding conventions, architecture patterns, technology stack preferences, and testing approaches.