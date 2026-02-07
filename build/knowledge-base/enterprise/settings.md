---
title: "Settings - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/enterprise/settings/"
category: "enterprise"
lastUpdated: "2026-02-07T05:52:16.078Z"
---
# Settings

---

An administrator can control the following settings in a [Kiro profile](../concepts/#kiro-profile).

| Setting | Description |
| --- | --- |
| Encryption key | By default, Kiro uses an AWS managed key to encrypt your data at rest. For some features, instead of using an AWS managed key, you can use your own key. This is known as a customer-managed key. To specify a customer-managed key, enable Encryption key and use the available UI to specify a new or existing key. For details about which features' data can be encrypted with a customer managed key, see Encryption at rest. |
| Include suggestions with code references | Kiro learns, in part, from open-source projects. Sometimes, Kiro suggests code that is similar to publicly available code. When you enable Include suggestions with code references, Kiro will include information about the source used to generate a suggestion. |
| Kiro usage dashboard | Enable Kiro usage dashboard to display a dashboard on the Kiro console's main page. For more information about the dashboard, see Viewing Kiro usage on the dashboard. |
| Kiro user activity report | Enable Kiro user activity report to allow Kiro to collect user activity telemetry of individual Kiro subscribers in your organization and present that information in a report. For more information, see Viewing per-user activity. |
| Prompt logging | Enable Logging to allow Kiro to record all inline suggestions and chat conversations that users have in the Kiro IDE. For more information, see Logging users' prompts. |
| Member account subscriptions | If you are a management account administrator within an organization managed by AWS Organizations, you can configure Kiro to display Kiro subscriptions from both management and member accounts in a single, unified list on the Subscriptions page of the Amazon Q console (not the Kiro console) while signed in to your management account. This organization-wide visibility eliminates the need to sign in to multiple accounts to track your subscriptions. To have all Kiro subscriptions be displayed in the Amazon Q console, enable the Member account subscriptions setting. This setting is only visible when signed in to the AWS console as a management account administrator. |
| Model Context Protocol (MCP) | Enable the Model Context Protocol (MCP) setting to allow Kiro subscribers to use MCP servers. |
| Web Tools | Enable Web Tools to allow Kiro subscribers to use the web_search and web_fetch tools for searching the web and fetching content from URLs. When disabled, these tools are hidden from users and a notification appears in /tools. |
| Overages | Enable Overages to allow Kiro subscribers to continue working when they exceed their plan limits. For more information see Enabling overages for Kiro users. |

## Web tools

The **Web Tools** setting controls whether users can use the `web_search` and `web_fetch` tools for searching the web and fetching content from URLs.

To disable both the web fetch and web search tools for all Kiro users in your account or organization:

1. Open the Kiro console
2. Choose Settings
3. Under Shared settings, toggle Web search and web fetch tools to Off

When web tools are disabled, users see a notification in `/tools` indicating that web access has been disabled by their administrator.