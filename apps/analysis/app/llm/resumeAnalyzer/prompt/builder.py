from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.schemas.evaluation_context import (
    ApplicationContextDto,
    EvaluationContextDto,
)

_CONTEXT_DIR = Path(__file__).parent.parent / "context"
_SYSTEM_FILE = _CONTEXT_DIR / "system.md"


@lru_cache(maxsize=1)
def build_resume_analysis_system_instruction() -> str:
    return _SYSTEM_FILE.read_text(encoding="utf-8").strip()


def _json(data: Any) -> str:
    return json.dumps(
        data,
        indent=2,
        ensure_ascii=False,
    )


def build_resume_analysis_prompt(
    *,
    job_context: EvaluationContextDto,
    candidate_context: ApplicationContextDto,
    resume_text: str,
) -> str:
    job = job_context.model_dump(mode="json")
    candidate = candidate_context.model_dump(mode="json")

    return _json(
        {
            "job_context": {
                "job": {
                    "title": job["job"]["title"],
                    "description": job["job"]["description"],
                    "roleCategory": (
                        {"code": job["job"]["roleCategory"]["code"]}
                        if job["job"]["roleCategory"]
                        else None
                    ),
                },
                "qualifications": {
                    "minimumEducationLevel": job["qualifications"][
                        "minimumEducationLevel"
                    ],
                },
                "requirements": {
                    "mandatory": [
                        {
                            "name": requirement["name"],
                            "type": requirement["type"],
                            "weight": requirement["weight"],
                        }
                        for requirement in job["requirements"]["mandatory"]
                    ],
                    "preferred": [
                        {
                            "name": requirement["name"],
                            "type": requirement["type"],
                            "weight": requirement["weight"],
                        }
                        for requirement in job["requirements"]["preferred"]
                    ],
                    "bonus": [
                        {
                            "name": requirement["name"],
                            "type": requirement["type"],
                            "weight": requirement["weight"],
                        }
                        for requirement in job["requirements"]["bonus"]
                    ],
                },
                "evaluationPriorities": job["evaluationPriorities"],
                "evidencePriorities": job["evidencePriorities"],
                "successSignals": job["successSignals"],
            },
            "candidate_context": {
                "candidateProfile": {
                    "highestEducationLevel": candidate["candidateProfile"][
                        "highestEducationLevel"
                    ],
                },
                "claimedTechnologies": [
                    {"name": item["name"]}
                    for item in candidate["claimedTechnologies"]
                ],
                "claimedConcepts": [
                    {"name": item["name"]}
                    for item in candidate["claimedConcepts"]
                ],
            },
            "parsed_resume": resume_text.strip(),
        }
    )


def build_full_resume_analysis_prompt(
    *,
    job_context: EvaluationContextDto,
    candidate_context: ApplicationContextDto,
    resume_text: str,
) -> str:
    system_part = build_resume_analysis_system_instruction()

    data_part = build_resume_analysis_prompt(
        job_context=job_context,
        candidate_context=candidate_context,
        resume_text=resume_text,
    )

    return f"{system_part}\n\n{data_part}"