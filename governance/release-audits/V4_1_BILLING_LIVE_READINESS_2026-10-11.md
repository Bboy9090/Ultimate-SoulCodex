# Soul Codex 4.1 — Live Billing Readiness Audit

Audit date: 2026-10-11 (America/New_York)

## Authority inspected

- Railway project: `Soulcodex`
- Environment: `production`
- Service: `soulcodex`
- Latest successful deployed commit at audit time: `a63e16c5325c288e8c8d533d6721013a0883429e`
- Current deployed code includes:
  - explicit iOS/Android billing flags,
  - native account binding before purchase,
  - provider-side signed evidence verification,
  - automatic iOS archive signing authority,
  - fail-closed billing readiness preflight.

## Live/staged configuration evidence

Railway reports the production service as `live-with-staged-changes`.

Pending Railway patch:
- patch id: `64261a81-3292-4472-98cd-ba3fa8bc8977`
- destructive: false
- staged variable additions:
  - `APPLE_PLUS_MONTHLY_PRODUCT_ID`
  - `APPLE_PLUS_ANNUAL_PRODUCT_ID`
  - `GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID`
  - `GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID`
  - `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED`
  - `SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED`
  - `SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED`
  - `SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED`

The connector exposes staged values only as redacted. Therefore this audit does **not** claim any staged billing flag is false or safe to enable.

## Required configuration still absent by variable name

The strict production preflight currently requires the following configuration that is not present in the Railway production service variable-name inventory:

- `APPLE_WEB_CLIENT_ID`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PLUS_MONTHLY_PRICE_ID`
- `STRIPE_PLUS_ANNUAL_PRICE_ID`

Because those names are absent, `billing:preflight:strict` cannot truthfully qualify the full production billing surface today.

## Current decision

**BLOCKED — do not commit/enable the staged billing patch as a production billing launch.**

Reasons:
1. Staged flag values are redacted and cannot be verified as disabled.
2. Google Play Developer API service-account configuration is absent.
3. Web Apple authentication client configuration is absent.
4. Stripe production catalog/webhook configuration is absent.
5. Provider sandbox/TestFlight/internal-test evidence is still required for purchase, cancellation/failure, restore, renewal, expiry, refund/revocation, reinstall/second-device, and server-verification behavior.

## Safe next actions

1. Keep production purchase flags disabled.
2. Add the missing provider configuration values through the approved secret-management path.
3. Run `npm run billing:preflight:strict` against the complete production variable set.
4. Complete the provider qualification matrix in `V4_1_NATIVE_BILLING_QUALIFICATION.md`.
5. Fill `V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md` with real provider evidence.
6. Enable each platform-specific billing flag only after that provider's qualification is complete.

This file records configuration/readiness evidence only. It contains no credential values.
