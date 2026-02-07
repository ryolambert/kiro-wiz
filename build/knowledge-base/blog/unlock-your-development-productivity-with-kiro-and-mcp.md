---
title: "Unlock your development productivity with Kiro and Model Context Protocol (MCP)"
sourceUrl: "https://kiro.dev/blog/unlock-your-development-productivity-with-kiro-and-mcp/"
category: "blog"
lastUpdated: "2026-02-07T05:52:43.527Z"
---
I’ve found [Kiro](/) to be a personal development accelerator through its built-in capabilities. Using tools to read and write files or execute bash scripts, Kiro turns ideas into reality through features like [spec-driven development](/docs/specs/), autopilot, and [agent hooks](/docs/hooks/). However, as part of a development team, there are times when the built-in tools aren't enough. This is where [Model Context Protocol (MCP)](/docs/mcp/) takes Kiro to the next level. Working on development teams, we often need additional interactions and data access, like:

- Internal knowledge base integration - Connecting to company documentation, wikis, and knowledge repositories.
- Custom API access - Interacting with internal services and organization-specific APIs.
- Project management tools - Integrating with Jira, Asana, GitLab, and other systems to provide ticket and task context.
- Database access - Database querying and analysis within the IDE.
- CI/CD pipeline integration - Connecting to GitLab, GitHub Actions, Jenkins, and other CI/CD tools for build and deployment status.
- Code quality tools - Linking to SonarQube, Code Climate, or similar tools for code quality insights.
- Monitoring systems - Accessing metrics and logs from Prometheus, Grafana, and other monitoring tools.
- Infrastructure management -Interacting with infrastructure-as-code tools and cloud resources.

## Enter Model Context Protocol (MCP)

MCP is a game-changing open source protocol from Anthropic that solves a critical challenge: giving AI models secure, consistent access to your tools and data, wherever they live. Think of it as a universal translator that lets Kiro seamlessly communicate with all your development tools and services.

## Getting Started with Kiro + MCP

Kiro has a built-in MCP client that can be used to extend its capabilities to communicate securely and flexibly with external data sources and tools. To enable one or more MCP servers within Kiro:

1. Set up MCP servers on your local machine
2. Add and configure the MCP servers within Kiro
3. Start using MCP server tools within the Kiro chat session

Kiro communicates with MCP servers through standard input/output (stdio) using a simple JSON-based request-response pattern. Here’s how it works:

Note that while MCP servers run on the same local machine as Kiro, they can communicate with both local data systems (such as PostgreSQL databases) and remote services (such as GitLab).

## Enabling Use of MCP Servers in Kiro

MCP servers in Kiro can be configured at two levels:

- Workspace - Specific to current project/workspace, stored in .kiro/settings/mcp.json.
- User - Applies across all projects/workspaces, stored in your home directory (~/.kiro/settings/mcp.json)

To configure a user-scoped MCP server:

- Select Kiro from the activity bar
- Expand MCP SERVERS
- Open either Workspace or User Config

## Bring GitLab’s Planning Capabilities to Kiro

Development teams commonly use centralized tools for collaboration, planning, and software management. GitLab, for example, is an all-in-one tool for planning, development, and delivery. In my developer workflow, I use GitLab not only to manage code and builds but also to plan tasks such as features and bugs.

If we drill into one of the features:

Instead of context switching, let’s get Kiro to read the issues from GitLab and implement them.

## Configure a GitLab MCP Server

For this blog post, I’m using an open-source MCP server for GitLab: [https://gitlab.com/fforster/gitlab-mcp](https://gitlab.com/fforster/gitlab-mcp) . The README contains instructions for configuring the GitLab MCP server, in my example I’ve built a binary from the source code.

After generating a [personal access token](https://docs.gitlab.com/user/profile/personal_access_tokens/) from my GitLab profile, I can configure my Kiro MCP Server user config as:

Note that the Kiro user configuration is located in .kiro/settings/mcp.json.

If the configuration is correct, Kiro will return the new tools available from the MCP server:

There are a number of tools that are useful here, such as **get_issue**, **list_project_issues. **Let’s explore how to use them.

## Syncing GitLab Issues with Kiro's Spec-driven Development

I want to leverage Kiro’s agent spec-driven development to implement the issues listed in GitLab. Now that I have the GitLab MCP server configured, I can use natural language to explain that I want Kiro to create requirements documents for all of the issues listed against my product.

Within the Kiro chat window we’ll select **Spec** as we want to implement the GitLab issues in a structured way. The next step is to prompt Kiro to create specs for the GitLab issues:

When encountering a new tool for the first time, such as **list_project_issues**, Kiro will prompt me to approve first before executing the request:

Note that the **autoApprove** setting within the MCP configuration can also be used to control whether Kiro automatically approves tool execution requests without prompting the user:

Once the issues have been retrieved from the GitHub project, Kiro begins by creating a spec for each GitLab issue:

Kiro has a specific menu where the specs are stored, these are also located in the .kiro directory within the project workspace:

From here, I can use Kiro to create a design document that includes details such as technical architecture decisions, system component interactions, data models and flows, API specifications, security considerations, and performance requirements.

The final step in this three-phase approach involves breaking down the design into actionable tasks with clear definitions of done and implementation details.

Once the planning for the GitLab issues is complete, the features can be built in a structured way by starting the tasks within the task list:

## Take Your Development to the Next Level

Kiro's MCP integration isn’t just another feature – it’s a fundamental shift in how AI can integrate with your development workflow. By connecting Kiro directly to your tools and services, you’ll spend less time context-switching and more time building.

Get started with Kiro for free or view the documentation to learn more about Kiro’s capabilities.

Read more about Model Context Protocol via the [user guide](https://modelcontextprotocol.io/introduction) and see the reference implementations on the [Model Context Protocol servers page](https://github.com/modelcontextprotocol/servers).

Can’t find an MCP server that meets your requirements? Consider creating your own MCP server with Kiro.

Let’s connect - tag @kirodotdev on [X](https://x.com/kirodotdev), [LinkedIn](https://www.linkedin.com/showcase/kirodotdev), or [Instagram](https://www.instagram.com/kirodotdev), and @kiro.dev on [Bluesky](https://bsky.app/profile/kiro.dev), and share what you’ve #builtwithkiro