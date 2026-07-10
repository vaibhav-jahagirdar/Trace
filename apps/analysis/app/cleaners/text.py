"""
cleaners/text.py

Deterministic, non-semantic text normalizer for the resume analysis pipeline.

Pipeline position
------------------
    PDF
      -> Validation
      -> PyMuPDF extraction   (produces structured, layout-aware text with
                                "=== Page N ===" page markers, "[COLUMN N]"
                                column markers, "## " probable-header lines,
                                and "- " normalized bullet lines)
      -> Text Cleaner          <-- this module
      -> Prompt Builder
      -> LLM
      -> Structured Resume JSON

Contract with the rest of the system
-------------------------------------
This module performs ONLY deterministic, reversible-in-spirit text
normalization. It never performs semantic analysis and MUST NOT:

    * infer, add, or guess any skill / technology / experience / concept
    * merge, split, reorder, or drop resume sections, companies, or projects
    * rewrite, paraphrase, summarize, or translate any wording
    * change the meaning of a single token

Its only job is to take the (sometimes very messy) text that PyMuPDF handed
back -- mixed line endings, OCR artifacts, stray control characters, curly
quotes, repeated punctuation used as visual dividers, inconsistent
whitespace, etc. -- and turn it into a clean, deterministic, token-efficient
string that is safe and predictable to feed into an LLM prompt.

Every transformation below is either:
    (a) purely cosmetic/whitespace normalization that carries no semantic
        information (e.g. collapsing 5 spaces into 1), or
    (b) a lossless *canonicalization* of a character that has many visually
        identical Unicode encodings (e.g. curly quotes vs straight quotes,
        en-dash vs hyphen, ligature "fi" vs "f" + "i"), which makes the
        output deterministic without deleting any information.

Nothing that could plausibly carry resume-relevant meaning (URLs, emails,
phone numbers, page/column markers, markdown-style headers, bullets,
numbered lists, hyphenated technology names like "Node.js" / "ASP.NET" /
"C++" / "C#") is altered in a way that would change how a human -- or an
LLM -- reads it.

Requires: Python 3.12+, standard library only (`re`, `unicodedata`).
"""

from __future__ import annotations

import re
import unicodedata
from re import Match, Pattern

__all__ = ["clean_text"]


# --------------------------------------------------------------------------- #
# Character classes
# --------------------------------------------------------------------------- #

# Zero-width / invisible formatting characters that occasionally survive PDF
# text extraction (soft line-break hints, BOM markers pasted mid-document by
# authoring tools, joiners used by some Unicode shaping engines). These carry
# no visible or semantic content, so they are safe to remove outright rather
# than "normalize" -- keeping them would make the output non-deterministic
# (two visually identical strings could compare unequal) without adding any
# information for the LLM.
_ZERO_WIDTH_CHARS = (
    "\u200b"  # ZERO WIDTH SPACE
    "\u200c"  # ZERO WIDTH NON-JOINER
    "\u200d"  # ZERO WIDTH JOINER
    "\u2060"  # WORD JOINER
    "\ufeff"  # ZERO WIDTH NO-BREAK SPACE / BOM
)

# Curly / smart quotes -> straight ASCII quotes. Quote *style* is a
# typographic rendering choice, not information; collapsing both quote
# styles to one canonical form makes downstream string matching (e.g. the
# prompt builder or LLM doing exact-match lookups on quoted text) reliable.
_QUOTE_MAP: dict[str, str] = {
    "\u2018": "'",  # LEFT SINGLE QUOTATION MARK
    "\u2019": "'",  # RIGHT SINGLE QUOTATION MARK (also common apostrophe glyph)
    "\u201a": "'",  # SINGLE LOW-9 QUOTATION MARK
    "\u201b": "'",  # SINGLE HIGH-REVERSED-9 QUOTATION MARK
    "\u201c": '"',  # LEFT DOUBLE QUOTATION MARK
    "\u201d": '"',  # RIGHT DOUBLE QUOTATION MARK
    "\u201e": '"',  # DOUBLE LOW-9 QUOTATION MARK
    "\u201f": '"',  # DOUBLE HIGH-REVERSED-9 QUOTATION MARK
    "\u00ab": '"',  # LEFT-POINTING DOUBLE ANGLE QUOTATION MARK (guillemet)
    "\u00bb": '"',  # RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK (guillemet)
}

# Unicode dash/minus variants -> ASCII hyphen-minus. Note this deliberately
# does NOT touch the ASCII "-" already used inside hyphenated technology
# names (Node.js, ASP.NET, C++, C# are unaffected since they contain no
# em/en dashes), and it does not touch "+" or "#". This only canonicalizes
# characters that are *visually* dashes so date ranges / bullet dashes look
# identical regardless of which dash glyph the original PDF used.
_DASH_MAP: dict[str, str] = {
    "\u2010": "-",  # HYPHEN
    "\u2011": "-",  # NON-BREAKING HYPHEN
    "\u2012": "-",  # FIGURE DASH
    "\u2013": "-",  # EN DASH
    "\u2014": "-",  # EM DASH
    "\u2015": "-",  # HORIZONTAL BAR
    "\u2212": "-",  # MINUS SIGN
}

# Common OCR/Unicode bullet glyphs that should be canonicalized to a single
# "- " marker so downstream section/bullet detection (and the LLM prompt)
# only ever has to reason about one bullet format. This list intentionally
# excludes digits and "." / ")" so numbered lists ("1.", "2)") are never
# touched -- numbering carries ordering information that must be preserved
# exactly as-is.
_BULLET_GLYPHS = "•‣◦▪▫●○■□♦❖➤➢➔→▶►·∙*"

# Punctuation characters that legitimately appear as long "visual divider"
# runs in poorly-formatted resumes (e.g. "------------------------" used as
# a section separator, or "...................." used as a leader between a
# label and a value). Repeated runs of 4+ identical characters from this set
# are collapsed to exactly 3, which preserves the *visual intent* (still
# reads as a divider) while capping token cost. Characters that participate
# in meaningful technology names or symbols (+, #, @, $, %, /, \) are
# deliberately excluded so "C++", "C#", "ASP.NET" etc. are never touched.
_COLLAPSIBLE_PUNCTUATION = "!?.,;:_~*=-"


# --------------------------------------------------------------------------- #
# Compiled regular expressions
# --------------------------------------------------------------------------- #
# All regexes are pre-compiled at import time. This module runs against
# every resume in a production pipeline handling thousands of documents, so
# repeated re.compile() calls inside the hot path are avoided entirely.

# Windows (\r\n) and old Mac (\r) line endings -> Unix (\n). Must run before
# any other line-based regex so every subsequent step can assume a single,
# predictable line-ending convention.
_RE_CRLF_OR_CR: Pattern[str] = re.compile(r"\r\n|\r")

# C0 control characters (0x00-0x1F) and the C1 control block (0x7F, and
# 0x80-0x9F) EXCLUDING tab (\x09) and newline (\x0A), which are handled by
# their own dedicated normalization steps. These are typically PDF/OCR
# extraction noise (stray SOH/STX/ESC bytes, form-feed remnants, etc.) with
# no visual representation and no semantic content.
_RE_CONTROL_CHARS: Pattern[str] = re.compile(
    "[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\x80-\x9f]"
)

# Form feed (\x0c) specifically represents an explicit "page/section break"
# signal some extractors emit. Rather than silently deleting that signal
# (which the generic control-character stripper would do), we convert it to
# a blank line *before* control-char stripping so the paragraph break it
# represents survives, then let the normal blank-line collapsing step cap
# how much space it takes up.
_RE_FORM_FEED: Pattern[str] = re.compile("\x0c")

_RE_ZERO_WIDTH: Pattern[str] = re.compile(f"[{_ZERO_WIDTH_CHARS}]")

# Non-breaking space -> regular space. NBSP is visually indistinguishable
# from a normal space but is a distinct code point; leaving it in place
# would make whitespace-collapsing regexes miss it and would make
# byte-for-byte comparisons in tests/caching unreliable.
_RE_NBSP: Pattern[str] = re.compile("\u00a0")

# Soft hyphen (U+00AD) is an invisible "optional break point" hint used by
# some PDF/typesetting engines inside long words. It renders as nothing in
# normal text and, if left in, can silently split a word in two when a
# resume is later tokenized (e.g. "develop\u00adment" -> looks fine visually
# but is NOT the same string as "development"). Safe to remove entirely.
_RE_SOFT_HYPHEN: Pattern[str] = re.compile("\u00ad")

_RE_QUOTES: Pattern[str] = re.compile("|".join(re.escape(k) for k in _QUOTE_MAP))
_RE_DASHES: Pattern[str] = re.compile("|".join(re.escape(k) for k in _DASH_MAP))

# Unicode ellipsis (single code point, U+2026) -> three ASCII periods. This
# is a canonicalization, not a content change: "…" and "..." render
# identically and mean the same thing.
_RE_ELLIPSIS: Pattern[str] = re.compile("\u2026")

# Tabs -> single space. Tab-stop rendering is a presentation detail that
# does not survive text extraction meaningfully anyway (PyMuPDF text mode
# does not preserve tab-stop columns), so treating a tab as "a whitespace
# separator" rather than "N columns of alignment" is the only defensible,
# deterministic interpretation.
_RE_TAB: Pattern[str] = re.compile("\t")

# Bullet glyph at the start of a line, followed by optional whitespace and
# then a word character. OCR/PDF extraction frequently drops the space
# between a bullet glyph and the text that follows it (e.g. "•Item1"), so
# the whitespace is optional rather than required. The lookahead requires
# the next non-space character to be alphanumeric/underscore specifically
# (not another punctuation/bullet character), which prevents a bare divider
# line made of the same repeated character (e.g. a row of "*" used as a
# separator) from being misclassified as a bullet.
_RE_BULLET: Pattern[str] = re.compile(
    rf"^[{re.escape(_BULLET_GLYPHS)}][ \t]*(?=\w)", flags=re.MULTILINE
)

# Runs of 4 or more identical "divider-style" punctuation characters ->
# exactly 3 of that character. Using a backreference keeps this a single
# linear regex pass instead of one pass per punctuation character.
_RE_REPEATED_PUNCTUATION: Pattern[str] = re.compile(
    rf"([{re.escape(_COLLAPSIBLE_PUNCTUATION)}])\1{{3,}}"
)

# Two or more horizontal whitespace characters -> single space. Runs after
# tabs have already been converted to spaces, so this only ever sees spaces.
_RE_REPEATED_SPACES: Pattern[str] = re.compile(" {2,}")

# Trailing whitespace on a line.
_RE_TRAILING_WS: Pattern[str] = re.compile(r"[ \t]+$", flags=re.MULTILINE)

# Leading whitespace on a line. PDF-extracted indentation reflects pixel
# position, not logical list nesting, and is not a reliable structural
# signal -- the pipeline's structural signals are the explicit "## " header,
# "- " bullet, "=== Page N ===", and "[COLUMN N]" markers produced upstream.
# Stripping leading whitespace removes extraction noise without discarding
# any information the rest of the pipeline actually depends on.
_RE_LEADING_WS: Pattern[str] = re.compile(r"^[ \t]+", flags=re.MULTILINE)

# Three or more consecutive newlines -> exactly two (i.e. cap blank-line
# runs at a single blank line). This bounds token usage from resumes with
# large vertical whitespace gaps (common right after OCR, or around page
# breaks) while still preserving the fact that *a* paragraph/section break
# existed.
_RE_EXCESS_BLANK_LINES: Pattern[str] = re.compile(r"\n{3,}")


# --------------------------------------------------------------------------- #
# Protected-token machinery (URLs, emails, phone numbers, structural markers)
# --------------------------------------------------------------------------- #
# These categories are explicitly called out as "must preserve" in the
# module contract. Rather than trusting every downstream regex to happen to
# leave them alone, we extract them into placeholders *before* any
# quote/dash/punctuation/whitespace normalization runs, and restore the
# original, byte-for-byte text back into those exact positions at the very
# end. This guarantees these tokens are never mutated, regardless of what
# future normalization steps get added to this module.

_URL_PATTERN = r"(?P<url>https?://[^\s<>\"'()\[\]{}]+|www\.[^\s<>\"'()\[\]{}]+)"
_EMAIL_PATTERN = r"(?P<email>[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})"

# Phone numbers: an optional country code, an optional parenthesized area
# code, then 2-4 groups of digits separated by space/dot/dash. The digit
# count is further validated in `_replace_protected_match` (9-15 digits)
# to avoid false-positives on things like employment date ranges
# ("2020 - 2023") that happen to match the same shape but are too short to
# plausibly be a phone number.
_PHONE_PATTERN = (
    r"(?P<phone>(?<!\w)"
    r"(?:\+\d{1,3}[\s.\-]?)?"
    r"(?:\(\d{2,4}\)[\s.\-]?)?"
    r"\d{2,4}(?:[\s.\-]\d{2,4}){1,4}"
    r"(?!\w))"
)

# Structural markers emitted by the upstream PyMuPDF extraction step. These
# must survive completely unchanged so the prompt builder can keep relying
# on them to reconstruct page/column boundaries.
_PAGE_MARKER_PATTERN = r"(?P<page_marker>^[ \t]*=== Page \d+ ===[ \t]*$)"
_COLUMN_MARKER_PATTERN = r"(?P<column_marker>^[ \t]*\[COLUMN \d+\][ \t]*$)"

_RE_PROTECTED: Pattern[str] = re.compile(
    "|".join(
        (_URL_PATTERN, _EMAIL_PATTERN, _PHONE_PATTERN, _PAGE_MARKER_PATTERN, _COLUMN_MARKER_PATTERN)
    ),
    flags=re.MULTILINE,
)

# Placeholders are built from Unicode Private Use Area code points, which do
# not appear in any real-world resume text and are unaffected by NFKC
# normalization, so they cannot collide with genuine document content and
# cannot be altered by any of the transformations that run while a token is
# "checked out".
_PLACEHOLDER_OPEN = "\ue000"
_PLACEHOLDER_CLOSE = "\ue001"
_RE_PLACEHOLDER: Pattern[str] = re.compile(
    f"{_PLACEHOLDER_OPEN}(\\d+){_PLACEHOLDER_CLOSE}"
)

_MIN_PHONE_DIGITS = 9
_MAX_PHONE_DIGITS = 15


def _protect_tokens(text: str) -> tuple[str, list[str]]:
    """
    Replace URLs, emails, phone numbers, and structural page/column markers
    with opaque placeholders so later normalization passes cannot alter
    them. Returns the placeholder-substituted text plus the ordered list of
    original substrings to restore later via `_restore_tokens`.
    """
    protected: list[str] = []

    def _replace(match: Match[str]) -> str:
        if match.lastgroup == "phone":
            digit_count = sum(1 for ch in match.group(0) if ch.isdigit())
            if not (_MIN_PHONE_DIGITS <= digit_count <= _MAX_PHONE_DIGITS):
                # Doesn't look like a real phone number (e.g. a short date
                # range) -- leave it untouched for normal processing rather
                # than protecting it, since protecting a non-phone token
                # would just skip normalization it may legitimately need
                # (e.g. an en-dash date range should still get its dash
                # canonicalized).
                return match.group(0)

        protected.append(match.group(0))
        return f"{_PLACEHOLDER_OPEN}{len(protected) - 1}{_PLACEHOLDER_CLOSE}"

    protected_text = _RE_PROTECTED.sub(_replace, text)
    return protected_text, protected


def _restore_tokens(text: str, protected: list[str]) -> str:
    """Restore the exact original substrings captured by `_protect_tokens`."""

    def _replace(match: Match[str]) -> str:
        index = int(match.group(1))
        return protected[index]

    return _RE_PLACEHOLDER.sub(_replace, text)


# --------------------------------------------------------------------------- #
# Individual normalization steps
# --------------------------------------------------------------------------- #

def _repair_malformed_unicode(text: str) -> str:
    """
    Defensively round-trip the string through UTF-8 encode/decode, dropping
    any code points that are not valid UTF-8 (e.g. lone surrogates that can
    leak in from a mis-decoded upstream byte stream). PyMuPDF normally hands
    back well-formed `str` objects, but this pipeline receives text from
    many different resume sources (varying PDF producers, occasional
    OCR post-processing), so we treat "text might contain unencodable code
    points" as an expected edge case rather than something that should raise
    deep in the middle of a batch job.
    """
    return text.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")


def _normalize_unicode_form(text: str) -> str:
    """
    Apply Unicode NFKC (Normalization Form KC: compatibility decomposition
    followed by canonical composition).

    This is the single step that resolves most OCR/ligature weirdness in
    one pass:
      * ligatures such as "\ufb01" (fi), "\ufb02" (fl), "\ufb00" (ff)
        decompose to their plain letter sequences ("fi", "fl", "ff")
      * fullwidth / halfwidth Latin variants (sometimes produced by CJK-
        aware OCR engines) collapse to standard ASCII
      * various compatibility variants of the same character (e.g.
        superscript digits) collapse to their canonical form

    NFKC does not touch "+", "#", "." or letters, so hyphenated technology
    names (Node.js, ASP.NET, C++, C#) are completely unaffected.
    """
    return unicodedata.normalize("NFKC", text)


def _normalize_line_endings(text: str) -> str:
    """Collapse CRLF and lone-CR line endings to a single '\\n' convention."""
    return _RE_CRLF_OR_CR.sub("\n", text)


def _expand_form_feeds(text: str) -> str:
    """
    Convert form-feed characters (explicit page-break markers some
    extractors emit) into a blank line *before* generic control-character
    stripping runs, so the page/section break they signal is preserved as
    vertical whitespace rather than silently vanishing.
    """
    return _RE_FORM_FEED.sub("\n\n", text)


def _strip_control_characters(text: str) -> str:
    """Remove non-printable control characters, preserving '\\n' and '\\t'."""
    return _RE_CONTROL_CHARS.sub("", text)


def _strip_zero_width_characters(text: str) -> str:
    """Remove invisible zero-width/formatting characters (see _ZERO_WIDTH_CHARS)."""
    return _RE_ZERO_WIDTH.sub("", text)


def _normalize_nbsp(text: str) -> str:
    """Convert non-breaking spaces to regular spaces."""
    return _RE_NBSP.sub(" ", text)


def _strip_soft_hyphens(text: str) -> str:
    """Remove invisible soft-hyphen optional-break characters."""
    return _RE_SOFT_HYPHEN.sub("", text)


def _normalize_quotes(text: str) -> str:
    """Canonicalize curly/smart quotes and guillemets to straight ASCII quotes."""
    return _RE_QUOTES.sub(lambda m: _QUOTE_MAP[m.group(0)], text)


def _normalize_dashes(text: str) -> str:
    """Canonicalize Unicode dash/minus variants to the ASCII hyphen-minus."""
    return _RE_DASHES.sub(lambda m: _DASH_MAP[m.group(0)], text)


def _normalize_ellipsis(text: str) -> str:
    """Canonicalize the single-character Unicode ellipsis to three ASCII periods."""
    return _RE_ELLIPSIS.sub("...", text)


def _normalize_tabs(text: str) -> str:
    """Convert tab characters to single spaces (see _RE_TAB docstring above)."""
    return _RE_TAB.sub(" ", text)


def _normalize_bullets(text: str) -> str:
    """
    Canonicalize any recognized bullet glyph at the start of a line to a
    single '- ' marker, matching the convention the upstream PyMuPDF
    extraction step already uses. Numbered lists ("1.", "2)") are untouched
    since the regex only matches characters in `_BULLET_GLYPHS`.
    """
    return _RE_BULLET.sub("- ", text)


def _collapse_repeated_punctuation(text: str) -> str:
    """
    Collapse runs of 4+ identical divider-style punctuation characters down
    to exactly 3 (see `_COLLAPSIBLE_PUNCTUATION` docstring for rationale and
    the deliberate exclusions that protect symbols like '+', '#', '@').
    """
    return _RE_REPEATED_PUNCTUATION.sub(lambda m: m.group(1) * 3, text)


def _strip_line_edge_whitespace(text: str) -> str:
    """Strip leading and trailing horizontal whitespace on every line."""
    text = _RE_TRAILING_WS.sub("", text)
    text = _RE_LEADING_WS.sub("", text)
    return text


def _collapse_repeated_spaces(text: str) -> str:
    """Collapse runs of 2+ spaces into a single space."""
    return _RE_REPEATED_SPACES.sub(" ", text)


def _collapse_excess_blank_lines(text: str) -> str:
    """Cap consecutive blank lines at a single blank line (i.e. max 2 newlines in a row)."""
    return _RE_EXCESS_BLANK_LINES.sub("\n\n", text)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #

def clean_text(text: str) -> str:
    """
    Deterministically normalize PyMuPDF-extracted resume text for LLM
    consumption, without performing any semantic analysis or content
    changes.

    Parameters
    ----------
    text:
        Raw text as produced by the upstream PyMuPDF extraction step. May
        contain OCR artifacts, mixed line endings, stray control
        characters, curly quotes, repeated divider punctuation, and
        inconsistent whitespace.

    Returns
    -------
    str
        Cleaned text with:
          * consistent '\\n' line endings
          * no null bytes, zero-width characters, or control characters
          * canonical straight quotes, ASCII dashes, and ASCII ellipsis
          * canonical '- ' bullets
          * no more than 3 consecutive identical divider punctuation chars
          * no runs of 2+ spaces, no leading/trailing line whitespace
          * no more than one consecutive blank line
          * URLs, emails, phone numbers, "=== Page N ===" markers, and
            "[COLUMN N]" markers preserved byte-for-byte

        Returns an empty string for `None` or empty input rather than
        raising, since "this page/resume had no text" is an expected,
        recoverable condition in a production ingestion pipeline -- callers
        (the prompt builder) are responsible for deciding how to handle an
        empty result (e.g. routing to manual review), not this function.
    """
    if not text:
        return ""

    # --- Stage 1: get to well-formed, canonical Unicode on a single line-
    # ending convention. Order matters here: unicode repair must happen
    # before NFKC (which requires valid Unicode input), and line-ending
    # normalization must happen before any regex that anchors on '\n'.
    text = _repair_malformed_unicode(text)
    text = _normalize_line_endings(text)
    text = _expand_form_feeds(text)
    text = _strip_control_characters(text)
    text = _strip_zero_width_characters(text)
    text = _normalize_nbsp(text)
    text = _strip_soft_hyphens(text)
    text = _normalize_unicode_form(text)

    # --- Stage 2: check out URLs / emails / phone numbers / structural
    # markers so nothing in Stage 3 can mutate them.
    text, protected = _protect_tokens(text)

    # --- Stage 3: cosmetic canonicalization + whitespace/punctuation
    # collapsing. Safe to run freely now that protected tokens are opaque
    # placeholders rather than live text.
    text = _normalize_quotes(text)
    text = _normalize_dashes(text)
    text = _normalize_ellipsis(text)
    text = _normalize_tabs(text)
    text = _strip_line_edge_whitespace(text)
    text = _collapse_repeated_spaces(text)
    text = _normalize_bullets(text)
    text = _collapse_repeated_punctuation(text)
    text = _collapse_excess_blank_lines(text)

    # --- Stage 4: restore protected tokens exactly as they were originally
    # extracted, then do a final outer trim.
    text = _restore_tokens(text, protected)

    return text.strip("\n")