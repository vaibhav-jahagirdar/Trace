from __future__ import annotations

from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

# ---------------------------------------------------------------------------
# Type Aliases & Enums (shared)
# ---------------------------------------------------------------------------

ClaimId = Annotated[str, StringConstraints(pattern=r"^claim_\d{4}$")]

Rating = Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH", "UNDETERMINABLE"]
Confidence = Literal["HIGH", "MEDIUM", "LOW"]
PriorityType = Literal["MANDATORY", "PREFERRED", "BONUS"]
RequirementStatus = Literal["CONFIRMED", "UNCONFIRMED", "MISSING"]
ClaimType = Literal["RESPONSIBILITY", "ACHIEVEMENT", "IMPLEMENTATION", "ARCHITECTURAL", "MAJOR_FEATURE"]
Importance = Literal["CRITICAL", "HIGH", "MEDIUM"]
ExperienceSource = Literal["WORK", "PROJECT"]
AlignmentRating = Literal["HIGH", "MEDIUM", "LOW", "UNDETERMINABLE"]
OverallRoleFit = Literal["EXCEPTIONAL", "STRONG", "GOOD", "MODERATE", "WEAK", "POOR"]
RepositoryPriority = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
Impact = Literal["HIGH", "MEDIUM", "LOW"]

# ---------------------------------------------------------------------------
# Helper: expected rating from score
# ---------------------------------------------------------------------------

def _expected_rating(score: int) -> Literal["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]:
    if score >= 90:
        return "VERY_HIGH"
    if score >= 75:
        return "HIGH"
    if score >= 55:
        return "MEDIUM"
    if score >= 30:
        return "LOW"
    return "VERY_LOW"

# ---------------------------------------------------------------------------
# Shared Shapes (ScoredField, ScoreRating, DualAxisScoredField, etc.)
# ---------------------------------------------------------------------------

class ScoredField(BaseModel):
    """A single scored axis."""
    model_config = ConfigDict(extra="forbid")

    rating: Rating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId] = Field(default_factory=list)  # optional

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self) -> "ScoredField":
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


class ScoreRating(BaseModel):
    """Simple score+rating pair, with optional extra fields the LLM may emit."""
    model_config = ConfigDict(extra="forbid")

    score: Optional[int] = Field(default=None, ge=0, le=100)
    rating: Rating
    confidence: Optional[Confidence] = None
    supporting_claim_ids: list[ClaimId] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self) -> "ScoreRating":
        if self.rating == "UNDETERMINABLE" and self.score is not None:
            raise ValueError("score must be null when rating is UNDETERMINABLE")
        if self.rating != "UNDETERMINABLE" and self.score is None:
            raise ValueError("score is required unless rating is UNDETERMINABLE")
        return self


class DualAxisScoredField(BaseModel):
    """Used for primary_evidence and secondary_evidence."""
    model_config = ConfigDict(extra="forbid")

    source_type: ExperienceSource
    relevance: ScoreRating
    quality: ScoreRating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    rating: Rating
    confidence: Confidence
    summary: str
    supporting_claim_ids: list[ClaimId] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_dual_axis_consistency(self) -> "DualAxisScoredField":
        relevance_und = self.relevance.rating == "UNDETERMINABLE"
        quality_und = self.quality.rating == "UNDETERMINABLE"

        if relevance_und != quality_und:
            raise ValueError("relevance and quality must both be UNDETERMINABLE or both be scored")

        if relevance_und:  # both und
            if self.rating != "UNDETERMINABLE":
                raise ValueError("rating must be UNDETERMINABLE when both axes are UNDETERMINABLE")
            if self.score is not None:
                raise ValueError("score must be null when axes are UNDETERMINABLE")
            if self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids must be empty when axes are UNDETERMINABLE")
        else:
            if self.rating == "UNDETERMINABLE":
                raise ValueError("rating cannot be UNDETERMINABLE when axes are scored")
            if self.score is None:
                raise ValueError("score is required when axes are scored")
            if self.rating != _expected_rating(self.score):
                raise ValueError("rating must match the score's anchored rubric band")
        return self


class TechnologyAlignment(ScoredField):
    mandatory_technologies_present: bool


class QualificationAlignment(ScoredField):
    mandatory_qualifications_present: bool


class SupportingSignalItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    priority_type: PriorityType
    rating: Rating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    note: str
    supporting_claim_ids: list[ClaimId] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_undeterminable_consistency(self) -> "SupportingSignalItem":
        if self.rating == "UNDETERMINABLE":
            if self.score is not None:
                raise ValueError("score must be null when rating is UNDETERMINABLE")
            if self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids must be empty when rating is UNDETERMINABLE")
        else:
            if self.score is None:
                raise ValueError("score is required unless rating is UNDETERMINABLE")
        return self


class SupportingSignals(ScoredField):
    signals: list[SupportingSignalItem] = Field(default_factory=list)


class BucketScores(BaseModel):
    model_config = ConfigDict(extra="forbid")

    primary_evidence: DualAxisScoredField
    secondary_evidence: DualAxisScoredField
    concept_alignment: ScoredField
    technology_alignment: TechnologyAlignment
    qualification_alignment: QualificationAlignment
    supporting_signals: SupportingSignals

# ---------------------------------------------------------------------------
# Requirement Analysis
# ---------------------------------------------------------------------------

class RequirementAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    status: RequirementStatus
    supporting_claim_ids: list[ClaimId]
    note: str

    @model_validator(mode="after")
    def _check_status_evidence(self) -> "RequirementAssessment":
        if self.status == "MISSING":
            if self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids must be empty when status is MISSING")
        else:
            if not self.supporting_claim_ids:
                raise ValueError("supporting_claim_ids required unless status is MISSING")
        return self


class RequirementCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    technologies: list[RequirementAssessment] = Field(default_factory=list)
    concepts: list[RequirementAssessment] = Field(default_factory=list)
    qualifications: list[RequirementAssessment] = Field(default_factory=list)


class RequirementAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mandatory: RequirementCategory
    preferred: RequirementCategory
    bonus: RequirementCategory

# ---------------------------------------------------------------------------
# Project Analysis
# ---------------------------------------------------------------------------

class PrioritizedProject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_id: ClaimId
    relevance: ScoreRating
    quality: ScoreRating
    score: Optional[int] = Field(default=None, ge=0, le=100)
    rating: Rating
    priority: int = Field(ge=1)
    repository_url: Optional[str] = None
    summary: str
    supporting_claim_ids: list[ClaimId] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_scoring_consistency(self) -> "PrioritizedProject":
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


class ProjectAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prioritized_projects: list[PrioritizedProject] = Field(default_factory=list)
    ignored_projects: list[ClaimId] = Field(default_factory=list)

# ---------------------------------------------------------------------------
# Score Rationale
# ---------------------------------------------------------------------------

class ScoreDriverUp(BaseModel):
    """Driver for upward score movement (no impact field)."""
    model_config = ConfigDict(extra="forbid")

    claim_ids: list[ClaimId]
    reason: str

    @field_validator("reason")
    @classmethod
    def _limit_reason_words(cls, v: str) -> str:
        if len(v.split()) > 15:
            raise ValueError("reason must be ≤ 15 words")
        return v


class ScoreDriverDown(BaseModel):
    """Driver for downward score movement (includes impact for triage)."""
    model_config = ConfigDict(extra="forbid")

    claim_ids: list[ClaimId]
    reason: str
    impact: Impact

    @field_validator("reason")
    @classmethod
    def _limit_reason_words(cls, v: str) -> str:
        if len(v.split()) > 15:
            raise ValueError("reason must be ≤ 15 words")
        return v


class ScoreRationale(BaseModel):
    model_config = ConfigDict(extra="forbid")

    drivers_up: list[ScoreDriverUp] = Field(default_factory=list)
    drivers_down: list[ScoreDriverDown] = Field(default_factory=list)

# ---------------------------------------------------------------------------
# Verification Plan
# ---------------------------------------------------------------------------

class VerificationTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    claim_type: ClaimType
    related_project_id: Optional[ClaimId] = None
    importance: Importance
    search_hints: list[str] = Field(default_factory=list, max_length=3)


class VerificationPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    verification_targets: list[VerificationTarget] = Field(default_factory=list, max_length=5)

# ---------------------------------------------------------------------------
# Confidence & Overall
# ---------------------------------------------------------------------------

class ReportConfidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    extraction_quality: Confidence
    scoring_quality: Confidence
    overall: Confidence


class OverallEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overall_role_fit: OverallRoleFit
    repository_priority: RepositoryPriority

# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------

class MetadataLLMOutput(BaseModel):
    """What the LLM emits – only schema_version."""
    model_config = ConfigDict(extra="forbid")
    schema_version: str = "v4"


class MetadataFull(BaseModel):
    """Full metadata with system‑populated fields (for stored report)."""
    model_config = ConfigDict(extra="forbid")

    schema_version: str = "v4"
    job_id: str
    application_id: str
    extraction_id: str
    model: str
    timestamp: str
    evaluation_duration_ms: int = Field(ge=0)


# ---------------------------------------------------------------------------
# Computed Scores (backend-owned)
# ---------------------------------------------------------------------------

class ComputedScores(BaseModel):
    """Scores computed downstream, never emitted by the LLM."""
    model_config = ConfigDict(extra="forbid")

    requirement_coverage: float = Field(ge=0, le=15)
    recruiter_weighted_priorities: float = Field(ge=0, le=25)
    resume_match_score: float = Field(ge=0, le=100)


# ---------------------------------------------------------------------------
# Root Models
# ---------------------------------------------------------------------------

class ResumeEvaluationReportLLMOutput(BaseModel):
    """The LLM‑generated report (metadata only schema_version)."""
    model_config = ConfigDict(extra="forbid")

    metadata: MetadataLLMOutput
    requirement_analysis: RequirementAnalysis
    project_analysis: ProjectAnalysis
    bucket_scores: BucketScores
    score_rationale: ScoreRationale
    decision_critical_claims: list[ClaimId] = Field(default_factory=list, max_length=5)
    verification_plan: VerificationPlan
    confidence: ReportConfidence
    overall: OverallEvaluation


class ResumeEvaluationReport(BaseModel):
    """Full enriched report with system‑provided metadata and computed scores."""
    model_config = ConfigDict(extra="forbid")

    metadata: MetadataFull
    requirement_analysis: RequirementAnalysis
    project_analysis: ProjectAnalysis
    bucket_scores: BucketScores
    computed_scores: ComputedScores
    score_rationale: ScoreRationale
    decision_critical_claims: list[ClaimId] = Field(default_factory=list, max_length=5)
    verification_plan: VerificationPlan
    confidence: ReportConfidence
    overall: OverallEvaluation