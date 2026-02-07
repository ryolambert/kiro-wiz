---
title: "Kiro is generally available: Build with your team in the IDE and terminal"
sourceUrl: "https://kiro.dev/blog/general-availability/"
category: "blog"
lastUpdated: "2026-02-07T05:52:40.125Z"
---
*Applications for startup credits have closed due to high demand. We are still reviewing applications on a rolling basis. Stay tuned for updates.*

---

Since launching Kiro in preview in July, we've seen strong adoption of Specs as a structured way to build with AI. We were the first to bring spec-driven development to AI coding tools, and the broader industry has recognized its value—planning is the right way to do work with AI agents.

Over the past months, we've added capabilities like remote MCP, global steering files, dev server support, our Auto agent, and making specs more flexible with optional tasks.

Today at general availability, we are releasing a set of brand new capabilities: 1/ property-based testing for spec correctness (which measures whether your code actually matches what you specified); 2/ new way to checkpoint your progress on Kiro; 3/ a new Kiro CLI bringing agents to your terminal and; 4/ team plans with a simple way to manage them centrally.

## Kiro IDE

The new version of Kiro IDE introduces three new capabilities.

### Measuring “spec correctness” with property-based tests

There's a fundamental problem with AI code generation: how do you know the code actually does what you specified? Traditional unit tests only check specific examples. Worse, whoever writes the tests (human or AI) is limited by their own biases—they have to think of all the different, specific scenarios to test the code against, and they'll miss edge cases they didn't think of. AI models often “game” the solution by modifying tests instead of fixing code, or go in endless loops to fix the issues.

Property-based testing (PBT) addresses this by measuring whether your code matches the behavior you defined in your Spec. Instead of testing specific examples, Kiro goes into your project’s specifications and extracts properties that represent how the system should generally behave, then tests against them.

**What is a property?** A property is a universal statement: *for any* set of inputs, *such that* certain preconditions hold, some *predicate* (expected behavior) is true. For example: "For any authenticated user and any active listing, the user can view that listing."

**How it works:** Kiro helps you write specifications using EARS format (e.g., "THE System SHALL allow authenticated users to view active car listings"). Kiro extracts properties from these requirements, determines which can be logically tested, then generates hundreds or thousands of random test cases to check your code. For example, if you’re building a car sales app:

- Traditional unit test approach: User adds Car #5 to favorites, Car #5 appears in their list
- Property-based test approach: For any user and any car listing, WHEN the user adds the car to favorites, THE System SHALL display that car in their favorites list. PBT then automatically tests this with User A adding Car #1, User B adding Car #500, User C adding multiple cars, users with special characters in usernames, cars with various statuses (new, used, certified), and hundreds more combinations, catching edge cases and verifying that implementation matches your intent.

Throughout this process, PBT probes to find counter-examples through a technique called "shrinking"—almost like a ‘red team’ trying to break your code. When it finds violations or counter-examples, Kiro can automatically update your implementation, or surface options for you to fix the Spec, implementation, or PBT itself.

**Why this matters:** While PBTs are not verification or proof, they provide evidence for correctness across scenarios you'd never write manually—showing whether your implementation actually behaves according to what you defined.

[Read the full, technical deep-dive on property-based testing →](/blog/property-based-testing/)

### Rewind changes with checkpointing

You can now go back to a previous change in your agent execution flow. Kiro generates a checkpoint every time the agent makes a change or takes an action. You can roll back any number of steps without losing progress. This comes in handy when you're far along in implementing a task and don't want to lose your progress or spend credits redoing work.

[See the checkpointing deep dive →](/blog/introducing-checkpointing/)

### Multi-root workspace support

Kiro now supports working across multiple project roots simultaneously. Teams with multiple git submodules or multiple packages in a single project can now work with the AI agent across all of them. A typical Kiro workspace contains a single “root” folder, e.g., `/users/bob/my-project`. With multi-workspace support, a single kiro workspace can have multiple roots, e.g., a single workspace that contains both `/users/bob/my-project` and `/shared/utils/auth` as top-level folders.

[Read the docs for multi-root workspaces →](/docs/editor/multi-root-workspaces/)

## Introducing Kiro CLI

The Kiro agent is now available in your terminal. Use the CLI to build features, automate workflows in seconds, analyze errors, trace bugs, and suggest fixes—all in a terminal of your choice, in a highly interactive loop that keeps you in flow. Kiro CLI works with the same steering files and MCP settings you set up in the Kiro IDE so you and your team have access to the same tools and preferences across both environments.

**What's included: **The CLI brings the full power of Kiro to your terminal—Claude Sonnet 4.5, Claude Haiku 4.5, and Auto, with steering files, advanced context management, and MCP tools to read and write files locally, call APIs, and run bash commands. Spec creation support is coming shortly, but you can work with existing specs in the CLI as well. The CLI also supports custom agents, specialized AI assistants you tailor for specific tasks—optimized with pre-approved tool permissions, your context files, and custom prompts. For example, your backend specialist focuses only on your API patterns and schemas. Your frontend agent knows only your components. Each agent uses its context window on just what matters. Think of custom agents as a way to package expertise very precisely so Kiro acts as an expert in that area without you repeating yourself or risking context rot.

Users building with the CLI over the past few weeks tell us they love the speed and interactivity.

You can use the CLI with the same Kiro subscription and login you're using in the IDE, with credit limits and overages shared across both tools. Install it on macOS or Linux:

[Learn more about Kiro CLI and custom agents →](/blog/introducing-kiro-cli/)

## Kiro for organizations

Teams can now sign up to Kiro via AWS IAM Identity Center, with support for more identity providers coming soon. Admins can manage access from the AWS Management Console, where they can assign Pro, Pro+, or Power subscriptions. They can also turn on overages, monitor costs, control MCP, and manage a single bill across the org. The new management dashboard gives you all the tools you need to manage Kiro for your team, startup, or enterprise, from one place. As a user, just click on “Sign in with your organization identity'” and follow the process.

## One year's worth of Kiro Pro+ for startups

Today, we are also introducing a startup offer: we are giving away [one year’s worth of Kiro Pro+ for qualifying startups](/startups/). Available globally to eligible startups up to Series B, the offer is available while credit supplies last. Existing AWS Activate credits can now be used for Kiro, and both offers stack.

Across teams, tools, and tests, Kiro now better supports the way you want to work by bringing the right level of context and structure to AI-powered development. This is just the start.

[Get started with the IDE](/downloads/) | [Get started with the CLI](/docs/cli/)