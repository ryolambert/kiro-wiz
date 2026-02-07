---
title: "Hooks - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/hooks/"
category: "cli"
lastUpdated: "2026-02-07T05:52:27.259Z"
---
# Hooks

---

Hooks allow you to execute custom commands at specific points during agent lifecycle and tool execution. This enables security validation, logging, formatting, context gathering, and other custom behaviors.

## Defining hooks

Hooks are defined in the agent configuration file. See the [Agent Configuration Reference](/docs/cli/custom-agents/configuration-reference#hooks-field) for the complete syntax and examples.

## Hook event

Hooks receive hook event in JSON format via STDIN:

```json
{
  "hook_event_name": "agentSpawn",
  "cwd": "/current/working/directory"
}

```

For tool-related hooks, additional fields are included:

- tool_name: Name of the tool being executed
- tool_input: Tool-specific parameters (see individual tool documentation)
- tool_response: Tool execution results (PostToolUse only)

## Hook output

- Exit code 0: Hook succeeded. STDOUT is captured but not shown to user.
- Exit code 2: (PreToolUse only) Block tool execution. STDERR is returned to the LLM.
- Other exit codes: Hook failed. STDERR is shown as warning to user.

## Tool matching

Use the `matcher` field to specify which tools the hook applies to. You can use either canonical tool names or their aliases.

### Examples

- "fs_write" or "write" - Match write tool
- "fs_read" or "read" - Match read tool
- "execute_bash" or "shell" - Match shell command execution
- "use_aws" or "aws" - Match AWS CLI tool
- "@git" - All tools from git MCP server
- "@git/status" - Specific tool from git MCP server
- "*" - All tools (built-in and MCP)
- "@builtin" - All built-in tools only
- No matcher - Applies to all tools

Hook matchers support both canonical names (`fs_read`, `fs_write`, `execute_bash`, `use_aws`) and their aliases (`read`, `write`, `shell`, `aws`). Use whichever you prefer.

For complete tool reference format, see [Agent Configuration Reference](/docs/cli/custom-agents/configuration-reference#tools-field).

## Hook types

### AgentSpawn

Runs when agent is activated. No tool context provided.

**Hook Event**

```json
{
  "hook_event_name": "agentSpawn",
  "cwd": "/current/working/directory"
}

```

**Exit Code Behavior:**

- 0: Hook succeeded, STDOUT is added to agent's context
- Other: Show STDERR warning to user

### UserPromptSubmit

Runs when user submits a prompt. Output is added to conversation context.

**Hook Event**

```json
{
  "hook_event_name": "userPromptSubmit",
  "cwd": "/current/working/directory",
  "prompt": "user's input prompt"
}

```

**Exit Code Behavior:**

- 0: Hook succeeded, STDOUT is added to agent's context
- Other: Show STDERR warning to user

### PreToolUse

Runs before tool execution. Can validate and block tool usage.

**Hook Event**

```json
{
  "hook_event_name": "preToolUse",
  "cwd": "/current/working/directory",
  "tool_name": "read",
  "tool_input": {
    "operations": [
      {
        "mode": "Line",
        "path": "/current/working/directory/docs/hooks.md"
      }
    ]
  }
}

```

**Exit Code Behavior:**

- 0: Allow tool execution.
- 2: Block tool execution, return STDERR to LLM.
- Other: Show STDERR warning to user, allow tool execution.

### PostToolUse

Runs after tool execution with access to tool results.

**Hook Event**

```json
{
  "hook_event_name": "postToolUse",
  "cwd": "/current/working/directory",
  "tool_name": "read",
  "tool_input": {
    "operations": [
      {
        "mode": "Line",
        "path": "/current/working/directory/docs/hooks.md"
      }
    ]
  },
  "tool_response": {
    "success": true,
    "result": ["# Hooks\n\nHooks allow you to execute..."]
  }
}

```

**Exit Code Behavior:**

- 0: Hook succeeded.
- Other: Show STDERR warning to user. Tool already ran.

### Stop

Runs when the assistant finishes responding to the user (at the end of each turn).
This is useful for running post-processing tasks like code compilation, testing, formatting,
or cleanup after the assistant's response.

**Hook Event**

```json
{
  "hook_event_name": "stop",
  "cwd": "/current/working/directory"
}

```

**Exit Code Behavior:**

- 0: Hook succeeded.
- Other: Show STDERR warning to user.

**Note**: Stop hooks do not use matchers since they don't relate to specific tools.

### MCP Example

For MCP tools, the tool name includes the full namespaced format including the MCP Server name:

**Hook Event**

```json
{
  "hook_event_name": "preToolUse",
  "cwd": "/current/working/directory",
  "tool_name": "@postgres/query",
  "tool_input": {
    "sql": "SELECT * FROM orders LIMIT 10;"
  }
}

```

## Timeout

Default timeout is 30 seconds (30,000ms). Configure with `timeout_ms` field.

## Caching

Successful hook results are cached based on `cache_ttl_seconds`:

- 0: No caching (default)
- > 0: Cache successful results for specified seconds
- AgentSpawn hooks are never cached