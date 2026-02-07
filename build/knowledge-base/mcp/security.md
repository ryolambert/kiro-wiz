---
title: "Best practices - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/mcp/security/"
category: "mcp"
lastUpdated: "2026-02-07T05:52:07.500Z"
---
# Best practices

---

This guide outlines security best practices for configuring and using Model Context Protocol (MCP) servers with Kiro, helping you protect sensitive information and maintain system security.

## Understanding MCP security

MCP servers extend Kiro's capabilities by connecting to external services and APIs. Since all MCP servers are third-party code, this introduces potential security considerations that should be addressed:

- Access to sensitive information: MCP servers may require API keys or tokens
- External code execution: MCP servers run code outside of Kiro's sandbox
- Data transmission: Information flows between Kiro and external services
- Source verification: Review the source code and verify the server comes from a trusted source before using
- Isolation: Run servers in isolated environments when possible and limit the permissions granted

## Secure configuration

### Protecting API keys and tokens

1. Never commit configuration files with sensitive tokens to version control
2. Create tokens with minimal permissions necessary for the MCP server to function (for example, use fine-grained personal access tokens for GitHub instead of classic tokens)
3. Limit access scope to only the repositories or resources needed
4. Regularly rotate API keys and tokens used in configurations
5. Use environment variables when possible instead of hardcoding values

### Example: Using environment variables

Instead of hardcoding tokens in your configuration:

```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}

```

Set the environment variable in your shell:

```bash
export GITHUB_TOKEN=your-token-value

```

### Approved environment variables

For security, Kiro only expands environment variables that are explicitly approved. Only variables in the approved list will be expanded when found in MCP config files.

When you add or modify an MCP server configuration that includes unapproved environment variables, Kiro displays a security warning popup listing the variables that need approval. You can approve them directly from the popup or manage them in settings.

To manage approved environment variables:

1. Open Kiro settings
2. Search for "Mcp Approved Env Vars"
3. Add the environment variables you want to allow for expansion

This prevents MCP servers from accessing arbitrary environment variables on your system.

### Configuration file permissions

Restrict access to your MCP configuration files:

```bash
# Set restrictive permissions on user-level config
chmod 600 ~/.kiro/settings/mcp.json

# Set restrictive permissions on workspace-level config
chmod 600 .kiro/settings/mcp.json

```

## Safe tool usage

### Tool approval process

1. Review each tool request carefully before approval
2. Check the parameters being passed to the tool
3. Understand what the tool will do before approving it
4. Deny any suspicious requests that don't match your current task

### Auto-approval guidelines

Only auto-approve tools that:

1. Don't have write access to sensitive systems
2. Come from trusted sources with verified code
3. Are used frequently in your workflow
4. Have limited scope of what they can access

```json
{
  "mcpServers": {
    "aws-docs": {
      "autoApprove": [
        "mcp_aws_docs_search_documentation", 
        "mcp_aws_docs_read_documentation"
      ]
    }
  }
}

```

## Workspace isolation

### Using workspace-level configurations

Use workspace-level configurations for project-specific MCP servers:

```
project-a/
├── .kiro/
│   └── settings/
│       └── mcp.json  # Project A specific servers
project-b/
├── .kiro/
│   └── settings/
│       └── mcp.json  # Project B specific servers

```

This ensures that:

- MCP servers only run when working in the relevant project
- Tokens and configurations are isolated between projects
- Security risks are contained to specific workspaces

## Monitoring and auditing

### Checking MCP logs

Regularly review MCP logs to monitor server activity:

1. Open the Kiro panel
2. Select the Output tab
3. Choose "Kiro - MCP Logs" from the dropdown

### Auditing tool usage

Periodically review which tools you've approved:

1. Check your MCP configuration for auto-approved tools
2. Review the MCP logs for tool usage patterns
3. Monitor server activity for unexpected behavior
4. Remove auto-approval for tools you no longer use frequently

## Responding to security incidents

If you suspect a security issue with an MCP server:

1. Disable the server immediately in your configuration
2. Revoke any tokens or API keys associated with the server
3. Check for unauthorized activity in the connected services
4. Report the issue to the MCP server maintainer

## Additional security measures

### Network security

1. Use firewalls to restrict outbound connections from MCP servers
2. Consider using a VPN for sensitive MCP server connections
3. Monitor network traffic to and from MCP servers

### System security

1. Keep your system updated with security patches
2. Run MCP servers with minimal privileges
3. Use separate user accounts for running sensitive MCP servers