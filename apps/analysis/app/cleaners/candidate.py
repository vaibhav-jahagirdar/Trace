import re
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


_CLAIM_ID = re.compile(r"^(?:claim_)?(\d+)$|^c(\d+)$")


def _canonicalize_claim_ids(value: Any) -> Any:
    """Normalize the compact IDs commonly emitted by the model.

    The contract uses ``claim_0001`` identifiers, but models sometimes emit
    ``c001``/``c1``. References occur in nested objects and in arrays (for
    example ``technologies``), so this must be a single recursive pass to
    keep every reference consistent before schema validation.
    """
    if isinstance(value, dict):
        return {key: _canonicalize_claim_ids(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_canonicalize_claim_ids(item) for item in value]
    if isinstance(value, str):
        match = _CLAIM_ID.fullmatch(value)
        if match:
            number = match.group(1) or match.group(2)
            return f"claim_{int(number):04d}"
    return value


def normalize_candidate(raw: dict) -> dict:
    """
    Clean and normalise the raw LLM candidate extraction so it
    always validates against CandidateExtractionLLMOutput.
    """
    # Make a deep, JSON-shaped copy while canonicalizing IDs. This also
    # prevents the cleaner from mutating the cached raw LLM response.
    candidate = _canonicalize_claim_ids(raw)

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
