"""Workspace mode against a real throwaway git repository."""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import pytest

from legion.engine import Config, Engine
from legion.ledger import Ledger
from legion.planner import load_task_file_config, load_tasks_file, validate_tasks
from legion.tester import master_test
from legion.workspace import Workspace, WorkspaceError

from conftest import ScriptedProvider

ROOT = Path(__file__).resolve().parents[1]

CALC_BUGGY = "def mean(xs):\n    return sum(xs) / (len(xs) + 1)\n"
CALC_FIXED = "def mean(xs):\n    if not xs:\n        raise ValueError('mean of empty list')\n    return sum(xs) / len(xs)\n"
TEST_CALC = ("import pytest\nfrom calc import mean\n\n\ndef test_mean():\n    assert mean([2, 4]) == 3\n\n\n"
             "def test_empty():\n    with pytest.raises(ValueError):\n        mean([])\n")
GATE = f"{sys.executable} -m pytest -q -p no:cacheprovider"


def _git(repo, *args):
    subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True)


@pytest.fixture
def repo(tmp_path):
    r = tmp_path / "repo"
    r.mkdir()
    _git(r, "init", "-q", "-b", "main")
    _git(r, "config", "user.email", "t@example.com")
    _git(r, "config", "user.name", "t")
    (r / "calc.py").write_text(CALC_BUGGY)
    (r / "test_calc.py").write_text(TEST_CALC)
    (r / "README.md").write_text("calc library\n")
    (r / ".gitignore").write_text("node_modules\n")
    (r / "node_modules").mkdir()
    (r / "node_modules" / "dep.txt").write_text("installed dependency\n")
    _git(r, "add", "-A")
    _git(r, "commit", "-q", "-m", "init")
    return r


def fix_reply(body=CALC_FIXED):
    return f"### FILE: calc.py\n```python\n{body}```\n\nRoot cause: divided by len+1; empty input was unguarded.\n"


def test_evidence_runs_on_clean_head_and_is_cached(repo):
    (repo / "calc.py").write_text("SYNTAX ERROR uncommitted (\n")  # dirty tree must not leak in
    ws = Workspace(repo)
    try:
        assert ws.dirty and ws.link_dirs == ["node_modules"]
        ev = ws.evidence(GATE)
        assert f"ran on a clean checkout of commit {ws.head}" in ev
        assert "exit code 1" in ev and "2 failed" in ev          # the real bug, not the dirty file
        assert ws.evidence(GATE) is ws.evidence(GATE)
        assert ws.evidence("cat node_modules/dep.txt").count("installed dependency") == 1
        assert ws.read_file("calc.py", 1000) == CALC_BUGGY
        assert ws.read_file("nope.py", 100).startswith("[file nope.py does not exist")
    finally:
        ws.close()
    listed = subprocess.run(["git", "-C", str(repo), "worktree", "list"], capture_output=True, text=True).stdout
    assert len(listed.strip().splitlines()) == 1                 # every checkout cleaned up


def test_master_tester_in_workspace(repo):
    ws = Workspace(repo)
    try:
        good = master_test("code", fix_reply(), test_command=GATE, workspace=ws)
        assert good.passed and good.executed
        assert "+    return sum(xs) / len(xs)" in good.patch and "calc.py" in good.patch

        half = master_test("code", fix_reply("def mean(xs):\n    return sum(xs) / len(xs)\n"),
                           test_command=GATE, workspace=ws)
        assert not half.passed and "repository tests failed" in half.issues[0] and "test_empty" in half.issues[0]

        same = master_test("code", fix_reply(CALC_BUGGY), test_command=GATE, workspace=ws)
        assert not same.passed and "identical" in same.issues[0]

        for bad in ("node_modules/dep.txt", ".git/config"):
            rep = master_test("code", f"### FILE: {bad}\n```\nx\n```\n", test_command=GATE, workspace=ws)
            assert not rep.passed and "protected path" in rep.issues[0]

        no_cmd = master_test("code", fix_reply(), workspace=ws)
        assert "no test_command" in no_cmd.issues[0]

        # pre-existing TODO in a re-emitted file is fine; a newly added one is not
        _git(repo, "checkout", "-q", "-b", "todo")
        (repo / "README.md").write_text("calc library\nTODO: write usage docs\n")
        _git(repo, "commit", "-qam", "todo")
        ws2 = Workspace(repo)
        try:
            keep = ("### FILE: README.md\n```\ncalc library\nTODO: write usage docs\n```\n" + fix_reply())
            assert master_test("code", keep, test_command=GATE, workspace=ws2).passed
            added = fix_reply(CALC_FIXED + "# TODO handle NaN\n")
            rep = master_test("code", added, test_command=GATE, workspace=ws2)
            assert not rep.passed and "placeholder introduced by this change" in rep.issues[0]
        finally:
            ws2.close()
    finally:
        ws.close()
    assert (repo / "calc.py").read_text() == CALC_BUGGY          # source repo never modified


def test_integration_detects_conflicts(repo):
    ws = Workspace(repo)
    try:
        a = master_test("code", fix_reply(), test_command=GATE, workspace=ws).patch
        alt = CALC_FIXED.replace("mean of empty list", "empty input")
        b = master_test("code", fix_reply(alt), test_command=GATE, workspace=ws).patch
        ok = ws.integrate([("a", a)], GATE, 120)
        assert ok["passed"] and ok["applied"] == ["a"] and ok["gate_exit"] == 0
        clash = ws.integrate([("a", a), ("b", b)], GATE, 120)
        assert not clash["passed"] and clash["conflicts"][0]["task"] == "b"
        head_only = ws.integrate([], GATE, 120)
        assert not head_only["passed"] and head_only["gate_exit"] != 0
    finally:
        ws.close()


def _tasks():
    return validate_tasks([
        {"id": "audit", "title": "Audit failing gate", "role": "Adversarial Agent", "instructions": "explain failures",
         "evidence_command": GATE, "context_files": ["calc.py", "test_calc.py"],
         "allow_patterns": ["placeholder wording"]},
        {"id": "fix", "title": "Fix mean()", "role": "Code Agent", "kind": "code", "depends_on": ["audit"],
         "instructions": "fix calc.py", "test_command": GATE, "context_files": ["calc.py"]},
        {"id": "final", "title": "Final audit", "role": "Final Auditor", "instructions": "confirm",
         "depends_on": ["fix"], "evidence_command": GATE},
    ])


def _run(repo, tmp_path, prov):
    ws = Workspace(repo)
    cfg = Config(goal="Verify and repair calc", workspace=str(repo), final_gate=GATE)
    roles = {r: prov for r in ("commander", "worker", "reviewer", "judge")}
    engine = Engine(cfg, roles, Ledger(tmp_path / "run" / "ledger.sqlite"), tmp_path / "run", log=lambda s: None,
                    workspace=ws)
    try:
        return asyncio.run(engine.run(_tasks())), engine
    finally:
        ws.close()


def test_engine_end_to_end_in_workspace(repo, tmp_path):
    half = fix_reply("def mean(xs):\n    return sum(xs) / len(xs)\n")
    prov = ScriptedProvider(code_replies={"fix": [half, fix_reply()]})
    summary, engine = _run(repo, tmp_path, prov)
    r = engine.results
    assert summary["all_passed"], summary
    # grounding: every agent of the audit saw the real failing output and the source at HEAD
    audit_prompt = prov.prompts[("WORKER", "audit")][0]
    assert "EVIDENCE (real command output" in audit_prompt and "2 failed" in audit_prompt
    assert f"calc.py @ {summary['workspace']['head'][:12]}" in audit_prompt
    assert all("2 failed" in p for p in prov.prompts[("REVIEWER", "audit")])
    # the half fix was rejected by the repo's own tests, revised, then passed
    assert r["fix"].review_rounds == 1 and r["fix"].committee[0]["gate"] == "master_tester"
    assert "test_empty" in r["fix"].committee[0]["issues"][0]
    assert any("EXACT CHANGE AGAINST COMMIT" in p for p in prov.prompts[("JUDGE", "fix")])
    patch = (tmp_path / "run" / "outputs" / "fix.patch").read_text()
    assert "raise ValueError" in patch
    integ = summary["integration"]
    assert integ["passed"] and integ["applied"] == ["fix"]
    assert "raise ValueError" in (tmp_path / "run" / "combined.patch").read_text()
    assert (repo / "calc.py").read_text() == CALC_BUGGY


def test_integration_failure_blocks_all_passed(repo, tmp_path):
    # a fix that passes its own test command but breaks the final gate
    prov = ScriptedProvider(code_replies={"fix": [fix_reply()]})
    tasks = _tasks()
    tasks[1].test_command = f"{sys.executable} -c \"import calc; assert calc.mean([2, 4]) == 3\""
    ws = Workspace(repo)
    cfg = Config(goal="g", workspace=str(repo), final_gate=f"{GATE} && exit 7")
    engine = Engine(cfg, {r: prov for r in ("commander", "worker", "reviewer", "judge")},
                    Ledger(tmp_path / "l.sqlite"), tmp_path, log=lambda s: None, workspace=ws)
    try:
        summary = asyncio.run(engine.run(tasks))
    finally:
        ws.close()
    assert summary["status_counts"] == {"PASSED": 3}
    assert not summary["all_passed"] and summary["integration"]["gate_exit"] == 7


def test_workspace_fields_require_workspace(tmp_path):
    engine = Engine(Config(goal="g"), {r: ScriptedProvider() for r in ("commander", "worker", "reviewer", "judge")},
                    Ledger(tmp_path / "l.sqlite"), tmp_path, log=lambda s: None)
    with pytest.raises(ValueError, match="need --workspace"):
        asyncio.run(engine.run(_tasks()))


def test_node_modules_mirror_repoints_workspace_packages(repo):
    pkg = repo / "packages" / "lib"
    pkg.mkdir(parents=True)
    (pkg / "index.js").write_text("module.exports = 'committed';\n")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-qm", "pkg")
    scoped = repo / "node_modules" / "@ws"
    scoped.mkdir()
    (scoped / "lib").symlink_to("../../packages/lib", target_is_directory=True)
    ws = Workspace(repo)
    try:
        with ws.checkout() as wt:
            assert (wt / "node_modules" / "@ws" / "lib").resolve() == (wt / "packages" / "lib").resolve()
            assert (wt / "node_modules" / "dep.txt").read_text() == "installed dependency\n"
            assert (wt / "node_modules" / "dep.txt").resolve() == (repo / "node_modules" / "dep.txt").resolve()
        out = master_test("code", "### FILE: packages/lib/index.js\n```js\nmodule.exports = 'changed';\n```\n",
                          test_command="node -e \"process.exit(require('@ws/lib') === 'changed' ? 0 : 3)\"",
                          workspace=ws)
        assert out.passed, out.issues          # the change, not the installed copy, is what gets imported
    finally:
        ws.close()


def test_not_a_repo(tmp_path):
    with pytest.raises(WorkspaceError):
        Workspace(tmp_path)


def test_task_file_config_and_cli_dry_run(repo, tmp_path):
    tf = tmp_path / "fed.json"
    tf.write_text(json.dumps({"config": {"goal": "Verify calc", "final_gate": GATE, "reviewers": 5},
                              "tasks": [t.to_dict() for t in _tasks()]}))
    assert load_task_file_config(tf)["reviewers"] == 5
    assert load_tasks_file(tf)[0].context_files == ["calc.py", "test_calc.py"]
    env = {"PATH": "/usr/bin:/bin", "PYTHONPATH": str(ROOT)}
    out = subprocess.run([sys.executable, "-m", "legion.cli", "run", "--tasks-file", str(tf), "--workspace", str(repo),
                          "--dry-run"], capture_output=True, text=True, env=env, cwd=tmp_path)
    assert out.returncode == 0, out.stderr + out.stdout
    assert "[audit] [Adversarial Agent]" in out.stdout and "Workspace:" in out.stdout
    bad = json.loads(tf.read_text())
    bad["tasks"][0]["context_files"].append("missing.py")
    tf.write_text(json.dumps(bad))
    out2 = subprocess.run([sys.executable, "-m", "legion.cli", "run", "--tasks-file", str(tf), "--workspace", str(repo),
                           "--dry-run"], capture_output=True, text=True, env=env, cwd=tmp_path)
    assert out2.returncode == 2 and "missing.py" in out2.stdout
