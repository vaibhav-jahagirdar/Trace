
from __future__ import annotations

import asyncio
import base64
import hashlib
import os
from typing import Any
from urllib.parse import quote

import aiohttp


class FileContentError(Exception):
    pass


def _api_headers(token: str | None) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "trace-repository-verifier",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _artifact_type(path: str) -> str:
    lower = path.lower()
    if "test" in lower or "spec" in lower:
        return "TEST"
    if lower.endswith((".sql", ".migration")) or "migration" in lower:
        return "MIGRATION"
    if lower.endswith((".yml", ".yaml", ".toml", ".ini")):
        return "CONFIGURATION"
    if "readme" in lower or lower.startswith("docs/"):
        return "DOCUMENTATION"
    return "SOURCE"


async def _fetch_one(
    session: aiohttp.ClientSession,
    item: dict[str, Any],
    semaphore: asyncio.Semaphore,
    max_bytes: int,
    retries: int,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    async with semaphore:
        url = item.get("file_url")
        path = item.get("path")
        if not isinstance(url, str) or not isinstance(path, str):
            raise FileContentError("Each repository file requires file_url and path")

        for attempt in range(retries + 1):
            try:
                async with session.get(url) as response:
                    if response.status in (429, 500, 502, 503, 504):
                        if attempt < retries:
                            await asyncio.sleep(2**attempt)
                            continue
                    if response.status != 200:
                        body = (await response.text())[:500]
                        raise FileContentError(
                            f"GitHub returned {response.status} for {path}: {body}"
                        )

                    payload = await response.json()
                    encoded = payload.get("content", "")
                    if not isinstance(encoded, str):
                        raise FileContentError(f"GitHub returned no content for {path}")

                    try:
                        content_bytes = base64.b64decode(encoded, validate=False)
                    except Exception as exc:
                        raise FileContentError(f"Invalid base64 content for {path}") from exc

                    if len(content_bytes) > max_bytes:
                        raise FileContentError(
                            f"File exceeds verifier limit ({max_bytes} bytes): {path}"
                        )

                    content = content_bytes.decode("utf-8", errors="replace")
                    if "\x00" in content:
                        raise FileContentError(f"Binary file is not verifier evidence: {path}")

                    evidence_id = str(item.get("evidence_id") or "")
                    if not evidence_id:
                        digest = hashlib.sha256(
                            f"{item.get('repository_id')}:{path}".encode()
                        ).hexdigest()[:12]
                        evidence_id = f"evidence_{digest}"

                    return item, {
                        "evidence_id": evidence_id,
                        "path": path,
                        "artifact_type": item.get("artifact_type") or _artifact_type(path),
                        "start_line": 1,
                        "end_line": max(1, len(content.splitlines())),
                        "content": content,
                        "content_hash": hashlib.sha256(content_bytes).hexdigest(),
                        "blob_sha": payload.get("sha"),
                    }
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                if attempt >= retries:
                    raise FileContentError(f"Failed to fetch {path}: {exc}") from exc

        raise FileContentError(f"Failed to fetch {path}")


async def _resolve_commit_ref(
    session: aiohttp.ClientSession,
    item: dict[str, Any],
) -> str:
    owner = item.get("owner")
    repository = item.get("repository_name")
    ref = str(item.get("ref") or "HEAD")
    if not isinstance(owner, str) or not isinstance(repository, str):
        return ref

    url = (
        f"https://api.github.com/repos/{owner}/{repository}/commits/"
        f"{quote(ref, safe='')}"
    )
    try:
        async with session.get(url) as response:
            if response.status != 200:
                return ref
            body = await response.json()
            sha = body.get("sha")
            return str(sha) if isinstance(sha, str) and sha else ref
    except (aiohttp.ClientError, asyncio.TimeoutError):
        return ref


async def fetch_repository_evidence(
    payload: dict[str, Any],
    token: str | None = None,
    *,
    concurrency: int = 6,
    timeout_seconds: int = 30,
    max_file_bytes: int = 750_000,
    retries: int = 2,
) -> dict[str, Any]:
    """Consume the Node verifier payload and fetch its selected files."""
    files = payload.get("repository_files")
    if not isinstance(files, list) or not files:
        raise FileContentError("Payload contains no repository_files")

    timeout = aiohttp.ClientTimeout(total=timeout_seconds)
    semaphore = asyncio.Semaphore(max(1, concurrency))
    headers = _api_headers(token or os.getenv("GITHUB_TOKEN"))

    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session:
        refs: dict[str, str] = {}
        for item in files:
            key = f"{item.get('owner')}:{item.get('repository_name')}:{item.get('ref')}"
            if key not in refs:
                refs[key] = await _resolve_commit_ref(session, item)

        resolved_files: list[dict[str, Any]] = []
        for item in files:
            key = f"{item.get('owner')}:{item.get('repository_name')}:{item.get('ref')}"
            resolved_ref = refs[key]
            resolved = dict(item)
            resolved["ref"] = resolved_ref
            file_url = resolved.get("file_url")
            if isinstance(file_url, str):
                resolved["file_url"] = file_url.split("?", 1)[0] + (
                    f"?ref={quote(resolved_ref, safe='')}"
                )
            resolved_files.append(resolved)

        results = await asyncio.gather(
            *[
                _fetch_one(session, item, semaphore, max_file_bytes, retries)
                for item in resolved_files
            ]
        )

    repositories: dict[str, dict[str, Any]] = {}
    for item, evidence in results:
        repository_id = str(item["repository_id"])
        repository = repositories.setdefault(
            repository_id,
            {
                "repository_id": repository_id,
                "snapshot_ref": item.get("ref", "UNKNOWN"),
                "repository_classification": item.get("classification", "UNKNOWN"),
                "objective_delivery": [],
                "evidence_units": [],
            },
        )
        objective_id = str(item.get("objective_id", "UNKNOWN"))
        objective = next(
            (o for o in repository["objective_delivery"] if o["objective_id"] == objective_id),
            None,
        )
        if objective is None:
            objective = {
                "objective_id": objective_id,
                "retrieval_status": "COMPLETE",
                "evidence_ids": [],
                "retrieval_gap": None,
            }
            repository["objective_delivery"].append(objective)
        objective["evidence_ids"].append(evidence["evidence_id"])
        repository["evidence_units"].append(evidence)

    return {"repositories": list(repositories.values())}
