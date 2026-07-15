from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

# ---------------------------------------------------------------------------
# Type Aliases & Enums
# ---------------------------------------------------------------------------

ClaimId = Annotated[str, StringConstraints(pattern=r"^claim_\d{4}$")]


class Confidence(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ExplicitOrInferred(str, Enum):
    EXPLICIT = "EXPLICIT"
    INFERRED = "INFERRED"


class TechConceptContext(str, Enum):
    WORK_EXPERIENCE = "Work Experience"
    PROJECT = "Project"
    SKILLS_SECTION = "Skills Section"
    SUMMARY = "Summary"
    OTHER = "Other"


# ---------------------------------------------------------------------------
# Shared Shapes
# ---------------------------------------------------------------------------

class ClaimItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    text: str
    confidence: Confidence
    explicit_or_inferred: ExplicitOrInferred


class NormalizedRegistryEntry(BaseModel):
    """Shared shape for Technologies and Concepts."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    normalized_name: str
    raw_name: str
    source_claim_ids: list[ClaimId] = Field(
        min_length=1,
        description="Work/project claims, skills-section mentions, or summary claims this entry was derived from.",
    )
    confidence: Confidence
    explicit_or_inferred: ExplicitOrInferred
    contexts: list[TechConceptContext] = Field(min_length=1)


# ---------------------------------------------------------------------------
# Metadata (LLM output vs. fully enriched)
# ---------------------------------------------------------------------------

class ExtractionMetadataLLMOutput(BaseModel):
    """What the model emits (no timestamp/parser_version)."""

    model_config = ConfigDict(extra="forbid")

    schema_version: str
    overall_extraction_confidence: Confidence
    claim_count: int = Field(ge=0)


class ExtractionMetadata(ExtractionMetadataLLMOutput):
    """Full metadata shape used for DB storage (enriched by service)."""

    model_config = ConfigDict(extra="forbid")

    extraction_timestamp: datetime
    parser_version: str


# ---------------------------------------------------------------------------
# Candidate Profile
# ---------------------------------------------------------------------------

class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_title: str | None = None
    current_company: str | None = None
    claimed_total_experience_years: float | None = None
    current_location: str | None = None
    summary: str | None = None
    summary_claim_id: ClaimId | None = Field(
        default=None,
        description="Set only if summary contains a citable claim (e.g., 'led backend team of 4').",
    )
    domains: list[str] = Field(default_factory=list)
    industries: list[str] = Field(default_factory=list)
    career_focus: str | None = None

    # ❌ Removed: github_url, portfolio_url, linkedin_url, website_url
    # These now live in the top-level `links` object.


# ---------------------------------------------------------------------------
# Work Experience
# ---------------------------------------------------------------------------

class WorkExperience(BaseModel):
    """Container entity with its own claim_id + nested claims."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    company: str | None = None
    role: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    current: bool = False
    domains: list[str] = Field(default_factory=list)

    # ❌ Removed: employment_type, duration

    responsibilities: list[ClaimItem] = Field(default_factory=list)
    achievements: list[ClaimItem] = Field(default_factory=list)
    implementation_claims: list[ClaimItem] = Field(default_factory=list)

    technologies: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Technologies registry.",
    )
    concepts: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Concepts registry.",
    )

    source_text: str
    confidence: Confidence


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class Project(BaseModel):
    """Container entity, independent of Work Experience."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    description: str | None = None
    role: str | None = None
    domain: str | None = None

    # ❌ Removed: project_type

    implementation_claims: list[ClaimItem] = Field(default_factory=list)
    architectural_claims: list[ClaimItem] = Field(default_factory=list)
    major_features: list[ClaimItem] = Field(default_factory=list)

    technologies: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Technologies registry.",
    )
    concepts: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Concepts registry.",
    )

    repository_url: str | None = None
    live_url: str | None = None

    source_text: str
    confidence: Confidence


# ---------------------------------------------------------------------------
# Technologies / Concepts
# ---------------------------------------------------------------------------

class Technology(NormalizedRegistryEntry):
    pass


class Concept(NormalizedRegistryEntry):
    """Represents engineering knowledge rather than tools."""
    pass


# ---------------------------------------------------------------------------
# Education / Certifications
# ---------------------------------------------------------------------------

class Education(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    degree: str | None = None
    specialization: str | None = None
    institution: str | None = None
    grade: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    current: bool = False


class Certification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    issuer: str | None = None
    issue_date: str | None = None
    expiry_date: str | None = None
    credential_url: str | None = None


# ---------------------------------------------------------------------------
# Languages
# ---------------------------------------------------------------------------

class Language(BaseModel):
    """No claim_id – self-reported metadata."""

    model_config = ConfigDict(extra="forbid")

    language: str
    proficiency: str | None = None


# ---------------------------------------------------------------------------
# Links (Flat object, not an array)
# ---------------------------------------------------------------------------

class Links(BaseModel):
    """
    Dedicated link fields, extracted from resume text since application forms
    are optional. No claim_id.
    """

    model_config = ConfigDict(extra="forbid")

    github: str | None = None
    portfolio: str | None = None
    linkedin: str | None = None
    website: str | None = None
    blog: str | None = None
    other: str | None = None


# ---------------------------------------------------------------------------
# Miscellaneous Claims
# ---------------------------------------------------------------------------

class MiscellaneousClaim(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    category: str | None = None
    title: str
    claim: str
    source_text: str
    confidence: Confidence


# ---------------------------------------------------------------------------
# Root LLM Output (Matches .md contract exactly)
# ---------------------------------------------------------------------------

class CandidateExtractionLLMOutput(BaseModel):
    """
    Exactly matches the .md contract.
    No achievements, publications, or extraction_report.
    links is a flat object, not an array.
    """

    model_config = ConfigDict(extra="forbid")

    metadata: ExtractionMetadataLLMOutput
    candidate_profile: CandidateProfile
    work_experience: list[WorkExperience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    technologies: list[Technology] = Field(default_factory=list)
    concepts: list[Concept] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    languages: list[Language] = Field(default_factory=list)
    links: Links = Field(default_factory=Links)
    miscellaneous_claims: list[MiscellaneousClaim] = Field(default_factory=list)

    # --------------------------------------------------------------------------
    # Validators (same registry checks, but no achievements/publications)
    # --------------------------------------------------------------------------

    def _all_claim_ids(self) -> list[str]:
        ids: list[str] = []

        if self.candidate_profile.summary_claim_id:
            ids.append(self.candidate_profile.summary_claim_id)

        for we in self.work_experience:
            ids.append(we.claim_id)
            ids += [c.claim_id for c in we.responsibilities]
            ids += [c.claim_id for c in we.achievements]
            ids += [c.claim_id for c in we.implementation_claims]

        for p in self.projects:
            ids.append(p.claim_id)
            ids += [c.claim_id for c in p.implementation_claims]
            ids += [c.claim_id for c in p.architectural_claims]
            ids += [c.claim_id for c in p.major_features]

        ids += [t.claim_id for t in self.technologies]
        ids += [c.claim_id for c in self.concepts]
        ids += [e.claim_id for e in self.education]
        ids += [c.claim_id for c in self.certifications]
        ids += [m.claim_id for m in self.miscellaneous_claims]

        return ids

    @model_validator(mode="after")
    def _validate_claim_registry(self) -> "CandidateExtractionLLMOutput":
        ids = self._all_claim_ids()

        duplicates = {i for i in ids if ids.count(i) > 1}
        if duplicates:
            raise ValueError(f"Duplicate claim_ids found: {sorted(duplicates)}")

        if len(ids) != self.metadata.claim_count:
            raise ValueError(
                f"metadata.claim_count ({self.metadata.claim_count}) does not "
                f"match the number of claim_ids actually present ({len(ids)})"
            )

        known = set(ids)
        for registry, label in ((self.technologies, "technology"), (self.concepts, "concept")):
            for entry in registry:
                dangling = [sid for sid in entry.source_claim_ids if sid not in known]
                if dangling:
                    raise ValueError(
                        f"{label} '{entry.normalized_name}' ({entry.claim_id}) has "
                        f"source_claim_ids not present elsewhere: {dangling}"
                    )

        return self


# ---------------------------------------------------------------------------
# Full Enriched Output (Used for DB storage, not emitted by LLM)
# ---------------------------------------------------------------------------

class CandidateExtractionOutput(CandidateExtractionLLMOutput):
    """
    Fully enriched version used for database storage.
    Adds timestamp, parser_version, and reuses the full metadata model.
    """

    model_config = ConfigDict(extra="forbid")

    # Override metadata with the full version
    metadata: ExtractionMetadata  # type: ignore[assignment]