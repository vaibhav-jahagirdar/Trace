"""Deterministic aggregation for the resume-analysis response.

The model assesses evidence. This module owns all weights, confidence
discounts, requirement tiers, and the final ranking score so changing job
configuration never requires asking the model to do arithmetic again.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from app.schemas.evaluation_context import EvaluationContextDto


_CONFIDENCE_MULTIPLIER = {
    "HIGH": 1.00,
    "MEDIUM": 0.90,
    "LOW": 0.75,
}
_TIER_MULTIPLIER = {
    "mandatory": 1.00,
    "preferred": 0.60,
    "bonus": 0.30,
    "MANDATORY": 1.00,
    "PREFERRED": 0.60,
    "BONUS": 0.30,
}

# The order intentionally reflects the product rule: configured job context
# first, then relevant real work, then projects, concepts, technology, and
# supporting/success evidence.
_BUCKET_MAX_POINTS = {
    "primary_evidence": 25.0,
    "secondary_evidence": 10.0,
    "concept_alignment": 10.0,
    "technology_alignment": 5.0,
    "technical_claim_precision": 5.0,
    "supporting_signals": 5.0,
}
_REQUIREMENT_COVERAGE_MAX_POINTS = 15.0
_RECRUITER_PRIORITIES_MAX_POINTS = 25.0


def _effective_score(field: dict[str, Any]) -> float | None:
    score = field.get("score")
    if score is None:
        return None

    confidence = field.get("confidence")
    try:
        return float(score) * _CONFIDENCE_MULTIPLIER[confidence]
    except (KeyError, TypeError) as exc:
        raise ValueError("Scored field has an invalid score or confidence.") from exc


def _configured_requirements(job_context: EvaluationContextDto) -> Iterable[tuple[str, Any]]:
    for tier in ("mandatory", "preferred", "bonus"):
        for requirement in getattr(job_context.requirements, tier):
            yield tier, requirement


def _requirement_coverage(
    evaluation: dict[str, Any],
    job_context: EvaluationContextDto,
) -> float | None:
    assessments: dict[tuple[str, str, str], str] = {}
    for tier in ("mandatory", "preferred", "bonus"):
        category = evaluation["requirement_analysis"][tier]
        for requirement_type, items in category.items():
            for item in items:
                assessments[(tier, requirement_type.upper(), item["name"])] = item["status"]

    raw = 0.0
    maximum = 0.0
    status_multiplier = {"CONFIRMED": 1.0, "UNCONFIRMED": 0.5, "MISSING": 0.0}

    for tier, requirement in _configured_requirements(job_context):
        weight = float(requirement.weight) * _TIER_MULTIPLIER[tier]
        maximum += weight
        status = assessments[(tier, requirement.type, requirement.name)]
        raw += status_multiplier[status] * weight

    if maximum == 0:
        return None

    return _REQUIREMENT_COVERAGE_MAX_POINTS * raw / maximum


def _recruiter_priority_points(
    evaluation: dict[str, Any],
    job_context: EvaluationContextDto,
) -> float | None:
    rubric = evaluation["recruiter_rubric"]
    sections = (
        (rubric["evaluation_dimensions"], job_context.evaluationPriorities),
        (rubric["evidence_categories"], job_context.evidencePriorities),
        (rubric["success_signals"], job_context.successSignals),
    )

    weighted_score = 0.0
    total_weight = 0.0
    for items, configured_items in sections:
        for item, configured in zip(items, configured_items, strict=True):
            effective_score = _effective_score(item)
            if effective_score is None:
                continue

            # The service validated code and priority_type against the job
            # context before this function runs. Weight is never trusted from
            # model output.
            weight = (
                float(configured.weight)
                * _TIER_MULTIPLIER[item["priority_type"]]
            )
            weighted_score += effective_score / 100 * weight
            total_weight += weight

    if total_weight == 0:
        return None

    return _RECRUITER_PRIORITIES_MAX_POINTS * weighted_score / total_weight


def _score_direct_buckets(evaluation: dict[str, Any]) -> tuple[float, float]:
    raw_points = 0.0
    active_max_points = 0.0
    bucket_scores = evaluation["bucket_scores"]

    for bucket, max_points in _BUCKET_MAX_POINTS.items():
        effective_score = _effective_score(bucket_scores[bucket])
        if effective_score is None:
            continue
        raw_points += effective_score / 100 * max_points
        active_max_points += max_points

    return raw_points, active_max_points


def compute_resume_scores(
    evaluation: dict[str, Any],
    job_context: EvaluationContextDto,
) -> dict[str, float]:
    """Return backend-owned ranking fields from validated model output.

    Empty or structurally unjudgeable categories are excluded from the active
    denominator. That keeps a fresher from being penalized simply because no
    professional-work secondary source exists, and keeps sparse job configs
    from capping every candidate below 100.
    """

    raw_points, active_max_points = _score_direct_buckets(evaluation)

    requirement_coverage = _requirement_coverage(evaluation, job_context)
    if requirement_coverage is not None:
        raw_points += requirement_coverage
        active_max_points += _REQUIREMENT_COVERAGE_MAX_POINTS

    recruiter_priorities = _recruiter_priority_points(evaluation, job_context)
    if recruiter_priorities is not None:
        raw_points += recruiter_priorities
        active_max_points += _RECRUITER_PRIORITIES_MAX_POINTS

    resume_match_score = (
        0.0 if active_max_points == 0 else 100 * raw_points / active_max_points
    )

    return {
        "requirement_coverage": round(requirement_coverage or 0.0, 2),
        "recruiter_weighted_priorities": round(recruiter_priorities or 0.0, 2),
        "resume_match_score": round(resume_match_score, 2),
    }
