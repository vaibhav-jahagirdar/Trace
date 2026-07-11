from app.clients.r2 import download_resume
from app.cleaners.text import clean_text
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest):
    pdf_bytes = download_resume(request.resumeObjectKey)

    parsed = parse_resume_pdf(pdf_bytes)

    cleaned_text = clean_text(parsed.text)

    job = request.analysisContext.job
    candidate = request.analysisContext.candidate

    print(job)
    print(candidate)
    print(cleaned_text[:500])

   