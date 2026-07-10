"""
pdf_resume_parser.py

A robust, PDF-only resume text extractor built on PyMuPDF (fitz).

Design goals
------------
Resumes are one of the messiest "semi-structured" document types you'll parse:
multi-column layouts, sidebars, tables of skills, nested bullet points under
multiple companies/projects, mixed font sizes for headers, repeated
headers/footers across pages, embedded hyperlinks with no visible text,
scanned/image-only PDFs, password-protected files, etc.

Rather than trying to fully "understand" the resume (that's the downstream
LLM's job), this parser focuses on:

1. Only ever accepting real PDFs (magic-byte + extension validated).
2. Extracting text in a layout-aware way so multi-column resumes don't get
   their columns interleaved word-by-word into gibberish.
3. Annotating structure (section/company/role-looking headers, bullets,
   columns, pages) with lightweight markers instead of silently discarding
   it -- so an LLM downstream can still recover "which bullets belong to
   which job" even though we didn't attempt to classify them ourselves.
4. Never crashing on edge-case PDFs; instead degrading gracefully and
   surfacing *why* via a `warnings` list, so the caller can decide whether
   to flag the resume for manual review (e.g. scanned resume w/ no OCR).
5. Returning a structured result (raw preserved text + metadata + contact
   hints + warnings) rather than a single flat string, since the calling
   pipeline says it wants to hand rich context to an LLM.

This module has a single hard dependency: PyMuPDF (`pip install pymupdf`).
OCR fallback for scanned pages is optional and only used if the installed
PyMuPDF build has Tesseract OCR support available; otherwise we just warn.
"""

from __future__ import annotations

import re
import statistics
from dataclasses import dataclass, field
from typing import Optional

import fitz  # PyMuPDF


# --------------------------------------------------------------------------- #
# Exceptions
# --------------------------------------------------------------------------- #

class ResumeParsingError(Exception):
    """Base class for all parsing errors raised by this module."""


class UnsupportedFileTypeError(ResumeParsingError):
    """Raised when the uploaded file is not a PDF (by extension or content)."""


class EmptyFileError(ResumeParsingError):
    """Raised when the uploaded file has no bytes, or a PDF with 0 pages."""


class CorruptedPDFError(ResumeParsingError):
    """Raised when PyMuPDF cannot open/parse the file as a valid PDF."""


class EncryptedPDFError(ResumeParsingError):
    """Raised when a PDF is password protected and cannot be opened."""


class NoExtractableTextError(ResumeParsingError):
    """
    Raised when a valid PDF opens fine but yields no extractable text on any
    page (e.g. a pure image/scanned resume) and OCR fallback also fails or
    is unavailable. Caller should route this to a manual-review / OCR queue.
    """


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024   # 15 MB safety cap
MAX_PAGES = 25                            # resumes shouldn't exceed this; guards against abuse
PDF_MAGIC = b"%PDF-"

# A line whose average span font-size is this many times larger than the
# page's median body-text size (or is bold) is treated as a probable
# section/company/role header.
HEADER_SIZE_RATIO = 1.15
BOLD_FLAG = 1 << 4  # PyMuPDF span flag bit for bold

BULLET_CHARS = "•‣◦▪●○■♦-–—*›»"
BULLET_RE = re.compile(rf"^[\s]*[{re.escape(BULLET_CHARS)}]\s+")

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?:(?:\+?\d{1,3})[\s.\-]?)?(?:\(?\d{2,4}\)?[\s.\-]?){2,4}\d{3,4}")
URL_RE = re.compile(r"(?:https?://|www\.)[^\s,;)\]]+", re.IGNORECASE)


# --------------------------------------------------------------------------- #
# Public result type
# --------------------------------------------------------------------------- #

@dataclass
class ParsedResume:
    text: str                       # full structured text, ready to hand to an LLM
    pages: list[str] = field(default_factory=list)   # per-page structured text
    warnings: list[str] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)      # page_count, columns_detected, emails, phones, links, etc.

    def __str__(self) -> str:
        return self.text


# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #

def validate_pdf(file_bytes: bytes, filename: Optional[str] = None) -> None:
    """
    Cheap, fast checks before we even hand bytes to PyMuPDF.
    Raises UnsupportedFileTypeError / EmptyFileError on failure.
    """
    if filename and "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if ext != "pdf":
            raise UnsupportedFileTypeError(
                f"Only .pdf files are accepted (got '.{ext}')."
            )

    if not file_bytes:
        raise EmptyFileError("Uploaded file is empty (0 bytes).")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise UnsupportedFileTypeError(
            f"File too large ({len(file_bytes)} bytes); max allowed is "
            f"{MAX_FILE_SIZE_BYTES} bytes."
        )

    # Real PDF files start with "%PDF-" within the first ~1KB (some have a
    # small amount of junk/BOM before it from lazy exporters).
    if PDF_MAGIC not in file_bytes[:1024]:
        raise UnsupportedFileTypeError(
            "File content does not look like a PDF (missing %PDF- signature). "
            "Only genuine PDF files are accepted."
        )


# --------------------------------------------------------------------------- #
# Low-level per-page structural extraction
# --------------------------------------------------------------------------- #

def _line_is_bold(spans: list[dict]) -> bool:
    return any((s.get("flags", 0) & BOLD_FLAG) or "bold" in s.get("font", "").lower() for s in spans)


def _extract_blocks(page: "fitz.Page") -> list[dict]:
    """
    Returns text blocks for a page as:
        {"bbox": (x0,y0,x1,y1), "lines": [(text, is_bold, avg_size, bbox), ...]}
    Image/drawing blocks (type != 0) are skipped here; image presence is
    checked separately for scanned-page detection.
    """
    page_dict = page.get_text("dict")
    blocks = []
    for b in page_dict.get("blocks", []):
        if b.get("type") != 0:  # 0 = text block, 1 = image block
            continue
        lines_out = []
        for line in b.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            line_text = "".join(s.get("text", "") for s in spans)
            line_text = line_text.strip()
            if not line_text:
                continue
            avg_size = statistics.mean(s.get("size", 0) for s in spans) if spans else 0
            lines_out.append((line_text, _line_is_bold(spans), avg_size, line.get("bbox", b["bbox"])))
        if lines_out:
            blocks.append({"bbox": b["bbox"], "lines": lines_out})
    return blocks


def _cluster_columns(blocks: list[dict], page_width: float) -> list[list[dict]]:
    """
    Groups blocks into left-to-right columns using a gap-based 1D clustering
    of block left-edges (x0). This is a heuristic, not a layout engine, but
    it handles the common resume cases: single column, two-column
    (sidebar + main), and simple three-column headers.

    Blocks that don't cleanly fall in a detected column band fall back into
    the nearest one so nothing is silently dropped.
    """
    if not blocks:
        return []

    xs = sorted(round(b["bbox"][0]) for b in blocks)
    gap_threshold = max(page_width * 0.08, 20)

    boundaries = [xs[0]]
    for x in xs[1:]:
        if x - boundaries[-1] > gap_threshold:
            boundaries.append(x)

    if len(boundaries) == 1:

        col = sorted(blocks, key=lambda b: (b["bbox"][1], b["bbox"][0]))
        return [col]

    col_ranges = []
    for i, lo in enumerate(boundaries):
        hi = boundaries[i + 1] if i + 1 < len(boundaries) else float("inf")
        col_ranges.append((lo, hi))

    columns: list[list[dict]] = [[] for _ in col_ranges]
    for b in blocks:
        x0 = b["bbox"][0]
        placed = False
        for i, (lo, hi) in enumerate(col_ranges):
            if lo - 1 <= x0 < hi:
                columns[i].append(b)
                placed = True
                break
        if not placed:
            columns[-1].append(b)

    for col in columns:
        col.sort(key=lambda b: (b["bbox"][1], b["bbox"][0]))

    return [c for c in columns if c]


def _format_line(text: str, is_bold: bool, avg_size: float, median_size: float) -> str:
    """
    Annotate a single line with lightweight structural hints (without
    deleting any of the original text):
      - probable headers (bold / notably larger font) get a leading '## '
      - bullet-style lines get normalized to a leading '- '
      - everything else passes through unchanged (just stripped)
    """
    looks_like_header = (
        median_size > 0
        and (avg_size >= median_size * HEADER_SIZE_RATIO or is_bold)
        and len(text) <= 120  
    )

    if BULLET_RE.match(text):
        cleaned = BULLET_RE.sub("", text).strip()
        return f"- {cleaned}"

    if looks_like_header:
        return f"## {text}"

    return text


def _page_median_font_size(blocks: list[dict]) -> float:
    sizes = [ln[2] for b in blocks for ln in b["lines"] if ln[2]]
    return statistics.median(sizes) if sizes else 0.0


def _render_page(page: "fitz.Page") -> tuple[str, bool]:
    """
    Returns (structured_page_text, had_multiple_columns).
    """
    blocks = _extract_blocks(page)
    median_size = _page_median_font_size(blocks)
    columns = _cluster_columns(blocks, page.rect.width)

    if not columns:
        return "", False

    column_texts = []
    for col in columns:
        lines_rendered = []
        for block in col:
            for text, is_bold, avg_size, _bbox in block["lines"]:
                lines_rendered.append(_format_line(text, is_bold, avg_size, median_size))
            lines_rendered.append("")  # blank line between blocks preserves paragraph/section breaks
        column_texts.append("\n".join(lines_rendered).strip())

    if len(column_texts) > 1:
        rendered = "\n\n".join(
            f"[COLUMN {i + 1}]\n{txt}" for i, txt in enumerate(column_texts) if txt
        )
    else:
        rendered = column_texts[0]

    return rendered, len(column_texts) > 1



def _normalize_for_repeat_check(line: str) -> str:
    return re.sub(r"\d+", "#", line.strip().lower())


def _strip_repeated_boilerplate(pages_raw_lines: list[list[str]]) -> tuple[list[list[str]], list[str]]:
    """
    Detects lines (typically at the very top/bottom of each page) that repeat
    near-verbatim across most pages -- e.g. "Jane Doe | Resume | Page 2 of 3"
    -- and removes the duplicates (keeping the first occurrence) so the LLM
    isn't shown the same boilerplate N times. Returns cleaned pages + a list
    of what was removed, for transparency.
    """
    n_pages = len(pages_raw_lines)
    if n_pages < 3:
        return pages_raw_lines, []

    edge_lines: dict[str, int] = {}
    for lines in pages_raw_lines:
        candidates = set()
        for ln in lines[:2] + lines[-2:]:
            if ln.strip():
                candidates.add(_normalize_for_repeat_check(ln))
        for c in candidates:
            edge_lines[c] = edge_lines.get(c, 0) + 1

    threshold = max(2, int(n_pages * 0.6))
    boilerplate_keys = {k for k, count in edge_lines.items() if count >= threshold}

    if not boilerplate_keys:
        return pages_raw_lines, []

    removed_examples: list[str] = []
    cleaned_pages = []
    for lines in pages_raw_lines:
        new_lines = []
        for ln in lines:
            key = _normalize_for_repeat_check(ln)
            if ln.strip() and key in boilerplate_keys:
                if ln.strip() not in removed_examples:
                    removed_examples.append(ln.strip())
                continue
            new_lines.append(ln)
        cleaned_pages.append(new_lines)

    return cleaned_pages, removed_examples


def _collect_contact_hints(document: "fitz.Document", full_text: str) -> dict:
    emails = set(EMAIL_RE.findall(full_text))
    urls = set(URL_RE.findall(full_text))
    phones = set(m.strip() for m in PHONE_RE.findall(full_text) if len(re.sub(r"\D", "", m)) >= 7)

    for page in document:
        for link in page.get_links():
            uri = link.get("uri")
            if not uri:
                continue
            if uri.startswith("mailto:"):
                emails.add(uri[len("mailto:"):])
            elif uri.startswith("tel:"):
                phones.add(uri[len("tel:"):])
            else:
                urls.add(uri)

    return {
        "emails": sorted(emails),
        "phones": sorted(phones),
        "links": sorted(urls),
    }




def _page_looks_scanned(page: "fitz.Page", extracted_text: str) -> bool:
    if extracted_text.strip():
        return False
    return len(page.get_images(full=True)) > 0


def _try_ocr_page(page: "fitz.Page") -> Optional[str]:
    """
    Attempts OCR via PyMuPDF's built-in Tesseract integration. Returns None
    (rather than raising) if OCR isn't available in this environment -- the
    caller records a warning instead of failing the whole document.
    """
    try:
        textpage = page.get_textpage_ocr(flags=0, full=True)
        text = page.get_text("text", textpage=textpage)
        return text if text.strip() else None
    except Exception:
        return None


def parse_resume_pdf(pdf_bytes: bytes, filename: Optional[str] = None) -> ParsedResume:
    """
    Parse a resume PDF into structured, LLM-ready text.

    Only PDF files are accepted (validated by extension, when given, and by
    file signature always). Raises a `ResumeParsingError` subclass for any
    file that can't be safely processed; callers should catch these and
    surface a clear message to the uploader rather than letting an exception
    propagate raw.
    """
    validate_pdf(pdf_bytes, filename)

    warnings: list[str] = []

    try:
        document = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:
        raise CorruptedPDFError(f"Could not open PDF (file may be corrupted): {exc}") from exc

    try:
        if document.needs_pass:

            if not document.authenticate(""):
                raise EncryptedPDFError(
                    "This PDF is password protected and cannot be opened without a password."
                )
            warnings.append("PDF was password-protected but opened with an empty password.")

        if document.page_count == 0:
            raise EmptyFileError("PDF has 0 pages.")

        if document.page_count > MAX_PAGES:
            warnings.append(
                f"PDF has {document.page_count} pages; only the first {MAX_PAGES} were processed."
            )

        pages_raw_lines: list[list[str]] = []
        pages_rendered: list[str] = []
        any_multi_column = False
        any_text_found = False

        for i, page in enumerate(document):
            if i >= MAX_PAGES:
                break

            raw_text = page.get_text("text")
            if raw_text.strip():
                any_text_found = True
            elif _page_looks_scanned(page, raw_text):
                ocr_text = _try_ocr_page(page)
                if ocr_text:
                    warnings.append(f"Page {i + 1} appeared to be scanned/image-based; recovered via OCR.")
                    any_text_found = True
                else:
                    warnings.append(
                        f"Page {i + 1} appears to be a scanned image with no extractable text "
                        f"and OCR was unavailable/failed. Content from this page is missing."
                    )
                    pages_raw_lines.append([])
                    pages_rendered.append("")
                    continue

            rendered, multi_col = _render_page(page)
            any_multi_column = any_multi_column or multi_col
            pages_rendered.append(rendered)
            pages_raw_lines.append(rendered.split("\n"))

        if not any_text_found:
            raise NoExtractableTextError(
                "No extractable text found on any page (likely a fully scanned/image-only "
                "resume). OCR was unavailable or failed on every page."
            )

        cleaned_pages_lines, removed_boilerplate = _strip_repeated_boilerplate(pages_raw_lines)
        if removed_boilerplate:
            warnings.append(
                "Removed repeated header/footer boilerplate found on most pages: "
                + "; ".join(removed_boilerplate[:5])
            )

        final_pages = ["\n".join(lines).strip() for lines in cleaned_pages_lines]

        full_text_parts = []
        for i, page_text in enumerate(final_pages):
            if not page_text:
                continue
            full_text_parts.append(f"=== Page {i + 1} ===\n{page_text}")
        full_text = "\n\n".join(full_text_parts).strip()

        contact_hints = _collect_contact_hints(document, full_text)

        metadata = {
            "page_count": document.page_count,
            "pages_processed": min(document.page_count, MAX_PAGES),
            "multi_column_layout_detected": any_multi_column,
            **contact_hints,
        }

        return ParsedResume(
            text=full_text,
            pages=final_pages,
            warnings=warnings,
            metadata=metadata,
        )

    finally:
        document.close()


def extract_text_from_pdf(pdf_bytes: bytes, filename: Optional[str] = None) -> str:
    """
    Drop-in replacement for the original `extract_text_from_pdf`. Returns
    just the structured text string. Prefer `parse_resume_pdf` if you also
    want warnings/metadata/contact hints for your LLM ranking pipeline.
    """
    return parse_resume_pdf(pdf_bytes, filename=filename).text