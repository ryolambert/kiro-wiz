# MCP Servers Best Practices

> MCP Servers — best-practices

## Server Types

| Type | Config | Use Case |
| --- | --- | --- |
| Local stdio | command + args | Development, single-user |
| Remote HTTP/SSE | url + headers | Shared team use |

## Patterns

- One tool per concern (single responsibility)
- Return structured errors with descriptive messages
- Implement graceful degradation for unavailable backends
- Cache frequently requested data with configurable TTL
- Use environment variables for secrets, never hardcode

## Anti-Patterns

- Exposing too many tools in a single server
- Missing error classification (all errors look the same)
- Hardcoded API keys or secrets in mcp.json
- No health check endpoint for monitoring

## Related Resources

- [MCP Servers in Master Reference](../master-reference.md#mcp-server)
- [MCP Servers examples](./examples.md)
- [MCP Servers templates](./templates.md)
