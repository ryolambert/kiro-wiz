---
title: "Monitoring and tracking - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/enterprise/monitor-and-track/"
category: "cli"
lastUpdated: "2026-02-07T05:52:30.141Z"
---
# Monitoring and tracking

Monitoring is an important part of maintaining the reliability, availability, and performance of Kiro and your other AWS solutions. Kiro includes the following features to help you track and record user activity:

- A dashboard shows you aggregate user activity metrics of Kiro subscribers. For more information, see Viewing Kiro usage on the dashboard.
- User activity reports show you what individual users are up to in Kiro. For more information, see Viewing per-user activity.
- Prompt logs provide you with a record of all the prompts that users enter into the Kiro chat in their integrated development environment (IDE). For more information, see Logging users' prompts.

AWS also provides the following tools and features to monitor and record Kiro activity:

- AWS CloudTrail captures API calls and related events made by or on behalf of your AWS account and delivers the log files to an Amazon Simple Storage Service (Amazon S3) bucket that you specify. You can identify which users and accounts called AWS, the source IP address from which the calls were made, and when the calls occurred.
- Amazon CloudWatch monitors your AWS resources and the applications you run on AWS in real time. You can collect and track metrics, create customized dashboards, and set alarms that notify you or take actions when a specified metric reaches a threshold that you specify. For example, you can have CloudWatch track the number of times that Kiro has been invoked on your account, or the number of daily active users.

---