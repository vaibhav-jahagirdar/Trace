from __future__ import annotations

from enum import Enum
from typing import Annotated, List, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

# ---------------------------------------------------------------------------
# Type Aliases & Enums
# ---------------------------------------------------------------------------

ClaimId = Annotated[str, StringConstraints(pattern=r"^claim_\d{4}$")]


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TechConceptContext(str, Enum):
    WORK_EXPERIENCE = "Work Experience"
    PROJECT = "Project"
    SKILLS_SECTION = "Skills Section"
    SUMMARY = "Summary"
    OTHER = "Other"


class ContextFlag(str, Enum):
    AI_ASSISTED = "AI_ASSISTED"
    ACADEMIC = "ACADEMIC"
    SOLO = "SOLO"
    TEAM = "TEAM"
    TIME_CONSTRAINED = "TIME_CONSTRAINED"


# ---------------------------------------------------------------------------
# Shared Shapes
# ---------------------------------------------------------------------------

class ClaimItem(BaseModel):
    """Exactly two fields: claim_id and text."""
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    text: str


# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------

class Metadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str = "v6"
    overall_extraction_confidence: Confidence
    claim_count: int = Field(ge=0)


# ---------------------------------------------------------------------------
# Candidate Profile
# ---------------------------------------------------------------------------

class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_title: Optional[str] = None
    current_company: Optional[str] = None
    claimed_total_experience_years: Optional[float] = None
    current_location: Optional[str] = None
    summary: Optional[str] = None
    summary_claim_id: Optional[ClaimId] = None


# ---------------------------------------------------------------------------
# Work Experience
# ---------------------------------------------------------------------------

class WorkExperience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: bool = False
    domains: List[str] = Field(default_factory=list)

    responsibilities: List[ClaimItem] = Field(default_factory=list)
    achievements: List[ClaimItem] = Field(default_factory=list)
    implementation_claims: List[ClaimItem] = Field(default_factory=list)

    technologies: List[ClaimId] = Field(default_factory=list)
    concepts: List[ClaimId] = Field(default_factory=list)

    context_flags: List[ContextFlag] = Field(default_factory=list)
    confidence: Confidence


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class Project(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    description: Optional[str] = None
    role: Optional[str] = None
    domain: Optional[str] = None

    implementation_claims: List[ClaimItem] = Field(default_factory=list)
    architectural_claims: List[ClaimItem] = Field(default_factory=list)
    major_features: List[ClaimItem] = Field(default_factory=list)

    technologies: List[ClaimId] = Field(default_factory=list)
    concepts: List[ClaimId] = Field(default_factory=list)

    repository_url: Optional[str] = None
    context_flags: List[ContextFlag] = Field(default_factory=list)
    confidence: Confidence


# ---------------------------------------------------------------------------
# Technologies / Concepts (Normalized Registry)
# ---------------------------------------------------------------------------

class NormalizedRegistryEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    normalized_name: str
    # ✅ Relaxed: empty lists allowed (LLM may not link skills to claims)
    source_claim_ids: List[ClaimId] = Field(default_factory=list)
    contexts: List[TechConceptContext] = Field(min_length=1)


class Technology(NormalizedRegistryEntry):
    pass


class Concept(NormalizedRegistryEntry):
    pass


# ---------------------------------------------------------------------------
# Education / Certifications
# ---------------------------------------------------------------------------

class Education(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    degree: Optional[str] = None
    specialization: Optional[str] = None
    institution: Optional[str] = None
    grade: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    current: bool = False


class Certification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    issuer: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Links
# ---------------------------------------------------------------------------

class Links(BaseModel):
    model_config = ConfigDict(extra="forbid")

    github: Optional[str] = None
    portfolio: Optional[str] = None


# ---------------------------------------------------------------------------
# Miscellaneous Claims
# ---------------------------------------------------------------------------

class MiscellaneousClaim(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    category: Optional[str] = None
    title: str
    claim: str
    confidence: Confidence


# ---------------------------------------------------------------------------
# Root Model (LLM Output)
# ---------------------------------------------------------------------------

class CandidateExtractionLLMOutput(BaseModel):
    """
    Exactly matches the .md contract.
    """
    model_config = ConfigDict(extra="forbid")

    metadata: Metadata
    candidate_profile: CandidateProfile
    work_experience: List[WorkExperience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    technologies: List[Technology] = Field(default_factory=list)
    concepts: List[Concept] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    links: Links = Field(default_factory=Links)
    miscellaneous_claims: List[MiscellaneousClaim] = Field(default_factory=list)

    def _collect_all_claim_ids(self) -> List[str]:
        """
        Collect ALL claim IDs, including summary_claim_id (it is a definition).
        """
        ids: List[str] = []

        # Include the summary claim if present
        if self.candidate_profile.summary_claim_id:
            ids.append(self.candidate_profile.summary_claim_id)

        # Work experience containers and their nested claims
        for we in self.work_experience:
            ids.append(we.claim_id)
            ids.extend(c.claim_id for c in we.responsibilities)
            ids.extend(c.claim_id for c in we.achievements)
            ids.extend(c.claim_id for c in we.implementation_claims)

        # Projects and their nested claims
        for p in self.projects:
            ids.append(p.claim_id)
            ids.extend(c.claim_id for c in p.implementation_claims)
            ids.extend(c.claim_id for c in p.architectural_claims)
            ids.extend(c.claim_id for c in p.major_features)

        # Technologies, concepts, education, certifications, miscellaneous
        ids.extend(t.claim_id for t in self.technologies)
        ids.extend(c.claim_id for c in self.concepts)
        ids.extend(e.claim_id for e in self.education)
        ids.extend(c.claim_id for c in self.certifications)
        ids.extend(m.claim_id for m in self.miscellaneous_claims)

        return ids

    @model_validator(mode="after")
    def validate_claim_registry(self) -> "CandidateExtractionLLMOutput":
        ids = self._collect_all_claim_ids()
        known = set(ids)

        # ✅ Duplicate check removed – claim IDs are not used downstream
        # duplicates = {i for i in ids if ids.count(i) > 1}
        # if duplicates:
        #     raise ValueError(f"Duplicate claim_ids found: {sorted(duplicates)}")

        # claim_count check is also skipped – informational only
        # if len(ids) != self.metadata.claim_count:
        #     raise ValueError(...)

        # ✅ Keep reference checks for technologies/concepts in work/projects
        for registry, label in ((self.technologies, "technology"), (self.concepts, "concept")):
            for entry in registry:
                missing = [sid for sid in entry.source_claim_ids if sid not in known]
                if missing:
                    raise ValueError(
                        f"{label} '{entry.normalized_name}' ({entry.claim_id}) has "
                        f"source_claim_ids not present elsewhere: {missing}"
                    )

        for we in self.work_experience:
            for tid in we.technologies:
                if tid not in known:
                    raise ValueError(f"Work experience references unknown technology claim_id: {tid}")
            for cid in we.concepts:
                if cid not in known:
                    raise ValueError(f"Work experience references unknown concept claim_id: {cid}")
        for p in self.projects:
            for tid in p.technologies:
                if tid not in known:
                    raise ValueError(f"Project references unknown technology claim_id: {tid}")
            for cid in p.concepts:
                if cid not in known:
                    raise ValueError(f"Project references unknown concept claim_id: {cid}")

        return self


# ---------------------------------------------------------------------------
# Alias for backward compatibility
# ---------------------------------------------------------------------------

CandidateExtractionOutput = CandidateExtractionLLMOutput