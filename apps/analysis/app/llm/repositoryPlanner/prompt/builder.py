from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.schemas.evaluation_context import EvaluationContextDto

_CONTEXT_DIR = Path(__file__).parent.parent / "context"
_PLANNER_FILE = _CONTEXT_DIR / "planner.md"

_MISSION_HEADER = """
# MISSION: Trace Repository Evidence Planner

You are the **Trace Repository Evidence Planner (Stage 2A)**. Given a Job Context, Stage 1 Evaluation, Candidate Context, and Repository Discovery data, produce a single structured retrieval plan.

Your strict rules and exact output schema are defined in the sections below. Read them carefully before analyzing the data. The data is at the bottom of this prompt—keep it there for reference while generating your output.

⚠️ Strictly adhere to the exact schema and enum values defined in this prompt. Do not invent new fields, categories, or enum values.
""".strip()

_FINAL_REMINDER = """
🔴 FINAL REMINDER: Every objective_id must be unique. All paths must exist in the supplied discovery trees. Do not invent paths or repositories.
"""


@lru_cache(maxsize=1)
def build_repository_planner_system_instruction() -> str:
    if not _PLANNER_FILE.exists():
        raise FileNotFoundError(f"Planner file not found: {_PLANNER_FILE}")
    return _PLANNER_FILE.read_text(encoding="utf-8").strip()


def _json(data: Any) -> str:
    return json.dumps(
        data,
        indent=2,
        ensure_ascii=False,
        default=str,
    )


def _filter_job_context(job_context: EvaluationContextDto) -> dict[str, Any]:
    data = job_context.model_dump(mode="json")

    data.pop("qualifications", None)
    data.pop("submissionRequirements", None)

    role_category = data.get("job", {}).get("roleCategory")
    if role_category:
        role_category.pop("code", None)

    for section in (
        "evaluationPriorities",
        "evidencePriorities",
        "successSignals",
    ):
        for item in data.get(section, []):
            item.pop("code", None)

    return data


def _filter_stage_1(stage_1: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(stage_1)

    candidate = data.get("candidate", {})
    candidate.pop("metadata", None)
    candidate.pop("candidate_profile", None)
    candidate.pop("education", None)
    candidate.pop("certifications", None)
    candidate.pop("miscellaneous_claims", None)

    evaluation = data.get("evaluation", {})
    evaluation.pop("metadata", None)
    evaluation.pop("confidence", None)

    return data


def _filter_candidate_context(candidate_context: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(candidate_context)

    submitted = data.get("submittedEvidence", {})

    submitted.pop("resumeProvided", None)
    submitted.pop("portfolioUrl", None)
    submitted.pop("linkedinUrl", None)
    submitted.pop("problemSolvingProfileUrl", None)

    return data


def _filter_repository_discovery(
    repository_discovery: dict[str, Any],
) -> dict[str, Any]:
    data = copy.deepcopy(repository_discovery)

    data.pop("created_at", None)
    data.pop("updated_at", None)
    data.pop("public_repos", None)
    data.pop("self_owned", None)
    data.pop("forks", None)
    data.pop("organization", None)

    repositories = data.get("repositories", [])

    for repo in repositories:
        repo.pop("private", None)
        repo.pop("archived", None)
        repo.pop("pushed_at", None)

    return data


def build_repository_planner_payload(
    *,
    job_context: EvaluationContextDto,
    stage_1: dict[str, Any],
    candidate_context: dict[str, Any],
    repository_discovery: dict[str, Any],
) -> str:
    payload = {
        "job_context": _filter_job_context(job_context),
        "stage_1": _filter_stage_1(stage_1),
        "candidate_context": _filter_candidate_context(candidate_context),
        "repository_discovery": _filter_repository_discovery(
            repository_discovery
        ),
    }

    return _json(payload)


def build_full_repository_planner_prompt(
    *,
    job_context: EvaluationContextDto,
    stage_1: dict[str, Any],
    candidate_context: dict[str, Any],
    repository_discovery: dict[str, Any],
) -> str:
    return "\n\n".join(
        [
            _MISSION_HEADER,
            build_repository_planner_system_instruction(),
            build_repository_planner_payload(
                job_context=job_context,
                stage_1=stage_1,
                candidate_context=candidate_context,
                repository_discovery=repository_discovery,
            ),
            _FINAL_REMINDER,
        ]
    )