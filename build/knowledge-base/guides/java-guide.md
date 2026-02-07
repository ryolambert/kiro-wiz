---
title: "Java - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/languages-and-frameworks/java-guide/"
category: "guides"
lastUpdated: "2026-02-07T05:52:08.627Z"
---
# Java

---

Kiro provides powerful AI-assisted development capabilities for Java projects, helping you write, debug, and maintain Java code more efficiently.

## Prerequisites

Before diving into Java development with Kiro, ensure you have:

- Java Development Kit (JDK): Install the latest LTS version (JDK 17 or newer recommended). We recommend Amazon Corretto for a free, production-ready distribution of OpenJDK.
- Build Tool: Maven or Gradle for dependency management and build automation.
- Git: For version control and collaboration.

## Extensions

Kiro supports extensions from Open VSX that can enhance your Java development experience. Here are some helpful extensions you can install:

- Extension Pack for Java: Popular extensions for Java development in Visual Studio Code. Includes Language Support for Java, Debugger for Java, Test Runner for Java, Maven for Java, Project Manager for Java, and IntelliCode.
- Spring Boot Extension Pack: A collection of extensions for Spring Boot development including Spring Boot Tools, Spring Initializr Java Support, and Spring Boot Dashboard.
- Gradle for Java: Manage Gradle projects, run Gradle tasks and provide better Gradle file authoring experience in Kiro.
- Maven for Java: Manage Maven projects, run Maven tasks and provide better Maven project authoring experience in Kiro.
- Markdown Preview Enhanced: For viewing and editing markdown files with live preview.

You can install these extensions in Kiro by using the Extensions panel and searching for the extension names listed above.

## Working with your environment

With Kiro, you can leverage the chat capabilities to setup a new project or work on an existing one.

### Project configuration and structure

Kiro can help you set up and maintain configuration files for your Java projects, and organize your project following Java best practices.

- Initialize configuration files: Ask Kiro to initialize default configuration files based on the project.
- Create project structure: Ask Kiro to create the structure of your project based on needs and best practices.
- Environment setup: Get help configuring your Java development environment.

Example prompts:

```
"Create a new Maven project for a Spring Boot application"
"Set up a Gradle build file with JUnit 5 and Mockito dependencies"
"Configure a multi-module Maven project structure"
"Help me install and configure the latest JDK for my operating system"
"Set up a Spring Boot project with proper layered architecture"
"Create a pom.xml with Spring Security and JPA dependencies"

```

### Code analysis and refactoring

Kiro can analyze your Java code to identify issues and suggest improvements:

- Code Quality Analysis: Ask Kiro to review your code for potential bugs, performance issues, or style issues.
- Refactoring Assistance: Get help extracting methods, renaming variables, or restructuring code.
- Design Pattern Implementation: Kiro can help implement common design patterns in your Java code.

Example prompts:

```
"Analyze this method for potential bugs or performance issues"
"Refactor this code to use the Builder pattern"
"Convert this imperative code to use Java Streams"

```

### Debugging assistance

When you encounter errors in your Java code:

- Error Explanation: Kiro can explain cryptic error messages in plain language
- Solution Suggestions: Get actionable fixes for common errors
- Runtime Debugging: Kiro can help set up debugging configurations

Examples:

```
"Explain this NullPointerException in my code"
"Help me debug this ConcurrentModificationException"
"Analyze this stack trace and suggest a fix"

```

## Steering

[Steering](/docs/steering) allows you to provide Kiro with project specific context and guidelines. Kiro can generate steering files which you can refine:

1. Product brief (product.md) - Contains information about the product, its purpose, and key features
2. Technical Stack (tech.md) - Details the technologies, frameworks, and development guidelines
3. Project Structure (structure.md) - Provides information about how the project is organized

For Java projects, you can create additional custom steering files to provide more specific guidance:

### Creating custom steering files

Use the following instructions to add new steering documents to your project.

**To add new steering documents**

1. Navigate to the Kiro view in the sidebar.
2. In the Agent Steering section, choose the + button to create a new steering file.
3. Enter a name for your file with a descriptive title.
4. Add your custom steering content following markdown conventions.

Custom steering files are stored in the `.kiro/steering/` directory and are automatically recognized by Kiro during interactions.

### Project-specific conventions

Create a `java-conventions.md` steering file to define your team's specific practices and architectural decisions:

```markdown
# Java Project Conventions

## Architecture Patterns
- Use hexagonal architecture for complex domains
- Implement CQRS for read/write separation when needed
- Apply Domain-Driven Design principles for business logic

## Testing Strategy
- Write unit tests for all business logic
- Use TestContainers for integration tests
- Maintain 80% code coverage minimum
- Follow the AAA pattern (Arrange, Act, Assert)

## Error Handling
- Use custom exceptions for business logic errors
- Implement global exception handlers with @ControllerAdvice
- Log errors with correlation IDs for traceability
- Return consistent error response formats

## Performance Guidelines
- Use connection pooling for database access
- Implement caching strategies for frequently accessed data
- Use async processing for long-running operations
- Monitor and optimize database queries

```

This type of steering provides Kiro with context about your specific architectural decisions and practices, rather than basic code formatting which is better handled by automated tools like Checkstyle or Spotless.

### Framework specific guidelines

For Spring Boot projects, create a `spring-boot-patterns.md` steering file:

```markdown
# Spring Boot Development Guidelines

## Component Structure
- Use @RestController for REST endpoints
- Use @Service for business logic
- Use @Repository for data access
- Use @Component for other beans

## Dependency Injection
- Prefer constructor injection over field injection
- Use final fields for injected dependencies
- Avoid circular dependencies

## API Design
- Follow REST principles for endpoint design
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate HTTP status codes
- Use DTOs for request/response objects

```

These steering files help Kiro generate code that follows your team's specific conventions and best practices.

## Agent hooks

Kiro's [agent hooks](/docs/hooks) can automate common Java development tasks. For example, you can create hooks that:

- Automatically generate JUnit tests when you save a Java file
- Run code quality checks with Checkstyle or SpotBugs
- Check for outdated Maven or Gradle dependencies
- Generate or update JavaDoc comments for public methods
- Validate Spring Boot configuration files
- Format code with Google Java Format or similar tools

## MCP servers

Kiro's support for Model Context Protocol (MCP) servers enhance your Java development experience by providing specialized tools and capabilities. For a complete guide on setting up and using MCP, see the [MCP documentation](/docs/mcp).

#### Maven MCP server

The Maven MCP server allows you to manage Maven projects directly within Kiro:

```json
{
  "mcpServers": {
    "maven": {
      "command": "uvx",
      "args": ["maven-mcp-server@latest"]
    }
  }
}

```

With this server configured, you can:

- Run Maven commands with Kiro
- Get AI powered explanations for build issues
- Manage dependencies and project configuration

Example usage:

```
"Run Maven tests for my project"
"Add Spring Boot starter dependencies to my pom.xml"

```

#### Additional useful MCP servers

Explore more MCP servers in the [AWS MCP Servers](https://awslabs.github.io/mcp/) and [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) collection.

## Debugging issues

When you encounter issues, Kiro can help diagnose and fix them:

1. Inline Chat:
  - Type Cmd/Ctrl + I to open the inline chat.
  - Ask Kiro to explain specific errors or suggest fixes for the current code.
2. Add to Chat:
  - Type Cmd/Ctrl + L to add the current file to the chat.
  - Ask Kiro to analyze the entire file for potential issues or improvements.
3. Quick Fix:
  - Hover on an error or warning, then select Quick fix and Ask Kiro.
  - Kiro will automatically add the code to the chat and start debugging.

## Resources

- Java Documentation
- Spring Framework Documentation
- Spring Boot Documentation
- Maven Documentation
- Gradle Documentation