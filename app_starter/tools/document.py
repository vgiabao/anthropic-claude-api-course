import os
from markitdown import MarkItDown, StreamInfo
from io import BytesIO
from pydantic import Field

SUPPORTED_EXTENSIONS = {"pdf", "docx", "doc"}


def binary_document_to_markdown(binary_data: bytes, file_type: str) -> str:
    """Converts binary document data to markdown-formatted text."""
    md = MarkItDown()
    file_obj = BytesIO(binary_data)
    stream_info = StreamInfo(extension=file_type)
    result = md.convert(file_obj, stream_info=stream_info)
    return result.text_content


def document_path_to_markdown(
    file_path: str = Field(description="Path to a PDF, DOCX, or DOC file on the local filesystem"),
) -> str:
    """Read a document from disk and convert its contents to markdown.

    Reads a PDF, DOCX, or DOC file from the given path and returns its
    content as markdown-formatted text. The file type is inferred from
    the path's extension (case-insensitive).

    When to use:
    - When you need the markdown content of a document available on disk
    - When you only have a file path (not the file's bytes) to work with

    Examples:
    >>> document_path_to_markdown("/tmp/report.pdf")
    "# Report\\n\\n..."
    >>> document_path_to_markdown("/tmp/notes.docx")
    "# Notes\\n\\n..."
    """
    _, ext = os.path.splitext(file_path)
    if not ext:
        raise ValueError(
            f"Cannot determine file type from path with no extension: {file_path}"
        )

    file_type = ext[1:].lower()
    if file_type not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '.{file_type}'. Supported types: "
            f"{sorted(SUPPORTED_EXTENSIONS)}"
        )

    with open(file_path, "rb") as f:
        binary_data = f.read()

    return binary_document_to_markdown(binary_data, file_type)
