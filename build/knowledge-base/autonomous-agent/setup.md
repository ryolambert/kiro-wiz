---
title: "Setup - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/setup/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:35.332Z"
---
# Setup

---

Get started with Kiro autonomous agent (Preview) by connecting your GitHub account and configuring access to your repositories.

1. Go to the web app
Navigate to app.kiro.dev/agent to access Kiro autonomous agent.
2. Log in with your Kiro account
Sign in using your existing Kiro account.
3. Link your GitHub account
Connect your GitHub account to give the agent access to your repositories:

You must have write permissions on repositories for the agent to create branches and open pull requests.
  - Click "Connect GitHub" in Settings
  - Authorize the Kiro Agent GitHub app
  - Select which repositories the agent can access

**How repository access works:** Kiro autonomous agent shows all repositories where both conditions are met:

1. Your GitHub user has access to the repository
2. The Kiro Agent GitHub app has been installed and authorized for that repository

This means you'll see repositories from personal accounts, shared repositories, and organizations—as long as both your GitHub user and the Kiro Agent app have access.

See the [GitHub integration guide](/docs/autonomous-agent/github) for detailed setup instructions.

## Next steps

Once you've connected your GitHub account, you're ready to [create your first task](/docs/autonomous-agent/using-the-agent#your-first-task).