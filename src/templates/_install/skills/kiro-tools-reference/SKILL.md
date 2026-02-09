---
name: kiro-tools-reference
description: Reference for all Kiro built-in tools and their configuration. Use when configuring toolsSettings in agents.
---

# Kiro Built-in Tools Reference

## fs_read
Read files, directories, images. Modes: Line, Directory, Search, Image.
Config: `allowedPaths`, `deniedPaths`

## fs_write
Create/modify files. Commands: create, str_replace, insert, append.
Config: `allowedPaths`, `deniedPaths`, `fallbackAction` (interactive|deny)

## execute_bash
Run shell commands with safety checks.
Config: `allowedCommands` (regex), `deniedCommands` (regex), `autoAllowReadonly`, `denyByDefault`
Read-only commands: ls, cat, echo, pwd, which, head, tail, find, grep

## grep
Regex search across files. Respects .gitignore.
Modes: content, files_with_matches, count
Params: pattern, path, include, case_sensitive, output_mode, max_matches_per_file, max_files

## glob
Find files by glob pattern. Respects .gitignore.
Params: pattern, path, limit, max_depth

## code
LSP-powered code intelligence: search_symbols, lookup_symbols, get_document_symbols, pattern_search, pattern_rewrite

## use_aws
AWS CLI integration.
Config: `allowedServices`, `autoAllowReadonly`

## introspect
Search Kiro documentation. Used by help agent.

## knowledge
Knowledge base search (requires `chat.enableKnowledge` setting)

## thinking
Extended reasoning (requires `chat.enableThinking` setting)

## todo_list
Task management (requires `chat.enableTodoList` setting)

## delegate
Subagent delegation (requires `chat.enableDelegate` setting)
