---
title: "Code Intelligence - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/code-intelligence/"
category: "cli"
lastUpdated: "2026-02-07T05:52:27.680Z"
---
# Code Intelligence

---

Code Intelligence provides two complementary layers of code understanding:

**Tree-sitter (Built-in)** - Out-of-the-box code intelligence for 18 languages. Search symbols with fuzzy matching, get document symbols, and lookup definitions without installing an LSP. With incremental loading and support for millions of tokens of indexed content, agents can efficiently search large codebases.

**LSP Integration (Optional)** - Enhanced precision with find references, go to definition, hover documentation, rename refactoring, and diagnostics. Requires language server installation.

## Supported Languages

Bash, C, C++, C#, Elixir, Go, Java, JavaScript, Kotlin, Lua, PHP, Python, Ruby, Rust, Scala, Swift, TSX, TypeScript

## Built-in Features

Code Intelligence provides these operations (no LSP required):

- Symbol search - Find functions, classes, methods by name (fuzzy matching)
- Document symbols - List all symbols in a file
- Symbol lookup - Look up specific symbols by exact name
- Pattern search - AST-based structural code search
- Pattern rewrite - Automated code transformations using AST patterns
- Codebase overview - High-level codebase structure overview
- Codebase map - Explore directory structure and understand code organization

With LSP enabled (optional), additional operations become available:

- Find references - Locate all usages of a symbol at a position
- Go to definition - Navigate to where a symbol is defined
- Rename symbol - Rename symbols across the codebase
- Get diagnostics - Get errors and warnings for a file
- Hover documentation - Get type information and documentation at position
- Completions - Get completion suggestions at position

## Codebase Overview

Get a complete overview of any workspace in seconds:

```bash
/code overview

```

Specify a path to focus on a specific directory:

```bash
/code overview ./src/components

```

Use `--silent` for a cleaner output when diving deep into a package:

```bash
/code overview --silent

```

Ideal for:

- Onboarding to new codebases
- Q&A sessions about project structure
- Understanding unfamiliar packages quickly

## Documentation Generation

Generate documentation for your codebase with an interactive session:

```bash
/code summary

```

This starts an interactive session where you can choose the output format:

- AGENTS.md - Documentation for AI agents working with your codebase
- README.md - Standard project documentation
- CONTRIBUTING.md - Contributor guidelines

The generated documentation is based on analysis of your codebase structure, dependencies, and code patterns.

## Pattern Search & Rewrite

AST-based structural code search and transformation. Find and modify code by structure, not just text.

### Metavariables

- $VAR - Matches single node (identifier, expression)
- $$$ - Matches zero or more nodes (statements, parameters)

### Pattern Search Examples

```javascript
// Find all console.log calls
pattern: console.log($ARG)
language: javascript

// Find all async functions
pattern: async function $NAME($$$PARAMS) { $$$ }
language: typescript

// Find all .unwrap() calls
pattern: $E.unwrap()
language: rust

```

### Pattern Rewrite Examples

```javascript
// Convert var to const
pattern: var $N = $V
replacement: const $N = $V
language: javascript

// Modernize hasOwnProperty
pattern: $O.hasOwnProperty($P)
replacement: Object.hasOwn($O, $P)
language: javascript

// Convert unwrap to expect
pattern: $E.unwrap()
replacement: $E.expect("unexpected None")
language: rust

```

### Rewrite Workflow

1. Use pattern_search first to verify matches
2. Review matches to ensure correctness
3. Run pattern_rewrite with dry_run: true to preview
4. Apply changes with dry_run: false

## LSP Integration (Optional)

Code intelligence is configured per workspace, not globally. Each project maintains its own LSP settings independently.

Run `/code init` to unlock full LSP-powered code intelligence with enhanced features like find references, hover documentation, and rename refactoring.

### How it works

Kiro CLI spawns LSP server processes in the background that communicate via JSON-RPC over stdio. When you initialize a workspace, it detects languages from project markers (like `package.json`, `Cargo.toml`) and file extensions, then starts the appropriate language servers. These servers continuously analyze your code and maintain an index of symbols, types, and references. When you make queries, Kiro translates your natural language into LSP protocol requests, sends them to the relevant server, and formats the responses back into readable output.

### Installing Language Servers

Default LSP configurations are included for: C/C++, Go, Java, Kotlin, Python, Ruby, Rust, TypeScript/JavaScript

**TypeScript/JavaScript**

```bash
npm install -g typescript-language-server typescript

```

**Rust**

```bash
rustup component add rust-analyzer

```

**Python**

```bash
pip install pyright
# or with pipx (recommended for isolation)
pipx install pyright

```

**Go**

```bash
go install golang.org/x/tools/gopls@latest

```

**Java**

```bash
# macOS
brew install jdtls

# Linux - download from https://download.eclipse.org/jdtls/snapshots/
# Extract and add to PATH

```

**Ruby**

```bash
gem install solargraph

```

**C/C++**

```bash
# macOS
brew install llvm
# or
brew install clangd

# Linux (Debian/Ubuntu)
sudo apt install clangd

# Linux (Arch)
sudo pacman -S clang

```

**Kotlin**

```bash
brew install kotlin-language-server

```

### Initialize LSP

Run this slash command in your project root:

```
/code init

```

This creates `lsp.json` configuration and starts language servers.

What you'll see:

```
✓ Workspace initialization started

Workspace: /path/to/your/project
Detected Languages: ["python", "rust", "typescript"]
Project Markers: ["Cargo.toml", "package.json"]

Available LSPs:
○ clangd (cpp) - available
○ gopls (go) - not installed
◐ jdtls (java) - initializing...
✓ pyright (python) - initialized (687ms)
✓ rust-analyzer (rust) - initialized (488ms)
○ solargraph (ruby) - not installed
✓ typescript-language-server (typescript) - initialized (214ms)

```

**Status indicators:**

- ✓ - Initialized and ready
- ◐ - Currently initializing
- ○ available - Installed but not needed for detected languages
- ○ not installed - Not installed on your system

**Restart LSP servers:** If language servers shut down or become unresponsive, use `/code init -f`.

**Auto-initialization:** After the first `/code init`, Kiro CLI automatically initializes code intelligence on startup when `lsp.json` exists in the workspace.

**Disabling code intelligence:** Delete `lsp.json` from your project root to disable. Re-enable anytime with `/code init`.

### Using Language Servers

Language servers provide semantic code intelligence through natural language queries. You can search symbols, navigate definitions, find references, rename across files, get diagnostics, view method documentation, and discover available APIs on classes and objects.

**Find a symbol:**

```
> Find the UserRepository class

Searching for symbols matching: "UserRepository"
  1. Class UserRepository at src/repositories/user.repository.ts:15:1

```

**Find all references:**

```
> Find references of Person class

Finding all references at: auth.ts:42:10
  1. src/auth.ts:42:10 - export function authenticate(...)
  2. src/handlers/login.ts:15:5 - authenticate(credentials)
  3. src/handlers/api.ts:89:12 - await authenticate(token)

```

**Go to definition:**

```
> Find the definition of UserService

src/services/user.service.ts:42:1: export class UserService { ...

```

**Get file symbols:**

```
> What symbols are in auth.service.ts?

Getting symbols from: auth.service.ts
  1. Class AuthService at auth.service.ts:12:1
  2. Function login at auth.service.ts:25:3
  3. Function logout at auth.service.ts:45:3
  4. Function validateToken at auth.service.ts:62:3

```

**Rename with dry run:**

```
> Dry run: rename the method "FetchUser" to "fetchUserData"

Dry run: Would rename 12 occurrences in 5 files

```

**Get diagnostics:**

```
> Get diagnostics for main.ts

  1. Error line 15:10: Cannot find name 'undefined_var'
  2. Warning line 42:5: 'result' is declared but never used

```

**Get hover documentation:**

```
> What's the documentation for the authenticate method in AuthService?

Type: (credentials: Credentials) => Promise<AuthResult>

Documentation: Authenticates a user with the provided credentials.
Returns an AuthResult containing the user token and profile.

@param credentials - User login credentials
@throws AuthenticationError if credentials are invalid

```

**Discover available methods:**

```
> What methods are available on the s3Client instance?

Available completions:
  1. putObject - Function: (params: PutObjectRequest) => Promise<PutObjectOutput>
  2. getObject - Function: (params: GetObjectRequest) => Promise<GetObjectOutput>
  3. deleteObject - Function: (params: DeleteObjectRequest) => Promise<DeleteObjectOutput>
  4. listObjects - Function: (params: ListObjectsRequest) => Promise<ListObjectsOutput>
  5. headObject - Function: (params: HeadObjectRequest) => Promise<HeadObjectOutput>

```

### Custom Language Servers

Add custom language servers by editing `lsp.json` in your project root:

```json
{ 
  "languages": { 
    "mylang": { 
      "name": "my-language-server", 
      "command": "my-lsp-binary", 
      "args": ["--stdio"], 
      "file_extensions": ["mylang", "ml"], 
      "project_patterns": ["mylang.config"], 
      "exclude_patterns": ["**/build/**"], 
      "multi_workspace": false, 
      "initialization_options": { "custom": "options" },
      "request_timeout_secs": 60
    } 
  } 
}

```

**Fields:**

- name: Display name for the language server
- command: Binary/command to execute
- args: Command line arguments (usually ["--stdio"])
- file_extensions: File extensions this server handles
- project_patterns: Files that indicate a project root (e.g., package.json)
- exclude_patterns: Glob patterns to exclude from analysis
- multi_workspace: Set to true if the LSP supports multiple workspace folders (default: false)
- initialization_options: LSP-specific configuration passed during initialization
- request_timeout_secs: Timeout in seconds for LSP requests. Default is 60.

After editing, restart Kiro CLI to load the new configuration.

## Slash Commands

### /code init

Initialize code intelligence in current directory.

### /code init -f

Force re-initialization (restart all LSP servers).

### /code status

Show workspace status and LSP server states.

### /code logs

Display LSP logs for troubleshooting.

```bash
/code logs                    # Show last 20 ERROR logs
/code logs -l INFO            # Show INFO level and above
/code logs -n 50              # Show last 50 entries
/code logs -l DEBUG -n 100    # Show last 100 DEBUG+ logs
/code logs -p ./lsp-logs.json # Export logs to JSON file

```

**Options:**

- -l, --level <LEVEL>: Log level filter (ERROR, WARN, INFO, DEBUG, TRACE). Default: ERROR
- -n, --lines <N>: Number of log lines to display. Default: 20
- -p, --path <PATH>: Export logs to JSON file

## Supported LSP Servers

| Language | Extensions | Server | Install Command |
| --- | --- | --- | --- |
| TypeScript/JavaScript | .ts, .js, .tsx, .jsx | typescript-language-server | npm install -g typescript-language-server typescript |
| Rust | .rs | rust-analyzer | rustup component add rust-analyzer |
| Python | .py | pyright | pip install pyright |
| Go | .go | gopls | go install golang.org/x/tools/gopls@latest |
| Java | .java | jdtls | brew install jdtls (macOS) |
| Ruby | .rb | solargraph | gem install solargraph |
| C/C++ | .c, .cpp, .h, .hpp | clangd | brew install llvm (macOS) or apt install clangd (Linux) |
| Kotlin | .kt, .kts | kotlin-language-server | brew install kotlin-language-server |

## Troubleshooting

| Issue | Cause(s) | Solution |
| --- | --- | --- |
| Code tool is not enabled for this agent | Agent doesn't have the code tool in its tool list | Add "code" to the agent's tools array, or use @builtin to include all built-in tools, or use @builtin/code |
| Workspace is still initializing | LSP servers are starting up | Wait and try again. If servers crashed, use /code init -f to restart |
| LSP initialization failed |  | Check logs for details: /code logs -l ERROR |
| No symbols found | Language server is still indexing or File has syntax errors or Symbol name doesn't match | Check file for errors, try broader search terms |
| No definition found | Position doesn't point to a symbol | Verify the row and column numbers point to a symbol name |

## Best Practices

1. Initialize once per project - Run /code init in project root
2. Use exact positions - Row and column must point to the symbol
3. Use dry_run for renames - Preview changes before applying
4. Check diagnostics first - Syntax errors can prevent analysis
5. Be specific in searches - "UserService" > "user"
6. Ask for documentation naturally - "What does the login method do?" instead of specifying coordinates
7. Discover APIs conversationally - "What methods does s3Client have?" to explore external library functionality

## Limitations

1. LSP feature support varies by language server - not all servers support every operation (e.g., some may not support rename or formatting)
2. Large codebases may have slow initial indexing