# Soul Codex+ 4.1 Store Catalog Handoff

This document is the operator contract for creating and qualifying the production subscription catalog. Apple account observations are recorded below. Google Play and Stripe qualification remain independent.

## Commercial baseline

The existing Soul Codex pricing plan sets Premium at:

| Plan | Price | Renewal |
|---|---:|---|
| Soul Codex+ Monthly | $5.99 USD | Monthly |
| Soul Codex+ Annual | $59.99 USD | Annual |

No free trial is enabled by this 4.1 RC unless it is separately configured, disclosed, and requalified.

## Canonical product identifiers to create

### Apple App Store Connect

App identity:
- App name: Soul Codex
- Bundle ID: `app.soulcodex.ios`
- App Store numeric ID: `6764221944`

Use the existing auto-renewable subscription group **Soul Codex+** (group ID `22442182`). Observed in App Store Connect on 2026-10-14:

- Monthly product ID: `app.soulcodex.plus.monthly.renewing`
- Annual product ID: `app.soulcodex.plus.annual.renewing`

Both products were **Prepare for Submission** when inspected. Their existence does not prove StoreKit availability or completed purchases. Railway was corrected to these observed identifiers on 2026-10-14:

- `APPLE_PLUS_MONTHLY_PRODUCT_ID=app.soulcodex.plus.monthly.renewing`
- `APPLE_PLUS_ANNUAL_PRODUCT_ID=app.soulcodex.plus.annual.renewing`

Do not enable `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED` until the server verifier, sandbox purchase, restore, cancellation/expiry, refund/revocation, and App Store Server Notifications V2 path all pass.

### Google Play Console

App identity:
- Package: `soulcodex.app`

Create subscriptions mapped to:

- Monthly product ID: `soul_codex_plus_monthly`
- Annual product ID: `soul_codex_plus_annual`

After the products exist and the Play Developer API service account can read them, set Railway:

- `GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID=soul_codex_plus_monthly`
- `GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID=soul_codex_plus_annual`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<real service account JSON>`

RTDN endpoint:
- `https://soulcodex.up.railway.app/api/billing/google/rtdn?token=<configured secret>`

The RTDN token is already treated as an independent push-authentication secret. RTDN itself never grants access; the backend re-queries Google Play.

Do not enable `SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED` until the Developer API verifier, internal-test purchase, restore, cancellation/expiry, refund/revocation, and RTDN lifecycle path all pass.

### Stripe web checkout

Create one recurring Price for each cadence:

- Monthly: $5.99 USD every 1 month
- Annual: $59.99 USD every 1 year

Then configure Railway with the real values returned by Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLUS_MONTHLY_PRICE_ID`
- `STRIPE_PLUS_ANNUAL_PRICE_ID`

Webhook destination:
- `https://soulcodex.up.railway.app/api/billing/webhook`

The Stripe catalog is re-read server-side before checkout; inactive, wrong-cadence, or non-recurring Price objects are rejected.

## Activation sequence

1. Verify the existing Apple monthly and annual auto-renewable products and complete their submission metadata; do not create duplicates.
2. Create Google monthly and annual products.
3. Connect the Google Play service account and verify Developer API access.
4. Create Stripe monthly and annual recurring Prices plus webhook endpoint.
5. Enter the real production values in Railway while web, iOS, and Android billing flags remain `false`. Set the iOS and Android platform-specific flags explicitly; strict production readiness must not rely on the legacy umbrella native-billing fallback.
6. Run `npm run billing:preflight:strict` against the production variable set.
7. Run sandbox/TestFlight/internal-test purchase, restore, renewal, cancellation, expiry, refund/revocation, and reinstall/second-device tests per provider.
8. Update live App Store Connect / Play privacy and subscription disclosures to match the 4.1 packet.
9. Enable only the purchase surface that has completed its own qualification:
   - web: `SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED=true`
   - iOS: `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED=true`
   - Android: `SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED=true`
   - legacy `SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED` remains a compatibility fallback only and should stay `false` for staged provider rollout.
10. Re-run the exact-head release gates and preserve the resulting receipts.

## Non-claims

Until provider-specific sandbox evidence is recorded:
- Apple identifiers above were observed in the account; Google and Stripe entries remain configuration targets, not proof of existing products;
- prices are the established product baseline, not proof of store approval;
- purchase flags remain off;
- Soul Codex Free remains available.

## Observed qualification checkpoint — 2026-10-14

- Railway deployment `3045515c-e8a6-46dc-b7b1-582ca3110431` succeeded after correcting only the two Apple product IDs. The live iOS catalog returned both `.renewing` IDs, `enabled: false`, and `qualificationMode: false`; web checkout also remained disabled.
- App Store Connect showed build **4.1.0 (310)** as **Validated / Ready to Submit**, uploaded October 14 at 3:33 AM. Its source SHA and qualification build settings were not established by that metadata. Do not substitute it for the signed local qualification artifact without checking provenance.
- Signed local qualification build **4.1.0 (4000011)** uses source `7abb40d35a50a80134474e266a819865f0e6c156`. IPA SHA-256: `6cc5a3a15c09b23f8570cd2c737b7b71a648ce02e5c9880a1142e15e33ffba81`. Upload of this artifact was not verified.
- Apple displayed an updated Developer Program License Agreement notice requiring Account Holder acceptance before app updates/submissions. Subsequent Apple Developer sign-in timed out; acceptance remains unverified.
- Real purchase, restore, renewal, cancellation/expiry, refund/revocation, notifications, and second-device qualification remain outstanding. No production billing activation is authorized by this checkpoint.


## Observed Apple review-package checkpoint — 2026-10-23

- Current Apple submission-candidate source: `805c4b30247283b34f3d22da54038e2fc612e98c` on `main`.
- Xcode Cloud workflow `Default` produced build `324` from that exact commit; the iOS archive action succeeded.
- TestFlight identifies the binary as Soul Codex `4.1.0 (324)`, bundle `app.soulcodex.ios`.
- Both monthly and annual products are now **Ready for Review**.
- Both products are available in all current App Store countries/regions (`175`) and set to become available in future App Store regions automatically.
- Apple Review Information screenshots are present for both subscription products.
- The App Review draft now groups iOS 4.1 with both auto-renewable subscriptions: **3 items, Ready for Review**.
- The final submission is intentionally held because provider transaction qualification is still **INCONCLUSIVE**. No physical iOS device is currently online to prove current-build purchase, server verification, persistence, restore, reinstall, and lifecycle behavior.
- Production iOS billing remains unauthorized until the full qualification matrix passes.
