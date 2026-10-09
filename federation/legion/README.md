# Soul Codex Verification Federation (Legion)

The Verification Phase is a task graph for **Legion**, the multi-agent swarm vendored in
`tools/legion`. There are 55 agents, each assigned one real scope in this repository. Every
agent works from evidence produced on a clean checkout of the exact commit. Every change must
pass the repository's own tests. The combined result is judged by the final gate.

```
55 agents (balanced across waves/batches)
 ├─ wave 1  Calculation 8 · Corpus 5 · Interpretation 10 · Similarity 5 · Adversarial 7 · Privacy/App Store 4 · CI Surgeon 1
 │          each gets EVIDENCE = real gate output on a clean checkout of HEAD + the source it audits
 ├─ wave 2  Code Agents 14, one per failing gate, each depending on the audit that classified it
 │          each change is written over a fresh checkout and judged by the repository's own tests
 ├─ every deliverable: Master Tester gate → Federation Committee (3, majority vote, revision rounds)
 │                     → Fleet of Judges (3, mean ≥ 7.5 and majority PASS) → retrial or verdict
 ├─ wave 3  Final Auditor: Summary / Validation / Risk / Rollback / Evidence boundary (AGENTS.md)
 └─ integration gate: every approved patch applied together on HEAD, then gates.mjs must exit 0
```

## Files

| File | Purpose |
|---|---|
| `gates.mjs` | Final gate. Runs every `*.test.ts` file in its own process, plus `npm run check`, four audits and an optional JSON receipt. Tests that need Postgres are reported as SKIPPED, never as passed. |
| `build_verification_tasks.py` | Single source of truth for the federation. It refuses to emit a task that references a missing file, and `--check` fails CI if the JSON is stale. |
| `soul-codex-verification.json` | Generated Legion task file: run config plus 55 tasks. |
| `../../tools/legion/` | The Legion engine: Commander, worker fleet, Committee, Judges, Master Tester, ledger, workspace mode. |
| `../../.github/workflows/legion-federation.yml` | Manual workflow. `gates` mode needs no secrets; `federation` mode needs `ANTHROPIC_API_KEY`. |

## Run it

Local (Node 22, Python ≥ 3.10):

```bash
npm ci && npm install --no-save --ignore-scripts free-human-design@1.0.1 && npm run build:workspaces
node federation/legion/gates.mjs --json gates-receipt.json          # receipts only, no model calls

pip install ./tools/legion
export ANTHROPIC_API_KEY=...
legion run --tasks-file federation/legion/soul-codex-verification.json --workspace . --dry-run
legion run --tasks-file federation/legion/soul-codex-verification.json --workspace . \
  --budget-calls 1650 --batch 8 --concurrency 8 --yes
```

Agents see the **committed** HEAD only. Uncommitted edits are never audited or patched.

GitHub: Actions → *Legion Verification Federation* → Run workflow (`gates` or `federation`).

A run directory (`legion_runs/<timestamp>-…/`) contains:

| File | Contents |
|---|---|
| `report.md` | Per-agent status, scores, review rounds, retrials and the integration-gate result |
| `outputs/<task>.md` / `.patch` | Each approved audit, and each approved change as a git patch against HEAD |
| `combined.patch` + `integration.log` | All approved changes applied together, plus the final gate's output |
| `FINAL.md` | Commander synthesis of the approved outputs |
| `results.json`, `ledger.sqlite` | Every vote, judgement, tester log and event |

Nothing is pushed. Review the patches, then `git apply combined.patch` on a branch.

**Cost:** 385 model calls if everything passes first time, 1,650 in the worst case (dry-run
estimate). `--budget-calls` is a hard stop, and `legion resume <run_dir>` continues a stopped
run as long as HEAD has not moved.

## Baseline at `f6540a0` (2026-10-08), measured while building this

`node federation/legion/gates.mjs` on that commit: **175 gates passed, 23 failed, 2 skipped**
out of 200. Across 196 test files, 1,387 assertions pass and 31 fail. The type-check is clean.

| Finding | Gate | Owner agents |
|---|---|---|
| Offline Sun returns `ephemeris_calculation_failed` for ordinary dates under tsx: `import * as Astronomy` gives a namespace with only `default`, so `SunPosition` is undefined. `server/services/astronomy-engine-compat.ts` already handles this, but `packages/core/compute/offline-sun.ts` bypasses it. Plain Node ESM loads the library correctly; the production bundle was not tested. | 4 test files (10 assertions) | cal-offline-astronomy → fix-offline-astronomy |
| 11 test files import `vitest`, which is not a dependency, so they have never run in this tree | 11 files | ci-coverage → port-vitest-* (3) |
| Profile differentiation audit exits 7: average cross-signature token similarity 0.807, and 50 × `action-lacks-observable-verb` | audit | sim-profile-metrics → fix-profile-differentiation |
| Golden fixture validator: Carl Jung Moon is 12.42° off against a 0.5° tolerance (≈ 22 h of lunar motion) | audit | cor-named-goldens → fix-golden-fixture |
| Unknown-time contract: minute-sweep wording, and "default birthplace" present in the verification route | 2 assertions | adv-unknown-time → fix-unknown-time |
| Natal report Human Design contract, including a `ReferenceError` inside the test | 3 assertions | int-natal-report → fix-natal-report |
| Midheaven evidence does not reach the clarity inspector | 1 assertion | int-clarity-evidence → fix-clarity-evidence |
| Depth chapters reopen strength/cost blocks with the full sentence | 1 assertion | sim-depth-nonrepetition → fix-depth-nonrepetition |
| Human Design surface lacks its "hypothesis" limits wording | 1 assertion | int-hd-surfaces → fix-hd-surfaces |
| Device-timezone substitution contract | 1 assertion | adv-location → fix-location |
| `tests/integration-config.test.ts` imports `../../server/…`, which resolves outside the repo | 1 file | fix-integration-config-test |
| AGENTS.md cites `.github/workflows/ci.yml`, which does not exist | doc check | fix-agents-doc |
| 93 of 196 test files are run by no GitHub workflow, including every failing file above | coverage | ci-coverage |

Passing gates with real numbers:
- **Verified differentiation (96 profiles):** 96 unique narratives. Maximum bigram Jaccard between material pairs is 0.797 against a < 0.9 threshold; minimum verified evidence is 18.
- **Human Design vs the independent verifier `free-human-design@1.0.1` (20 profiles):** gates 99.2%, gate.lines 97.5%, type 100%, authority 95%, profile 95%, centers 95%, channels 90%.

These are diagnoses, not fixes. Each failure still needs its audit to classify it (product defect,
stale contract, test defect or environment) before a Code Agent changes anything.

## Evidence boundary

- The baseline above was run in a Linux container with Node 22.22.0. It is a receipt for
  `f6540a0` only; a later commit needs a fresh `gates.mjs` run.
- `tests/active-consumer-auth-postgres.test.ts` and `tests/gate4-production-deletion.test.ts` need
  `DATABASE_URL` and were skipped.
- **A real model-backed federation run has not been executed yet.** That requires the API key.
  The plumbing was exercised end to end on `20cfdcf`, with a local stand-in server in place of the
  model API. All 55 agents ran in 3 waves over 16.5 minutes:
  - 41 evidence commands executed on clean checkouts.
  - The 14 code agents were judged by the repository's own tests. The stand-in supplied a genuine
    fix for one of them (`tests/integration-config.test.ts` import path), and that change passed.
    The 13 deliberately wrong submissions were all rejected by the repo's tests, with the real
    failure output.
  - The integration gate applied the passing patch to HEAD and re-ran `gates.mjs`. That test file
    left the failure list, and the gate correctly still failed on the 22 remaining failures (plus the
    golden fixture validator added to the gate after the baseline above).
  This proves the machinery, not the quality of any model's audit or fix.
- App Store / Play submission stays owner-deferred (AGENTS.md); the store agent only audits.
