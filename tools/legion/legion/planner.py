"""The Commander: turns a goal into a validated dependency graph of tasks."""
from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from .models import KINDS, Task
from .providers import Provider, complete_json

COMMANDER_SYSTEM = """ROLE: COMMANDER
You are the Commander of the Legion, a multi-agent swarm. You decompose a goal into
concrete, self-contained tasks that independent worker agents can each finish in one pass.

Rules:
- Each task must be specific and verifiable. Put everything the worker needs in "instructions".
- Use "kind": "code" for tasks whose deliverable is source code; "text" for everything else.
- Code tasks are executed by a Master Tester: their worker must ship pytest tests. If the code is
  not Python, set "test_command" to a shell command that runs its tests.
- Use "depends_on" only when a task truly needs another task's output. Maximise parallelism.
- "weight" is relative effort from 1 (tiny) to 10 (large).
- "acceptance" states exactly what a reviewer must see to approve the task.
- Ids are short slugs (t1, t2, ...). No cycles.

Reply with ONLY JSON:
{"tasks": [{"id": "t1", "title": "...", "instructions": "...", "kind": "text",
            "depends_on": [], "weight": 3, "acceptance": "...", "test_command": null}]}
"""


class PlanError(ValueError):
    pass


def validate_tasks(raw, max_tasks: int | None = None) -> list[Task]:
    if isinstance(raw, dict):
        raw = raw.get("tasks")
    if not isinstance(raw, list) or not raw:
        raise PlanError("plan must contain a non-empty 'tasks' list")
    if max_tasks is not None and len(raw) > max_tasks:
        raise PlanError(f"plan has {len(raw)} tasks; the limit is {max_tasks}")
    tasks: list[Task] = []
    seen: set[str] = set()
    for i, item in enumerate(raw):
        if not isinstance(item, dict):
            raise PlanError(f"task #{i} is not an object")
        try:
            t = Task.from_dict(item)
        except (KeyError, ValueError, TypeError) as exc:
            raise PlanError(f"task #{i} is malformed: {exc}") from exc
        if not t.instructions.strip():
            raise PlanError(f"task {t.id} has empty instructions")
        if t.kind not in KINDS:
            raise PlanError(f"task {t.id} has unknown kind {t.kind!r}")
        if t.id in seen:
            raise PlanError(f"duplicate task id {t.id}")
        seen.add(t.id)
        tasks.append(t)
    for t in tasks:
        for dep in t.depends_on + t.after:
            if dep not in seen:
                raise PlanError(f"task {t.id} depends on unknown task {dep}")
            if dep == t.id:
                raise PlanError(f"task {t.id} depends on itself")
    topo_waves(tasks)  # raises on cycles
    return tasks


def topo_waves(tasks: list[Task]) -> list[list[Task]]:
    """Group tasks into waves: every task's dependencies sit in earlier waves."""
    by_id = {t.id: t for t in tasks}
    indeg = {t.id: len(set(t.depends_on) | set(t.after)) for t in tasks}
    children: dict[str, list[str]] = {t.id: [] for t in tasks}
    for t in tasks:
        for dep in set(t.depends_on) | set(t.after):
            children[dep].append(t.id)
    frontier = deque(tid for tid, d in indeg.items() if d == 0)
    waves: list[list[Task]] = []
    placed = 0
    while frontier:
        wave_ids = list(frontier)
        frontier.clear()
        waves.append([by_id[i] for i in wave_ids])
        placed += len(wave_ids)
        for tid in wave_ids:
            for child in children[tid]:
                indeg[child] -= 1
                if indeg[child] == 0:
                    frontier.append(child)
    if placed != len(tasks):
        stuck = sorted(tid for tid, d in indeg.items() if d > 0)
        raise PlanError(f"dependency cycle among tasks: {', '.join(stuck[:20])}")
    return waves


FILE_CONFIG_KEYS = {"goal", "agents", "batch_size", "reviewers", "judges", "max_review_rounds", "max_retrials",
                    "pass_threshold", "test_timeout", "evidence_timeout", "workspace_setup", "final_gate",
                    "dep_context_chars"}


def load_task_file_config(path: str | Path) -> dict:
    """Optional run settings stored next to the tasks: {"config": {...}, "tasks": [...]}."""
    p = Path(path)
    if p.suffix.lower() == ".jsonl":
        return {}
    raw = json.loads(p.read_text(encoding="utf-8"))
    cfg = raw.get("config", {}) if isinstance(raw, dict) else {}
    unknown = set(cfg) - FILE_CONFIG_KEYS
    if unknown:
        raise PlanError(f"unknown keys in task file config: {sorted(unknown)}")
    return cfg


def load_tasks_file(path: str | Path) -> list[Task]:
    """Load tasks from a .json ({"tasks": [...]} or [...]) or .jsonl file."""
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if p.suffix.lower() == ".jsonl":
        raw = [json.loads(line) for line in text.splitlines() if line.strip()]
    else:
        raw = json.loads(text)
    return validate_tasks(raw)


async def plan(commander: Provider, goal: str, max_tasks: int = 50) -> list[Task]:
    prompt = (
        f"GOAL:\n{goal}\n\n"
        f"Decompose this goal into at most {max_tasks} tasks. Choose the number of tasks the goal "
        f"actually needs — no padding, no gaps."
    )
    return await complete_json(
        commander, COMMANDER_SYSTEM, prompt, validate=lambda raw: validate_tasks(raw, max_tasks)
    )
