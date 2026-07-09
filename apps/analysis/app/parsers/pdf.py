import fitz  


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")

    try:
        pages: list[str] = []

        for page in document:
            text = page.get_text("text")

            if text:
                pages.append(text)

        return "\n".join(pages)

    finally:
        document.close()