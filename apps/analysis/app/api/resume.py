from fastapi import APIRouter

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
    return await analyze_resume(request)