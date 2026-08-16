"""
Tree Builder – fetches Git trees for all repositories in a profile
and enriches the profile with statistics and nested tree structures.

This module consumes the output of fetch_profile_basic and:
- For each repository (self_owned, forks, organization), fetches the recursive Git tree.
- Fetches languages, topics, and description (already in repo list).
- Builds nested tree and statistics using build_tree_and_statistics.
- Enriches the repository descriptor with `tree`, `statistics`, `languages`, `topics`.
- Returns the enriched profile with same top-level structure.
"""

import asyncio
from typing import List, Dict, Any, Optional

from app.clients.github import GitHubClient
from app.scrapers.github.metadata import build_tree_and_statistics
from app.models.responses import RepositoryStatistics, TreeNode


class TreeBuilderError(Exception):
    """Raised when tree building fails."""

    pass


# Large profiles can make repository discovery exceed the planner context
# window. Once a candidate has 10 or more repositories, repository trees are
# evidence-planning inputs only for self-owned repositories. Forks and
# organization repositories remain in discovery metadata but do not carry
# architecture trees or language payloads.
SELF_OWNED_TREE_THRESHOLD = 10


async def build_repository_metadata(
    client: GitHubClient,
    owner: str,
    repo: str,
) -> Dict[str, Any]:
    """
    Fetch supplementary metadata: languages and topics.

    Returns:
        {
            "languages": {"Python": 70, "TypeScript": 20, "PLpgSQL": 10},  # bytes per language
            "topics": ["backend", "distributed-systems"],
        }
    """
    # Fetch languages (bytes per language)
    try:
        languages = await client.get_languages(owner, repo)
    except Exception:
        languages = {}

    # Topics are already in the repository list; we'll get them from the repo descriptor
    # We'll return them from here as well for consistency.
    return {
        "languages": languages,
    }


async def build_trees_for_repository(
    client: GitHubClient,
    owner: str,
    repo: str,
    default_branch: str,
    repo_description: Optional[str] = None,
    repo_topics: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Fetch tree, languages, and build statistics for a single repository.
    Returns dict with 'tree', 'statistics', 'languages', 'topics', 'description'.
    """
    try:
        entries, truncated = await client.get_repo_tree(owner, repo, default_branch)
    except Exception as e:
        raise TreeBuilderError(f"Failed to fetch tree for {owner}/{repo}: {e}") from e

    # Fetch languages (parallel with tree fetch would be nice, but we already have a client)
    # We'll fetch them concurrently using asyncio.gather inside the caller.
    # For simplicity, we'll fetch them here, but we could move to a separate step.
    languages = await client.get_languages(owner, repo)

    if not entries:
        # Empty repo – return empty tree and stats
        return {
            "tree": None,
            "statistics": RepositoryStatistics(
                total_files=0,
                total_directories=0,
                total_nodes=0,
                max_depth=0,
                deepest_path="",
                widest_directory="",
                widest_directory_count=0,
                empty_directories=[],
                largest_directories=[],
                file_count_by_extension={},
                tree_truncated=False,
            ),
            "languages": languages,
        }

    result = build_tree_and_statistics(f"{owner}/{repo}", entries, truncated)
    return {
        "tree": result.tree,
        "statistics": result.statistics,
        "languages": languages,
    }


async def enrich_profile_with_trees(
    profile: Dict[str, Any],
    token: Optional[str] = None,
    concurrency: int = 5,
) -> Dict[str, Any]:
    """
    Enrich a profile with tree data and language metadata for all repositories.

    Args:
        profile: Output from fetch_profile_basic
        token: GitHub token (optional)
        concurrency: Maximum concurrent tree fetches

    Returns:
        Enriched profile with same top-level structure.
        Each repository in 'repositories' will have:
            - tree (TreeNode | None)
            - statistics (RepositoryStatistics | None)
            - languages (Dict[str, int])  # bytes per language
            - topics (List[str])  # already present
            - description (str | None)  # already present
    """
    if not profile.get("repositories"):
        return profile

    enriched = dict(profile)
    repositories = enriched["repositories"]
    restrict_to_self_owned = len(repositories) >= SELF_OWNED_TREE_THRESHOLD

    async with GitHubClient(token=token) as client:
        sem = asyncio.Semaphore(concurrency)

        async def process_repo(repo: Dict[str, Any]) -> Dict[str, Any]:
            async with sem:
                owner = repo["owner"]
                name = repo["name"]

                if restrict_to_self_owned and repo.get("classification") != "SELF_OWNED":
                    repo_copy = dict(repo)
                    repo_copy["tree"] = None
                    repo_copy["statistics"] = None
                    repo_copy["languages"] = {}
                    repo_copy["tree_retrieval_status"] = "SKIPPED_NON_SELF_OWNED_LARGE_PROFILE"
                    return repo_copy

                default_branch = repo["default_branch"]
                try:
                    # Fetch tree and languages in parallel
                    tree_task = asyncio.create_task(
                        client.get_repo_tree(owner, name, default_branch)
                    )
                    lang_task = asyncio.create_task(
                        client.get_languages(owner, name)
                    )
                    (entries, truncated), languages = await asyncio.gather(
                        tree_task, lang_task
                    )
                except Exception as e:
                    print(f"⚠️ {owner}/{name}: {e}")
                    repo_copy = dict(repo)
                    repo_copy["tree"] = None
                    repo_copy["statistics"] = None
                    repo_copy["languages"] = {}
                    repo_copy["tree_retrieval_status"] = "FAILED"
                    return repo_copy

                if not entries:
                    stats = RepositoryStatistics(
                        total_files=0,
                        total_directories=0,
                        total_nodes=0,
                        max_depth=0,
                        deepest_path="",
                        widest_directory="",
                        widest_directory_count=0,
                        empty_directories=[],
                        largest_directories=[],
                        file_count_by_extension={},
                        tree_truncated=False,
                    )
                    tree_node = None
                else:
                    result = build_tree_and_statistics(f"{owner}/{name}", entries, truncated)
                    tree_node = result.tree
                    stats = result.statistics

                repo_copy = dict(repo)
                repo_copy["tree"] = tree_node
                repo_copy["statistics"] = stats
                repo_copy["languages"] = languages  # bytes per language
                repo_copy["tree_retrieval_status"] = "RETRIEVED"
                return repo_copy

        tasks = [process_repo(repo) for repo in repositories]
        enriched_repos = await asyncio.gather(*tasks)
        enriched["repositories"] = enriched_repos

    return enriched
