# Soul Codex+ 4.1 Store Catalog Handoff

This document is the operator contract for creating the production subscription catalog. It does **not** claim the products already exist in App Store Connect, Google Play Console, or Stripe.

## Commercial baseline

The existing Soul Codex pricing plan sets Premium at:

| Plan | Price | Renewal |
|---|---:|---|
| Soul Codex+ Monthly | $9.99 USD | Monthly |
| Soul Codex+ Annual | $89.99 USD | Annual |

No free trial is enabled by this 4.1 RC unless it is separately configured, disclosed, and requalified.

## Canonical product identifiers to create

### Apple App Store Connect

App identity:
- App name: Soul Codex
- Bundle ID: `app.soulcodex.ios`
- App Store numeric ID: `6764221944`

Create one auto-renewable subscription group for Soul Codex+ with these products:

- Monthly product ID: `app.soulcodex.plus.monthly`
- Annual product ID: `app.soulcodex.plus.annual`

After the products exist and are available to the intended sandbox/TestFlight/production environment, set Railway:

- `APPLE_PLUS_MONTHLY_PRODUCT_ID=app.soulcodex.plus.monthly`
- `APPLE_PLUS_ANNUAL_PRODUCT_ID=app.soulcodex.plus.annual`

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

- Monthly: $9.99 USD every 1 month
- Annual: $89.99 USD every 1 year

Then configure Railway with the real values returned by Stripe:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLUS_MONTHLY_PRICE_ID`
- `STRIPE_PLUS_ANNUAL_PRICE_ID`

Webhook destination:
- `https://soulcodex.up.railway.app/api/billing/webhook`

The Stripe catalog is re-read server-side before checkout; inactive, wrong-cadence, or non-recurring Price objects are rejected.

## Activation sequence

1. Create Apple monthly and annual products.
2. Create Google monthly and annual products.
3. Connect the Google Play service account and verify Developer API access.
4. Create Stripe monthly and annual recurring Prices plus webhook endpoint.
5. Enter the real production values in Railway while web, iOS, and Android billing flags remain `false`.
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

Until the account-side catalog is created and sandbox evidence is recorded:
- product IDs listed here are the canonical identifiers to create, not proof of existing store products;
- prices are the established product baseline, not proof of store approval;
- purchase flags remain off;
- Soul Codex Free remains available.
