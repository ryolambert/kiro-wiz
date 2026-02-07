---
title: "Kiro 0.9: Custom subagents in the IDE, new enterprise controls, and granular code review"
sourceUrl: "https://kiro.dev/blog/custom-subagents-skills-and-enterprise-controls/"
category: "blog"
lastUpdated: "2026-02-07T05:52:38.142Z"
---
This release brings new features in the IDE to give developers more control without slowing them down, while also giving enterprise teams the governance they need. We're shipping custom subagents, skills support, and smarter refactoring tools. Let's dive in.

## Custom subagents: build your own specialists

Subagents have been around for a few releases now, but they were general-purpose. Many of you have asked to be able to customize behavior to many different use cases.

Here's just one scenario that kept coming up: a team has a React frontend and a Python backend. One agent context handles both, which means loading tools for everything—Chrome DevTools, database MCP servers, component libraries, API docs. The context window fills up fast and performance begins to suffer.

Custom subagents let you split that up. Create a `frontend-agent` that knows about components and browser tooling. Create a `backend-agent` that loads your database server and API documentation. Each subagent stays focused and manages its own context.

## Enterprise teams get more controls and flexibility

Organization admins can now better manage access to plugins and tools.

**Extension Registry Governance** — Point Kiro IDE at your own VS Code extension registry. Security teams can curate what's available, and developers still get the extensions they need, just from a pre-approved list.

**Web Tools Toggle** - You can now enable or disable web tools (web search & web fetch) based on your workflow or security needs.

Organization admins have also asked us for user-level usage metrics across tools. We are actively working on this and will release a first version of this capability in the coming weeks.

## Agent skills: modular instructions that load when you need them

We're introducing support for Agent Skills, based on the open [agentskills.io](http://agentskills.io/) standard. Skills are modular instruction packages that teach the agent new capabilities. A good way to think of Skills is as expertise you can drop into your workflow.

Why do we need Skills when we have Steering and Powers? Steering files work great for always-on guidance, but sometimes you want specialized knowledge that only loads when relevant. A Terraform skill shouldn't consume context when you're writing React components. A security review skill shouldn't be active during routine refactoring. While powers solve this problem, they are a superset of skills and also include MCP servers and rules, which you may not need. Skills use progressive disclosure. At startup, Kiro only loads the name and description for each skill. When the agent determines a skill is relevant (or you explicitly request it), the full instructions load into context. This keeps your context window lean until you actually need the expertise.

You can install skills at the user level (`~/.kiro/skills/`) for capabilities you want everywhere, or at the workspace level for project-specific knowledge. Workspace skills take precedence when names collide, so teams can override global defaults. Each skill lives in its own directory with a `SKILL.md` file and can include scripts and resources the agent can reference.

The distinction from steering and powers is intentional. Steering files direct agent behavior—coding standards, project conventions, things that should always apply. Skills are capabilities the agent learns on demand. Both show up in the same UI, but they serve different purposes and load differently.

For teams already using skills with other AI coding tools, the format is compatible. Just drop your existing skills into the `.kiro/skills/` directory and they work.

## Smart agent refactoring

Refactoring isn't just find-and-replace at scale—it's a graph traversal problem across workspaces. When you rename a symbol or move a file, the changes cascade across various call sites, import statements, and so on. As a result, agents often stumble when refactoring by missing some of these references references or taking too many turns to update them.

To fix this, we created two new refactoring tools that expose IDE refactoring capabilities—powered by language servers—directly to agents. With these tools, when an agent needs to rename a symbol or move a file, it picks the right refactoring tool and invokes it, so cascading updates are applied automatically and reliably.

Early use shows that agents complete refactoring operations faster end-to-end, while producing fewer build, compile, and runtime errors as a result. Read more about [this new feature in our engineering deep dive blog post](/blog/refactoring-made-right/).

## 0.9 in a nutshell

Individual developers can now easily make workflow customizations through subagents. Organizations get more precise governance controls. Everyone gets a better handle over how the agent behaves and what changes make it in their code. Each feature gives you control where it matters. [Update your IDE to 0.9](/downloads/) to get started.