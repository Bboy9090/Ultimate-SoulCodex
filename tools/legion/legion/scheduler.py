"""Swarm sizing and even, strategic distribution of tasks across agents.

Agents are logical: you can request 2, 678, 39,295 or 1,000,000. Each task is
assigned to exactly one agent with Longest-Processing-Time-first balancing, so
heavy tasks are spread first and every agent ends with as equal a load as the
task weights allow. Real network concurrency is bounded separately by the
provider's concurrency cap and rate limit.
"""
from __future__ import annotations

import heapq

from .models import Task

MAX_AGENTS = 10_000_000


def resolve_agent_count(requested, n_tasks: int) -> int:
    """'auto' -> one agent per task. Explicit N is clamped to [1, MAX_AGENTS]."""
    if requested is None or str(requested).lower() == "auto":
        return max(1, n_tasks)
    n = int(str(requested).replace(",", "").replace("_", ""))
    if n < 1:
        raise ValueError("agent count must be >= 1")
    return min(n, MAX_AGENTS)


def agent_name(index: int, width: int) -> str:
    return f"A-{index:0{width}d}"


class Fleet:
    """Persistent least-loaded assignment across all waves of a run."""

    def __init__(self, requested_agents: int, total_tasks: int):
        self.requested = requested_agents
        # Agents beyond the number of tasks would never receive work; they are
        # reported as idle rather than pretended to be busy.
        self.active = max(1, min(requested_agents, total_tasks))
        self.width = len(str(requested_agents))
        self._heap: list[tuple[int, int]] = [(0, i) for i in range(self.active)]
        self.loads = [0] * self.active
        self.counts = [0] * self.active

    def assign(self, tasks: list[Task]) -> dict[str, str]:
        """Assign tasks (heaviest first) to the least-loaded agent."""
        out: dict[str, str] = {}
        for t in sorted(tasks, key=lambda t: (-t.weight, t.id)):
            load, idx = heapq.heappop(self._heap)
            load += t.weight
            self.loads[idx] = load
            self.counts[idx] += 1
            heapq.heappush(self._heap, (load, idx))
            out[t.id] = agent_name(idx + 1, self.width)
        return out

    def stats(self) -> dict:
        used = [c for c in self.counts if c]
        loads = [self.loads[i] for i, c in enumerate(self.counts) if c]
        return {
            "agents_requested": self.requested,
            "agents_with_work": len(used),
            "agents_idle": self.requested - len(used),
            "max_tasks_per_agent": max(used) if used else 0,
            "min_tasks_per_agent": min(used) if used else 0,
            "max_load": max(loads) if loads else 0,
            "min_load": min(loads) if loads else 0,
        }


def batches(items: list, size: int):
    """Yield consecutive chunks: 1 by 1, 4 by 4, 2728 by 2728..."""
    if size < 1:
        raise ValueError("batch size must be >= 1")
    for i in range(0, len(items), size):
        yield items[i:i + size]


def estimate_calls(n_tasks: int, reviewers: int, judges: int, max_review_rounds: int, max_retrials: int) -> tuple[int, int]:
    """(best case, worst case) model calls for the execution phase."""
    best = n_tasks * (1 + reviewers + judges)
    per_trial = (max_review_rounds + 1) * (1 + reviewers) + judges
    worst = n_tasks * (1 + max_retrials) * per_trial
    return best, worst
