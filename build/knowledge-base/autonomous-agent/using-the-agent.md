---
title: "Using the agent - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/using-the-agent/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:35.533Z"
---
# Using the agent

---

Once you connect your Kiro autonomous agent (Preview) to [GitHub](/docs/autonomous-agent/github), you can create tasks and work with the agent in several ways.

## Your first task

Now that you've [set up Kiro autonomous agent (Preview)](/docs/autonomous-agent/setup), let's create your first task.

1. Go to app.kiro.dev/agent
2. Optionally select repositories before starting your task
3. Write a clear description of what you want the agent to do

For your first task, try something straightforward like:

- "Add error handling to the login function in auth.ts"
- "Write unit tests for the UserService class"
- "Update the README with installation instructions"

Or try something that spans multiple repositories:

- "Add a new API endpoint in the backend service and update the frontend client to call it"
- "Update the shared authentication library and migrate both the web and mobile apps to use the new version"

Include any specific requirements or constraints in your description. You can always refine or add more details as the conversation progresses.

Only select repositories you trust, especially when mixing public and private repos, as the agent will learn from and follow instructions in the repository code even if these are malicious.

If you didn't select repositories when starting the chat, you'll be prompted to choose them when you ask Kiro to work on something.

## Chat and tasks

You can chat with the agent at any time to ask questions, discuss approaches, or provide context. When you're ready, ask the agent to create a task.

Once a task is created in a chat, you cannot create a second task in that same chat. Any additional comments or steering will update the scope of the current task. Use this to:

- Steer the agent on the implementation approach
- Provide additional requirements or constraints
- Ask the agent to do more work after reviewing initial results

To work on a different task, start a new chat.

## How it works

When the agent is assigned a task, it follows a structured process:

1. Environment setup - Spins up a new sandbox, loads any MCP servers, and looks for Dockerfiles in the repository
2. Repository analysis - Clones the repositories and analyzes the codebase
3. Planning - Proposes a plan and generates requirements and acceptance criteria to work against
4. Execution - Assigns sub-agents to each step of the plan, verifying changes before moving forward
5. Clarification - Asks questions if uncertain about any aspect of the work
6. Completion - Opens pull requests and listens for feedback from you or CI/scanners

## Data retention

Chats and tasks expire after 90 days, at which point the task logs and chat messages are deleted and no longer available. Any pull requests, code changes, or conversations on GitHub issues or pull requests are not deleted.

## Limits

You can execute up to 10 concurrent tasks. Additional tasks will be queued and start automatically when a slot becomes available.

Usage is subject to weekly limits during the preview. Limits reset each week, and there is no additional cost to use Kiro autonomous agent during the preview period.

## Web search

Kiro autonomous agent can search the web to access current information in real-time. This enables the agent to get up-to-date answers about topics that may have changed since the model's training data was created.

Web search capabilities have been designed to not reproduce meaningful chunks of text and should not be able to access webpages behind paywalls, authentication, and similar access restrictions. Search results may vary over time as internet content changes. Some content may not be accessible through web search due to various restrictions or the nature of the content.

Citations are provided for output that incorporates web search or grounded information. You can follow a provided citation to the source page.

## Learn more