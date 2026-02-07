---
title: "Concepts - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/specs/concepts/"
category: "specs"
lastUpdated: "2026-02-07T05:52:00.553Z"
---
# Concepts

---

Specs bridge the gap between conceptual product requirements and technical implementation details, ensuring alignment and reducing development iterations. Kiro generates three key files that form the foundation of each specification:

- requirements.md - Captures user stories and acceptance criteria in structured EARS notation
- design.md - Documents technical architecture, sequence diagrams, and implementation considerations
- tasks.md - Provides a detailed implementation plan with discrete, trackable tasks

## Workflow

The workflow follows a logical progression with decision points between phases, ensuring each step is properly completed before moving to the next.

- Requirements Phase (leftmost section): Define user stories and acceptance criteria in structured EARS notation
- Design Phase (second section): Document the technical architecture, sequence diagrams, and implementation considerations
- Implementation Planning (third section): Break down the work into discrete, trackable tasks with clear descriptions and outcomes
- Execution Phase (rightmost section): Track progress as tasks are completed, with the ability to update and refine the spec as needed

## Requirements

The `requirements.md` file is written in the form of user stories with acceptance criteria in EARS notation. The way you wish your PM would give you requirements!

EARS (Easy Approach to Requirements Syntax) notation provides a structured format for writing clear, testable requirements. In a spec's requirements.md file, each requirement follows this pattern:

```
WHEN [condition/event]
THE SYSTEM SHALL [expected behavior]

```

For example:

```
WHEN a user submits a form with invalid data
THE SYSTEM SHALL display validation errors next to the relevant fields

```

This structured approach offers several benefits:

- Clarity: Requirements are unambiguous and easy to understand
- Testability: Each requirement can be directly translated into test cases
- Traceability: Individual requirements can be tracked through implementation
- Completeness: The format encourages thinking through all conditions and behaviors

Kiro helps you transform vague feature requests into these well-structured requirements, making the development process more efficient and reducing misunderstandings between product and engineering teams.

## Design

Loading image...

The `design.md` file is where you document technical architecture, sequence diagrams, and implementation considerations. It's a great place to capture the big picture of how the system will work, including the components and their interactions.

Kiro's specs offer a structured approach to design documentation, making it easier to understand and collaborate on complex systems. The design.md file is a great place to capture the big picture of how the system will work, including the components and their interactions.

## Implementation plan

The `tasks.md` file is where you provide a detailed implementation plan with discrete, trackable tasks and sub-tasks. Each task is clearly defined, with a clear description, expected outcome, and any necessary resources or dependencies. Kiro's specs offer a structured approach to implementation plans, making it easier to understand and collaborate on complex systems.

Kiro provides a task execution interface for `tasks.md` files that displays real-time status updates. Tasks are updated as in-progress or completed, allowing you to efficiently track implementation progress and maintain an up-to-date view of your development status.

Loading image...