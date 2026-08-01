from __future__ import annotations

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator, model_validator

# ---------------------------------------------------------------------------
# Enums (using Literal)
# ---------------------------------------------------------------------------

DiscoveryQuality = Literal["HIGH", "MEDIUM", "LOW"]
Stage1Relationship = Literal["MATCHED", "POSSIBLE_MATCH", "UNLINKED", "NO_STAGE_1_PROJECT"]
RetrievalDisposition = Literal["REQUIRED", "EXPLORATORY", "SKIP"]
EvidencePriority = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
PlanningConfidence = Literal["HIGH", "MEDIUM", "LOW"]
ObjectiveImportance = Literal["CRITICAL", "HIGH", "MEDIUM"]
DependencyClosurePolicy = Literal["NONE", "DIRECT_LOCAL_IMPORTS", "TRANSITIVE_TO_BOUNDARY"]
CoverageStatus = Literal["PLANNED", "NO_PLAUSIBLE_REPOSITORY", "NOT_RETRIEVABLE_FROM_DISCOVERY"]

# ---------------------------------------------------------------------------
# Nested schemas
# ---------------------------------------------------------------------------

class StructuralObservation(BaseModel):
    """A structural observation about a repository, grounded in discovery."""
    observation: str = Field(..., max_length=25)
    evidence_paths: List[str] = Field(..., min_length=1)

    @field_validator("evidence_paths")
    def validate_paths(cls, v: List[str]) -> List[str]:
        for path in v:
            if not path or path.startswith("/") or path.endswith("/"):
                raise ValueError(f"Invalid path format: '{path}'. Paths must not have leading/trailing slashes.")
        return v


class DomainAllocation(BaseModel):
    """Allocation of attention across engineering domains within a repository."""
    domain: str
    attention_weight: int = Field(..., ge=1, le=100)
    rationale: str = Field(..., max_length=20)
    evidence_paths: List[str] = Field(..., min_length=1)

    @field_validator("evidence_paths")
    def validate_paths(cls, v: List[str]) -> List[str]:
        for path in v:
            if not path or path.startswith("/") or path.endswith("/"):
                raise ValueError(f"Invalid path format: '{path}'. Paths must not have leading/trailing slashes.")
        return v


class EvidenceObjective(BaseModel):
    """A concrete retrieval objective for a single evidence target."""
    objective_id: str = Field(..., pattern=r"^objective_\d{3}$")
    importance: ObjectiveImportance
    source_claim_ids: List[str] = Field(default_factory=list)  # claim_xxxx
    job_requirement_names: List[str] = Field(default_factory=list)
    domain: str
    objective: str = Field(..., max_length=30)
    seed_paths: List[str] = Field(..., min_length=1)
    dependency_closure_policy: DependencyClosurePolicy
    include_related_configuration: bool
    completion_condition: str = Field(..., max_length=35)
    selection_rationale: str = Field(..., max_length=30)

    @field_validator("seed_paths")
    def validate_paths(cls, v: List[str]) -> List[str]:
        for path in v:
            if not path or path.startswith("/") or path.endswith("/"):
                raise ValueError(f"Invalid path format: '{path}'. Paths must not have leading/trailing slashes.")
        return v

    @model_validator(mode="after")
    def check_evidence_source(self) -> "EvidenceObjective":
        if not self.source_claim_ids and not self.job_requirement_names:
            raise ValueError("At least one of source_claim_ids or job_requirement_names must be non-empty.")
        return self


class RepositoryPlan(BaseModel):
    """Plan for a single repository."""
    repository_id: str
    repository_name: str
    stage_1_relationship: Stage1Relationship
    linked_stage_1_project_ids: List[str] = Field(default_factory=list)
    retrieval_disposition: RetrievalDisposition
    evidence_priority: EvidencePriority
    candidate_attention_weight: int = Field(ge=0, le=100)
    planning_confidence: PlanningConfidence
    priority_rationale: str = Field(..., max_length=35)
    structural_observations: List[StructuralObservation] = Field(default_factory=list)
    domain_allocations: List[DomainAllocation] = Field(default_factory=list)
    evidence_objectives: List[EvidenceObjective] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_non_skip_constraints(self) -> "RepositoryPlan":
        if self.retrieval_disposition == "SKIP":
            if self.candidate_attention_weight != 0:
                raise ValueError("SKIP repository must have candidate_attention_weight = 0")
            if self.domain_allocations:
                raise ValueError("SKIP repository must have empty domain_allocations")
            if self.evidence_objectives:
                raise ValueError("SKIP repository must have empty evidence_objectives")
        else:
            if not self.structural_observations:
                raise ValueError("REQUIRED/EXPLORATORY repository must have at least one structural_observation")
            if not self.domain_allocations:
                raise ValueError("REQUIRED/EXPLORATORY repository must have domain_allocations")
            if not self.evidence_objectives:
                raise ValueError("REQUIRED/EXPLORATORY repository must have evidence_objectives")
            # Domain weights sum to 100
            total_domain_weight = sum(da.attention_weight for da in self.domain_allocations)
            if total_domain_weight != 100:
                raise ValueError(f"Domain attention weights must sum to 100, got {total_domain_weight}")
        return self


class TargetCoverage(BaseModel):
    """Coverage status for a Stage 1 claim."""
    claim_id: str = Field(..., pattern=r"^claim_\d{4}$")
    status: CoverageStatus
    repository_ids: List[str] = Field(default_factory=list)
    objective_ids: List[str] = Field(default_factory=list)
    note: str = Field(..., max_length=25)

    @model_validator(mode="after")
    def check_status_consistency(self) -> "TargetCoverage":
        if self.status == "PLANNED":
            if not self.repository_ids or not self.objective_ids:
                raise ValueError("PLANNED status requires at least one repository_id and one objective_id")
        else:
            if self.repository_ids or self.objective_ids:
                raise ValueError(f"Status '{self.status}' must have empty repository_ids and objective_ids")
        return self


class RetrievalExecutionSeedPath(BaseModel):
    """A single deduplicated seed path for retrieval."""
    repository_id: str
    path: str
    objective_ids: List[str] = Field(..., min_length=1)

    @field_validator("path")
    def validate_path(cls, v: str) -> str:
        if not v or v.startswith("/") or v.endswith("/"):
            raise ValueError(f"Invalid path format: '{v}'. Paths must not have leading/trailing slashes.")
        return v


class RetrievalExecution(BaseModel):
    """Retrieval execution plan."""
    deduplicated_seed_paths: List[RetrievalExecutionSeedPath] = Field(default_factory=list)
    post_retrieval_escalation_rule: str = Field(..., max_length=100)


class PlanningSummary(BaseModel):
    """High-level planning summary."""
    stage_1_anchor_check: str = Field(..., max_length=40)
    discovery_quality: DiscoveryQuality
    material_data_gaps: List[str] = Field(default_factory=list, max_length=10)  # each <= 20 words

    @field_validator("material_data_gaps")
    def validate_gap_length(cls, v: List[str]) -> List[str]:
        for gap in v:
            if len(gap.split()) > 20:
                raise ValueError(f"Material data gap exceeds 20 words: '{gap}'")
        return v


class Metadata(BaseModel):
    """Metadata for the planner output."""
    schema_version: Literal["v1"] = "v1"


class PlannerOutput(BaseModel):
    """Root model for the repository planner output."""
    metadata: Metadata
    planning_summary: PlanningSummary
    repository_plans: List[RepositoryPlan] = Field(..., min_length=1)
    target_coverage: List[TargetCoverage] = Field(..., min_length=1)
    retrieval_execution: RetrievalExecution

    @model_validator(mode="after")
    def check_attention_weight_total(self) -> "PlannerOutput":
        non_skip_plans = [p for p in self.repository_plans if p.retrieval_disposition != "SKIP"]
        if non_skip_plans:
            total = sum(p.candidate_attention_weight for p in non_skip_plans)
            if total != 100:
                raise ValueError(f"Total candidate_attention_weight for non-SKIP repos must be 100, got {total}")
        return self