---
title: "Understanding Kiro's pricing: specs, vibes, and usage tracking"
sourceUrl: "https://kiro.dev/blog/understanding-kiro-pricing-specs-vibes-usage-tracking/"
category: "blog"
lastUpdated: "2026-02-07T05:52:43.730Z"
---
*Note as of August 15: In Spec mode, save your credits by clicking "Start task" rather than typing in chat. Using chat to direct spec mode uses vibe requests. See updated bullets below.*

*Read our *[latest blog post](/blog/free-until-september-15/)* on billing and pricing.*

---

Since announcing Kiro’s [new pricing tiers last week](/blog/pricing-waitlist-updates/), we've received a number of questions about the proposed pricing model. Three key questions emerged:

1. What constitutes a 'spec request' versus a 'vibe request'? Users want clearer definitions and examples.
2. How can I track my usage? Without usage tracking in the current editor, users are unsure if our plans meet their needs.
3. What happens when I exceed my tier limits? If I'm on Pro+ ($40) and need more capacity, do I have to jump to Power ($200)?

This blog post will answer all three questions and provide the added clarity you've been asking for.

## What constitutes a 'spec request' versus a 'vibe request'?

Many users have asked us why we're separating spec and vibe requests, and what exactly these requests mean in terms of usage. We chose the spec versus vibe model to mirror real-world usage patterns of Kiro and give you a predictable way to understand your costs. Let’s unpack what these requests are.

**Spec Requests **are when you execute tasks within Kiro's structured development workflow. Here's how it works: you start with vibe requests to create your requirements and design documents. After those have been generated, Kiro presents a list of tasks to start building the project. Each one of those tasks is roughly equivalent to a single spec request, although it can vary depending on complexity.

Here are some scenarios, *assuming a spec task has average complexity*:

- [Updated] Starting a task directly from your tasks.md file will be 1 spec request
- If you run multiple tasks at once (i.e., "Execute task 1-3), each task executed will be one spec request.
- [Updated] Executing subtasks consumes 1 spec request per subtask plus 1 vibe request for coordination (Task 2 with subtasks 2.1 and 2.2 = 2 spec requests + 1 vibe request)

**Vibe Requests** cover any agentic operation in Kiro that does not involve spec task execution. A vibe request represents one chat interaction with Kiro - typically one user prompt and the corresponding response (though this can increase depending on the complexity of the prompt). We've sized requests so that one vibe request typically equals one message or prompt from you, while one spec request equals executing a single task.

Here are some scenarios, *assuming a vibe request has average complexity*:

- Chatting in Kiro like "explain this code to me" is 1 vibe request
- [Updated] Creating and refining spec or steering documents consumes a minimum of 1 vibe request (may vary based on project context and complexity)
- [Updated] Triggering an agent hook consumes a minimum of 1 vibe request (may vary based on hook complexity and project context)
- Complex vibe prompts e.g. "build me an API that does X," could take multiple vibe requests to complete.

Providing these two dimensions gives you a clearer understanding of your usage compared to estimating interactions or tokens. We've also designed the tiers to encourage Kiro's spec-driven development approach because we think it helps developers move faster and write the right code to solve the right problem.  Research shows that addressing issues during the development phase is [5](https://www.cs.cmu.edu/afs/cs/academic/class/17654-f01/www/refs/BB.pdf) to [7](https://www.researchgate.net/figure/BM-System-Science-Institute-Relative-Cost-of-Fixing-Defects_fig1_255965523) times more costly than resolving them during the planning phase of the software development lifecycle. This principle holds true even with AI agents. When you take time to discuss requirements and design with Kiro during the planning phase, a single spec request will often accomplish what would otherwise require multiple vibe requests during implementation.

## How do I track my Kiro usage?

A second area of feedback was an ask for detailed usage tracking and transparency before committing to paid plans. When our pricing goes live later this month, all users will get usage dashboards that update after each request.

Through your IDE dashboard, as shown below, you'll be able to monitor both your Vibe and Spec request usage, track any overages, and view your remaining allocations for the current billing cycle. This transparency allows you to make informed decisions about your plan selection and optimize your usage patterns. For paid tier subscribers, the dashboard will also provide estimates of any potential overage charges, helping you better manage your costs.

## What happens when I exceed my tier limits?

A third area of feedback has been around how many requests you receive with the Kiro plans, and the gap between the Pro+ ($40) and Power ($200) tiers. Some of you expressed interest in affordable intermediate options that would better align with your usage patterns.

Our solution addresses this through a flexible overage option: if you’re on any of the Kiro paid tiers, you can opt to pay for additional requests at rates of $0.20/Spec request or $0.04/Vibe request. This gives you flexibility between tiers, allowing you to scale your usage without immediately upgrading to a higher plan level.

## Making the Most of Your Kiro Experience

We hope these answers help you better understand how to maximize value from Kiro and find the right option that fits how you work.

Coming soon, we'll publish another blog post that dives into FAQs about how subscriptions will work, plus a video that demonstrates the benefits of spec-driven development from a cost perspective. Join our [Discord](https://discord.com/invite/kirodotdev) to continue the discussion!