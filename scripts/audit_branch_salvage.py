#!/usr/bin/env python3
"""Read-only salvage inventory for Soul Codex remote branches.

Prerequisites: an up-to-date local clone with remote refs fetched.
Example:
  git fetch --prune origin '+refs/heads/*:refs/remotes/origin/*'
  python3 scripts/audit_branch_salvage.py --base origin/main --remote origin --output branch-salvage.json

This tool NEVER checks out, rebases, cherry-picks, pushes, deletes, or merges.
It does not claim that patch-equivalence proves functional equivalence.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys


def git(*args: str) -> str:
    process = subprocess.run(
        ["git", *args], capture_output=True, text=True, check=False
    )
    if process.returncode:
        raise RuntimeError(
            f"git {' '.join(args)} failed ({process.returncode}): "
            + process.stderr.strip()[:500]
        )
    return process.stdout.strip()


def classify(ahead: int, behind: int, unrepresented: int | None) -> str:
    """Classify graph ancestry, then patch-ID evidence (not merge safety)."""
    if ahead == 0:
        return "ancestor_or_equal"
    if unrepresented == 0:
        return "patch_equivalent_review"
    if unrepresented is None:
        return "manual_review"
    if behind == 0:
        return "ahead_unique_review"
    return "diverged_unique_review"


def inspect_branch(base: str, branch: str) -> dict:
    counts = git("rev-list", "--left-right", "--count", f"{base}...{branch}")
    behind, ahead = [int(x) for x in counts.split()]
    unrepresented = None
    representative = []
    if ahead:
        try:
            # git cherry compares patch IDs against base. A leading '+' indicates
            # no corresponding patch ID was found. Merge commits are excluded.
            cherry_lines = git("cherry", base, branch).splitlines()
            representative = [
                line.split()[1] for line in cherry_lines
                if line.startswith("+ ") and len(line.split()) >= 2
            ]
            unrepresented = len(representative)
        except RuntimeError:
            pass
    return {
        "branch": branch,
        "ahead": ahead,
        "behind": behind,
        "unrepresented_patch_ids": unrepresented,
        "sample_unique_commits": representative[:12],
        "status": classify(ahead, behind, unrepresented),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="origin/main")
    parser.add_argument("--remote", default="origin")
    parser.add_argument("--output", default="branch-salvage.json")
    args = parser.parse_args()
    git("rev-parse", "--show-toplevel")
    git("rev-parse", "--verify", args.base)
    head_sha = git("rev-parse", args.base)
    refspec = f"refs/remotes/{args.remote}/"
    refs = git(
        "for-each-ref", "--format=%(refname)", f"refs/remotes/{args.remote}/"
    ).splitlines()
    branches = [
        ref for ref in refs
        if ref.startswith(refspec) and ref != refspec + "HEAD"
        and not ref.endswith("/HEAD")
        and ref != f"{refspec}{args.base.split('/')[-1]}"
    ]
    items = []
    errors = []
    for ref in branches:
        try:
            items.append(inspect_branch(args.base, ref))
        except RuntimeError as exc:
            errors.append({"branch": ref, "error": str(exc)})
    categories = {}
    for row in items:
        categories[row["status"]] = categories.get(row["status"], 0) + 1
    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "base": args.base,
        "base_sha": head_sha,
        "total_remote_branches_examined": len(branches),
        "categories": categories,
        "branches": items,
        "errors": errors,
        "interpretation": (
            "Ahead does not prove useful missing functionality. Patch-ID matches "
            "are advisory, not semantic equivalence. Inspect current main, old "
            "PRs, tests, and files before porting anything."
        ),
    }
    destination = Path(args.output)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(
        f"Read-only inventory: {len(items)} branches, "
        f"{len(errors)} errors; base {head_sha[:12]}; wrote {destination}"
    )
    print(json.dumps(categories, sort_keys=True))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
