---
title: "Kiro and the future of AI spec-driven software development"
sourceUrl: "https://kiro.dev/blog/kiro-and-the-future-of-software-development/"
category: "blog"
lastUpdated: "2026-02-07T05:52:44.783Z"
---
In the 1950s and 1960s, there was an explosion of innovation in programming languages. Programmers went from programming in assembly language and machine code, to writing programs in higher-level, portable, languages. Pioneers like John Backus, Jean Sammet, and Grace Hopper had the foresight to see what is now common knowledge: software is at the core of technology, and improving the speed and cost of software development would accelerate the rise of computing, and rise of the world’s economy.

These languages from the 50’s and 60’s were a revolution in programmer productivity, and in decoupling the behavior of programs from the underlying hardware. In the six decades since, programming has changed significantly, but one fundamental thing hasn’t changed: most mainstream programming languages describe how to do a task, rather than describing the task to be done. There have been many attempts to raise the level of abstraction programmers work at. Most that have tried to challenge the fundamental step-by-step nature of programming have failed. Those that succeeded have succeeded have been niche successes (including some very big niche successes, like SQL).

SQL is a great example: a SQL query describes the outcome the programmer desires (this data, in this form, from these places), and the database system figures out how to get it done. Low-level implementation choices, like data structures and algorithms, are abstracted away, or are chosen in declarative ways (“please make it efficient to retrieve data by this column”). Despite SQL’s near-ubiquity, it’s still generally only used to interact with database management systems, and not for general application development.

The 60-year-old fundamental paradigm of programming remains mostly unchanged.

Generative and Agentic AI are poised to bring about a new wave of change. For the first time, there are tools developers can use to translate common-sense descriptions of desired program behavior into real, working systems. Many developers are using these tools already. Prompt-by-prompt, step-by step, they describe the system they want to build to AI code generators. This *vibe coding* approach to development has already been proven to be a powerful tool. But its power is limited because it is missing one important piece: a full vision of the bigger picture of what a program should do, and why it should do that.

Enter *specification.*

A *specification* is simply a description of what a program should do, and what needs it should meet. Developers are used to working with specifications every day. The names and forms differ, from tickets, to requirements documents, to hallway conversations with colleagues. The languages differ too: from simple text descriptions, to UI sketches and mockups, all the way to formal mathematical definitions.

A specification is the bigger picture. It’s what those prompts are driving towards, step by step. It is, at its core, the whole point of the program a developer or team is building.

We built Kiro to make this bigger picture, spec-driven-development approach a reality. With Kiro, you can develop or improve programs prompt-by-prompt, or line-by-line. You can also zoom out to the specification level, and work with the IDE to generate, maintain, and act on changes to a specification that describes what you want your program to do. At this higher level, above all the implementation details, it’s easier to understand the purpose of a program, to make fundamental changes to its structure, and to think about and communicate the code’s overall goal.

Approaching development with specifications has three significant benefits. First, it provides a way for developers and stakeholders to understand and agree on the goals of the program. It’s crisp documentation on what we want the program to do, the interface to look like, and how it should be implemented. Working at the specification level allows programmers to move faster, and spend more time thinking about the things that really matter. Second, it provides a guide for AI agents to work from, refer to, and validate their work against. A North Star to guide the work of the agent, allowing it to take on larger tasks without getting lost. Third, the specification tames the chaos of prompt-driven vibe coding on large code bases, moving away from an ad-hoc exercise in prompt engineering, to way for programmers to crisply express their intent to agents. A specification is a kind of (version controlled, human-readable) super prompt.

## Let’s Play a Simple Game

To understand how this plays out in Kiro, let’s start off with a simple example of what a specification is, and how we can use one in our development process. I’ll build a small browser-based version of the classic Towers of Hanoi game.

We’ll start with a new directory, and a prompt:

Kiro will then go off and write out first version of the specification. Despite the fancy name, it’s simply a markdown file describing the user stories for this little game we’re building. We can pause now to change these stories, or go onto the design phase. Kiro will ask me when I’m done with the specification. When I am, I kick off the next phase by saying:

While this looks and feels like prompt-based development from the prompts, the ability to read and customize the user stories, the design, and the plan of tasks for the agent to do allows a deeper collaboration between developer and agent. It allows developers to be much more specific about particular details, and for the agent to communicate its plan ahead of time. By writing down those details along with the plan – as version controlled artifacts – Kiro’s approach changes AI-powered development from *vibe coding* to a real, durable, collaboration between the programmer and the AI development agent.

After a couple minutes, we end up here:

Cool! But this code doesn’t quite do what I wanted it to do in my head when I wrote the prompt. When I click *Auto Solve* it starts a new game rather than solving mine from where I am. In a traditional *vibe coding* approach, I could then prompt the required changes. Kiro gives me another option: add that requirement to the generated *requirements.md, *then request the changes. That way, the requested change is version controlled and written down. It doesn’t get lost as further changes are made. It also provides more space to write structured, specific, and precise text. This is the key power of Kiro’s approach. By writing things down, we make them long-lived, durable, and official. As I keep working with the agent, I know it still remembers all the things I care about (and has flexibility to change the things I don’t care about).

Concretely, making that change requires two new lines in *requirements.md:*

Kiro will make these changes for us, including creating a new task, and moving the code to match these new requirements. Crucially, as I add and remove other requirements from *requirements.md*, these new changes don’t get lost. From vibe coding, to repeatable, trackable, software development, powered by AI agents.

## Specification at the Heart of Development

At Amazon, we’ve been writing specifications for a long time, in many forms. We use a process called *working backwards*, creating documents like press releases and blog posts early in the life of a project to make sure we’re taking a customer-first view of what we’re building. We’ve long had the discipline of writing and reviewing design documents, both formal and informal, specifying the design and behavior of the systems we’re building. One of the most important functions of our principal engineering community is writing and reviewing these documents. We also use [more formal specification](https://cacm.acm.org/practice/systems-correctness-practices-at-amazon-web-services/), where we write down properties of our systems with mathematical precision (using languages like TLA+ and P), allowing us to prove important properties of our systems, and automate testing1.

We spend this time on specification because we think it help us move faster, by making it more likely we’re writing the right code to solve the right customer problem. It reduces back-tracking by keeping a record of the decision we’ve made and why. It communicates to developers and stakeholders what’s truly important in a design.

Kiro’s specifications build on our experiences here. That doesn’t mean they’re complex (they’re simple markdown documents), or only built for large companies (you can make a specification as formal or informal as you’d like). But we believe deeply in the core value of writing down what we’re doing. We think it makes us better, more effective, and more efficient, developers.

## Conclusion

When the precursors to today’s mainstream programming languages were being created, back in the 1950s and 1960s, they stretched the limits of the technology of the day. They raised the level of abstraction from the assembly and machine code level to a much higher one, made of statements and functions that can convert into hundreds of machine instructions. But the technology back then didn’t allow raising the level of abstraction further. Many attempts have been made to raise the abstraction from *step-by-step* to *what do you want done? *ranging from the esoteric (like Datalog) to the mainstream-but-niche (like SQL).

I believe that Kiro’s *specification *approach is an important and powerful step towards a future of programming where outcomes matter more than implementation details, and where implementing programs that solve complex problems is easier and more accessible. Where we can focus more on what we want to do, and less on how we want to do it. More immediately, it’s a significant step towards taming the chaos of *vibe coding* without losing the power and productivity that AI agent-assisted coding brings.