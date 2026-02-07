# MCP Servers Examples

> MCP Servers — examples

## Local MCP Server Config

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["dist/server"]
    }
  }
}
```

## Remote MCP Server Config

```json
{
  "mcpServers": {
    "shared-server": {
      "url": "https://mcp.example.com/sse",
      "headers": {
        "Authorization": "Bearer ${MCP_TOKEN}"
      }
    }
  }
}
```

## Related Resources

- [MCP Servers in Master Reference](../master-reference.md#mcp-server)
- [MCP Servers best-practices](./best-practices.md)
- [MCP Servers templates](./templates.md)
