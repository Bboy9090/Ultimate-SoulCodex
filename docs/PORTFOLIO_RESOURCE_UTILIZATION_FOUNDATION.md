# Portfolio Resource Utilization Foundation

Status: planned integration contract. Production activation remains disabled until provider credentials, consent configuration, and test evidence exist.

## Principles

- Use paid services for measurable product work.
- Keep verified astrology, Human Design, numerology, and astronomy calculations authoritative.
- AI may personalize presentation, recommendations, and assistance; it must not fabricate verified chart facts.
- Keep provider credentials in deployment secrets, never in source.
- Every provider integration must have a kill switch, telemetry, privacy review, and a documented fallback.

## Shared platform lanes

### Google / Firebase

- Authentication and account identity
- Analytics events for activation, retention, subscriptions, ads, and feature usage
- Crashlytics for iOS and Android crash evidence
- Remote Config for safe feature flags and experiments
- App Check for abuse resistance
- Cloud Storage for user-created cards, reports, covers, and media
- BigQuery export for product and revenue analysis
- AdMob for the free tier only, with verified premium ad suppression
- Gemini / Vertex AI for assisted explanations and recommendations
- Speech-to-Text and Text-to-Speech for Sonic Codex and accessibility

### AWS

- CodeBuild for reproducible CI where already configured
- S3 for release artifacts and large media
- CloudFront for distribution of stable public assets
- Secrets Manager / KMS for protected credentials and signing material
- CloudWatch for operational logs, metrics, and alarms
- Lambda or ECS only where a workload is justified by measured traffic or job duration

### Product-specific ownership

- Soul Codex: shared identity, analytics, crash reporting, remote configuration, AI gateway, ads, and subscription telemetry.
- Kai-Jax: game identity, cloud saves, asset delivery, gameplay telemetry, and future adaptive systems.
- Alazai's Palace: mobile client foundation, player inventory, farming timers, social data, and future recommendation models.
- BootForge / PhoenixCore: signed release artifacts, verification receipts, CI evidence, and operational monitoring.
- Sonic Codex: audio uploads, transcription, speaker labels, synthesis, and protected media storage.
- Books / comics / theater showcase: asset cataloging, previews, delivery, YouTube distribution, and production analytics.

## Initial activation order

1. Provider inventory and account/project IDs.
2. Shared environment configuration and kill switches.
3. Analytics event contract.
4. Crash/error telemetry.
5. Secure storage and artifact ownership.
6. AI gateway observability and budget limits.
7. AdMob free-tier lane.
8. TensorFlow/Flutter lanes after the shared contracts are stable.

## Required evidence before production activation

- Provider project/account ownership confirmed.
- Privacy and consent behavior tested.
- Test identifiers used in development.
- No secrets committed.
- Offline and provider-failure fallbacks verified.
- Billing and premium entitlement tests confirm ad suppression.
- Cost alerts and budget limits configured.
