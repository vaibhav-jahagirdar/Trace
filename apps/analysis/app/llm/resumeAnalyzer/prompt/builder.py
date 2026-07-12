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

_RUNTIME_CONTEXT = _CONTEXT_DIR / "runtime_context.md"

_STATIC_CONTEXT_FILES = (
    "role_and_constraints.md",
    "evaluation_policy.md",
    "candidate_extraction.md",
    "scoring_rubrics.md",
    "scoring_output.md",
    "final_report_structure.md",
    "start_directive.md",
)


@lru_cache(maxsize=1)
def _load_runtime_template() -> str:
    return _RUNTIME_CONTEXT.read_text(
        encoding="utf-8"
    ).strip()


@lru_cache(maxsize=1)
def _load_static_context() -> str:
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
    runtime_context = (
        _load_runtime_template()
        .replace(
            "{{JOB_CONTEXT_JSON}}",
            _json(job_context.model_dump()),
        )
        .replace(
            "{{CANDIDATE_CONTEXT_JSON}}",
            _json(candidate_context.model_dump()),
        )
        .replace(
            "{{PARSED_RESUME_TEXT}}",
            resume_text.strip(),
        )
    )

    return "\n\n".join(
        (
            runtime_context,
            _load_static_context(),
        )
    )