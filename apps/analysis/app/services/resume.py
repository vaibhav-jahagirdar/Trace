from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_prompt,
)
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest):
    pdf_bytes = download_resume(request.resumeObjectKey)

    parsed = parse_resume_pdf(pdf_bytes)

    cleaned_text = clean_text(parsed.text)

    job_context = request.analysisContext.job
    candidate_context = request.analysisContext.candidate

    prompt = build_resume_analysis_prompt(
        job_context=job_context,
        candidate_context=candidate_context,
        resume_text=cleaned_text,
    )

    return {
    "prompt": prompt,
}