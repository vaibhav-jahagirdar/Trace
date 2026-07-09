from fastapi import APIRouter

from app.schemas.resume import (
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
)
from app.services.resume import analyze_resume

router = APIRouter()


@router.post(
    "/resume/analyze",
    response_model=ResumeAnalysisResponse,
)
async def analyze_resume_endpoint(
    request: ResumeAnalysisRequest,
):
    await analyze_resume(request)

    return ResumeAnalysisResponse(
        success=True,
    )