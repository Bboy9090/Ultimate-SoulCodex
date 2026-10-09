"""Command line interface: legion run | resume | report."""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
import time
from pathlib import Path

from . import __version__
from .engine import Config, Engine, results_json
from .ledger import Ledger
from .planner import load_task_file_config, load_tasks_file, plan, topo_waves
from .providers import Budget, Provider, ProviderError, make_provider
from .report import build_report
from .scheduler import Fleet, estimate_calls, resolve_agent_count
from .workspace import Workspace, WorkspaceError

DEFAULTS = {
    "commander": "anthropic/claude-opus-5-5",
    "worker": "anthropic/claude-sonnet-5-5",
    "reviewer": "anthropic/claude-sonnet-5-5",
    "judge": "anthropic/claude-opus-5-5",
}

# task-file config key -> argparse dest
FILE_TO_ARG = {
    "goal": "goal", "agents": "agents", "batch_size": "batch", "reviewers": "reviewers", "judges": "judges",
    "max_review_rounds": "max_review_rounds", "max_retrials": "max_retrials", "pass_threshold": "pass_threshold",
    "test_timeout": "test_timeout", "evidence_timeout": "evidence_timeout", "workspace_setup": "workspace_setup",
    "final_gate": "final_gate", "dep_context_chars": "dep_context_chars",
}


def build_roles(specs: dict[str, str], concurrency: int, rpm: int, budget: Budget) -> dict[str, Provider]:
    """One provider object per distinct spec, so roles on the same model share its rate limits."""
    cache: dict[str, Provider] = {}
    roles = {}
    for role, spec in specs.items():
        if spec not in cache:
            cache[spec] = make_provider(spec, max_concurrency=concurrency, rpm=rpm, budget=budget)
        roles[role] = cache[spec]
    return roles


async def _close(roles: dict[str, Provider]) -> None:
    for prov in {id(p): p for p in roles.values()}.values():
        await prov.aclose()


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40] or "run"


def _confirm(message: str, assume_yes: bool) -> bool:
    if assume_yes:
        return True
    if not sys.stdin.isatty():
        print(message + "\nNon-interactive session: re-run with --yes to proceed.")
        return False
    return input(message + " Proceed? [y/N] ").strip().lower() in ("y", "yes")


def _print_plan(tasks, cfg: Config) -> None:
    waves = topo_waves(tasks)
    requested = resolve_agent_count(cfg.agents, len(tasks))
    fleet = Fleet(requested, len(tasks))
    for w in waves:
        fleet.assign(w)
    best, worst = estimate_calls(len(tasks), cfg.reviewers, cfg.judges, cfg.max_review_rounds, cfg.max_retrials)
    print(f"Plan: {len(tasks):,} tasks in {len(waves)} wave(s)")
    for t in tasks[:80]:
        deps = f" <- {', '.join(t.depends_on)}" if t.depends_on else ""
        role = f" [{t.role}]" if t.role else ""
        print(f"  [{t.id}]{role} ({t.kind}, w{t.weight}) {t.title}{deps}")
    if len(tasks) > 80:
        print(f"  ... and {len(tasks) - 80:,} more")
    s = fleet.stats()
    print(f"Agents: {s['agents_requested']:,} requested, {s['agents_with_work']:,} receive work "
          f"({s['min_tasks_per_agent']}-{s['max_tasks_per_agent']} tasks each)")
    print(f"Estimated execution model calls: {best:,} (everything passes first time) to {worst:,} (worst case)")


def _open_workspace(cfg: Config) -> Workspace | None:
    if not cfg.workspace:
        return None
    ws = Workspace(cfg.workspace, setup_command=cfg.workspace_setup, evidence_timeout=cfg.evidence_timeout)
    print(f"Workspace: {ws.root} @ {ws.short}; linked into each checkout: {', '.join(ws.link_dirs) or 'nothing'}")
    if ws.dirty:
        print("Note: the working tree has uncommitted changes. Agents work from the committed HEAD only.")
    return ws


async def cmd_run(args, defaults: dict) -> int:
    file_cfg = load_task_file_config(args.tasks_file) if args.tasks_file else {}
    for key, value in file_cfg.items():
        dest = FILE_TO_ARG[key]
        if getattr(args, dest) == defaults.get(dest):
            setattr(args, dest, value)
    if not args.goal:
        print("error: a goal is required (positional argument or \"config.goal\" in the task file)", file=sys.stderr)
        return 2
    cfg = Config(
        goal=args.goal, agents=args.agents, batch_size=args.batch, reviewers=args.reviewers, judges=args.judges,
        max_review_rounds=args.max_review_rounds, max_retrials=args.max_retrials,
        pass_threshold=args.pass_threshold, allow_exec=not args.no_exec, test_timeout=args.test_timeout,
        synthesize=not args.no_synthesis, workspace=str(Path(args.workspace).resolve()) if args.workspace else None,
        workspace_setup=args.workspace_setup, final_gate=args.final_gate, evidence_timeout=args.evidence_timeout,
        dep_context_chars=args.dep_context_chars,
    )
    if cfg.final_gate and not cfg.workspace:
        print("error: --final-gate needs --workspace", file=sys.stderr)
        return 2
    specs = {"commander": args.commander, "worker": args.worker, "reviewer": args.reviewer, "judge": args.judge}
    if args.tasks_file:
        tasks = load_tasks_file(args.tasks_file)
        if args.dry_run:
            _print_plan(tasks, cfg)
            if cfg.workspace:
                ws = _open_workspace(cfg)
                missing = [(t.id, f) for t in tasks for f in t.context_files
                           if ws.read_file(f, 80).startswith("[file ")]
                ws.close()
                for tid, f in missing:
                    print(f"WARNING: task {tid} context file not in commit: {f}")
                if missing:
                    return 2
            return 0
    budget = Budget(args.budget_calls)
    try:
        roles = build_roles(specs, args.concurrency, args.rpm, budget)
    except ProviderError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    ws = None
    try:
        if not args.tasks_file:
            print(f"Commander ({roles['commander'].spec}) is planning...")
            tasks = await plan(roles["commander"], cfg.goal, args.max_tasks)
            _print_plan(tasks, cfg)
            if args.dry_run:
                return 0
        else:
            _print_plan(tasks, cfg)
        _, worst = estimate_calls(len(tasks), cfg.reviewers, cfg.judges, cfg.max_review_rounds, cfg.max_retrials)
        if worst > args.confirm_over and not _confirm(f"This run may make up to {worst:,} model calls.", args.yes):
            return 1
        ws = _open_workspace(cfg)
        run_dir = Path(args.out) / f"{time.strftime('%Y%m%d-%H%M%S')}-{_slug(cfg.goal)}"
        run_dir.mkdir(parents=True, exist_ok=True)
        ledger = Ledger(run_dir / "ledger.sqlite")
        ledger.set_meta("config", cfg.to_dict())
        ledger.set_meta("roles", specs)
        ledger.set_meta("limits", {"concurrency": args.concurrency, "rpm": args.rpm, "budget_calls": args.budget_calls})
        ledger.save_tasks(tasks)
        (run_dir / "plan.json").write_text(json.dumps({"tasks": [t.to_dict() for t in tasks]}, indent=2))
        print(f"Run directory: {run_dir}")
        return await _execute(cfg, roles, ledger, run_dir, tasks, ws)
    except (ProviderError, WorkspaceError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    finally:
        await _close(roles)
        if ws is not None:
            ws.close()


async def _execute(cfg: Config, roles, ledger: Ledger, run_dir: Path, tasks, ws) -> int:
    engine = Engine(cfg, roles, ledger, run_dir, workspace=ws)
    try:
        summary = await engine.run(tasks)
    finally:
        ledger.flush()
    results = ledger.load_results()
    (run_dir / "results.json").write_text(results_json(tasks, results))
    (run_dir / "summary.json").write_text(json.dumps(summary, indent=2))
    report = build_report(summary, tasks, results)
    (run_dir / "report.md").write_text(report)
    ledger.close()
    c = summary["status_counts"]
    print("\n" + ", ".join(f"{k}: {v:,}" for k, v in sorted(c.items())))
    print(f"Report: {run_dir / 'report.md'}")
    if summary.get("final"):
        print(f"Final deliverable: {summary['final']}")
    if summary.get("integration"):
        print(f"Combined patch: {run_dir / 'combined.patch'}")
    if summary["halted_by_budget"]:
        print(f"Call budget reached. Continue with: legion resume {run_dir} --budget-calls N")
    return 0 if summary["all_passed"] else 3


async def cmd_resume(args) -> int:
    run_dir = Path(args.run_dir)
    ledger = Ledger(run_dir / "ledger.sqlite")
    cfg_d = ledger.get_meta("config")
    specs = ledger.get_meta("roles")
    limits = ledger.get_meta("limits", {})
    if not cfg_d or not specs:
        print("error: not a Legion run directory", file=sys.stderr)
        return 2
    cfg = Config(**cfg_d)
    budget = Budget(args.budget_calls if args.budget_calls is not None else limits.get("budget_calls"))
    try:
        roles = build_roles(specs, limits.get("concurrency", 16), limits.get("rpm", 0), budget)
    except ProviderError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    ws = None
    try:
        ws = _open_workspace(cfg)
        recorded = (ledger.get_meta("workspace") or {}).get("head")
        if ws is not None and recorded and recorded != ws.head:
            print(f"error: workspace HEAD moved from {recorded[:12]} to {ws.short}; passed results were judged "
                  f"against the old commit. Start a new run instead.", file=sys.stderr)
            return 2
        return await _execute(cfg, roles, ledger, run_dir, ledger.load_tasks(), ws)
    except WorkspaceError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    finally:
        await _close(roles)
        if ws is not None:
            ws.close()


def cmd_report(args) -> int:
    path = Path(args.run_dir) / "report.md"
    if not path.exists():
        print("error: no report.md in that directory", file=sys.stderr)
        return 2
    print(path.read_text())
    return 0


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="legion", description="Legion multi-agent swarm")
    p.add_argument("--version", action="version", version=f"legion {__version__}")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run", help="plan (or load) tasks and run the full swarm")
    r.add_argument("goal", nargs="?", default=None, help="what the swarm should accomplish")
    r.add_argument("--tasks-file", help="skip planning: .json or .jsonl task list")
    r.add_argument("--agents", default="auto", help="number of agents (e.g. 2, 678, 39295, 1000000) or 'auto'")
    r.add_argument("--batch", type=int, default=4, help="tasks launched together per batch (1, 4, 2728, ...)")
    r.add_argument("--reviewers", type=int, default=3, help="Federation Committee size (odd numbers avoid ties)")
    r.add_argument("--judges", type=int, default=3, help="Fleet of Judges size")
    r.add_argument("--max-review-rounds", type=int, default=2)
    r.add_argument("--max-retrials", type=int, default=1)
    r.add_argument("--pass-threshold", type=float, default=7.0, help="minimum mean judge score (0-10)")
    r.add_argument("--max-tasks", type=int, default=50, help="upper limit for the Commander's plan")
    for role, spec in DEFAULTS.items():
        r.add_argument(f"--{role}", default=spec, help=f"provider/model for the {role} (default {spec})")
    r.add_argument("--concurrency", type=int, default=16, help="max simultaneous requests per provider")
    r.add_argument("--rpm", type=int, default=0, help="requests-per-minute cap per provider (0 = none)")
    r.add_argument("--budget-calls", type=int, default=None, help="hard cap on total model calls")
    r.add_argument("--confirm-over", type=int, default=500, help="ask before runs that could exceed this many calls")
    r.add_argument("--no-exec", action="store_true", help="never execute generated code")
    r.add_argument("--test-timeout", type=int, default=180)
    r.add_argument("--workspace", help="bind the run to a git repository (evidence, context files, repo tests)")
    r.add_argument("--workspace-setup", default=None, help="command run in each fresh checkout before use")
    r.add_argument("--final-gate", default=None, help="command run after applying every passed change together")
    r.add_argument("--evidence-timeout", type=int, default=900)
    r.add_argument("--dep-context-chars", type=int, default=16000,
                   help="characters of dependency output passed to a dependent task, shared across its dependencies")
    r.add_argument("--no-synthesis", action="store_true")
    r.add_argument("--out", default="legion_runs")
    r.add_argument("--dry-run", action="store_true", help="plan and estimate only")
    r.add_argument("-y", "--yes", action="store_true")

    s = sub.add_parser("resume", help="continue a run (re-runs anything not PASSED)")
    s.add_argument("run_dir")
    s.add_argument("--budget-calls", type=int, default=None)

    rep = sub.add_parser("report", help="print a run's report")
    rep.add_argument("run_dir")
    return p


def main(argv: list[str] | None = None) -> int:
    p = parser()
    args = p.parse_args(argv)
    if args.cmd == "run":
        run_parser = p._subparsers._group_actions[0].choices["run"]
        defaults = {a.dest: a.default for a in run_parser._actions}
        try:
            return asyncio.run(cmd_run(args, defaults))
        except (ValueError, OSError) as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 2
    if args.cmd == "resume":
        return asyncio.run(cmd_resume(args))
    return cmd_report(args)


if __name__ == "__main__":
    sys.exit(main())
