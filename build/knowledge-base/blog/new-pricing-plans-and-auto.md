---
title: "Announcing new pricing plans and Auto, our new agent"
sourceUrl: "https://kiro.dev/blog/new-pricing-plans-and-auto/"
category: "blog"
lastUpdated: "2026-02-07T05:52:42.771Z"
---
*Starting October 1st, you will be charged for the plan you’ve selected. The list of countries and regions in this post is out of date and no longer maintained. Please *[see our FAQs](https://kiro.dev/faq/#what-countries-or-regions-are-supported-for-individual-plans)* for the latest list.*

---

Over the past month, you have provided us with great feedback on Kiro. Based on your feedback and looking at usage patterns to understand how you’re using Kiro in your day-to-day development work, we are announcing a new and revamped pricing for Kiro.

- Unified Limits: Instead of separate limits for vibe and spec tasks, all requests will now draw from a single credit pool, giving you flexibility and control in how you use Kiro. The new unified limits are as follows:

| Free | Pro | Pro+ | Power |
| --- | --- | --- | --- |
| $0 | $20 / mo | $40 / mo | $200 / mo |
| 50 credits | 1,000 credits | 2,000 credits | 10,000 credits |
|  | Pay-as-you-go overages ($0.04 / credit) | Pay-as-you-go overages ($0.04 / credit) | Pay-as-you-go overages ($0.04 / credit) |

- Fractional Credit Consumption: Credits will now be charged fractionally, based on the complexity of the prompt. Simple edits and prompts can consume less than 1 credit, and by charging you in 0.01 credit increments, you can maximize your credit usage.
- Free Trial: When you get access to Kiro for the first time, you get 500 bonus credits usable within 14 days; more in the FAQs.

Tasks consume credits at different rates based on complexity. See FAQs below for more on how credits work. We have also improved the visibility of credit consumption in the monthly usage dashboard. In the coming weeks, Kiro will also display how many credits it consumed in the notification bar, so you can easily see how you’re tracking against your monthly limits.

## Introducing Auto

One of the key things we learned about how you want to use Kiro is that prompts differ widely in complexity and output requirements. Our goal with Kiro is to give you the best results at the best price. To achieve that, we’ve built Auto, an agent that uses a mix of different frontier models such as Sonnet 4 combined with specialized models, and optimization techniques such as intent detection, caching, and more.

Auto will always be optimized for performance, efficiency, and output quality. For example, a given task that consumes X credits to execute in Auto, will cost you 1.3X credits to execute via Sonnet 4. This combination of cost-effectiveness and Sonnet 4-level quality is why we have made Auto the default option in the chat window. You can still choose to run your prompts exclusively through Sonnet 4, and if you do, the stated plan limits above won’t get you as far.* *The current version of Auto is just the start. We are excited about some of the innovations we’re working on for Auto, such as using neuro-symbolic AI (which combines neural networks with formal reasoning) to help produce better quality output for tasks such as writing and refining your requirements and validating the implementation. We think you will appreciate how well the Auto handles your everyday requests in a more performant and cost-effective manner.

## Pricing roll-out

Between now and October 1st, we will gradually roll out updated plans with single pool of credits and new limits to paid users. Once migrated, you will notice your limits reset to the new monthly plan limits. Kiro continues to be free through September 30th. Starting on October 1st, you will be charged for the plan you’re on. For more details, see FAQs below.

We hope these pricing changes will make a difference in how you can use Kiro as your main development environment. We look forward to seeing what you build — and please keep the feedback coming by [joining our Discord](https://discord.gg/kirodotdev).

## FAQs

##### How does Kiro pricing work?

Kiro offers flexible pricing tiers designed around how developers use Kiro. New users can start with the perpetual **Kiro Free** tier, which includes 50 credits. You can upgrade to paid tiers ranging from Pro ($20/month), Pro+ ($40/month), to Power ($200/month) for increased capacity. Paid tiers include flexible overages available at $0.04 per additional credit. Kiro prices shown do not include applicable taxes or duties (such as VAT or sales tax) unless explicitly noted. Note that if you have a Japanese billing address, Japanese Consumption Tax will apply to your Kiro usage. The amount of tax collected depends on many factors, including, but not limited to, your Tax Registration Number (“TRN” or Tax ID), and billing address.

##### What is a credit?

A credit is a unit of work in response to user prompts. Simple prompts can consume less than 1 credit. More complex prompts, such as executing a spec task, typically cost more than 1 credit. Additionally, different models consume credits at different rates, with a prompt executed via Sonnet 4 costing more credits than executing it with Auto. For example, a given task that consumes X credits to execute in Auto, will cost you 1.3X credits to execute via Sonnet 4. Credits are metered to the second decimal point, so the least number of credits a task can consume is 0.01 credits.

##### What can I use credits for?

Any prompt you ask Kiro to execute, whether in vibe mode or spec mode, as well as spec refinement, task execution, and agent hook execution, will consume credits.

##### How can I track my credit usage?

You can see the monthly credit limits for your plan, the number of credits used, and credits remaining in your subscription dashboard accessible in the Kiro IDE. Credit usage is updated at least every 5 minutes.

##### Can I pay for additional credits?

Yes, on paid plans, you can enable overage to continue using Kiro past your monthly limits. Additional credits are $0.04 each, billed at month-end based on actual over-cap usage. For example, if you're on the Pro tier and use 1,100 credits (100 over your limit), you'll be charged an additional $4 on your next bill. Overage is disabled by default and must be enabled in Settings before it applies. Once you turn overages on, and for as long as you remain on a paid plan, overages stay on. Once you downgrade to the **Kiro Free** tier, overages will be disabled, and you need to turn them back on when you are back on a paid plan.

##### How is pricing being rolled out?

Between now and October 1st, we will gradually roll out updated plans with single pool of credits and new limits to paid users. Once migrated, you will notice your limits reset to the new monthly plan limits. Kiro continues to be free through September 30th. Starting on October 1st, you will be charged for the plan you’re on.

If you are on a paid plan, you can also turn on overages. Overages are also free until September 30th.** **Until, October 1st, overages are capped at 1,000 credits and will be reimbursed by October 1st.

If you are a new user subscribing to Kiro between now and October 1st, you will be refunded for your use by October 1st and can use your monthly limits fully. For example, if you purchased a Pro+ plan on September 20th, you could use all 2,000 monthly credits for free by September 30th.

##### How does the free trial work?

Starting on October 1st, if you get access to Kiro for the first time (off the waitlist), you will receive 500 bonus credits usable within 14 days, whatever plan you sign up for, including Kiro Free.

##### Can I share my Kiro subscription with my team?

No, subscriptions and usage limits are calculated per individual user. For team usage, each developer needs their own subscription. Team billing and management features are coming soon.

##### What happens if I don’t use all my monthly limit?

Usage limits reset at the start of each billing month. Unused credits do not roll over to the next month.

##### What models does Kiro use under the hood?

By default, your prompts are processed by Auto an agent that uses a mix of different frontier models such as Sonnet 4 combined with specialized models that are experts in specific tasks, intent detection, caching, and other techniques to give you a better balance of quality, latency, and costs. You can also choose to have your prompts processed exclusively by Sonnet 4.

##### What payment methods do you accept?

We accept all major credit cards.

##### Which countries or regions are supported for the paid plans?

Currently, you can purchase a Kiro paid plan with a billing address in Argentina, Australia, Austria, Bangladesh, Belgium, Brazil, Bulgaria, Canada, Chile, China, Colombia, Czech Republic, France, Germany, Hong Kong SAR, India, Indonesia, Israel, Italy, Japan, Malaysia, Mexico, Morocco, Nepal, Netherlands, New Zealand, Norway, Philippines, Poland, Portugal, Romania, Singapore, South Africa, South Korea, Spain, Sweden, Switzerland, Thailand, United Arab Emirates, United Kingdom, and the United States of America. More countries or regions will be added soon.