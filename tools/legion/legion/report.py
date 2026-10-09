"""Human-readable run report."""
from __future__ import annotations

from .models import Task, TaskResult

MAX_ROWS = 500


def build_report(summary: dict, tasks: list[Task], results: dict[str, TaskResult]) -> str:
    c = summary.get("status_counts", {})
    fleet = summary.get("fleet", {})
    lines = [
        "# Legion Run Report",
        "",
        f"**Goal:** {summary.get('goal', '')}",
        "",
        f"**Verdict:** {'ALL TASKS PASSED' if summary.get('all_passed') else 'NOT ALL TASKS PASSED'}",
        "",
        "## Totals",
        "",
        "| Metric | Value |",
        "|---|---|",
        f"| Tasks | {summary.get('tasks', 0):,} |",
    ]
    for status in ("PASSED", "FAILED", "BLOCKED", "HALTED", "ERROR", "PENDING"):
        if c.get(status):
            lines.append(f"| {status} | {c[status]:,} |")
    ws = summary.get("workspace")
    if ws:
        lines.append(f"| Workspace | `{ws['root']}` @ `{ws['head'][:12]}` |")
    integ = summary.get("integration")
    if integ:
        lines.append(f"| Integration gate | {'PASSED' if integ['passed'] else 'FAILED'} "
                     f"(exit {integ['gate_exit']}; {len(integ['applied'])} change(s) applied; "
                     f"{len(integ['conflicts'])} conflict(s)) |")
    lines += [
        f"| Mean judge score (passed tasks) | {summary.get('mean_judge_score')} |",
        f"| Agents requested | {fleet.get('agents_requested', 0):,} |",
        f"| Agents that received work | {fleet.get('agents_with_work', 0):,} |",
        f"| Tasks per agent (min–max) | {fleet.get('min_tasks_per_agent', 0)}–{fleet.get('max_tasks_per_agent', 0)} |",
        f"| Load per agent (min–max weight) | {fleet.get('min_load', 0)}–{fleet.get('max_load', 0)} |",
        f"| Halted by call budget | {summary.get('halted_by_budget')} |",
        f"| Wall time (s) | {summary.get('seconds')} |",
        "",
        "## Model usage",
        "",
        "| Provider | Roles | Calls | Input tokens | Output tokens |",
        "|---|---|---|---|---|",
    ]
    for u in summary.get("usage", []):
        lines.append(f"| {u['provider']} | {', '.join(u['roles'])} | {u['calls']:,} | "
                     f"{u['input_tokens']:,} | {u['output_tokens']:,} |")
    lines += ["", "## Tasks", "",
              "| Task | Agent | Status | Score | Review rounds | Retrials | Tests executed | Note |",
              "|---|---|---|---|---|---|---|---|"]
    for t in tasks[:MAX_ROWS]:
        r = results.get(t.id)
        if r is None:
            lines.append(f"| {t.id} {t.title} | - | PENDING | - | - | - | - | |")
            continue
        note = r.reason.replace("|", "/").replace("\n", " ")[:160]
        score = f"{r.mean_score:.2f}" if r.mean_score is not None else "-"
        executed = "yes" if r.tester.get("executed") else "-"
        lines.append(f"| {t.id} {t.title.replace('|', '/')} | {r.agent} | {r.status} | {score} | "
                     f"{r.review_rounds} | {r.retrials} | {executed} | {note} |")
    if len(tasks) > MAX_ROWS:
        lines.append(f"\n{len(tasks) - MAX_ROWS:,} more tasks are listed in results.json.")
    if integ:
        lines += ["", "## Integration gate", "",
                  f"Command: `{integ['gate_command']}` on commit `{integ['head']}` with every passed change applied together.",
                  "", f"Applied: {', '.join(integ['applied']) or 'none'}"]
        for c in integ["conflicts"]:
            lines.append(f"- CONFLICT in {c['task']}: {c['error'][:300]}")
        lines += ["", "```", integ.get("log_tail", "").strip(), "```"]
    if summary.get("final"):
        lines += ["", f"Final deliverable: `{summary['final']}`"]
    return "\n".join(lines) + "\n"
