---
title: "Specification - Agent Skills"
sourceUrl: "https://agentskills.io/specification"
category: "agent-skills-spec"
lastUpdated: "2026-02-07T05:52:50.566Z"
---
- Directory structure
- SKILL.md format
- Frontmatter (required)
- name field
- description field
- license field
- compatibility field
- metadata field
- allowed-tools field
- Body content
- Optional directories
- scripts/
- references/
- assets/
- Progressive disclosure
- File references
- Validation

## ​Directory structure

```
skill-name/
└── SKILL.md          # Required

```

## ​SKILL.md format

### ​Frontmatter (required)

```
---
name: skill-name
description: A description of what this skill does and when to use it.
---

```

```
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---

```

| Field | Required | Constraints |
| --- | --- | --- |
| name | Yes | Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen. |
| description | Yes | Max 1024 characters. Non-empty. Describes what the skill does and when to use it. |
| license | No | License name or reference to a bundled license file. |
| compatibility | No | Max 500 characters. Indicates environment requirements (intended product, system packages, network access, etc.). |
| metadata | No | Arbitrary key-value mapping for additional metadata. |
| allowed-tools | No | Space-delimited list of pre-approved tools the skill may use. (Experimental) |

#### ​name field

- Must be 1-64 characters
- May only contain unicode lowercase alphanumeric characters and hyphens (a-z and -)
- Must not start or end with -
- Must not contain consecutive hyphens (--)
- Must match the parent directory name

```
name: pdf-processing

```

```
name: data-analysis

```

```
name: code-review

```

```
name: PDF-Processing  # uppercase not allowed

```

```
name: -pdf  # cannot start with hyphen

```

```
name: pdf--processing  # consecutive hyphens not allowed

```

#### ​description field

- Must be 1-1024 characters
- Should describe both what the skill does and when to use it
- Should include specific keywords that help agents identify relevant tasks

```
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.

```

```
description: Helps with PDFs.

```

#### ​license field

- Specifies the license applied to the skill
- We recommend keeping it short (either the name of a license or the name of a bundled license file)

```
license: Proprietary. LICENSE.txt has complete terms

```

#### ​compatibility field

- Must be 1-500 characters if provided
- Should only be included if your skill has specific environment requirements
- Can indicate intended product, required system packages, network access needs, etc.

```
compatibility: Designed for Claude Code (or similar products)

```

```
compatibility: Requires git, docker, jq, and access to the internet

```

#### ​metadata field

- A map from string keys to string values
- Clients can use this to store additional properties not defined by the Agent Skills spec
- We recommend making your key names reasonably unique to avoid accidental conflicts

```
metadata:
  author: example-org
  version: "1.0"

```

#### ​allowed-tools field

- A space-delimited list of tools that are pre-approved to run
- Experimental. Support for this field may vary between agent implementations

```
allowed-tools: Bash(git:*) Bash(jq:*) Read

```

### ​Body content

- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

## ​Optional directories

### ​scripts/

- Be self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully

### ​references/

- REFERENCE.md - Detailed technical reference
- FORMS.md - Form templates or structured data formats
- Domain-specific files (finance.md, legal.md, etc.)

### ​assets/

- Templates (document templates, configuration templates)
- Images (diagrams, examples)
- Data files (lookup tables, schemas)

## ​Progressive disclosure

1. Metadata (~100 tokens): The name and description fields are loaded at startup for all skills
2. Instructions (< 5000 tokens recommended): The full SKILL.md body is loaded when the skill is activated
3. Resources (as needed): Files (e.g. those in scripts/, references/, or assets/) are loaded only when required

## ​File references

```
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:
scripts/extract.py

```

## ​Validation

```
skills-ref validate ./my-skill

```