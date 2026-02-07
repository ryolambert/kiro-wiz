---
title: "MCP - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/sandbox/mcp/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:36.922Z"
---
# MCP

---

The MCP (Model Context Protocol) configuration is loaded into the agent sandbox and available during task execution. This allows the agent to use specialized tools and access external data sources through MCP servers.

MCP servers are third-party tools. Only install servers from trusted sources and review their documentation and licensing. Kiro is not responsible for third-party MCP servers.

MCP servers require [Open Internet](/docs/autonomous-agent/sandbox/internet-access) access to function. Enabling network permissions exposes your environment to security risks. These include prompt injection attacks, extraction of code and secrets, introduction of malware or security flaws, and use of content that may violate licensing terms. Consider these risks carefully before enabling network permissions.

## Configuration

MCP servers are configured in your MCP configuration file. The configuration is loaded when the sandbox starts and remains available throughout task execution.

### Example configuration

```json
{
  "mcpServers": {
    "aws-knowledge-mcp-server": {
      "command": "uvx",
      "args": [
        "fastmcp",
        "run",
        "https://knowledge-mcp.global.api.aws"
      ],
      "env": {}
    }
  }
}

```

## Supported servers

Only local MCP servers are currently supported. Remote MCP servers are not available at this time.

## Using environment variables and secrets

You can reference [environment variables and secrets](/docs/autonomous-agent/sandbox/environment-variables) in your MCP configuration to securely pass credentials and configuration values to MCP servers.

Use the `${key_name}` syntax to reference the key names of your environment variables and secrets in the server configuration:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR_KEY": "${my_env_var_key}",
        "SECRET_KEY": "${my_secret_key}"
      }
    }
  }
}

```

Both environment variables and secrets use the same syntax. The values are resolved when the sandbox starts.