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


def _expected_rating(score: int) -> RatingNoUndeterminable:
    if score >= 90:
        return "VERY_HIGH"
    if score >= 75:
        return "HIGH"
    if score >= 55:
        return "MEDIUM"
    if score >= 30:
        return "LOW"
    return "VERY_LOW"


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
            if self.rating != _expected_rating(self.score):
                raise ValueError("rating must match the score's anchored rubric band")
        return self


class DualAxisScoredField(BaseModel):
    """primary_evidence / secondary_evidence only."""
    model_config = ConfigDict(extra="forbid")

    relevance: ScoredField
    quality: ScoredField
    score: Optional[int] = Field(default=None, ge=0, le=100)
    rating: Rating
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId]

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self):
        axes_are_undeterminable = (
            self.relevance.rating == "UNDETERMINABLE"
            and self.quality.rating == "UNDETERMINABLE"
        )
        either_axis_is_undeterminable = (
            self.relevance.rating == "UNDETERMINABLE"
            or self.quality.rating == "UNDETERMINABLE"
        )

        if either_axis_is_undeterminable and not axes_are_undeterminable:
            raise ValueError(
                "relevance and quality must both be UNDETERMINABLE or both be scored"
            )

        if axes_are_undeterminable:
            if self.rating != "UNDETERMINABLE":
                raise ValueError(
                    "rating must be UNDETERMINABLE when both axes are UNDETERMINABLE"
                )
            if self.score is not None:
                raise ValueError(
                    "score must be null when both axes are UNDETERMINABLE"
                )
            if self.supporting_claim_ids:
                raise ValueError(
                    "supporting_claim_ids must be empty when both axes are UNDETERMINABLE"
                )
        else:
            if self.rating == "UNDETERMINABLE":
                raise ValueError("rating cannot be UNDETERMINABLE when axes are scored")
            if self.score is None:
                raise ValueError("score is required when axes are scored")
            if not self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids required when axes are scored")
            if self.rating != _expected_rating(self.score):
                raise ValueError("rating must match the score's anchored rubric band")

        return self


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
            if self.rating != _expected_rating(self.score):
                raise ValueError("rating must match the score's anchored rubric band")
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
    model_config = ConfigDict(extra="forbid")

    mandatory: RequirementCategory
    preferred: RequirementCategory
    bonus: RequirementCategory


# ---------------------------------------------------------------------------
# §4 Experience Analysis
# ---------------------------------------------------------------------------

ExperienceSource = Literal["WORK", "PROJECT"]


class RelevantExperience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    experience_id: ClaimId
    relevance_evidence: list[ClaimId]
    relevance_summary: str

    _check_summary = field_validator("relevance_summary")(_word_count_validator(30))


class ExperienceAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_source: ExperienceSource
    secondary_source: ExperienceSource
    relevant_experiences: list[RelevantExperience]
    experience_summary: str  # synthesis only — no new claims

    _check_summary = field_validator("experience_summary")(_word_count_validator(50))

    @model_validator(mode="after")
    def _check_sources_differ(self):
        if self.primary_source == self.secondary_source:
            raise ValueError("secondary_source must always be the other one")
        return self


# ---------------------------------------------------------------------------
# §5 Project Analysis
# ---------------------------------------------------------------------------

class PrioritizedProject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_id: ClaimId
    relevance_evidence: list[ClaimId]
    summary: str
    verification_value: Literal["HIGH", "MEDIUM", "LOW"]
    priority: int = Field(ge=1)  # 1 = highest
    repository_url: Optional[str] = None  # system-populated
    live_url: Optional[str] = None        # system-populated

    _check_summary = field_validator("summary")(_word_count_validator(30))


class ProjectAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prioritized_projects: list[PrioritizedProject]
    ignored_projects: list[ClaimId]  # extracted but not job-relevant; no penalty implied


# ---------------------------------------------------------------------------
# §6 Recruiter Rubric Alignment
# ---------------------------------------------------------------------------

class RecruiterRubric(BaseModel):
    model_config = ConfigDict(extra="forbid")

    evaluation_dimensions: list[RubricItem]  # from job's evaluationPriorities
    evidence_categories: list[RubricItem]    # from job's evidencePriorities
    success_signals: list[RubricItem]        # from job's successSignals


# ---------------------------------------------------------------------------
# §7 Bucket Scores
# ---------------------------------------------------------------------------

class TechnologyAlignment(ScoredField):
    model_config = ConfigDict(extra="forbid")

    mandatory_technologies_present: bool


class BucketScores(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_evidence: DualAxisScoredField      # max 25 pts downstream
    secondary_evidence: DualAxisScoredField    # max 10 pts downstream
    concept_alignment: ScoredField             # max 10 pts downstream
    technology_alignment: TechnologyAlignment  # max 5 pts downstream
    technical_claim_precision: ScoredField     # max 5 pts downstream
    supporting_signals: ScoredField            # max 5 pts downstream
    # requirement_coverage & recruiter_weighted_priorities intentionally absent —
    # Requirement and recruiter-priority points are computed downstream.


class ComputedScores(BaseModel):
    """Backend-owned scores attached after LLM output validation."""

    model_config = ConfigDict(extra="forbid")

    requirement_coverage: float = Field(ge=0, le=15)
    recruiter_weighted_priorities: float = Field(ge=0, le=25)
    resume_match_score: float = Field(ge=0, le=100)


# ---------------------------------------------------------------------------
# §8 Strengths & Gaps
# ---------------------------------------------------------------------------

class Strength(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str
    supporting_claim_ids: list[ClaimId]
    summary: str

    _check_summary = field_validator("summary")(_word_count_validator(25))


class Gap(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str
    supporting_claim_ids: list[ClaimId]  # empty allowed for MISSING-type gaps
    summary: str
    impact: Literal["HIGH", "MEDIUM", "LOW"]

    _check_summary = field_validator("summary")(_word_count_validator(25))


# ---------------------------------------------------------------------------
# §9 Verification Plan
# ---------------------------------------------------------------------------

ClaimType = Literal["RESPONSIBILITY", "ACHIEVEMENT", "IMPLEMENTATION", "ARCHITECTURAL", "MAJOR_FEATURE"]
Importance = Literal["CRITICAL", "HIGH", "MEDIUM"]


class VerificationTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    claim_type: ClaimType
    claim_summary: str
    related_project_id: Optional[ClaimId] = None
    importance: Importance
    why_verify: str
    search_hints: list[str] = Field(max_length=3)  # grounded in the claim, never invented

    _check_claim_summary = field_validator("claim_summary")(_word_count_validator(20))
    _check_why_verify = field_validator("why_verify")(_word_count_validator(25))


class VerificationPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    verification_targets: list[VerificationTarget]
    repository_strategy: str

    _check_strategy = field_validator("repository_strategy")(_word_count_validator(40))


# ---------------------------------------------------------------------------
# §10 Technical Outlier
# ---------------------------------------------------------------------------

class TechnicalOutlier(BaseModel):
    """Never affects score. May override repository-analysis gating."""
    model_config = ConfigDict(extra="forbid")

    is_outlier: bool
    supporting_claim_ids: list[ClaimId]  # required when is_outlier is true
    justification: str
    missing_requirements: list[str]
    repository_analysis_recommended: bool

    _check_justification = field_validator("justification")(_word_count_validator(40))

    @model_validator(mode="after")
    def _check_outlier_evidence(self):
        if self.is_outlier and not self.supporting_claim_ids:
            raise ValueError("supporting_claim_ids required when is_outlier is true")
        return self


# ---------------------------------------------------------------------------
# §11 Confidence (report-level)
# ---------------------------------------------------------------------------

class ReportConfidence(BaseModel):
    """Distinct from per-field confidence in §6/§7."""
    model_config = ConfigDict(extra="forbid")

    extraction_quality: Confidence  # copied from extraction.overall_extraction_confidence
    scoring_quality: Confidence     # LLM's own view of this report's internal coherence
    overall: Confidence             # min(extraction_quality, scoring_quality) — computed downstream


# ---------------------------------------------------------------------------
# §12 Overall Evaluation
# ---------------------------------------------------------------------------

class Overall(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overall_role_fit: Literal["EXCEPTIONAL", "STRONG", "GOOD", "MODERATE", "WEAK", "POOR"]
    repository_priority: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    # No resume_match_score (computed downstream).
    # No proceed_to_repository_analysis — downstream treats
    # repository_priority != LOW as default, with
    # technical_outlier.repository_analysis_recommended as explicit override.


# ---------------------------------------------------------------------------
# §13 Executive Summary
# ---------------------------------------------------------------------------

class ExecutiveSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recruiter_summary: str
    top_strengths: list[str] = Field(max_length=3)  # each traceable to a §8 strengths[].category
    primary_risks: list[str] = Field(max_length=3)   # each traceable to a §8 gaps[].category
    # No recommendation field — Stage 1 doesn't make hiring decisions.

    _check_summary = field_validator("recruiter_summary")(_word_count_validator(60))

    @field_validator("top_strengths")
    @classmethod
    def _check_strength_lengths(cls, v: list[str]) -> list[str]:
        for item in v:
            if len(item.split()) > 12:
                raise ValueError(f"each top_strength must be \u2264 12 words: {item!r}")
        return v

    @field_validator("primary_risks")
    @classmethod
    def _check_risk_lengths(cls, v: list[str]) -> list[str]:
        for item in v:
            if len(item.split()) > 12:
                raise ValueError(f"each primary_risk must be \u2264 12 words: {item!r}")
        return v


# ---------------------------------------------------------------------------
# Root model
# ---------------------------------------------------------------------------

class ResumeEvaluationReport(BaseModel):
    """Fully enriched report shape used after backend scoring."""
    model_config = ConfigDict(extra="forbid")

    metadata: Metadata
    role_fit: RoleFit
    requirement_analysis: RequirementAnalysis
    experience_analysis: ExperienceAnalysis
    project_analysis: ProjectAnalysis
    recruiter_rubric: RecruiterRubric
    bucket_scores: BucketScores
    computed_scores: ComputedScores
    strengths: list[Strength]
    gaps: list[Gap]
    verification_plan: VerificationPlan
    technical_outlier: TechnicalOutlier
    confidence: ReportConfidence
    overall: Overall
    executive_summary: ExecutiveSummary


class ResumeEvaluationReportLLMOutput(BaseModel):
    """What the LLM should actually be asked to produce — §1 restricted to
    schema_version, with system-populated metadata fields, resume_match_score,
    requirement_coverage, and recruiter_weighted_priorities all injected
    downstream rather than requested from the model."""
    model_config = ConfigDict(extra="forbid")

    metadata: MetadataLLMOutput
    role_fit: RoleFit
    requirement_analysis: RequirementAnalysis
    experience_analysis: ExperienceAnalysis
    project_analysis: ProjectAnalysis
    recruiter_rubric: RecruiterRubric
    bucket_scores: BucketScores
    strengths: list[Strength]
    gaps: list[Gap]
    verification_plan: VerificationPlan
    technical_outlier: TechnicalOutlier
    confidence: ReportConfidence
    overall: Overall
    executive_summary: ExecutiveSummary
