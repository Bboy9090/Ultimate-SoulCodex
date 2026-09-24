# Soul Codex Store Submission Packet

Updated September 7, 2026 from the current shipped app behavior and repository state.

This is the canonical operator checklist for App Store Connect and Google Play Console. Store answers must be rechecked whenever data collection, third-party services, authentication, payments, or native permissions change.

## Product Identity

| Field | Final value |
|---|---|
| App name | Soul Codex |
| iOS bundle ID | `app.soulcodex.ios` |
| Android application ID | `app.soulcodex.main` |
| iOS version | 4.0.0 |
| iOS build | 4000003 |
| Primary category | Lifestyle |
| Secondary iOS category | Entertainment |
| Intended audience | 13+ |
| Production URL | https://soulcodex.up.railway.app |
| Privacy policy | https://soulcodex.up.railway.app/privacy |
| Support | https://soulcodex.up.railway.app/support |
| Account deletion | https://soulcodex.up.railway.app/account-deletion |
| Contact email | `support@soulcodex.app` |
| Privacy email | `privacy@soulcodex.app` |

## App Review Access Contract

- The core guest experience does **not** require account registration or sign-in.
- Optional account functionality exists for account-based persistence and related server-backed features. Do not tell App Review that Soul Codex has no account system.
- A reviewer can launch the app, create a local profile, and access the primary guest experience without credentials.
- Online astronomy verification is optional. When selected, the app may transmit the birth date, birth time, and user-entered birth location required for chart/timezone calculation.
- Birth location is user-entered chart data, not live device GPS location.
- The production backend is hosted on Railway.
- User-requested AI functionality may use configured AI service providers. Current production configuration supports Gemini and Groq, with application fallback behavior where applicable.
- Sign in with Apple is optional and is not required for the core guest experience.
- The submitted iOS build does not initiate an external checkout for digital premium features. Existing server-side premium entitlements may be recognized when available.
- If App Review needs to inspect an entitlement-only feature, provide an appropriate review entitlement/account instead of directing the reviewer to external purchase.

See `docs/APP_STORE_REVIEW_NOTES_2026-09-07.md` for the current review-response template.

## Final Store Copy

### Subtitle — iOS

`Know How You're Wired`

### Promotional text — iOS

`One clear blueprint across astrology, numerology, Human Design, daily timing, compatibility, and behavioral patterns.`

### Short description — Google Play

`Astrology, numerology, and Human Design synthesized into one clear reading.`

### Full description

Soul Codex maps your personality patterns using astrology, numerology, Human Design, timing, and behavioral analysis — in plain language you can actually use.

Not a pile of disconnected horoscopes. One sharp, integrated reading that explains how you think, react, and relate.

What you get:

- Your Soul Archetype — one identity synthesis across multiple systems
- Sun, Moon, and Rising sign analysis
- Life Path number and personal-year timing
- Human Design type, authority, and profile
- Daily personalized guidance based on your chart and current timing
- Compatibility readings showing where two people naturally match or clash
- An AI Soul Guide that answers questions using your profile context

How it works:

1. Enter your birth data. Date is required; time and location improve precision.
2. Answer a few questions about decisions, stress, energy, and relationships.
3. Soul Codex blends the systems into one reading.
4. Explore your archetype, patterns, daily signal, compatibility, and growth direction.

What makes it different:

- It clearly labels uncertainty instead of guessing when birth details are missing.
- It synthesizes multiple systems instead of presenting disconnected results.
- It uses direct language instead of burying the reading in jargon.
- It is free to start, with no account required for the core guest experience.

Soul Codex is intended for self-reflection and entertainment. It does not provide medical, legal, financial, or other professional advice.

### iOS keywords

`astrology,numerology,human design,birth chart,personality,zodiac,compatibility,daily reading`

## Asset Inventory

| Asset | Repository path | Status |
|---|---|---|
| App Store icon | `store-assets/app-store-icon-1024.png` | Ready: 1024×1024 RGB PNG, no alpha |
| Play Store icon | `store-assets/play-store-icon-512.png` | Ready: 512×512 RGB PNG, no alpha |
| Play feature graphic | `store-assets/play-feature-graphic-1024x500.png` | Ready after RGB normalization: 1024×500 PNG, no alpha |
| iPhone screenshots | Verify against final submitted build | Required |
| Android phone screenshots | Verify against final submitted build | Required |
| iPad screenshots | Required only if iPad remains supported | Conditional |

## Screenshot Capture Plan

Use real screens from the final native build. Do not place claims in the artwork that the app cannot demonstrate.

| Order | Screen | Caption |
|---|---|---|
| 1 | Onboarding / start | Know How You're Wired |
| 2 | Profile / blueprint | One Blueprint. Every System. |
| 3 | Today | Your Daily Signal |
| 4 | Compatibility | See Where You Match — and Clash |
| 5 | Soul Guide | Ask From Your Actual Profile |

Capture at least five portrait phone screenshots. Avoid real names, email addresses, precise birth details, or private journal content in the demo profile.

## Google Play Data Safety Draft

Confirm production logging and provider contracts before submitting or changing these answers.

### High-level answers

| Question | Draft answer |
|---|---|
| Does the app collect or share required user-data categories? | Yes, it collects data needed for app functionality. |
| Is all user data encrypted in transit? | Yes, production traffic uses HTTPS. |
| Can users request deletion? | Yes, in Settings and through the public deletion URL. |
| Is data used for advertising? | No. |
| Is data used for tracking across apps or websites? | No. |
| Is collected data sold? | No. |

### Data categories

| Play category | Collected | Shared | Purpose / notes |
|---|---:|---:|---|
| Name | Yes | No* | Optional profile identity and app functionality |
| Email address | Yes | No* | Optional account, authentication, support, and deletion verification |
| User IDs | Yes | No* | Account or anonymous session operation |
| Approximate location | Yes | No* | User-entered birth location for chart calculation; not live device location |
| Other personal information | Yes | No* | Birth date/time and behavioral responses used for personalized readings |
| Other user-generated content | Yes | No* | Journal, profile context, compatibility inputs, and Soul Guide prompts |
| App interactions | Yes | No | Session/usage history needed to operate and improve app functionality |
| Diagnostics | Yes | No* | Request logs and error details used for security and troubleshooting |

`*` Some requested profile context or prompts may be processed by contracted AI or infrastructure service providers solely to deliver app functionality. Confirm that each transfer qualifies for the applicable store service-provider treatment before selecting “not shared.”

### Not currently collected for the native store app

- Advertising data
- Contacts or address book
- Photos or videos
- Audio files or voice recordings
- Precise/live device location
- Health or fitness data
- SMS, call logs, or device contacts
- Payment card or bank information
- In-app purchase history from a native store purchase flow

## App Store Privacy Draft

The checked-in `PrivacyInfo.xcprivacy` currently declares these linked, non-tracking categories for app functionality:

- Name
- Email address
- User ID
- Coarse location
- Sensitive information
- Other user content

The app declares no tracking and no tracking domains. Reconcile this declaration with App Store Connect after the final archive is produced and whenever collection behavior changes.

## Content Rating Draft

- Target age: 13+
- No gambling or contests
- No simulated gambling
- No graphic violence
- No sexual content or nudity supplied by the app
- No unrestricted public user-to-user communication
- AI-generated spiritual and self-reflection content is present
- Metaphysical themes and horoscope-style material are present

Complete the live questionnaires from the final shipped behavior; the stores determine the final rating.

## Remaining Gates

1. Confirm the physical-device walkthrough uses the exact submitted TestFlight build.
2. Confirm the screen recording satisfies App Review's requested OS/device requirement.
3. Re-test optional Sign in with Apple against the production backend.
4. Re-test Compatibility, Moon/Rising online verification, Soul Guide, support, privacy, and account-deletion paths.
5. Reconcile App Store Connect privacy answers against the current iOS privacy manifest.
6. Keep unfinished or unverified deep-system features unavailable rather than presenting simulated results.
7. Do not upload a new binary during an active information-request review unless a binary-level defect requires it.
