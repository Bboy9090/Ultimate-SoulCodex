"""Core data structures."""
from __future__ import annotations

from dataclasses import asdict, dataclass, field

KINDS = ("text", "code")

PASSED = "PASSED"
FAILED = "FAILED"
BLOCKED = "BLOCKED"          # a dependency did not pass — correct behaviour, not a crash
HALTED = "HALTED"            # call budget exhausted before this task finished
ERROR = "ERROR"              # provider/infra error
PENDING = "PENDING"


@dataclass
class Task:
    id: str
    title: str
    instructions: str
    kind: str = "text"
    depends_on: list[str] = field(default_factory=list)
    weight: int = 1
    acceptance: str = ""
    test_command: str | None = None
    # Workspace mode (see legion/workspace.py)
    evidence_command: str | None = None
    context_files: list[str] = field(default_factory=list)
    allow_patterns: list[str] = field(default_factory=list)
    role: str = ""
    # Ordering-only dependencies: wait for these, see their outcome, but run even if they fail.
    after: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "Task":
        return cls(
            id=str(d["id"]),
            title=str(d.get("title") or d["id"]),
            instructions=str(d["instructions"]),
            kind=str(d.get("kind", "text")).lower(),
            depends_on=[str(x) for x in d.get("depends_on", []) or []],
            weight=max(1, min(10, int(d.get("weight", 1) or 1))),
            acceptance=str(d.get("acceptance", "") or ""),
            test_command=d.get("test_command") or None,
            evidence_command=d.get("evidence_command") or None,
            context_files=[str(x) for x in d.get("context_files", []) or []],
            allow_patterns=[str(x) for x in d.get("allow_patterns", []) or []],
            role=str(d.get("role", "") or ""),
            after=[str(x) for x in d.get("after", []) or []],
        )


@dataclass
class TaskResult:
    task_id: str
    status: str = PENDING
    agent: str = ""
    output: str = ""
    worker_calls: int = 0
    review_rounds: int = 0
    retrials: int = 0
    committee: list[dict] = field(default_factory=list)
    judges: list[dict] = field(default_factory=list)
    tester: dict = field(default_factory=dict)
    mean_score: float | None = None
    reason: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "TaskResult":
        return cls(**d)
