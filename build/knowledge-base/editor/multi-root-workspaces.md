---
title: "Multi-root Workspaces - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/editor/multi-root-workspaces/"
category: "editor"
lastUpdated: "2026-02-07T05:51:59.980Z"
---
# Multi-root Workspaces

---

A typical Kiro workspace contains a single “root” folder, e.g., `/users/bob/my-project`. However, Kiro also supports workspaces that contain multiple roots, e.g., a single workspace that contains both `/users/bob/my-project` and `/shared/utils/crypto` as top-level folders.

You can create a multi-root workspace from a single-root workspace by using **File > Add Folder to Workspace...** and selecting another folder, or by dragging and dropping another folder from OS X Finder or Windows File Explorer into the Explorer view in Kiro.

For single-root workspaces, Kiro stores and retrieves artifacts such as specs, steering files, hooks, etc. from the `.kiro` subfolder under that single root, e.g., in `/users/bob/my-project/.kiro` . For multi-root workspaces, Kiro supports storing and retrieving these artifacts from the `.kiro` subfolder under *each* of the root folders. The exact behavior of Kiro in a multi-root workspace scenario is described below.

## Core functionality

Kiro will resolve file paths intelligently across the root folders as it navigates and updates your multi-root workspace.

[Codebase Indexing](/docs/editor/codebase-indexing/) and Repository Maps will work seamlessly in multi-root workspaces. Both indices will contain code from all the root folders, and can be referenced in prompts exactly as in the single-root workspace scenario.

When adding a file to context using the [#file](/docs/chat/#context-providers) context provider, in cases of ambiguity where there are multiple files with that same name in different root folders, Kiro will display a list of matching files along with their path so you can select the correct one.

## Specs

Kiro will retrieve all [spec](/docs/specs/) files from the `.kiro` subfolder under each of the root folders, and display them as a unified list in the **Specs** section of the Kiro panel. The name of the containing root folder is displayed next to each spec.

You can ask Kiro to work on a spec defined under any of the root folders. When creating a new spec, Kiro will determine the appropriate root folder to place the spec into.

## Steering files

Kiro will retrieve all [steering](/docs/steering/) files from the `.kiro` subfolder under each of the root folders, and display them as a unified list in the **Agent Steering** section of the Kiro panel, under the **Workspace** group. The name of the containing root folder is displayed next to each workspace steering file.

Steering files with the “[Always Included](/docs/steering/#always-included-default)” directive are always loaded, regardless of the specific root folder the agent is working on. However, those with a “[Conditional Inclusion](/docs/steering/#conditional-inclusion)” directive are loaded only if the agent is working on a file defined in that same root (and the file, of course, matches the inclusion pattern).

When creating a new workspace steering file, you will be prompted to pick the root folder to save the steering file into.

## Hooks

Kiro will retrieve all [hooks](/docs/hooks/) from the `.kiro` subfolder under each of the root folders, and display them as a unified list within the **Agent Hooks** section of the Kiro panel. The name of the containing root folder is displayed next to each hook.

Hooks (File Create, File Save, and File Delete) will be triggered only when the agent modifies files located in the same root folder where the hook is defined.

When creating a new hook, you will be prompted to pick the root folder to save the hook into.

## MCP servers

Kiro will retrieve all [MCP server](/docs/mcp/) definitions from the `.kiro` subfolder under each of the root folders, and display them as a unified list in the **MCP Servers** section of the Kiro panel.

All MCP servers defined in all the roots are initialized at startup. In case two root folders define an MCP server with the same name, the server definition in the last defining root is used. The servers are launched with the first root folder as their current working directory, regardless of the root folder that a server was defined in.

When you click on the **Open MCP config** button in the **MCP Servers** section of the Kiro panel, you are shown the user-level (global) MCP configuration file by default, and you can then click on the **Workspace Config** button to view the workspace-level configuration. When you click on that button in a multi-root workspace, you will be prompted to pick the root folder for which to view the MCP configuration.