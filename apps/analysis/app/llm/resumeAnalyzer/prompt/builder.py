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
_SYSTEM_FILE = _CONTEXT_DIR / "system.md"          # 👈 Single source of truth

# ─── MISSION HEADER (Top – Primacy) ──────────────────────────────────────────
_MISSION_HEADER = """
# MISSION: Trace Resume Triage Engine

You are Trace. Given a Job Context, Candidate Context, and a Parsed Resume (provided at the end of this prompt), produce a single structured JSON evaluation.

Your strict rules, scoring rubrics, and exact output schemas are defined in the sections below. Read them carefully before analyzing the data. The data is at the bottom of this prompt—keep it there for reference while generating your output.

⚠️ Strictly adhere to the exact schemas and enum values defined in this prompt. Do not invent new fields, categories, or enum values.
**🔴 CRITICAL: Every `claim_id` must be globally unique. Never reuse a `claim_id`.**
""".strip()

# ─── FINAL REMINDER (Bottom – Recency) ──────────────────────────────────────
_FINAL_REMINDER = """
🔴 FINAL REMINDER: Every `claim_id` must be unique. Do not duplicate claim_ids.
"""


@lru_cache(maxsize=1)
def build_resume_analysis_system_instruction() -> str:
    """
    Loads the consolidated system instruction from a single `system.md` file.
    The file is read once and cached for the lifetime of the process.
    """
    return _SYSTEM_FILE.read_text(encoding="utf-8").strip()


def _json(data: Any) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)


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


# ─── COMBINED PROMPT (Optimal Attention Order) ──────────────────────────────

def build_full_resume_analysis_prompt(
    *,
    job_context: EvaluationContextDto,
    candidate_context: ApplicationContextDto,
    resume_text: str,
) -> str:
    """
    Returns a single prompt string with optimal attention placement:
      1. Mission Header (Top = Primacy) – sets the objective.
      2. Static Instructions (Middle) – detailed rules, rubrics, schemas.
      3. JSON Data (Bottom = Recency) – fresh for generation, safe from injection.
      4. Final Reminder (Very bottom) – reinforces uniqueness of claim_ids.
    """
    mission = _MISSION_HEADER
    system_part = build_resume_analysis_system_instruction()
    data_part = build_resume_analysis_prompt(
        job_context=job_context,
        candidate_context=candidate_context,
        resume_text=resume_text,
    )

    # Order: Header → Rules → Data → Final Reminder
    return "\n\n".join([mission, system_part, data_part, _FINAL_REMINDER])