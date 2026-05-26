# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup
uv venv
uv pip install -e .

# Run MCP server
uv run main.py

# Run all tests
uv run pytest

# Run a single test
uv run pytest tests/test_document.py::TestBinaryDocumentToMarkdown::test_binary_document_to_markdown_with_docx
```

## Architecture

This is an MCP (Model Context Protocol) server built with `FastMCP`. The entry point is `main.py`, which instantiates the server and registers tools. Tools are plain Python functions defined in `tools/` and registered via `mcp.tool()(fn)`.

There is no auto-discovery: a function in `tools/` is only exposed if `main.py` imports it and calls `mcp.tool()(fn)`.

**Adding a new tool:**
1. Define the function in `tools/<module>.py`
2. Import it in `main.py` and call `mcp.tool()(my_function)`

## Code Style

- Always annotate all function argument types and return types.

## Defining MCP Tools

Tools are plain Python functions. FastMCP derives the tool's name, description, and parameter schema directly from the function — no decorator arguments needed.

**Docstring format** (used verbatim as the tool description shown to the AI):
```python
def my_tool(...) -> ReturnType:
    """One-line summary.

    Detailed explanation of what it does.

    When to use:
    - Situation A
    - Situation B

    Examples:
    >>> my_tool("input")
    "output"
    """
```

**Parameter descriptions** use `pydantic.Field` as the default value — this is how parameter metadata reaches the MCP schema:
```python
from pydantic import Field

def my_tool(
    param1: str = Field(description="What this param controls"),
    param2: int = Field(description="What this param controls"),
) -> str:
    ...
```

`Field` must be used (not inline comments or docstring args sections) because FastMCP reads the Pydantic model schema to build the tool's input schema. The return type annotation determines the output schema.

**Registration** in `main.py`:
```python
from tools.my_module import my_tool
mcp.tool()(my_tool)
```

The tool name exposed to the AI is the function name; rename the function to rename the tool.
