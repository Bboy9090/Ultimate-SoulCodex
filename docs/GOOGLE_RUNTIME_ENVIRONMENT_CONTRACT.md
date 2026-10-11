# Google Runtime Environment Contract

Repository: `Bboy9090/Ultimate-SoulCodex`
Firebase project: `soul-codex-platform`

All values below belong in Railway/deployment environment settings or mobile build configuration. Never commit service-account JSON, private keys, OAuth secrets, or access tokens.

## Shared flags

```text
FIREBASE_ENABLED=false
GOOGLE_ANALYTICS_ENABLED=false
ADMOB_ENABLED=false
GEMINI_ENABLED=false
TENSORFLOW_ENABLED=false
```

Flags remain false until consent, provider configuration, and release tests pass.

## Firebase identity

```text
FIREBASE_PROJECT_ID=soul-codex-platform
FIREBASE_ANDROID_PACKAGE=soulcodex.app
FIREBASE_IOS_BUNDLE_ID=app.soulcodex.ios
FIREBASE_WEB_APP_ORIGIN=https://soulcodex.up.railway.app
```

## Google Analytics

```text
GOOGLE_ANALYTICS_MEASUREMENT_ID=
```

Analytics events must be suppressed until the user has made the required consent choice. Do not use a caller-declared consent value as proof; bind collection to the app's persisted consent state. Missing, malformed, or cleared consent fails closed to `unset` and blocks collection.

## AdMob

```text
ADMOB_ANDROID_APP_ID=
ADMOB_IOS_APP_ID=
ADMOB_ANDROID_BANNER_UNIT_ID=
ADMOB_IOS_BANNER_UNIT_ID=
ADMOB_ANDROID_REWARDED_UNIT_ID=
ADMOB_IOS_REWARDED_UNIT_ID=
```

Use Google's test ad identifiers during development. Ad serving requires persisted granted consent. Premium entitlement must suppress all ads even when consent is granted and AdMob is enabled.

## Gemini / Vertex

```text
GEMINI_MODEL=
GEMINI_API_KEY=
```

Production keys belong in a provider secret manager and must never be exposed to the client bundle.

## Firebase service credentials

If server-side Firebase Admin access is later required, use a workload identity or provider-managed secret reference. Do not add a service-account JSON file to this repository.
