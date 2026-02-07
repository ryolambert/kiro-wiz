---
title: "GitHub - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/github/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:37.425Z"
---
# GitHub

---

Kiro autonomous agent (Preview) integrates with GitHub to work on your repositories.

## Installation

Connect your GitHub account to Kiro autonomous agent:

1. Navigate to app.kiro.dev/agent and go to Settings
2. Select "Connect GitHub" under Integrations
3. Authorize the Kiro Agent GitHub app
4. Grant access to specific repositories or all repositories in your organization

The Kiro Agent GitHub app only needs to be installed once per organization or account. Organization owners select which repositories the app can access, controlling which repositories are available to Kiro.

Individual users then connect their GitHub account to Kiro. Each user sees all repositories where both conditions are met:

1. The Kiro Agent GitHub app has been installed and authorized for that repository
2. The user's GitHub account has access to that repository

This means you'll see repositories from personal accounts, shared repositories, and organizations—regardless of who installed the app—as long as your GitHub user has access.

Users can only assign tasks to repositories where they have write permissions. Other users cannot assign tasks on your behalf—each user controls their own agent tasks.

## Assigning tasks from GitHub issues

You can assign work to Kiro autonomous agent directly from GitHub issues in two ways:

- Add the kiro label - Kiro will start working on the task and listen to all comments on the issue for additional context or feedback.
- Mention /kiro in a comment - Assigns that specific issue to Kiro.

If you use `/kiro` but haven't registered your GitHub account with Kiro, you'll receive instructions on how to sign up. The Kiro Agent GitHub app must be installed on the repository for this to work.

## How the agent works with GitHub

**Clones repositories**

The agent clones authorized repositories into its [isolated sandbox environment](/docs/autonomous-agent/sandbox). It can work across multiple repositories in a single task, maintaining context and coordinating changes.

**Creates branches and commits**

For each task, the agent creates a feature branch from your default branch, makes commits with clear messages, and pushes to your repository. The agent acts on your behalf and includes both you and itself as co-authors in every commit, ensuring proper attribution.

**Opens and updates pull requests**

After completing work, the agent opens pull requests with a detailed description of changes, implementation approach, and any trade-offs considered.

The agent only responds to your explicit feedback and instructions (the user who created the task). When you provide feedback, the agent will address all comments on the pull request, including those from other reviewers. If you don't want a comment to be addressed, delete it before providing your feedback, or reply to it with your own perspective (which will trigger the agent to review).

GitHub action feedback (automated checks, tests, security scans) is automatically addressed when you provide any feedback.

You can provide feedback in two ways:

- Leave comments directly on the pull request
- Provide feedback from the task view on app.kiro.dev/agent

**Learns from your code reviews**

You can teach the agent your team's patterns through PR feedback. When you leave comments like "remember to use our standard error handling" or "always follow our naming conventions," the agent learns and applies those patterns to future work across all repositories. Only your feedback influences the agent's learnings—other reviewers' comments don't affect what the agent learns.

## Multiple users on the same repository

When multiple team members have Kiro autonomous agent connected to the same repository, each user can independently assign tasks.

**How it works**

- The Kiro Agent GitHub app only needs to be installed once per repository
- Each registered user can assign tasks independently
- If multiple users assign the same GitHub issue (using the kiro label or /kiro command), Kiro creates separate tasks for each user
- Each task runs independently in its own isolated sandbox environment

**Best practices**

- Coordinate with your team to avoid duplicate work on the same issue
- Use GitHub's issue assignment feature to indicate who is working on what
- Review open pull requests before assigning similar tasks to avoid conflicts

## Permissions

Connecting to GitHub requires several layers of access control.

**App installation and configuration**

The Kiro Agent GitHub app is installed once per organization or account by an owner. The app configuration is global and defines the maximum set of repositories that Kiro can access. All users in the organization share this app installation.

**Repository-level access**

Each user can only work with repositories where both conditions are met:

- The Kiro Agent GitHub app has been granted access by an organization owner
- The user has write permissions on the repository

This two-layer approach ensures that owners control the maximum scope of access while individual users can only assign tasks to repositories they personally have access to.

**Repository permissions**

The following repository permissions are required:

Read & Write:

- Actions - Workflows, workflow runs and artifacts
- Checks - Checks on code
- Contents - Repository contents, commits, branches, downloads, releases, and merges
- Issues - Issues and related comments, assignees, labels, and milestones
- Pull requests - Pull requests and related comments, assignees, labels, milestones, and merges
- Workflows - Update GitHub Action workflow files

Read-only:

- Metadata - Search repositories, list collaborators, and access repository metadata (mandatory)
- Administration - Repository creation, deletion, settings, teams, and collaborators
- Commit statuses - Commit statuses

**Organization permissions**

Read-only:

- Administration - Manage access to an organization

**Webhook events**

The app subscribes to the following webhook events:

- Pull requests (opened, synchronized, closed, etc.)
- Pull request reviews (submitted, edited, dismissed)
- Pull request review comments (created, edited, deleted)
- Issues (opened, edited, closed, labeled, etc.)
- Issue comments (created, edited, deleted)
- Push events
- Branch and tag creation/deletion
- Releases (created, edited, published, etc.)
- Repository changes (created, deleted, renamed, etc.)
- Repository dispatch and ruleset events
- Workflow runs (requested, completed)
- Installation target changes

**User permissions**

Users must have write access to create branches and open pull requests.

**Branch protection**

The agent respects your branch protection rules. It cannot push directly to protected branches and must go through your standard pull request workflow.

**Organization policies**

If your organization has security policies or required status checks, the agent follows these requirements.

**Revocation**

Organization owners can revoke the agent's access at any time by removing repository permissions from the Kiro Agent GitHub app, which immediately blocks access for all users. Individual users can disconnect their GitHub account from Kiro at any time, which stops their agent from accessing any repositories.