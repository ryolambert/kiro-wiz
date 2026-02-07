# Implementation Plan: Kiro Knowledge Base

## Overview

TypeScript implementation using Node.js. All modules live in
`lib/`, tests in `tests/lib/`. Uses `vitest` for testing and
`fast-check` for property-based tests. The knowledge base output
lives in `knowledge-base/`. The Master Tool power lives in
`powers/kiro-knowledge-base/`. The CLI knowledge base
agent lives in `agents/kiro-knowledge-base-agent.json`. The
Workflow Builder agent lives in `agents/`. The MCP Documentation
Server (`lib/mcpServer.ts`) is the shared backend consumed by
both the IDE power (via mcp.json) and CLI agents (via
mcpServers config).

All paths are relative to the project root at
`tools/kiro-knowledge-base/`. The project is portable: clone,
`npm install`, `npm test`. CLI scripts run via `npx tsx`.
The tsconfig.json uses `bundler` moduleResolution with
`paths` mapping for `@modelcontextprotocol/sdk` subpath
imports. Cheerio DOM types (`Element`, `Text`) come from
the `domhandler` transitive dependency.

## Tasks

- [x] 1. Project setup and core types
  - [x] 1.1 Initialize project with package.json, tsconfig.json, and vitest config
    - Add dependencies: `cheerio`, `fast-check`, `vitest`, `js-yaml`, `@modelcontextprotocol/sdk`
    - Configure TypeScript strict mode, no `any`
    - Configure `bundler` moduleResolution with `paths` mapping for `@modelcontextprotocol/sdk` subpath imports
    - Cheerio DOM types (`Element`, `Text`) imported from `domhandler` (transitive dep via cheerio)
    - Configure vitest with v8 coverage
    - Add `bin` entries for CLI scripts
    - _Requirements: 2.6_
  - [x] 1.2 Create shared type definitions in `lib/types.ts`
    - Define `RegistryEntry` with url, category, source, lastCrawled, lastmod, status fields
    - Define `UrlCategory`, `URL_CATEGORIES` covering all 19 Kiro doc sections
    - Define `CrawlResult`, `CrawlError`
    - Define `ParsedContent` with title, description, headings (level+text), markdown, codeBlocks, tables, links, metadata, frontmatter
    - Define `KnowledgeBaseEntry`
    - Define `CompiledReference`, `CompilerOptions`
    - Define `SitemapEntry` with url, lastmod, changefreq, priority
    - Define `ChangeDetectorResult` with newUrls, modifiedUrls, removedUrls
    - Define `ChangeDetectorState`
    - Define `KiroToolType`, `KIRO_TOOL_TYPES` (spec, hook, steering-doc, skill, power, mcp-server, custom-agent, autonomous-agent, subagent, context-provider)
    - Define `TOOL_PLATFORM` mapping each tool type to ide-only, cli-only, both, or cloud
    - Define `ToolRecommendation` with platform and creditCost fields
    - Define `Severity`, `SEVERITY_LEVELS`, `AuditFinding`, `AuditReport`
    - Define `DocType`, `ReferenceDocument`
    - Define `HookConfig` with when.type matching actual Kiro triggers (fileSaved, fileCreated, fileDeleted, promptSubmit, agentStop, preToolUse, postToolUse, userTriggered)
    - Define `AgentConfig` with full CLI agent schema (tools, allowedTools, toolAliases, toolsSettings, resources, hooks, includeMcpJson, keyboardShortcut, welcomeMessage)
    - Define `McpServerConfig` for both local (command+args) and remote (url+headers) servers
    - Define `KnowledgeBaseResource` for CLI knowledge base resources
    - Define `PowerConfig` with powerMd frontmatter (name, displayName, description, keywords)
    - Define `SteeringConfig` with inclusion modes (always, fileMatch, manual)
    - Define `SkillFrontmatter`, `SkillValidationResult`
    - Define `IntegrationRequirements`, `IntegrationPlan`, `OptimizationStep`, `BuildSummary`
    - Define `DocumentationSection`, `PlatformGuide`, `ScaffoldResult`, `ValidationResult` for MCP server responses
    - Define `McpToolName` union: `query_knowledge_base | get_decision_matrix | get_template | scaffold_tool | validate_config | audit_workspace | get_platform_guide`
    - Define `PlatformTarget` as `'ide' | 'cli' | 'both'`
    - Define `CliAgentConfig` extending AgentConfig with mcpServers
    - Define `PowerMcpJson` for power mcp.json structure
    - _Requirements: 1.3, 1.6, 2.2, 4.4, 6.1, 8.1, 4.7, 9.3, 10.3, 13.1, 13.2_

- [x] 2. URL Registry implementation
  - [x] 2.1 Implement `lib/urlRegistry.ts`
    - `getAll()`, `getByCategory()`, `getActive()`
    - `add()`, `markStale()`, `markFailed()`
    - `updateLastCrawled()`
    - `categorizeUrl()` mapping URL path segments to UrlCategory
      (e.g., `/docs/hooks/` → hooks, `/docs/cli/custom-agents/` → cli,
      `/docs/autonomous-agent/` → autonomous-agent, `/blog/` → blog)
    - `save()` / `load()` for JSON persistence
    - Seed kiro.dev/sitemap.xml URLs with auto-categorization
    - Seed agentskills.io URLs (/home, /what-are-skills,
      /specification, /integrate-skills) under
      `agent-skills-spec` category
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [x] 2.2 Write property tests for URL Registry
    - **Property 1: Registry entry completeness**
    - **Validates: Requirements 1.3**
  - [x] 2.3 Write property tests for category filtering
    - **Property 2: Category filtering correctness**
    - **Validates: Requirements 1.4**
  - [x] 2.4 Write property tests for stale exclusion
    - **Property 3: Stale URL exclusion invariant**
    - **Validates: Requirements 1.5**
  - [x] 2.5 Write unit tests for URL categorization
    - Test all kiro.dev path patterns: /docs/hooks/ → hooks,
      /docs/cli/ → cli, /docs/specs/ → specs, /blog/ → blog,
      /changelog/ → changelog, /docs/autonomous-agent/ → autonomous-agent
    - Test agentskills.io URLs → agent-skills-spec
    - Test edge cases: root URL, unknown paths
    - _Requirements: 1.6_

- [x] 3. Crawler implementation
  - [x] 3.1 Implement `lib/crawler.ts`
    - `fetch()` using Node.js native fetch
    - `fetchWithRetry()` with exponential backoff (1s, 2s, 4s)
    - `fetchBatch()` with configurable concurrency
    - Handle HTTP 404 → mark stale immediately (no retry)
    - Handle HTTP 429 → respect Retry-After header
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 3.2 Write property tests for retry behavior
    - **Property 6: Retry behavior on failure**
    - **Validates: Requirements 2.4**
  - [x] 3.3 Write property tests for timestamp update
    - **Property 7: Timestamp update after crawl**
    - **Validates: Requirements 2.5**

- [x] 4. Content Parser implementation
  - [x] 4.1 Implement `lib/contentParser.ts`
    - Use `cheerio` for HTML parsing
    - Extract title, headings (with level), code blocks (with language), tables, links, metadata
    - Strip navigation chrome, footers, repeated boilerplate
    - Convert to clean markdown preserving structure
    - Preserve YAML frontmatter blocks, mermaid diagram blocks
    - Preserve inline code formatting
    - _Requirements: 2.2, 2.3, 2.6_
  - [x] 4.2 Write property tests for content extraction
    - **Property 4: Content extraction completeness**
    - **Validates: Requirements 2.2**
  - [x] 4.3 Write property tests for structure preservation
    - **Property 5: Structure preservation during parsing**
    - **Validates: Requirements 2.3**

- [x] 5. Checkpoint - Core data pipeline
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Knowledge Base file system implementation
  - [x] 6.1 Implement `lib/knowledgeBase.ts`
    - `write()` with directory auto-creation and entry metadata
    - `read()`, `list()`
    - `updateIndex()` to regenerate root index.md
    - `urlToSlug()` kebab-case conversion
    - `urlToCategory()` mapping using URL path segments
    - Map agentskills.io URLs to `agent-skills-spec/` directory
    - Map kiro.dev/docs/* URLs to matching category directories
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [x] 6.2 Write property tests for directory placement
    - **Property 8: Correct directory placement**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 6.3 Write property tests for filename transformation
    - **Property 9: Kebab-case filename transformation**
    - **Validates: Requirements 3.3**
  - [x] 6.4 Write property tests for index completeness
    - **Property 10: Index completeness invariant**
    - **Validates: Requirements 3.4, 3.5**

- [x] 7. Master Reference Compiler implementation
  - [x] 7.1 Implement `lib/compiler.ts`
    - `compile()` aggregating all KB files with toolType tagging
    - Generate table of contents
    - Organize by Kiro tool type (10 types)
    - Generate decision matrix per tool type including platform
      and alternatives
    - Generate quick-reference scenario mapping
    - `serialize()` / `deserialize()` for round-trip
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 7.2 Write property tests for compilation coverage
    - **Property 11: Compilation content coverage**
    - **Validates: Requirements 4.1**
  - [x] 7.3 Write property tests for TOC completeness
    - **Property 12: Table of contents completeness**
    - **Validates: Requirements 4.2**
  - [x] 7.4 Write property tests for decision matrix
    - **Property 13: Decision matrix completeness per tool type**
    - **Validates: Requirements 4.4**
  - [x] 7.5 Write property tests for round-trip
    - **Property 14: Master reference round-trip**
    - **Validates: Requirements 4.6**

- [x] 8. Reference Library Generator implementation
  - [x] 8.1 Implement `lib/referenceLibrary.ts`
    - `generate()` producing best-practices, examples, templates
      per tool type
    - `generateAll()` for all 10 tool types
    - `getForToolType()` with optional docType filter
    - `writeAll()` to persist to reference-library/ directory
    - Cross-reference generation with markdown links
    - Skills best-practices doc SHALL incorporate Agent Skills
      spec progressive disclosure model and authoring guidelines
    - Hook best-practices SHALL document trigger types, action
      types, credit costs, and shell command availability
    - Steering best-practices SHALL document inclusion modes,
      AGENTS.md support, and file reference syntax
    - Power best-practices SHALL document POWER.md frontmatter,
      keyword-based activation, and steering file mapping
    - Custom agent best-practices SHALL document full config
      schema including resources, knowledge bases, and hooks
    - _Requirements: 4.7, 4.8, 4.9, 4.10, 4.11_
  - [x] 8.2 Write property tests for per-tool-type coverage
    - **Property 27: Reference library per-tool-type coverage**
    - **Validates: Requirements 4.7, 4.8, 4.9**
  - [x] 8.3 Write property tests for cross-referencing
    - **Property 28: Reference library cross-referencing**
    - **Validates: Requirements 4.10**

- [x] 9. Checkpoint - Knowledge base compilation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Change Detector implementation
  - [x] 10.1 Implement `lib/changeDetector.ts`
    - `fetchSitemap()` parsing sitemap XML including lastmod,
      changefreq, and priority fields
    - `checkChangelog()` with timestamp comparison
    - `run()` comparing sitemap against registry using both
      URL presence and lastmod timestamps, adding new URLs,
      flagging modified URLs, recording run state
    - `loadState()` / `saveState()` for `change-state.json`
      persistence
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  - [x] 10.2 Write property tests for change detection
    - **Property 15: Change detection correctness**
    - **Validates: Requirements 12.1, 12.2**
  - [x] 10.3 Write property tests for changelog comparison
    - **Property 16: Changelog timestamp comparison**
    - **Validates: Requirements 12.3**
  - [x] 10.4 Write property tests for error preservation
    - **Property 17: Error preservation of registry state**
    - **Validates: Requirements 12.5**
  - [x] 10.5 Write property tests for run result
    - **Property 18: Run result completeness**
    - **Validates: Requirements 12.6**

- [x] 11. Tooling Advisor implementation
  - [x] 11.1 Implement `lib/toolingAdvisor.ts`
    - `recommend()` returning ranked recommendations with
      rationale, KB refs, templates, trade-offs, platform,
      and creditCost
    - `getTemplate()` returning starter config per tool type
      (all 10 types with accurate schemas)
    - `getDecisionMatrix()` returning formatted matrix with
      platform column (ide-only, cli-only, both, cloud)
    - Platform availability mapping
    - Credit cost awareness (shell hooks = none, agent hooks = medium)
    - Skill recommendations SHALL reference Agent Skills spec
      authoring best practices and skills-ref CLI
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [x] 11.2 Write property tests for recommendation completeness
    - **Property 19: Recommendation completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3**
  - [x] 11.3 Write property tests for platform compatibility
    - **Property 20: Platform compatibility correctness**
    - **Validates: Requirements 6.4**
  - [x] 11.4 Write property tests for ranking
    - **Property 21: Ranking and trade-offs**
    - **Validates: Requirements 6.5**

- [x] 12. Checkpoint - Advisory and detection layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Config Generator implementation
  - [x] 13.1 Implement `lib/configGenerator.ts`
    - `generateHook()` producing valid hook JSON with correct
      when.type values (fileSaved, fileCreated, fileDeleted,
      promptSubmit, agentStop, preToolUse, postToolUse,
      userTriggered) and then.type values (askAgent, runCommand)
    - `generateAgent()` producing valid CLI agent JSON with
      full schema (name, description, prompt, model, tools,
      allowedTools, toolAliases, toolsSettings, mcpServers,
      resources, hooks, includeMcpJson, keyboardShortcut,
      welcomeMessage)
    - `generatePower()` producing POWER.md with frontmatter
      (name, displayName, description, keywords) plus optional
      mcp.json and steering files
    - `generateSteering()` producing markdown with valid
      inclusion mode frontmatter (always, fileMatch, manual)
    - `generateSkill()` producing SKILL.md with Agent Skills
      spec-compliant frontmatter and directory structure
    - `generateMcpConfig()` producing valid mcp.json for both
      local (command+args) and remote (url+headers) servers
    - `validate()` schema validation per tool type
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8_
  - [x] 13.2 Write property tests for config generation
    - **Property 22: Generated config validity**
    - **Validates: Requirements 5.1, 5.3**
  - [x] 13.3 Write property tests for power structure
    - **Property 23: Power structure completeness**
    - **Validates: Requirements 5.5**

- [x] 14. Master Tool Power implementation
  - [x] 14.1 Create `powers/kiro-knowledge-base/POWER.md`
    - Frontmatter: name, displayName, description, keywords
      covering all Kiro tooling terms
    - Onboarding section with dependency checks
    - Steering file mapping for different workflows
    - _Requirements: 7.1, 7.2, 7.5, 13.1_
  - [x] 14.2 Create `powers/kiro-knowledge-base/mcp.json`
    - Configure MCP Documentation Server as local stdio server
    - Point to `lib/mcpServer.js` with command + args
    - _Requirements: 7.1, 7.11, 13.1, 13.5_
  - [x] 14.3 Create platform-specific steering files
    - `steering/ide-workflows.md` — Power creation, hook setup,
      steering authoring for IDE users
    - `steering/cli-workflows.md` — Agent creation, CLI hooks,
      knowledge base resources for CLI users
    - `steering/cross-platform.md` — MCP servers, skills, and
      steering docs that work on both platforms
    - `steering/tooling-decision-guide.md` — When to use which
      tool type, with platform availability and credit costs
    - `steering/workspace-audit-guide.md` — How to audit
      configurations against best practices
    - `steering/tool-templates.md` — Starter templates per tool
      type with accurate schemas
    - _Requirements: 7.1, 7.6, 13.6_

- [x] 15. Workspace Auditor implementation
  - [x] 15.1 Implement `lib/workspaceAuditor.ts`
    - `scan()` finding all Kiro config files by glob patterns:
      `.kiro/steering/*.md`, `.kiro/hooks/*.kiro.hook`,
      `.kiro/skills/*/SKILL.md`, `.kiro/specs/*/`,
      `custom-powers/*/POWER.md`, `.kiro/settings/mcp.json`,
      `.kiro/settings/settings.json`, `AGENTS.md`
    - `compareAgainstBestPractices()` checking configs against
      KB best practices including:
      - Steering: valid inclusion mode frontmatter
      - Hooks: valid when/then structure with correct trigger types
      - Skills: Agent Skills spec compliance (frontmatter, directory)
      - Powers: POWER.md frontmatter completeness
      - MCP: no hardcoded secrets, valid server configs
    - `generateReport()` producing severity-grouped markdown
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [x] 15.2 Write property tests for workspace scan
    - **Property 24: Workspace scan finds all config files**
    - **Validates: Requirements 9.1**
  - [x] 15.3 Write property tests for finding completeness
    - **Property 25: Finding completeness invariant**
    - **Validates: Requirements 9.3, 9.4**
  - [x] 15.4 Write property tests for report grouping
    - **Property 26: Audit report severity grouping**
    - **Validates: Requirements 9.5**

- [x] 16. Checkpoint - Tool layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Skills Validator implementation
  - [x] 17.1 Implement `lib/skillsValidator.ts`
    - `validateName()` enforcing Agent Skills spec name rules:
      1-64 chars, lowercase alphanumeric + hyphens, no
      leading/trailing/consecutive hyphens, must match parent
      directory name
    - `validateFrontmatter()` parsing YAML frontmatter and
      checking required fields (name, description) and optional
      fields (license, compatibility max 500 chars, metadata
      as key-value map, allowed-tools as space-delimited list)
      against spec constraints
    - `validateDirectory()` checking SKILL.md exists at root,
      optional scripts/, references/, assets/ directories
    - `serializeFrontmatter()` producing valid YAML frontmatter
    - `parseFrontmatter()` extracting frontmatter from markdown
    - _Requirements: 5.3, 5.4, 5.9, 9.7_
  - [x] 17.2 Write property tests for name validation
    - **Property 32: Agent Skills spec name validation**
    - **Validates: Requirements 5.3**
  - [x] 17.3 Write property tests for directory validation
    - **Property 33: Agent Skills spec directory validation**
    - **Validates: Requirements 5.4**
  - [x] 17.4 Write property tests for frontmatter round-trip
    - **Property 34: Agent Skills spec frontmatter round-trip**
    - **Validates: Requirements 5.3, 5.4**

- [x] 18. MCP Documentation Server implementation
  - [x] 18.1 Implement `lib/mcpServer.ts`
    - Create MCP server using `@modelcontextprotocol/sdk`
    - Register `query_knowledge_base` tool: reads Master
      Reference and Reference Library, filters by topic/
      toolType/searchTerm
    - Register `get_decision_matrix` tool: returns formatted
      decision matrix from compiled reference
    - Register `get_template` tool: returns starter template
      for a given KiroToolType from Reference Library
    - Register `scaffold_tool` tool: delegates to
      Scaffolding Engine, returns generated files
    - Register `validate_config` tool: delegates to
      Config Generator validate(), returns ValidationResult
    - Register `audit_workspace` tool: delegates to
      Workspace Auditor, returns AuditReport
    - Register `get_platform_guide` tool: returns
      platform-specific setup instructions for ide/cli/both
    - Implement response caching with TTL for knowledge
      base queries
    - Support stdio transport (local dev) and HTTP/SSE
      transport (shared team use) via config flag
    - Implement health check endpoint
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7,
      8.8, 8.9, 8.10, 8.11, 8.12_
  - [x] 18.2 Write property tests for MCP tool completeness
    - **Property 36: MCP server tool completeness**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.8, 8.9,
      8.10, 8.11**
  - [x] 18.3 Write property tests for cache idempotence
    - **Property 37: MCP server cache idempotence**
    - **Validates: Requirements 8.7**
  - [x] 18.4 Write property tests for validate_config round-trip
    - **Property 38: MCP server validate_config round-trip**
    - **Validates: Requirements 8.9**
  - [x] 18.5 Write unit tests for MCP server
    - Test health check endpoint returns valid status
    - Test stdio vs HTTP/SSE transport selection
    - Test graceful degradation when KB unavailable
    - _Requirements: 8.4, 8.5, 8.6_

- [x] 19. Platform-Specific Delivery implementation
  - [x] 19.1 Create `agents/kiro-knowledge-base-agent.json`
    - Agent config with name, description, prompt
    - Configure mcpServers pointing to MCP Documentation
      Server (same server as IDE power mcp.json)
    - Configure resources for knowledge base file access
    - Configure tools and allowedTools
    - Add welcomeMessage with platform-aware options:
      "Create IDE Tool", "Create CLI Tool",
      "Create Cross-Platform Tool", "Audit Workspace",
      "Optimize Workflows"
    - _Requirements: 13.2, 13.4, 13.5, 13.7_
  - [x] 19.2 Create `agents/kiro-knowledge-base-agent-prompt.md`
    - Full prompt file referenced by agent config
    - Include platform-aware decision flow
    - Reference MCP server tools for all operations
    - _Requirements: 13.4_
  - [x] 19.3 Write unit tests for platform delivery configs
    - Verify IDE power mcp.json and CLI agent mcpServers
      reference the same MCP server
    - Verify CLI agent welcomeMessage contains all required
      options
    - Verify steering directory contains all platform files
    - _Requirements: 13.1, 13.2, 13.5, 13.6, 13.7_
  - [x] 19.4 Write property tests for cross-platform consistency
    - **Property 42: Cross-platform MCP server consistency**
    - **Validates: Requirements 13.5**

- [x] 20. Checkpoint - MCP server and platform delivery
  - Ensure all tests pass, ask the user if questions arise.
  - Verify MCP server starts in stdio mode
  - Verify IDE power mcp.json connects to MCP server
  - Verify CLI agent mcpServers connects to same server

- [x] 21. Scaffolding Engine implementation
  - [x] 21.1 Implement `lib/scaffoldingEngine.ts`
    - `scaffoldTool()` with guided Q&A flow per tool type
    - `scaffoldPower()` including mcp.json template pointing
      to MCP Documentation Server
    - `scaffoldAgent()` including mcpServers config template
      pointing to MCP Documentation Server
    - `scaffoldComposite()` creating full integration package:
      MCP server config + IDE power + CLI agent as coordinated
      output with shared MCP server references
    - Skill scaffolding with progressive disclosure optimization
    - Power scaffolding with naming conventions and token
      efficiency measurement
    - Validate all output via Config Generator before writing
    - Support interactive and programmatic (API) modes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6,
      11.7, 11.8, 11.9, 11.10, 11.11, 11.12_
  - [x] 21.2 Write property tests for scaffolding MCP refs
    - **Property 39: Scaffolding platform-aware MCP references**
    - **Validates: Requirements 11.10, 11.11**
  - [x] 21.3 Write property tests for composite completeness
    - **Property 40: Composite integration completeness**
    - **Validates: Requirements 11.12**

- [x] 22. Workflow Builder Agent implementation
  - [x] 22.1 Create `agents/kiro-workflow-builder.json`
    - Agent config with name, description, prompt (file URI)
    - Reference Master_Reference and Reference_Library as
      file:// resources
    - Configure mcpServers pointing to MCP Documentation
      Server for knowledge base access
    - Configure tools: read, write, shell
    - Configure allowedTools: read
    - Configure hooks: agentSpawn to scan .kiro/ directory
    - Add welcomeMessage with mode selection
    - Implement two-mode prompt: "Create New Integration" and
      "Optimize Existing Workflows"
    - _Requirements: 10.1, 10.2, 10.9, 10.15_
  - [x] 22.2 Create `agents/kiro-workflow-builder-prompt.md`
    - Full prompt file referenced by agent config
    - Include decision matrix context
    - Include tool type templates
    - Define interaction flow for both modes
    - Include platform selection step in "Create New
      Integration" flow (IDE, CLI, or both)
    - _Requirements: 10.1, 10.2_
  - [x] 22.3 Implement `lib/workflowBuilder.ts`
    - `gatherRequirements()` collecting target tech, automation
      goals, workflow goals, preferred platform (ide/cli/both)
    - `buildIntegrationPlan()` using Tooling_Advisor for
      recommendations, generating file list with correct
      `.kiro/` subdirectory paths
    - `buildCompositePackage()` for platform="both": generate
      shared MCP server config, IDE power, and CLI agent
      pointing to same MCP Documentation Server
    - `buildOptimizationSteps()` using Workspace_Auditor audit
      report, creating actionable steps with previews
    - `applyOptimization()` applying a single step with
      validation
    - `generateBuildSummary()` listing all created/modified
      files with purposes and testing instructions
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7,
      10.8, 10.10, 10.11, 10.13, 10.14_
  - [x] 22.4 Write property tests for integration plans
    - **Property 29: Recommendation includes usage patterns
      and trade-offs**
    - **Validates: Requirements 10.3, 10.4**
  - [x] 22.5 Write property tests for generated file validity
    - **Property 30: Workflow Builder generated files are valid**
    - **Validates: Requirements 10.5, 10.8**
  - [x] 22.6 Write property tests for build summary
    - **Property 31: Build summary completeness**
    - **Validates: Requirements 10.10**
  - [x] 22.7 Write property tests for platform-coordinated output
    - **Property 41: Workflow Builder platform-coordinated
      output**
    - **Validates: Requirements 10.14**

- [x] 23. Kiro Hook for change detection
  - [x] 23.1 Create `.kiro/hooks/kiro-knowledge-base-update.kiro.hook`
    - userTriggered (manual) trigger type
    - askAgent prompt to run change detector
    - _Requirements: 12.4_

- [x] 24. CLI entry points and wiring
  - [x] 24.1 Create `bin/crawl.ts` CLI script
    - Wire URL_Registry -> Crawler -> Content_Parser ->
      Knowledge_Base pipeline
    - Accept --url or --all flags
    - Accept --category flag for filtered crawling
    - _Requirements: 1.1, 2.1, 2.5, 3.1_
  - [x] 24.2 Create `bin/compile.ts` CLI script
    - Wire Knowledge_Base -> Compiler -> master-reference.md
    - Wire Knowledge_Base -> Reference_Library -> reference
      library docs
    - _Requirements: 4.1, 4.7_
  - [x] 24.3 Create `bin/detect-changes.ts` CLI script
    - Wire Change_Detector -> URL_Registry -> Crawler
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 24.4 Create `bin/audit.ts` CLI script
    - Wire Workspace_Auditor -> report output
    - Accept --workspace flag for target directory
    - _Requirements: 9.1, 9.5_
  - [x] 24.5 Create `bin/validate-skill.ts` CLI script
    - Wire Skills_Validator for standalone skill validation
    - Accept directory path argument
    - _Requirements: 5.3, 5.4_
  - [x] 24.6 Create `bin/mcp-server.ts` CLI entry point
    - Start MCP Documentation Server in stdio mode (default)
    - Accept --http flag for HTTP/SSE transport
    - Accept --port flag for HTTP server port
    - _Requirements: 8.4_

- [x] 25. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.
  - Run full pipeline: crawl → compile → verify master reference
  - Run workspace audit on the project itself
  - Verify MCP server starts and responds to tool calls
  - Verify IDE power and CLI agent both connect to MCP server

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Task numbering reflects dependency order; earlier tasks
  must complete before later ones
- The config generator (task 13) was extracted from the
  original power implementation task for better modularity
  and testability
- The MCP Documentation Server (task 18) depends on Config
  Generator (13), Tooling Advisor (11), Workspace Auditor (15),
  and Skills Validator (17) since it wraps them all
- The Scaffolding Engine (task 21) depends on the MCP server
  types and Config Generator
- Platform delivery (task 19) depends on the MCP server (18)
  since both IDE power and CLI agent point to it
- Tasks marked with `*` are optional and can be skipped for
  faster MVP
