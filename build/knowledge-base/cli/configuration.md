---
title: "Configuration - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/mcp/configuration/"
category: "cli"
lastUpdated: "2026-02-07T05:52:23.927Z"
---
# Configuration

---

This guide provides detailed information on configuring Model Context Protocol (MCP) servers with Kiro CLI, including configuration file structure, server setup, and management.

## Configuration file structure

MCP configuration files use JSON format with the following structure:

```json
{
  "mcpServers": {
    "local-server-name": {
      "command": "command-to-run-server",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR1": "hard-coded-variable",
        "ENV_VAR2": "${EXPANDED_VARIABLE}"
      },
      "disabled": false,
      "disabledTools": ["tool_name3"]
    },
    "remote-server-name": {
      "url": "https://endpoint.to.connect.to",
      "headers": {
        "HEADER1": "value1",
        "HEADER2": "value2"
      },
      "disabled": false,
      "disabledTools": ["tool_name3"]
    }
  }
}

```

### Configuration properties

#### Local server

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| command | String | Yes | The command to run the MCP server |
| args | Array | Yes | Arguments to pass to the command |
| env | Object | No | Environment variables for the server process |
| disabled | Boolean | No | Whether the server is disabled (default: false) |
| autoApprove | Array | No | Tool names to auto-approve without prompting |
| disabledTools | Array | No | Tool names to omit when calling the Agent |

#### Remote server

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| url | String | Yes | HTTPS endpoint for the remote MCP server (or HTTP endpoint for localhost) |
| headers | Object | No | Headers to pass to the MCP server during connection |
| env | Object | No | Environment variables for the server process |
| disabled | Boolean | No | Whether the server is disabled (default: false) |
| autoApprove | Array | No | Tool names to auto-approve without prompting |
| disabledTools | Array | No | Tool names to omit when calling the Agent |

## Example configurations

### Local server with environment variables

```json
{
  "mcpServers": {
    "web-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-bravesearch"
      ],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}

```

### Remote server with headers

```json
{
  "mcpServers": {
    "api-server": {
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}",
        "X-Custom-Header": "value"
      }
    }
  }
}

```

### Multiple servers

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git"],
      "env": {
        "GIT_CONFIG_GLOBAL": "/dev/null"
      }
    },
    "aws-docs": {
      "command": "npx",
      "args": ["-y", "@aws/aws-documentation-mcp-server"]
    }
  }
}

```

## MCP server loading priority

When multiple configurations define the same MCP server, they are loaded based on this hierarchy (highest to lowest priority):

1. Agent Config - mcpServers field in agent JSON
2. Workspace MCP JSON - .kiro/settings/mcp.json
3. Global MCP JSON - ~/.kiro/settings/mcp.json

### Example scenarios

**Complete override:**

```
Agent config:     { "fetch": { command: "fetch-v2" } }
Workspace config: { "fetch": { command: "fetch-v1" } }
Global config:    { "fetch": { command: "fetch-old" } }

Result: Only "fetch-v2" from agent config is used

```

**Additive (different names):**

```
Agent config:     { "fetch": {...} }
Workspace config: { "git": {...} }
Global config:    { "aws": {...} }

Result: All three servers are used (fetch, git, aws)

```

**Disable via override:**

```
Agent config:     { "fetch": { command: "...", disabled: true } }
Workspace config: { "fetch": { command: "..." } }

Result: No fetch server is launched

```

## Environment variables

Many MCP servers require environment variables for authentication or configuration. Use the `${VARIABLE_NAME}` syntax to reference environment variables:

```json
{
  "mcpServers": {
    "server-name": {
      "env": {
        "API_KEY": "${YOUR_API_KEY}",
        "DEBUG": "true",
        "TIMEOUT": "30000"
      }
    }
  }
}

```

Make sure to set these environment variables in your shell before running Kiro CLI:

```bash
export YOUR_API_KEY="your-actual-key"
export DEBUG="true"

```

## Disabling servers

To temporarily disable an MCP server without removing its configuration:

```json
{
  "mcpServers": {
    "server-name": {
      "disabled": true
    }
  }
}

```

## Disabling specific tools

To prevent an agent from using specific tools from an MCP server:

```json
{
  "mcpServers": {
    "server-name": {
      "disabledTools": ["delete_file", "execute_command"]
    }
  }
}

```

## Viewing loaded servers

To see which MCP servers are currently loaded in an interactive chat session:

```bash
/mcp

```

This displays all active MCP servers and their available tools.

## Troubleshooting configuration

1. Validate JSON syntax
  - Ensure your JSON is valid with no syntax errors:
  - Check for missing commas, quotes, or brackets
  - Use a JSON validator or linter
2. Verify command paths
  - Make sure the command specified exists in your PATH
  - Try running the command directly in your terminal
3. Check environment variables
  - Verify that all required environment variables are set
  - Check for typos in environment variable names
4. Review configuration loading

bash# Check workspace config
cat .kiro/settings/mcp.json

# Check user config
cat ~/.kiro/settings/mcp.json
  - Check which configuration files are being loaded and their priority:

## Security considerations

When configuring MCP servers, follow these security best practices:

- Use environment variable references (e.g., ${API_TOKEN}) instead of hardcoding sensitive values
- Never commit configuration files with credentials to version control
- Only connect to trusted remote servers
- Use disabledTools to restrict access to dangerous operations

For comprehensive security guidance, see the [MCP Security Best Practices](/docs/cli/mcp/security) page.