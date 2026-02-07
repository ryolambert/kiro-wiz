---
title: "Authentication methods - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/authentication/"
category: "cli"
lastUpdated: "2026-02-07T05:52:19.052Z"
---
# Authentication methods

---

Kiro supports the following authentication providers:

- GitHub: Seamless integration with your GitHub account
- Google: Sign in with your Google credentials
- AWS Builder ID: Quick setup for individual developers
- AWS IAM Identity Center: Enterprise-grade authentication

Users that have a paid Kiro subscription and access it through a social login provider (like GitHub or Google) or through AWS Builder ID are considered *individual subscribers*. We may use certain content from Kiro Free Tier and Kiro individual subscribers for service improvement. For more information on service improvement and how to opt out, see [Service improvement](/docs/privacy-and-security/data-protection/#service-improvement).

## Sign in to Kiro CLI

1. At the command line, enter kiro-cli or kiro-cli login. You'll be prompted to press Enter to complete sign-in in your browser.
2. In your browser, choose the organization or system through which you will authenticate:
  - Google
  - GitHub
  - Builder ID
  - Your organization
3. After you authenticate, you'll receive a message in your browser, directing you back to your terminal.
4. When you return to your terminal, you should be signed in with the Kiro CLI.

## Sign in from a remote machine

When running Kiro CLI on a remote machine (via SSH, SSM, containers, etc.), authentication works differently since the remote machine cannot open a browser.

For Builder ID and IAM Identity Center, Kiro CLI uses device code authentication. You'll see a URL and code to enter in your local browser—no additional setup required.

For social login (Google or GitHub), the CLI uses PKCE authentication which requires port forwarding. The OAuth callback redirects to `localhost`, which won't reach the remote CLI without a tunnel.

**To sign in with social login on a remote machine:**

1. Run kiro-cli login and select "Use for Free with Google or GitHub"
2. Note the port number displayed (it varies each time, e.g., 49153)
3. In a new terminal on your local machine, set up port forwarding:
bashssh -L <PORT>:localhost:<PORT> -N user@remote-host

Replace <PORT> with the port from step 2, and user@remote-host with your remote credentials.
4. Press Enter in the CLI, then open the URL in your local browser
5. Complete authentication—the callback reaches the CLI through the tunnel

**SSH port forwarding examples:**

```bash
# Basic port forwarding (replace 49153 with your actual port)
ssh -L 49153:localhost:49153 -N user@remote-host

# With a custom identity file (common for EC2)
ssh -i ~/.ssh/my-key.pem -L 49153:localhost:49153 -N user@remote-host

# Using an SSH config alias
ssh -L 49153:localhost:49153 -N myserver

```

**Troubleshooting port forwarding:**

- Authentication timed out: Port forwarding isn't active or using the wrong port. Verify the port matches what the CLI displayed.
- Failed to bind callback port: The port is in use on the remote machine. Run lsof -i :<PORT> on the remote to identify the process.
- Address already in use when starting SSH: The port is in use locally. Close other tunnels or stale SSH sessions.
- Tunnel disconnects mid-auth: Keep the SSH terminal open until authentication completes. Add -o ServerAliveInterval=60 to prevent timeouts.

## Sign out of Kiro CLI

**To sign out of Kiro CLI**

1. At the command line, enter kiro-cli logout.

## Troubleshooting authentication issues

If you encounter problems during the authentication process, such as browser redirect failures or sign-in errors, check our [troubleshooting guide](/docs/troubleshooting/#authentication-issues) for platform-specific solutions and common fixes.

## Next steps

- Review FAQ
- Explore Chat features
- Get started with Kiro CLI