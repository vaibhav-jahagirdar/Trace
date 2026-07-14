from typing import Any, Type

from pydantic import BaseModel, ValidationError


_FIELD_ALIASES = {
    "work_experiences": "work_experience",
    "project": "projects",
    "technology": "technologies",
    "concept": "concepts",
    "achievement": "achievements",
    "certification": "certifications",
    "publication": "publications",
    "language": "languages",
    "link": "links",
    "miscellaneous": "miscellaneous_claims",
}


def _normalize_empty_dual_axis_evidence(value: Any) -> None:
    """Represent an evidence source with no claims as unjudgeable, not zero."""
    if not isinstance(value, dict):
        return

    bucket_scores = value.get("bucket_scores")
    if not isinstance(bucket_scores, dict):
        return

    for field_name in ("primary_evidence", "secondary_evidence"):
        evidence = bucket_scores.get(field_name)
        if not isinstance(evidence, dict):
            continue

        relevance = evidence.get("relevance")
        quality = evidence.get("quality")
        if not isinstance(relevance, dict) or not isinstance(quality, dict):
            continue

        if relevance.get("supporting_claim_ids") or quality.get("supporting_claim_ids"):
            continue

        for axis in (relevance, quality):
            axis["rating"] = "UNDETERMINABLE"
            axis["score"] = None
            axis["supporting_claim_ids"] = []

        evidence["rating"] = "UNDETERMINABLE"
        evidence["score"] = None
        evidence["supporting_claim_ids"] = []


def _normalize(value: Any, *, is_root: bool = False) -> Any:
    if isinstance(value, dict):
        normalized: dict[str, Any] = {}

        for key, val in value.items():
            # These aliases are names of top-level collection fields. Applying
            # them recursively corrupts legitimate nested fields such as
            # languages[].language into languages[].languages.
            normalized_key = _FIELD_ALIASES.get(key, key) if is_root else key
            normalized[normalized_key] = _normalize(val)

        # ---- Type normalizations ----

        extraction_report = normalized.get("extraction_report")
        if isinstance(extraction_report, dict):
            for field in (
                "missing_sections",
                "ambiguous_entities",
                "low_confidence_entities",
                "duplicate_entities",
                "ignored_content",
                "parsing_notes",
            ):
                v = extraction_report.get(field)

                if v is None:
                    extraction_report[field] = []

                elif isinstance(v, str):
                    extraction_report[field] = [v]

        return normalized

    if isinstance(value, list):
        return [_normalize(v) for v in value]

    return value


def validate_llm_output(
    raw: dict[str, Any],
    schema: Type[BaseModel],
    schema_name: str,
) -> dict:
    normalized = _normalize(raw, is_root=True)
    _normalize_empty_dual_axis_evidence(normalized)

    try:
        validated = schema.model_validate(normalized)
    except ValidationError as exc:
        raise ValueError(
            f"{schema_name}: schema validation failed.\n{exc}"
        ) from exc

    return validated.model_dump(
        mode="json",
        exclude_none=True,
    )
