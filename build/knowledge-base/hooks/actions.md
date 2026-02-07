---
title: "Hook actions - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/hooks/actions/"
category: "hooks"
lastUpdated: "2026-02-07T05:52:05.240Z"
---
# Hook actions

---

Agent Hooks support both an "agent prompt" ("Ask Kiro") and a "shell command" action. Once you have selected the specific event that [triggers](/docs/hooks/types) a hook, you can decide what action will be taken by Kiro when that hook is triggered.

## Agent Prompt action

With this action, you can define a prompt that is sent to the agent each time the hook is triggered. The agent will respond and act on this prompt just like it does with a prompt provided in the chat panel.

In the case of the [PromptSubmit](/docs/hooks/types/#prompt-submit) trigger, this action is called "Add to prompt". The prompt specified in the hook is *appended* to the user prompt, and the combined prompt is sent to the agent.

## Shell Command action

With this action, you can define a shell command that is executed each time the hook is triggered.

If the command returns an exit code of "0" indicating success, the *stdout* output of the command is added to the agent's context.

If the command returns any other exit code, the *stderr* output of the command is sent to the agent, and the agent is notified that the hook returned an error. Additionally, in the case of the **Pre Tool Use** hook, the tool invocation is blocked, and for the **Prompt Submit** hook, the user prompt submission is blocked.

An execution timeout can be specified. The default timeout is 60 seconds. Set to 0 to disable the timeout.

This action is not currently available for the file and manual triggers.

## Selecting an action type

You should use the Agent Prompt action when, in response to a trigger event, you want to use natural language to instruct the agent to perform some action based on context.

You should use the Shell Command action when you want to run a specific command(s) or perform a deterministic set of actions that do not depend on the agent's current context.

Note that Agent Prompt actions consume credits as these actions trigger a new agent loop, whereas Shell Command actions do not. Shell Command actions are also generally faster than Agent Prompt actions as they are executed locally on your PC, and do not use an LLM.