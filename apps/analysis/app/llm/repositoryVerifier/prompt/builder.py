from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

_CONTEXT_DIR = Path(__file__).parent.parent / "context"
_SYSTEM_FILE = _CONTEXT_DIR / "system.md"


@lru_cache(maxsize=1)
def build_repository_verifier_system_instruction() -> str:
    return _SYSTEM_FILE.read_text(encoding="utf-8").strip()


def _json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
        default=str,
    )


def _filter_evaluation_context(
    evaluation_context: dict[str, Any],
) -> dict[str, Any]:
    data = copy.deepcopy(evaluation_context)

    # Stage 2C needs job requirements and role context.
    # Candidate-submitted context is already represented through Stage 1.
    data.pop("candidate_context", None)

    job_context = data.get("job_context")
    if isinstance(job_context, dict):
        job_context.pop("submissionRequirements", None)
        job_context.pop("qualifications", None)

    return data


def _filter_stage_1(stage_1_report: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(stage_1_report)

    candidate = data.get("candidate")
    if isinstance(candidate, dict):
        for field in (
            "metadata",
            "candidate_profile",
            "education",
            "certifications",
            "miscellaneous_claims",
        ):
            candidate.pop(field, None)

    evaluation = data.get("evaluation")
    if isinstance(evaluation, dict):
        for field in ("metadata", "confidence", "score_rationale", "overall"):
            evaluation.pop(field, None)

        bucket_scores = evaluation.get("bucket_scores")
        if isinstance(bucket_scores, dict):
            bucket_scores.pop("qualification_alignment", None)

    return data


def _filter_stage_2a(stage_2a_report: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(stage_2a_report)

    data.pop("metadata", None)
    data.pop("planning_summary", None)
    data.pop("retrieval_execution", None)

    for repository in data.get("repository_plans", []):
        if not isinstance(repository, dict):
            continue

        for field in (
            "candidate_attention_weight",
            "planning_confidence",
            "priority_rationale",
            "structural_observations",
            "domain_allocations",
        ):
            repository.pop(field, None)

        for objective in repository.get("evidence_objectives", []):
            if isinstance(objective, dict):
                objective.pop("selection_rationale", None)

    return data


def build_repository_verifier_prompt(
    *,
    evaluation_context: dict[str, Any],
    stage_1_report: dict[str, Any],
    stage_2a_report: dict[str, Any],
    repository_evidence: dict[str, Any],
) -> str:
    return "\n\n".join(
        [
            "<evaluation_context>",
            _json(_filter_evaluation_context(evaluation_context)),
            "</evaluation_context>",
            "<stage_1_report>",
            _json(_filter_stage_1(stage_1_report)),
            "</stage_1_report>",
            "<stage_2a_report>",
            _json(_filter_stage_2a(stage_2a_report)),
            "</stage_2a_report>",
            "<repository_evidence>",
            _json(repository_evidence),
            "</repository_evidence>",
        ]
    )