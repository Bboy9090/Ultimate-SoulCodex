# Portfolio Resource Utilization Foundation

Status: Google-only integration lane. Production activation remains disabled until provider credentials, consent configuration, and test evidence exist. AWS is intentionally paused.

## Principles

- Use paid Google services for measurable product work.
- Keep verified astrology, Human Design, numerology, and astronomy calculations authoritative.
- AI may personalize presentation, recommendations, and assistance; it must not fabricate verified chart facts.
- Keep provider credentials in deployment secrets, never in source.
- Every provider integration must have a kill switch, telemetry, privacy review, and a documented fallback.

## Google / Firebase lane

- Firebase Authentication and account identity
- Firebase Analytics events for activation, retention, subscriptions, ads, and feature usage
- Crashlytics for iOS and Android crash evidence
- Remote Config for safe feature flags and experiments
- App Check for abuse resistance
- Cloud Storage for user-created cards, reports, covers, and media
- BigQuery export for product and revenue analysis
- AdMob for the free tier only, with verified premium ad suppression
- Gemini / Vertex AI for assisted explanations and recommendations
- Speech-to-Text and Text-to-Speech for Sonic Codex and accessibility
- Google Play services for Android identity, achievements, leaderboards, and cloud saves
- YouTube Data API for trailers, readings, and the Bobby Blanco theater showcase
- Drive APIs for controlled production asset workflows

## Product-specific ownership

- Soul Codex: identity, analytics, crash reporting, remote configuration, AI gateway, ads, and subscription telemetry.
- Kai-Jax: game identity, cloud saves, asset delivery, gameplay telemetry, and future adaptive systems.
- Alazai's Palace: mobile client foundation, player inventory, farming timers, social data, and future recommendation models.
- Sonic Codex: audio uploads, transcription, speaker labels, synthesis, and protected media storage.
- Books / comics / theater showcase: asset cataloging, previews, delivery, YouTube distribution, and production analytics.

## Initial Google activation order

1. Google project and Firebase project inventory.
2. Shared environment configuration and kill switches.
3. Consent and privacy boundary.
4. Analytics event contract.
5. Crashlytics and error telemetry.
6. Secure Storage and App Check.
7. Gemini gateway observability and budget limits.
8. AdMob free-tier lane.
9. BigQuery and Looker reporting.
10. YouTube, Drive, Speech, and media workflows.
11. TensorFlow/Flutter lanes after the shared contracts are stable.

## Configuration readiness gate

Run `npm run validate:integrations` before enabling provider flags in a deployment.

The gate reports only provider status, missing environment-variable names, and policy blockers. It does not print credential values. Disabled providers pass safely. An explicitly enabled provider fails closed when its runtime contract is incomplete. AWS remains policy-blocked by this portfolio plan even if an AWS region is configured.

A passing configuration gate does **not** mean production activation is approved. The report deliberately returns `claimsProductionActivationReady: false` because privacy, consent, fallbacks, entitlements, ownership, and cost controls require independent evidence.

## Persisted telemetry-consent gate

Telemetry collection is fail-closed. Missing, malformed, or cleared consent resolves to `unset`, which blocks Analytics and AdMob.

Only a persisted `granted` choice can make Analytics eligible to collect when the Analytics provider itself is enabled. AdMob additionally requires the free tier: premium entitlement suppresses ads even when consent is granted and the provider is configured.

A caller-declared boolean, route parameter, or in-memory request value is not accepted as proof of consent. Collection decisions must derive from the persisted consent state.

## Required evidence before production activation

- Google project ownership confirmed.
- Privacy and persisted-consent behavior tested.
- Test identifiers used in development.
- No secrets committed.
- Offline and provider-failure fallbacks verified.
- Billing and premium entitlement tests confirm ad suppression.
- Cost alerts and budget limits configured.
