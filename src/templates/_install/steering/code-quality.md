---
inclusion: always
---

# Code Quality Standards

## General Rules

1. Write minimal code that directly addresses the requirement.
2. Avoid verbose implementations and unnecessary abstractions.
3. Follow the language's idiomatic patterns and conventions.
4. Include code comments only where logic is non-obvious.

## Security

1. Never include secret keys directly in code.
2. Use environment variables or secret managers for credentials.
3. Validate all user inputs.
4. Follow least-privilege principles.

## Testing

1. Only write tests when explicitly requested.
2. Do not modify or remove existing tests unless asked.
