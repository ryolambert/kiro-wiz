---
title: "Vibe refactoring is 50% of vibe coding - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/learn-by-playing/04-dry-code-refactor/"
category: "guides"
lastUpdated: "2026-02-07T05:52:10.180Z"
---
# Vibe refactoring is 50% of vibe coding

---

This module assumes you have already launched the game locally, by
following [the setup instructions](../00-setup).

In previous modules we:

- Wrote HTML and CSS to improve the homepage
- Fixed a physics bug in the core of the game's physics engine
- Fixed an interactions bug through an logic refactor

Now it's time to explore a hidden truth about vibe coding. If
at least half of your prompts aren't "vibe refactors" you are probably
messing up.

#### Understand the problem

AI is very good at using example context to implement new solutions.
Unfortunately, this tends to lead to a lot of duplicated code.
In the previous module we started looking at the "E" prompt.
It's time to take an even closer look.

Try a prompt like:

```
Where is the interact prompt implemented in the components?

```

You should see that Kiro locates multiple copies of the
interact prompt:

> The interact prompt is consistently implemented across multiple interactive game objects (Computer, Workbench, Chest, Garbage, GameItem, PullLever, Dispenser)

If you open these files: `Computer.vue`, `Workbench.vue`, `Chest.vue`, etc you will notice that each component has a very similar implementation of the interact prompt with similar CSS.

But then if you move the ghost around the game play area, you will
also notice subtle differences. For example, the size of the pull
lever's interact prompt is slightly different from the size of the workbench interact prompt.

We can improve the code by removing duplication. There's a repeated pattern here - it would be better if we refactored the interact prompt into a single component that could be shared across all these components.

#### Do a refactor

Let's ask Kiro to refactor this. Open a file that contains
an "E" prompt such as "Chest.vue". Then try a prompt like:

```
I want to DRY the "interact-prompt" into a separate component
with standardized styles, reused across my components

```

Loading image...

Kiro uses your currently open files as context. Consider opening relevant files prior to sending a prompt.

#### Verify the results

Kiro should discover all the components that have an "interact-prompt"
element and refactor them to make use of a new shared component instead:

Loading image...

Things to check for:

- The original implementation has interact prompts with different
locations relative to the parent component: above, left, right, etc.
Did that get lost in the refactor?
- There were two different approaches to ensuring that the interact
prompts text stayed at an appropriate size, no matter what the screen
dimension was. Which approach, if any, did the AI model choose?

Trust, but also verify. While AI models can do a fantastic job
at refactoring, its always necessary to double check generated
code to ensure that functionality did not degrade during that
refactor.

#### Find more to do

Try asking Kiro:

```
Look through my components. Do you see any things that should
be refactored or opportunities to implement best practices?

```

AI models are trained via reinforcement learning to
be friendly and compliant. Therefore a model will rarely,
if ever, initiate criticism or question what you ask it to do.
Models will do as you ask, even if what you asked was
flawed.

However, you can still use AI as a code reviewer or critic by explicitly asking it to tell you what it sees wrong or in need of improvement.

In this module you have learned two key concepts:

- Vibe coding works, but just like regular coding, it requires
regular refactors. Do "vibe refactoring" as well.
- AI won't directly contradict you or push back on your
asks, but that doesn't it isn't capable of seeing the
mistakes. You just need to ask it to double check the work.

Let's move on to the next task:

[Using specification for complex work](../05-using-specs-for-complex-work)