---
title: "Introducing remote MCP servers"
sourceUrl: "https://kiro.dev/blog/introducing-remote-mcp/"
category: "blog"
lastUpdated: "2026-02-07T05:52:41.788Z"
---
Model Context Protocol, also known as MCP, has become the standard for agents to connect to tools and external systems. It has become the universal interface for executing functions, accessing files, and running prompts. MCP is widely used among AI coding assistants, to help extend the capabilities of the underlying large language models.

MCP has evolved significantly since Anthropic announced it in November 2024. While agents initially connected primarily to locally-running MCP servers, remote MCP server connections have become increasingly common. Remote servers extend agent capabilities, allowing them to go beyond the local environment. Servers running remotely can more easily connect to data sources, internet-hosted tools, and services. For example, you could connect to a remote MCP server that has access to your note taking service. They can also be more properly secured. This opens up the endless possibilities of integrations and scenarios for you as a user.

Kiro users love our local MCP server support, and we've seen so many interesting applications built by combining specs, steering, and hooks with MCP. To take this to the next level, we are proud to announce remote MCP server support and one-click MCP installation — features that make working with Kiro and building apps just a little bit easier.

## Remote MCP Servers Explained

Remote MCP server support allows you to connect to MCP servers hosted on the internet instead of your local machine. The underlying specification is the same. Remote MCP servers still expose prompts, tools, resources, that you’re used to, but the protocol is different. Instead of using stdio, which you would use if you were connecting locally on your computer, you can now connect via Streamable HTTP.

Streamable HTTP handles client connections. It has the added benefit of using Server-Sent Events (SSE) to help stream multiple server messages. Streamable HTTP offers additional features including resumability, redelivery, session management, and backward compatibility. It’s worth noting that Kiro supports both Streamable HTTP as well as the deprecated HTTP+SSE transport protocols. With Kiro, you won't need to worry about these underlying technologies, everything just works.

## Using Remote MCP support in Kiro

While Kiro has always supported local MCP servers (or remote servers via proxy), it now has native support for remote MCP servers. With just a few steps, you can add a remote MCP server and start using it. If needed, you can add an authorization header or authorize directly via dynamic client registration. With dynamic client registration, Kiro will ask you to open a webpage to sign in and authorize.

Let's walk through adding a Notion MCP server with dynamic client registration.

**Step 1:** Open Kiro and from the Kiro panel navigate to the MCP servers section

**Step 2:** Add your remote MCP server configuration. After saving, you'll see a popup in the lower right corner to authenticate the server

**Step 3:** Click authenticate and allow Kiro to open the external website. After you sign in, you'll be able to use the Notion MCP server

## Securing MCP Connections

MCP servers often require API keys or authentication tokens. Hard-coding these in configuration files creates risk—they can accidentally get committed to version control or exposed in screenshots. Kiro now supports environment variables using the `${ENV_VAR}` syntax. Your credentials stay in your local environment, never in configuration files.

Here's an example connecting to a server that needs a Bearer token:

When Kiro detects a new environment variable, you'll get a security prompt to approve it. This prevents malicious configurations from accessing your environment without permission. You can manage approved variables in settings and revoke access anytime.

This keeps your credentials local, makes them easy to rotate, and prevents accidental exposure.

## Add servers with a single click

Adding MCP servers to Kiro is now easier than ever. With the new `Add to Kiro` button, you can install MCP servers with a single click. When you click the button, Kiro prompts you to approve the configuration, then automatically adds the server to your user config setup.

We've curated a [collection of sample MCP servers](/docs/mcp/servers/) to help you get started, including:

## Get Started Today

If you're like us and love MCP servers, you'll love our new features: remote MCP support, environment variables, and one-click MCP install. To get started, update to the latest version of Kiro and try these features today. Let us know what you think!

Check out the [remote MCP server documentation](/docs/mcp/configuration/) for more details, or browse the [sample servers](/docs/mcp/servers/) to find one to try.