# Soul Codex branch salvage protocol (2026-11-09)

## Authority and non-destructive rules

Current verified starting main: `6b221eba821d5c023d05759f8f4cf8f782765d86`. Revalidate immediately before any work. Never merge a historical branch wholesale merely because it is ahead of main. A Git merge-base, `git cherry` patch ID, and a PR's closed status each answer different questions. Squash merges and rebuilt lanes can look divergent while being functionally superseded.

Source-of-truth order: (1) current `main` implementation and shipped behavior, (2) current release and entitlement policy, (3) accepted PR receipts and verified tests, (4) historical branches/PRs, (5) unfinished working-tree/backups, (6) ideas in conversation history. Historical work is evidence, **not** automatic authority over shipping code.

Never force-push, delete a branch, discard local modifications, or enable cloud billing, Android billing flags, Play production publication, or new credentials as part of salvage.

## Complete, reproducible discovery

1. On an authorized clean local clone, run `git fetch --prune origin '+refs/heads/*:refs/remotes/origin/*'` (remote-tracking references only; this does not delete the server branches).
2. Run `python3 scripts/audit_branch_salvage.py --base origin/main --output branch-salvage.json`.
3. Treat `ancestor_or_equal` as no exclusive Git commits, not proof that another machine has no uncommitted files.
4. Treat `patch_equivalent_review` as likely duplicate commits, requiring actual semantic review (merge commits, change contexts, features and test outcomes may differ).
5. For every `ahead_unique_review` / `diverged_unique_review`, record branch, SHA, original PR/issues, relevant changed paths, closest modern implementation, unique behavior, security/store risks and tests.
6. Review any `manual_review`/errors before interpreting the totals. Tool output is a snapshot of fetched remote refs and cannot see unpushed local commits or worktrees.
7. Preserve reports as CI artifacts or attach to tracking issue #115; do not commit reports containing private paths or secrets.

## Salvage decision for each candidate

- **Already implemented / superseded:** document evidence and leave branch untouched.
- **Unique and production-relevant:** extract the smallest coherent patch into a *new branch from current main*, using `git cherry-pick -n <SHA>` only when its scope is verified. For overlapping files, port selected hunks or manually implement against current types/contracts instead.
- **Useful tests only:** port fixtures, negative tests, accessibility checks or qualification scripts; do not bring obsolete source alongside them.
- **Experimental/unsafe:** preserve by reference or archive after review. Do not silently expose unqualified systems in the UI.
- **Release-sensitive:** isolate Apple/Google billing, auth, security, legal, store metadata, Android/iOS artifacts, and production environment changes into independently qualified PRs.

For salvaged patches: run lint, TypeScript, unit and integration tests, existing exact-head workflows, platform-specific Android/iOS/browser tests where affected, secret and dependency audit, and comparison against current entitlement gates. Capture the PR head SHA and fresh CI outcomes. Merge only after the checks are green and the PR still targets the current main. If main moves, rebase/requalify without losing original attribution.

## Priority review groups (not permission to merge)

| Group | Candidate refs | Validation focus |
| --- | --- | --- |
| Aurelion planetary experience | `test/aurelion-provider-joint`, `test/browser-navigation-planetary-acceptance` | Existing avatar/UX provenance, mobile access, current issue #486/#487 |
| Premium and offline depth | `stage/ultimate-codex-with-reading-boundary`, `hardening/offline-codex-anti-repetition-reconciled` | Free/Plus visibility, model/engine authority and verified readings |
| Billing evidence | `billing/provider-qualification-evidence-harness-v2` | Current verifier contracts, purchase/restore failure cases; never enable live billing from salvage |
| Historical iOS release | `release/ios-4.0.0-federation-integrated` | Old iOS validation, current iOS 27 & 4.1 release gates; don't copy obsolete platform settings |
| New astronomical work | Issue #627 | Implement against current astronomy-engine with sourced historical fixtures; do not promote unsupported interpretations |

The most recent remote audit found **542 branches** and **zero open PRs**. Known divergent ancestry examples at that checkpoint: Aurelion 12 ahead/216 behind; premium boundary 19/210; billing harness 4/187. These are ancestry counts, **not** counts of unique shipping features.

## Recover unpublished local work separately

Check each authorized machine and relevant worktree before deletion or cleanup:

```sh
git status --porcelain=v1 -uall
git branch -avv
git worktree list --porcelain
git log --branches --not --remotes --oneline --decorate
git stash list
git reflog --all --date=iso -30
```

Save a backup of the entire worktree (including Git metadata when present) before changes. Do not assume an iCloud placeholder folder with a `.git` entry is a hydrated, usable repository. The Mac checkout was offline during this audit; remote ancestry **cannot** recover uncommitted Swift modifications until its disk is available.

## Done criteria

No unidentified unique work among inventoried refs; unresolved experiments have documented ownership; all production-worthy unique changes are reimplemented or cherry-picked in reviewed, fresh-CI PRs; stale refs are retained or explicitly archived with receipts; release authority remains immutable until real provider/device verification.
