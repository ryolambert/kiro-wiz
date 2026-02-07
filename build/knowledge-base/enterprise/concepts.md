---
title: "Concepts - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/enterprise/concepts/"
category: "enterprise"
lastUpdated: "2026-02-07T05:52:16.782Z"
---
# Concepts

---

## AWS IAM Identity Center

An AWS service that provides a central place to manage user identities of Kiro subscribers.

## AWS region

A physical location around the world where AWS clusters its data centers. There are two AWS Regions relevant to Kiro administrators:

- The Region where your IAM Identity Center instance is enabled. This is where user identities are managed, and where subscriptions are stored.
- The Region where your Kiro profile is created. This is where data is stored, and might be different from your IAM Identity Center instance's Region.

For more information about Regions, see [Supported Regions](../supported-regions).

## Group

A collection of users within IAM Identity Center. When you subscribe a group to Kiro, the users within it are individually subscribed. (There is no concept of a group subscription.)

## Kiro console

A console within the AWS console where you create and manage Kiro subscriptions and control settings. The Kiro console appears as **Kiro** in the drop-down list of AWS services.

## Kiro credits

A unit of consumption that measures usage of Kiro's AI-powered features. Credits are spent when you interact with AI capabilities and are replenished based on your subscription tier.

## Kiro enterprise user

A user that you have added and subscribed to a Kiro subscription tier through the AWS console, capable of accessing Kiro through IAM Identity Center.

## Kiro profile

The management abstraction that defines and enforces administrative settings and subscriptions to enterprise users in a given AWS account and Region. A Kiro profile corresponds to a combination of an AWS account (management or member) and the Region for that account. This implies that you can only have one profile for each AWS account in a given Region. You set up Kiro profiles through the Kiro console.

## Kiro subscription tier

A distinctive pricing plan with a predetermined number of Kiro credits.