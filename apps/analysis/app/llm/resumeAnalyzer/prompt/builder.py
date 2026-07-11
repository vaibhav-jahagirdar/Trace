from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.schemas.evaluation_context import (
    ApplicationContextDto,
    EvaluationContextDto,
)

_CONTEXT_DIR = Path(__file__).parent / "context"

_CONTEXT_FILES = [
    "role.md",
    "definitions.md",
    "evaluation_policy.md",
    "scoring_rubrics.md",
    "constraints.md",
    "exception_policy.md",
    "thinking_workflow.md",
    "candidate_extraction.md",
    "contract.md",
    "final_report_structure.md",
]


@lru_cache(maxsize=1)
def _load_static_context() -> str:
    """
    Loads and caches all static prompt documents.
    This is executed only once for the lifetime of the process.
    """

    sections: list[str] = []

    for filename in _CONTEXT_FILES:
        path = _CONTEXT_DIR / filename

        sections.append(
            "\n".join(
                [
                    "=" * 80,
                    filename,
                    "=" * 80,
                    path.read_text(encoding="utf-8").strip(),
                ]
            )
        )

    return "\n\n".join(sections)


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
    Builds the complete prompt.

    Runtime context intentionally appears before the evaluation
    specification so the model understands what it is evaluating
    before reading the evaluation policy.
    """

    prompt = f"""
# Evaluation Context

The following information describes the job, the candidate,
and the parsed resume to evaluate.

Do not begin evaluation until all runtime context has been read.

---

## Job Context

```json
{_json(job_context.model_dump())}