---
title: "What are skills? - Agent Skills"
sourceUrl: "https://agentskills.io/what-are-skills"
category: "agent-skills-spec"
lastUpdated: "2026-02-07T05:52:50.341Z"
---
- How skills work
- The SKILL.md file
- Next steps

```
my-skill/
├── SKILL.md          # Required: instructions + metadata
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
└── assets/           # Optional: templates, resources

```

## ​How skills work

1. Discovery: At startup, agents load only the name and description of each available skill, just enough to know when it might be relevant.
2. Activation: When a task matches a skill’s description, the agent reads the full SKILL.md instructions into context.
3. Execution: The agent follows the instructions, optionally loading referenced files or executing bundled code as needed.

## ​The SKILL.md file

```
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---

# PDF Processing

## When to use this skill
Use this skill when the user needs to work with PDF files...

## How to extract text
1. Use pdfplumber for text extraction...

## How to fill forms
...

```

- name: A short identifier
- description: When to use this skill

- Self-documenting: A skill author or user can read a SKILL.md and understand what it does, making skills easy to audit and improve.
- Extensible: Skills can range in complexity from just text instructions to executable code, assets, and templates.
- Portable: Skills are just files, so they’re easy to edit, version, and share.

## ​Next steps

- View the specification to understand the full format.
- Add skills support to your agent to build a compatible client.
- See example skills on GitHub.
- Read authoring best practices for writing effective skills.
- Use the reference library to validate skills and generate prompt XML.