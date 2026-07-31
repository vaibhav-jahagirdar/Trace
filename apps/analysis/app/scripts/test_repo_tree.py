#!/usr/bin/env python3
"""
Test the repository tree builder with a real GitHub repository.
Usage: python scripts/test_repo_tree.py <owner/repo> [ref]
Example: python scripts/test_repo_tree.py python/cpython main
"""

import sys
import json
from app.clients.github import GitHubClient
from app.scrapers.github.metadata import build_tree_and_statistics  # adjust import path


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_repo_tree.py <owner/repo> [ref]")
        print("Example: python scripts/test_repo_tree.py python/cpython main")
        sys.exit(1)

    repo = sys.argv[1]
    ref = sys.argv[2] if len(sys.argv) > 2 else "HEAD"

    client = GitHubClient()
    try:
        entries, truncated = client.get_repo_tree(repo, ref)
    except Exception as e:
        print(f"Error fetching tree: {e}")
        sys.exit(1)

    result = build_tree_and_statistics(repo, entries, truncated)

    print("\n" + "=" * 80)
    print("TREE (text view)")
    print("=" * 80)
    print(result.text)

    print("\n" + "=" * 80)
    print("STATISTICS")
    print("=" * 80)
    print(json.dumps(result.statistics.__dict__, indent=2, default=str))

    print("\n" + "=" * 80)
    print("TREE (JSON, first 2 levels)")
    print("=" * 80)
    # Print partial tree to avoid huge output
    def shorten_tree(node, max_depth=2):
        if max_depth == 0:
            return {"truncated": True}
        return {
            "name": node.name,
            "type": node.type,
            "path": node.path,
            "children": [shorten_tree(c, max_depth-1) for c in node.children[:5]] if node.children else None
        }
    print(json.dumps(shorten_tree(result.tree), indent=2))


if __name__ == "__main__":
    main()