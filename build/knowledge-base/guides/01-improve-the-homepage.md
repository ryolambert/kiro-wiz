---
title: "Steering Kiro, and improving the game homepage - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/learn-by-playing/01-improve-the-homepage/"
category: "guides"
lastUpdated: "2026-02-07T05:52:09.425Z"
---
# Steering Kiro, and improving the game homepage

---

This module assumes you have already launched the game locally, by
following [the setup instructions](../00-setup).

#### Understand the problem

Load up `localhost:5173` in your browser to see the home page.
As you can see this homepage starts out very minimalistic.
There are no graphics, explanations of what the game is, and there
is no marketing copy. This is a perfect task for "vibe coding".

#### Setup Kiro steering files

But before we "vibe" we must prepare. Because this game is fairly complex,
it will be very useful to prepare Kiro to properly understand
what the project is, what tech it utilizes, and how to navigate the
code.

Use `Control/Command + Shift + P` to open the command palette,
then search for the word “Steering”. Select the option
“Kiro: Generate project steering documents”

Loading image...

The Kiro agent will go to work exploring key files from the repository
and creating some “steering” files that describe the project purpose,
structure, and tech. These files will help guide all future runs of
the agent interactions, making them faster and more accurate.

Loading image...

Take a moment to look at the `.kiro` folder that has been created.
You should see a few files:

- product.md - Describes what the project is. This helps Kiro
understand the big picture view of what is going on when you ask
it to do something.
- tech.md - Describes all the tech used in this project. This helps
Kiro stick to your existing tech choices, instead of recommending divergent
options.
- structure.md - Describes key folders and areas of the project. This
helps Kiro get to the right place faster when it is working.

#### Make some improvements

Now that the steering files are setup, try a basic “vibe coding” prompt
like “I want you to make my homepage better.”

The game client is being served by Vite, so you will be able to see changes
reflected in real time as Kiro makes modifications to the page.

#### Get creative!

Ask Kiro a question like:

```
Give me 20 potential themes for a game landing page. 

```

Then ask Kiro to reimagine the landing page in that theme.

AI can be very imaginative, and is perfect for prototyping designs,
even if you don’t yet have a solid plan in your head. Try out asking it to make the home page have different styles such as: "Apple product
marketing page", "Retro", or "Startup" and/or ask for specific features that you want on the page like a "carousel", "quotes", or "animations".

In this module we learned two core concepts:

1. Steering files help guide an AI through your project. Your first
step should always be to collect and setup this basic context for
the AI.
2. AI can be very creative, and it significantly lowers the barrier to
experimentation. Try out several different prototypes very quickly,
then throw away takes you don't like.

Let's move on to the next task:

[Fixing a subtle physics bug](../02-physics-bug)