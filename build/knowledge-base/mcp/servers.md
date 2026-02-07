---
title: "Server directory - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/mcp/servers/"
category: "mcp"
lastUpdated: "2026-02-07T05:52:06.960Z"
---
# Server directory

---

Extend Kiro's capabilities with MCP servers that connect to external services, databases, and tools. Browse the directory below and click `Add to Kiro` for one-click installation.

MCP servers are third-party tools. Only install servers from trusted sources and review their documentation and licensing. Kiro is not responsible for third-party MCP servers.

## MCP server directory

| Name | Install | Description |
| --- | --- | --- |
| Amazon Devices Builder Tools MCP | + Add to Kiro | The Builder Tools MCP provides context and tools to develop, test, and debug apps for Amazon devices. For detailed and up-to-date capabilities, see the official documentation. Requires Node installed. |
| AWS Documentation | + Add to Kiro | Access to AWS documentation, search capabilities, and content recommendations. Requires UV Installed |
| Azure | + Add to Kiro | Interact with Azure services and resources. Requires Node installed |
| Chrome DevTools | + Add to Kiro | Control and inspect a live Chrome browser with DevTools for automation, debugging, and performance analysis. Requires Node installed |
| Context7 | + Add to Kiro | Up-to-date code documentation for any library or framework. Requires Node installed |
| Docker | + Add to Kiro | Manage Docker containers and images. Requires Node installed |
| Dynatrace | + Add to Kiro | Interact with Dynatrace Observability Platform. Requires Node installed |
| Filesystem | + Add to Kiro | Secure file operations within allowed directories. Requires Node installed |
| GCP | + Add to Kiro | Manage Google Cloud Platform resources. Requires Node installed |
| Git | + Add to Kiro | Read, search, and manipulate Git repositories. Requires UV Installed |
| GitHub | + Add to Kiro | Interact with GitHub repositories, issues, and pull requests. |
| Kubernetes | + Add to Kiro | Interact with Kubernetes clusters. Requires Node installed |
| LLM.txt | + Add to Kiro | Access to LLM.txt documentation and resources |
| Memory | + Add to Kiro | Knowledge graph-based persistent memory system for AI agents. Requires Node installed |
| MongoDB | + Add to Kiro | Interact with MongoDB databases. Requires Node installed |
| New Relic | + Add to Kiro | Monitor and analyze application performance with the New Relic observability platform. |
| Pinecone | + Add to Kiro | Vector database for semantic search, RAG workflows, and AI applications. Requires Node installed |
| Playwright | + Add to Kiro | Browser automation with Playwright for web scraping, screenshots, and test code generation. Requires Node installed |
| PostgreSQL | + Add to Kiro | Query and manage PostgreSQL databases. Requires Node installed |
| Sequential Thinking | + Add to Kiro | Dynamic and reflective problem-solving through iterative thinking. Requires Node installed |
| Strands Agent | + Add to Kiro | Access documentation about Strands Agents. Requires UV Installed |
| Web Search | + Add to Kiro | Search the web using Brave Search API. Requires Node installed |

## Share your MCP server

Create one-click installation links that let users add your MCP server to Kiro instantly.

### Install link schema

**URL Format:**

```
https://kiro.dev/launch/mcp/add?name=<server-name>&config=<url-encoded-config>

```

**Query Parameters:**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| name | String | Yes | Display name for the MCP server |
| config | String | Yes | URL-encoded JSON configuration object (see MCP Configuration for schema) |

### Generate an install link

Use these helper functions to programmatically create installation links for your MCP server. These links work universally across GitHub, web browsers, and documentation.

**JavaScript/TypeScript:**

```javascript
function createKiroInstallLink(name, config) {
  const encodedName = encodeURIComponent(name);
  const encodedConfig = encodeURIComponent(JSON.stringify(config));
  return `https://kiro.dev/launch/mcp/add?name=${encodedName}&config=${encodedConfig}`;
}

// Example 1: Local server with command execution
const localServerLink = createKiroInstallLink('aws-docs', {
  command: 'uvx',
  args: ['awslabs.aws-documentation-mcp-server@latest'],
  env: { FASTMCP_LOG_LEVEL: 'ERROR' },
  disabled: false,
  autoApprove: []
});

// Example 2: Remote server with URL endpoint
const remoteServerLink = createKiroInstallLink('aws-knowledge', {
  url: 'https://knowledge-mcp.global.api.aws',
  disabled: false,
  autoApprove: []
});

// Example 3: Server with environment variables
const dbServerLink = createKiroInstallLink('postgresql', {
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-postgres'],
  env: { POSTGRES_CONNECTION_STRING: 'postgresql://localhost:5432/mydb' },
  disabled: false,
  autoApprove: []
});

```

**Python:**

```python
import json
from urllib.parse import urlencode, quote

def create_kiro_install_link(name: str, config: dict) -> str:
    """
    Creates a Kiro install link for one-click MCP server installation
    
    Args:
        name: Display name for the MCP server
        config: MCP server configuration dictionary
        
    Returns:
        Formatted HTTPS install link URL
    """
    encoded_name = quote(name)
    encoded_config = quote(json.dumps(config))
    return f"https://kiro.dev/launch/mcp/add?name={encoded_name}&config={encoded_config}"

# Example usage
link = create_kiro_install_link('my-server', {
    'command': 'npx',
    'args': ['-y', '@myorg/my-mcp-server'],
    'disabled': False,
    'autoApprove': []
})

```

**Command Line (Bash):**

```bash
#!/bin/bash

# Function to create Kiro install link
create_kiro_link() {
  local name="$1"
  local config="$2"
  
  # URL encode the parameters
  local encoded_name=$(printf %s "$name" | jq -sRr @uri)
  local encoded_config=$(printf %s "$config" | jq -sRr @uri)
  
  echo "https://kiro.dev/launch/mcp/add?name=${encoded_name}&config=${encoded_config}"
}

# Example usage
CONFIG='{"command":"npx","args":["-y","@modelcontextprotocol/server-git"],"disabled":false,"autoApprove":[]}'
create_kiro_link "git" "$CONFIG"

```

### Add the Kiro badge

Include the `Add to Kiro` badge in your project's README or documentation to let users install your MCP server with a single click:

```html
<a href="https://kiro.dev/launch/mcp/add?name=my-server&config=%7B%22command%22%3A%22npx%22...%7D">
  <img src="https://kiro.dev/images/add-to-kiro.svg" alt="Add to Kiro" />
</a>

```

**Markdown:**

```markdown
[![Add to Kiro](https://kiro.dev/images/add-to-kiro.svg)](https://kiro.dev/launch/mcp/add?name=my-server&config=%7B%22command%22%3A%22npx%22...%7D)

```

When clicked, users are prompted to open Kiro with the server configuration pre-filled. If the prompt doesn't work, the page displays the server name and a retry button.

## Discover more MCP servers

The directory above features curated servers, but hundreds more are available in the MCP ecosystem.

### Official resources

- MCP Registry - Browse the official registry of community-contributed MCP servers with detailed documentation and installation instructions.
- Model Context Protocol Organization - Explore reference implementations and official servers maintained by the MCP team.

### Package registries

- npm (Node.js) - Search for mcp-server or @modelcontextprotocol/server-* to find JavaScript/TypeScript implementations.
- PyPI (Python) - Search for mcp-server or packages with MCP in the name to find Python implementations.