from app.cleaners.candidate import normalize_candidate
from app.cleaners.final_resume_report import (
    normalize_final_resume_report,
    validate_evaluation_claim_references,
)
from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.llm.resumeAnalyzer.prompt.builder import build_resume_analysis_prompt
from app.llm.service import generate
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest
from app.schemas.resume_report import ResumeAnalysisResponse
from app.services.resume_scoring import compute_resume_scores


async def analyze_resume(
    request: ResumeAnalysisRequest,
) -> dict:
    pdf_bytes = download_resume(request.resumeObjectKey)

    parsed_resume = parse_resume_pdf(pdf_bytes)
    cleaned_resume = clean_text(parsed_resume.text)

    prompt = build_resume_analysis_prompt(
        job_context=request.analysisContext.job,
        candidate_context=request.analysisContext.candidate,
        resume_text=cleaned_resume,
    )

    payload = await generate(prompt)

    candidate = normalize_candidate(payload["candidate"])
    evaluation = normalize_final_resume_report(
        payload["evaluation"],
        request.analysisContext.job,
    )
    validate_evaluation_claim_references(evaluation, candidate)
    computed_scores = compute_resume_scores(
        evaluation,
        request.analysisContext.job,
    )

    response = {
        "candidate": candidate,
        "evaluation": evaluation,
        "computed_scores": computed_scores,
    }

    return ResumeAnalysisResponse.model_validate(response).model_dump(mode="json")
