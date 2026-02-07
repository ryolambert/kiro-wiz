---
title: "Troubleshooting - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/troubleshooting/"
category: "unknown"
lastUpdated: "2026-02-07T05:52:17.019Z"
---
# Troubleshooting

---

This guide helps you resolve common issues with Kiro, including shell integration and MCP server connection problems.

## Kiro Installation Issues

### macOS: Kiro is damaged and can’t be opened

On macOS, you may encounter this error when trying to open Kiro:

```
Kiro is damaged and can't be opened. You should move it to the Trash.

```

This pop-up is due to a false positive in macOS security features.

To resolve this error:

- Go to System Settings → Privacy & Security and click Allow or Open anyway for Kiro.
- Drag Kiro.app to your desktop, and then drag it from your desktop to the Applications folder.
- Restart your computer.
- Open your terminal and run:
sudo xattr -d com.apple.quarantine /Applications/Kiro.app

## Authentication issues

### Browser redirect failures during authentication

If while authenticating with Kiro you are not redirected to the browser, try these platform-specific solutions:

#### Windows

Run Kiro with logging enabled to identify potential issues:

1. Open Command Prompt as administrator
2. Run the following command (replace with your actual Kiro installation path):
C:\path\to\app.exe --enable-logging
3. Check the logs for any errors
4. If you see access denied errors, ensure your user has administrator permissions to run the app

#### macOS

Use the developer tools to diagnose the issue:

1. Open Kiro
2. Go to Help → Toggle Developer Tools
3. Navigate to the Console tab
4. Observe any errors reported during the sign-in process
5. If the error indicates a missing dependency, ensure it's available in your PATH
  - One common issue is the missing ioreg command
  - Verify ioreg is included in your PATH variable:
bashecho $PATH
which ioreg
  - If ioreg is missing, it's typically located at /usr/sbin/ioreg

### AWS IAM Identity Center issues

#### Q Developer Pro subscription required

If you see an error `There was an error signing you in` when attempting to authenticate with Identity Center, ensure you have a valid Q Developer Pro subscription. You need an active Pro subscription to use Identity Center authentication with Kiro. Here is a [guide on how to view your subscription status and upgrade to Pro](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-admin-setup-subscribe-general.html).

#### Regional limitations for Q Developer profiles

If you're unable to sign in with Identity Center despite having valid credentials, this may be due to regional limitations. Kiro defaults to the US East (N. Virginia) region for Identity Center authentication. If you have a Q Developer profile in a different region, you won't be able to sign in with Identity Center.

As an alternative, use a different login method such as Builder ID or social providers such as Google or GitHub. We're working on addressing this regional limitation in future releases.

#### Session duration and timeouts

Identity Center sessions have a default timeout of 8 hours, which means you'll need to re-authenticate periodically. To extend session duration, administrators can configure longer session timeouts. For detailed configuration instructions, see the [AWS documentation on configuring user session duration](https://docs.aws.amazon.com/singlesignon/latest/userguide/user-session-duration-how-to-configure.html).

## Shell integration issues

Shell integration connects Kiro to your terminal, enabling automatic command execution and result processing. Without it, you'll need to manually copy-paste terminal outputs.

### Quick fix: "shell integration unavailable"

1. Update Kiro: Command Palette (Cmd + Shift + P / Ctrl + Shift + P) → Kiro: Check for Updates
2. Enable Integration: Command Palette (Cmd + Shift + P / Ctrl + Shift + P) → Kiro: Enable Shell Integration
3. Restart: Quit and reopen Kiro

### Manual installation

If automatic setup fails, add to your shell config:

**Zsh** (`~/.zshrc`):

```bash
[[ "$TERM_PROGRAM" == "kiro" ]] && . "$(kiro --locate-shell-integration-path zsh)"

```

**Bash** (`~/.bashrc`):

```bash
[[ "$TERM_PROGRAM" == "kiro" ]] && . "$(kiro --locate-shell-integration-path bash)"

```

**Fish** (`~/.config/fish/config.fish`):

```bash
string match -q "$TERM_PROGRAM" "kiro"
and . (kiro --locate-shell-integration-path fish)

```

**PowerShell** (`$Profile`):

```powershell
if ($env:TERM_PROGRAM -eq "kiro") { . "$(kiro --locate-shell-integration-path pwsh)" }

```

### Kiro Stuck in 'Working...' Status on Terminal Commands or Kiro Does Not See Terminal Output

If Kiro is unable to read terminal output, gets stuck in `Working...` status, or you see strange characters and formatting issues, this is typically caused by shell customizations that interfere with terminal integration. Common culprits include customizations like bash-it on bash or Oh My Posh on zsh, and themes such as Powerlevel10k/9k.

#### Powerlevel10k theme users

If you're using Powerlevel10k theme, add this line to your `.p10k.zsh` file:

```bash
typeset -g POWERLEVEL9K_TERM_SHELL_INTEGRATION=true

```

Alternatively, you can also disable these customizations when running in Kiro.

**zsh** (`~/.zshrc`):

```bash
if [[ "$TERM_PROGRAM" == "kiro" ]]; then
  # Leave empty
else
  # Your themes or customizations
  ZSH_THEME="powerlevel10k/powerlevel10k"
fi

```

#### Fish shell users

If you're using Fish shell and experiencing terminal output issues, you may need to manually add Kiro to the existing shell integration script. The Fish shell integration file is located at:

```
/Applications/Kiro.app/Contents/Resources/app/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration.fish

```

By default, the integration script only checks for "vscode":

```bash
status is-interactive
and string match --quiet "$TERM_PROGRAM" "vscode"
and ! set --query VSCODE_SHELL_INTEGRATION
or exit

```

You need to update it to include "kiro" as well:

```bash
status is-interactive
and string match --quiet "$TERM_PROGRAM" "vscode" "kiro"
and ! set --query VSCODE_SHELL_INTEGRATION
or exit

```

## Windows issues

### Updates disabled due to administrator installation

On Windows if you experience this error:

```
Updates are disabled because you are running the user-scope installation of Kiro as Administrator. This occurs as Kiro does not support system-level installation, which requires administrator privileges.

```

To remove run as administrator, you can:

1. Right-click on the Kiro icon
2. Select Show more options
3. Select Properties
4. Navigate to the Compatibility tab
5. Uncheck the Run this program as an administrator checkbox
6. Select Apply and then OK to save the changes

After completing these steps, Kiro should be able to update normally.

### Unable to run scripts

In PowerShell 7+ set execution policy:

**Check current policy**:

```powershell
Get-ExecutionPolicy

```

**Set execution policy**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

```

### Onedrive path issue

If you use OneDrive on Windows, your desktop path might cause issues:

1. Launch Command Prompt as administrator
2. Create a symbolic link:
mklink /J "C:\Users\<username>\Desktop" "C:\Users\<username>\OneDrive\Desktop"
3. Restart your IDE

## MCP server connection issues

### Common MCP connection problems

If you're having trouble connecting to MCP servers:

1. Check server status:
  - Open the Kiro panel and navigate to the MCP servers tab
  - Check the connection status indicator for your server
2. Verify configuration:
  - Ensure your MCP configuration file has the correct syntax
  - Check that the server command and arguments are correct
3. Check prerequisites:
  - Make sure all required dependencies are installed
  - For AWS Documentation server, verify Python 3.10+ and uv are installed
4. Review logs:
  - Open the Output panel in Kiro
  - Select "Kiro - MCP Logs" from the dropdown
  - Look for specific error messages

### Fixing specific MCP issues

#### AWS documentation server

1. Connection failures:
bash# Verify uv installation
uv --version

# Verify Python version
python --version

# Test server directly
uvx awslabs.aws-documentation-mcp-server@latest --help
2. Search or read failures:
  - Check your internet connection
  - Verify the URL format for documentation pages
  - Try with a simpler search query

#### GitHub MCP server

1. Authentication errors:
  - Verify your personal access token is valid
  - Ensure the token has the required scopes (repo, user)
  - Generate a new token if necessary
2. Rate limiting issues:
  - GitHub API has usage limits
  - Check the rate limit status in the MCP logs
  - Consider using a token with higher rate limits

## Getting help

If you've tried the troubleshooting steps above and still need assistance:

1. Check our FAQ for common questions
2. Join our community Discord for help
3. Submit an issue on GitHub with:
  - Your operating system details
  - Kiro version
  - Steps you've already tried
  - Error messages (if any)