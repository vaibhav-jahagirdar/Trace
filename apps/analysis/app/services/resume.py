import json
import tempfile
import time  # 👈 Added for timing
from pprint import pprint

from app.cleaners.candidate import normalize_candidate
from app.cleaners.final_resume_report import (
    normalize_final_resume_report,
    validate_evaluation_claim_references,
)
from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_prompt,
    build_resume_analysis_system_instruction,
)
from app.llm.service import generate
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest
from app.schemas.resume_report import ResumeAnalysisResponse
from app.services.resume_scoring import (
    compute_resume_scores,
)


async def analyze_resume(
    request: ResumeAnalysisRequest,
) -> dict:
    print("=" * 80)
    print("[RESUME] Starting analysis")
    print("=" * 80)

    print("[RESUME] Downloading PDF...")
    pdf_bytes = download_resume(
        request.resumeObjectKey
    )

    print(
        f"[RESUME] PDF size: {len(pdf_bytes):,} bytes"
    )

    print("[RESUME] Parsing PDF...")
    parsed_resume = parse_resume_pdf(pdf_bytes)

    print(
        f"[RESUME] Parsed text chars: {len(parsed_resume.text):,}"
    )

    print("[RESUME] Cleaning text...")
    cleaned_resume = clean_text(
        parsed_resume.text
    )

    print(
        f"[RESUME] Cleaned text chars: {len(cleaned_resume):,}"
    )

    # ── Build the User Message (ONLY the JSON data) ──
    print("[RESUME] Building prompt...")

    # Debug: log system instruction length (the rules stay in the System Message)
    system_instruction = build_resume_analysis_system_instruction()
    print(f"[RESUME] System instruction length: {len(system_instruction):,} chars")

    # This now returns ONLY the JSON data (job_context, candidate_context, parsed_resume)
    prompt = build_resume_analysis_prompt(
        job_context=request.analysisContext.job,
        candidate_context=request.analysisContext.candidate,
        resume_text=cleaned_resume,
    )

    # Debug: print first 200 chars of the JSON data for sanity
    print(f"[RESUME] JSON data preview (first 200 chars):\n{prompt[:200]}...")

    # Write prompt to temp file for inspection
    with tempfile.NamedTemporaryFile(
        mode="w",
        delete=False,
        suffix=".json",
    ) as f:
        f.write(prompt)
        prompt_temp_path = f.name

    print(
        f"[RESUME] Prompt (JSON data) written to: {prompt_temp_path}"
    )
    print(
        f"[RESUME] Prompt chars: {len(prompt):,}"
    )

    print("=" * 80)
    print("[RESUME] Calling LLM...")
    print("=" * 80)

    # generate() now injects the System Instruction automatically via the NVIDIA NIM client
    llm_start = time.time()  # 👈 Start timer
    payload = await generate(prompt)
    llm_elapsed = time.time() - llm_start  # 👈 End timer
    print(f"[RESUME] ⏱️ LLM call completed in {llm_elapsed:.2f} seconds")

    print("=" * 80)
    print("[RESUME] LLM returned payload")
    print("=" * 80)

    print(
        f"[RESUME] Payload type: {type(payload).__name__}"
    )
    print(
        f"[RESUME] Top-level keys: {list(payload.keys())}"
    )

    # Save payload to temp JSON file
    with tempfile.NamedTemporaryFile(
        mode="w",
        delete=False,
        suffix=".json",
    ) as f:
        json.dump(
            payload,
            f,
            indent=2,
            ensure_ascii=False,
        )
        temp_path = f.name

    print(
        f"[RESUME] Payload written to: {temp_path}"
    )

    print("=" * 80)
    print("[RESUME] Candidate normalization")
    print("=" * 80)

    try:
        candidate = normalize_candidate(
            payload["candidate"]
        )
        print(
            "[RESUME] Candidate normalization succeeded"
        )
    except Exception as exc:
        print(
            "[RESUME] Candidate normalization FAILED"
        )
        pprint(
            payload.get(
                "candidate",
                {},
            )
        )
        raise

    print("=" * 80)
    print("[RESUME] Evaluation normalization")
    print("=" * 80)

    try:
        evaluation = normalize_final_resume_report(
            payload["evaluation"],
            request.analysisContext.job,
        )
        print(
            "[RESUME] Evaluation normalization succeeded"
        )
    except Exception:
        print(
            "[RESUME] Evaluation normalization FAILED"
        )
        pprint(
            payload.get(
                "evaluation",
                {},
            )
        )
        raise

    print("=" * 80)
    print("[RESUME] Validating claim references")
    print("=" * 80)

    try:
        validate_evaluation_claim_references(
            evaluation,
            candidate,
        )
        print(
            "[RESUME] Claim validation succeeded"
        )
    except Exception:
        print(
            "[RESUME] Claim validation FAILED"
        )
        raise

    print("=" * 80)
    print("[RESUME] Computing scores")
    print("=" * 80)

    computed_scores = compute_resume_scores(
        evaluation,
        request.analysisContext.job,
    )

    print(
        "[RESUME] Score computation succeeded"
    )

    response = {
        "candidate": candidate,
        "evaluation": evaluation,
        "computed_scores": computed_scores,
    }

    print("=" * 80)
    print("[RESUME] Validating final response")
    print("=" * 80)

    validated = ResumeAnalysisResponse.model_validate(
        response
    )

    print(
        "[RESUME] Analysis completed successfully"
    )
    print("=" * 80)

    return validated.model_dump(
        mode="json"
    )