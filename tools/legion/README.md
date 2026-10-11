# Legion — flagship multi-agent swarm

One command, any size of swarm. A **Commander** plans the work, a **fleet of worker agents**
(2, 678, 39,295, 1,000,000 — whatever you ask for) takes the tasks in balanced waves and
batches, the **Federation Committee** double-checks every deliverable by majority vote and sends
work back until it's right, and the **Fleet of Judges** plus the **Master Tester** issue the final
verdict. Nothing ships on a model's word alone: placeholders are caught by a deterministic scan,
and code is actually executed against its tests.

```
                    GOAL
                      │
              ┌───────▼────────┐
              │   COMMANDER    │  plans a dependency graph of tasks (or load your own)
              └───────┬────────┘
                      │  waves (dependencies first) → batches of N launched together
        ┌─────────────┼─────────────┐
     A-000001     A-000002 …    A-039295      worker agents, LPT load-balanced
        │             │             │
        ▼             ▼             ▼
   MASTER TESTER GATE  — placeholder scan; code: syntax check + real test run
        │  fail → straight back to the worker with the exact failures
        ▼
   FEDERATION COMMITTEE — R reviewers, each with a different lens, majority vote
        │  REVISE → worker revises with every issue listed (up to N rounds)
        ▼
   FLEET OF JUDGES — J judges score correctness/completeness/quality/adherence
        │  majority PASS + mean ≥ threshold + Master Tester pass → PASSED
        │  otherwise → retrial with the judges' reasons, then FAILED if still short
        ▼
   SYNTHESIS — Commander assembles FINAL.md from the approved outputs
```

Tasks whose dependencies failed are marked **BLOCKED** instead of running on bad input. If the
call budget runs out, remaining tasks are **HALTED** and `legion resume` picks up where it stopped.

## Install

```bash
cd legion
pip install -e ".[test]"
export ANTHROPIC_API_KEY=sk-ant-...      # or OPENAI_API_KEY / GEMINI_API_KEY / a local Ollama
```

Requires Python 3.10+ and one dependency (`httpx`).

## Run

```bash
# Let the Commander plan, then run with defaults (auto agents, batch 4, 3 reviewers, 3 judges)
legion run "Write a complete field guide to building a Rust microkernel"

# See the plan and cost estimate without executing anything
legion run "..." --dry-run

# Your numbers: 39,295 agents, tasks launched 2,728 at a time, 5-member committee, 7 judges
legion run "..." --agents 39295 --batch 2728 --reviewers 5 --judges 7

# Bring your own task list (skips planning) — this is how you run tens of thousands of tasks
legion run "Translate the corpus" --tasks-file tasks.jsonl --agents 1000000 --batch 500 \
    --budget-calls 200000 --rpm 2000 -y

# Continue a halted or partially failed run (only non-PASSED tasks re-run)
legion resume legion_runs/20261007-180000-translate-the-corpus --budget-calls 100000

legion report legion_runs/<run>
```

Every run directory contains `FINAL.md`, `report.md`, `results.json` (every vote, score and
tester log), `summary.json`, `plan.json`, `outputs/<task>.md`, `files/<task>/…` for code, and
`ledger.sqlite` with the full event history.

## Mixing models per role

Each role takes a `family/model` spec, so you can run your orchestrated workflow across vendors:

```bash
legion run "..." \
  --commander anthropic/claude-opus-5-5 \
  --worker    anthropic/claude-sonnet-5-5 \
  --reviewer  gemini/gemini-2.5-pro \
  --judge     openai/gpt-5
```

| Family | Example | Key |
|---|---|---|
| `anthropic` | `anthropic/claude-sonnet-5-5` | `ANTHROPIC_API_KEY` (`ANTHROPIC_BASE_URL` optional) |
| `openai` | `openai/gpt-5` | `OPENAI_API_KEY` (`OPENAI_BASE_URL` optional) |
| `gemini` | `gemini/gemini-2.5-pro` | `GEMINI_API_KEY` |
| `ollama` | `ollama/llama3.1` | none; `OLLAMA_BASE_URL` optional |
| `compat` | `compat/http://host:8000/v1\|qwen2.5` | `LEGION_COMPAT_API_KEY` optional |

Roles that share a spec share one provider, so they share its concurrency cap and rate limit.

## Task file format

`.json` (`{"tasks": [...]}` or a bare list) or `.jsonl` (one task per line):

```json
{"id": "t7", "title": "Parser", "instructions": "Implement ...", "kind": "code",
 "depends_on": ["t3"], "weight": 6, "acceptance": "Parses all examples in the spec",
 "test_command": null}
```

`kind` is `text` or `code`. Code tasks must ship `test_*.py` (pytest) files, or set
`test_command` for other languages (e.g. `"cargo test"`, `"npm test"`).

## Key options

| Option | Default | Meaning |
|---|---|---|
| `--agents` | `auto` | Agents to deploy; `auto` = one per task |
| `--batch` | 4 | Tasks launched together within a wave |
| `--reviewers` | 3 | Federation Committee size (odd avoids ties) |
| `--judges` | 3 | Fleet of Judges size |
| `--max-review-rounds` | 2 | Committee revision rounds per trial |
| `--max-retrials` | 1 | Second chances after a judges' FAIL |
| `--pass-threshold` | 7.0 | Minimum mean judge score |
| `--concurrency` | 16 | Simultaneous requests per provider |
| `--rpm` | 0 | Requests/minute cap per provider |
| `--budget-calls` | none | Hard cap on total model calls |
| `--no-exec` | off | Never execute generated code |

## The truth about "a million agents"

Agents here are logical workers, each with its own identity and assigned tasks — you can request
any count up to 10 million and the balancer spreads tasks evenly (tested: 39,295 tasks over 678
agents lands 57–58 each). But an agent only does something when it has a task, and every task
costs real model calls: **1 worker + R reviewers + J judges at minimum**, more with revisions.
The report states exactly how many agents received work. Actual speed is set by your API rate
limits (`--concurrency`, `--rpm`), and spend by `--budget-calls`. Always `--dry-run` big runs first.

## Workspace mode: point the swarm at a real repository

```bash
legion run --tasks-file federation.json --workspace /path/to/repo \
  --workspace-setup "npm run build:workspaces" --final-gate "npm test"
```

- **`evidence_command`** (per task) runs once on a clean, detached checkout of the exact HEAD commit.
  Its real output goes to the worker, every reviewer and every judge as ground truth.
- **`context_files`** are read from that commit with `git show`, so uncommitted edits never leak in.
- **Code tasks** return whole files. They are written over a fresh checkout, the task's
  `test_command` (the repo's own tests) must pass there, and the change is captured as a git patch
  that reviewers and judges see as a diff. The placeholder scan judges only lines the agent added.
- A code task can remove a tracked file with a `### DELETE: path` line. The deletion is part of its patch.
- `node_modules` is mirrored into each checkout. Workspace packages are re-pointed at the
  checkout, so changed package source is what gets imported.
- **Integration gate:** after all waves, every passed patch is applied together and `--final-gate`
  must exit 0, otherwise the run is not "all passed". You get `combined.patch` + `integration.log`.
- **`after`** (per task) waits for other tasks and sees their status without requiring them to pass.
  It's for final auditors that must report on failures.
- Nothing is pushed. You review the patches.

A task file may carry run settings: `{"config": {"goal": ..., "final_gate": ..., "reviewers": 5}, "tasks": [...]}`.
Command-line flags override them.

## Safety

The Master Tester runs model-written code on your machine. Run Legion inside a container or VM
for untrusted goals, or pass `--no-exec` to keep only the static checks.

Every command Legion runs gets a sanitized environment (`legion/sandbox.py`): tests, evidence,
workspace setup and the integration gate. Provider keys (`ANTHROPIC_*`, `OPENAI_*`, `GEMINI_*`,
…), CI tokens and anything ending in `_API_KEY`, `_ACCESS_KEY` or `_TOKEN` are removed.
`LEGION_KEEP_ENV=NAME1,NAME2` keeps specific ones a test genuinely needs. This closes the inherited-environment path. Code running as the same OS user could still read Legion's own
`/proc/<pid>/environ`, so for untrusted goals use a container or VM and a spend-limited key.

`--budget-calls` and `--rpm` count every request, retries included.

## Tests

```bash
pytest -q
```

29 tests cover JSON repair, plan validation and cycle detection, wave ordering, even distribution
at 678 / 39,295 / 1,000,000 agents, real code execution pass/fail, unsafe paths, HTTP retries on
429 with Retry-After, budget stops and resume, every pipeline path (Master Tester gate → revise,
committee REVISE → approve, judge FAIL → retrial → pass, permanent FAIL → dependent BLOCKED), a
2,728-tasks-at-once scale run with full committee and judges, and the CLI.
