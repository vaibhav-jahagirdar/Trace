from datetime import UTC, datetime

from app.cleaners.base import validate_llm_output
from app.schemas.candidate import CandidateExtractionOutput

PARSER_VERSION = "1.0"


def normalize_candidate(raw: dict) -> dict:
    """Attach metadata that the model cannot truthfully know."""
    candidate = dict(raw)
    model_metadata = dict(candidate.get("metadata") or {})
    candidate["metadata"] = {
        "schema_version": model_metadata.get("schema_version"),
        "extraction_timestamp": datetime.now(UTC),
        "parser_version": PARSER_VERSION,
        "overall_extraction_confidence": model_metadata.get(
            "overall_extraction_confidence"
        ),
        "claim_count": model_metadata.get("claim_count"),
    }

    return validate_llm_output(
        raw=candidate,
        schema=CandidateExtractionOutput,
        schema_name="CandidateExtractionOutput",
    )
