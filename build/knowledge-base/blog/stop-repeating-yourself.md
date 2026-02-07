---
title: "Stop repeating yourself: why global steering is the AI context layer you’ve been missing"
sourceUrl: "https://kiro.dev/blog/stop-repeating-yourself/"
category: "blog"
lastUpdated: "2026-02-07T05:52:41.454Z"
---
**You've told your AI assistant 47 times that you prefer functional React components. 23 times that you use Prettier with semicolons. And at least 15 times that your test files go in ****__tests__**** directories, not next to the source code.**

Sound familiar?

Here's the real cost: That's not just annoying—**it's killing your productivity.** Every time you set up a new project, you're spending 10-15 minutes re-explaining preferences you've already articulated dozens of times. For a developer working on 20 projects a year, that's **5+ hours of pure repetition.** For a team of 50? That's **250 hours annually** spent copy-pasting the same standards across workspaces.

And it gets worse: When context isn't consistent, neither is your code. One project gets your security standards. Another misses them because you forgot to paste that file. Your test coverage varies wildly. Your code style drifts. **Inconsistency compounds into technical debt.**

If you're using AI to code (and honestly, who isn't in 2025?), you've hit this wall: **every new project starts from zero.** The AI doesn't remember your preferences, your team's conventions, or your company's standards. You're stuck copy-pasting the same instructions into every workspace, or worse—typing them out manually every single time.

**This is the problem Kiro Global Steering solves.**

Think of Kiro Global Steering as your personal `.bashrc` for AI context—configuration that follows you everywhere, ready when you need it, without the repetition. Write your preferences once, and they become the foundation for every project you touch. No copying. No forgetting. No inconsistency.

**The impact? Developers save hours monthly. Teams achieve consistency automatically. Organizations enforce standards at scale.** And most importantly: your AI assistant finally understands you from day one, every single time.

## What is Steering, Anyway?

Before we dive into Global Steering, let's level-set on what steering actually does.

**Steering is persistent AI context.** It is a set of markdown files that tell AI agents about your preferences, standards, and decisions *before* they start working. Instead of explaining the same things in every conversation, you write it once in a steering file, and the AI reads it automatically as it starts working on your requests

### Current State: Workspace Steering

Right now, Kiro uses workspace-specific steering stored at:

This approach works well when you need to specify preferences on a per-project basis. But here's the problem...

But here's the problem: **Most of what you tell the AI isn't project-specific.**

Your coding style preferences are the same across all your projects. Your testing philosophy should be consistent everywhere. You need universal security standards. Why should you repeat those in every workspace?

## Enter Global Steering: Your Personal AI Configuration Layer

Global Steering lives in your home directory:

**It's persistent. It's universal. It follows you everywhere.**

Any markdown file you put here becomes available to Kiro across *all* your projects, unless explicitly overridden at the workspace level.

### What Belongs in Global Steering?

Think about what's consistent across your work, regardless of the project:

#### 🎨 Personal Coding Style

#### 🧪 Testing Philosophy

#### 🔒 Security Requirements

#### 📝 Documentation Standards

#### 🏗️ Architecture Principles

This pattern defines how you work, not what you're building.

## Real-World Scenario: Individual Developer

Let me show you how this works in practice.

### Meet Jane Doe

Jane is a freelance full-stack developer who works on customer projects using React and Node, open source contributions, and personal side projects. Every project has different business logic, but **her standards stay the same.**

### Jane’s Global Steering Setup

Jane’s `~/.kiro/steering/` folder:

**Key files:**

### Workspace-Specific Steering

Now Jane starts a new client project: an e-commerce platform.

Her project-specific steering files are located at `/.kiro/steering/`:

### How It Works Together

Jane asks Kiro: *"Create a new ProductCard component":*

**Kiro reads:**

1. Global Steering (~/.kiro/steering/) - style.md → Functional components, Prettier settings - accessibility.md → Semantic HTML, alt text requirements - testing.md → Test file location and coverage
2. Workspace Steering (/.kiro/steering/) - tech.md → Using Next.js, TypeScript, Tailwind - product.md → Product data structure and features - structure.md → Components go in src/components/

This will result in Kiro generating a functional React component with TypeScript using Tailwind CSS classes, proper semantic HTML and accessibility attributes, places it in the correct directory with a corresponding test file, while matching Jane's coding style, all automatically.

**All without Jane repeating her preferences.**

## Team Scenario: Organization-Wide Standards

Now let's scale this up. What happens when you have a team of 50 developers?

### Meet AnyCompany

AnyCompany has 8 development teams managing 30+ active repositories across mixed tech stacks (React, Vue, Python, Go) with strict security and compliance requirements.

**The challenge:** Every developer needs to follow company standards, but they're working on different projects with different technologies.

### AnyCompany's Global Steering Strategy

#### Deployment Approaches

Organizations have flexibility in how they distribute global steering files to their teams. The key constraint is that Kiro only reads global steering files from the `~/.kiro/steering/` directory, but the files themselves can originate from anywhere through copying or symlinking.

For teams using version control, AnyCompany maintains a shared repository containing their company-wide steering files for security policies, SOC2 and GDPR compliance requirements, code review standards, on-call procedures, accessibility requirements, and UI/UX brand guidelines. Developers clone this repository during onboarding and either copy the files directly to `~/.kiro/steering/` or create symlinks that automatically reflect updates when the central repository changes. A simple setup script automates this process, ensuring every developer gets the same baseline without manual copying.

For enterprises with Mobile Device Management tools like Jamf or Intune, the deployment can be fully automated. MDM scripts can directly populate `~/.kiro/steering/` by downloading files from internal servers, setting appropriate permissions, and enforcing that required files remain present. Alternatively, MDM can deploy files to a central location like `/opt/company/kiro-steering/` and create symlinks to `~/.kiro/steering/`, which provides centralized updates while keeping files in a managed location. This approach offers zero manual setup for developers, centralized policy management, automatic updates when policies change, and an audit trail for compliance.

### Real Team Example: Front-end Team

AnyCompany's frontend team adds their own layer:

#### Team-Shared Steering Repository (Front-end)

#### Individual Developer: John Doe

John is a frontend developer at AnyCompany.

**John's full steering setup:**

When John asks Kiro to build something, Kiro reads files with workspace steering taking precedence over global steering. Workspace steering is project specific and takes precedence when conflicts exist. Global steering includes John's personal preferences, team conventions, and company standards, and is used when no workspace override exists. As a result, John gets company security compliance automatically applied, frontend team standards that are shared across projects, personal workflow preferences that are individual to him, and project specific context from the current workspace. All of these layers work together seamlessly.

### Scenario: Polyglot Developer

Another scenario is if you work on multiple technology stacks: Frontend development with React and TypeScript, Backend services using Python and FastAPI, Mobile applications built with React Native, and Infrastructure managed through Terraform. A common problem across these ecosystems is that each has different conventions, making it easy to end up with inconsistent practices across your codebase.

The solution shown below demonstrates how you can specify standards across various coding languages, with language-appropriate implementation. Now your testing standards are consistent, but implementation varies appropriately by language.

**Global Steering solution:**

## General Steering Guidelines

### What NOT to Put in Steering

You should never include API keys or secrets, database credentials, internal URLs or endpoints, customer data or PII, or proprietary algorithms (if you plan to share steering files). This is because global steering files are plain text markdown that are often shared or synced, and they are not encrypted by default.

### What's Safe to Include

It's safe to include general security practices, code patterns and preferences, testing approaches, documentation standards, public API design principles, and framework and library choices in your steering files.

## Getting Started: Your First Global Steering File

Ready to try global steering and see it in action? Here is a simple example you can follow to see it for yourself.

### Step 1: Create Your First File

Pick the thing you repeat most often. For most developers, it's coding style:

### Step 2: Test It

Open a new project in Kiro and ask: *"Create a new component"*

Kiro should follow your style preferences from `~/.kiro/steering/style.md` without you mentioning them.

### Step 3: Expand Gradually

Add more files as you discover repeated patterns and build it organically as you notice repetition.

## Wrapping up

Now that you have a more efficient way to work with Kiro so that it understands your overall style and preferences by the use of [global steering](/docs/steering/), the only question left is: What global steering files are you going to start applying to your Kiro projects to save you hours of time and repetitive instruction?

Create your first global steering file today. Experience what it's like to never repeat yourself again.

**What will you put in your global steering? Share your setup with the hashtag #codewithkiro** or tag @kirodotdev on [X](https://x.com/kirodotdev), [LinkedIn](https://www.linkedin.com/showcase/kirodotdev), or [Instagram](https://www.instagram.com/kirodotdev), and @kiro.dev on [Bluesky](https://bsky.app/profile/kiro.dev).