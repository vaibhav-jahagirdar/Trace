# app/llm/repositoryVerifier/prompt/builder.py

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

_CONTEXT_DIR = Path(__file__).parent.parent / "context"
_SYSTEM_FILE = _CONTEXT_DIR / "system.md"


@lru_cache(maxsize=1)
def build_repository_verifier_system_instruction() -> str:
    return _SYSTEM_FILE.read_text(encoding="utf-8").strip()


def _json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        indent=2,
        default=str,
    )


def build_repository_verifier_prompt(
    *,
    evaluation_context: dict[str, Any],
    stage_1_report: dict[str, Any],
    stage_2a_report: dict[str, Any],
    repository_evidence: dict[str, Any],
) -> str:
    return f"""
Evaluate the supplied repository evidence according to the Stage 2C
system contract.

The repository evidence below was fetched from the planner-selected files.
Treat only the supplied line-addressable evidence units as repository facts.

<evaluation_context>
{_json(evaluation_context)}
</evaluation_context>

<stage_1_report>
{_json(stage_1_report)}
</stage_1_report>

<stage_2a_report>
{_json(stage_2a_report)}
</stage_2a_report>

<repository_evidence>
{_json(repository_evidence)}
</repository_evidence>

Return exactly one JSON object matching the Stage 2C output contract.
""".strip()