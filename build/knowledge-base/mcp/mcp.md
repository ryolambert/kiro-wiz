---
title: "Model context protocol (MCP) - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/mcp/"
category: "mcp"
lastUpdated: "2026-02-07T05:52:06.466Z"
---
# Model context protocol (MCP)

---

Model Context Protocol (MCP) extends Kiro's capabilities by connecting to specialized servers that provide additional tools and context. This guide helps you set up, configure, and use MCP servers with Kiro.

## What is MCP?

MCP is a protocol that allows Kiro to communicate with external servers to access specialized tools and information. For example, the AWS Documentation MCP server provides tools to search, read, and get recommendations from AWS documentation directly within Kiro.

With MCP, you can:

- Access specialized knowledge bases and documentation
- Integrate with external services and APIs
- Extend Kiro's capabilities with domain-specific tools
- Create custom tools for your specific workflows

## Setting up MCP

### Prerequisites

Before using MCP, make sure you have:

1. The latest version of Kiro installed
2. Any specific prerequisites for the MCP servers you want to use (listed in each server's documentation)

## Managing MCP servers

### Enabling MCP support

After creating your configuration file:

1. Open Settings with Cmd + , (Mac) or Ctrl + , (Windows/Linux)
2. Search for "MCP"
3. Enable the MCP support setting

### Using the MCP servers tab

The Kiro panel includes an MCP servers tab that shows:

- All configured MCP servers
- Connection status indicators
- Quick access to server tools

To use this feature:

1. Select the Kiro icon in the activity bar
2. Navigate to the MCP servers tab
3. Click any tool name to insert a placeholder prompt in the chat

## Troubleshooting

If you encounter issues with MCP servers:

### Checking MCP logs

1. Open the Kiro panel
2. Select the Output tab
3. Choose "Kiro - MCP Logs" from the dropdown

### Common issues and solutions

| Issue | Solution |
| --- | --- |
| Connection failures | Verify prerequisites are installed correctly |
| Permission errors | Check that tokens and API keys are valid |
| Tool not responding | Review MCP logs for specific error messages |
| Configuration not loading | Validate JSON syntax and save the config file |

## Additional resources

- Official MCP Documentation

## Next steps

Now that you have created a MCP server, you can further learn about MCP servers here:

- Configuring MCPs - Learn about configuring Model Context Protocol (MCP) servers
- MCP Server management - Learn how to use common MCP servers with examples
- Using MCP Tools - Learn how to effectively use MCP tools with Kiro
- Best Practices - Best practices for effective MCP usage