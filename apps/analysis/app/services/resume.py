import json

from app.cleaners.candidate import normalize_candidate
from app.cleaners.final_resume_report import (
    normalize_final_resume_report,
    validate_evaluation_claim_references,
)
from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_prompt,
)
from app.llm.service import generate
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest) -> dict:
    """Run the full analysis pipeline – no scoring, just structured extraction + evaluation."""

    pdf_bytes = download_resume(request.resumeObjectKey)
    parsed_resume = parse_resume_pdf(pdf_bytes)
    cleaned_resume = clean_text(parsed_resume.text)


    prompt = build_resume_analysis_prompt(
        job_context=request.analysisContext.job,
        candidate_context=request.analysisContext.candidate,
        resume_text=cleaned_resume,
    )

   
    payload, _raw_response = await generate(prompt)
    if payload is None:
        raise RuntimeError("LLM returned invalid JSON – cannot proceed.")

    candidate = normalize_candidate(payload["candidate"])
    evaluation = normalize_final_resume_report(
        payload["evaluation"],
        request.analysisContext.job,
    )

 
    validate_evaluation_claim_references(evaluation, candidate)


    return {
        "candidate": candidate,
        "evaluation": evaluation,
    }