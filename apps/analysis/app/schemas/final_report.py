from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


# ---------------------------------------------------------------------------
# Shared enums (as Literals)
# ---------------------------------------------------------------------------

from typing import Literal

Rating = Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH", "UNDETERMINABLE"]
RatingNoUndeterminable = Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
Confidence = Literal["HIGH", "MEDIUM", "LOW"]
PriorityType = Literal["MANDATORY", "PREFERRED", "BONUS"]
RequirementStatus = Literal["CONFIRMED", "UNCONFIRMED", "MISSING"]
ClaimId = str  # e.g. "claim_0001"


def _word_count_validator(max_words: int):
    def _validate(v: str) -> str:
        if v and len(v.split()) > max_words:
            raise ValueError(f"must be \u2264 {max_words} words, got {len(v.split())}")
        return v
    return _validate


# ---------------------------------------------------------------------------
# Shared shapes
# ---------------------------------------------------------------------------

class ScoredField(BaseModel):
    """Every single-axis scored item in the report."""
    model_config = ConfigDict(extra="forbid")

    rating: Rating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId]

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self):
        if self.rating == "UNDETERMINABLE":
            if self.score is not None:
                raise ValueError("score must be null when rating is UNDETERMINABLE")
            if self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids must be empty when rating is UNDETERMINABLE")
        else:
            if self.score is None:
                raise ValueError("score is required unless rating is UNDETERMINABLE")
            if not self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids required — no supporting claim, no conclusion")
        return self


class DualAxisScoredField(BaseModel):
    """primary_evidence / secondary_evidence only."""
    model_config = ConfigDict(extra="forbid")

    relevance: ScoredField
    quality: ScoredField
    score: int = Field(ge=0, le=100)  # avg(relevance.score, quality.score), recall-bias-adjusted downstream
    rating: RatingNoUndeterminable
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId]


class RubricItem(BaseModel):
    """Every item in recruiter_rubric."""
    model_config = ConfigDict(extra="forbid")

    code: str
    priority_type: PriorityType  # copied from job context — see Open Dependency note
    rating: Rating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId]

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self):
        if self.rating == "UNDETERMINABLE":
            if self.score is not None:
                raise ValueError("score must be null when rating is UNDETERMINABLE")
            if self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids must be empty when rating is UNDETERMINABLE")
        else:
            if self.score is None:
                raise ValueError("score is required unless rating is UNDETERMINABLE")
        return self


# ---------------------------------------------------------------------------
# §1 Metadata
# ---------------------------------------------------------------------------

class Metadata(BaseModel):
    """Only schema_version is ever model output; the rest are system-populated
    post-generation. Kept here as required fields because this model
    represents the *stored* report, not the raw LLM completion."""
    model_config = ConfigDict(extra="forbid")

    schema_version: str
    job_id: UUID
    application_id: UUID
    extraction_id: UUID
    model: str
    timestamp: datetime
    evaluation_duration_ms: int = Field(ge=0)


class MetadataLLMOutput(BaseModel):
    """What the model is actually allowed to emit for §1."""
    model_config = ConfigDict(extra="forbid")

    schema_version: str


# ---------------------------------------------------------------------------
# §2 Role Fit
# ---------------------------------------------------------------------------

AlignmentRating = Literal["HIGH", "MEDIUM", "LOW", "UNDETERMINABLE"]


class RoleFit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role_alignment_evidence: list[ClaimId]
    role_alignment_summary: str
    role_alignment: AlignmentRating

    responsibility_alignment_evidence: list[ClaimId]
    responsibility_alignment_summary: str
    responsibility_alignment: AlignmentRating

    domain_alignment_evidence: list[ClaimId]
    domain_alignment_summary: str
    domain_alignment: AlignmentRating

    _check_role = field_validator("role_alignment_summary")(_word_count_validator(25))
    _check_resp = field_validator("responsibility_alignment_summary")(_word_count_validator(25))
    _check_domain = field_validator("domain_alignment_summary")(_word_count_validator(25))


# ---------------------------------------------------------------------------
# §3 Requirement Analysis
# ---------------------------------------------------------------------------

class RequirementAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    status: RequirementStatus
    supporting_claim_ids: list[ClaimId]
    note: str

    _check_note = field_validator("note")(_word_count_validator(20))

    @model_validator(mode="after")
    def _check_missing_has_no_claims(self):
        if self.status == "MISSING" and self.supporting_claim_ids:
            raise ValueError("supporting_claim_ids must be empty when status is MISSING")
        if self.status != "MISSING" and not self.supporting_claim_ids:
            raise ValueError("supporting_claim_ids required unless status is MISSING")
        return self


class RequirementCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    technologies: list[RequirementAssessment]
    concepts: list[RequirementAssessment]


class RequirementAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid"