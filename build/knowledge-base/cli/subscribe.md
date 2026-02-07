---
title: "Subscribing your team to Kiro - CLI - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/cli/enterprise/subscribe/"
category: "cli"
lastUpdated: "2026-02-07T05:52:29.512Z"
---
# Subscribing your team to Kiro

---

## Prerequisites

Before you begin, make sure you have the following:

- An AWS account - You can create an AWS account if you do not have one already.
- AWS permissions - As a Kiro admin, you must have the permissions to access the Kiro console in AWS in order to subscribe and manage Kiro users. The minimum permissions you'll need are described in Policy: Allow administrators to configure Kiro and subscribe users.
- AWS IAM Identity Center - You must have an instance of IAM Identity Center set up in your AWS account, with the identities of the users you want to subscribe to Kiro. Your IAM Identity Center instance must be in a supported AWS Region.
- Users and groups - You can add users and groups to IAM Identity Center's built-in directory, or to an external identity provider (IdP) that is connected to IAM Identity Center. For more information, see Getting started with IAM Identity Center.

## Create the Kiro profile

1. Sign in to the AWS Management Console.
2. Switch to the Kiro console.
3. Make sure you are in your preferred supported AWS Region to create the Kiro profile and store user data.
4. Choose the Sign up for Kiro button.
5. Review the contents of the Create Kiro profile dialog box then choose Enable. The Kiro profile is created.
6. (Optional) Edit the profile with a different name or description as needed in the Settings page.

## Subscribe your team to Kiro

1. Switch to the Kiro console if you're not there yet.
2. Make sure you're in the AWS Region where you created the Kiro profile.
3. In the Users & Groups page, choose the Users or Groups tab.
4. Choose the Add user or Add group button. A dialog box appears where you can select the Kiro subscription tier (Pro, Pro+, Power) with details about each tier.
5. Choose the desired subscription tier and choose Continue.
6. In the search bar, search for a group or a user you want to subscribe to the selected tier, or select one from the drop down.
7. The group or user will auto-populate with what is available in the IAM Identity Center.
8. Select them and choose Assign. Users or groups are now subscribed.