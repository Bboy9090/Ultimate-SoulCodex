"""Scripted provider: deterministic stand-in for the model API, used only by the
test suite so every engine path can be exercised without network access."""
from __future__ import annotations

import json
import re
from collections import defaultdict

import pytest

from legion.providers import Budget, Provider

GOOD_CODE = '''### FILE: mathx.py
```python
def add(a, b):
    return a + b
```

### FILE: test_mathx.py
```python
from mathx import add


def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
```
'''

BROKEN_CODE = GOOD_CODE.replace("return a + b", "return a - b")


class ScriptedProvider(Provider):
    name = "scripted"

    def __init__(self, *, plan=None, todo_first=(), broken_first=(), reviewers_revise_once=(),
                 judge_fail_first=(), judge_always_fail=(), budget=None, max_concurrency=10_000,
                 code_replies=None):
        super().__init__("v1", max_concurrency=max_concurrency, budget=budget or Budget(None))
        self.plan = plan
        # task id -> list of successive worker replies for code tasks (last one repeats)
        self.code_replies = code_replies or {}
        self.prompts = defaultdict(list)
        self.todo_first = set(todo_first)
        self.broken_first = set(broken_first)
        self.reviewers_revise_once = set(reviewers_revise_once)
        self.judge_fail_first = set(judge_fail_first)
        self.judge_always_fail = set(judge_always_fail)
        self.worker_calls = defaultdict(int)
        self.role_calls = defaultdict(int)

    async def _call(self, system: str, prompt: str, max_tokens: int) -> str:
        role = system.splitlines()[0].replace("ROLE:", "").strip()
        self.role_calls[role] += 1
        m = re.search(r"TASK \[([^\]]+)\]", prompt)
        tid = m.group(1) if m else None
        if role == "COMMANDER":
            return json.dumps({"tasks": self.plan})
        if role.startswith("COMMANDER (SYNTHESIS)"):
            return "FINAL REPORT\n\n" + prompt.split("APPROVED TASK OUTPUTS:", 1)[1].strip()
        self.prompts[(role, tid)].append(prompt)
        if role == "WORKER":
            n = self.worker_calls[tid] = self.worker_calls[tid] + 1
            fix_requested = "REQUIRED FIXES" in prompt
            if tid in self.code_replies:
                replies = self.code_replies[tid]
                return replies[min(n, len(replies)) - 1]
            if "Kind: code" in prompt:
                return BROKEN_CODE if (tid in self.broken_first and n == 1) else GOOD_CODE
            body = f"Complete deliverable for {tid}, revision {n}."
            if tid in self.todo_first and n == 1:
                body += "\nTODO: finish the conclusion"
            if fix_requested and "[Judge" in prompt:
                body += "\nRETRIAL-FIX applied."
            if fix_requested and "[Committee" in prompt:
                body += "\nCOMMITTEE-FIX applied."
            return body
        deliverable = prompt.split("DELIVERABLE", 1)[-1]
        if role == "REVIEWER":
            if tid in self.reviewers_revise_once and "COMMITTEE-FIX" not in deliverable:
                return json.dumps({"verdict": "REVISE", "issues": ["section two is missing its evidence"]})
            return "Looks solid.\n```json\n" + json.dumps({"verdict": "APPROVE", "issues": []}) + "\n```"
        if role == "JUDGE":
            fail = tid in self.judge_always_fail or (tid in self.judge_fail_first and "RETRIAL-FIX" not in deliverable)
            s = 3 if fail else 9
            return json.dumps({"scores": {"correctness": s, "completeness": s, "quality": s, "adherence": s},
                               "verdict": "FAIL" if fail else "PASS",
                               "reason": "incomplete argument" if fail else "ready to ship"})
        raise AssertionError(f"unexpected role {role!r}")


@pytest.fixture
def scripted():
    return ScriptedProvider
