from typing import Any, Set

from app.cleaners.base import validate_llm_output
from app.schemas.candidate import CandidateExtractionLLMOutput


def _collect_all_claim_ids_from_dict(obj: Any) -> Set[str]:
    """Recursively collect all claim_id values from a nested structure."""
    ids = set()
    if isinstance(obj, dict):
        if "claim_id" in obj:
            ids.add(obj["claim_id"])
        for v in obj.values():
            ids.update(_collect_all_claim_ids_from_dict(v))
    elif isinstance(obj, list):
        for item in obj:
            ids.update(_collect_all_claim_ids_from_dict(item))
    return ids


def normalize_candidate(raw: dict) -> dict:
    """
    Clean and normalise the raw LLM candidate extraction so it
    always validates against CandidateExtractionLLMOutput.
    """
    candidate = dict(raw)  # shallow copy

    # 1. Strip system‑added metadata (they will be added later)
    if "metadata" in candidate and isinstance(candidate["metadata"], dict):
        candidate["metadata"].pop("extraction_timestamp", None)
        candidate["metadata"].pop("parser_version", None)

    # 2. Remove miscellaneous_claims with null 'claim'
    misc = candidate.get("miscellaneous_claims")
    if isinstance(misc, list):
        candidate["miscellaneous_claims"] = [
            entry for entry in misc
            if isinstance(entry, dict) and entry.get("claim") is not None
        ]

    # 3. Fix invalid contexts (any unknown value → "Other")
    ALLOWED_CONTEXTS = {"Work Experience", "Project", "Skills Section", "Summary", "Other"}
    for tech in candidate.get("technologies", []):
        if isinstance(tech, dict) and "contexts" in tech:
            tech["contexts"] = [
                "Other" if ctx not in ALLOWED_CONTEXTS else ctx
                for ctx in tech.get("contexts", [])
            ]
    for concept in candidate.get("concepts", []):
        if isinstance(concept, dict) and "contexts" in concept:
            concept["contexts"] = [
                "Other" if ctx not in ALLOWED_CONTEXTS else ctx
                for ctx in concept.get("contexts", [])
            ]

    # 4. Recalculate claim_count based on actual claim IDs
    all_claim_ids = _collect_all_claim_ids_from_dict(candidate)
    if "metadata" in candidate and isinstance(candidate["metadata"], dict):
        candidate["metadata"]["claim_count"] = len(all_claim_ids)

    # 5. Validate against the schema (now with relaxed claim_count check)
    return validate_llm_output(
        raw=candidate,
        schema=CandidateExtractionLLMOutput,
        schema_name="CandidateExtractionLLMOutput",
    )