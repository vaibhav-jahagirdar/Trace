from typing import Any

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict

from app.services.repo_verifier import (
    RepositoryVerifierError,
    verify_repository_evidence,
)


router = APIRouter(
    prefix="/repository-verifier",
    tags=["Repository Verifier"],
)


class RepositoryVerifierRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    evaluation_context: dict[str, Any]
    stage_1_report: dict[str, Any]
    stage_2a_report: dict[str, Any]
    repository_files: list[dict[str, Any]]
    raw_llm_response: str | None = None


@router.post("/verify")
async def verify_repository_evidence_endpoint(
    request: RepositoryVerifierRequest,
) -> dict[str, Any]:
    try:
        return await verify_repository_evidence(
            evaluation_context=request.evaluation_context,
            stage_1_report=request.stage_1_report,
            stage_2a_report=request.stage_2a_report,
            repository_files=request.repository_files,
            github_token=os.getenv("GITHUB_TOKEN"),
            raw_llm_response=request.raw_llm_response,
        )
    except RepositoryVerifierError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
