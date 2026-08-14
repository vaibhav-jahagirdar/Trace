

import asyncio
from datetime import datetime
from typing import List, Dict, Optional, Any, Tuple

from app.clients.github import GitHubClient


class GitHubProfileError(Exception):
    """Raised when profile scraping fails."""
    pass


def _classify_repository(repo: Dict, username: str) -> str:
    """Classify a repository as self_owned, fork, or organization."""
    owner = repo["owner"]["login"]
    if repo["fork"]:
        return "fork"
    if owner == username:
        return "self_owned"
    return "organization"


async def fetch_profile_basic(
    username: str,
    token: Optional[str] = None,
    timeout: int = 30,
) -> Dict[str, Any]:
   
    async with GitHubClient(token=token, timeout=timeout) as client:
        try:
            user = await client.get_user_profile(username)
            repos = await client.get_user_repos(username)
        except Exception as e:
            raise GitHubProfileError(f"Failed to fetch profile for {username}: {e}") from e

        
        descriptors = []
        self_owned = []
        forks = []
        organization = []

        for repo in repos:
            descriptor = {
                "github_repository_id": repo["id"],
                "name": repo["name"],
                "owner": repo["owner"]["login"],
                "default_branch": repo["default_branch"],
                "fork": repo["fork"],
                "private": repo["private"],
                "archived": repo["archived"],
                "pushed_at": repo["pushed_at"],
                "classification": _classify_repository(repo, username).upper(),
                "description": repo.get("description"),
                "topics": repo.get("topics") or [],
                "repository_url": repo.get("html_url") or f"https://github.com/{repo['owner']['login']}/{repo['name']}",
            }
            descriptors.append(descriptor)

            classification = _classify_repository(repo, username)
            if classification == "self_owned":
                self_owned.append(repo["name"])
            elif classification == "fork":
                forks.append(repo["name"])
            else:
                organization.append(repo["name"])

        return {
            "username": user["login"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"],
            "public_repos": user["public_repos"],
            "repositories": descriptors,
            "self_owned": self_owned,
            "forks": forks,
            "organization": organization,
        }
