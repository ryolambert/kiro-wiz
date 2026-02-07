# Requirements Document

## Introduction

A comprehensive, self-updating Kiro knowledge base that documents
every tool, workflow, configuration, and best practice for Kiro
IDE, CLI, and Autonomous Agent. The knowledge base serves as the
authoritative reference for developers and AI agents, and powers
a master Kiro tool that helps developers create optimal Kiro
workflows, configurations, and tooling. It is also exposed as an
MCP documentation server for cross-agent consumption and includes
interactive scaffolding for guided tool creation.

### Project Location and Portability

The project lives at `tools/kiro-knowledge-base/` as a
self-contained, portable Node.js package. All paths in this
document are relative to the project root
(`tools/kiro-knowledge-base/`) unless otherwise noted. The
project can be cloned and set up anywhere via `npm install`
followed by `npm test` to verify. CLI entry points use `tsx`
for direct TypeScript execution without a build step. The
MCP server is started via `npx tsx bin/mcp-server.ts`.

### TypeScript Configuration

The tsconfig.json uses `bundler` moduleResolution with
`paths` mapping for `@modelcontextprotocol/sdk` subpath
imports (e.g., `@modelcontextprotocol/sdk/server/stdio`).
Cheerio DOM types (`Element`, `Text`) are imported from the
`domhandler` package, which is a transitive dependency via
cheerio. The project has `domhandler` available without
listing it as a direct dependency.

### Architecture Decision: MCP as Unifying Backend

The MCP Documentation Server is the correct unifying abstraction
because Kiro powers and CLI agents can only consume external
tool functionality through MCP servers. There is no mechanism
for a power to import a TypeScript module directly — powers get
POWER.md + mcp.json + steering/. CLI agents get mcpServers +
resources + hooks. MCP is the only tool integration point for
both platforms.

Alternatives considered:

- **Direct TypeScript imports**: Zero overhead but impossible —
  neither IDE powers nor CLI agents can import TS modules
- **Pure file:// resources**: No server process but cannot
  execute code — scaffolding, validation, and auditing require
  runtime execution, not just document reading
- **Hybrid (direct imports for CLI scripts, MCP for platform
  delivery)**: Adopted — CLI entry points (bin/*.ts) import
  TypeScript modules directly for zero-overhead batch
  operations, while IDE power and CLI agents use MCP for
  interactive tool access

Performance characteristics of local stdio MCP: ~10-50ms
overhead per tool call (JSON-RPC serialization over stdio pipe),
negligible compared to LLM inference time (seconds). Caching
layer eliminates repeated file system reads for knowledge base
queries.

## Glossary

- **Knowledge_Base**: The organized collection of markdown files
  capturing Kiro documentation, guides, and best practices
- **Crawler**: The component that fetches and extracts content
  from Kiro documentation URLs and external resources
- **URL_Registry**: The master list of all documentation URLs
  to be crawled and indexed
- **Content_Parser**: The component that extracts structured
  content from fetched web pages and converts it to markdown
- **Master_Reference**: The compiled, optimized markdown document
  aggregating all knowledge base content for agent consumption
- **Master_Tool**: The Kiro power (for IDE) and custom agent
  (for CLI) that uses the knowledge base to help developers
  create optimal Kiro tooling
- **Change_Detector**: The component that monitors kiro.dev
  sitemap and changelog for updates and triggers re-crawling
- **Tooling_Advisor**: The component within the Master_Tool that
  recommends which Kiro tool type to use for a given situation
- **Reference_Library**: The collection of separate markdown
  documents for best practices, examples, and starter templates
  organized by Kiro tool type
- **Config_Generator**: The module that produces valid,
  schema-compliant configuration files for every Kiro tool type
  including hooks, steering, skills, powers, custom agents, and
  MCP servers
- **Workflow_Builder**: The interactive end-to-end agent that
  guides developers through creating new Kiro integrations or
  optimizing existing ones based on audit findings
- **Agent_Skills_Spec**: The open Agent Skills specification
  from agentskills.io that defines the SKILL.md format,
  directory structure, progressive disclosure model, and
  integration patterns for building portable agent skills
- **Context_Provider**: The #-prefixed references in Kiro chat
  that inject files, folders, specs, steering, and other
  context into conversations
- **MCP_Documentation_Server**: A Model Context Protocol server
  that exposes the knowledge base for querying by any
  MCP-compatible agent or IDE
- **Scaffolding_Engine**: The interactive module that guides
  developers through creating any Kiro tool type with
  best-practice templates and progressive disclosure
- **Platform_Delivery**: The mechanism by which the knowledge
  base is consumed: IDE delivery via a Kiro Power (POWER.md +
  mcp.json + steering), or CLI delivery via a custom agent
  JSON (mcpServers + resources + hooks), both backed by the
  same MCP_Documentation_Server

## Requirements

### Requirement 1: URL Discovery and Registry

**User Story:** As a developer, I want a complete registry of
all Kiro documentation URLs, so that the knowledge base covers
every available resource.

#### Acceptance Criteria for Requirement 1

1. WHEN the URL_Registry is initialized, THE URL_Registry SHALL
   contain all URLs from the kiro.dev/sitemap.xml sitemap
2. WHEN external specification resources are discovered, THE
   URL_Registry SHALL include URLs from agentskills.io (the
   Agent Skills specification site: /home, /what-are-skills,
   /specification, /integrate-skills)
3. WHEN a URL is added to the URL_Registry, THE URL_Registry
   SHALL store the URL, its category, its source, and a
   last-crawled timestamp
4. WHEN the URL_Registry is queried, THE URL_Registry SHALL
   return URLs filtered by category (getting-started, editor,
   specs, chat, hooks, steering, skills, powers, mcp, guides,
   cli, autonomous-agent, blog, changelog, agent-skills-spec,
   privacy-and-security, enterprise)
5. IF a URL in the URL_Registry returns a 404 or is unreachable,
   THEN THE URL_Registry SHALL mark the URL as stale and exclude
   it from active crawling
6. WHEN a URL is added to the URL_Registry, THE URL_Registry
   SHALL auto-categorize it based on the URL path segments
   matching Kiro documentation sections

### Requirement 2: Content Crawling and Extraction

**User Story:** As a developer, I want each documentation URL
crawled and its content extracted into structured markdown, so
that the knowledge base captures all available information.

#### Acceptance Criteria for Requirement 2

1. WHEN the Crawler processes a URL from the URL_Registry, THE
   Crawler SHALL fetch the page content and pass it to the
   Content_Parser
2. WHEN the Content_Parser receives page content, THE
   Content_Parser SHALL extract the main documentation body,
   headings, code blocks, tables, and metadata while stripping
   navigation chrome, footers, and repeated boilerplate
3. WHEN the Content_Parser produces markdown output, THE
   Content_Parser SHALL preserve code block language annotations,
   heading hierarchy, table structure, and link references
4. IF the Crawler encounters a network error or timeout, THEN
   THE Crawler SHALL retry up to 3 times with exponential
   backoff (1s, 2s, 4s) before marking the URL as failed
5. WHEN the Crawler completes processing a URL, THE Crawler
   SHALL update the last-crawled timestamp in the URL_Registry
6. THE Content_Parser SHALL produce valid markdown that preserves
   YAML frontmatter blocks, mermaid diagram blocks, and inline
   code formatting from the source

### Requirement 3: Knowledge Base Organization

**User Story:** As a developer, I want the knowledge base
organized into a clear directory structure by topic, so that I
can quickly find information about any Kiro feature.

#### Acceptance Criteria for Requirement 3

1. THE Knowledge_Base SHALL organize content into directories
   matching Kiro documentation sections: getting-started,
   editor, specs, chat, powers, hooks, steering, skills, mcp,
   guides, cli, autonomous-agent, privacy-and-security,
   enterprise, blog, changelog, and agent-skills-spec
2. WHEN a crawled page belongs to a documentation section, THE
   Knowledge_Base SHALL place the generated markdown file in
   the corresponding directory using URL path segment matching
3. WHEN a markdown file is created in the Knowledge_Base, THE
   Knowledge_Base SHALL name the file using the URL slug in
   kebab-case format
4. THE Knowledge_Base SHALL maintain an index.md file at the
   root that lists all categories and their contained files
   with brief descriptions
5. WHEN a new file is added to the Knowledge_Base, THE
   Knowledge_Base SHALL update the root index.md to include
   the new entry
6. THE Knowledge_Base SHALL store agentskills.io content in a
   dedicated `agent-skills-spec/` directory within the
   knowledge base structure

### Requirement 4: Master Reference and Reference Library

**User Story:** As an AI agent, I want a single optimized
reference document and a library of separate best-practice
documents, so that I can quickly look up any Kiro feature and
provide detailed guidance with examples and templates.

#### Acceptance Criteria for Requirement 4

1. WHEN the Master_Reference is compiled, THE Master_Reference
   SHALL aggregate content from all Knowledge_Base files into a
   single markdown document
2. WHEN the Master_Reference is compiled, THE Master_Reference
   SHALL include a table of contents with links to each section
3. THE Master_Reference SHALL organize content by Kiro tool
   type: specs, hooks, steering, skills, powers, MCP servers,
   custom agents (CLI), subagents, autonomous agent, and
   context providers
4. WHEN the Master_Reference describes a Kiro tool type, THE
   Master_Reference SHALL include a decision matrix documenting
   what the tool is, when to use it, when not to use it, how
   it compares to alternatives, and its scope (IDE-only,
   CLI-only, or both)
5. THE Master_Reference SHALL include a quick-reference section
   mapping common developer scenarios to recommended Kiro tool
   types
6. WHEN the Master_Reference is serialized to markdown, THE
   Master_Reference SHALL produce valid markdown that can be
   round-trip parsed back to the same structured representation
7. THE Reference_Library SHALL produce a separate best-practices
   markdown document for each Kiro tool type containing usage
   guidelines, common patterns, and anti-patterns
8. THE Reference_Library SHALL produce a separate examples
   markdown document for each Kiro tool type containing
   annotated, real-world configuration examples
9. THE Reference_Library SHALL produce a separate templates
   markdown document for each Kiro tool type containing
   copy-paste starter templates with placeholder annotations
10. WHEN a Reference_Library document is generated, THE
    Reference_Library SHALL cross-reference the corresponding
    Master_Reference section and related Reference_Library
    documents via markdown links
11. THE Reference_Library skills best-practices document SHALL
    incorporate the Agent Skills spec progressive disclosure
    model: metadata (~100 tokens at discovery), instructions
    (<5000 tokens at activation), resources loaded on demand

### Requirement 5: Config Generator and Schema Validation

**User Story:** As a developer, I want a config generator that
produces valid, schema-compliant configuration files for every
Kiro tool type, so that generated configs work correctly without
manual fixing.

#### Acceptance Criteria for Requirement 5

1. WHEN the Config_Generator receives a request for a hook
   configuration, THE Config_Generator SHALL produce valid JSON
   with when.type matching actual Kiro triggers (fileSaved,
   fileCreated, fileDeleted, promptSubmit, agentStop,
   preToolUse, postToolUse, userTriggered) and then.type
   matching valid action types (askAgent, runCommand)
2. WHEN the Config_Generator receives a request for a steering
   configuration, THE Config_Generator SHALL produce markdown
   with valid YAML frontmatter containing an inclusion mode
   (always, fileMatch, or manual) and optional fileMatchPattern
3. WHEN the Config_Generator receives a request for a skill
   configuration, THE Config_Generator SHALL produce a SKILL.md
   with Agent Skills spec-compliant frontmatter: name (1-64
   chars, lowercase alphanumeric and hyphens, no
   leading/trailing/consecutive hyphens), description (1-1024
   chars, non-empty), and optional fields (license,
   compatibility max 500 chars, metadata as key-value map,
   allowed-tools as space-delimited list)
4. WHEN the Config_Generator generates a skill, THE
   Config_Generator SHALL structure the skill directory
   following the Agent Skills spec: SKILL.md at root, optional
   scripts/, references/, and assets/ directories, with the
   skill name matching the parent directory name
5. WHEN the Config_Generator receives a request for a power
   configuration, THE Config_Generator SHALL produce a POWER.md
   with valid frontmatter (name, displayName, description,
   keywords), optional mcp.json with valid server configs, and
   optional steering/ directory
6. WHEN the Config_Generator receives a request for a custom
   agent configuration, THE Config_Generator SHALL produce valid
   JSON conforming to the full CLI agent schema including name,
   description, prompt, model, tools, allowedTools, toolAliases,
   toolsSettings, mcpServers, resources, hooks, includeMcpJson,
   keyboardShortcut, and welcomeMessage fields
7. WHEN the Config_Generator receives a request for an MCP
   server configuration, THE Config_Generator SHALL produce
   valid mcp.json supporting both local (command + args) and
   remote (url + headers) server definitions
8. WHEN the Config_Generator produces any configuration, THE
   Config_Generator SHALL validate the output against the known
   schema for that tool type and return validation errors for
   non-compliant output
9. WHEN the Config_Generator validates a skill, THE
   Config_Generator SHALL check Agent Skills spec compliance
   including name rules, description length, frontmatter
   structure, and directory layout

### Requirement 6: Kiro Tooling Decision Support

**User Story:** As a developer, I want guidance on which Kiro
tool type to use for a given situation, so that I can create
optimal workflows without deep Kiro expertise.

#### Acceptance Criteria for Requirement 6

1. WHEN a developer describes a use case to the Tooling_Advisor,
   THE Tooling_Advisor SHALL recommend one or more Kiro tool
   types (power, hook, steering doc, skill, custom agent, MCP
   server, spec, or autonomous agent) with rationale
2. WHEN the Tooling_Advisor makes a recommendation, THE
   Tooling_Advisor SHALL reference the relevant Knowledge_Base
   section supporting the recommendation
3. WHEN the Tooling_Advisor recommends a tool type, THE
   Tooling_Advisor SHALL provide a starter template or example
   configuration for the recommended tool
4. THE Tooling_Advisor SHALL distinguish between IDE-only
   features (powers, specs, subagents, autonomous agent),
   CLI-only features (custom agents, knowledge bases, delegate),
   and cross-platform features (hooks, steering, skills, MCP)
5. WHEN multiple tool types could address a use case, THE
   Tooling_Advisor SHALL rank them by fit and explain trade-offs
   including credit cost implications (shell hooks are free,
   agent prompt hooks consume credits)
6. WHEN the Tooling_Advisor recommends a skill, THE
   Tooling_Advisor SHALL reference the Agent Skills spec
   authoring best practices and validation tooling
   (skills-ref CLI)

### Requirement 7: Master Tool Implementation

**User Story:** As a developer, I want a Kiro power (for IDE)
and custom agent (for CLI) that uses the knowledge base to help
me create Kiro tools and workflows, so that I can build
high-quality Kiro configurations efficiently.

#### Acceptance Criteria for Requirement 7

1. THE Master_Tool SHALL be implemented as a Kiro power with
   POWER.md, optional MCP server configuration, and optional
   steering files following the documented power directory
   structure
2. WHEN a developer invokes the Master_Tool, THE Master_Tool
   SHALL load the Master_Reference document and relevant
   Reference_Library documents as context
3. WHEN a developer requests help creating a specific Kiro tool,
   THE Master_Tool SHALL use the Config_Generator to produce a
   complete, valid configuration file for the requested tool
   type
4. IF the Master_Tool cannot determine the appropriate tool type,
   THEN THE Master_Tool SHALL invoke the Tooling_Advisor to
   provide a recommendation before generating output
5. THE Master_Tool SHALL follow the patterns established by the
   existing curated powers from the Kiro powers repository
6. THE Master_Tool SHALL also be implementable as a CLI custom
   agent with equivalent capabilities using the CLI agent
   configuration format including resources, tools, and hooks
7. WHEN a developer invokes the Master_Tool, THE Master_Tool
   SHALL detect or ask whether the target platform is IDE, CLI,
   or both and tailor output accordingly
8. WHEN the target platform is IDE, THE Master_Tool SHALL
   generate a power directory structure including POWER.md,
   mcp.json pointing to the MCP_Documentation_Server, and
   steering files
9. WHEN the target platform is CLI, THE Master_Tool SHALL
   generate a custom agent JSON with mcpServers config pointing
   to the MCP_Documentation_Server, resources, and hooks
10. WHEN the target platform is both, THE Master_Tool SHALL
    generate both IDE power and CLI agent configurations
    pointing to the same MCP_Documentation_Server instance
11. THE Master_Tool power (IDE) SHALL include an mcp.json
    configuration pointing to the MCP_Documentation_Server
12. THE Master_Tool CLI agent SHALL include an mcpServers
    configuration pointing to the same
    MCP_Documentation_Server

### Requirement 8: MCP Documentation Server

**User Story:** As a developer, I want the knowledge base
accessible as an MCP server that serves as the unifying backend
for both IDE powers and CLI agents, so that any MCP-compatible
tool gets consistent access to Kiro documentation, decision
matrices, templates, scaffolding, and workspace auditing.

#### Acceptance Criteria for Requirement 8

1. THE MCP_Documentation_Server SHALL expose a
   `query_knowledge_base` tool for querying the Knowledge_Base
   by topic, tool type, or search term and returning relevant
   documentation sections
2. THE MCP_Documentation_Server SHALL expose a
   `get_decision_matrix` tool for retrieving the decision
   matrix comparing all Kiro tool types with their use cases,
   trade-offs, and platform availability
3. THE MCP_Documentation_Server SHALL expose a `get_template`
   tool for retrieving starter templates for a specific Kiro
   tool type from the Reference_Library
4. THE MCP_Documentation_Server SHALL be configurable as either
   a local stdio server (for development, ~10-50ms per call)
   or a remote HTTP/SSE server (for shared team use) using
   standard MCP transport mechanisms
5. THE MCP_Documentation_Server SHALL follow MCP best practices:
   single responsibility per tool, structured error
   classification with descriptive messages, and graceful
   degradation when knowledge base content is unavailable
6. THE MCP_Documentation_Server SHALL implement health check
   endpoints reporting server readiness and knowledge base
   availability status
7. THE MCP_Documentation_Server SHALL cache frequently requested
   documentation sections with a configurable TTL to reduce
   repeated file system reads
8. THE MCP_Documentation_Server SHALL expose a `scaffold_tool`
   tool that invokes the Scaffolding_Engine to create any Kiro
   tool type via MCP
9. THE MCP_Documentation_Server SHALL expose a `validate_config`
   tool that validates a given configuration against the known
   schema for its tool type
10. THE MCP_Documentation_Server SHALL expose an
    `audit_workspace` tool that runs the Workspace_Auditor and
    returns findings
11. THE MCP_Documentation_Server SHALL expose a
    `get_platform_guide` tool that returns platform-specific
    (IDE vs CLI) setup instructions and capabilities
12. THE MCP_Documentation_Server SHALL use the Config_Generator,
    Tooling_Advisor, Scaffolding_Engine, and Workspace_Auditor
    TypeScript modules as its implementation backend
13. THE CLI entry points (bin/*.ts) SHALL import the TypeScript
    modules directly for zero-overhead batch operations,
    bypassing the MCP server for non-interactive use cases

### Requirement 9: Workspace Audit and Comparison

**User Story:** As a developer, I want to compare my current
Kiro workspace configuration against best practices from the
knowledge base, so that I can identify improvements and gaps.

#### Acceptance Criteria for Requirement 9

1. WHEN a developer requests a workspace audit, THE Master_Tool
   SHALL scan the workspace for all Kiro configuration files
   in `.kiro/` including: steering docs (steering/*.md), hooks
   (hooks/*.kiro.hook), skills (skills/*/SKILL.md), powers
   (custom-powers/*/POWER.md), MCP config
   (settings/mcp.json), specs (specs/*/), and AGENTS.md at
   workspace root
2. WHEN the Master_Tool completes a workspace scan, THE
   Master_Tool SHALL compare each configuration against best
   practices documented in the Knowledge_Base
3. WHEN the Master_Tool identifies a gap or improvement, THE
   Master_Tool SHALL produce a recommendation with a reference
   to the relevant Knowledge_Base section and a suggested fix
4. WHEN the Master_Tool identifies outdated configurations, THE
   Master_Tool SHALL flag them and suggest updated versions
   based on the latest Knowledge_Base content
5. THE Master_Tool SHALL produce an audit report in markdown
   format listing findings grouped by severity (critical,
   recommended, optional)
6. THE Master_Tool SHALL check steering files for valid
   inclusion mode frontmatter (always, fileMatch, manual)
   and warn on missing or invalid frontmatter
7. THE Master_Tool SHALL validate existing skills against the
   Agent Skills specification and flag non-conforming SKILL.md
   frontmatter or directory structures

### Requirement 10: End-to-End Workflow Builder

**User Story:** As a developer, I want an interactive agent that
walks me through creating new Kiro integrations or optimizing
existing ones, so that I get a complete, working workflow without
needing to understand every Kiro tool type myself.

#### Acceptance Criteria for Requirement 10

1. WHEN a developer invokes the Workflow_Builder, THE
   Workflow_Builder SHALL present an interactive menu offering
   two modes: "Create New Integration" and "Optimize Existing
   Workflows"
2. WHEN a developer selects "Create New Integration", THE
   Workflow_Builder SHALL gather requirements by asking about
   the target technology, desired automation, workflow goals,
   and preferred platform (IDE, CLI, or both)
3. WHEN the Workflow_Builder has gathered requirements, THE
   Workflow_Builder SHALL use the Tooling_Advisor to recommend
   the best combination of Kiro tool types (spec, power, skill,
   hooks, steering docs, MCP servers, custom agent) for the
   use case
4. WHEN the Workflow_Builder presents a recommendation, THE
   Workflow_Builder SHALL explain the suggested approach
   including usage patterns, tool interactions, and trade-offs
5. WHEN the developer approves a recommendation, THE
   Workflow_Builder SHALL generate all required configuration
   files, steering documents, and directory structures as a
   complete, installable integration placed in the correct
   `.kiro/` subdirectories
6. WHEN a developer selects "Optimize Existing Workflows", THE
   Workflow_Builder SHALL run the workspace audit from
   Requirement 9 and present findings as actionable optimization
   steps
7. WHEN the Workflow_Builder presents optimization steps, THE
   Workflow_Builder SHALL offer to apply each fix automatically
   with a preview of the changes before applying
8. WHEN the Workflow_Builder generates or modifies files, THE
   Workflow_Builder SHALL validate all outputs against the known
   schemas and best practices from the Reference_Library
9. THE Workflow_Builder SHALL be implemented as a Kiro custom
   agent (CLI) with access to the Master_Reference and
   Reference_Library via knowledge base resources, and workspace
   file system tools
10. WHEN the Workflow_Builder completes an integration build, THE
    Workflow_Builder SHALL produce a summary listing all created
    files, their purposes, and instructions for testing the new
    integration
11. WHEN the developer requests a composite integration, THE
    Workflow_Builder SHALL generate a coordinated package of
    multiple tool types (e.g., a power with companion MCP server
    config, steering files, and a CLI agent) with
    cross-references between the generated files
12. WHEN the Workflow_Builder generates a power, THE
    Workflow_Builder SHALL follow the power-builder patterns
    including POWER.md with proper frontmatter, optional
    mcp.json, optional steering/ directory, and onboarding
    section
13. THE Workflow_Builder SHALL support generating both IDE-side
    (power) and CLI-side (custom agent) delivery mechanisms for
    the same integration
14. WHEN the developer selects "both" as the preferred platform,
    THE Workflow_Builder SHALL generate a coordinated package
    with shared MCP server config, IDE power, and CLI agent all
    pointing to the same MCP_Documentation_Server
15. THE Workflow_Builder CLI agent SHALL consume the
    MCP_Documentation_Server for knowledge base access via its
    mcpServers configuration

### Requirement 11: Scaffolding and Templates

**User Story:** As a developer, I want interactive scaffolding
that guides me through creating any Kiro tool type with
best-practice templates, so that I can create high-quality
configurations without memorizing schemas.

#### Acceptance Criteria for Requirement 11

1. WHEN a developer requests scaffolding for a Kiro tool type,
   THE Scaffolding_Engine SHALL present a guided Q&A flow
   collecting the minimum required information for that tool
   type
2. WHEN the Scaffolding_Engine creates a skill, THE
   Scaffolding_Engine SHALL apply the skill-creator progressive
   disclosure optimization: metadata (~100 tokens at discovery),
   instructions (<5000 tokens at activation), resources loaded
   on demand
3. WHEN the Scaffolding_Engine creates a skill, THE
   Scaffolding_Engine SHALL validate description quality
   targeting 250-350 characters with a "Use when:" section
   explaining activation triggers
4. WHEN the Scaffolding_Engine creates a power, THE
   Scaffolding_Engine SHALL guide the developer through the
   decision between Guided MCP Power and Knowledge Base Power,
   applying granularity best practices (default single power,
   only split with strong conviction)
5. WHEN the Scaffolding_Engine creates a power, THE
   Scaffolding_Engine SHALL apply power-builder naming
   conventions (kebab-case, action-oriented for workflow powers,
   tool-oriented for general powers)
6. THE Scaffolding_Engine SHALL provide starter templates for
   all Kiro tool types (hooks, steering, skills, powers, custom
   agents, MCP servers) with placeholder annotations explaining
   each configurable field
7. WHEN the Scaffolding_Engine generates output, THE
   Scaffolding_Engine SHALL validate the generated configuration
   against the Config_Generator schemas before writing files
8. THE Scaffolding_Engine SHALL support both interactive (guided
   Q&A) and programmatic (API) creation modes for integration
   into other tools and agents
9. WHEN the Scaffolding_Engine creates a power, THE
   Scaffolding_Engine SHALL measure token efficiency of the
   generated POWER.md and steering files, warning when content
   exceeds recommended thresholds (~500 lines for POWER.md)
10. WHEN the Scaffolding_Engine creates a power, THE
    Scaffolding_Engine SHALL include an mcp.json template
    pointing to the MCP_Documentation_Server
11. WHEN the Scaffolding_Engine creates a CLI agent, THE
    Scaffolding_Engine SHALL include an mcpServers configuration
    template pointing to the MCP_Documentation_Server
12. WHEN the Scaffolding_Engine receives a request for a
    composite integration, THE Scaffolding_Engine SHALL create
    a full integration package (MCP server config, IDE power,
    and CLI agent) as a single coordinated output with shared
    MCP_Documentation_Server references

### Requirement 12: Change Detection and Self-Updating

**User Story:** As a developer, I want the knowledge base to
detect changes on kiro.dev and automatically update, so that the
knowledge base stays current without manual intervention.

#### Acceptance Criteria for Requirement 12

1. WHEN the Change_Detector runs, THE Change_Detector SHALL
   fetch the kiro.dev/sitemap.xml and compare it against the
   URL_Registry for new or modified URLs using lastmod timestamps
2. WHEN the Change_Detector identifies new URLs in the sitemap,
   THE Change_Detector SHALL add them to the URL_Registry and
   trigger crawling for those URLs
3. WHEN the Change_Detector runs, THE Change_Detector SHALL
   check kiro.dev/changelog for new entries since the
   last recorded changelog timestamp
4. WHEN new changelog entries are detected, THE Change_Detector
   SHALL trigger re-crawling of URLs related to the changed
   features
5. IF the Change_Detector encounters an error during comparison,
   THEN THE Change_Detector SHALL log the error and preserve the
   existing URL_Registry state
6. WHEN the Change_Detector completes a run, THE Change_Detector
   SHALL record the run timestamp and a summary of changes found

### Requirement 13: Platform-Specific Delivery

**User Story:** As a developer, I want platform-specific
delivery mechanisms for the knowledge base, so that I get the
right tooling whether I am using Kiro IDE, Kiro CLI, or both.

#### Acceptance Criteria for Requirement 13

1. THE system SHALL provide an IDE delivery path via a Kiro
   Power at `powers/kiro-knowledge-base/` with POWER.md,
   mcp.json pointing to the MCP_Documentation_Server, and
   steering files
2. THE system SHALL provide a CLI delivery path via a custom
   agent at `agents/kiro-knowledge-base-agent.json` with
   mcpServers config pointing to the same
   MCP_Documentation_Server, resources, tools, and hooks
3. WHEN the IDE power is activated, THE power SHALL load the
   MCP_Documentation_Server tools and steering files for
   IDE-specific workflows (power creation, hook creation,
   steering creation, spec creation)
4. WHEN the CLI agent is invoked, THE agent SHALL load the
   MCP_Documentation_Server tools and resources for
   CLI-specific workflows (custom agent creation, knowledge
   base resource setup, CLI hook configuration)
5. THE IDE power and CLI agent SHALL share the same
   MCP_Documentation_Server instance, ensuring consistent
   knowledge base access across platforms
6. THE IDE power steering files SHALL include
   platform-specific guidance:
   `steering/ide-workflows.md` for power creation, hook setup,
   and steering authoring;
   `steering/cli-workflows.md` for agent creation, CLI hooks,
   and knowledge base resources;
   `steering/cross-platform.md` for MCP servers, skills, and
   steering docs that work on both platforms
7. THE CLI agent SHALL include a welcomeMessage presenting
   platform-aware options: "Create IDE Tool
   (power/hook/steering)", "Create CLI Tool (agent/CLI hook)",
   "Create Cross-Platform Tool (skill/MCP/steering)", "Audit
   Workspace", "Optimize Workflows"
