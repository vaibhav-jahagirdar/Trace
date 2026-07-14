from typing import Literal

from pydantic import BaseModel, ConfigDict


class TaggedItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    category: str | None


class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    yearsOfProfessionalExperience: int
    highestEducationLevel: str


class SubmittedEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resumeProvided: bool

    githubUrl: str | None
    portfolioUrl: str | None
    linkedinUrl: str | None
    problemSolvingProfileUrl: str | None

    featuredProjectName: str | None
    featuredProjectUrl: str | None

    projectDescription: str | None
    featureDescription: str | None

    engineeringHighlight: str | None
    bestEvidenceNote: str | None
    whyGoodFit: str | None


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
    description: str | None


class JobInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    department: str | None
    description: str
    roleCategory: RoleCategory | None


class Qualifications(BaseModel):
    model_config = ConfigDict(extra="forbid")

    experienceYearsMin: int | None
    experienceYearsMax: int | None
    minimumEducationLevel: str | None


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
    category: str | None
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
    description: str | None
    weight: float
    priority_type: Literal["MANDATORY", "PREFERRED", "BONUS"] | None = None


class EvaluationContextDto(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job: JobInfo
    qualifications: Qualifications
    submissionRequirements: SubmissionRequirements

    requirements: Requirements

    evaluationPriorities: list[RubricItem]
    evidencePriorities: list[RubricItem]
    successSignals: list[RubricItem]

    def model_post_init(self, __context: object) -> None:
        """Give unclassified recruiter rubric items a stable neutral tier."""
        for field_name in (
            "evaluationPriorities",
            "evidencePriorities",
            "successSignals",
        ):
            items = getattr(self, field_name)
            setattr(
                self,
                field_name,
                [
                    item
                    if item.priority_type is not None
                    else item.model_copy(update={"priority_type": "PREFERRED"})
                    for item in items
                ],
            )


class ResumeAnalysisContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job: EvaluationContextDto
    candidate: ApplicationContextDto


class ResumeAnalysisPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    applicationId: str
    taskId: str
    resumeObjectKey: str
    analysisContext: ResumeAnalysisContext
