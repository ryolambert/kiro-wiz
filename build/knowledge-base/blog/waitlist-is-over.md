---
title: "The wait(list) is over, get started with Kiro today"
sourceUrl: "https://kiro.dev/blog/waitlist-is-over/"
category: "blog"
lastUpdated: "2026-02-07T05:52:42.342Z"
---
Since our launch 90 days ago, hundreds of thousands of developers have joined our waitlist to try Kiro out. **As of today, the waitlist is gone.** If you’re eager to try out our spec-driven approach to coding with AI, skip the rest of the blog and [sign up now.](/downloads/)

For a limited time only, when you sign up as a new user, you’ll get 500 free bonus credits that you can use within 30 days. For context, that’s [50% of the Kiro Pro plan](/pricing/). For those who are new, [here’s a more in-depth guide](/blog/new-pricing-plans-and-auto/) to how Kiro pricing works, but the tl;dr is:

- A single pool of credits that you can use for both vibe and spec-driven coding. Tasks consume credits at different rates based on complexity.
- Credits are metered in 0.01 increments so you can maximize your credit usage.
- Different models consume credits at different rates, with Auto, our agent, consuming 1X and Claude Sonnet-class models consuming 1.3X credits for the same prompt.

Kiro doesn’t support logging in via AWS IAM Identity Center yet, so if that’s your preference, reach out to your AWS account manager to learn how you can get access.

Over 100,000 developers like you started using Kiro within the first five days after launch, so you’re in good company. Here’s what their experience was like:

As a startup co-founder and CTO, time is the most important resource. Kiro justifies the use of my time for developing our business critical assets in-house.

Rolf Koski

CTO & Co-Founder

In my role designing AWS Cloud and AI solutions with Terraform and Python, spec-driven development with Kiro has brought code relevancy and quality to a whole new level. We've accelerated feature development dramatically, reducing time to customer value from weeks to days. We are excited to welcome Kiro as our newest team member.

Håkon Eriksen Drange

Principal Cloud Architect

Kiro is a strong ally for startups. It naturally turns overlooked docs and specs into robust assets, making growth smoother and future scaling more effective.

Kento Ikeda

Founder & Engineer

I use Kiro for everything - drafting new Terraform modules, tweaking container setups, even writing down random AI ideas at 2 am. But more than anything, it supports how I learn. I'm endlessly curious, and Kiro helps me stay in that learning loop—tinkering, breaking things, fixing them, and then allowing me to share what I learn back with the community.

Adit Modi

Solution Architect

I've been blown away by Kiro's capabilities. The agentic experience is really transformative. From the multimodal inputs that understand context to the complete lifecycle control within the IDE, it feels like I'm working with a senior developer.

Most tools are great at generating code, but Kiro gives structure to the chaos before you write a single line.

In roughly two days, I built a secure file sharing application from scratch. By simply sharing my requirements with Kiro, I was able to create a fully secure application that incorporates encryption and various security coding practices—no additional prompts needed.

I often forget to add unit tests, or update documentation when pushing changes, but with Kiro I can create a hook and it will automatically run those tasks in the background for me, never having to think twice.

Darya Petrashka

Senior Data Scientist

As a startup co-founder and CTO, time is the most important resource. Kiro justifies the use of my time for developing our business critical assets in-house.

Rolf Koski

CTO & Co-Founder

In my role designing AWS Cloud and AI solutions with Terraform and Python, spec-driven development with Kiro has brought code relevancy and quality to a whole new level. We've accelerated feature development dramatically, reducing time to customer value from weeks to days. We are excited to welcome Kiro as our newest team member.

Håkon Eriksen Drange

Principal Cloud Architect

Kiro is a strong ally for startups. It naturally turns overlooked docs and specs into robust assets, making growth smoother and future scaling more effective.

Kento Ikeda

Founder & Engineer

I use Kiro for everything - drafting new Terraform modules, tweaking container setups, even writing down random AI ideas at 2 am. But more than anything, it supports how I learn. I'm endlessly curious, and Kiro helps me stay in that learning loop—tinkering, breaking things, fixing them, and then allowing me to share what I learn back with the community.

Adit Modi

Solution Architect

I've been blown away by Kiro's capabilities. The agentic experience is really transformative. From the multimodal inputs that understand context to the complete lifecycle control within the IDE, it feels like I'm working with a senior developer.

Most tools are great at generating code, but Kiro gives structure to the chaos before you write a single line.

In roughly two days, I built a secure file sharing application from scratch. By simply sharing my requirements with Kiro, I was able to create a fully secure application that incorporates encryption and various security coding practices—no additional prompts needed.

I often forget to add unit tests, or update documentation when pushing changes, but with Kiro I can create a hook and it will automatically run those tasks in the background for me, never having to think twice.

Darya Petrashka

Senior Data Scientist

As a startup co-founder and CTO, time is the most important resource. Kiro justifies the use of my time for developing our business critical assets in-house.

Rolf Koski

CTO & Co-Founder

In my role designing AWS Cloud and AI solutions with Terraform and Python, spec-driven development with Kiro has brought code relevancy and quality to a whole new level. We've accelerated feature development dramatically, reducing time to customer value from weeks to days. We are excited to welcome Kiro as our newest team member.

Håkon Eriksen Drange

Principal Cloud Architect

Kiro is a strong ally for startups. It naturally turns overlooked docs and specs into robust assets, making growth smoother and future scaling more effective.

Kento Ikeda

Founder & Engineer

I use Kiro for everything - drafting new Terraform modules, tweaking container setups, even writing down random AI ideas at 2 am. But more than anything, it supports how I learn. I'm endlessly curious, and Kiro helps me stay in that learning loop—tinkering, breaking things, fixing them, and then allowing me to share what I learn back with the community.

Adit Modi

Solution Architect

I've been blown away by Kiro's capabilities. The agentic experience is really transformative. From the multimodal inputs that understand context to the complete lifecycle control within the IDE, it feels like I'm working with a senior developer.

Most tools are great at generating code, but Kiro gives structure to the chaos before you write a single line.

In roughly two days, I built a secure file sharing application from scratch. By simply sharing my requirements with Kiro, I was able to create a fully secure application that incorporates encryption and various security coding practices—no additional prompts needed.

I often forget to add unit tests, or update documentation when pushing changes, but with Kiro I can create a hook and it will automatically run those tasks in the background for me, never having to think twice.

Darya Petrashka

Senior Data Scientist

## 0.4.0 features, improvements, and fixes

During the past 90 days, we’ve been hard at work revamping our pricing model, building new specs and agent functionality, adding Claude Sonnet 4.5 support, unveiling our new agent Auto, and making many UX quality-of-life improvements.

Today, we are also releasing version 0.4.0 of the IDE, featuring useful improvements to specs, credit consumption visibility, better support for dev servers and trusted commands. In short:

- Spec MVP tasks: During spec creation, you can now mark tasks (including unit tests) as optional to prioritize core features while keeping comprehensive task lists handy.
- Per prompt credit consumption insights: You can now see how many credits each prompt consumed, right in the chat panel.
- Dev server integration: Kiro can now intelligently read the dev server output to catch more compile and runtime issues.
- Reference specs as context: bring existing specs as added context to your prompts
- Additional improvements for trusted commands, bug fixes and more - see the changelog for the full list of goodies shipping with 0.4.0

As always, we’re excited to hear your feedback [on our Discord](https://discord.gg/kirodotdev). Thank you for supporting us on this journey to reimagine how software gets built with AI. We can’t wait to see what you build.

[Download Kiro](/downloads/) now to get started!