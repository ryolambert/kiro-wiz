---
title: "Viewing Kiro usage on the dashboard - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/enterprise/monitor-and-track/dashboard/"
category: "enterprise"
lastUpdated: "2026-02-07T05:52:15.298Z"
---
# Viewing Kiro usage on the dashboard

---

Available only for Kiro admins, the Kiro dashboard summarizes useful data about how your subscribers use the Kiro IDE and Kiro CLI.

Kiro generates and displays new metrics on an hourly basis for the most part. The only section that is not updated hourly is the **Active users** widget, which is updated daily according to the coordinated universal time (UTC) clock.

## View the dashboard

1. Sign in to the AWS Management Console.
2. Switch to the Kiro console.
3. From the navigation pane, choose Dashboard.
4. (Optional) Filter the information by date range or programming language.

- If the Dashboard link is not available in the navigation pane, see Troubleshoot the dashboard.
- If you'd like to send user metrics to a daily report with a per-user breakdown of their Kiro usage, see View per-user activity in Kiro.
- For information about specific metrics, see Dashboard metrics or choose the help link at the top-right of the dashboard page.

## Disable the dashboard

You might want to disable the Kiro dashboard if you have concerns about data privacy, page load times, or other potential issues. When you disable the dashboard, the dashboard page (and any links to it) will no longer be available in the Kiro console.

For more information about the dashboard, see [viewing usage metrics (dashboard)](/docs/enterprise/monitor-and-track/dashboard/#dashboard-metrics).

#### To disable the dashboard

1. Sign in to the AWS Management Console.
2. Switch to the Kiro console.
3. Choose Settings, and in the Kiro Settings section, disable Kiro usage dashboard.

## Troubleshoot the dashboard

If the Kiro dashboard page is not available, do the following:

- Verify your permissions. To view the dashboard, you need the following permissions:

For more information about permissions, see Policy: Allow administrators to configure Kiro and subscribe users.
  - q:ListDashboardMetrics
  - codewhisperer:ListProfiles
  - sso:ListInstances
  - user-subscriptions:ListUserSubscriptions
- Verify your settings. In the Kiro console, choose Settings and make sure that the Kiro usage dashboard toggle is enabled.

## Dashboard metrics

The following table describes the metrics shown in the Kiro dashboard.

| Metric name | Description |
| --- | --- |
| Total subscriptions per tier | Shows the total subscriptions broken down by subscription tier (Pro, Pro+, Power). Displays both per-group breakdown and total counts across all groups in the current AWS account, as well as subscriptions in member accounts if you're signed in to a management account for which organization-wide visibility of subscriptions has been enabled. |
| Active subscriptions per tier | Shows the total active subscriptions broken down by subscription tier (Pro, Pro+, Power).Active subscriptions are those belonging to users who have started using Kiro in their integrated development environment (IDE) or CLI. You are being charged for these subscriptions. For more information about active subscriptions, see Subscription statuses. |
| Pending subscriptions per tier | Shows the total pending subscriptions broken down by subscription tier (Pro, Pro+, Power).Pending subscriptions are those belonging to users who have not yet started using Kiro. You are not being charged for these subscriptions. For more information about pending subscriptions, see Subscription statuses. |
| Active users | Shows the number of unique users actively utilizing Kiro on a daily, weekly, and monthly basis. Includes breakdowns by:- Client type (IDE vs. CLI)- Subscription tier (Pro, Pro+, Power) |
| Credits consumed | Shows total Kiro credits consumed with time-based views (daily, weekly, monthly). Includes breakdowns by:- Subscription tier (Pro, Pro+, Power)- Client type (IDE vs. CLI) |