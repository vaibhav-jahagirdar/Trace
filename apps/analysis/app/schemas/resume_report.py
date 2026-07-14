from pydantic import BaseModel, ConfigDict

from app.schemas.candidate import (
    CandidateExtractionLLMOutput,
    CandidateExtractionOutput,
)
from app.schemas.final_report import ComputedScores, ResumeEvaluationReportLLMOutput


class ResumeAnalysisLLMResponse(BaseModel):
    """Exact JSON shape requested from Gemini before service enrichment."""

    model_config = ConfigDict(extra="forbid")

    candidate: CandidateExtractionLLMOutput
    evaluation: ResumeEvaluationReportLLMOutput


class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    candidate: CandidateExtractionOutput
    evaluation: ResumeEvaluationReportLLMOutput
    computed_scores: ComputedScores
