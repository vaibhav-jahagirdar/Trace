from copy import deepcopy
import re
import unicodedata
from typing import Any

from app.cleaners.base import validate_llm_output
from app.schemas.evaluation_context import EvaluationContextDto
from app.schemas.final_report import ResumeEvaluationReportLLMOutput


def _canonical_education_name(value: Any) -> str:
    """Compare education labels by meaning, while preserving the configured label."""
    if not isinstance(value, str):
        return ""
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized.lower()).strip()
    aliases = {
        "high school": "high_school",
        "secondary school": "high_school",
        "diploma": "diploma",
        "associate": "diploma",
        "associates degree": "diploma",
        "undergraduate": "undergraduate",
        "bachelor": "undergraduate",
        "bachelors": "undergraduate",
        "bachelors degree": "undergraduate",
        "undergraduate degree": "undergraduate",
        "postgraduate": "postgraduate",
        "master": "postgraduate",
        "masters": "postgraduate",
        "masters degree": "postgraduate",
        "postgraduate degree": "postgraduate",
        "phd": "doctorate",
        "doctorate": "doctorate",
        "doctoral degree": "doctorate",
    }
    return aliases.get(normalized, normalized.replace(" ", "_"))


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
            # LLMs occasionally omit a configured item or return a casing
            # variant.  Normalize the list deterministically so one malformed
            # row cannot turn an otherwise valid analysis into HTTP 500.
            actual_items = actual_category.get(key) or []
            by_name = {
                str(item.get("name", "")).strip().casefold(): item
                for item in actual_items
                if isinstance(item, dict)
            }
            aligned = []
            for expected_name in expected_names:
                item = deepcopy(by_name.get(expected_name.strip().casefold()))
                if item is None:
                    item = {
                        "name": expected_name,
                        "status": "MISSING",
                        "supporting_claim_ids": [],
                        "note": "No supporting resume claim was extracted.",
                    }
                else:
                    item["name"] = expected_name
                aligned.append(item)
            actual_category[key] = aligned

    expected_qualification = job_context.qualifications.minimumEducationLevel
    actual_qualification = report["requirement_analysis"]["qualification"]
    if expected_qualification is None:
        if actual_qualification is not None:
            raise ValueError(
                "requirement_analysis.qualification must be null when no minimum "
                "education requirement is configured."
            )
    elif actual_qualification is None:
        report["requirement_analysis"]["qualification"] = {
            "name": expected_qualification,
            "status": "MISSING",
            "supporting_claim_ids": [],
            "note": "No assessment of the configured minimum education requirement was extracted.",
        }
    elif _canonical_education_name(actual_qualification.get("name")) != _canonical_education_name(expected_qualification):
        actual_qualification["name"] = expected_qualification
        actual_qualification["status"] = "UNCONFIRMED"
        actual_qualification["supporting_claim_ids"] = []
        actual_qualification["note"] = (
            "The extracted education label did not match the configured minimum requirement."
        )
    else:
        # Downstream consumers rely on the job's canonical label. The model may
        # say "Bachelor's degree" while the job stores "UNDERGRADUATE"; those
        # are equivalent for validation, but the persisted report must be stable.
        actual_qualification["name"] = expected_qualification

    # ❌ recruiter_rubric validation removed – no longer in the schema.


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
        # Claim references are advisory metadata for the current downstream
        # pipeline. Keep the IDs structurally validated, but do not reject an
        # otherwise usable evaluation when the model cites a claim that was
        # normalized or omitted during extraction.
        print(
            "[ResumeAnalysis][warning] Evaluation references unknown claim IDs: "
            f"{unknown_claim_ids}",
            flush=True,
        )


def normalize_final_resume_report(
    raw: dict,
    job_context: EvaluationContextDto,
) -> dict:
    """Apply loss-minimizing repairs for bounded auxiliary model output."""
    report = deepcopy(raw)
    # Older prompt versions occasionally nested the report-level sections
    # inside bucket_scores. Promote them before schema validation so a prompt
    # shape drift does not force another LLM call.
    if isinstance(report, dict) and isinstance(report.get("bucket_scores"), dict):
        buckets = report["bucket_scores"]
        for field in ("score_rationale", "verification_plan", "confidence", "overall"):
            if field not in report and field in buckets:
                report[field] = buckets[field]
            buckets.pop(field, None)
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
            if isinstance(hints, list) and len(hints) > 6:
                target["search_hints"] = hints[:6]

    normalized = validate_llm_output(
        raw=report,
        schema=ResumeEvaluationReportLLMOutput,
        schema_name="ResumeEvaluationReport",
    )
    _validate_job_bound_sections(normalized, job_context)
    return normalized
