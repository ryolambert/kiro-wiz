---
inclusion: always
---

# Kiro Terminal Policy

1. One shell per command run when possible; avoid tmux for automation shells.
2. Prefer non-interactive shells (zsh -lc) for automation; keep prompt/pager minimal.
3. Commands must exit when done; background processes only on explicit request.
