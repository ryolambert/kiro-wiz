---
title: "Powers - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/powers/"
category: "powers"
lastUpdated: "2026-02-07T05:52:04.065Z"
---
# Powers

---

Kiro powers give your AI agent instant access to specialized knowledge for any technology. Powers package your tools, workflows, and best practices into a format that Kiro can activate on-demand. When you mention relevant keywords, Kiro loads the power's context and tools automatically.

## Get Started

## Concept

### The problem: context overload

**Without framework context, agents guess.** Your agent can call Stripe APIs, but does it know to use idempotent keys? It can query Neon, but does it understand connection pooling for serverless? Without built-in expertise, you're both manually reading documentation and refining approaches until the output is right. Powers give your agent—and by extension, you—instant access to specialized knowledge, so you can work in unfamiliar domains faster.

**With too much context, agents slow down.** Connect five MCP servers and your agent loads 100+ tool definitions before writing a single line of code. Five servers might consume 50,000+ tokens—40% of your context window—before your first prompt. More tools should mean better results, but unstructured context overwhelms the agent, leading to slower responses and lower quality output.

### How powers work

Instead of loading all MCP tools at once, powers activate dynamically based on keywords in your conversation.

When you start a task, Kiro:

1. Reads the task description
2. Evaluates installed powers against the task
3. Loads only relevant powers into context

### What's in a power?

A power is a unified bundle that includes:

1. POWER.md - The steering file that tells the agent what MCP tools it has available and when to use them
2. MCP server configuration - The tools and connection details for the MCP server
3. Steering/hooks - Automated tasks that run on IDE events or via slash commands (optional)

Install the Stripe power with one click. When you mention "payment" or "checkout," the power activates—loading Stripe's MCP tools and the POWER.md steering into context. When you're done with payments and move to database work, the Supabase power activates and Stripe deactivates.

### What makes powers different

**Dynamic MCP tool loading** - Traditional MCP servers load all tools upfront. Powers load tools on-demand, reducing baseline context usage while giving your agent access to dozens of technologies.

**Open ecosystem** - Browse curated powers from launch partners including Datadog, Dynatrace, Figma, Neon, Netlify, Postman, Supabase, Stripe, Strands SDK, and AWS Aurora. Install community-built powers from GitHub URLs, or create and share your own.

**One-click install** - Browse powers directly in Kiro or on kiro.dev. Click "Install" and the power registers automatically. No JSON configuration files, no command-line setup.