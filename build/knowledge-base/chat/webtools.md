---
title: "Web tools - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/chat/webtools/"
category: "chat"
lastUpdated: "2026-02-07T05:52:03.881Z"
---
# Web tools

---

Web access capabilities enable Kiro agent to access current information from the internet in real-time. This feature enables you to get up-to-date answers about topics that may have changed since the model's training data was created. These tools have been designed to not reproduce meaningful chunks of text and it should not be able to access webpages behind paywalls, authentication, and similar access restrictions. Search results may vary over time as internet content changes. Some content may not be accessible through web search due to various restrictions or the nature of the content.

| Tool | Description |
| --- | --- |
| web_search | Tool for searching the web |
| web_fetch | Tool for fetching content from a URL |

You are responsible for your use of output that incorporates web search or grounded information. You will know when your output includes grounded information from citations or links to the source material. You must retain and display these citations and links in the output if you display the grounded output to a downstream user. If you don't want Kiro to use these tools, create a custom agent that [excludes](/docs/cli/custom-agents/configuration-reference/#tools-field) these tools. Citations are provided for output that incorporates web search or grounded information. You can follow a provided citation to the source page.

In the following demo, the agent automatically uses the `web_search` tool to search the web and return up-to-date results for a query, instead of relying on possibly outdated information in the model's training data. It then uses the `web_fetch` tool to retrieve the latest contents at a specific URL.

### Limitations

- Size: 10MB maximum per page fetch
- Timeout: 30 seconds per request
- Redirects: Maximum 10 redirects followed
- Content type: Only text/html pages supported
- Retries: 3 automatic retry attempts on failure

### Governance

Pro-tier customers using IAM Identity Center as the sign-in method can control web tools access for users within their organization. Web tools are enabled in Kiro by default; however, administrators can disable them from the AWS console.

This restriction is enforced on the client side. Be aware that your end users could circumvent it.

## Disabling web tools for your organization

To disable both the web fetch and web search tools for all Kiro IDE users in your account or organization:

1. Open the Kiro console
2. Choose Settings
3. Under Shared settings, toggle Web search and web fetch tools to Off