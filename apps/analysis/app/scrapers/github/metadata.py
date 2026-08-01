from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from app.models.responses import DirectorySizeEntry, RepositoryStatistics, TreeNode
from app.models.enums import TreeNodeType


@dataclass
class _TrieNode:
    name: str
    node_type: TreeNodeType
    children: dict[str, "_TrieNode"] = field(default_factory=dict)
    file_count: int = 0


@dataclass
class TreeBuildResult:
    tree: TreeNode
    statistics: RepositoryStatistics


def build_tree_and_statistics(
    root_name: str,
    entries: list[dict],
    truncated: bool,
) -> TreeBuildResult:
    root = _TrieNode(
        name=root_name,
        node_type=TreeNodeType.DIRECTORY,
    )

    total_files = 0
    total_directories = 0
    max_depth = 0
    deepest_path = ""
    extension_counts: dict[str, int] = {}

    for entry in entries:
        path = entry.get("path", "")
        entry_type = entry.get("type")

        if not path or entry_type not in ("blob", "tree", "commit"):
            continue

        segments = path.split("/")

        if len(segments) > max_depth:
            max_depth = len(segments)
            deepest_path = path

        if entry_type == "blob":
            node_type = TreeNodeType.FILE
        elif entry_type == "tree":
            node_type = TreeNodeType.DIRECTORY
        else:
            node_type = TreeNodeType.SUBMODULE

        _insert(root, segments, node_type)

        if entry_type == "blob":
            total_files += 1
            extension = _extension_of(segments[-1])
            extension_counts[extension] = extension_counts.get(extension, 0) + 1
        elif entry_type == "tree":
            total_directories += 1

    _compute_recursive_file_counts(root)

    directory_counts = _collect_directory_paths_and_counts(root)

    largest_directories = sorted(
        (
            DirectorySizeEntry(path=path, file_count=count)
            for path, count in directory_counts.items()
        ),
        key=lambda item: item.file_count,
        reverse=True,
    )[:10]

    widest_directory = ""
    widest_directory_count = 0

    for path, count in _collect_direct_child_counts(root).items():
        if count > widest_directory_count:
            widest_directory = path
            widest_directory_count = count

    empty_directories = [
        path
        for path, count in directory_counts.items()
        if count == 0
    ]

    statistics = RepositoryStatistics(
        total_files=total_files,
        total_directories=total_directories,
        total_nodes=_count_total_nodes(root),
        max_depth=max_depth,
        deepest_path=deepest_path,
        widest_directory=widest_directory,
        widest_directory_count=widest_directory_count,
        empty_directories=empty_directories,
        largest_directories=largest_directories,
        file_count_by_extension=dict(
            sorted(
                extension_counts.items(),
                key=lambda kv: -kv[1],
            )
        ),
        tree_truncated=truncated,
    )

    return TreeBuildResult(
        tree=_to_tree_node_root(root, root_name),
        statistics=statistics,
    )


def _insert(
    root: _TrieNode,
    segments: list[str],
    leaf_type: TreeNodeType,
) -> None:
    node = root

    for index, segment in enumerate(segments):
        is_leaf = index == len(segments) - 1

        if segment not in node.children:
            node.children[segment] = _TrieNode(
                name=segment,
                node_type=leaf_type if is_leaf else TreeNodeType.DIRECTORY,
            )
        elif is_leaf:
            node.children[segment].node_type = leaf_type

        node = node.children[segment]


def _compute_recursive_file_counts(node: _TrieNode) -> int:
    if node.node_type in (
        TreeNodeType.FILE,
        TreeNodeType.SUBMODULE,
    ):
        return 0

    total = 0

    for child in node.children.values():
        if child.node_type == TreeNodeType.FILE:
            total += 1
        elif child.node_type == TreeNodeType.DIRECTORY:
            total += _compute_recursive_file_counts(child)

    node.file_count = total
    return total


def _collect_directory_paths_and_counts(
    node: _TrieNode,
    prefix: str = "",
) -> dict[str, int]:
    result: dict[str, int] = {}

    for name, child in node.children.items():
        if child.node_type != TreeNodeType.DIRECTORY:
            continue

        path = f"{prefix}/{name}" if prefix else name

        result[path] = child.file_count
        result.update(
            _collect_directory_paths_and_counts(
                child,
                path,
            )
        )

    return result


def _collect_direct_child_counts(
    node: _TrieNode,
    prefix: str = "",
) -> dict[str, int]:
    result: dict[str, int] = {}

    for name, child in node.children.items():
        if child.node_type != TreeNodeType.DIRECTORY:
            continue

        path = f"{prefix}/{name}" if prefix else name

        result[path] = len(child.children)
        result.update(
            _collect_direct_child_counts(
                child,
                path,
            )
        )

    return result


def _count_total_nodes(node: _TrieNode) -> int:
    count = 1

    for child in node.children.values():
        count += _count_total_nodes(child)

    return count


def _extension_of(filename: str) -> str:
    if "." not in filename:
        return "(no extension)"

    return "." + filename.rsplit(".", 1)[-1]


def _to_tree_node_root(
    root: _TrieNode,
    root_name: str,
) -> TreeNode:
    children = [
        _to_tree_node(child, "")
        for child in sorted(
            root.children.values(),
            key=lambda child: (
                child.node_type != TreeNodeType.DIRECTORY,
                child.name.lower(),
            ),
        )
    ]

    return TreeNode(
        name=root_name,
        type=TreeNodeType.DIRECTORY,
        path="",
        children=children,
    )


def _to_tree_node(
    node: _TrieNode,
    parent_path: str,
) -> TreeNode:
    current_path = (
        f"{parent_path}/{node.name}".lstrip("/")
        if parent_path
        else node.name
    )

    children: Optional[list[TreeNode]] = None

    if node.node_type == TreeNodeType.DIRECTORY:
        children = [
            _to_tree_node(child, current_path)
            for child in sorted(
                node.children.values(),
                key=lambda child: (
                    child.node_type != TreeNodeType.DIRECTORY,
                    child.name.lower(),
                ),
            )
        ]

    return TreeNode(
        name=node.name,
        type=node.node_type,
        path=current_path,
        children=children,
    )