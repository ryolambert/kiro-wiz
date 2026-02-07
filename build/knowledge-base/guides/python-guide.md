---
title: "Python - IDE - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/guides/languages-and-frameworks/python-guide/"
category: "guides"
lastUpdated: "2026-02-07T05:52:08.403Z"
---
# Python

---

Kiro provides powerful AI-assisted development capabilities for Python projects, helping you write, debug, and maintain code more efficiently.

## Prerequisites

Before diving into Python development with Kiro, ensure you have:

- Python: Install the latest version for your platform (Python 3.8+ recommended)
- pip: Package installer for Python (comes with Python)
- Virtual Environment: Use venv, virtualenv, or conda for dependency management
- Git: For version control and collaboration

## Extensions

Kiro supports extensions from Open VSX that can enhance your Python development experience. Here are some helpful extensions you can install:

- Python - Python language support with extension access points for IntelliSense, Debugging (Python Debugger), linting, formatting, refactoring, unit tests, and more.
- PyLint - Linting support for Python files.
- Jupyter - Jupyter notebook support, interactive programming and computing that supports Intellisense, debugging and more.
- Python Debugger - Python debugger (debugpy) extension providing debugging capabilities for Python applications.
- Rainbow CSV - Highlight CSV and TSV files, Run SQL-like queries

You can install these extensions in Kiro, use the Extensions panel and search for the extension names listed above.

## Working with your environment

With Kiro, you can leverage the chat capabilities to setup a new project or work on an existing one.

### Project configuration and structure

Kiro can help you set up and maintain configuration files for your Python projects, and organize your project following Python best practices.

- Initialize configuration files: Ask Kiro to initialize default configuration files based on the project.
- Create project structure: Ask Kiro to create the structure of your project based on needs and best practices.

Example prompts:

```
"Set up a requirements.txt with development dependencies"
"Configure a .env file for my Django application"
"Set up a Python package structure with proper __init__.py files"
"Create a Flask project structure with blueprints"
"Organize my data science project with notebooks and modules"
"Create a pyproject.toml for a FastAPI project with pytest and black"

```

### Code analysis and refactoring

Kiro can analyze your Python code to identify issues and suggest improvements:

- Code Quality Analysis: Ask Kiro to review your code for potential bugs, performance issues, or PEP 8 compliance
- Refactoring Assistance: Get help extracting functions, renaming variables, or restructuring code
- Type Hints: Kiro can suggest type annotations to improve code clarity and catch errors

Example prompts:

```
"Analyze this function for potential bugs and performance issues"
"Refactor this code to follow PEP 8 style guidelines"
"Add type hints to this Python module"
"Convert this synchronous code to use async/await"

```

### Debugging assistance

When you encounter errors in your Python code:

- Error Explanation: Kiro can explain Python tracebacks and error messages in plain language
- Solution Suggestions: Get actionable fixes for common Python errors
- Runtime Debugging: Kiro can help set up debugging configurations and breakpoints

Examples:

```
"Explain this Python error: AttributeError: 'NoneType' object has no attribute 'split'"
"Help me debug this Django view that's returning a 500 error"
"Why is my pandas DataFrame operation so slow?"

```

## Steering

[Steering](/docs/steering) allows you to provide Kiro with project specific context and guidelines. Kiro can generate steering files which you can refine:

1. Product brief (product.md) - Contains information about the product, its purpose, and key features
2. Technical Stack (tech.md) - Details the technologies, frameworks, and development guidelines
3. Project Structure (structure.md) - Provides information about how the project is organized

For Python projects, you can create additional custom steering files to provide more specific guidance:

### Creating custom steering files

Use the following instructions to add new steering documents to your project.

**To add new steering documents**

1. Navigate to the Kiro view in the sidebar.
2. In the Agent Steering section, choose the + button to create a new steering file.
3. Enter a name for your file with a descriptive title.
4. Add your custom steering content following markdown conventions.

Custom steering files are stored in the `.kiro/steering/` directory and are automatically recognized by Kiro during interactions.

### Code style and conventions

For example, you can define custom naming conventions, file structure, or practices for your project.
Create a `python-conventions.md` steering file to define your team's coding standards:

```markdown
Python Conventions

Naming Conventions
- Use snake_case for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain purpose

Code Style
- Follow PEP 8 guidelines
- Use Black for code formatting
- Maximum line length of 88 characters
- Use type hints for all public functions

File Structure
- One class per file for large classes
- Group related functions in modules
- Use __init__.py files for package organization
- Separate tests in tests/ directory

Documentation
- Use docstrings for all public functions and classes
- Follow Google or NumPy docstring style
- Include type information in docstrings

```

### Framework specific guidelines

For Django projects, create a `django-patterns.md` steering file:

```markdown
Django Development Guidelines

Model Design
- Use descriptive model names
- Add __str__ methods to all models
- Use model managers for complex queries
- Follow Django naming conventions for fields

View Structure
- Prefer class-based views for complex logic
- Use function-based views for simple operations
- Keep business logic in models or services
- Use proper HTTP status codes

Template Organization
- Use template inheritance effectively
- Keep templates DRY with includes and tags
- Use meaningful template names
- Organize templates by app

Performance Best Practices
- Use select_related and prefetch_related for queries
- Implement database indexing for frequently queried fields
- Use caching for expensive operations
- Profile database queries in development

```

For data science projects, create a `data-science-patterns.md` steering file:

```markdown
Data Science Development Guidelines

Notebook Organization
- Use clear section headers and markdown cells
- Keep notebooks focused on single analyses
- Export reusable code to Python modules
- Include data source documentation

Data Handling
- Validate data quality early in pipelines
- Use consistent column naming conventions
- Document data transformations clearly
- Handle missing values explicitly

Model Development
- Use cross-validation for model evaluation
- Track experiments with clear versioning
- Document model assumptions and limitations
- Implement proper train/validation/test splits

Code Organization
- Separate data processing, modeling, and visualization
- Use configuration files for parameters
- Implement logging for long-running processes
- Create reproducible environments with requirements files

```

These steering files help Kiro generate code that follows your team's specific conventions and best practices.

## Agent hooks

Kiro's [agent hooks](/docs/hooks) can automate common Python development tasks:

1. Navigate to the Agent Hooks section in the Kiro panel
2. Click the + button to create a new hook
3. Define the hook workflow in natural language

Here are some hook examples:

### Test generation Hook

Automatically generate tests when you save a Python file:

```
"Create a hook that generates pytest tests when I save a new Python module"

```

### Dependency update Hook

Keep your dependencies up to date:

```
"Create a hook that checks for outdated pip packages and suggests updates"

```

### Linting Hook

```
When a Python file is saved:
1. Run flake8 or pylint on the file
2. Report any style or quality issues
3. Suggest fixes for common problems
4. Update docstrings if missing

```

### Virtual environment Hook

```
When requirements.txt or pyproject.toml is modified:
1. Check if virtual environment is activated
2. Install or update dependencies automatically
3. Report any dependency conflicts
4. Update requirements-dev.txt if needed

```

## Documentation access with #docs

Kiro provides built-in access to documentation for Python and popular frameworks through the `#docs` reference system. This allows you to quickly bring relevant documentation into your conversations with Kiro.
Simply type `#docs` in the chat and select from the available documentation sources, such as:

- #Python - Python language documentation
- #Pytorch - PyTorch framework documentation
- #PySide6 - Python library for creating GUI

Example usage:

```
"#Python How do I use context managers effectively?"
"#Pytorch how can I add a custom operator?"
"#PySide6 What is the best way to add a button?"

```

You can also reference specific documentation URLs using `#URL`:

```
"#URL https://docs.python.org/3/library/asyncio.html"

```

## Debugging issues

When you encounter issues, Kiro can help diagnose and fix them:

1. Inline Chat:
  - Type Cmd/Ctrl + I to open the inline chat.
  - Ask Kiro to help debug your code with natural language.
2. Add to Chat:
  - Type Cmd/Ctrl + L to add the current file to the chat.
  - Ask Kiro to help debug your code with natural language.
3. Quick Fix:
  - Hover on an error or warning, then select Quick fix and Ask Kiro.
  - Kiro will automatically add the code to the chat and start debugging.

## Resources

- Python Documentation
- Python Package Index (PyPI)
- Python Enhancement Proposals (PEPs)