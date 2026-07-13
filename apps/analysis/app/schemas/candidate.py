
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator



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


class LinkType(str, Enum):
    GITHUB = "GitHub"
    PORTFOLIO = "Portfolio"
    LINKEDIN = "LinkedIn"
    WEBSITE = "Website"
    BLOG = "Blog"
    OTHER = "Other"


class ClaimItem(BaseModel):
    

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    text: str
    confidence: Confidence
    explicit_or_inferred: ExplicitOrInferred



class ExtractionMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: str
    extraction_timestamp: datetime
    parser_version: str
    overall_extraction_confidence: Confidence
    claim_count: int = Field(
        ge=0, description="Total number of claim_ids assigned in this extraction."
    )



class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_title: str | None = None
    current_company: str | None = None
    claimed_total_experience_years: float | None = None
    current_location: str | None = None
    summary: str | None = None
    summary_claim_id: ClaimId | None = Field(
        default=None,
        description=(
            "Set only if the summary contains independently citable claim "
            "content (e.g. 'led backend team of 4'). Null if the summary is "
            "purely descriptive with no claim beyond what's captured elsewhere."
        ),
    )
    domains: list[str] = Field(default_factory=list)
    industries: list[str] = Field(default_factory=list)
    career_focus: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    linkedin_url: str | None = None
    website_url: str | None = None



class WorkExperience(BaseModel):
    """A container entity: its own claim_id + nested claim-bearing items."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId = Field(
        description="Citable as 'this experience as a whole' (role/responsibility/domain alignment)."
    )
    company: str | None = None
    role: str | None = None
    employment_type: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    current: bool = False
    duration: str | None = None
    domains: list[str] = Field(default_factory=list)

    responsibilities: list[ClaimItem] = Field(default_factory=list)
    achievements: list[ClaimItem] = Field(default_factory=list)

    technologies: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Technologies registry.",
    )
    concepts: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Concepts registry.",
    )

    implementation_claims: list[ClaimItem] = Field(default_factory=list)

    source_text: str
    confidence: Confidence




class Project(BaseModel):
    """A container entity, independent of Work Experience entries."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId = Field(description="Citable as 'this project as a whole'.")
    title: str
    description: str | None = None
    role: str | None = None
    project_type: str | None = None
    domain: str | None = None

    technologies: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Technologies registry.",
    )
    concepts: list[ClaimId] = Field(
        default_factory=list,
        description="References into the top-level Concepts registry.",
    )

    implementation_claims: list[ClaimItem] = Field(default_factory=list)
    architectural_claims: list[ClaimItem] = Field(default_factory=list)
    major_features: list[ClaimItem] = Field(default_factory=list)

    repository_url: str | None = None
    live_url: str | None = None

    source_text: str
    confidence: Confidence



class NormalizedRegistryEntry(BaseModel):
    """
    Shared shape for Technologies and Concepts: one canonical entry per
    normalized name, deduplicated across contexts, with provenance back
    to every raw claim it was derived from.
    """

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    normalized_name: str
    raw_name: str
    source_claim_ids: list[ClaimId] = Field(
        min_length=1,
        description=(
            "The work-experience/project implementation claims, skills-section "
            "mention, or summary claim this entry was derived from."
        ),
    )
    confidence: Confidence
    explicit_or_inferred: ExplicitOrInferred
    contexts: list[TechConceptContext] = Field(min_length=1)


class Technology(NormalizedRegistryEntry):
    pass


class Concept(NormalizedRegistryEntry):
    """Represents engineering knowledge rather than tools."""

    pass


# ---------------------------------------------------------------------------
# Education / Certifications / Achievements / Publications
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


class Achievement(BaseModel):
    """Top-level achievement, not tied to a specific work experience."""

    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    description: str | None = None
    category: str | None = None
    source_text: str


class Publication(BaseModel):
    model_config = ConfigDict(extra="forbid")

    claim_id: ClaimId
    title: str
    publisher: str | None = None
    publication_date: str | None = None
    url: str | None = None


# ---------------------------------------------------------------------------
# Languages / Links — explicitly NOT claims per the contract
# ---------------------------------------------------------------------------


class Language(BaseModel):
    """No claim_id: self-reported metadata, not used as evaluation evidence."""

    model_config = ConfigDict(extra="forbid")

    language: str
    proficiency: str | None = None


class Link(BaseModel):
    """No claim_id: links are pointers, not claims."""

    model_config = ConfigDict(extra="forbid")

    type: LinkType
    url: str


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
# Extraction Report
# ---------------------------------------------------------------------------


class ExtractionReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    missing_sections: list[str] = Field(default_factory=list)
    ambiguous_entities: list[str] = Field(default_factory=list)
    low_confidence_entities: list[ClaimId] = Field(default_factory=list)
    duplicate_entities: list[str] = Field(default_factory=list)
    ignored_content: list[str] = Field(default_factory=list)
    parsing_notes: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Top-level extraction output
# ---------------------------------------------------------------------------


class CandidateExtractionOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: ExtractionMetadata
    candidate_profile: CandidateProfile

    work_experience: list[WorkExperience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)

    technologies: list[Technology] = Field(default_factory=list)
    concepts: list[Concept] = Field(default_factory=list)

    education: list[Education] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    achievements: list[Achievement] = Field(default_factory=list)
    publications: list[Publication] = Field(default_factory=list)

    languages: list[Language] = Field(default_factory=list)
    links: list[Link] = Field(default_factory=list)

    miscellaneous_claims: list[MiscellaneousClaim] = Field(default_factory=list)

    extraction_report: ExtractionReport

    # -- Cross-cutting integrity checks that make the registry auditable --

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
        ids += [a.claim_id for a in self.achievements]
        ids += [p.claim_id for p in self.publications]
        ids += [m.claim_id for m in self.miscellaneous_claims]

        return ids

    @model_validator(mode="after")
    def _validate_claim_registry(self) -> "CandidateExtractionOutput":
        ids = self._all_claim_ids()

        duplicates = {i for i in ids if ids.count(i) > 1}
        if duplicates:
            raise ValueError(f"Duplicate claim_ids found: {sorted(duplicates)}")

        if len(ids) != self.metadata.claim_count:
            raise ValueError(
                f"metadata.claim_count ({self.metadata.claim_count}) does not "
                f"match the number of claim_ids actually present ({len(ids)})"
            )

        # every technology/concept source_claim_id must resolve to a real claim
        known = set(ids)
        for registry, label in ((self.technologies, "technology"), (self.concepts, "concept")):
            for entry in registry:
                dangling = [sid for sid in entry.source_claim_ids if sid not in known]
                if dangling:
                    raise ValueError(
                        f"{label} '{entry.normalized_name}' ({entry.claim_id}) has "
                        f"source_claim_ids not present elsewhere in the extraction: {dangling}"
                    )

        return self