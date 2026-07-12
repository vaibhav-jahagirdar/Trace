from pathlib import Path
import tempfile

from app.cleaners.text import clean_text
from app.clients.r2 import download_resume
from app.llm.resumeAnalyzer.prompt.builder import (
    build_resume_analysis_prompt,
)
from app.llm.service import generate
from app.parsers.pdf import parse_resume_pdf
from app.schemas.resume import ResumeAnalysisRequest


async def analyze_resume(request: ResumeAnalysisRequest):
    pdf_bytes = download_resume(request.resumeObjectKey)

    parsed = parse_resume_pdf(pdf_bytes)

    cleaned_text = clean_text(parsed.text)
    print(f"[DEBUG] cleaned_text length: {len(cleaned_text)}")

    job_context = request.analysisContext.job
    candidate_context = request.analysisContext.candidate
    prompt = build_resume_analysis_prompt(
        job_context=job_context,
        candidate_context=candidate_context,
        resume_text=cleaned_text,
    )

    prompt_path = Path("/tmp/resume_prompt.txt")
    prompt_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_path.write_text(prompt, encoding="utf-8")

    print(f"[DEBUG] Finalized prompt written to {prompt_path}")

    llm_response = await generate(prompt)

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".txt",
        prefix="resume_analysis_",
        delete=False,
        encoding="utf-8",
    ) as f:
        f.write(llm_response)
        temp_path = Path(f.name)

    print(f"[DEBUG] LLM response written to {temp_path}")

    return {
        "response": llm_response,
        "debugFile": str(temp_path),
    }