---
title: "Custom Diff Tools - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/chat/diff-tools/"
category: "cli"
lastUpdated: "2026-02-07T05:52:22.418Z"
---
# Custom Diff Tools

---

When Kiro proposes file changes, it displays them using a built-in diff tool. If you prefer a different diff experience—whether that's syntax highlighting, side-by-side views, or your favorite GUI tool—you can configure Kiro to use an external diff tool instead.

## Configuration

Configure your preferred diff tool with the `chat.diffTool` setting:

```bash
kiro-cli settings chat.diffTool <tool-name>

```

For example, to use delta:

```bash
kiro-cli settings chat.diffTool delta

```

To reset to the built-in diff:

```bash
kiro-cli settings -d chat.diffTool

```

## Terminal tools

These tools display diffs directly in your terminal, keeping you in your workflow:

| Tool | Config value | Best for |
| --- | --- | --- |
| delta | delta | Git users who want syntax highlighting and line numbers |
| difftastic | difft | Language-aware structural diffs that ignore formatting |
| icdiff | icdiff | Quick side-by-side colored comparisons |
| diff-so-fancy | diff-so-fancy | Clean, human-readable output |
| colordiff | colordiff | Simple colorized diffs |
| diff-highlight | diff-highlight | Word-level highlighting (ships with Git) |
| ydiff | ydiff | Side-by-side with word-level highlighting |
| bat | bat | Syntax highlighting with Git integration |

## GUI tools

These open a separate window for reviewing changes:

| Tool | Config value |
| --- | --- |
| VS Code | code |
| VSCodium | codium |
| Meld | meld |
| KDiff3 | kdiff3 |
| FileMerge (macOS) | opendiff |
| Vim | vimdiff or vim |
| Neovim | nvim |

GUI diff tools open temporary files for viewing only. Any edits you make in the GUI tool will not be saved or applied to Kiro's proposed changes.

## Custom arguments

You can customize tool behavior by including arguments in quotes:

```bash
# Enable side-by-side view in delta
kiro-cli settings chat.diffTool "delta --side-by-side"

```

## Other tools

Kiro can work with diff tools not listed above. When you configure a tool, Kiro tries two approaches:

1. Pipes a unified diff to the tool via stdin
2. Invokes the tool with two temporary file paths as arguments

If neither approach works, Kiro falls back to the built-in inline diff.

## Troubleshooting

If you see the error "Couldn't find the diff tool", the tool isn't installed or isn't in your PATH. Verify the tool is accessible:

```bash
which delta

```

If nothing is returned, install the tool first. For example, to install delta:

```bash
# macOS
brew install git-delta

# Ubuntu/Debian
sudo apt install git-delta

```

For other tools, check the tool's documentation for installation instructions.