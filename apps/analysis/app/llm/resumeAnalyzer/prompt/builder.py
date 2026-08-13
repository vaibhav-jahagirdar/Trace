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
    """
    Loads the consolidated system instruction from a single system.md file.
    The file is read once and cached for the lifetime of the process.
    """
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
    """
    Serialize runtime inputs as data, never as interpolated prompt text.

    Resume and application fields are untrusted. JSON encoding prevents
    candidate-controlled values from escaping the surrounding structure.
    """
    return _json(
        {
            "job_context": job_context.model_dump(mode="json"),
            "candidate_context": candidate_context.model_dump(mode="json"),
            "parsed_resume": resume_text.strip(),
        }
    )


def build_full_resume_analysis_prompt(
    *,
    job_context: EvaluationContextDto,
    candidate_context: ApplicationContextDto,
    resume_text: str,
) -> str:
    """
    Combines the static system instructions with the runtime evaluation data.
    """
    system_part = build_resume_analysis_system_instruction()

    data_part = build_resume_analysis_prompt(
        job_context=job_context,
        candidate_context=candidate_context,
        resume_text=resume_text,
    )

    return "\n\n".join(
        [
            system_part,
            data_part,
        ]
    )