"""The Legion engine: waves -> batches -> worker -> Federation Committee ->
Master Tester + Fleet of Judges -> retrial or verdict -> synthesis."""
from __future__ import annotations

import asyncio
import json
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from statistics import mean
from typing import Callable

from .ledger import Ledger
from .models import BLOCKED, ERROR, FAILED, HALTED, PASSED, Task, TaskResult
from .planner import topo_waves
from .providers import BudgetExceeded, Provider, ProviderError, complete_json
from .scheduler import Fleet, batches, resolve_agent_count
from .tester import TesterReport, master_test, scan_placeholders

WORKER_SYSTEM = """ROLE: WORKER
You are agent {agent} of the Legion swarm. You own one task and must deliver it COMPLETE.
Hard rules:
- No placeholders, TODOs, FIXMEs, stubs, "..." ellipsis lines, lorem ipsum, "insert X here", or
  "rest omitted" shortcuts. Every part of the deliverable must be real and finished.
- Follow the task instructions and acceptance criteria exactly.
- Your work will be reviewed by a Federation Committee, executed by a Master Tester, and scored by
  a Fleet of Judges. Anything incomplete will be sent back.
"""

CODE_FORMAT = """
DELIVERY FORMAT FOR CODE (mandatory):
Output every file in full, each as:
### FILE: relative/path.ext
```language
<entire file contents>
```
Include pytest tests in files named test_*.py that import and genuinely exercise the code
(they will be executed). Keep any prose to a brief summary after the files.
"""

WORKSPACE_CODE_FORMAT = """
DELIVERY FORMAT FOR A CHANGE TO THE REPOSITORY (mandatory):
You are changing a real git repository at commit {head}. Output the COMPLETE new contents of every
file you add or modify — never a diff, never a fragment — each as:
### FILE: repo/relative/path.ext
```language
<entire file contents>
```
Your files are written over a clean checkout of that commit and the repository's own tests run:
    {test_command}
They must pass. Do not weaken, skip or delete an existing assertion to make it pass unless the
assertion is provably stale, and say so explicitly with the evidence. After the files, give a short
rationale: root cause, what changed, and why it is correct.
"""

REVIEWER_SYSTEM = """ROLE: REVIEWER
You are {member} of the Federation Committee. Your review lens: {lens}.
Inspect the deliverable strictly against the task and its acceptance criteria. Approve only when
there are no material problems through your lens. When you ask for revision, list concrete,
actionable issues (what is wrong and what must change).
Reply with ONLY JSON: {{"verdict": "APPROVE" | "REVISE", "issues": ["..."]}}
"""

JUDGE_SYSTEM = """ROLE: JUDGE
You are {judge} of the Fleet of Auditors and Judges — the final authority. Score the deliverable
independently from 0 to 10 on each criterion:
- correctness: is it accurate / does it work?
- completeness: is every requirement fully delivered, with nothing stubbed or missing?
- quality: is it well constructed, clear and professional?
- adherence: does it follow the instructions and acceptance criteria exactly?
Verdict PASS only if it is ready to ship as-is.
Reply with ONLY JSON:
{{"scores": {{"correctness": 0, "completeness": 0, "quality": 0, "adherence": 0}},
  "verdict": "PASS" | "FAIL", "reason": "one or two sentences; for FAIL, what must be fixed"}}
"""

SYNTH_SYSTEM = """ROLE: COMMANDER (SYNTHESIS)
Assemble the final deliverable for the goal from the approved task outputs below. Integrate them
into one coherent, complete result. Do not invent facts beyond the outputs and do not drop
substantive content. If some tasks did not pass, state plainly which parts are missing.
No placeholders of any kind.
"""

LENSES = [
    "correctness and technical/factual accuracy",
    "completeness against the task instructions and acceptance criteria",
    "instruction adherence, clarity, and absence of placeholders or shortcuts",
    "consistency with the overall goal and with the dependency outputs",
    "edge cases, robustness and failure modes",
]

SCORE_KEYS = ("correctness", "completeness", "quality", "adherence")


@dataclass
class Config:
    goal: str
    agents: str | int = "auto"
    batch_size: int = 4
    reviewers: int = 3
    judges: int = 3
    max_review_rounds: int = 2
    max_retrials: int = 1
    pass_threshold: float = 7.0
    allow_exec: bool = True
    test_timeout: int = 180
    dep_context_chars: int = 16000
    synthesize: bool = True
    synth_char_limit: int = 200_000
    allow_patterns: list[str] = field(default_factory=list)
    # Workspace mode
    workspace: str | None = None
    workspace_setup: str | None = None
    final_gate: str | None = None
    evidence_timeout: int = 900
    context_chars_per_file: int = 60_000
    context_chars_total: int = 160_000

    def to_dict(self) -> dict:
        return asdict(self)


def _validate_vote(raw) -> dict:
    if not isinstance(raw, dict):
        raise ValueError("expected a JSON object")
    verdict = str(raw.get("verdict", "")).upper().strip()
    if verdict not in ("APPROVE", "REVISE"):
        raise ValueError("verdict must be APPROVE or REVISE")
    issues = raw.get("issues") or []
    if not isinstance(issues, list):
        raise ValueError("issues must be a list")
    issues = [str(i).strip() for i in issues if str(i).strip()]
    if verdict == "REVISE" and not issues:
        raise ValueError("a REVISE verdict must list at least one issue")
    return {"verdict": verdict, "issues": issues}


def _validate_judgement(raw) -> dict:
    if not isinstance(raw, dict):
        raise ValueError("expected a JSON object")
    scores = raw.get("scores")
    if not isinstance(scores, dict):
        raise ValueError("scores must be an object")
    clean = {}
    for k in SCORE_KEYS:
        if k not in scores:
            raise ValueError(f"missing score {k}")
        v = float(scores[k])
        if not 0 <= v <= 10:
            raise ValueError(f"score {k} out of range")
        clean[k] = v
    verdict = str(raw.get("verdict", "")).upper().strip()
    if verdict not in ("PASS", "FAIL"):
        raise ValueError("verdict must be PASS or FAIL")
    return {"scores": clean, "verdict": verdict, "reason": str(raw.get("reason", "")).strip()}


class Engine:
    def __init__(self, config: Config, roles: dict[str, Provider], ledger: Ledger, run_dir: str | Path,
                 log: Callable[[str], None] = print, workspace=None):
        missing = {"commander", "worker", "reviewer", "judge"} - set(roles)
        if missing:
            raise ValueError(f"missing providers for roles: {sorted(missing)}")
        self.cfg = config
        self.p = roles
        self.ledger = ledger
        self.run_dir = Path(run_dir)
        self.log = log
        self.ws = workspace
        self.results: dict[str, TaskResult] = {}
        self.halted = False
        self.fleet: Fleet | None = None
        self._grounding: dict[str, str] = {}
        self.integration: dict | None = None

    # ------------------------------------------------------------------ run
    async def run(self, tasks: list[Task]) -> dict:
        started = time.time()
        cfg = self.cfg
        self.ledger.save_tasks(tasks)  # idempotent: existing rows are kept
        prior = self.ledger.load_results()
        self.results = {tid: r for tid, r in prior.items() if r.status == PASSED}
        waves = topo_waves(tasks)
        requested = resolve_agent_count(cfg.agents, len(tasks))
        self.fleet = Fleet(requested, len(tasks))
        verbose = len(tasks) <= 200
        self.log(f"Legion: {len(tasks)} tasks in {len(waves)} wave(s); {requested:,} agents requested, "
                 f"{self.fleet.active:,} deployed; batch size {cfg.batch_size}; committee of {cfg.reviewers}; "
                 f"{cfg.judges} judges")
        if self.results:
            self.log(f"Resuming: {len(self.results)} task(s) already PASSED are kept.")
        if self.ws is not None:
            self.log(f"Workspace: {self.ws.root} @ {self.ws.short}"
                     + (" (working tree has uncommitted changes; agents see the commit only)" if self.ws.dirty else ""))
            self.ledger.set_meta("workspace", self.ws.describe())
        else:
            for t in tasks:
                if t.evidence_command or t.context_files:
                    raise ValueError(f"task {t.id} uses evidence_command/context_files, which need --workspace")
        self.ledger.event("run_start", tasks=len(tasks), waves=len(waves), agents=requested)

        for wi, wave in enumerate(waves, 1):
            todo = [t for t in wave if t.id not in self.results]
            assignment = self.fleet.assign(todo)
            runnable: list[Task] = []
            for t in sorted(todo, key=lambda t: (-t.weight, t.id)):
                bad = [d for d in t.depends_on if self.results.get(d) is None or self.results[d].status != PASSED]
                if self.halted:
                    self._finish(TaskResult(t.id, HALTED, assignment[t.id], reason="call budget exhausted"))
                elif bad:
                    self._finish(TaskResult(t.id, BLOCKED, assignment[t.id],
                                            reason=f"dependencies did not pass: {', '.join(bad)}"))
                else:
                    runnable.append(t)
            self.log(f"Wave {wi}/{len(waves)}: {len(runnable)} runnable, {len(todo) - len(runnable)} blocked/halted")
            done = 0
            for chunk in batches(runnable, cfg.batch_size):
                if self.halted:
                    for t in chunk:
                        self._finish(TaskResult(t.id, HALTED, assignment[t.id], reason="call budget exhausted"))
                    continue
                await asyncio.gather(*(self._run_task(t, assignment[t.id], tasks) for t in chunk))
                done += len(chunk)
                if verbose:
                    for t in chunk:
                        r = self.results[t.id]
                        score = f"{r.mean_score:.2f}" if r.mean_score is not None else "-"
                        self.log(f"  {t.id} [{r.agent}] {r.status} score={score} "
                                 f"rounds={r.review_rounds} retrials={r.retrials}")
                else:
                    self.log(f"  wave {wi}: {done}/{len(runnable)} done")
            self.ledger.flush()

        if self.ws is not None and cfg.final_gate and not self.halted:
            await self._integrate(tasks)
        final_path = await self._synthesize(tasks)
        summary = self._summary(tasks, started, final_path)
        self.ledger.set_meta("summary", summary)
        self.ledger.event("run_end", **{k: v for k, v in summary.items() if k != "usage"})
        self.ledger.flush()
        return summary

    def _finish(self, res: TaskResult) -> None:
        self.results[res.task_id] = res
        self.ledger.save_result(res)
        self.ledger.event("task_end", res.task_id, status=res.status, agent=res.agent, reason=res.reason[:500])

    async def _run_task(self, task: Task, agent: str, all_tasks: list[Task]) -> None:
        res = TaskResult(task.id, agent=agent)
        try:
            await self._ground(task)
            await self._pipeline(task, agent, res, all_tasks)
        except BudgetExceeded as exc:
            self.halted = True
            res.status, res.reason = HALTED, str(exc)
        except ProviderError as exc:
            res.status, res.reason = ERROR, str(exc)[:2000]
        except Exception as exc:  # workspace/git/test-harness failure: record it, keep the swarm running
            res.status, res.reason = ERROR, f"{type(exc).__name__}: {exc}"[:2000]
        self._finish(res)
        if res.status == PASSED:
            self._write_outputs(task, res)

    async def _ground(self, task: Task) -> None:
        """Collect real evidence and source context for a task before any agent sees it."""
        if self.ws is None or task.id in self._grounding:
            return
        parts = []
        if task.evidence_command:
            ev = await asyncio.to_thread(self.ws.evidence, task.evidence_command)
            parts.append("EVIDENCE (real command output — the ground truth for this task):\n" + ev)
            self.ledger.event("evidence", task.id, command=task.evidence_command)
        budget = self.cfg.context_chars_total
        for rel in task.context_files:
            if budget <= 0:
                parts.append(f"[context file {rel} omitted: context budget exhausted]")
                continue
            text = await asyncio.to_thread(self.ws.read_file, rel, min(self.cfg.context_chars_per_file, budget))
            budget -= len(text)
            parts.append(f"=== {rel} @ {self.ws.short} ===\n{text}")
        self._grounding[task.id] = "\n\n".join(parts)

    # ------------------------------------------------------------- pipeline
    async def _pipeline(self, task: Task, agent: str, res: TaskResult, all_tasks: list[Task]) -> None:
        cfg = self.cfg
        output = await self._work(task, agent, all_tasks)
        res.worker_calls += 1
        trial = 0
        while True:
            approved, output, issues = await self._committee(task, agent, output, res, all_tasks, trial)
            res.output = output
            if approved:
                report = await self._test(task, output)
                res.tester = report.to_dict()
                passed, issues = await self._judge(task, output, report, res, trial)
                if passed:
                    res.status = PASSED
                    res.reason = "approved by committee, passed Master Tester and Judges"
                    return
            if trial >= cfg.max_retrials:
                res.status = FAILED
                res.reason = "; ".join(issues)[:2000] or "did not pass review"
                return
            trial += 1
            res.retrials = trial
            self.ledger.event("retrial", task.id, trial=trial, issues=issues[:20])
            output = await self._work(task, agent, all_tasks, previous=output, issues=issues)
            res.worker_calls += 1

    async def _test(self, task: Task, output: str) -> TesterReport:
        return await asyncio.to_thread(
            master_test, task.kind, output, test_command=task.test_command, allow_exec=self.cfg.allow_exec,
            timeout=self.cfg.test_timeout, allow_patterns=self.cfg.allow_patterns + task.allow_patterns,
            workspace=self.ws)

    def _task_block(self, task: Task) -> str:
        role = f"\nFederation role: {task.role}" if task.role else ""
        s = (f"OVERALL GOAL:\n{self.cfg.goal}\n\nTASK [{task.id}] {task.title}\nKind: {task.kind}{role}\n\n"
             f"INSTRUCTIONS:\n{task.instructions}\n")
        if task.acceptance:
            s += f"\nACCEPTANCE CRITERIA:\n{task.acceptance}\n"
        if self._grounding.get(task.id):
            s += "\n" + self._grounding[task.id] + "\n"
        return s

    def _dep_context(self, task: Task, all_tasks: list[Task]) -> str:
        deps = list(dict.fromkeys(task.depends_on + task.after))
        if not deps:
            return ""
        titles = {t.id: t.title for t in all_tasks}
        per = max(1000, self.cfg.dep_context_chars // len(deps))
        parts = []
        for dep in deps:
            r = self.results.get(dep)
            if r is None or r.status != PASSED:
                status = r.status if r else "NOT RUN"
                reason = (r.reason if r else "")[:1500]
                parts.append(f"=== {dep}: {titles.get(dep, dep)} — STATUS {status} (no approved output) ===\n{reason}")
                continue
            out = r.output
            cut = out[:per] + (f"\n(cut at {per} of {len(out)} characters)" if len(out) > per else "")
            parts.append(f"=== APPROVED OUTPUT OF {dep}: {titles.get(dep, dep)} ===\n{cut}")
        return "\n\nOUTPUTS FROM TASKS YOU DEPEND ON OR RUN AFTER:\n" + "\n\n".join(parts) + "\n"

    async def _work(self, task: Task, agent: str, all_tasks: list[Task], previous: str | None = None,
                    issues: list[str] | None = None) -> str:
        prompt = self._task_block(task)
        if task.kind == "code" and self.ws is not None:
            prompt += WORKSPACE_CODE_FORMAT.format(head=self.ws.head, test_command=task.test_command)
        elif task.kind == "code":
            prompt += CODE_FORMAT
            if task.test_command:
                prompt += f"\nThe Master Tester will run: {task.test_command}\n"
        prompt += self._dep_context(task, all_tasks)
        if previous is not None:
            prompt += ("\n\nYOUR PREVIOUS DELIVERABLE:\n" + previous +
                       "\n\nREQUIRED FIXES (Federation Committee / Master Tester / Judges):\n- " +
                       "\n- ".join(issues or []) +
                       "\n\nReturn the COMPLETE corrected deliverable (not a diff, not just the changes).")
        self.ledger.event("work", task.id, agent=agent, revision=previous is not None)
        return await self.p["worker"].complete(WORKER_SYSTEM.format(agent=agent), prompt)

    async def _committee(self, task: Task, agent: str, output: str, res: TaskResult,
                         all_tasks: list[Task], trial: int) -> tuple[bool, str, list[str]]:
        cfg = self.cfg
        issues: list[str] = []
        for rnd in range(cfg.max_review_rounds + 1):
            report = await self._test(task, output)
            res.tester = report.to_dict()
            if not report.passed:
                issues = [f"[Master Tester] {i}" for i in report.issues]
                res.committee.append({"trial": trial, "round": rnd, "gate": "master_tester", "issues": issues})
                self.ledger.event("gate_fail", task.id, round=rnd, issues=issues[:20])
            elif cfg.reviewers <= 0:
                return True, output, []
            else:
                votes = await asyncio.gather(*(
                    self._review(task, output, report, k, all_tasks) for k in range(cfg.reviewers)))
                res.committee.append({"trial": trial, "round": rnd, "votes": votes})
                approvals = sum(1 for v in votes if v["verdict"] == "APPROVE")
                self.ledger.event("committee", task.id, round=rnd, approvals=approvals, members=len(votes))
                if approvals * 2 > len(votes):
                    return True, output, []
                issues = []
                for v in votes:
                    for i in v["issues"]:
                        tagged = f"[{v['member']}] {i}"
                        if tagged not in issues:
                            issues.append(tagged)
            if rnd == cfg.max_review_rounds:
                return False, output, issues
            res.review_rounds += 1
            output = await self._work(task, agent, all_tasks, previous=output, issues=issues)
            res.worker_calls += 1
        return False, output, issues

    async def _review(self, task: Task, output: str, report: TesterReport, k: int, all_tasks: list[Task]) -> dict:
        member = f"Committee Member C{k + 1}"
        lens = LENSES[k % len(LENSES)]
        tester_note = ("Tests were executed and PASSED." if report.executed else
                       "Static checks passed (no execution)." if task.kind == "code" else
                       "Placeholder scan passed.")
        prompt = (self._task_block(task) + self._dep_context(task, all_tasks) +
                  f"\nMASTER TESTER: {tester_note}\n" + self._patch_block(report) +
                  f"\nDELIVERABLE UNDER REVIEW:\n{output}\n")
        vote = await complete_json(self.p["reviewer"], REVIEWER_SYSTEM.format(member=member, lens=lens),
                                   prompt, validate=_validate_vote, max_tokens=4096)
        vote["member"] = member
        vote["lens"] = lens
        return vote

    async def _judge(self, task: Task, output: str, report: TesterReport, res: TaskResult,
                     trial: int) -> tuple[bool, list[str]]:
        cfg = self.cfg
        if not report.passed:
            return False, [f"[Master Tester] {i}" for i in report.issues]
        if cfg.judges <= 0:
            res.mean_score = None
            return True, []
        tester_note = (f"Master Tester executed the tests: PASSED.\nTest log tail:\n{report.log[-1500:]}"
                       if report.executed else "Master Tester: static checks and placeholder scan PASSED.")
        prompt = self._task_block(task) + f"\n{tester_note}\n" + self._patch_block(report) + f"\nDELIVERABLE:\n{output}\n"

        async def one(k: int) -> dict:
            judge = f"Judge J{k + 1}"
            j = await complete_json(self.p["judge"], JUDGE_SYSTEM.format(judge=judge), prompt,
                                    validate=_validate_judgement, max_tokens=2048)
            j["judge"] = judge
            return j

        rulings = await asyncio.gather(*(one(k) for k in range(cfg.judges)))
        all_scores = [s for r in rulings for s in r["scores"].values()]
        avg = round(mean(all_scores), 3)
        passes = sum(1 for r in rulings if r["verdict"] == "PASS")
        res.judges.append({"trial": trial, "rulings": rulings, "mean": avg, "pass_votes": passes})
        res.mean_score = avg
        ok = passes * 2 > len(rulings) and avg >= cfg.pass_threshold
        self.ledger.event("judgement", task.id, mean=avg, pass_votes=passes, judges=len(rulings), passed=ok)
        if ok:
            return True, []
        issues = [f"[{r['judge']}] {r['reason']}" for r in rulings if r["verdict"] == "FAIL" or
                  mean(r["scores"].values()) < cfg.pass_threshold]
        if avg < cfg.pass_threshold:
            issues.append(f"[Judges] mean score {avg} is below the pass threshold {cfg.pass_threshold}")
        return False, issues

    def _patch_block(self, report: TesterReport) -> str:
        if not report.patch:
            return ""
        patch = report.patch if len(report.patch) <= 40000 else report.patch[:40000] + "\n[... patch cut ...]"
        return (f"\nEXACT CHANGE AGAINST COMMIT {self.ws.head} (git diff produced by the Master Tester):\n"
                f"```diff\n{patch}\n```\n")

    async def _integrate(self, tasks: list[Task]) -> None:
        patches = [(t.id, self.results[t.id].tester.get("patch", "")) for t in tasks
                   if t.id in self.results and self.results[t.id].status == PASSED and t.kind == "code"]
        self.log(f"Integration gate: applying {sum(1 for _, p in patches if p.strip())} passed change(s) together "
                 f"on {self.ws.short} and running: {self.cfg.final_gate}")
        result = await asyncio.to_thread(self.ws.integrate, patches, self.cfg.final_gate, self.cfg.evidence_timeout)
        (self.run_dir / "combined.patch").write_text(result["combined_patch"], encoding="utf-8")
        (self.run_dir / "integration.log").write_text(result["log"], encoding="utf-8")
        result = {k: v for k, v in result.items() if k not in ("combined_patch", "log")}
        result["log_tail"] = (self.run_dir / "integration.log").read_text()[-1500:]
        self.integration = result
        self.ledger.set_meta("integration", result)
        self.ledger.event("integration", passed=result["passed"], applied=result["applied"],
                          conflicts=len(result["conflicts"]), gate_exit=result["gate_exit"])
        self.log(f"Integration gate: {'PASSED' if result['passed'] else 'FAILED'} "
                 f"(exit {result['gate_exit']}, {len(result['conflicts'])} conflict(s))")

    # ------------------------------------------------------------- outputs
    def _write_outputs(self, task: Task, res: TaskResult) -> None:
        out_dir = self.run_dir / "outputs"
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{task.id}.md").write_text(res.output, encoding="utf-8")
        if res.tester.get("patch"):
            (out_dir / f"{task.id}.patch").write_text(res.tester["patch"], encoding="utf-8")
        if task.kind == "code":
            from .tester import _safe_path, extract_files
            for path, body in extract_files(res.output).items():
                if _safe_path(path):
                    dest = self.run_dir / "files" / task.id / path
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_text(body, encoding="utf-8")

    async def _synthesize(self, tasks: list[Task]) -> str | None:
        passed = [t for t in tasks if self.results.get(t.id) and self.results[t.id].status == PASSED]
        if not passed:
            return None
        not_passed = [t for t in tasks if t not in passed]
        sections = []
        for t in passed:
            r = self.results[t.id]
            if t.kind == "code":
                from .tester import extract_files
                names = ", ".join(sorted(extract_files(r.output))) or "(none)"
                body = f"Code deliverable; files written to files/{t.id}/: {names}\n\n{r.output}"
            else:
                body = r.output
            sections.append(f"## [{t.id}] {t.title}\n\n{body}")
        compiled = "\n\n".join(sections)
        if not_passed:
            compiled += "\n\n## Tasks that did not pass\n\n" + "\n".join(
                f"- [{t.id}] {t.title}: {self.results[t.id].status} — {self.results[t.id].reason[:300]}"
                for t in not_passed if t.id in self.results)
        path = self.run_dir / "FINAL.md"
        final_text = compiled
        mode = "compiled"
        if self.cfg.synthesize and len(compiled) <= self.cfg.synth_char_limit and not self.halted:
            try:
                final_text = await self.p["commander"].complete(
                    SYNTH_SYSTEM, f"GOAL:\n{self.cfg.goal}\n\nAPPROVED TASK OUTPUTS:\n\n{compiled}", max_tokens=32000)
                mode = "synthesized"
                findings = scan_placeholders(final_text, self.cfg.allow_patterns)
                if findings:
                    self.log("Synthesis contained placeholder markers; keeping the compiled version instead.")
                    self.ledger.event("synthesis_rejected", findings=findings)
                    final_text, mode = compiled, "compiled"
            except (BudgetExceeded, ProviderError) as exc:
                self.ledger.event("synthesis_error", error=str(exc)[:500])
                final_text, mode = compiled, "compiled"
        path.write_text(final_text, encoding="utf-8")
        self.ledger.set_meta("final_mode", mode)
        return str(path)

    def _summary(self, tasks: list[Task], started: float, final_path: str | None) -> dict:
        counts: dict[str, int] = {}
        for t in tasks:
            s = self.results[t.id].status if t.id in self.results else "PENDING"
            counts[s] = counts.get(s, 0) + 1
        scores = [r.mean_score for r in self.results.values() if r.mean_score is not None and r.status == PASSED]
        by_obj: dict[int, dict] = {}
        for role, prov in self.p.items():
            entry = by_obj.setdefault(id(prov), {"provider": prov.spec, "roles": [], **prov.usage})
            entry["roles"].append(role)
        usage = list(by_obj.values())
        integration_ok = self.integration is None or self.integration["passed"]
        if self.ws is not None and self.cfg.final_gate and self.integration is None:
            integration_ok = False  # gate configured but never ran (budget halt)
        return {
            "goal": self.cfg.goal,
            "tasks": len(tasks),
            "status_counts": counts,
            "all_passed": counts.get(PASSED, 0) == len(tasks) and integration_ok,
            "workspace": self.ws.describe() if self.ws is not None else None,
            "integration": self.integration,
            "mean_judge_score": round(mean(scores), 3) if scores else None,
            "fleet": self.fleet.stats() if self.fleet else {},
            "halted_by_budget": self.halted,
            "final": final_path,
            "seconds": round(time.time() - started, 2),
            "usage": usage,
        }


def results_json(tasks: list[Task], results: dict[str, TaskResult]) -> str:
    return json.dumps([
        {"task": t.to_dict(), "result": results[t.id].to_dict() if t.id in results else None} for t in tasks
    ], indent=2)
