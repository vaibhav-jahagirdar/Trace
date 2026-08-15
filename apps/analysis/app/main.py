from fastapi import FastAPI

from app.api.resume import router as resume_router
from app.api.repo_planner import router as repository_planner_router
from app.api.repo_verifier import router as repository_verifier_router

app = FastAPI(
    title="Trace Analysis Service",
    version="1.0.0",
)

app.include_router(resume_router)
app.include_router(repository_planner_router)
app.include_router(repository_verifier_router)


@app.get("/")
async def root():
    return {
        "message": "Trace Analysis Service",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }
