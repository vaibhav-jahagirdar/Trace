import json
import tempfile
import time

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
from app.schemas.resume_report import ResumeAnalysisRequest



async def analyze_resume(request: ResumeAnalysisRequest) -> dict:
    started_at = time.perf_counter()
    print("[PythonAnalysis][service] Starting pipeline", {"task_id": request.taskId}, flush=True)
    if request.raw_llm_response:
        try:
            payload = json.loads(request.raw_llm_response)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON in raw_llm_response")
        if "candidate" not in payload or "evaluation" not in payload:
            raise ValueError("raw_llm_response missing required top-level keys")
        raw_response = request.raw_llm_response
        candidate_raw = payload["candidate"]
        evaluation_raw = payload["evaluation"]
        print("[PythonAnalysis][service] Using cached LLM response", {"task_id": request.taskId}, flush=True)
    else:
        print("[PythonAnalysis][service] Downloading and parsing resume", {"task_id": request.taskId}, flush=True)
        pdf_bytes = download_resume(request.resumeObjectKey)
        parsed_resume = parse_resume_pdf(pdf_bytes)
        cleaned_resume = clean_text(parsed_resume.text)
        print("[PythonAnalysis][service] Resume parsed", {"task_id": request.taskId, "text_length": len(cleaned_resume)}, flush=True)

        prompt = build_resume_analysis_prompt(
            job_context=request.analysisContext.job,
            candidate_context=request.analysisContext.candidate,
            resume_text=cleaned_resume,
        )

        payload, raw_response = await generate(prompt)
        print("[PythonAnalysis][service] LLM generation returned", {"task_id": request.taskId, "has_payload": payload is not None}, flush=True)
        if payload is None:
            raise RuntimeError("LLM returned invalid JSON – cannot proceed.")
        candidate_raw = payload["candidate"]
        evaluation_raw = payload["evaluation"]

    candidate = normalize_candidate(candidate_raw)
    evaluation = normalize_final_resume_report(
        evaluation_raw,
        request.analysisContext.job,
    )
    validate_evaluation_claim_references(evaluation, candidate)
    print("[PythonAnalysis][service] Output normalized and validated", {"task_id": request.taskId, "elapsed_ms": round((time.perf_counter() - started_at) * 1000)}, flush=True)

    response = {
        "candidate": candidate,
        "evaluation": evaluation,
        "raw_llm_response": raw_response,
    }

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(response, f, indent=2, ensure_ascii=False)
        temp_path = f.name
    print(f"[RESUME] Cleaned response written to: {temp_path}")

    return response
