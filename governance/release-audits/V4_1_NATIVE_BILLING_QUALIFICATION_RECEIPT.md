# Soul Codex 4.1 Native Billing Qualification Receipt

Release SHA: **UNSET**  
App version/build: **UNSET**  
Test window: **UNSET**

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
