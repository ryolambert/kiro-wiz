---
title: "Codebase indexing - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/editor/codebase-indexing/"
category: "editor"
lastUpdated: "2026-02-07T05:51:59.705Z"
---
# Codebase indexing

---

Kiro automatically indexes your codebase and documentation to provide intelligent code suggestions, navigation, and context-aware assistance. This guide explains how indexing works and how to manage it.

## When indexing occurs

### Automatic indexing

Kiro performs indexing automatically in these scenarios:

1. Project Import: When you first open a project in Kiro, it automatically begins indexing all files in your workspace
2. File Changes: When new files are created or added to your project, they are automatically indexed
3. External Changes: When files are modified outside of Kiro (e.g., through git operations), they are re-indexed

### Manual indexing

You can trigger indexing manually when needed using the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).

## Available indexing commands

Kiro provides several commands to manage indexing through the Command Palette:

Loading image...

### Codebase indexing

- Kiro: Codebase Force Re-Index: Forces a complete re-indexing of your entire codebase. Use this when:
  - You suspect the index is corrupted or incomplete
  - Major structural changes have been made to your project
  - Kiro's code suggestions seem outdated
- Kiro: Rebuild codebase index: Completely rebuilds the codebase index from scratch. This is more thorough than force re-indexing and should be used when:
  - The index appears severely corrupted
  - You're experiencing persistent issues with code navigation or suggestions

### Documentation indexing

- Kiro: Docs Index: Initiates indexing of documentation files in your project
- Kiro: Docs Force Re-Index: Forces a complete re-indexing of all documentation files

## Monitoring indexing progress

You can monitor the indexing process through the Kiro Logs panel:

1. Access the Output panel in Kiro
2. Select "Kiro Logs" from the dropdown menu
3. View real-time indexing progress and status updates

Loading image...

The logs show:

- When indexing starts and completes
- Number of files found and processed
- Progress percentage for large codebases
- Completion time for indexing operations

## Indexed content

Kiro indexes various types of content to provide intelligent assistance:

- Source Code: All programming language files in your workspace
- Documentation: Markdown, MDX, and other documentation formats
- Configuration: Project configuration files and manifests
- Dependencies: Package definitions and dependency information

The indexed data enables features like:

- Intelligent code completion
- Cross-file navigation
- Context-aware suggestions
- Documentation lookup
- Code refactoring assistance