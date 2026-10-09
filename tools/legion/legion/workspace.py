"""Workspace mode: bind a Legion run to a real git repository.

* Evidence commands run on a clean, detached checkout of the exact HEAD commit,
  so agents audit what the repo really does, not what someone claims it does.
* Context files are read from that commit (`git show <sha>:<path>`).
* Code deliverables are overlaid onto their own fresh checkout, the repo's own
  test command runs there, and the resulting change is captured as a git patch.

Ignored-but-required directories (node_modules, virtualenvs, build output) are
symlinked from the source repository into each checkout instead of being copied.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import threading
import uuid
from contextlib import contextmanager
from pathlib import Path

from .sandbox import sanitized_env

AUTO_LINK_NAMES = ("node_modules", ".venv", "venv")


class WorkspaceError(RuntimeError):
    pass


def _git(root: Path, *args: str, check: bool = True, input_text: str | None = None) -> subprocess.CompletedProcess:
    proc = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True, input=input_text)
    if check and proc.returncode != 0:
        raise WorkspaceError(f"git {' '.join(args)} failed: {proc.stderr.strip()[:500]}")
    return proc


def run_shell(command: str, cwd: Path, timeout: int) -> tuple[int, str]:
    env = sanitized_env()
    env.setdefault("CI", "true")
    try:
        proc = subprocess.run(command, cwd=cwd, shell=True, capture_output=True, text=True,
                              timeout=timeout, env=env)
    except subprocess.TimeoutExpired as exc:
        out = exc.stdout or ""
        if isinstance(out, bytes):
            out = out.decode(errors="replace")
        return 124, out + f"\n[legion] command timed out after {timeout}s"
    return proc.returncode, (proc.stdout + ("\n" + proc.stderr if proc.stderr.strip() else "")).strip()


class Workspace:
    def __init__(self, path: str | Path, *, setup_command: str | None = None, link_dirs: list[str] | None = None,
                 evidence_timeout: int = 900):
        root = Path(path).expanduser().resolve()
        if not root.is_dir():
            raise WorkspaceError(f"workspace {root} is not a directory")
        top = _git(root, "rev-parse", "--show-toplevel").stdout.strip()
        self.root = Path(top)
        self.head = _git(self.root, "rev-parse", "HEAD").stdout.strip()
        self.dirty = bool(_git(self.root, "status", "--porcelain", "--untracked-files=no").stdout.strip())
        self.setup_command = setup_command
        self.evidence_timeout = evidence_timeout
        self.link_dirs = link_dirs if link_dirs is not None else self._detect_link_dirs()
        self._base = Path(tempfile.mkdtemp(prefix="legion_ws_"))
        self._git_lock = threading.Lock()
        self._evidence: dict[str, str] = {}
        self._evidence_locks: dict[str, threading.Lock] = {}
        self._registry_lock = threading.Lock()

    @property
    def short(self) -> str:
        return self.head[:12]

    def _detect_link_dirs(self) -> list[str]:
        found = []
        for dirpath, dirnames, _ in os.walk(self.root):
            rel_depth = len(Path(dirpath).relative_to(self.root).parts)
            for name in list(dirnames):
                if name in AUTO_LINK_NAMES:
                    found.append(str((Path(dirpath) / name).relative_to(self.root)))
                if name in AUTO_LINK_NAMES or name == ".git" or rel_depth >= 3:
                    dirnames.remove(name)
        return sorted(found)

    def describe(self) -> dict:
        return {"root": str(self.root), "head": self.head, "dirty_working_tree": self.dirty,
                "linked": self.link_dirs, "setup_command": self.setup_command}

    @contextmanager
    def checkout(self):
        dest = self._base / uuid.uuid4().hex[:12]
        with self._git_lock:
            _git(self.root, "worktree", "add", "--detach", "--quiet", str(dest), self.head)
        try:
            for rel in self.link_dirs:
                src, link = self.root / rel, dest / rel
                if not src.exists() or link.exists():
                    continue
                link.parent.mkdir(parents=True, exist_ok=True)
                if Path(rel).name == "node_modules":
                    self._mirror_node_modules(src, link, dest)
                else:
                    link.symlink_to(src, target_is_directory=True)
            if self.setup_command:
                rc, out = run_shell(self.setup_command, dest, self.evidence_timeout)
                if rc != 0:
                    raise WorkspaceError(f"workspace setup failed (exit {rc}): {out[-1500:]}")
            yield dest
        finally:
            with self._git_lock:
                _git(self.root, "worktree", "remove", "--force", str(dest), check=False)
            shutil.rmtree(dest, ignore_errors=True)

    def _mirror_node_modules(self, src: Path, dest: Path, checkout: Path) -> None:
        """Build a real node_modules directory of symlinks into the installed one, except that
        workspace packages (symlinks pointing back into the repository, as npm/yarn/pnpm
        workspaces create) are re-pointed at the checkout, so changed package sources are the
        ones that get imported."""
        dest.mkdir()
        for entry in src.iterdir():
            target = dest / entry.name
            if entry.name.startswith("@") and entry.is_dir() and not entry.is_symlink():
                target.mkdir()
                children = list(entry.iterdir())
            else:
                children = [entry]
                target = dest
            for child in children:
                link = target / child.name
                if child.is_symlink():
                    resolved = child.resolve()
                    try:
                        inside = resolved.relative_to(self.root)
                    except ValueError:
                        inside = None
                    if inside is not None and "node_modules" not in inside.parts:
                        link.symlink_to(checkout / inside, target_is_directory=True)
                        continue
                link.symlink_to(child, target_is_directory=child.is_dir())

    def evidence(self, command: str) -> str:
        """Run a command on a clean checkout of HEAD once; later calls reuse the result."""
        with self._registry_lock:
            lock = self._evidence_locks.setdefault(command, threading.Lock())
        with lock:
            if command not in self._evidence:
                with self.checkout() as wt:
                    rc, out = run_shell(command, wt, self.evidence_timeout)
                if len(out) > 24000:
                    out = out[:6000] + f"\n[... {len(out) - 18000:,} characters cut ...]\n" + out[-12000:]
                self._evidence[command] = (f"$ {command}\n(exit code {rc}; ran on a clean checkout of commit {self.head})\n"
                                           f"{out}")
            return self._evidence[command]

    def read_file(self, rel: str, limit: int) -> str:
        proc = _git(self.root, "show", f"{self.head}:{rel}", check=False)
        if proc.returncode != 0:
            return f"[file {rel} does not exist at commit {self.short}]"
        text = proc.stdout
        if len(text) > limit:
            return text[:limit] + f"\n[... cut: file is {len(text):,} characters, shown {limit:,} ...]"
        return text

    def apply_and_test(self, files: dict[str, str], test_command: str, timeout: int,
                       deletions: list[str] | None = None) -> tuple[int, str, str]:
        """Overlay files (and deletions) on a fresh checkout, run the test command,
        return (rc, log, patch)."""
        deletions = deletions or []
        with self.checkout() as wt:
            for rel in deletions:
                if not (wt / rel).is_file():
                    return 1, f"[legion] cannot delete {rel}: no such tracked file at {self.short}", ""
                _git(wt, "rm", "-q", "--", rel)
            for rel, body in files.items():
                dest = wt / rel
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(body, encoding="utf-8")
            if files:
                _git(wt, "add", "-A", "--", *files)
            patch = _git(wt, "diff", "--cached", "--binary", self.head).stdout
            rc, log = run_shell(test_command, wt, timeout)
        return rc, log, patch

    def integrate(self, patches: list[tuple[str, str]], gate_command: str, timeout: int) -> dict:
        """Apply every passed patch together on one checkout and run the final gate."""
        applied, conflicts = [], []
        with self.checkout() as wt:
            for task_id, patch in patches:
                if not patch.strip():
                    continue
                proc = _git(wt, "apply", "--index", "--whitespace=nowarn", "-", check=False, input_text=patch)
                if proc.returncode == 0:
                    applied.append(task_id)
                else:
                    conflicts.append({"task": task_id, "error": proc.stderr.strip()[:800]})
            combined = _git(wt, "diff", "--cached", "--binary", self.head).stdout
            rc, log = run_shell(gate_command, wt, timeout)
        return {"head": self.head, "applied": applied, "conflicts": conflicts, "gate_command": gate_command,
                "gate_exit": rc, "passed": rc == 0 and not conflicts, "combined_patch": combined, "log": log}

    def close(self) -> None:
        with self._git_lock:
            _git(self.root, "worktree", "prune", check=False)
        shutil.rmtree(self._base, ignore_errors=True)
