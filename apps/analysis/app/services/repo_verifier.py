"""Stage 2C repository evidence retrieval and verification."""

from __future__ import annotations

import json
from typing import Any

from app.llm.repositoryVerifier.prompt.builder import (
    build_repository_verifier_prompt,
    build_repository_verifier_system_instruction,
)
from app.llm.repositoryVerifier.scrapers.file_content import (
    FileContentError,
    fetch_repository_evidence,
)
from app.llm.service import generate


class RepositoryVerifierError(Exception):
    """Raised when Stage 2C cannot produce a verifier result."""


def _clean_response(
    parsed: dict[str, Any] | None,
    raw_response: str,
) -> dict[str, Any]:
    """Transport cleaner only; semantic validation belongs to Node."""
    if isinstance(parsed, dict):
        return parsed

    try:
        decoded = json.loads(raw_response)
    except json.JSONDecodeError:
        return {"raw": raw_response}

    return decoded if isinstance(decoded, dict) else {"raw": raw_response}


async def verify_repository_evidence(
    *,
    evaluation_context: dict[str, Any],
    stage_1_report: dict[str, Any],
    stage_2a_report: dict[str, Any],
    repository_files: list[dict[str, Any]],
    github_token: str | None = None,
    raw_llm_response: str | None = None,
) -> dict[str, Any]:
    if not repository_files:
        raise RepositoryVerifierError(
            "No planner-selected repository files were supplied"
        )

    try:
        repository_evidence = await fetch_repository_evidence(
            {"repository_files": repository_files},
            token=github_token,
        )
    except FileContentError as exc:
        raise RepositoryVerifierError(
            f"Repository evidence retrieval failed: {exc}"
        ) from exc

    prompt = build_repository_verifier_prompt(
        evaluation_context=evaluation_context,
        stage_1_report=stage_1_report,
        stage_2a_report=stage_2a_report,
        repository_evidence=repository_evidence,
    )

    if raw_llm_response:
        raw_response = raw_llm_response
        try:
            parsed = json.loads(raw_response)
        except json.JSONDecodeError:
            parsed = None
        if not isinstance(parsed, dict):
            parsed = None
    else:
        parsed, raw_response = await generate(
            prompt,
            system_instruction=build_repository_verifier_system_instruction(),
        )

    report = _clean_response(parsed, raw_response)

    return {
        **report,
        "raw_llm_response": raw_response,
        "repository_evidence": repository_evidence,
    }
