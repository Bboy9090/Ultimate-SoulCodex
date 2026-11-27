#!/usr/bin/env python3
"""Check the declared public name and compatibility metadata; not release certification."""
import argparse
import json
from pathlib import Path
import sys


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def read_json(root, relative):
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts or not relative or "\\" in relative:
        raise ValueError("Unsafe metadata path")
    target = root / path
    for parent in (target, *target.parents):
        if parent == root:
            break
        if parent.is_symlink():
            raise ValueError("Symlink metadata rejected")
    if not target.resolve().is_relative_to(root) or not target.is_file():
        raise ValueError(f"Missing metadata: {relative}")
    return json.loads(target.read_text(encoding="utf-8"), object_pairs_hook=unique_object)


def verify(root):
    root = root.resolve()
    contract = read_json(root, "product-identity.json")
    if contract["schema_version"] != 1 or contract["repository"] != "Bboy9090/Ultimate-SoulCodex":
        raise ValueError("Wrong repository contract")
    if contract["status"] != "recorded" or contract["public_name"] != "Soul Codex":
        raise ValueError("Unresolved or changed public identity; owner review required")
    required = {"title": ("Soul Codex", "public_name"),
                "slug": ("ultimate-soulcodex", "internal_identifier"),
                "exe_name": ("UltimateSoulCodex", "internal_identifier")}
    seen = set()
    for check in contract["checks"]:
        if check["path"] != "desktop_suite/app_meta.json" or check["format"] != "json":
            raise ValueError("Unexpected metadata source")
        key, = check["key"]
        if key not in required or key in seen:
            raise ValueError("Unexpected or duplicate check")
        expected, role = required[key]
        if (check["expected"], check["role"]) != (expected, role):
            raise ValueError("Contract changed; independent owner review required")
        actual = read_json(root, check["path"])[key]
        if type(actual) is not str or actual != expected:
            raise ValueError(f"Identity mismatch: {key}: {actual!r} != {expected!r}")
        seen.add(key)
    if seen != required.keys():
        raise ValueError("Required identity checks missing")
    ui = root / "desktop_suite/ui/index.html"
    if ui.is_symlink() or not ui.is_file() or not ui.resolve().is_relative_to(root):
        raise ValueError("Missing or unsafe desktop UI")
    html = ui.read_text(encoding="utf-8")
    if html.count("<title>Soul Codex</title>") != 1 or "Ultimate SoulCodex" in html:
        raise ValueError("Desktop UI title mismatch")
    return len(seen) + 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        count = verify(args.root)
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        print(f"IDENTITY CHECK FAILED: {exc}", file=sys.stderr)
        return 1
    print(f"SOURCE METADATA MATCH: {count} fields; installed UI, binary and store NOT VERIFIED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
