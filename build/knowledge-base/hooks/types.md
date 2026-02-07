---
title: "Hook types - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/hooks/types/"
category: "hooks"
lastUpdated: "2026-02-07T05:52:05.021Z"
---
# Hook types

---

Agent Hooks support various trigger types, each designed for specific automation scenarios. Understanding these types helps you choose the right approach for your workflow needs.

## Prompt Submit

Triggers when the user submits a prompt.

When using the shell command action, the user prompt can be accessed via the `USER_PROMPT` environment variable.

**Use Cases:**

- Provide additional context to the agent relevant to the prompt
- Block certain prompts based on their content
- Log all user prompts to a central location

## Agent Stop

Triggers when the agent has completed its turn, and finished responding to the user.

**Use Cases:**

- Compile code and report any failures to the agent
- Format or review any agent-generated code
- Review changes made by agent and provide additional instructions

## Pre Tool Use

Triggers when the agent is about to invoke a tool.

In the **Tool name** field, provide the names of the specific tools — built-in or MCP — for which this hook should execute. Wildcarding (e.g., "*") is supported. You can ask Kiro for the names of the available tools. The following special tool names are supported:

- read to refer to all built-in file read tools
- write to refer to all built-in file write tools
- shell to refer to all built-in shell command-related tools
- web to refer to all built-in web tools

**Use Cases:**

- Block certain tool invocations
- Provide additional instructions to the agent before it invokes a tool

## Post Tool Use

Triggers after the agent has invoked a tool.

For details on the **Tool name** field, refer to the [Pre Tool Use](#pre-tool-use) section above.

**Use Cases:**

- Log tool invocations for auditing purposes
- Format or review any updated files after a "write" tool call
- Provide additional instructions to the agent on top of the tool response

## File Create

Triggers when new files matching specific patterns are created in your workspace.

**Use Cases:**

- Generate boilerplate code for new components
- Add license headers to new files
- Set up test files when creating implementation files

## File Save

Trigger when files matching specific patterns are saved.

**Use Cases:**

- Run linting and formatting
- Update related files
- Generate documentation
- Run tests for changed files

## File Delete

Triggers when files matching specific patterns are deleted.

**Use Cases:**

- Clean up related files
- Update import references in other files
- Maintain project integrity

## Manual Trigger

Manually execute a hook.

**Use Cases:**

- On-demand code reviews
- Documentation generation
- Security scanning
- Performance optimization