#!/usr/bin/env python3
"""
Scan all repositories of a GitHub user, compute tree statistics, and classify repos.
Usage: python -m app.scripts.scan_profile <username> [--limit N] [--token TOKEN]
"""

import sys
import json
import time
import argparse
from typing import List, Dict, Optional
from dataclasses import asdict

from app.clients.github import GitHubClient
from app.scrapers.github.metadata import build_tree_and_statistics
from app.models.responses import RepoSummary, ProfileSummary


def scan_user_profile(username: str, token: Optional[str] = None, limit: Optional[int] = None) -> ProfileSummary:
    client = GitHubClient(token=token)
    repos = client.get_user_repos(username)

    summaries: List[RepoSummary] = []
    self_owned = 0
    forked = 0
    contributor = 0
    processed = 0

    for repo in repos:
        if limit is not None and processed >= limit:
            break

        full_name = f"{repo['owner']['login']}/{repo['name']}"
        default_branch = repo.get("default_branch", "main")

        # Determine classification first
        is_self_owned = repo["owner"]["login"] == username
        is_fork = repo.get("fork", False)
        if is_self_owned and not is_fork:
            cls = "self_owned"
        elif is_fork:
            cls = "forked"
        else:
            cls = "contributor"

        try:
            entries, truncated = client.get_repo_tree(full_name, default_branch)
        except Exception as e:
            if hasattr(e, "response") and e.response.status_code == 409:
                print(f"⏭️ Skipping {full_name}: empty or unavailable", file=sys.stderr)
            else:
                print(f"⚠️ Error fetching tree for {full_name}: {e}", file=sys.stderr)
            continue

        # Success – now increment counter and add summary
        if cls == "self_owned":
            self_owned += 1
        elif cls == "forked":
            forked += 1
        else:
            contributor += 1

        result = build_tree_and_statistics(full_name, entries, truncated)

        summary = RepoSummary(
            name=repo["name"],
            owner=repo["owner"]["login"],
            classification=cls,
            statistics=result.statistics,
        )
        summaries.append(summary)
        processed += 1

    total = len(summaries)
    return ProfileSummary(
        username=username,
        total_repos=total,
        self_owned=self_owned,
        forked=forked,
        contributor=contributor,
        repo_summaries=summaries,
    )


def main():
    parser = argparse.ArgumentParser(description="Scan GitHub user profile")
    parser.add_argument("username", help="GitHub username")
    parser.add_argument("--limit", type=int, help="Limit number of repos to scan")
    parser.add_argument("--token", help="GitHub personal access token")
    args = parser.parse_args()

    summary = scan_user_profile(args.username, token=args.token, limit=args.limit)

    # Convert dataclasses to dict for JSON serialization
    def default_serializer(obj):
        if hasattr(obj, "__dict__"):
            return asdict(obj)
        return str(obj)

    print(json.dumps(summary, indent=2, default=default_serializer))


if __name__ == "__main__":
    main()