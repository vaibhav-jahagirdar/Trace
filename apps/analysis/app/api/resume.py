from fastapi import APIRouter
import time

from app.schemas.resume import ResumeAnalysisRequest
from app.schemas.resume_report import ResumeAnalysisResponse
from app.services.resume import analyze_resume

router = APIRouter(
    prefix="/resume",
    tags=["Resume Analysis"],
)


@router.post(
    "/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume_endpoint(
    request: ResumeAnalysisRequest,
) -> ResumeAnalysisResponse:
    started_at = time.perf_counter()
    print("[PythonAnalysis][1] Request received", {
        "application_id": request.applicationId,
        "task_id": request.taskId,
        "has_cached_response": bool(request.raw_llm_response),
    }, flush=True)
    response = await analyze_resume(request)
    print("[PythonAnalysis][2] Response ready", {
        "task_id": request.taskId,
        "elapsed_ms": round((time.perf_counter() - started_at) * 1000),
    }, flush=True)
    return response
