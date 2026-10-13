# Soul Codex 4.1 Native Billing Qualification Receipt

Qualification transaction SHA: **NOT FROZEN — no provider transaction evidence run has begun**  
App version/build: **4.1.0 / 4000011**  
Test window: **2026-10-13 — release/configuration and qualification-path readiness only; provider transaction qualification still pending**

## Configuration safety evidence

- Latest implementation authority inspected before provider evidence: merged `main` at `ed8266842989a377b75fc793ecf16c321d87f733`.
- Qualification transaction authority is intentionally **not frozen yet** because no dedicated TestFlight/internal-test provider evidence run has begun.
- When the first provider evidence run begins, freeze the exact qualification build SHA in this receipt and in the redacted evidence file; do not silently carry an older SHA forward.
- Exact-head release gates for the latest inspected implementation: PASS.
- Exact-head Android store validation: PASS, including signed AAB build and signature verification.
- Exact-head GitHub iOS store validation: PASS.
- Exact-head Apple-managed Xcode Cloud archive: PASS.
- Railway production deployment status must be re-recorded for the frozen qualification SHA before any provider checkpoint is marked PASS.
- Production purchase flags remain staged `false`; the production billing patch remains undeployed.
- iOS qualification flag `SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED` is staged `false` and remains undeployed.
- iOS qualification support is present in code, but a dedicated qualification build and real Apple sandbox transactions have not yet been observed.
- Provider-specific strict preflight is available for iOS, Android, and web; passing configuration preflight is not provider transaction qualification.
- Provider purchase/restore/lifecycle rows below remain INCONCLUSIVE until real provider evidence is observed.

## iOS / StoreKit 2

Device/model:  
OS:  
TestFlight/build identity:  
Soul Codex test-account alias:  
Apple sandbox/test alias:  
Monthly product: `app.soulcodex.plus.monthly`  
Annual product: `app.soulcodex.plus.annual`

| Checkpoint | Result | Evidence / redacted transaction reference |
|---|---|---|
| Catalog monthly + annual | INCONCLUSIVE | |
| Monthly purchase + server verification | INCONCLUSIVE | |
| Annual purchase + server verification | INCONCLUSIVE | |
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
