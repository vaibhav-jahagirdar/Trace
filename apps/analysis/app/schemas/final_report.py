from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: Literal[
        "RESUME",
        "GITHUB",
        "PORTFOLIO",
        "LINKEDIN",
        "PROJECT_DESCRIPTION",
        "FEATURE_DESCRIPTION",
        "APPLICATION",
    ]
    quote: str = Field(
        description="Short excerpt supporting the assessment."
    )


class RequirementEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requirement: str
    type: Literal["TECHNOLOGY", "CONCEPT"]

    score: int = Field(ge=0, le=5)

    verdict: Literal[
        "STRONG",
        "ADEQUATE",
        "WEAK",
        "NOT_FOUND",
    ]

    reasoning: str

    evidence: list[Evidence]


class RubricEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    name: str

    score: int = Field(
        ge=0,
        le=10,
        description="Score assigned for this rubric."
    )

    reasoning: str

    evidence: list[Evidence]


class Strength(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: str


class Risk(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]


class MissingEvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item: str
    impact: str


class Recommendation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: str
    priority: Literal["LOW", "MEDIUM", "HIGH"]


class OverallEvaluation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overallScore: int = Field(
        ge=0,
        le=100,
    )

    hiringRecommendation: Literal[
        "STRONG_REJECT",
        "REJECT",
        "BORDERLINE",
        "INTERVIEW",
        "STRONG_INTERVIEW",
    ]

    confidence: float = Field(
        ge=0,
        le=1,
    )

    summary: str


class ResumeEvaluationReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overall: OverallEvaluation

    requirementEvaluations: list[RequirementEvaluation]

    evaluationPriorityScores: list[RubricEvaluation]

    evidencePriorityScores: list[RubricEvaluation]

    successSignalScores: list[RubricEvaluation]

    strengths: list[Strength]

    risks: list[Risk]

    missingEvidence: list[MissingEvidence]

    recommendations: list[Recommendation]