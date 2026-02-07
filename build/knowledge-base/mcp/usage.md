---
title: "Tools - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/mcp/usage/"
category: "mcp"
lastUpdated: "2026-02-07T05:52:07.203Z"
---
# Tools

---

This guide explains how to effectively use Model Context Protocol (MCP) tools with Kiro to enhance your productivity and access specialized capabilities.

## Interacting with MCP tools

Once you've [configured MCP servers](/docs/mcp/configuration), you can interact with their tools in several ways:

### Direct questions

The simplest way to use MCP tools is to ask questions related to the server's domain:

```
Tell me about Amazon Bedrock

```

```
How do I configure S3 bucket policies?

```

Kiro automatically selects the appropriate MCP tool based on your question.

### Specific tool requests

You can request specific MCP tools by describing what you want to do:

```
Search AWS documentation for information about ECS task definitions

```

```
Get recommendations for AWS CloudFormation best practices

```

### Explicit context

For more control, provide explicit context to the tool picker:

```
#[aws-docs] search_documentation Tell me about AWS Lambda

```

This format specifies both the server (`aws-docs`) and the tool (`search_documentation`).

## MCP tools panel

The Kiro panel includes an MCP servers tab that provides:

- A list of all configured MCP servers
- Connection status indicators
- Individual tool management
- Quick access to server tools

To access the MCP panel:

1. Select the Kiro icon in the activity bar
2. Navigate to the MCP servers tab
3. View all connected servers and their available tools

### Managing individual tools

Each MCP server can expose multiple tools. You can enable or disable specific tools without affecting the entire server:

**Via the Kiro Panel:**

1. Open the Kiro panel and navigate to MCP servers
2. Expand a server to see its available tools
3. Click on a tool to see options:
  - Enable - Activate a disabled tool
  - Disable - Temporarily disable a tool without removing the server
4. Disabled tools show a "Disabled" label and won't be available to Kiro

**Via JSON Config:**

Use the `disabledTools` array in your MCP configuration to permanently disable specific tools:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"],
      "disabledTools": ["delete_repository", "force_push", "merge_pull_request"]
    }
  }
}

```

This is useful for:

- Blocking dangerous operations (like delete or force push)
- Reducing tool clutter by hiding tools you don't use
- Improving performance by limiting the tools Kiro considers
- Enforcing team policies when sharing workspace configurations

### Server-level actions

Right-click on a server in the MCP panel to access additional options:

- Reconnect - Restart the connection to the server
- Disable - Temporarily disable the entire server
- Disable All Tools - Disable all tools from this server at once
- Enable All Tools - Re-enable all previously disabled tools
- Show MCP Logs - View detailed logs for troubleshooting

## Tool approval process

When Kiro wants to use an MCP tool, it requests your approval first:

1. You'll see a prompt describing the tool and its purpose
2. Review the tool details and parameters
3. Click "Approve" to allow the tool to run, or "Deny" to prevent it

### Auto-approving trusted tools

To avoid repeated approval prompts for tools you trust:

1. Edit your MCP configuration file
2. Add tool names to the autoApprove array:

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

1. Save the file (Cmd+S) to apply changes automatically

## Examples by server type

### AWS Documentation server

#### Searching documentation

```
Search AWS documentation for S3 bucket versioning

```

This uses the `mcp_aws_docs_search_documentation` tool to find relevant AWS documentation.

#### Reading documentation

```
Read the AWS Lambda function URLs documentation

```

This uses the `mcp_aws_docs_read_documentation` tool to retrieve and display documentation content.

#### Getting recommendations

```
Find related content to AWS ECS task definitions

```

This uses the `mcp_aws_docs_recommend` tool to suggest related documentation.

### GitHub MCP server

#### Repository information

```
Show me information about the tensorflow/tensorflow repository

```

This retrieves details about the specified GitHub repository.

#### Code search

```
Find examples of React hooks in facebook/react

```

This searches for code matching your query in the specified repository.

#### Issue management

```
Create an issue in my repository about the login bug

```

This helps you create a new GitHub issue with appropriate details.

## Advanced usage techniques

### Chaining MCP tools

You can use multiple MCP tools in sequence for complex tasks:

```
First search AWS documentation for ECS task definitions, then find related content about service discovery

```

### Combining with local context

MCP tools work best when combined with your local context:

```
Based on my Terraform code, help me optimize my AWS Lambda configuration using best practices from AWS documentation

```

### Using MCP tools in specs

You can use MCP tools within [Kiro Specs](/docs/specs) to enhance your development workflow:

```
In the implementation phase, use AWS documentation to ensure our S3 bucket configuration follows best practices

```

## Troubleshooting tool usage

If you encounter issues when using MCP tools:

### Tool not responding

1. Check the MCP server status in the Kiro panel
2. Review the MCP logs for error messages
3. Use the Ask Kiro feature to resolve errors

### Incorrect results

1. Try rephrasing your request to be more specific
2. Check that you're using the appropriate tool for your task
3. Verify that the MCP server has the necessary permissions

### Tool not available

1. Ensure the MCP server is properly configured
2. Check that the server is running and connected
3. Verify that you have the necessary permissions to use the tool

## Best practices

- Be specific in your requests to get the most relevant results
- Start with direct questions before using explicit tool references
- Auto-approve only tools you trust and use frequently
- Combine MCP tools with local context for best results
- Check tool parameters before approval to ensure they're correct

---

*For information on available MCP servers and their tools, see the MCP Servers page.*