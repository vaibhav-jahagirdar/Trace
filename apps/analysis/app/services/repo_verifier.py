# app/services/repo_verifier.py

from __future__ import annotations

import json
from typing import Any

from app.llm.repositoryVerifier.prompt.builder import (
    build_repository_verifier_prompt,
    build_repository_verifier_system_instruction,
)
from app.llm.service import generate
from app.llm.repositoryVerifier.scrapers.file_content import (
    fetch_repository_evidence,
)


class RepositoryVerifierError(Exception):
    pass


def clean_verifier_output(
    parsed: dict[str, Any] | None,
    raw_response: str,
) -> dict[str, Any]:
    """
    No schema validation yet.

    Only normalize the transport result so Node always receives an object.
    """
    if parsed is not None:
        return parsed

    try:
        decoded = json.loads(raw_response)
    except json.JSONDecodeError:
        return {
            "raw": raw_response,
        }

    if isinstance(decoded, dict):
        return decoded

    return {
        "raw": raw_response,
    }


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

    retrieval_payload = {
        "repository_files": repository_files,
    }

    repository_evidence = await fetch_repository_evidence(
        retrieval_payload,
        token=github_token,
    )

    prompt = build_repository_verifier_prompt(
        evaluation_context=evaluation_context,
        stage_1_report=stage_1_report,
        stage_2a_report=stage_2a_report,
        repository_evidence=repository_evidence,
    )

    if raw_llm_response:
        raw_response = raw_llm_response
        parsed: dict[str, Any] | None = None

        try:
            decoded = json.loads(raw_response)
            if isinstance(decoded, dict):
                parsed = decoded
        except json.JSONDecodeError:
            pass
    else:
        parsed, raw_response = await generate(
            prompt,
            system_instruction=build_repository_verifier_system_instruction(),
        )

    report = clean_verifier_output(parsed, raw_response)

    return {
        **report,
        "raw_llm_response": raw_response,
        "repository_evidence": repository_evidence,
    }