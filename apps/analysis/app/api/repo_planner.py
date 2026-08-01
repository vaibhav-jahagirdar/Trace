from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.evaluation_context import EvaluationContextDto
from app.schemas.planner import PlannerOutput
from app.services.repository_planner import plan_repository_evidence

router = APIRouter(
    prefix="/repository-planner",
    tags=["Repository Planner"],
)


class RepositoryPlannerRequest(BaseModel):
    job_context: EvaluationContextDto
    stage_1: dict[str, Any]
    candidate_context: dict[str, Any]
    github_url: str
    repository_discovery: dict[str, Any] | None = None  # internal replay/testing only — never populated by Node


class RepositoryPlannerResponse(BaseModel):
    plan: PlannerOutput
    repository_discovery: dict[str, Any]
    raw_llm_response: str


@router.post(
    "/plan",
    response_model=RepositoryPlannerResponse,
)
async def plan_repository_evidence_endpoint(
    request: RepositoryPlannerRequest,
) -> RepositoryPlannerResponse:
    return await plan_repository_evidence(
        job_context=request.job_context,
        stage_1=request.stage_1,
        candidate_context=request.candidate_context,
        github_url=request.github_url,
        repository_discovery=request.repository_discovery,
    )