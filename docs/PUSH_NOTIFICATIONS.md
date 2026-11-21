# Phone push notifications (Soul Circle) — server side

Status: **server side merged (dormant); app-side JavaScript lane built behind a switch; native plugin,
console steps and a new store build still open.** Nothing has been verified against Apple or Google.

## What exists

- `server/lib/push-delivery.ts`: configuration check, Firebase Cloud Messaging (FCM v1) sender, and
  `createPushService`. Service-account sign-in uses Node's `crypto` (no new dependency).
- `server/routes/soul-circle.ts`: `GET /api/soul-circle/push/status`,
  `POST /api/soul-circle/push/register`, `POST /api/soul-circle/push/unregister`.
- `push_devices` table (`migrations/0006_push_devices.sql`, also ensured at container start by
  `scripts/ensure-public-share-schema.mjs`).

## App side (JavaScript lane, behind a switch)

- `client/src/lib/phoneAlerts.ts`: opt-in, token registration, launch refresh, sign-out cleanup,
  alert-tap routing (only ever opens `/circle`).
- `client/src/components/PhoneAlertsCard.tsx` (Soul Circle page), `PhoneAlertsBootstrap.tsx`
  (mounted in `App.tsx`), cleanup hooks in `SettingsPage.tsx` (sign-out and "clear data from this device") and `AccountDeletionPage.tsx`, each run before the saved choice is wiped.
- The native plugin is reached through `registerPlugin("FirebaseMessaging")`, so this code builds and
  runs with or without the plugin in the native project.

The switch has three conditions, all required before anything is shown or requested: native iOS/Android,
a build that contains the `FirebaseMessaging` plugin, and the server reporting `available: true`
(i.e. the three Railway variables are set). On the web, in a build without the plugin, or with the
server unconfigured, the card is not rendered and nothing is sent.

Behavior: turning on asks for notification permission, then registers this device's token. Turning off
(or signing out) removes only this device's token and deletes the OS token. Launch re-registers a
rotated token only for the account that opted in on this device and never prompts. A different account
on the same phone is not enrolled. If the server is temporarily unconfigured, the saved choice is kept so
the device can still be revoked later.

## Native steps still needed (not done, not verifiable from the Linux sandbox)

1. `npm install @capacitor-firebase/messaging@8` and `npx cap sync`; confirm `CapApp-SPM/Package.swift`
   and the Android project pick it up and both still build.
2. iOS: add the `aps-environment` entitlement, add `GoogleService-Info.plist` from the CI secret, and
   follow the plugin's AppDelegate setup (`FirebaseApp.configure()` and APNs token forwarding), guarded so a
   build without the plist cannot crash at launch.
3. Android: add `google-services.json` from the CI secret (`android/app/build.gradle` already applies the
   Google services plugin only when the file exists) and confirm the Android 13+ notification permission.
4. Test on real devices: permission prompt, token registration, delivery, tap opens Soul Circle, sign-out
   stops alerts, and APNs delivery through Firebase.

## When a phone is alerted

Only when a new in-app update is really created for that person:

- a friend accepts their invite (`friend_joined`), and
- a friend starts or resumes sharing with them (`friend_shared`).

Not on invite creation, changed sharing selections, stopping sharing, removal or blocking.
Delivery is fire-and-forget: a slow or failing provider never delays or fails the request.

## Privacy contract

- The message is the constant **"Soul Circle — You have a new Soul Circle update."** with deep link
  `/circle`. No function accepts a name, sign or chart data, so none can reach Apple or Google.
- A device token belongs to one account (registering it elsewhere moves it), is capped at ten per
  account, is deleted with the account, and is never returned by any API or written to logs.
- Tokens are refused (`409 push_unavailable`) until delivery is configured, so nothing is collected
  that cannot be used. Tokens Google reports as unregistered or invalid are deleted automatically.
- Privacy policy and store privacy answers must mention device tokens **before** the native build ships.

## Switching it on (owner steps; secrets never go in the repo)

Environment variables on the deployment (Railway):

| Name | Value |
| --- | --- |
| `FIREBASE_ENABLED` | `true` |
| `FIREBASE_PROJECT_ID` | `soul-codex-platform` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full service-account JSON, stored as a **secret** |

If enabled but misconfigured (missing id/secret, bad JSON, project mismatch, unexpected `token_uri`),
push stays off and one line naming the reason (never the key) is logged at startup. Note
`FIREBASE_ENABLED` is shared with `server/lib/integration-config.ts`.

Console work still needed for the native apps: an APNs key uploaded to Firebase, the iOS and
Android Firebase apps, the generated config files supplied from CI secrets, and the iOS
`aps-environment` entitlement. Then the client needs `@capacitor/push-notifications`, a "phone alerts"
toggle calling register/unregister (and unregister on sign-out), and a new store release.

## Validation actually run

- `tests/phone-alerts.test.ts` (7): switch visibility, permission flow, failure states, device-only
  removal, offline disable, sign-out, launch refresh account scoping, tap-route allowlist. Plugin and
  API are fakes. `vite build` and the PWA output validator pass; `tsc` clean.

- `tests/push-delivery.test.ts` (7): configuration resolution, constant message, RS256 JWT structure
  and signature verified against a throwaway key, token caching/refresh, error classification,
  re-auth once, dead-token removal, no tokens in logs. Network is a fake.
- `tests/push-routes.test.ts` (9 scenarios per backend): auth, 409 when unavailable, validation,
  token reassignment, cap of ten, unregister rules, account deletion, trigger rules, provider failure
  isolation. Run on MemStorage and on local PostgreSQL 16 (18/18 together with the existing 42
  Soul Circle scenarios: 60/60).
- Migration `0006` applied to an empty database; schema script run on a fresh database.

## Not verified

- Real delivery to Google/Apple (unreachable from the build sandbox; no credentials exist).
- Everything on a real device: the native plugin, permission prompt, token refresh, delivery and tap routing.
- Production database behavior.
