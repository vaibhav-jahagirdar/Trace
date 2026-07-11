from pydantic import BaseModel


class AnalysisContext(BaseModel):
    job: dict
    candidate: dict


class ResumeAnalysisRequest(BaseModel):
    applicationId: str
    taskId: str
    resumeObjectKey: str
    analysisContext: AnalysisContext


class ResumeAnalysisResponse(BaseModel):
    success: bool
    message: str