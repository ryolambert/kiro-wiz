---
title: "Install powers - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/powers/installation/"
category: "powers"
lastUpdated: "2026-02-07T05:52:04.377Z"
---
# Install powers

---

Powers are designed for easy discovery and installation, whether you're using curated partners, community-built powers, or your team's private tooling. Discovery, installation, and configuration happen through the IDE or the kiro.dev website.

⚠️ Note: Kiro powers are third-party tools that may be subject to separate terms. Only install servers from trusted sources and review their documentation and licensing. Kiro is not responsible for third-party powers.

## Install curated powers

Browse powers from launch partners including Datadog, Dynatrace, Figma, Neon, Netlify, Postman, Supabase, Stripe, Strands SDK, and AWS Aurora.

### From kiro.dev

1. Browse powers at kiro.dev/powers
2. Select a power and click Install
3. The Kiro IDE will open, allowing you to complete the installation with one click

### From the IDE

1. Open the powers panel → click on the Ghosty icon with the lightning bolt 👻⚡
2. Choose a power to view details
3. Choose Install → Confirm

You can now **Try the power** to run through the power onboarding. Any time you ask a question related to that power, the Kiro agent will automatically activate and use it.

### Powers with MCPs

When you install a power that includes Model Context Protocol (MCP) integrations, Kiro automatically registers the MCP server in your `~/.kiro/settings/mcp.json` configuration file under the Powers section.

## Install custom powers

Custom powers require at minimum:

1. POWER.md - Metadata and documentation
2. mcp.json - MCP server configuration (if using MCP tools)
3. steering/ - Workflow-specific guidance files (optional but recommended)

### From public GitHub URL

1. Powers panel → Add power from GitHub
2. Enter repository URL: https://github.com/user/power-repo
3. Click Install

The power must have a valid POWER.md file in the repository root.

### From local path

For powers you create or manage in private repositories, clone the repository locally and install from the local path.

1. Powers panel → Add power from Local Path
2. Select power directory containing POWER.md
3. Click Install

**Example structure:**

```
my-custom-power/
├── POWER.md              # Required
├── mcp.json              # If using MCP servers
└── steering/             # Optional guidance files
    └── workflow.md

```

## Update powers

To update a power to the latest version:

1. Powers panel → power → Check for updates
2. Review changes
3. Click Update

The power refreshes from the remote repository and applies the latest version.