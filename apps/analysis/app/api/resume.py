from fastapi import APIRouter

from app.schemas.final_report import ResumeEvaluationReport
from app.schemas.resume import ResumeAnalysisRequest
from app.services.resume import analyze_resume

router = APIRouter(
    prefix="/resume",
    tags=["Resume Analysis"],
)


@router.post(
    "/analyze",
)
async def analyze_resume_endpoint(
    request: ResumeAnalysisRequest,
) -> ResumeEvaluationReport:
    return await analyze_resume(request)