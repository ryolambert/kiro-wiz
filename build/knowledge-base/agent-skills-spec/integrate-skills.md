---
title: "Integrate skills into your agent - Agent Skills"
sourceUrl: "https://agentskills.io/integrate-skills"
category: "agent-skills-spec"
lastUpdated: "2026-02-07T05:52:50.736Z"
---
- Integration approaches
- Overview
- Skill discovery
- Loading metadata
- Parsing frontmatter
- Injecting into context
- Security considerations
- Reference implementation

## ​Integration approaches

## ​Overview

1. Discover skills in configured directories
2. Load metadata (name and description) at startup
3. Match user tasks to relevant skills
4. Activate skills by loading full instructions
5. Execute scripts and access resources as needed

## ​Skill discovery

## ​Loading metadata

### ​Parsing frontmatter

```
function parseMetadata(skillPath):
    content = readFile(skillPath + "/SKILL.md")
    frontmatter = extractYAMLFrontmatter(content)

    return {
        name: frontmatter.name,
        description: frontmatter.description,
        path: skillPath
    }

```

### ​Injecting into context

```
<available_skills>
  <skill>
    <name>pdf-processing</name>
    <description>Extracts text and tables from PDF files, fills forms, merges documents.</description>
    <location>/path/to/skills/pdf-processing/SKILL.md</location>
  </skill>
  <skill>
    <name>data-analysis</name>
    <description>Analyzes datasets, generates charts, and creates summary reports.</description>
    <location>/path/to/skills/data-analysis/SKILL.md</location>
  </skill>
</available_skills>

```

## ​Security considerations

- Sandboxing: Run scripts in isolated environments
- Allowlisting: Only execute scripts from trusted skills
- Confirmation: Ask users before running potentially dangerous operations
- Logging: Record all script executions for auditing

## ​Reference implementation

```
skills-ref validate <path>

```

```
skills-ref to-prompt <path>...

```