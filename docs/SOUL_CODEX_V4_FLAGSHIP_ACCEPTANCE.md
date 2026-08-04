# Soul Codex V4 Flagship Acceptance Contract

Status: implementation gate

This document defines what must be true before the clarity-first experience may be called release-ready. It exists to prevent the product from drifting back into a collection of labels, disconnected reports, or attractive screens with unverifiable claims.

## 1. One product journey

A user must be able to move through this sequence without guessing what comes next:

1. Create or reopen a profile.
2. Open the clarity reading.
3. Understand the visible pattern.
4. See the likely protective function.
5. Separate gift from cost.
6. See relationship impact.
7. Leave with one grounded action.
8. Inspect the underlying profile and evidence.

The same sequence must work for server-backed and device-local profiles.

## 2. Truth boundary

Every reading surface must preserve these distinctions:

- verified astronomical result;
- deterministic calculation;
- user-supplied assessment;
- symbolic interpretation;
- tentative inference;
- unavailable claim.

A symbolic value must never be silently upgraded to verified. Missing Moon, Rising, house, timing, personality, or relationship data must remain missing rather than being filled with persuasive prose.

## 3. Human message

The primary reading must answer:

- What pattern may be operating?
- What might it protect?
- What gift can it become?
- What does it cost when overused?
- How can it affect connection?
- What can the user test today?

The reading must not merely repeat labels such as sign, type, number, or archetype.

## 4. Offline parity

Device-local profiles must retain:

- profile reopening;
- clarity reading access;
- saved depth interpretation;
- deterministic numerology;
- explicit confidence labels;
- refusal behavior when the profile is unavailable;
- navigation back to the full local profile.

Network loss must not turn verified, tentative, or unavailable claims into a different confidence class.

## 5. Accessibility and mobile

Release evidence must cover:

- 320px minimum viewport without horizontal scrolling;
- visible keyboard focus;
- semantic headings in order;
- links and buttons with descriptive text;
- readable contrast for body text and confidence labels;
- reduced-motion compatibility;
- loading and failure states that are announced in plain language;
- no critical meaning conveyed by color alone.

## 6. Security and privacy

Required gates:

- dependency production audit at high severity;
- full-tree dependency audit at high severity;
- hosted payment collection only;
- rate-limited sensitive routes;
- no secrets in client bundles;
- no-store handling for sensitive API responses;
- local profiles remain on-device unless the user explicitly starts synchronization or verification;
- exported or shared readings do not silently include private birth details.

## 7. Required automated evidence

The release candidate must pass:

- TypeScript check;
- production web build;
- focused clarity model tests;
- reading route contract tests;
- trust-boundary tests;
- profile reconciliation tests;
- responsive consumer journey;
- PWA offline browser validation;
- Railway container smoke;
- dependency security audit;
- live ephemeris evidence.

## 8. Release classification

- **Implemented:** a code path exists and focused tests cover its core behavior.
- **Integrated:** callers, routes, storage, and dependencies are connected.
- **Browser-validated:** reproduced in the supported desktop and mobile viewport matrix.
- **Offline-validated:** reproduced after network removal with a previously stored profile.
- **Release candidate:** all declared gates pass and the build is ready for staging review.
- **Published:** production deployment is complete and post-deploy smoke evidence exists.

No stage may be claimed based on intention, screenshots alone, or a branch name containing the word `final`, one of software’s oldest forms of fiction.

## 9. Non-negotiable product rule

Do not tell people who they are as an unquestionable fact. Help them understand a supported pattern, show the evidence and uncertainty, invite correction from lived experience, and provide one practical next move.
