"""The Master Tester: deterministic, model-free checks.

1. Placeholder scan — TODO/FIXME/lorem ipsum/"insert X here"/stub ellipses/etc.
2. For code tasks: extract every file, reject unsafe paths, syntax-check Python,
   write them to a scratch directory and actually run the tests.

WARNING: running tests executes model-written code on this machine. Use
--no-exec to disable execution (syntax checks and scans still run), or run
Legion inside a container/VM.
"""
from __future__ import annotations

import importlib.util
import os
import re
import subprocess
import sys
import tempfile
from dataclasses import asdict, dataclass, field
from pathlib import Path, PurePosixPath

PLACEHOLDER_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("TODO marker", re.compile(r"\bTODO\b")),
    ("FIXME marker", re.compile(r"\bFIXME\b")),
    ("TBD marker", re.compile(r"\bTBD\b")),
    ("lorem ipsum filler", re.compile(r"lorem ipsum", re.I)),
    ("'insert ... here' gap", re.compile(r"\[\s*(insert|add|your|fill)[^\]\n]{0,60}\]", re.I)),
    ("'your ... here' gap", re.compile(r"\byour [a-z ]{1,30} (goes )?here\b", re.I)),
    ("placeholder wording", re.compile(r"(?<![\w-])placeholder(?![\w-]*\s*[=:])", re.I)),
    ("stub ellipsis line", re.compile(r"^\s*(\.\.\.|…)\s*$", re.M)),
    ("rest-omitted comment", re.compile(r"(#|//)\s*\.\.\.?\s*(rest|remaining|more|etc|same)", re.I)),
    ("unimplemented stub", re.compile(r"raise\s+NotImplementedError")),
]

FILE_BLOCK = re.compile(
    r"^#{2,4}\s*FILE:\s*`?(?P<path>[^\n`]+?)`?\s*\n```[^\n]*\n(?P<body>.*?)\n```[ \t]*$",
    re.S | re.M,
)


@dataclass
class TesterReport:
    passed: bool
    issues: list[str] = field(default_factory=list)
    files: dict[str, str] = field(default_factory=dict)
    log: str = ""
    executed: bool = False
    patch: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["files"] = sorted(self.files)  # names only in the ledger; bodies live in the output
        return d


def scan_placeholders(text: str, allow: list[str] | None = None) -> list[str]:
    allow = allow or []
    findings = []
    for label, pattern in PLACEHOLDER_PATTERNS:
        if label in allow:
            continue
        m = pattern.search(text)
        if m:
            line = text.count("\n", 0, m.start()) + 1
            snippet = text[m.start():m.end()].strip()[:60]
            findings.append(f"{label} at line {line}: {snippet!r}")
    return findings


DELETE_LINE = re.compile(r"^#{2,4}\s*DELETE:\s*`?(?P<path>[^\n`]+?)`?\s*$", re.M)


def extract_deletions(output: str) -> list[str]:
    return [m.group("path").strip() for m in DELETE_LINE.finditer(output)]


def extract_files(output: str) -> dict[str, str]:
    files: dict[str, str] = {}
    for m in FILE_BLOCK.finditer(output):
        files[m.group("path").strip()] = m.group("body") + "\n"
    return files


def _protected(path: str, link_dirs: list[str]) -> bool:
    parts = PurePosixPath(path.replace("\\", "/")).parts
    if ".git" in parts:
        return True
    norm = "/".join(parts)
    return any(norm == d or norm.startswith(d.rstrip("/") + "/") for d in link_dirs)


def added_lines(patch: str) -> str:
    return "\n".join(line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++"))


def _workspace_test(output, files, issues, test_command, allow_exec, timeout, workspace,
                    allow_patterns, deletions=()) -> TesterReport:
    prose = DELETE_LINE.sub("", FILE_BLOCK.sub("", output))
    issues += [f"placeholder in rationale: {f}" for f in scan_placeholders(prose, allow_patterns)]
    for path, body in files.items():
        if path.endswith(".py"):
            try:
                compile(body, path, "exec")
            except SyntaxError as exc:
                issues.append(f"syntax error in {path} line {exc.lineno}: {exc.msg}")
    if not test_command:
        issues.append("workspace code task has no test_command; the repository's own tests must judge it")
    if issues:
        return TesterReport(False, issues, files)
    if not allow_exec:
        return TesterReport(True, [], files, log="execution disabled (--no-exec); static checks passed")
    rc, log, patch = workspace.apply_and_test(files, test_command, timeout, deletions=list(deletions))
    log = log[-8000:]
    if log.startswith("[legion] cannot delete"):
        return TesterReport(False, [log.replace("[legion] ", "")], files, log, False, patch)
    if not patch.strip():
        return TesterReport(False, ["the delivered files are identical to the repository; nothing was changed"],
                            files, log, True, patch)
    introduced = scan_placeholders(added_lines(patch), allow_patterns)
    if introduced:
        return TesterReport(False, [f"placeholder introduced by this change: {f}" for f in introduced],
                            files, log, True, patch)
    if rc != 0:
        return TesterReport(False, [f"repository tests failed on {workspace.short} + this change "
                                    f"(exit {rc}):\n{log[-2500:]}"], files, log, True, patch)
    return TesterReport(True, [], files, log, True, patch)


def _safe_path(path: str) -> bool:
    p = PurePosixPath(path.replace("\\", "/"))
    return bool(path) and not p.is_absolute() and ".." not in p.parts and not re.match(r"^[A-Za-z]:", path)


def master_test(kind: str, output: str, *, test_command: str | None = None, allow_exec: bool = True,
                timeout: int = 180, allow_patterns: list[str] | None = None, workspace=None) -> TesterReport:
    # In workspace mode a code deliverable re-emits whole repository files, so pre-existing
    # content is not the agent's doing: the scan runs later, on added lines and prose only.
    deferred = workspace is not None and kind == "code"
    issues = [] if deferred else [f"placeholder: {f}" for f in scan_placeholders(output, allow_patterns)]
    if not output.strip():
        return TesterReport(False, ["empty deliverable"])
    if kind != "code":
        return TesterReport(not issues, issues)

    files = extract_files(output)
    deletions = extract_deletions(output) if workspace is not None else []
    if not files and not deletions:
        return TesterReport(False, issues + [
            "no files found; code must be delivered as '### FILE: path' followed by a fenced block"])
    for path in deletions:
        if path in files:
            issues.append(f"{path} is both written and deleted")
    for path in list(files) + deletions:
        if not _safe_path(path):
            issues.append(f"unsafe file path rejected: {path}")
        elif workspace is not None and _protected(path, workspace.link_dirs):
            issues.append(f"protected path rejected (git metadata or linked dependency dir): {path}")
    if any(i.startswith(("unsafe", "protected")) or i.endswith("written and deleted") for i in issues):
        return TesterReport(False, issues, files)

    if workspace is not None:
        return _workspace_test(output, files, issues, test_command, allow_exec, timeout, workspace, allow_patterns,
                               deletions)

    for path, body in files.items():
        if path.endswith(".py"):
            try:
                compile(body, path, "exec")
            except SyntaxError as exc:
                issues.append(f"syntax error in {path} line {exc.lineno}: {exc.msg}")

    has_py_tests = any(PurePosixPath(p).name.startswith("test_") and p.endswith(".py") for p in files)
    if not test_command and not has_py_tests:
        issues.append("no tests supplied: include test_*.py files (pytest) or set the task's test_command")
    if issues:
        return TesterReport(False, issues, files)
    if not allow_exec:
        return TesterReport(True, [], files, log="execution disabled (--no-exec); static checks passed")

    with tempfile.TemporaryDirectory(prefix="legion_mt_") as tmp:
        root = Path(tmp)
        for path, body in files.items():
            dest = root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(body, encoding="utf-8")
        if test_command:
            cmd, shell = test_command, True
        elif importlib.util.find_spec("pytest") is not None:
            cmd, shell = [sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider"], False
        else:
            cmd, shell = [sys.executable, "-m", "unittest", "discover", "-p", "test_*.py"], False
        env = dict(os.environ)
        env["PYTHONPATH"] = str(root) + os.pathsep + env.get("PYTHONPATH", "")
        env["PYTHONDONTWRITEBYTECODE"] = "1"
        try:
            proc = subprocess.run(cmd, cwd=root, shell=shell, capture_output=True, text=True,
                                  timeout=timeout, env=env)
        except subprocess.TimeoutExpired:
            return TesterReport(False, [f"tests timed out after {timeout}s"], files, executed=True)
        log = (proc.stdout + "\n" + proc.stderr).strip()[-6000:]
        if proc.returncode != 0:
            tail = log[-1500:]
            return TesterReport(False, [f"tests failed (exit {proc.returncode}):\n{tail}"], files, log, True)
        return TesterReport(True, [], files, log, True)
