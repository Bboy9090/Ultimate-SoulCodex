# Soul Codex — Reality Audit

This file is the current evidence ledger. “Working” means the active source path has a test or observed receipt supporting the claim. Historical code, old smoke notes, and files that merely exist do not count as production evidence.

_Last updated: 2026-08-18_

**Audited `main` baseline:** `2933a6d004500b0cf1ba8075e020c39e851b1200`

## Confirmed on current main

| Area | Current evidence |
|---|---|
| Local-first profile path | Active `/create`, local profile storage, direct local-profile reload, and offline restart are covered by the PWA/lifecycle suites. Online astronomy verification remains explicit rather than automatic. |
| Unknown-time honesty | Moon/Ascendant evidence contracts fail closed when required evidence is missing. No release claim may fill unknown time-dependent values from a guess. |
| Astronomy foundation | Sun/Moon/Ascendant promotion is evidence-status gated. Live Ephemeris Evidence, independent-verification, tolerance-policy, production-verification, Ascendant, and golden-profile tests are active CI gates. |
| Numerology | Core calculations are deterministic workspace logic. Their arithmetic can be resolved exactly from valid inputs; meanings remain symbolic interpretation. |
| Clarity reading | Canonical UI route is `/reading/:id`, with separate local/server profile handling. Quick / Standard / Deep Dive reading is part of the active client. |
| Compatibility | Active evidence-aware Explorer and person-comparison routes use the currently approved minimized inputs. Human Design is not silently added to Foundation Compatibility. |
| Timeline | Active `/timeline` route with lifecycle/offline validation. Timeline observations remain distinct from symbolic system claims. |
| Privacy / ownership | Server profile reads, mutations, deletion, and premium PDF use current user/session ownership contracts. Gate 4 includes PostgreSQL lifecycle and deletion proof. |
| Billing boundary | Current source creates hosted Stripe Checkout sessions and does not collect raw card number, expiry, or security-code fields into Soul Codex application memory. Store-policy acceptance of that monetization path is a separate external question. |
| Elegant Natal Chart PDF | Restored in PR #219 and merged at this audited baseline. Premium/server-owned profiles can request a real PDFKit report. The regression test renders actual bytes, requires a `%PDF` signature and non-trivial size, and blocks legacy unverified Moon/Rising/houses/aspects/nodes/Chiron/Human Design from being promoted as verified report facts. |
| Native compile smoke | Current-source Android debug and iOS Simulator builds passed on the exact PR #219 head before merge. This is compile/simulator evidence, not physical-device or store-acceptance evidence. |
| Railway container contract | Repository container smoke passes and repo configuration is Dockerfile-only. `Procfile` was removed and CI blocks Nixpacks/Railpack/Procfile-style competing repo configs. |
| PWA offline browser | Chromium/WebKit offline restart and direct local-profile reload passed on the exact PR #219 head before merge. |

## Signed artifact reality

The previously signed **rc.2** mobile artifacts remain bound to the frozen application SHA:

`2e02d1023ddeb4e453236c34f2d4d2b7f6948957`

They do **not** automatically contain later `main` changes such as the Dockerfile-only hardening or the restored Natal PDF wiring. A later source merge passing native compile does not retroactively modify an already signed IPA/AAB.

Known signed-artifact receipts:

- iOS IPA SHA-256: `8a8e33beb7931e2c0459129eebecff0e457458867cfdb3b3a39826b8522f0`
- Android AAB SHA-256: `14a07d97b27eb581471e57d83069f9eb60b4c6d05553b7f077c70dc662052fcd`

## External controls not yet proven here

| Boundary | Honest status |
|---|---|
| Railway live service builder override | Repo says Dockerfile-only, but a Railway dashboard-level Railpack/Nixpacks override can supersede repo configuration. Live service closure still requires a fresh build of the intended exact `main` SHA plus `/health` and Compatibility probes. |
| Google Play ingestion | Signed AAB exists, but this ledger does not claim Play Internal Testing accepted the intended build or that an enrolled tester installed it. |
| App Store Connect / TestFlight ingestion | Signed IPA exists, but this ledger does not claim App Store Connect processed/accepted the intended build or that an internal tester installed it. |
| Physical iOS/Android hardware validation | Procedure exists; no release PASS is claimed without store-delivered device evidence. |
| Store review / production acceptance | Not equivalent to signing, CI, TestFlight processing, or Play internal-test ingestion. No production-store acceptance claim is made here. |

## Deliberately unresolved advanced systems

The following are **not** production facts merely because legacy renderers, services, or old branches contain code for them:

- full verified house cusps and Midheaven;
- verified nodes, Chiron, and planetary house placements;
- authoritative Human Design advanced interpretation or Human Design Compatibility;
- Palmistry computer-vision analysis;
- Astrocartography planetary-line calculation and map rendering.

These require their own calculation/reference/uncertainty evidence before production promotion.

## `ca17084` intelligence tranche

A local/external handoff claims commit:

`ca17084df64ebfd91aa16b1721bfd7ff1b3ea443`

with parent:

`142a0ebdb9aa5d1eeb1e041c35784f36afceb821`

and tree:

`51b52bf68fc2d99b75a6fd4a5ec7336b72a0ba40`.

Those exact commit/parent SHAs do not resolve in the authorized GitHub repository, and the claimed patch/diff/manifest bytes were not available to the authorized file surface during the independent audit. Therefore the local reproduction report is **not independently certified by this ledger**. If the patch is supplied or the commit is pushed to an accessible ref, it must still be reconciled onto current `main` and re-run through exact-head doctrine/security/native/container gates.

## Pending recovery branch

Branch `fix/restore-truth-safe-codex-tools` is a **candidate, not current production** until merged. Its purpose is to recover only three old tool concepts with explicit evidence labels and minimal data:

1. **Before You Act** — text-pattern heuristic only.
2. **Boundary Script** — editable communication template only.
3. **Codex Draw** — explicitly symbolic random reflection only.

The old unmounted Codex Tools route accepted arbitrary profile objects and trusted legacy naked Moon/Rising/Human Design fields. The candidate replacement rejects hidden profile payloads and does not expose the fake weekday-as-“transit” Daily Pull, arbitrary “decision confidence” percentage, or assertive “what you’re ignoring” output.

## Rule for future edits

When a feature changes state, update this ledger only after its supporting evidence changes. Do not promote “file exists,” “branch exists,” “CI started,” “artifact signed,” “store upload started,” or “dashboard says deployed” into a stronger claim than the evidence supports.
