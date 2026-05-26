from pydantic import Field
from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.prompts import base
mcp = FastMCP("DocumentMCP", log_level="ERROR")


docs = {
    "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
    "report.pdf": "The report details the state of a 20m condenser tower.",
    "financials.docx": "These financials outline the project's budget and expenditures.",
    "outlook.pdf": "This document presents the projected future performance of the system.",
    "plan.md": "The plan outlines the steps for the project's implementation.",
    "spec.txt": "These specifications define the technical requirements for the equipment.",
}

# TODO: Write a tool to read a doc
@mcp.tool(
    name="read_doc_contents",
    description="Reads the contents of a document and return it as a string.",
)
def read_document(
    doc_id: str = Field(..., description="The id of the document to read.")
):
    if doc_id not in docs:
        return f"Document with id {doc_id} not found."
    return docs[doc_id]
# TODO: Write a tool to edit a doc
@mcp.tool(
    name="edit_document",
    description="Edits the contents of a document and return the updated contents as a string.",
)
def edit_document(
    doc_id: str = Field(..., description="The id of the document to edit."),
    old_contents: str = Field(..., description="The old contents of the document. Must match the current contents of the document."),
    new_contents: str = Field(..., description="The new contents of the document.")
):
    if doc_id not in docs:
        return f"Document with id {doc_id} not found."
    if docs[doc_id] != old_contents:
        return f"Contents of document {doc_id} do not match the expected old contents."
    docs[doc_id] = docs[doc_id].replace(old_contents, new_contents)
    return docs[doc_id]

# TODO: Write a resource to return all doc id's
@mcp.resource(
    "docs://documents",
    mime_type="application/json",
)
def list_docs() -> list[str]:
    return list(docs.keys())

# TODO: Write a resource to return the contents of a particular doc
@mcp.resource(
    "docs://documents/{doc_id}",
    mime_type="text/plain",
)
def get_doc_contents(doc_id: str) -> str:
    if doc_id not in docs:
        raise ValueError(f"Document with id {doc_id} not found.")
    return docs[doc_id]

# TODO: Write a prompt to rewrite a doc in markdown format

@mcp.prompt(
    "format",
    description="Rewrite a document in markdown format.",
)
def format_document(doc_id: str = Field(..., description="The id of the document to rewrite.")) -> list[base.Message]:
    prompt = f"""
    your goal is to reformat a document to be written in markdown format. Here is the document id: {doc_id}. Here are the current contents of the document: {docs[doc_id]}. Rewrite the document in markdown format.
    
    Add in headers, bullet points, tables, etc as necessary. Feel free to add in markdown formatting even if it wasn't in the original document to make the document more readable. The final response should just be the rewritten document in markdown format.
    Use the 'edit_document' tool to update the document contents with the new markdown formatted contents once you've rewritten the document.
    """
    return [
        base.UserMessage(prompt)
    ]


# TODO: Write a prompt to summarize a doc


if __name__ == "__main__":
    mcp.run(transport="stdio")
