import asyncio
import json
import subprocess
import sys
from pathlib import Path

from legion.engine import Config, Engine
from legion.ledger import Ledger
from legion.models import Task
from legion.planner import plan, validate_tasks
from legion.providers import Budget

from conftest import ScriptedProvider

ROOT = Path(__file__).resolve().parents[1]


def _engine(tmp_path, prov, **cfg):
    config = Config(goal="Ship the flagship report", **cfg)
    ledger = Ledger(tmp_path / "ledger.sqlite")
    roles = {r: prov for r in ("commander", "worker", "reviewer", "judge")}
    return Engine(config, roles, ledger, tmp_path, log=lambda s: None), ledger


def _tasks():
    return validate_tasks([
        {"id": "t1", "title": "Intro", "instructions": "write intro", "weight": 2},
        {"id": "t2", "title": "Body", "instructions": "write body", "weight": 5},
        {"id": "t3", "title": "Lib", "instructions": "write add()", "kind": "code", "weight": 3},
        {"id": "t4", "title": "Conclusion", "instructions": "conclude", "depends_on": ["t1", "t2"]},
        {"id": "t5", "title": "Doomed", "instructions": "impossible"},
        {"id": "t6", "title": "Needs doomed", "instructions": "x", "depends_on": ["t5"]},
    ])


def test_full_pipeline_paths(tmp_path):
    prov = ScriptedProvider(todo_first={"t1"}, broken_first={"t3"}, reviewers_revise_once={"t2"},
                            judge_fail_first={"t4"}, judge_always_fail={"t5"})
    engine, ledger = _engine(tmp_path, prov, agents=39295, batch_size=4)
    summary = asyncio.run(engine.run(_tasks()))
    r = engine.results

    # t1: placeholder caught by Master Tester gate -> revised -> passed
    assert r["t1"].status == "PASSED" and r["t1"].review_rounds == 1
    assert r["t1"].committee[0]["gate"] == "master_tester"
    # t2: committee majority REVISE -> revised -> approved
    assert r["t2"].status == "PASSED" and r["t2"].review_rounds == 1 and "votes" in r["t2"].committee[0]
    # t3: broken code failed real tests -> fixed -> tests executed and passed
    assert r["t3"].status == "PASSED" and r["t3"].tester["executed"]
    assert (tmp_path / "files" / "t3" / "mathx.py").read_text().strip().endswith("return a + b")
    # t4: judges failed first trial -> retrial -> passed
    assert r["t4"].status == "PASSED" and r["t4"].retrials == 1 and r["t4"].mean_score == 9
    # t5: judges always fail -> FAILED after retrials; t6 is BLOCKED, never run
    assert r["t5"].status == "FAILED" and "incomplete argument" in r["t5"].reason
    assert r["t6"].status == "BLOCKED" and prov.worker_calls["t6"] == 0

    assert summary["status_counts"] == {"PASSED": 4, "FAILED": 1, "BLOCKED": 1}
    assert not summary["all_passed"]
    assert summary["fleet"]["agents_requested"] == 39295 and summary["fleet"]["agents_with_work"] == 6
    final = Path(summary["final"]).read_text()
    assert final.startswith("FINAL REPORT") and "Tasks that did not pass" in final
    assert (tmp_path / "outputs" / "t2.md").exists()
    assert ledger.status_counts() == {"PASSED": 4, "FAILED": 1, "BLOCKED": 1}


def test_after_runs_even_when_predecessors_fail(tmp_path):
    prov = ScriptedProvider(judge_always_fail={"bad"})
    tasks = validate_tasks([
        {"id": "good", "title": "Good", "instructions": "x"},
        {"id": "bad", "title": "Bad", "instructions": "x"},
        {"id": "hard", "title": "Hard dependent", "instructions": "x", "depends_on": ["bad"]},
        {"id": "auditor", "title": "Auditor", "instructions": "x", "after": ["good", "bad", "hard"]},
    ])
    engine, _ = _engine(tmp_path, prov, max_retrials=0)
    asyncio.run(engine.run(tasks))
    r = engine.results
    assert r["bad"].status == "FAILED" and r["hard"].status == "BLOCKED"
    assert r["auditor"].status == "PASSED"
    seen = prov.prompts[("WORKER", "auditor")][0]
    assert "APPROVED OUTPUT OF good" in seen
    assert "bad: Bad — STATUS FAILED" in seen and "hard: Hard dependent — STATUS BLOCKED" in seen


def test_after_participates_in_ordering_and_cycle_checks():
    from legion.planner import PlanError, topo_waves
    tasks = validate_tasks([{"id": "a", "title": "a", "instructions": "x"},
                            {"id": "b", "title": "b", "instructions": "x", "after": ["a"]}])
    assert [[t.id for t in w] for w in topo_waves(tasks)] == [["a"], ["b"]]
    import pytest
    with pytest.raises(PlanError, match="cycle"):
        validate_tasks([{"id": "a", "title": "a", "instructions": "x", "after": ["b"]},
                        {"id": "b", "title": "b", "instructions": "x", "depends_on": ["a"]}])


def test_budget_halt_then_resume(tmp_path):
    tasks = validate_tasks([{"id": f"t{i}", "title": f"T{i}", "instructions": "x"} for i in range(10)])
    budget = Budget(15)  # each clean task costs 7 calls (1 worker + 3 reviewers + 3 judges)
    engine, ledger = _engine(tmp_path, ScriptedProvider(budget=budget), batch_size=1)
    ledger.save_tasks(tasks)
    summary = asyncio.run(engine.run(tasks))
    assert summary["halted_by_budget"]
    assert summary["status_counts"]["PASSED"] == 2
    assert summary["status_counts"]["HALTED"] == 8

    # resume with a fresh budget: the 2 passed tasks are kept, the rest finish
    prov2 = ScriptedProvider()
    roles = {r: prov2 for r in ("commander", "worker", "reviewer", "judge")}
    engine2 = Engine(engine.cfg, roles, ledger, tmp_path, log=lambda s: None)
    summary2 = asyncio.run(engine2.run(ledger.load_tasks()))
    assert summary2["all_passed"]
    assert sum(prov2.worker_calls.values()) == 8


def test_commander_planning():
    prov = ScriptedProvider(plan=[{"id": "a", "title": "A", "instructions": "x"},
                                  {"id": "b", "title": "B", "instructions": "y", "depends_on": ["a"]}])
    tasks = asyncio.run(plan(prov, "goal", 10))
    assert [t.id for t in tasks] == ["a", "b"]


def test_scale_2728_by_2728(tmp_path):
    """2,728 tasks launched 2,728 at a time across 39,295 requested agents,
    every one reviewed by a 3-member committee and 3 judges."""
    n = 2728
    tasks = [Task(f"t{i}", f"Item {i}", "produce item") for i in range(n)]
    prov = ScriptedProvider()
    engine, _ = _engine(tmp_path, prov, agents=39295, batch_size=2728, synthesize=False)
    summary = asyncio.run(engine.run(tasks))
    assert summary["all_passed"] and summary["status_counts"] == {"PASSED": n}
    assert prov.role_calls["WORKER"] == n
    assert prov.role_calls["REVIEWER"] == 3 * n and prov.role_calls["JUDGE"] == 3 * n
    assert summary["fleet"]["max_tasks_per_agent"] == 1


def test_cli_dry_run_and_report(tmp_path):
    tf = tmp_path / "tasks.jsonl"
    tf.write_text("\n".join(json.dumps({"id": f"t{i}", "title": f"T{i}", "instructions": "x"}) for i in range(1000)))
    env = {"ANTHROPIC_API_KEY": "dry-run-no-calls", "PATH": "/usr/bin:/bin", "PYTHONPATH": str(ROOT)}
    out = subprocess.run([sys.executable, "-m", "legion.cli", "run", "goal", "--tasks-file", str(tf),
                          "--agents", "678", "--batch", "4", "--dry-run"],
                         capture_output=True, text=True, env=env, cwd=tmp_path)
    assert out.returncode == 0, out.stderr
    assert "1,000 tasks in 1 wave" in out.stdout and "678 requested, 678 receive work (1-2 tasks each)" in out.stdout

    # a non-interactive real run over the confirm threshold refuses without --yes
    out2 = subprocess.run([sys.executable, "-m", "legion.cli", "run", "goal", "--tasks-file", str(tf)],
                          capture_output=True, text=True, env=env, cwd=tmp_path)
    assert out2.returncode == 1 and "--yes" in out2.stdout
