# Soul Codex+ — Braintree merchant and engineering qualification (Draft)

Status: **NOT CONNECTED · NOT ENABLED · NOT APPROVED FOR PRODUCTION**. Created November 19, 2026. Issue #690 is the execution authority; the existing Stripe web path and Apple/Google native subscription programs stay unchanged.

## Where it fits

Braintree may be an **optional browser-web merchant** for Soul Codex+ once its merchant account is approved. Do not use it to bypass app-store digital-goods rules, replace a verified Apple/Google billing source, or silently migrate existing Stripe subscribers. The Braintree merchant controls its own recurring plans and vaulted payment methods.

The current entitlement ledger accepts `stripe`, `apple`, and `google_play`. A Braintree callback cannot become a Plus grant by pretending to be Stripe or inventing provider provenance. Adding the Braintree provider requires explicit schema, server, storage, client and offline-cache contract changes, separate tests, and reviewed migrations. **None are authorized to accept events yet.**

## Merchant onboarding

1. Business owner initiates onboarding at https://www.braintreepayments.com/ with legal business identity, tax and banking records **directly in Braintree**, never GitHub or a chat.
2. Obtain approval and check jurisdiction, settlement currency, merchant-account ID, recurring billing availability, pricing, fraud protection, disputes and refund handling. Sandbox enrollment is not live-merchant approval.
3. In a private secrets manager establish distinct sandbox and production credential sets: Merchant ID, Public Key, Private Key and Merchant Account ID. Do not store credentials in source, diagnostics, build logs or tickets.
4. Create/test explicit monthly and annual plans. Use real provider plan IDs and amounts; do not reuse Stripe Price IDs or assume the current Braintree plan catalog exists.
5. Install an HTTPS webhook route after implementing Braintree's SDK signature parsing and authenticated server-side subscription lifecycle validation. Test webhook retries, replay, out-of-order notices, subscription status updates, refunds, chargebacks and idempotency.

## Hard execution boundaries

- A future `SOUL_CODEX_PLUS_BRAINTREE_WEB_ENABLED` server flag **must default off** and require an approved merchant, authenticated browser session, production plans, real signed webhook verification and durable ledger migration before activation.
- Hosted/tokenized card entry only, with PCI responsibility scoped correctly. No raw PAN, CVV, card expiration or payment method nonce stored in Soul Codex database or logs.
- Never grant Plus because the browser returns a successful payment token, redirect, or checkout ID. Only verified merchant API/subscription status and signed webhook lifecycle may update a production-source grant.
- Sandbox events must not grant ordinary production access. Idempotent provider event IDs and source transactions must be immutable across retries.
- StoreKit and Google Play Billing must remain the default native paths until an independently reviewed jurisdiction-specific alternative-billing flow is approved; never render an unconditional native Braintree paywall.
- No public product claims, existing-account migration, activation, real charge, provider key generation, or store submission as part of merchant readiness.

## First test matrix before sandbox hookup

| Gate | Evidence required |
|---|---|
| Merchant identity | Account approved, sandbox and production clearly distinguished |
| Plans | Merchant-account/currency/amount/interval explicitly checked monthly and annual |
| Auth | Signed-in billing subject bound server-side, CSRF protection, verified web origin |
| Tokenization | Braintree client token only after auth; nonce never logged |
| Purchases | Server creates/subscribes with scoped vaulted token and provider-confirmed result |
| Webhooks | SDK signature parse, subscription ID re-query, replay/deduplication, event ordering |
| Ledger | Explicit `braintree` provider mapping, environment isolation, no Stripe impersonation |
| Lifecycle | Renewal, expiry, grace, cancellation, refund, dispute, account deletion, restore |
| Security | No grants on forged, stale, wrong-account, unknown-plan or sandbox notices |
| Store policy | US/other storefront gating, Google program/reporting compliance, Apple rules reviewed |
| Release | Exact-head CI, sandbox API receipts, independent reviewer, manual go-live approval |

## Official references

- Recurring billing: https://developer.paypal.com/braintree/articles/guides/recurring-billing/overview
- Subscriptions: https://developer.paypal.com/braintree/docs/guides/recurring-billing/create/node
- Webhooks: https://developer.paypal.com/braintree/docs/guides/webhooks/overview
- Apple: https://developer.apple.com/app-store/review/guidelines/
- Google US: https://support.google.com/googleplay/android-developer/answer/16497028

The checkout is **not** ready until the owner completes merchant onboarding and a separately reviewed engineering branch passes the live Braintree sandbox test matrix. This file alone authorizes no provider integration or payment collection.
