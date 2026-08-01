"""
Repository Planner service (Stage 2A).

Orchestrates:
  1. GitHub discovery (profile + repo trees) for the candidate, if not
     already supplied by the caller.
  2. Normalization of discovery output into plain, JSON-safe dicts with a
     stable repository_id (dataclasses.asdict; TreeNode/RepositoryStatistics
     are dataclasses and are NOT JSON-serializable as-is).
  3. Prompt construction from job_context + stage_1 + repository_discovery.
  4. LLM call to produce the retrieval plan.
  5. Schema validation via PlannerOutput (structural correctness).
  6. Cross-reference validation against the actual inputs (referential
     correctness — paths/claim_ids/repo_ids must exist in what we sent).
"""

from __future__ import annotations

import json
import tempfile
from dataclasses import asdict, is_dataclass
from typing import Any

from app.llm.repositoryPlanner.prompt.builder import build_full_repository_planner_prompt
from app.llm.service import generate
from app.schemas.planner import PlannerOutput
from app.scrapers.github.profile import fetch_profile_basic
from app.scrapers.github.tree_builder import enrich_profile_with_trees


class RepositoryPlannerError(Exception):
    """Raised when repository planning fails."""

    pass


def _repository_id(owner: str, name: str) -> str:
    """
    Canonical repository identifier used consistently across the prompt
    payload, the LLM's repository_id references, and our own validation.
    profile.py's descriptors have no explicit id — this is the single
    place that manufactures one, so it never drifts between call sites.
    """
    return f"{owner}/{name}"


def _normalize_repository_discovery(profile: dict[str, Any]) -> dict[str, Any]:
    """
    Convert the output of enrich_profile_with_trees into plain,
    JSON-safe dicts, and stamp a stable `id` onto every repository.

    Required because:
      - `tree` (TreeNode) and `statistics` (RepositoryStatistics) are
        dataclasses. Passed straight into build_full_repository_planner_prompt,
        which json.dumps(..., default=str)'s the payload, a raw dataclass
        silently degrades into its repr string instead of real nested
        JSON — the LLM would see garbage instead of the tree.
      - Nothing in profile.py/tree_builder.py assigns a repository id;
        only `name` + `owner` exist. The planner prompt and our own
        cross-reference validation both need one stable id to agree on.
    """
    normalized = dict(profile)
    repos = []

    for repo in normalized.get("repositories", []):
        repo_copy = dict(repo)
        repo_copy["id"] = _repository_id(repo["owner"], repo["name"])

        tree = repo_copy.get("tree")
        if tree is not None and is_dataclass(tree):
            repo_copy["tree"] = asdict(tree)

        stats = repo_copy.get("statistics")
        if stats is not None and is_dataclass(stats):
            repo_copy["statistics"] = asdict(stats)

        repos.append(repo_copy)

    normalized["repositories"] = repos
    return normalized


async def _discover_repositories(
    github_username: str,
    github_token: str | None,
) -> dict[str, Any]:
    """
    Fetch the candidate's repository list, enrich with trees/languages/
    statistics, and normalize into the JSON-safe shape the planner
    prompt and validation both expect.
    """
    try:
        profile = await fetch_profile_basic(github_username, token=github_token)
        enriched = await enrich_profile_with_trees(profile, token=github_token)
    except Exception as e:
        raise RepositoryPlannerError(
            f"Failed to discover repositories for {github_username}: {e}"
        ) from e

    return _normalize_repository_discovery(enriched)


def _collect_valid_paths(repo: dict[str, Any]) -> set[str]:
    """
    Flatten a (normalized, dict-form) repository's tree into the set of
    exact paths the planner is allowed to reference in seed_paths /
    evidence_paths. Expects tree already converted from TreeNode via
    _normalize_repository_discovery — this walks plain dicts, matching
    TreeNode's real fields: name, type, path, children.
    """
    paths: set[str] = set()
    tree = repo.get("tree")
    if not tree:
        return paths

    def _walk(node: dict[str, Any]) -> None:
        path = node.get("path")
        if path:
            paths.add(path)
        for child in node.get("children") or []:
            _walk(child)

    _walk(tree)
    return paths


def _collect_stage1_claim_ids(stage_1: dict[str, Any]) -> set[str]:
    """
    Flatten every claim_id present anywhere in the Stage 1 payload we
    sent the planner, so we can catch a hallucinated claim_id reference.
    Walks generically rather than enumerating exact field names, since
    Stage 1's schema nests claim_ids at many depths (work_experience,
    projects, technologies, concepts, verification_plan, etc.).
    """
    claim_ids: set[str] = set()

    def _walk(node: Any) -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                if key in ("claim_id", "experience_id", "project_id") and isinstance(value, str):
                    claim_ids.add(value)
                elif key in ("supporting_claim_ids", "related_claim_ids", "source_claim_ids") and isinstance(value, list):
                    claim_ids.update(v for v in value if isinstance(v, str))
                else:
                    _walk(value)
        elif isinstance(node, list):
            for item in node:
                _walk(item)

    _walk(stage_1)
    return claim_ids


def validate_planner_references(
    plan: PlannerOutput,
    repository_discovery: dict[str, Any],
    stage_1: dict[str, Any],
) -> None:
    """
    PlannerOutput (pydantic) already enforces structural correctness —
    required fields, enum values, weight sums, path formatting. This
    catches what pydantic can't: whether the model's claims about *this*
    input are actually true. Never silently drops or corrects a bad
    reference — a dangling reference means the plan cannot be trusted
    for retrieval and must not proceed.
    """
    repos_by_id = {r["id"]: r for r in repository_discovery.get("repositories", [])}
    valid_repo_ids = set(repos_by_id.keys())
    valid_claim_ids = _collect_stage1_claim_ids(stage_1)

    errors: list[str] = []

    for repo_plan in plan.repository_plans:
        if repo_plan.repository_id not in valid_repo_ids:
            errors.append(
                f"repository_plans references unknown repository_id "
                f"'{repo_plan.repository_id}'"
            )
            continue

        valid_paths = _collect_valid_paths(repos_by_id[repo_plan.repository_id])

        for claim_id in repo_plan.linked_stage_1_project_ids:
            if claim_id not in valid_claim_ids:
                errors.append(
                    f"{repo_plan.repository_id}: linked_stage_1_project_ids "
                    f"references unknown claim_id '{claim_id}'"
                )

        for obs in repo_plan.structural_observations:
            for path in obs.evidence_paths:
                if path not in valid_paths:
                    errors.append(
                        f"{repo_plan.repository_id}: structural_observations "
                        f"references path not in discovered tree: '{path}'"
                    )

        for domain in repo_plan.domain_allocations:
            for path in domain.evidence_paths:
                if path not in valid_paths:
                    errors.append(
                        f"{repo_plan.repository_id}: domain_allocations "
                        f"references path not in discovered tree: '{path}'"
                    )

        for objective in repo_plan.evidence_objectives:
            for path in objective.seed_paths:
                if path not in valid_paths:
                    errors.append(
                        f"{repo_plan.repository_id}: {objective.objective_id} "
                        f"references path not in discovered tree: '{path}'"
                    )
            for claim_id in objective.source_claim_ids:
                if claim_id not in valid_claim_ids:
                    errors.append(
                        f"{repo_plan.repository_id}: {objective.objective_id} "
                        f"references unknown claim_id '{claim_id}'"
                    )

    all_objective_paths: set[tuple[str, str]] = set()
    for repo_plan in plan.repository_plans:
        for objective in repo_plan.evidence_objectives:
            for path in objective.seed_paths:
                all_objective_paths.add((repo_plan.repository_id, path))

    dedup_paths = {
        (sp.repository_id, sp.path) for sp in plan.retrieval_execution.deduplicated_seed_paths
    }
    if dedup_paths != all_objective_paths:
        missing = all_objective_paths - dedup_paths
        extra = dedup_paths - all_objective_paths
        if missing:
            errors.append(f"deduplicated_seed_paths missing entries: {missing}")
        if extra:
            errors.append(f"deduplicated_seed_paths has entries not in any objective: {extra}")

    covered_claim_ids = {tc.claim_id for tc in plan.target_coverage}
    stage1_verification_claim_ids = {
        t.get("claim_id")
        for t in stage_1.get("evaluation", {}).get("verification_plan", {}).get("verification_targets", [])
        if t.get("claim_id")
    }
    missing_targets = stage1_verification_claim_ids - covered_claim_ids
    if missing_targets:
        errors.append(f"target_coverage is missing Stage 1 verification targets: {missing_targets}")

    if errors:
        raise RepositoryPlannerError(
            "Repository planner output failed referential validation:\n"
            + "\n".join(f"  - {e}" for e in errors)
        )


async def plan_repository_evidence(
    *,
    job_context: Any,  # EvaluationContextDto
    stage_1: dict[str, Any],
    github_username: str | None = None,
    github_token: str | None = None,
    repository_discovery: dict[str, Any] | None = None,
) -> dict:
    """
    Stage 2A entrypoint. Produces a validated retrieval plan for the
    candidate's repositories, given the job context and Stage 1 report.

    Request/response validation happens on the Node side per your setup,
    so this takes plain args rather than a pydantic request model.
    """
    if repository_discovery is None:
        if not github_username:
            raise ValueError("Either repository_discovery or github_username must be provided.")
        repository_discovery = await _discover_repositories(github_username, github_token)
    else:
        # Caller-supplied discovery may still contain raw dataclasses
        # (e.g. if passed straight from enrich_profile_with_trees) —
        # normalize defensively so downstream JSON encoding/validation
        # never silently breaks on a dataclass repr.
        repository_discovery = _normalize_repository_discovery(repository_discovery)

    prompt = build_full_repository_planner_prompt(
        job_context=job_context,
        stage_1=stage_1,
        repository_discovery=repository_discovery,
    )

    payload, raw_response = await generate(prompt)
    if payload is None:
        raise RuntimeError("LLM returned invalid JSON – cannot proceed.")

    try:
        plan = PlannerOutput.model_validate(payload)
    except Exception as e:
        raise RepositoryPlannerError(f"Planner output failed schema validation: {e}") from e

    validate_planner_references(plan, repository_discovery, stage_1)

    response = {
        "plan": plan.model_dump(mode="json"),
        "repository_discovery": repository_discovery,
        "raw_llm_response": raw_response,
    }

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(response, f, indent=2, ensure_ascii=False)
        temp_path = f.name
    print(f"[PLANNER] Cleaned response written to: {temp_path}")

    return response