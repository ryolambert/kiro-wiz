---
title: "Using specifications for complex work - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/learn-by-playing/05-using-specs-for-complex-work/"
category: "guides"
lastUpdated: "2026-02-07T05:52:10.481Z"
---
# Using specifications for complex work

---

This module assumes you have already launched the game locally, by
following [the setup instructions](../00-setup).

In previous modules we:

- Wrote HTML and CSS to improve the homepage
- Fixed a physics bug in the core of the game's physics engine
- Fixed an interactions bug through an logic refactor
- Did a DRY refactor across many components

So far we've mostly done minor modifications and refactors, but what about
more complex new features? Kiro is here to help with that too.

#### Understand the problem

You may notice that on the login page of the game there is no "Forgot Password"
link. The game is using [Amazon Cognito](https://aws.amazon.com/cognito/) for authentication, however
the implementation is currently still fairly minimal.

In order to send password reset emails, Cognito requires the email to
be verified, so we also need to implement email verification as well.

So we are looking at a tree of tasks that need to be completed:

- Email verification implementation
  - Frontend client side components
  - Backend server routes and Cognito integration
- Password reset implementation
  - Frontend client side screens
  - Backend server routes and Cognito integration

#### Ask for a specification

Try the following prompt in Kiro:

```
I need a specification for email verification and password reset

```

Kiro will go to work collecting information about the project
and designing a specification for this complex task.

#### Review requirements

Kiro will expand your initial ask into a detailed set of
requirements based on user stories. In most cases these
user stories, and the resulting requirements, will help
expand vague asks and highlight edge cases that you might
not have initially expected:

Loading image...

After you read through the requirements you can either
provide detailed feedback on how to rewrite the requirements
or you can just type something like "LGTM" in the prompt
to move on.

#### Review design

Now Kiro will compare the existing code to the
requirements and start imagining how to fit these requirements
into the codebase:

Loading image...

In the upper right corner of the design doc you can click
the "Preview" button to open a rendered copy of the design
document. This will properly show the flow diagram.

The design document likely includes some example code snippets
that are similar to what Kiro plans to write to solve this
problem. Don't worry too much about the specifics of this code.
Think of it more as pseudocode that is imagining the API.
The actual implementation may end slightly different.

After you read through the design document you can either
provide detailed feedback on how to rethink the design
or you can just type something like "LGTM" in the prompt
to move on.

#### Review tasks

Kiro will use the requirements and design document to plan
a series of tasks to execute. Think of each of these tasks
as a step along the journey towards the new feature.

Loading image...

The task list may not match up with your
preferred order of operations when vibe coding. For example,
the task list often has test development last, while you may
prefer test driven development.

You can use steering files to modify Kiro behaviors.
For example, try creating a file `.kiro/steering/specs.md` with
instructions to always write tests first before writing code.

You can either provide feedback in the prompt to
modify the task list, or type something like "LGTM" to
move on.

#### Work on a task

To start working on a task, click the "Start Task" link
above the task. Kiro will go to work on that task.

Loading image...

You will likely still need to review, test, and iterate
on generated code for each task, even though the task list
marks the task as "Task completed".

#### Specification as history

You may have noticed that specifications are stored
under `.kiro/specs`. By design, you should commit these
specification files to the repo, alongside the code.

Over time, you can accumulate a large collection of
specification documents that describe the intent and
design behind the code.

This will serve as a guide for future developers,
as well as a reference for Kiro if it ever
needs to revisit these features.

In this module you have learned two key concepts:

- While vibe coding is fun, sometimes you need to build
something a bit more complex. Then it is helpful to use
Kiro specifications to plan the requirements, design the
implementation, and lay out a series of steps for the
implementation.
- Steering files aren't just to teach Kiro about the project,
they can also be used to modify Kiro's behavior, such as
adjusting how it plans tasks.

Let's move on to the next task:

[Managing assets with agent hooks](../06-managing-assets-with-agent-hooks)