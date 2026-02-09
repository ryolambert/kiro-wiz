---
inclusion: always
---

# Kiro IDE Policy

1. Prefer non-interactive shells for automation.
2. One shell per command run when possible.
3. Commands must exit when done; background processes only on explicit request.
4. Use `zsh -lc` for automation shells to inherit user environment.
