---
title: "Teaching Kiro new tricks with agent steering and MCP"
sourceUrl: "https://kiro.dev/blog/teaching-kiro-new-tricks-with-agent-steering-and-mcp/"
category: "blog"
lastUpdated: "2026-02-07T05:52:41.979Z"
---
## Introduction

Over the past three years, I have helped hundreds of customers adopt AI tools for software development. Many of these customers have developed their own libraries, tools, and even domain-specific languages (DSLs). Whether it's a workflow automation language, a configuration syntax, or a rules engine, these customizations are the backbone of business operations. But what happens when you want your AI coding assistant to understand and work with these proprietary libraries?

In this post, I will explore how to teach [Kiro](/), an AI agent and development environment, to understand a library called MathJSON. While MathJSON is a fictional library created for this demonstration, it serves as a proxy for the workflow languages, configuration systems, and specialized notations that enterprises use daily. Throughout the post, I will discuss [steering](/docs/steering/) and [Model Context Protocol (MCP)](/docs/mcp/), and how to use these together to teach Kiro new skills.

## Meet MathJSON

For this post, I'll use MathJSON - a JSON-based mathematical expression language that uses proper mathematical terminology. Note that MathJSON was created for this post and I do not recommend that you use it in real world applications. Here's what makes it interesting:

### Key Characteristics

- JSON-based syntax for structured mathematical expressions
- Proper mathematical terminology (addend, minuend, multiplicand, etc.)
- Nested expressions for complex calculations
- Rich function library (trigonometry, logarithms, constants)
- File extension: .math

### Example Expression

This example calculates the area of a circle for a given radius passed as an environment variable: `pi * radius^2`

## Guiding Kiro with steering files

Steering gives Kiro persistent knowledge about your project through markdown files. These files are stored in `.kiro/steering/` and provide context and instructions for all interactions within a workspace. Steering files could include coding standards, project structure, and much more.

Your first thought might be to simply add the MathJSON documentation to the steering folder. I did exactly that, adding the `function_reference.md` file to my steering folder. This is a good start, but there are a few issues. First, the documentation is written for a human. As a result it is verbose and often repetitive. Second, it lacks specific best practices for Kiro to follow. Third, documentation copied to my project folder will inevitably be out of date. Let’s look at each of these issues and how to address them.

## Refining steering files

The first issue that we want to overcome is the verbosity of documentation. *Obviously, I am assuming that you have good documentation. If you do not, Kiro can help you generate it. *Often the documentation created for humans is too verbose to include in steering files. MathJSON is a trivial project I created for this post, yet it still has over 3500 lines of documentation across a half dozen markdown files. This is too much information to add to every conversation I have with Kiro.

Luckily, Kiro can refine your steering files for you. Simply open your steering file in Kiro and select the **Refine** button. Kiro will read the file and optimize it for you as seen in the following image.

Let’s look at one of the changes that Kiro made. In the original documentation, addition is described as follows.

Kiro refined this and replaced it with one line. Note that details like nested expressions are covered only once in the refined file rather than repeating it in the examples for each operation. Therefore, there is no need to repeat it here.

Overall, this is a great start. The steering file is now 102 lines, down from 3,500. If you do nothing else, use the refine option to optimize your steering files. However, we can continue to improve it.

## Defining best practices

The next issue that we want to overcome is the specificity of documentation. User documentation tends to be broad. It focuses on covering all the ways you can use the library or language. However, a steering file should be opinionated. Rather than telling Kiro how it **could** use MathJSON, I want to tell Kiro exactly how it **should** use MathJSON.

Kiro started to define best practices when it refined the documentation for me in the prior section. However, I will add an additional rule. Specifically, I want Kiro to validate and test all the code it writes. So, I will add a few new best practices.

Note that the steering file already includes instructions for using the command line tool. I am not repeating that but instructing Kiro when to use it. The steering file is starting to take shape, but how do we keep it up to date over time?

## Keeping knowledge up to date

The first issue that we want to overcome is the freshness of documentation. Over time, MathJSON is going to evolve and change. For example, I recently added support for trigonometry. I would prefer that Kiro has access to the original documentation rather than a copy that I must maintain in steering files. Enter Model Context Protocol (MCP).

For MathJSON, the GitHub repository is the source of truth. Therefore, I configured an MCP server for GitHub. Now, Kiro can read the latest docs when it needs to. Note that GitHub is just an example. If you keep your documentation in GitLab, Confluence, etc. there is likely an MCP server for that too.

You might be tempted to delete the steering file now that Kiro has direct access to the docs in GitHub. However, in practice, I have found that I need both. Imagine that I asked Kiro to `create a function to add two numbers`. There is nothing in that prompt to indicate that I want Kiro to use MathJSON, nor that the documentation for MathJSON is stored in GitHub. Kiro is likely to write the function in Python rather than MathJSON. The steering file helps Kiro connect the dots.

In the following example, you can see that I have updated my steering file to tell Kiro that we are using MathJSON and that the documentation is available in GitHub. In addition, I have told Kiro to use the GitHub MCP server to access the documentation.

Note that I am providing references to specific files. This is a performance optimization. Had I just provided a reference to the repo, Kiro would spend too much time exploring the repo and reading files.* *I also want to note that GitHub is not an ideal documentation repository. Kiro would benefit from chunking the documentation into topics and storing those chunks in a vector database. This would allow Kiro to access just the portion of the documentation it needs. However, this post is getting a bit long, so I’ll save that topic for another post.

## Asking Kiro to update its knowledge

At this point, my steering file mostly serves as a pointer to the documentation. However, I do still have some high-level documentation directly in my steering file along with the best practices section. More importantly, I ask Kiro to update the steering file periodically. Each time Kiro makes a mistake, or runs into an issue, I ask Kiro to make updates while the issue is still in context.

In the following example, you can see Kiro working through an environment variable formatting issue. When the linter identifies an issue, Kiro uses the MCP server to read the docs and fix the error.

As Kiro works through these issues, it learns new skills. However, that new knowledge is only retained for the duration of the conversation. Therefore, Kiro is likely to make the same mistake in a future session. This is a great opportunity to ask Kiro to update the steering files as seen in the following image.

After learning about MathJSON’s syntax for environment variables, Kiro added the following section to the steering file.

Over time, Kiro will continue to refine the guidance and expand its knowledge of my DSL and improve the code it writes.

## Bringing it all together

After a few iterations, Kiro is ready to author MathJSON. I’ll ask Kiro to create a function to model mortgage overpayment.

Kiro is now ready to generate MathJSON for me. Here is the MathJSON it generated for the mortgage overpayment calculation.

And of course, Kiro will follow the best practices defined in the steering file to lint and test the code that it wrote validating that the code is syntactically correct.

## Conclusion

Teaching Kiro to understand and work with custom libraries like MathJSON demonstrates the power of combining steering files with Model Context Protocol. By following the approach outlined in this post - refining documentation, establishing clear best practices, and leveraging MCP for up-to-date knowledge - you can teach Kiro to work with your custom libraries, languages and tools. [Get started with Kiro](/downloads/).