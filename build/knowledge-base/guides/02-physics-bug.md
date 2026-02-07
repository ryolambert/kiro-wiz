---
title: "Investigating and fixing a subtle bug with physics - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/learn-by-playing/02-physics-bug/"
category: "guides"
lastUpdated: "2026-02-07T05:52:09.672Z"
---
# Investigating and fixing a subtle bug with physics

---

This module assumes you have already launched the game locally, by
following [the setup instructions](../00-setup).

In the previous module we completed [a simple task to improve the game's
home page](../01-improve-the-homepage), but this was mostly just HTML and CSS task. Let's try
working with some more complex JavaScript code that is part of the
game engine core.

#### Understand the problem

Players of the game report that sometimes game physics go haywire
and items bounce really high. One player has provided the following
recording:

Loading image...

#### Ask Kiro to investigate

Try a prompt that describes the issue in as much detail as
you can:

```
When something is moving or colliding, and the player tabs out then back in, the items do a tremendous bounce. Players report "items go haywire".

```

Kiro will start investigating project files, and will
identify the cause. For example:

> The problem is in the physics-system.ts file. When a user tabs out and back in, the lastTimestamp value becomes stale, and when the animation frame resumes, the calculated deltaTime can be extremely large (several seconds instead of milliseconds). This large delta is then used in physics calculations, causing objects to move much farther than they should in a single frame, resulting in the "haywire" behavior.

#### Dig deeper

Based on your initial description, Kiro probably coded
a basic fix right away. However, we aren't done yet.

Try asking Kiro:

```
What other potential solutions or mitigations should I consider?

```

You may be surprised to see the AI come up with many additional
potential fixes beyond what it originally implemented.

#### Explore even deeper

Now that you have the model into a specific latent space of exploring
potential improvements to the game's physics system it is a great
time to ask a question like:

```
Do you see anything else that looks like it could be improved?

```

Large language models contain an incredible breadth of knowledge.
However, they require a human to push the model a
bit further to unlock the true potential. Don't stop prompting on
the first answer. Ask questions like "why?", "what else?", and
"what then?"

In this module we learned one key AI engineering concept:

Don't just treat AI as a task solving machine. Use the AI's depth and breadth of knowledge to explore gaps in your own knowledge.

Let's move on to the next task:

[Fixing an interactions bug across several files](../03-interactions-bug)