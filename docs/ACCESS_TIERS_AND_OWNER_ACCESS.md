# Free, Plus and complimentary owner access

Owner decision: October 28, 2026. The app must provide a complete useful Free answer and a clearly separated paid expansion. Bobby also authorizes permanent complimentary Plus for his verified owner account(s), without payment.

| Capability | Free | Plus / approved owner |
|---|---|---|
| Qualified planets, degrees, houses, natal wheel, evidence | Included | Same facts and evidence |
| Per-planet meaning, possible strength, core tradeoff, one practice | Included | Included |
| Expanded per-planet relationship context, decision worksheet, guided reflection | Access explanation only | Available |
| Cosmic interactions, decorative animation, pause, reduced motion | Included | Included |
| Full-name numerology, deeper synthesis, PDF export | Existing capability policy | Available when qualified |
| Human Design depth, advanced transits and other planned features | Not sold | Not sold until independently qualified |

The reading model does not project expanded per-planet fields into Free responses. The interactive system and full reading use the same interpretation capability. A claimed tier without verified provider evidence cannot open Plus. The owner source is a server-resolved exception, not a fake subscription or payment event.

## Permanent owner entitlement

`SOUL_CODEX_OWNER_USER_IDS` is a server-only JSON array of up to ten verified Soul Codex user UUIDs. The default is empty. An authenticated session must resolve to an existing user whose exact UUID is configured. Matching a display name or email never grants access; malformed configuration and wildcards fail closed. Account deletion removes access because the user must still exist.

An approved owner receives `source: owner`, `status: complimentary_lifetime`, `plan: null`, and `expiresAt: null`. All live Plus capability checks use that same entitlement. This does not enable billing, authorize administrative privileges, or change subscription expiry/refund rules for other users. Removing the server-side owner entry revokes the complimentary entitlement. Offline access retains the existing bounded in-memory verification cache; it does not trust a permanent local flag.

No actual owner UUID is committed to source control. Account references are shown only to signed-in users in Settings. An operator must bind the grant to verified account records before production activation. Do not ask for or retain Apple/Google passwords.

## Identity boundary

The inspected canonical app currently implements Apple sign-in. Google account sign-in is not implemented; Google Play purchase verification is a different service and must not be presented as Google authentication. Do not claim Apple and Google accounts are linked, or merge accounts by matching email. A future Google login must verify its signed ID token, audience, issuer, expiry and stable subject and explicitly link or separately approve the resulting account before claiming the same owner access.

This branch prepares the owner entitlement but leaves the allowlist empty and production unchanged. Activation and Google sign-in remain blocked until the relevant account identities/configuration are verified. Existing signed subscription paths and native billing flags remain unchanged.
