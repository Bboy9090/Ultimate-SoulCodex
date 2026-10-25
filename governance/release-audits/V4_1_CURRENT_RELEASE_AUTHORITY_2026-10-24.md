# Soul Codex 4.1.0 — Current Release Authority

**Authority date:** 2026-10-24 (America/New_York)  
**Merged main:** `8ee3757df895abe806c3fa1a2ee048d4fc84e392`  
**Qualified source head:** `00c38dcc540ab730830462fad8c681eb84fdbc87`  
**Tree equivalence:** PASS — the merged main tree is file-identical to the qualified source head.  
**Release version:** `4.1.0`

This receipt supersedes stale 4.0.x release-authority notes for current submission planning. It does not claim App Store or Google Play production publication.

## Exact-head qualification

Qualified source head `00c38dcc540ab730830462fad8c681eb84fdbc87` passed:

- Accessibility Device Acceptance Gate
- Diamond Way Synthesis Gate
- Device Security Data Integrity Gate
- Xcode Cloud Bootstrap Parity
- iOS Billing Qualification Parity
- Soul Codex Store Candidate — Android 4.1.0 / iOS 4.1.0
- Vercel

The Store Candidate workflow run was `40156358212`.

## Android authority

- Application ID: `soulcodex.app`
- Namespace: `app.soulcodex.main`
- Version name: `4.1.0`
- Version code: `4000012`
- Candidate SHA embedded by the workflow: `00c38dcc540ab730830462fad8c681eb84fdbc87`
- Android artifact: `soulcodex-4.1.0-android`
- GitHub Actions artifact ID: `12584354857`
- Signed AAB: produced
- Independent `jarsigner -verify`: PASS
- AAB SHA-256: `64d609cf7311c614af4f777cb258b7b8bc6753fd4635d8013286f9de8a795076`
- Debug APK smoke artifact: PASS
- Artifact ZIP SHA-256: `39b214660b0238cef3d22e210783e60893cafc7ed68ae74037daec760d334f29`
- Automated Google Play production publishing credentials: unavailable in the qualifying run
- Production publish attempted: NO
- Production publish status: deferred

The lack of `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` blocks automated production publishing only. It does not invalidate the signed AAB qualification or prevent manual Play Console handling.

The latest separately recorded Play Console state remains: closed testing release 4.1.0 / 4000012 active, 25 addresses on the tester list, and 0 opted-in testers at the last recorded check on 2026-10-23. That external state must be refreshed before any production-access claim.

## iOS authority

- Bundle ID: `app.soulcodex.ios`
- Marketing version: `4.1.0`
- Source project build: `4000011`
- Candidate SHA: `00c38dcc540ab730830462fad8c681eb84fdbc87`
- iOS qualification artifact: `soulcodex-4.1.0-ios-qualification`
- GitHub Actions artifact ID: `12585215434`
- Simulator Release build: PASS
- Generic-device unsigned archive qualification: PASS
- Qualification artifact ZIP SHA-256: `482505ee3b2fbd9b441c31fdb00125b468102bababffc44ff69193739d8061de`
- Signed App Store upload: explicitly delegated to Apple/Xcode Cloud after main merge

The earlier Apple-managed Xcode Cloud build 324 came from historical main `805c4b30247283b34f3d22da54038e2fc612e98c`. It remains evidence that the Apple pipeline can archive and upload, but it is not the current release-authority build for merged main `8ee3757d...`.

A new Apple-managed archive/build tied to the final current release tree must be recorded before submission authority is frozen.

## Billing / entitlement truth

The code-level and archive-level billing qualification gates are green, but provider transaction qualification is not complete.

Current production truth:

- iOS StoreKit purchase/restore/lifecycle evidence for the current final build: INCONCLUSIVE
- Android Google Play Billing purchase/restore/lifecycle evidence for the current final build: INCONCLUSIVE
- Cancellation/expiry/refund/revocation real-provider lifecycle: INCONCLUSIVE
- Production native billing flags: must remain disabled until provider qualification passes
- Free fallback and server-side entitlement projection remain the safe default

Passing `iOS Billing Qualification Parity` proves the code/config/archive contract. It does not substitute for a real StoreKit or Google Play transaction on a store-delivered build.

## Store metadata / compliance truth

Canonical store copy and declaration draft: `docs/STORE_SUBMISSION_PACKET.md`.

Current source identity is already 4.1.0:

- Android: `4.1.0` / `4000012` / `soulcodex.app`
- iOS: `4.1.0` / source build `4000011` / `app.soulcodex.ios`

Public legal/support URLs:

- Privacy: https://bboy9090.github.io/Ultimate-SoulCodex/privacy/
- Support: https://bboy9090.github.io/Ultimate-SoulCodex/support/
- Account deletion: https://bboy9090.github.io/Ultimate-SoulCodex/account-deletion/

App Store privacy metadata reconciliation remains an external App Store Connect gate tracked in issue #346. Do not claim the public listing is reconciled until that receipt exists.

## Remaining external release gates

1. Verify Railway production `/health` reports the intended final release SHA/API contract after the final deployment.
2. Produce and record the Apple-managed Xcode Cloud archive/build for the final current release tree.
3. Run current-build physical-device StoreKit purchase, restore, relaunch, reinstall, second-device, cancellation/expiry, and refund/revocation qualification.
4. Run equivalent Google Play Billing qualification from the active test track.
5. Refresh the Play Console closed-test tester count and satisfy Google's production-access eligibility requirement before claiming production access.
6. Reconcile App Store Connect privacy metadata and age-rating answers against the exact 4.1.0 behavior.
7. Capture final iPhone/iPad/Android screenshots from the actual release build.
8. Preserve App Store Connect and Play Console submission/processing receipts.
9. Do not call either store update publicly deployed until the store itself provides the corresponding release state.

## Non-claims

This receipt does **not** claim:

- App Store review submission
- App Store approval/publication of 4.1.0
- Google Play production access
- Google Play production publication
- current-build real-provider purchase/restore PASS
- current-build physical-device PASS
- current Railway deployment SHA parity

Those require their own external receipts.

## Supersession

For current release planning, this receipt supersedes the release-authority portions of issue #202 and issue #299 that refer to 4.0.1/4.0.2 artifacts.

Historical receipts remain valid only for the specific builds and dates they name.
