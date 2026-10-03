# Soul Codex 4.1 Monetization Contract

## Product boundary

Soul Codex 4.0.1 does not sell native premium access. Identity, Reading, Timeline, the educational Astrology Atlas, and the current Compatibility experience remain available without a purchase. A client screen, callback URL, profile flag, or locally edited value must never grant premium access.

The paid product is Soul Codex+, offered as monthly and annual access only when recurring value is live and qualified. Recurring value includes continuously refreshed Daily synthesis, advanced transit/timing intelligence, deeper Connections, Timeline history, multi-system synthesis, and ongoing premium interpretation surfaces. A static natal report alone does not justify a subscription.

## Entitlement truth

Every premium decision must resolve from a durable server entitlement associated with a stable billing subject. The server owns the entitlement state; clients display it.

Required records:

1. Billing subject: the authenticated account that can restore access across devices.
2. Store transaction event: immutable Apple, Google, or Stripe evidence with store transaction identity, product identity, environment, purchase time, and verification state.
3. Entitlement grant: product capability, subject, source transaction, effective time, expiration or revocation state, and last verified time.
4. Verification receipt: redacted diagnostic metadata sufficient to audit why access was granted without storing raw card data.

Mutable `profile.isPremium`, a profile identifier used as a bearer credential, and a client success page are not authoritative entitlement sources.

## Native purchase requirements

### Apple

- StoreKit 2 product loading and purchase flow.
- App Store Server API or signed transaction verification on the server.
- Restore Purchases and transaction updates.
- Production and sandbox environment separation.
- Refund, revocation, expiration, and family-sharing policy handled explicitly.

### Google Play

- Google Play Billing purchase flow.
- Play Developer API verification on the server.
- Acknowledge purchases only after verification.
- Restore from the user's active Play purchases.
- Cancellation, refund, revocation, grace period, and account-hold handling.

Apple and Google product identifiers remain platform-specific and map to the same internal capability. A receipt from one store must never be submitted to the other verifier.

## Web purchase requirements

Stripe Checkout may remain the web purchase surface, but its webhook-verified event must write through the same billing-subject, transaction-event, and entitlement-grant model as native stores. Soul Codex never receives raw card number, expiration, CVC, or CVV fields.

## Candidate product ladder

| Tier | Included value | Release condition |
|---|---|---|
| Free | Core profile, supported Big 3, date-based numerology, limited Daily synthesis, basic Connections, evidence/provenance, Diamond Way closure | Always available |
| Soul Codex+ Monthly | Current live Plus capability set from the central product-access registry | Durable entitlement, provider verification, restore, cancellation/expiration/revocation, and purchase-surface gates |
| Soul Codex+ Annual | Same live Plus capabilities as Monthly at the annual cadence | Same release conditions as Monthly |

## Current implementation state

The entitlement infrastructure may be merged before sales are activated.

Current phase:
- Free remains fully available.
- Soul Codex+ capability definitions exist.
- Durable billing subjects, immutable provider transaction events, entitlement grants, and redacted verification receipts are the intended authorization source.
- Signed Stripe subscription lifecycle verification may populate the ledger only for configured monthly/annual price IDs.
- Legacy one-time Stripe checkout remains retired.
- Native StoreKit 2 and Google Play Billing purchase initiation and restore are not yet active.
- A configured verification adapter does not imply that purchasing is enabled.

### Web checkout implementation status

The server now contains an authenticated monthly/annual Stripe Checkout session boundary, but activation remains explicitly feature-flagged off by default.

Requirements before enabling `SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED=true`:
- durable PostgreSQL entitlement storage is ready;
- signed subscription webhook verification is configured;
- both monthly and annual Stripe price IDs are configured;
- production `PUBLIC_APP_URL` is valid;
- the request resolves an authenticated server session account;
- sandbox subscription creation, renewal, cancellation, expiration, refund/revocation, and restore/access checks pass;
- the web product has a supported canonical sign-in path.

Native iOS/Android builds must not use this web Stripe switch as a substitute for StoreKit 2 or Google Play Billing.


## Non-negotiable gates

- Additive database migration matches the active schema and has a tested rollback.
- Apple, Google, and Stripe verification reject forged, replayed, mismatched, revoked, and wrong-environment events.
- Restore Purchases works after reinstall on a second device.
- Offline clients use a bounded cached entitlement and fail closed after its allowed verification window.
- Account deletion and privacy export include entitlement-linked personal data without deleting immutable financial audit evidence that lawfully must be retained.
- Free capabilities do not disappear because billing is unavailable.
- App Store and Play disclosures match the final binary and product catalog.

## Release order

1. Reconcile active schema and migrations.
2. Add billing subjects, transaction events, entitlement grants, and verification receipts.
3. Route signed subscription lifecycle verification through the common entitlement service without enabling checkout.
4. Add authenticated monthly/annual web checkout plus StoreKit 2 and Google Play Billing behind disabled feature flags.
5. Prove sandbox purchase, restore, refund/revocation, reinstall, and cross-device behavior.
6. Enable the native catalogs only in a dedicated 4.1 release candidate.
