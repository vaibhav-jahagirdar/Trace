from pydantic import BaseModel


class ResumeAnalysisRequest(BaseModel):
    applicationId: str
    taskId: str
    resumeObjectKey: str


class ResumeAnalysisResponse(BaseModel):
    success: bool 