"""
Production‑grade async GitHub client for repository analysis.

Features:
- Async/await with aiohttp
- Rate‑limit handling with automatic retries and backoff
- Respects X-RateLimit-Reset header
- Exponential backoff with jitter for transient errors
- Handles 409 (empty repo) gracefully
- Provides paginated repository listing
- Retrieves recursive Git trees
- Optional token authentication (env or passed)
"""

import asyncio
import os
import time
import random
from typing import List, Dict, Optional, Any, Tuple
from urllib.parse import urljoin

import aiohttp
from aiohttp import ClientTimeout, ClientError


class GitHubApiError(Exception):
    """Base exception for GitHub API errors."""

    def __init__(self, message: str, status: int = 0, response: Any = None):
        super().__init__(message)
        self.status = status
        self.response = response


class RateLimitError(GitHubApiError):
    """Raised when rate limit is hit; includes reset time."""
    def __init__(self, message: str, reset_time: int):
        super().__init__(message, status=403)
        self.reset_time = reset_time


class EmptyRepositoryError(GitHubApiError):
    """Raised when a repository is empty or unavailable (409)."""
    pass


class GitHubClient:
    """Async GitHub API client."""

    BASE_URL = "https://api.github.com"
    DEFAULT_TIMEOUT = 30  # seconds
    MAX_RETRIES = 3
    RATE_LIMIT_BACKOFF_FACTOR = 1.5

    def __init__(
        self,
        token: Optional[str] = None,
        timeout: int = DEFAULT_TIMEOUT,
        max_retries: int = MAX_RETRIES,
    ):
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = self.BASE_URL
        self.timeout = ClientTimeout(total=timeout)
        self.max_retries = max_retries
        self._session: Optional[aiohttp.ClientSession] = None

    @property
    def headers(self) -> Dict[str, str]:
        headers = {"Accept": "application/vnd.github+json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session is None:
            self._session = aiohttp.ClientSession(
                headers=self.headers,
                timeout=self.timeout,
            )
        return self._session

    async def close(self) -> None:
        if self._session:
            await self._session.close()
            self._session = None

    async def __aenter__(self):
        await self._ensure_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    def _is_retryable(self, status: int) -> bool:
        """Determine if a status code should be retried."""
        return status in (500, 502, 503, 504) or status == 429

    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict] = None,
        data: Optional[Any] = None,
        retries: Optional[int] = None,
    ) -> Dict:
        """Make an HTTP request with retries and rate‑limit handling."""
        if retries is None:
            retries = self.max_retries

        url = urljoin(self.base_url, path)
        session = await self._ensure_session()

        attempt = 0
        backoff = 1.0

        while True:
            try:
                async with session.request(
                    method, url, params=params, json=data
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()

                    # Rate limit hit
                    if resp.status == 403 and "rate limit" in await resp.text():
                        reset = int(resp.headers.get("X-RateLimit-Reset", 0))
                        if reset:
                            wait = max(1, reset - time.time())
                            raise RateLimitError("Rate limit exceeded", reset_time=reset)
                        else:
                            # No reset header – fallback to exponential backoff
                            await asyncio.sleep(backoff)
                            backoff *= self.RATE_LIMIT_BACKOFF_FACTOR
                            continue

                    # Empty repo (409)
                    if resp.status == 409:
                        raise EmptyRepositoryError("Repository is empty or unavailable", status=409)

                    # Retry on server errors or 429
                    if self._is_retryable(resp.status) and attempt < retries:
                        await asyncio.sleep(backoff + random.uniform(0, 0.5))
                        backoff *= self.RATE_LIMIT_BACKOFF_FACTOR
                        attempt += 1
                        continue

                    # Otherwise, raise
                    text = await resp.text()
                    raise GitHubApiError(
                        f"GitHub API error {resp.status}: {text}",
                        status=resp.status,
                        response=text,
                    )

            except (ClientError, asyncio.TimeoutError) as e:
                # Network errors – retry
                if attempt < retries:
                    await asyncio.sleep(backoff + random.uniform(0, 0.5))
                    backoff *= self.RATE_LIMIT_BACKOFF_FACTOR
                    attempt += 1
                    continue
                raise GitHubApiError(f"Request failed after retries: {e}") from e

    async def get_user_repos(
        self,
        username: str,
        per_page: int = 100,
        max_pages: Optional[int] = None,
    ) -> List[Dict]:
        """Fetch all public repositories for a user (paginated)."""
        path = f"/users/{username}/repos"
        params = {"per_page": per_page, "page": 1}
        repos = []
        page = 1

        while True:
            if max_pages and page > max_pages:
                break
            params["page"] = page
            try:
                data = await self._request("GET", path, params=params)
            except EmptyRepositoryError:
                # This shouldn't happen for the repo list endpoint, but handle gracefully
                break
            if not data:
                break
            repos.extend(data)
            page += 1

        return repos

    async def get_user_profile(self, username: str) -> Dict:
        """Fetch the public profile used to describe a repository owner."""
        return await self._request("GET", f"/users/{username}")

    async def get_repo_tree(
        self,
        owner: str,
        repo: str,
        ref: str = "HEAD",
    ) -> Tuple[List[Dict], bool]:
        """
        Fetch the recursive Git tree for a repository.

        Returns:
            Tuple of (entries list, truncated flag)
        """
        path = f"/repos/{owner}/{repo}/git/trees/{ref}?recursive=1"
        try:
            data = await self._request("GET", path)
            return data.get("tree", []), data.get("truncated", False)
        except EmptyRepositoryError:
            # Return empty tree for empty repos
            return [], False

    async def get_file_content(
        self,
        owner: str,
        repo: str,
        file_path: str,
        ref: str = "HEAD",
    ) -> bytes:
        """Fetch raw content of a file."""
        path = f"/repos/{owner}/{repo}/contents/{file_path}?ref={ref}"
        data = await self._request("GET", path)
        # GitHub returns base64 encoded content
        import base64
        content = data.get("content", "")
        if content:
            return base64.b64decode(content)
        return b""

    async def get_repo_metadata(
        self,
        owner: str,
        repo: str,
    ) -> Dict:
        """Fetch repository metadata (languages, topics, etc.)."""
        path = f"/repos/{owner}/{repo}"
        return await self._request("GET", path)

    async def get_languages(
        self,
        owner: str,
        repo: str,
    ) -> Dict[str, int]:
        """Fetch language breakdown for a repository."""
        path = f"/repos/{owner}/{repo}/languages"
        return await self._request("GET", path)
