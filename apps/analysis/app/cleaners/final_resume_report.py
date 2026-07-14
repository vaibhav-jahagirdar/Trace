from copy import deepcopy
from typing import Any

from app.cleaners.base import validate_llm_output
from app.schemas.evaluation_context import EvaluationContextDto
from app.schemas.final_report import ResumeEvaluationReportLLMOutput


def _validate_job_bound_sections(
    report: dict[str, Any],
    job_context: EvaluationContextDto,
) -> None:
    """Reject model output that omits, duplicates, or renames job criteria."""

    for tier in ("mandatory", "preferred", "bonus"):
        expected_items = getattr(job_context.requirements, tier)
        actual_category = report["requirement_analysis"][tier]
        for requirement_type, key in (("TECHNOLOGY", "technologies"), ("CONCEPT", "concepts")):
            expected_names = [
                item.name for item in expected_items if item.type == requirement_type
            ]
            actual_names = [item["name"] for item in actual_category[key]]
            if actual_names != expected_names:
                raise ValueError(
                    f"requirement_analysis.{tier}.{key} must contain the job's "
                    f"configured items exactly and in order."
                )

    rubric_sections = (
        ("evaluation_dimensions", job_context.evaluationPriorities),
        ("evidence_categories", job_context.evidencePriorities),
        ("success_signals", job_context.successSignals),
    )
    for section, configured_items in rubric_sections:
        actual_items = report["recruiter_rubric"][section]
        expected_codes = [item.code for item in configured_items]
        actual_codes = [item["code"] for item in actual_items]
        if actual_codes != expected_codes:
            raise ValueError(
                f"recruiter_rubric.{section} must contain the job's configured "
                "items exactly and in order."
            )

        for actual, configured in zip(actual_items, configured_items, strict=True):
            if actual["priority_type"] != configured.priority_type:
                raise ValueError(
                    f"recruiter_rubric.{section}.{actual['code']} has a priority "
                    "tier that does not match the job context."
                )


def _collect_candidate_claim_ids(candidate: Any) -> set[str]:
    if isinstance(candidate, list):
        return set().union(*(_collect_candidate_claim_ids(item) for item in candidate))
    if not isinstance(candidate, dict):
        return set()

    claim_ids = {candidate["claim_id"]} if "claim_id" in candidate else set()
    for value in candidate.values():
        claim_ids.update(_collect_candidate_claim_ids(value))
    return claim_ids


_EVALUATION_CLAIM_REFERENCE_FIELDS = {
    "role_alignment_evidence",
    "responsibility_alignment_evidence",
    "domain_alignment_evidence",
    "supporting_claim_ids",
    "relevance_evidence",
    "experience_id",
    "project_id",
    "related_project_id",
    "claim_id",
}


def validate_evaluation_claim_references(
    report: dict[str, Any],
    candidate: dict[str, Any],
) -> None:
    """Ensure every evaluation citation resolves to this candidate's claims."""

    known_claim_ids = _collect_candidate_claim_ids(candidate)
    referenced_claim_ids: set[str] = set()

    def visit(value: Any, key: str | None = None) -> None:
        if isinstance(value, dict):
            for child_key, child_value in value.items():
                visit(child_value, child_key)
        elif isinstance(value, list):
            for child in value:
                visit(child, key)
        elif key in _EVALUATION_CLAIM_REFERENCE_FIELDS and value is not None:
            referenced_claim_ids.add(value)

    visit(report)
    unknown_claim_ids = sorted(referenced_claim_ids - known_claim_ids)
    if unknown_claim_ids:
        raise ValueError(
            "Evaluation references claim_ids absent from the candidate extraction: "
            f"{unknown_claim_ids}"
        )


def normalize_final_resume_report(
    raw: dict,
    job_context: EvaluationContextDto,
) -> dict:
    """Apply loss-minimizing repairs for bounded auxiliary model output."""
    report = deepcopy(raw)
    targets = (
        report.get("verification_plan", {})
        if isinstance(report, dict)
        else {}
    ).get("verification_targets", [])

    if isinstance(targets, list):
        for target in targets:
            if not isinstance(target, dict):
                continue
            hints = target.get("search_hints")
            if isinstance(hints, list) and len(hints) > 3:
                target["search_hints"] = hints[:3]

    normalized = validate_llm_output(
        raw=report,
        schema=ResumeEvaluationReportLLMOutput,
        schema_name="ResumeEvaluationReport",
    )
    _validate_job_bound_sections(normalized, job_context)
    return normalized
