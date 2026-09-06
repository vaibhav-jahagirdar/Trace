from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.schemas.evaluation_context import EvaluationContextDto

_CONTEXT_DIR = Path(__file__).parent.parent / "context"
_PLANNER_FILE = _CONTEXT_DIR / "planner.md"

_MISSION_HEADER = """
# MISSION: Trace Repository Evidence Planner

You are the **Trace Repository Evidence Planner (Stage 2A)**. Given a Job Context, Stage 1 Evaluation, Candidate Context, and Repository Discovery data, produce a single structured retrieval plan.

Your strict rules and exact output schema are defined in the sections below. Read them carefully before analyzing the data. The data is at the bottom of this prompt—keep it there for reference while generating your output.

⚠️ Strictly adhere to the exact schema and enum values defined in this prompt. Do not invent new fields, categories, or enum values.
""".strip()

_FINAL_REMINDER = """
🔴 FINAL REMINDER: Every objective_id must be unique. All paths must exist in the supplied discovery trees. Do not invent paths or repositories.
"""

# The planner receives repository metadata and trees, not source contents. A
# single unusually large GitHub tree can otherwise consume the entire model
# context before the planner has produced any output. Keep the prompt bounded;
# the full discovery object remains available to post-generation validation and
# retrieval.
_MAX_DISCOVERY_TREE_CHARS = 1_800_000


def _compact_tree(node: Any, budget: int) -> tuple[dict[str, Any], int]:
    """Return a deterministic structural tree prefix within budget."""
    if not isinstance(node, dict) or budget <= 0:
        return {}, 0

    compact: dict[str, Any] = {
        key: node[key]
        for key in ("name", "type", "path")
        if key in node
    }
    used = len(json.dumps(compact, ensure_ascii=False))
    if used > budget:
        return {}, 0

    children: list[dict[str, Any]] = []
    for child in node.get("children") or []:
        remaining = budget - used
        compact_child, child_used = _compact_tree(child, remaining)
        if not compact_child:
            break
        children.append(compact_child)
        used += child_used

    if children:
        compact["children"] = children
        used = len(json.dumps(compact, ensure_ascii=False))
    return compact, used


def _path_index(node: Any) -> list[dict[str, str]]:
    """Flatten every discovered tree entry for exact path selection."""
    entries: list[dict[str, str]] = []

    def walk(current: Any) -> None:
        if not isinstance(current, dict):
            return
        path = current.get("path")
        entry_type = current.get("type")
        if isinstance(path, str) and path:
            item = {"path": path}
            if isinstance(entry_type, str):
                item["type"] = entry_type
            entries.append(item)
        for child in current.get("children") or []:
            walk(child)

    walk(node)
    return entries


@lru_cache(maxsize=1)
def build_repository_planner_system_instruction() -> str:
    if not _PLANNER_FILE.exists():
        raise FileNotFoundError(f"Planner file not found: {_PLANNER_FILE}")
    return _PLANNER_FILE.read_text(encoding="utf-8").strip()


def _json(data: Any) -> str:
    return json.dumps(
        data,
        indent=2,
        ensure_ascii=False,
        default=str,
    )


def _filter_job_context(job_context: EvaluationContextDto) -> dict[str, Any]:
    data = job_context.model_dump(mode="json")

    data.pop("qualifications", None)
    data.pop("submissionRequirements", None)

    role_category = data.get("job", {}).get("roleCategory")
    if role_category:
        role_category.pop("code", None)

    for section in (
        "evaluationPriorities",
        "evidencePriorities",
        "successSignals",
    ):
        for item in data.get(section, []):
            item.pop("code", None)

    return data


def _filter_stage_1(stage_1: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(stage_1)

    candidate = data.get("candidate", {})
    candidate.pop("metadata", None)
    candidate.pop("candidate_profile", None)
    candidate.pop("education", None)
    candidate.pop("certifications", None)
    candidate.pop("miscellaneous_claims", None)

    evaluation = data.get("evaluation", {})
    evaluation.pop("metadata", None)
    evaluation.pop("confidence", None)

    # Stage 2A needs the verification targets, decision-critical claims,
    # projects, and requirement gaps. These resume-stage diagnostics are
    # redundant with those fields and add narrative noise to planning.
    bucket_scores = evaluation.get("bucket_scores")
    if isinstance(bucket_scores, dict):
        bucket_scores.pop("qualification_alignment", None)

    rationale = evaluation.get("score_rationale")
    if isinstance(rationale, dict):
        rationale.pop("drivers_up", None)
        rationale.pop("drivers_down", None)

    return data


def _filter_candidate_context(candidate_context: dict[str, Any]) -> dict[str, Any]:
    data = copy.deepcopy(candidate_context)

    submitted = data.get("submittedEvidence", {})

    submitted.pop("resumeProvided", None)
    submitted.pop("portfolioUrl", None)
    submitted.pop("linkedinUrl", None)
    submitted.pop("problemSolvingProfileUrl", None)

    # These free-text application responses are useful to Stage 1, but are
    # redundant once Stage 2A has the extracted claims and verification plan.
    # Keeping them would increase prompt size and expose more injection-shaped
    # narrative without improving path selection.
    for field in (
        "projectDescription",
        "featureDescription",
        "engineeringHighlight",
        "bestEvidenceNote",
        "whyGoodFit",
    ):
        submitted.pop(field, None)

    return data


def _filter_repository_discovery(
    repository_discovery: dict[str, Any],
) -> dict[str, Any]:
    data = copy.deepcopy(repository_discovery)

    data.pop("created_at", None)
    data.pop("updated_at", None)
    data.pop("public_repos", None)
    data.pop("self_owned", None)
    # Keep classification and routing metadata. They are triage signals only,
    # never evidence of authorship, quality, or candidate ability.

    # Stage 2A intake is intentionally limited to repositories owned by the
    # candidate. Keep the complete discovery object outside this prompt for
    # auditability, but do not spend LLM context on forks or organization
    # repositories. Classification is metadata routing, never quality or
    # authorship evidence.
    repositories = [
        repo
        for repo in data.get("repositories", [])
        if str(repo.get("classification", "")).upper() == "SELF_OWNED"
    ]
    data["repositories"] = repositories

    if repositories:
        per_repo_budget = max(
            50_000,
            _MAX_DISCOVERY_TREE_CHARS // len(repositories),
        )
    else:
        per_repo_budget = 0

    for repo in repositories:
        repo.pop("private", None)
        # Archived/fork/recent metadata helps deterministic intake triage and
        # must not be confused with source evidence.

        tree = repo.get("tree")
        if tree is not None:
            compact_tree, _ = _compact_tree(tree, per_repo_budget)
            repo["tree"] = compact_tree
            repo["path_index"] = _path_index(tree)
            repo["tree_view_truncated"] = len(repo["path_index"]) > 0 and compact_tree != tree

    return data


def build_repository_planner_payload(
    *,
    job_context: EvaluationContextDto,
    stage_1: dict[str, Any],
    candidate_context: dict[str, Any],
    repository_discovery: dict[str, Any],
) -> str:
    payload = {
        "job_context": _filter_job_context(job_context),
        "stage_1": _filter_stage_1(stage_1),
        "candidate_context": _filter_candidate_context(candidate_context),
        "repository_discovery": _filter_repository_discovery(
            repository_discovery
        ),
    }

    return _json(payload)


def build_full_repository_planner_prompt(
    *,
    job_context: EvaluationContextDto,
    stage_1: dict[str, Any],
    candidate_context: dict[str, Any],
    repository_discovery: dict[str, Any],
) -> str:
    return "\n\n".join(
        [
            _MISSION_HEADER,
            build_repository_planner_system_instruction(),
            build_repository_planner_payload(
                job_context=job_context,
                stage_1=stage_1,
                candidate_context=candidate_context,
                repository_discovery=repository_discovery,
            ),
            _FINAL_REMINDER,
        ]
    )
