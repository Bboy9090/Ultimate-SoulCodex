# Soul Codex 4.1 Native Billing Qualification Receipt

Qualification transaction SHA: **NOT FROZEN — no dedicated current-build qualification run has been completed**  
App version/build: **4.1.0 / Apple Xcode Cloud build 324**  
Source project build setting: **4000011**  
Test window: **2026-10-13 through 2026-10-23 — release/configuration readiness plus partial historical provider evidence; current-build provider qualification remains pending**

## Configuration safety evidence

- Current Apple submission-candidate authority: merged `main` at `805c4b30247283b34f3d22da54038e2fc612e98c`.
- Xcode Cloud Default workflow build `324` started from that exact SHA at 2026-10-23 05:43 America/New_York and the iOS archive succeeded.
- Qualification transaction authority is intentionally **not frozen yet** because no dedicated current-build TestFlight/internal-test provider evidence run has completed.
- A prior annual Apple TestFlight sandbox purchase was observed completing at Apple, but Soul Codex server verification returned `authentication_required` / HTTP 401. That attempt is historical defect evidence, not a PASS and not authority for the current build. See `docs/NATIVE_BILLING_SESSION_RECOVERY_2026-10-20.md`.
- Before the next provider evidence run, freeze the exact qualification build SHA in this receipt and in the redacted evidence file; do not silently carry an older SHA forward.
- Exact-head release gates for the latest inspected implementation: PASS.
- Exact-head Android store validation: PASS, including signed AAB build and signature verification.
- Exact-head GitHub iOS store validation: PASS.
- Exact-head Apple-managed Xcode Cloud archive: PASS.
- Railway production deployment status must be re-recorded for the frozen qualification SHA before any provider checkpoint is marked PASS.
- Production purchase flags remain staged `false`; the production billing patch remains undeployed.
- iOS qualification flag `SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED` is staged `false` and remains undeployed.
- iOS qualification support is present in code. A real annual Apple sandbox transaction has been observed historically, but it did not establish a Soul Codex entitlement because server authentication failed. The repaired session path still requires current-build device requalification.
- Provider-specific strict preflight is available for iOS, Android, and web; passing configuration preflight is not provider transaction qualification.
- Provider purchase/restore/lifecycle rows below remain INCONCLUSIVE until real provider evidence is observed.

## iOS / StoreKit 2

Device/model:  
OS:  
TestFlight/build identity:  
Soul Codex test-account alias:  
Apple sandbox/test alias:  
Monthly product: `app.soulcodex.plus.monthly.renewing`  
Annual product: `app.soulcodex.plus.annual.renewing`

| Checkpoint | Result | Evidence / redacted transaction reference |
|---|---|---|
| Catalog monthly + annual | INCONCLUSIVE | |
| Monthly purchase + server verification | INCONCLUSIVE | |
| Annual purchase + server verification | INCONCLUSIVE | Historical TestFlight sandbox attempt completed at Apple but failed Soul Codex server verification with `authentication_required` / HTTP 401; current repaired build still requires retest. |
| Failed/cancelled purchase grants nothing | INCONCLUSIVE | |
| Relaunch persistence | INCONCLUSIVE | |
| Restore purchases | INCONCLUSIVE | |
| Reinstall restore | INCONCLUSIVE | |
| Second-device restore/verification | INCONCLUSIVE | |
| Cancellation/expiry fallback | INCONCLUSIVE | |
| Refund/revocation | INCONCLUSIVE | |
| StoreKit transaction updates | INCONCLUSIVE | |
| App Store Server Notifications V2 | INCONCLUSIVE | |
| Wrong environment/replay/mismatch rejection | INCONCLUSIVE | |
| Free fallback remains usable | INCONCLUSIVE | |

**iOS result:** INCONCLUSIVE  
**iOS production flag:** MUST REMAIN FALSE until result is PASS.

## Android / Google Play Billing

Device/model:  
OS/API:  
Play test-track/build identity:  
Soul Codex test-account alias:  
Google Play test alias:  
Monthly product: `soul_codex_plus_monthly`  
Annual product: `soul_codex_plus_annual`

| Checkpoint | Result | Evidence / redacted purchase-token reference |
|---|---|---|
| Catalog monthly + annual | INCONCLUSIVE | |
| Monthly purchase + server verification | INCONCLUSIVE | |
| Annual purchase + server verification | INCONCLUSIVE | |
| Failed/cancelled purchase grants nothing | INCONCLUSIVE | |
| Verify-before-acknowledge | INCONCLUSIVE | |
| Relaunch persistence | INCONCLUSIVE | |
| Restore active purchase | INCONCLUSIVE | |
| Reinstall restore | INCONCLUSIVE | |
| Second-device restore/verification | INCONCLUSIVE | |
| Cancellation/expiry fallback | INCONCLUSIVE | |
| Refund/revocation | INCONCLUSIVE | |
| Grace/account-hold behavior | INCONCLUSIVE | |
| RTDN authentication + Play re-query | INCONCLUSIVE | |
| Replay/package/product/token mismatch rejection | INCONCLUSIVE | |
| Free fallback remains usable | INCONCLUSIVE | |

**Android result:** INCONCLUSIVE  
**Android production flag:** MUST REMAIN FALSE until result is PASS.

## Final decision

- iOS qualified: NO
- Android qualified: NO
- Web qualified by this receipt: NO — separate evidence required
- Legacy native umbrella flag allowed: NO

Overall native billing qualification: **INCONCLUSIVE**

## 2026-10-23 store-console readiness note

- App Store Connect version 4.1 is now attached to Apple-managed Xcode Cloud build `324` (`4.1.0`) from exact SHA `805c4b30247283b34f3d22da54038e2fc612e98c`.
- Xcode Cloud reports build `324` on `main` / workflow `Default`; the archive action succeeded. TestFlight metadata shows it was uploaded at 2026-10-23 05:47 America/New_York.
- Both `Soul Codex+` auto-renewable subscriptions are `Ready for Review` with review screenshots present; the subscription group has an English (U.S.) localization with display name `Soul Codex+` and app name `Soul Codex`.
- Monthly and annual subscription availability is now all current App Store countries/regions (`175`) with automatic future-region availability enabled.
- The previously separate 4.1 submission was developer-cancelled so Apple could receive the first auto-renewable subscription group with the new app version as required.
- The current App Review draft now contains `iOS 4.1` build `324`, both subscriptions, and the localized `Soul Codex+` subscription group: **4 items, Ready for Review**.
- Final `Submit for Review` has intentionally **not** been pressed because current-build StoreKit purchase/restore/lifecycle qualification remains INCONCLUSIVE and no physical iOS device is currently online for that evidence run.
- These store-metadata observations do not change the provider qualification result. Production iOS billing must remain disabled until the full current-build evidence matrix passes.
