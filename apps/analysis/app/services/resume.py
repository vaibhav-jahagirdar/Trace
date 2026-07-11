from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest):
    pdf_bytes = download_resume(request.resumeObjectKey)

    parsed = parse_resume_pdf(pdf_bytes)

    cleaned_text = clean_text(parsed.text)

    job_context = request.analysisContext.job
    candidate_context = request.analysisContext.candidate

    print(job_context.model_dump())
    print(candidate_context.model_dump())

    print(cleaned_text[:500])