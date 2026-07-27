from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.candidate import (
    CandidateExtractionLLMOutput,
    CandidateExtractionOutput,
)
from app.schemas.final_report import ResumeEvaluationReportLLMOutput
from app.schemas.evaluation_context import EvaluationContextDto, ApplicationContextDto


class ResumeAnalysisContext(BaseModel):
    model_config = ConfigDict(extra="forbid")
    job: EvaluationContextDto
    candidate: ApplicationContextDto


class ResumeAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    resumeObjectKey: str
    analysisContext: ResumeAnalysisContext   # ✅ now has both job and candidate
    raw_llm_response: Optional[str] = None


class ResumeAnalysisLLMResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    candidate: CandidateExtractionLLMOutput
    evaluation: ResumeEvaluationReportLLMOutput


class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    candidate: CandidateExtractionOutput
    evaluation: ResumeEvaluationReportLLMOutput
    raw_llm_response: Optional[str] = None