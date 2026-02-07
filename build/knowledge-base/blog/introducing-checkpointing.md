---
title: "Never lose your way: Introducing checkpointing in Kiro"
sourceUrl: "https://kiro.dev/blog/introducing-checkpointing/"
category: "blog"
lastUpdated: "2026-02-07T05:52:40.885Z"
---
As developers, we've all been there. You're working with an AI coding assistant, making great progress on a feature. The agent makes a series of changes—updating files, refactoring code, adding new functionality. Then suddenly, something goes wrong. Maybe the agent misunderstood a requirement. Maybe it made an assumption that doesn't fit your architecture. Or maybe you just want to try a different approach.

The challenge isn't just undoing the code changes—it's losing the context of your conversation. You might revert your files, but then you're left trying to reconstruct where you were in your dialogue with the AI. The flow is broken, and getting back on track takes time and mental energy.

What if you could experiment without fear? What if you could let your AI assistant tackle ambitious refactors, knowing you could instantly rewind if things don't go as planned? That's the confidence checkpointing brings to AI-assisted development.

## What is checkpointing?

**Checkpointing gives you the power to rewind Kiro's changes to any point in your development session.** As Kiro modifies your codebase, it automatically creates checkpoint markers in your chat history. Think of them as auto-save points in a video game—if things go off the rails and you lose more health than you wanted, you can revert to an earlier checkpoint and try a different approach.

**Each checkpoint captures the specific changes Kiro made to your files during that session.** With a single click, you can roll back any file modifications the agent made after that checkpoint, while preserving your conversation history leading up to that restoration point. You keep the context, undo the unwanted changes, and get back to building.

**Important: Checkpointing only reverts changes made by Kiro during the current session.** We don't save your entire codebase, only the files modified by the agent in this specific session can be restored. **Note:** Restoring a checkpoint reverts the *complete state* of any file Kiro touched, not just Kiro's changes. If you or another tool made edits to those same files after the checkpoint, those edits will also be lost. Be sure to use version control if you're manually editing code or have other systems modifying files while building with Kiro.

## Why checkpointing matters

AI-assisted development is powerful, but it's not perfect. Large language models are probabilistic by nature. Sometimes they make the right call. Sometimes they don't. The key is giving you, the developer, control over the process.

Without checkpointing, every AI-generated change carries risk. You might hesitate to let Kiro tackle a complex refactor because you're worried about the cleanup if something goes wrong. You might spend more time reviewing each change than you would just writing the code yourself. The fear of losing progress can actually slow you down.

Checkpointing changes that dynamic. It gives you the confidence to let Kiro take bigger swings. Want to try a different architectural approach? Go for it. If it doesn't work out, you're one click away from where you started. Want to experiment with a new library? No problem. The checkpoint is there if you need it.

## How it works

Checkpointing in Kiro is designed to be invisible until you need it. You don't have to remember to create checkpoints or manage them manually. Kiro handles that for you.

As you work with Kiro, checkpoint lines appear automatically in your chat interface. Before you start a task a checkpoint is created. These visual markers make it easy to see the structure of your development session at a glance.

When you want to revert, simply click the “Restore” button on any checkpoint line. Kiro rolls back everything—all file changes made by the agent and your conversation history—putting you right back at that exact moment. If you had typed a message but not sent it yet, it'll be there in your chat window, ready to edit or send. It's like time travel for your development session. You get back not just the code state, but the complete context of where you were and what you were thinking.

## Checkpointing and spec-driven development

Checkpointing pairs naturally with Kiro's spec-driven development workflow. When you're working through a specification, you might want to try different approaches to implementing a particular requirement. Checkpointing makes that exploration risk-free.

You can also use checkpoints to mark the completion of major milestones in your spec. Finished implementing the authentication system? That's a checkpoint. Completed the data layer? Another checkpoint. These markers give you a clear map of your progress and make it easy to revisit earlier stages if you need to make changes.

## Real-world scenarios

Let's look at a few scenarios where checkpointing shines:

**Safe experimentation**: You're curious whether a particular refactoring would improve your code's performance. Let Kiro make the changes and run your benchmarks. If the results aren't what you hoped for, revert to the checkpoint. No harm, no foul. The ability to experiment without consequences is incredibly freeing.

**Iterative refinement**: Sometimes you need to try a few variations before you find the right solution. With checkpointing, you can iterate quickly. Try an approach, evaluate it, revert if needed, and try again. Each iteration builds on the lessons of the last, but without the baggage of failed attempts cluttering your codebase.

**Exploring different implementations**: You're building a new API endpoint and you're not sure whether to use REST or GraphQL. Ask Kiro to implement it as REST first. Review the code, test it out, see how it feels. Not quite right? Revert to the checkpoint and ask Kiro to try GraphQL instead. Same conversation, different approach, zero manual cleanup.

**Recovering from misunderstandings**: You ask Kiro to "add authentication to the user service." Kiro implements OAuth2, but you actually wanted simple API keys. Instead of manually undoing dozens of file changes, you revert to the checkpoint before Kiro started and clarify your requirements. Kiro tries again, this time with the right approach.

## Building confidence in AI-assisted development

The real power of checkpointing isn't just the ability to undo changes. It's the confidence it gives you to work differently.

With checkpointing, you can treat AI-assisted development more like a conversation and less like a transaction. You can explore ideas, test hypotheses, and iterate rapidly without worrying about the cost of being wrong. You can let Kiro handle more complex tasks because you know you have a safety net.

This shift in mindset is subtle but profound. Instead of carefully controlling every step Kiro takes, you can focus on the bigger picture—what you're trying to build and why. Instead of spending mental energy on "what if this goes wrong," you can spend it on "what if this goes right."

## Checkpointing and version control

Let's be clear: checkpointing isn't a replacement for version control. You should still use Git (or your preferred version control system) as part of your development workflow. Think of version control as your long-term project history and collaboration tool, while checkpointing is your short-term experimentation and iteration tool.

Checkpointing shines during active development sessions when you're exploring ideas and iterating rapidly with Kiro. Once you've landed on an approach you're happy with, commit it to version control like you normally would. The two tools serve different purposes and work best together.

## Try it yourself

Checkpointing is available now in Kiro. You don't need to configure anything or change how you work. Just start a conversation with Kiro, make some changes, and watch the checkpoint lines appear. When you need to revert, they'll be there waiting for you.

We built Kiro to give you more control over AI-assisted development, not less. Checkpointing is a big part of that vision. It's about making AI a true partner in your development process—one that gives you the freedom to explore, experiment, and iterate without fear.

Ready to code with confidence? [Download Kiro](/downloads/) and see how checkpointing changes the way you work with AI.

---

*Have questions about checkpointing or want to share how you're using it? Join the conversation in our *[Discord community](https://discord.gg/kirodotdev)* or follow us on *[X](https://x.com/kirodotdev)*, *[LinkedIn](https://www.linkedin.com/showcase/kirodotdev)*, and *[Bluesky](https://bsky.app/profile/kiro.dev)*.*