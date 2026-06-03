import os
import pytest
from tools.document import binary_document_to_markdown, document_path_to_markdown


class TestBinaryDocumentToMarkdown:
    # Define fixture paths
    FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")
    DOCX_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.docx")
    PDF_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.pdf")

    def test_fixture_files_exist(self):
        """Verify test fixtures exist."""
        assert os.path.exists(self.DOCX_FIXTURE), (
            f"DOCX fixture not found at {self.DOCX_FIXTURE}"
        )
        assert os.path.exists(self.PDF_FIXTURE), (
            f"PDF fixture not found at {self.PDF_FIXTURE}"
        )

    def test_binary_document_to_markdown_with_docx(self):
        """Test converting a DOCX document to markdown."""
        # Read binary content from the fixture
        with open(self.DOCX_FIXTURE, "rb") as f:
            docx_data = f.read()

        # Call function
        result = binary_document_to_markdown(docx_data, "docx")

        # Basic assertions to check the conversion was successful
        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result

    def test_binary_document_to_markdown_with_pdf(self):
        """Test converting a PDF document to markdown."""
        # Read binary content from the fixture
        with open(self.PDF_FIXTURE, "rb") as f:
            pdf_data = f.read()

        # Call function
        result = binary_document_to_markdown(pdf_data, "pdf")

        # Basic assertions to check the conversion was successful
        assert isinstance(result, str)
        assert len(result) > 0
        # Check for typical markdown formatting - this will depend on your actual test file
        assert "#" in result or "-" in result or "*" in result


class TestDocumentPathToMarkdown:
    FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")
    DOCX_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.docx")
    PDF_FIXTURE = os.path.join(FIXTURES_DIR, "mcp_docs.pdf")

    def test_converts_pdf(self):
        """Converts a PDF at the given path to markdown."""
        result = document_path_to_markdown(self.PDF_FIXTURE)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_converts_docx(self):
        """Converts a DOCX at the given path to markdown."""
        result = document_path_to_markdown(self.DOCX_FIXTURE)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_matches_binary_conversion_pdf(self):
        """Path-based output equals binary-based output for the same PDF."""
        with open(self.PDF_FIXTURE, "rb") as f:
            expected = binary_document_to_markdown(f.read(), "pdf")
        assert document_path_to_markdown(self.PDF_FIXTURE) == expected

    def test_matches_binary_conversion_docx(self):
        """Path-based output equals binary-based output for the same DOCX."""
        with open(self.DOCX_FIXTURE, "rb") as f:
            expected = binary_document_to_markdown(f.read(), "docx")
        assert document_path_to_markdown(self.DOCX_FIXTURE) == expected

    def test_uppercase_extension(self, tmp_path):
        """Handles uppercase file extensions (case-insensitive)."""
        with open(self.PDF_FIXTURE, "rb") as f:
            data = f.read()
        upper_path = tmp_path / "doc.PDF"
        upper_path.write_bytes(data)
        result = document_path_to_markdown(str(upper_path))
        assert isinstance(result, str)
        assert len(result) > 0

    def test_missing_file_raises_file_not_found(self):
        """Raises FileNotFoundError when the path does not exist."""
        with pytest.raises(FileNotFoundError):
            document_path_to_markdown("/nonexistent/path/file.pdf")

    def test_unsupported_extension_raises(self, tmp_path):
        """Raises an error for unsupported file types."""
        path = tmp_path / "image.png"
        path.write_bytes(b"\x89PNG\r\n\x1a\n")
        with pytest.raises(Exception):
            document_path_to_markdown(str(path))

    def test_no_extension_raises(self, tmp_path):
        """Raises an error when the path has no extension to infer the file type from."""
        path = tmp_path / "noext"
        path.write_bytes(b"some content")
        with pytest.raises(Exception):
            document_path_to_markdown(str(path))
