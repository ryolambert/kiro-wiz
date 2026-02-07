---
title: "Important Kiro pricing updates"
sourceUrl: "https://kiro.dev/blog/important-pricing-updates/"
category: "blog"
lastUpdated: "2026-02-07T05:52:43.154Z"
---
*Read our *[latest blog post](/blog/free-until-september-15/)* on billing and pricing.*

---

We wanted to provide an update on our pricing.

## We fixed a metering bug causing requests to be miscounted

First, we have heard many of you were surprised by how quickly you were using included requests. We were surprised as well! We discovered that we introduced a bug when we rolled out pricing in Kiro where some tasks were inaccurately consuming multiple requests. We’ve deployed the fix for the metering issue that was causing the unexpected usage spikes many of you experienced.

## We have reset your limits for August

We’ve also heard concerns that the current limits do not give you enough room to get meaningful work done. We believe that much of this was coming from the metering issue which was causing users to deplete their limits faster than intended. As such, we’ve also reset your limits included in your plan. We want to understand how you’re using Kiro and how our current plans are working for you.

We’re keeping a close eye on the system. If any new bugs surface, we’ll continue to make adjustments and reset limits as needed.

## We are refunding you for charges incurred in August

Considering the confusion caused by the bug, we have decided to not charge for the month of August. Refunds will be rolling out starting Monday, August 25th. Below are FAQs on refunds, limits, and free usage during August. If you have additional questions, please [join the conversation on our Discord](https://discord.gg/kirodotdev).

## Thank you for your support and feedback

We know the last few days haven’t been smooth, and we don’t take that lightly. Our top priority is to get this right — not just the pricing, but building Kiro into something you can rely on to do real, meaningful work. Thanks for sticking with us and continuing to share your feedback. Please let us know what you think as you try things out.

## FAQs

##### When and how will customers be refunded?

Refunds for the subscription fee will be rolling out starting Monday, August 25th.

##### Are you refunding overages too?

If you have already incurred overages, we will refund those as well.

##### How and when will the usage be reset for customers?

Usage limits for both free and paid plans have been reset. Free plan users are reset to 100 vibe requests and 100 spec requests. Paid plan users are reset to the prorated limits of the plan they purchased.

##### If I purchase a subscription today is it free until September 1?

If you purchase a subscription before August 31st, you can use it for free until August 31st, and we'll refund the subscription price by the end of the month.

##### How does the ‘free August’ work?

If you’re already on a paid plan, your limits have been reset, and you can continue to use Kiro for free within the prorated limits until August 31st.

If you are purchasing a paid plan between now and August 31st, you will need to provide a valid credit card, which will be charged the price of the plan you purchased, plus applicable taxes and fees. We will then refund you by August 31st, within a few days of your purchase. You can use Kiro within the prorated plan limits you upgraded to (e.g. prorated number of 450 vibe requests and 250 spec requests for Pro+) for free. Unused requests will not roll over to the following months.

##### Can I enable overages for free during August?

Yes, you can turn on overages. [Overages](/docs/billing/overages/) are temporarily capped to 1,000 vibe requests and 200 spec requests. If your credit card gets charged for overages, we will refund it at the end of August.

##### As a paying customer who has already been charged for use of Kiro, can I opt to use my existing August payment as pre-payment for September, so that I don’t lose money on foreign exchange fees?

This is not possible currently. You will be refunded for August.

##### What are some known metering issues that still exist?

Here are some known billing discrepancies that we are aware of and are actively addressing. To unblock you faster, we have reset the limits now, but as we address these cases in the coming days, we will ensure that these miscounted requests are credited back to your request pool. We will update you as we make these changes.

1. If you type “Execute task X” in the chat window vs. actually clicking ‘Start task’ in the tasks.md file, you will be charged an extra vibe request in addition to a spec request.
2. For tasks with sub-tasks (e.g. Task 2 with 2.1 and 2.2 as subtasks), if you click on the parent task (e.g. Task 2), you get charged an extra vibe and an extra spec request. For now, you can click on the sub-tasks instead as a workaround.
3. If the agent has successive tool call failures (either its own tools or MCP tools), you will get billed for extra vibe requests.