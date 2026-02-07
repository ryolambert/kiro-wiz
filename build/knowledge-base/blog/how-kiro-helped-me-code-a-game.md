---
title: "How Kiro helped me code a game"
sourceUrl: "https://kiro.dev/blog/how-kiro-helped-me-code-a-game/"
category: "blog"
lastUpdated: "2026-02-07T05:52:44.612Z"
---
Over the past 6 months, I have been putting Kiro, a new AI IDE, to the test by building an infinite crafting video game. The result is *Spirit of Kiro*, a living, open-source experiment that pushed my coding capabilities to the edge and taught me valuable lessons about how to use AI to build software.

*Spirit of Kiro* is a quirky sandbox game where you can combine any game item with any other game item. There are no hardcoded recipes limiting what you can do. Instead, modern LLMs handle the crafting logic on the fly. Players can get a taste of the same “yes, and…” creativity I feel when coding with Kiro.

Using Kiro to build the game changed how I prototype, how I write code, and how I think about the whole craft of software engineering.

## Start Fast. Break Things. Rewrite. Repeat.

One big lesson I learned from *Spirit of Kiro* is that great AI engineering thrives around the idea of disposable work. Most software projects involve a bit of upfront planning — maybe one or two prototypes — then you must commit to a direction and stick with the existing code. With Kiro, I found that AI enabled me to explore dozens of potential branching paths, then purposefully choose what I liked best. Each throwaway idea made the final product sharper.

Kiro makes it easier to experiment, and less painful to rewrite things. Need a quick WebSocket server? Prototype it. Want to try DynamoDB versus Postgres? Ask Kiro to prototype both. Wonder if Vue or React is better? Try both. Toss out the things you don’t like. Keep the insights.

## Steering Files: Consistent, Quality Code

One thing I particularly love about Kiro is its steering files: tiny documentation overviews that guide Kiro as it works on each prompt. Kiro helped me generate and update these steering files. As a result, I was able to spend a lot less time thinking about prompt engineering, and more time just asking for what I wanted. Steering files make Kiro dramatically better at turning vague instructions into clear, useful output with consistent code quality.

## Smaller Steps for Bigger Impact

Both AI and humans work best when big tasks are broken up into smaller ones. While Kiro is very capable of “vibe coding”; one of its unique powers is spec-driven development.

With spec-driven development, I asked Kiro to chart the path for large features such as a brand new “appraisal” feature I wanted to add to the game. This nontrivial feature required changes to the game client, the game server, and game infrastructure. Kiro helped me think through all the edge cases and potential subtasks I might have missed. It generated a design based on my actual code. Then, it generated a step-by-step plan to get the code from where it was to where I wanted it to be.

Spec-driven development works great with traditional software engineering best practices like continuous integration. I found myself working in small commits, with quick merges, and less fear of rolling back to make another try.

## Strongly Typed Languages

Kiro is great at TypeScript. I found that using a strongly typed language gives the LLM additional context info, resulting in higher quality code. In *Spirit of Kiro*, even when I used Bun (which does not strictly type-check at runtime), keeping TypeScript types in the mix gave Kiro exactly what it needed to stitch together functions, interfaces, and data flows with surprising accuracy. I could also use Kiro to run my build, detect errors, and then fix them automatically.

## Refactoring is fun and easy with Kiro

If you have ever stared at a huge code file wondering where it went wrong, I feel you. Short, well-scoped files are easier for both humans and AI to read, understand, and then add to.

Using Kiro taught me that clean, maintainable code is a deliberate choice, no matter what tool you are using. AI-assisted coding isn’t just about delivering features. Sometimes it’s time to use AI for a “vibe refactor”. I found myself asking Kiro to rewrite code with the “early return” pattern, or break large functions up into smaller, shorter functions.

I even asked Kiro to take a look at my code through the eyes of famous software engineers like Martin Fowler. Then, Kiro helped me break monolithic code into neat modules. The result was cleaner boundaries, and plenty of room to keep adding to the game over time.

## Event driven code is better for AI

Whether your code is monolithic or modular is just the start. The next factor is how tightly coupled code is. Unsurprisingly, both human software engineers and AI benefit from more loosely coupled systems. Instead of making each game component directly invoke functions from other game systems, I asked Kiro to implement a decoupled event system.

Game components emit events, then other game components or systems can subscribe to the event to react to it. This keeps game systems separate, which is perfect for fast iteration. Once I gave clear examples of how to wire up events, Kiro could repeat the pattern again and again.

The result was a game that scales better, and where I can continue to slot in new features over time.

## Ideation and Investigation

AI-assisted development doesn’t mean that you hand the entire software engineering job over to AI. Kiro did not replace me during this coding process. I stayed involved and engaged throughout. I found that I got tremendous value from asking Kiro to generate five to ten ideas for how to solve something, then I made the final pick. I also learned by asking follow-up questions. If Kiro generated code that I didn’t immediately understand, I always asked “why?” and “how?”

Most Kiro generated code was great, but sometimes the code didn’t quite work right. I still got tremendous value from some of these false starts and dead end paths along the way. Chatting with Kiro about issues in the code helped me identify where there were gaps in my knowledge that were preventing me from making more precise asks. For example, at one point I wanted to refactor the game’s main data store, but realized that in doing so, Kiro had broken the reactivity that Vue uses to refresh components automatically when the data changes. Ultimately, it was bad prompting on my part because I did not know enough about reactivity fundamentals to predict this outcome. A follow-up prompt via Kiro directed me to Vue’s reactivity in depth documentation, where I was able to fill in some personal knowledge gaps.

Maintaining a curious, engaged mindset let me use AI to build, while still building up my own skills and abilities.

## What’s Next?

*Spirit of Kiro* is not done. The [roadmap ](https://github.com/kirodotdev/spirit-of-kiro/blob/main/docs/ROADMAP.md)is long and the [open-source repo is now available](https://github.com/kirodotdev/spirit-of-kiro) to fork, remix, or break however you want. I am excited to see how other builders experiment in directions I have not even imagined yet.

If you take one thing away from my project, let it be this: Kiro is a multiplier of your abilities. If you are curious and want to explore, then you can use Kiro to test bold new ideas faster. If you want high quality code, you can use Kiro to iterate on code over and over until things are perfect. But most of all, if you enjoy coding, and have fun doing it, then Kiro is a multiplier of that enjoyment as well.

If you want to learn more or try *Spirit of Kiro* for yourself, [check out the repo](https://github.com/kirodotdev/spirit-of-kiro/) or the [guided tutorial in the documentation](https://kiro.dev/docs/guides/learn-by-playing/).