---
title: "Data protection - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/data-protection/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:37.625Z"
---
# Data protection

---

## Shared responsibility model

The AWS [shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) applies to data protection in Kiro autonomous agent. As described in this model, AWS is responsible for protecting the global infrastructure that runs all of the AWS Cloud. You are responsible for maintaining control over your content that is hosted on this infrastructure. You are also responsible for the security configuration and management tasks for the AWS services that you use. For more information about data privacy, see the [Data Privacy FAQ](https://aws.amazon.com/compliance/data-privacy-faq/).

## Data storage

Kiro autonomous agent stores your task descriptions, chat messages, code changes, and additional context to execute tasks and generate responses. For information about how data is encrypted, see [Data encryption](#data-encryption).

### AWS regions where content is stored and processed

During the preview, all Kiro autonomous agent content, such as task descriptions, chat messages, and code changes, is stored in the US East (N. Virginia) Region.

With cross-region inferencing, your content may be processed in a different Region within the United States. For more information, see [Cross-region processing](#cross-region-processing).

## Cross-region processing

Kiro autonomous agent uses cross-region inference to distribute traffic across different AWS Regions to enhance large language model (LLM) inference performance and reliability. With cross-region inference, you get increased throughput and resilience during high demand periods, as well as improved performance.

Cross-region inference doesn't affect where your data is stored. All data remains stored in the US East (N. Virginia) Region during the preview.

### Supported regions for Kiro autonomous agent cross-region inference

| Supported geography | Inference regions |
| --- | --- |
| United States | US East (N. Virginia) (us-east-1)US West (Oregon) (us-west-2)US East (Ohio) (us-east-2) |

## Data encryption

This topic provides information specific to Kiro autonomous agent about encryption in transit and encryption at rest.

### Encryption in transit

All communication between customers and Kiro autonomous agent and between Kiro autonomous agent and its downstream dependencies is protected using TLS 1.2 or higher connections.

### Encryption at rest

Kiro autonomous agent encrypts your data using AWS owned encryption keys from AWS Key Management Service (AWS KMS). You don't have to take any action to protect the AWS managed keys that encrypt your data. For more information, see [AWS owned keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#aws-owned-cmk) in the *AWS Key Management Service Developer Guide*.

## Service improvement

To help Kiro provide the most relevant information, we may use certain content from Kiro autonomous agent, such as task descriptions, chat messages, other inputs you provide, and the responses and code that Kiro generates, for service improvement. This page explains what content we use and how to opt out.

### Kiro autonomous agent content used for service improvement

We may use certain content from Kiro autonomous agent for service improvement. Content that Kiro may use for service improvement includes, for example, your task descriptions, chat messages, other inputs you provide, and the responses and code that Kiro generates. Kiro may use this content, for example, to provide better responses to common questions, fix Kiro operational issues, for de-bugging, or for model training.

## Opt out of data sharing

By default, Kiro autonomous agent collects content for service improvement. This section explains how to opt out of sharing your data.

### Opting out of sharing content in Kiro autonomous agent

To opt out of sharing your client-side telemetry and content in Kiro autonomous agent:

1. Go to app.kiro.dev/agent/settings
2. Navigate to the Data collection section
3. Toggle off Allow AWS to use your Kiro autonomous agent content for service improvement