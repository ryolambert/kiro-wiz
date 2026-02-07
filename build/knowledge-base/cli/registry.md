---
title: "MCP Registry - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/mcp/registry/"
category: "cli"
lastUpdated: "2026-02-07T05:52:24.151Z"
---
# MCP Registry

---

Enterprise MCP server governance allowing administrators to control which servers users can access.

If you're an administrator setting up the MCP registry, see [MCP Governance](/docs/cli/mcp/governance) for configuration instructions.

## Overview

Pro-tier customers using IAM Identity Center can have MCP server access controlled through an MCP registry. When configured by administrators, users can only use MCP servers explicitly allowed in the registry. Provides centralized governance for enterprise deployments.

## How it works

**Without Registry** (default):

- Users can add any MCP server
- Servers configured in agent files or via CLI
- No central control

**With Registry** (enterprise):

- Administrator configures allowed servers
- Users select from registry list
- Cannot add custom servers
- Centralized governance and security

## Adding servers

### In chat

```
/mcp add

```

Shows interactive list of servers from organization's registry.

### From command line

```bash
# Add specific server
kiro-cli mcp add --name myserver

# Add to workspace
kiro-cli mcp add --scope workspace

# Add to specific agent
kiro-cli mcp add --agent myagent

# Interactive selection
kiro-cli mcp add

```

Server name must match registry. Cannot add custom servers in registry mode.

## Removing servers

### In chat

```
/mcp remove

```

Interactive menu to select server to remove.

### From command line

```bash
kiro-cli mcp remove --name <server-name>

```

## Viewing available servers

### In chat

```
/mcp list

```

Shows:

- All locally configured MCP servers
- Server status and configuration
- Available tools from each server

## Customization

Even with registry mode enabled, you can customize:

### Local (stdio) servers

- Environment variables (API keys, paths)
- Request timeout
- Server scope (Global/Workspace/Agent)
- Tool trust settings

### Remote (HTTP) servers

- HTTP headers (authentication tokens)
- Request timeout
- Server scope
- Tool trust settings

Custom values override registry defaults, allowing personal credentials and configuration.

## Examples

### Add registry server

```
/mcp add

```

**Output**:

```
Select MCP server from registry:
  git-server (Git operations)
  github-server (GitHub integration)
  aws-tools (AWS operations)

```

### Add to specific agent

```bash
kiro-cli mcp add --name git-server --agent rust-dev

```

Adds git-server to rust-dev agent configuration.

### Customize with environment variables

```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "args": ["--stdio"],
      "env": {
        "GITHUB_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}

```

Your token overrides registry defaults.

## Troubleshooting

### MCP functionality disabled

**Symptom**: Cannot use MCP at all

**Cause**: Organization disabled MCP entirely

**Solution**: Contact administrator for MCP access

### Failed to retrieve MCP settings

**Symptom**: Error fetching MCP configuration

**Cause**: Network issue or server error

**Solution**: Temporary issue - retry later or contact administrator

### Cannot add custom server

**Symptom**: Server not in list

**Cause**: Registry mode only allows registry servers

**Solution**: Request administrator add server to registry

### Server not in registry

**Symptom**: Needed server not available

**Cause**: Not added to organization's registry

**Solution**: Contact administrator to request server addition

## Limitations

- Registry mode only for Pro-tier with IAM Identity Center
- Cannot add servers not in registry
- Administrator controls available servers
- Custom servers not allowed in registry mode

## Technical details

**Registry source**: Configured by administrator at organization level

**Scope options**:

- Global: ~/.kiro/mcp.json
- Workspace: .kiro/mcp.json
- Agent-specific: In agent configuration

**Customization**: Environment variables and HTTP headers can be customized even in registry mode

**Fallback**: If registry unavailable, MCP functionality disabled

## Next steps

- Learn about MCP Configuration
- Review MCP Governance for administrators
- See MCP Examples
- Understand MCP Security