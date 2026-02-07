# MCP Servers Templates

> MCP Servers — templates

## MCP Server Starter Template

### mcp.json (local)

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "command": "{{COMMAND}}",
      "args": ["{{ARG_1}}"]
    }
  }
}
```

### mcp.json (remote)

```json
{
  "mcpServers": {
    "{{SERVER_NAME}}": {
      "url": "{{SERVER_URL}}",
      "headers": {
        "Authorization": "Bearer ${{{ENV_VAR}}}"
      }
    }
  }
}
```

## Related Resources

- [MCP Servers in Master Reference](../master-reference.md#mcp-server)
- [MCP Servers best-practices](./best-practices.md)
- [MCP Servers examples](./examples.md)
