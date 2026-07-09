

from app.clients.r2 import download_resume
from app.parsers.pdf import extract_text_from_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest) -> None:
    print("Starting analysis...")

    pdf_bytes = download_resume(request.resumeObjectKey)
    print("Downloaded bytes:", len(pdf_bytes))

    raw_text = extract_text_from_pdf(pdf_bytes)
    print("Extracted chars:", len(raw_text))

    print("Text preview:")
    print(repr(raw_text[:500]))