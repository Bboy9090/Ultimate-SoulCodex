# Soul Codex 4.1 Native Billing Qualification

**Purpose:** qualify each native billing provider independently before its production purchase flag may be enabled.

This procedure is evidence collection, not an activation instruction. Code-level tests, configured product IDs, successful archive builds, or store catalog creation do **not** prove purchase qualification.

## Commercial and product authority

- Soul Codex+ Monthly baseline: **$5.99 USD / month**
- Soul Codex+ Annual baseline: **$59.99 USD / year**
- Apple monthly: `app.soulcodex.plus.monthly`
- Apple annual: `app.soulcodex.plus.annual`
- Google monthly: `soul_codex_plus_monthly`
- Google annual: `soul_codex_plus_annual`

Provider-localized store prices are authoritative in the purchase UI. The baseline above is the operator catalog target, not proof of store approval or product availability.

## Activation rule

Qualify iOS and Android separately. A provider is not qualified until every required checkpoint is PASS. Any FAIL blocks that provider. Any INCONCLUSIVE keeps that provider's production flag disabled.

Production flags:

- iOS: `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED`
- Android: `SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED`
- Legacy umbrella flag: `SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED` must remain `false` during staged provider rollout.

The platform-specific flags must be explicitly configured. Do not rely on legacy fallback behavior.

## Shared prerequisites

Before either provider can be tested:

1. Use an authenticated Soul Codex test account that can be reused after reinstall and on a second device.
2. Confirm durable database persistence is active.
3. Confirm monthly and annual product IDs are configured server-side.
4. Confirm the native purchase flag is enabled **only in the qualification environment**.
5. Confirm production remains disabled until qualification completes.
6. Confirm server verification is required before an entitlement grant is written.
7. Record app version/build, exact Git SHA, device model, OS version, tester, account alias, and test date.
8. Use only sandbox/TestFlight/internal-test billing. Do not complete a live production charge.

## iOS — StoreKit 2 qualification

Distribution source: TestFlight or the approved sandbox qualification path.

Required checkpoints:

1. **Catalog** — monthly and annual StoreKit products resolve with provider-supplied localized price/currency.
2. **Monthly purchase** — sandbox monthly purchase succeeds; Plus is granted only after signed Apple evidence is verified by the server.
3. **Annual purchase** — annual product succeeds in a clean eligible test state; entitlement maps to the same internal Soul Codex+ capability.
4. **Failed/cancelled purchase** — cancellation or failure grants no entitlement.
5. **Persistence** — force-quit and relaunch; verified Plus remains available while the verified entitlement is active.
6. **Restore** — Restore Purchases recovers access from Apple evidence rather than a local premium flag.
7. **Reinstall** — remove/reinstall the app and restore with the same Apple/Soul Codex test identity.
8. **Second device** — when available, restore/verify on a second iOS device using the same eligible store/account state.
9. **Expiration/cancellation** — access persists through valid paid-through time, then falls back to Free when the verified entitlement expires.
10. **Refund/revocation** — signed revocation/refund evidence removes Plus access when the sandbox/TestFlight environment supports the case.
11. **Transaction updates** — StoreKit transaction updates are observed and reverified server-side.
12. **App Store Server Notifications V2** — signed notification handling is exercised; notifications do not directly grant access without server verification.
13. **Wrong environment / replay / mismatched product** — forged, replayed, wrong-environment, or unrecognized product evidence is rejected.
14. **Free fallback** — when entitlement is absent/expired/revoked, Free remains usable and evidence/uncertainty are not paywalled.

## Android — Google Play Billing qualification

Distribution source: Google Play internal testing or another approved Play test track.

Required checkpoints:

1. **Catalog** — monthly and annual subscriptions resolve with provider-supplied localized price/currency.
2. **Monthly purchase** — test monthly purchase succeeds; Plus is granted only after Google Play Developer API verification.
3. **Annual purchase** — annual product succeeds in a clean eligible test state; entitlement maps to the same internal Soul Codex+ capability.
4. **Failed/cancelled purchase** — cancellation or failure grants no entitlement.
5. **Acknowledgement** — purchase is acknowledged only after successful server verification.
6. **Persistence** — force-stop/relaunch; verified Plus remains while the verified entitlement is active.
7. **Restore** — active Play purchases recover access from provider evidence rather than a local premium flag.
8. **Reinstall** — remove/reinstall and restore with the same Play/Soul Codex test identity.
9. **Second device** — when available, verify/restore on a second Android device with the same eligible account state.
10. **Cancellation/expiry** — access follows the provider's valid paid-through period and falls back to Free after verified expiry.
11. **Refund/revocation** — provider state removes Plus when the test environment supports refund/revocation.
12. **Grace/account-hold handling** — access follows the verified Google state; no client-side override may invent active access.
13. **RTDN** — RTDN authentication is verified, then the backend re-queries Google Play; RTDN itself never grants access.
14. **Replay / mismatched token / product** — forged, replayed, mismatched package/product/token evidence is rejected.
15. **Free fallback** — absent/expired/revoked entitlement returns the user to usable Free behavior.

## Required evidence per checkpoint

Record only redacted evidence:

- provider
- plan (monthly/annual)
- product ID
- environment (sandbox/TestFlight/internal test)
- app version/build and Git SHA
- device + OS/API
- Soul Codex test-account alias
- provider test-account alias (never password)
- redacted provider transaction/purchase-token identifier
- server verification result
- resulting entitlement state
- timestamp
- screenshot/video or diagnostic artifact reference when useful

Never commit passwords, raw service-account JSON, Apple credentials, webhook secrets, full signed transaction payloads, or unredacted purchase tokens.

## Result vocabulary

- `PASS` — checkpoint observed with valid provider evidence.
- `FAIL` — reproducible product/provider defect or invalid entitlement behavior.
- `INCONCLUSIVE` — provider/test environment cannot currently exercise the checkpoint.
- `NOT APPLICABLE` — checkpoint is genuinely not supported by that provider/test environment and is not required for the intended production behavior.

INCONCLUSIVE is not PASS.

`NOT APPLICABLE` may document an unavailable scenario, but it cannot waive a required checkpoint or qualify a provider. Every checkpoint in the validator's provider matrix must have an evidenced PASS before that provider can qualify.

## Operator evidence workflow

Use the redacted template at:

`governance/release-audits/V4_1_BILLING_QUALIFICATION_EVIDENCE.template.json`

Copy it to a local, untracked working file before recording provider observations. Do not commit passwords, raw service-account JSON, signed provider payloads, full receipts, or unredacted purchase tokens.

Validate the working evidence file:

```bash
npm run billing:qualification:evidence -- --file <redacted-evidence.json>
```

Require one provider to pass without falsely requiring the other providers to be complete:

```bash
npm run billing:qualification:evidence -- --file <redacted-evidence.json> --require-provider-pass ios
npm run billing:qualification:evidence -- --file <redacted-evidence.json> --require-provider-pass android
npm run billing:qualification:evidence -- --file <redacted-evidence.json> --require-provider-pass web
```

Use `--require-all-pass` only for the final cross-provider launch decision.

## Provider-specific production preflight

Before qualifying or activating a provider, run the matching strict configuration check:

```bash
npm run billing:preflight:ios
npm run billing:preflight:android
npm run billing:preflight:web
```

These commands intentionally validate one provider without requiring unrelated provider credentials. They do not enable billing and they do not replace sandbox/TestFlight/internal-test transaction evidence.

Use the existing all-provider gate only for the final cross-provider launch decision:

```bash
npm run billing:preflight:strict
```

## Provider activation decision

A provider production flag may be considered for activation only when:

1. every required checkpoint is PASS;
2. the strict billing preflight passes against the production variable set;
3. current exact-head release gates are green;
4. store disclosures match the tested product/cadence;
5. the qualification receipt is complete and reviewed.

Qualifying iOS does not qualify Android. Qualifying Android does not qualify iOS. Qualifying native billing does not qualify web checkout.
