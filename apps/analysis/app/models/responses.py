from dataclasses import dataclass
from typing import List, Optional


@dataclass
class TreeNode:
    name: str
    type: str  # "file", "directory", "submodule"
    path: str
    children: Optional[List["TreeNode"]] = None


@dataclass
class DirectorySizeEntry:
    path: str
    file_count: int


@dataclass
class RepositoryStatistics:
    total_files: int
    total_directories: int
    total_nodes: int
    max_depth: int
    deepest_path: str
    widest_directory: str
    widest_directory_count: int
    empty_directories: List[str]
    largest_directories: List[DirectorySizeEntry]
    file_count_by_extension: dict[str, int]
    tree_truncated: bool


@dataclass
class RepoSummary:
    """Summary for a single repository with classification."""
    name: str
    owner: str
    classification: str  # "self_owned", "forked", "contributor"
    statistics: RepositoryStatistics


@dataclass
class ProfileSummary:
    """Summary of all repositories in a GitHub profile."""
    username: str
    total_repos: int
    self_owned: int
    forked: int
    contributor: int
    repo_summaries: List[RepoSummary]