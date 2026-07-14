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

_STATIC_CONTEXT_FILES = (
    "runtime_context.md",
    "role_and_constraints.md",
    "evaluation_policy.md",
    "candidate_extraction.md",
    "scoring_rubrics.md",
    "scoring_output.md",
    "final_report_structure.md",
    "start_directive.md",
)


@lru_cache(maxsize=1)
def build_resume_analysis_system_instruction() -> str:
    """
    Loads every static prompt document once for the lifetime of the
    process. The order of _STATIC_CONTEXT_FILES defines the evaluation
    specification presented to the model.
    """

    return "\n\n".join(
        (
            (_CONTEXT_DIR / filename)
            .read_text(encoding="utf-8")
            .strip()
        )
        for filename in _STATIC_CONTEXT_FILES
    )


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
    """Serialize runtime inputs as data, never as interpolated prompt text.

    Resume and application fields are untrusted. JSON encoding prevents a
    candidate-controlled value from escaping a Markdown fence or changing the
    surrounding instruction structure.
    """

    return _json(
        {
            "job_context": job_context.model_dump(mode="json"),
            "candidate_context": candidate_context.model_dump(mode="json"),
            "parsed_resume": resume_text.strip(),
        }
    )
