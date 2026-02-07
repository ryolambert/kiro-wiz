---
title: "Multi-root Workspaces in Kiro: Work Across Projects, Not Just Inside One"
sourceUrl: "https://kiro.dev/blog/multi-root-workspaces/"
category: "blog"
lastUpdated: "2026-02-07T05:52:39.319Z"
---
## What’s a Multi-root Workspace?

Normally, a Kiro workspace is tied to a single project folder:

But - what if you’re working on `my-app` and a shared library that it depends on at the same time? Or managing multiple microservices? Or a monorepo with a bunch of packages? That’s where multi-root workspaces come in, and you can try them out today!

With multi-root support, you can bring multiple folders into a single Kiro IDE window. This way, each stay independent, but they can all work together:

This way, you don’t need to worry about merging or symlinks, and you get clean side by side access.

## Why Use This?

Multi-root is a good idea when:

- You’re editing a feature in your app that requires changes to a shared library
- You’re maintaining multiple related services (eg frontend + backend + auth)
- You’re using git submodules or workspaces (like npm/yarn/pnpm workspaces)
- You want to search, navigate or refactor across several projects at once.

Instead of DM’ing your teammates asking for workarounds, or figuring out how to keep multiple versions of Kiro open at the same time, you can now keep all of your context in sync in one workspace for your project. This makes it easier to work on tasks that span multiple roots with Kiro.

## How Do You Set It Up?

There are 2 options, and they’re both easy:

1. File → Add Folder to Workspace... → choose the folder
2. Drag and drop a folder into Kiro

Kiro will then recognize each folder as a root and start loading the `.kiro` config files from each root.

## How Kiro Handles Multiple Roots

Each root keeps its own identity, but Kiro brings it all together for you.

### Specs: One List, Multiple Sources

All of your steering files appear in one list under ‘Workspace’ in the Agent Steering panel, and each one shows which root it comes from. When you make a new steering file, Kiro will give you 3 options:

- my-app agent steering - Applies only within that specific workspace
- Global agent steering - Applies across all workspaces
- Foundation steering files - Auto-create foundation files to establish core workspace context.

Steering files with the “Always Included” directive are always loaded, regardless of the specific root folder the agent is working on. However, those with a “Conditional Inclusion” directive are loaded only if the agent is working on a file defined in that same root.

For multi-root workspaces, you’ll typically want the first option so your steering stays organised.

### Agent Hooks: Scoped to Their Home

Hooks are listed together, but each is tied to its root. So, a hook shared in `shared-ui/.kiro/hooks/` will only trigger when files in `shared-ui` change, which keeps everything nice and contained.

### MCP: Unified, but with Rules

All MCP server definitions from each root are loaded at startup. If 2 different roots have MCPs with the same name, the one from whichever root appears last in your workspace folder ‘wins’. So, make sure you’re being strategic and careful with MCP names to avoid conflicts. Use prefixes like `frontend-github` and `backend-github` instead of just `github`. Then, when you open up the MCP config, Kiro will prompt you to pick which root’s config you want to look at.

### Codebase Search & Context

`#codebase` searches across all roots, and Kiro automatically indexes source code, docs and config files from every root folder in your workspace. When you use `#file` and there are duplicates (eg `utils/logger.ts` in 2 roots), Kiro will show you a list with full paths so you can make sure you pick the right one. If you want even more control, you can use line ranges to focus context, like `#file:src/index.ts:10-25`.

## Real-World Example: Cross-Project Workflows

Imagine this scenario:

> Update the Button component in shared-ui, then update my-app to use the new variant prop.

With multi-root workspaces in Kiro:

1. Open both my-app and shared-ui in one workspace
2. Ask Kiro: 
Loading code example...
3. Kiro works across both roots in one conversation when you need to update code, run hooks or work with specs.

This all happens in one flow, so you don’t need to switch windows or make separate conversations.

## Ready to Try it?

Make sure you’re updated to the latest version of Kiro, then just drag another project folder into your Kiro window, then you’re ready to roll! Want to see what’s new in Kiro? Check out our [General Availability Launch Blog](/blog/general-availability/), and the [Changelog](/changelog/).