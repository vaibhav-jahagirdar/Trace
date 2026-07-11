from typing import Literal

from pydantic import BaseModel, ConfigDict


class TaggedItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    category: str | None = None


class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    yearsOfProfessionalExperience: int
    highestEducationLevel: str


class SubmittedEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resumeProvided: bool

    githubUrl: str | None = None
    portfolioUrl: str | None = None
    linkedinUrl: str | None = None
    problemSolvingProfileUrl: str | None = None

    featuredProjectName: str | None = None
    featuredProjectUrl: str | None = None

    projectDescription: str | None = None
    featureDescription: str | None = None

    engineeringHighlight: str | None = None
    bestEvidenceNote: str | None = None
    whyGoodFit: str | None = None


class ApplicationContextDto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidateProfile: CandidateProfile
    submittedEvidence: SubmittedEvidence
    claimedTechnologies: list[TaggedItem]
    claimedConcepts: list[TaggedItem]


class RoleCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    name: str
    description: str | None = None


class JobInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    department: str | None = None
    description: str
    roleCategory: RoleCategory | None = None


class Qualifications(BaseModel):
    model_config = ConfigDict(extra="forbid")

    experienceYearsMin: int | None = None
    experienceYearsMax: int | None = None
    minimumEducationLevel: str | None = None


class SubmissionRequirements(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resumeRequired: bool
    githubRequired: bool
    linkedinRequired: bool
    problemSolvingProfileRequired: bool
    projectExplanationRequired: bool
    featureExplanationRequired: bool


class RequirementItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    type: Literal["TECHNOLOGY", "CONCEPT"]
    category: str | None = None
    weight: float


class Requirements(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mandatory: list[RequirementItem]
    preferred: list[RequirementItem]
    bonus: list[RequirementItem]


class RubricItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    name: str
    description: str | None = None
    weight: float


class EvaluationContextDto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job: JobInfo
    qualifications: Qualifications
    submissionRequirements: SubmissionRequirements

    requirements: Requirements

    evaluationPriorities: list[RubricItem]
    evidencePriorities: list[RubricItem]
    successSignals: list[RubricItem]


class ResumeAnalysisContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job: EvaluationContextDto
    candidate: ApplicationContextDto