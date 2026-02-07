---
title: "Diagnostics tool - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/diagnostics/"
category: "chat"
lastUpdated: "2026-02-07T05:52:02.698Z"
---
# Diagnostics tool

---

## Overview

Kiro's diagnostics tool helps the agent understand and work with your code by integrating with your installed IDE extensions. This integration provides real-time error detection, syntax validation, and code analysis that improves AI assistance quality.

## How it works

The diagnostics tool integrates with your installed IDE extensions to provide code analysis. When you have language extensions installed, Kiro can access:

- Real-time error detection - Syntax errors, type mismatches, and compilation issues
- Language-specific insights - Language semantics, imports, and dependencies
- Code quality analysis - Linting rules, style violations, and best practices
- Contextual awareness - Project structure, available APIs, and type definitions

## Getting started

1. Install Language Extensions for your programming languages. See our language-specific guides for recommended extensions:
  - Python Guide
  - TypeScript/JavaScript Guide
  - Java Guide
2. Open a file in your target language to activate the language server

The tool works automatically during agent execution - no additional configuration needed.

## Troubleshooting

If the agent isn't detecting code issues:

- Check Extension Status: Verify the extension is enabled in the Extensions panel
- Review Output Panel: Look for error messages from language servers
- Reload Window: Use the command palette to reload if the language server isn't starting
- Update Extensions: Keep extensions current for the latest capabilities

## Next steps

- Explore our language guides for language-specific setup
- Learn about combining diagnostics with dev servers for a complete development workflow