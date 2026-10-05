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

## Required evidence before production activation

- Google project ownership confirmed.
- Privacy and consent behavior tested.
- Test identifiers used in development.
- No secrets committed.
- Offline and provider-failure fallbacks verified.
- Billing and premium entitlement tests confirm ad suppression.
- Cost alerts and budget limits configured.
