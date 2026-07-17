# Soul Codex Store Submission Packet

Prepared from the shipped app behavior and repository state on July 17, 2026.

This is the canonical operator checklist for App Store Connect and Google Play Console. Store answers must be rechecked whenever data collection, third-party services, authentication, payments, or native permissions change.

## Product Identity

| Field | Final value |
|---|---|
| App name | Soul Codex |
| iOS bundle ID | `app.soulcodex.ios` |
| Android application ID | `app.soulcodex.main` |
| Version | 1.0.0 |
| Primary category | Lifestyle |
| Secondary iOS category | Entertainment |
| Intended audience | 13+ |
| Production URL | https://soulcodex.up.railway.app |
| Privacy policy | https://soulcodex.up.railway.app/privacy |
| Support | https://soulcodex.up.railway.app/support |
| Account deletion | https://soulcodex.up.railway.app/account-deletion |
| Contact email | `support@soulcodex.app` |
| Privacy email | `privacy@soulcodex.app` |

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
- It is free to start, with no account required for the initial experience.

Soul Codex is intended for self-reflection and entertainment. It does not provide medical, legal, financial, or other professional advice.

### iOS keywords

`astrology,numerology,human design,birth chart,personality,zodiac,compatibility,daily reading`

## Asset Inventory

| Asset | Repository path | Status |
|---|---|---|
| App Store icon | `store-assets/app-store-icon-1024.png` | Ready: 1024×1024 RGB PNG, no alpha |
| Play Store icon | `store-assets/play-store-icon-512.png` | Ready: 512×512 RGB PNG, no alpha |
| Play feature graphic | `store-assets/play-feature-graphic-1024x500.png` | Ready after RGB normalization: 1024×500 PNG, no alpha |
| iPhone screenshots | Not captured | Required |
| Android phone screenshots | Not captured | Required |
| iPad screenshots | Not captured | Required only if iPad remains supported |

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

This draft reflects the July 17, 2026 source and privacy policy. Confirm production logging and provider contracts before submitting it.

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

`*` Some requested profile context or prompts may be processed by contracted AI or infrastructure service providers solely to deliver app functionality. Confirm that each transfer qualifies for Google Play's service-provider exception before selecting “not shared.”

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

The app declares no tracking and no tracking domains. Reconcile this declaration with App Store Connect after the final archive is produced.

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

1. Capture final native screenshots.
2. Complete physical-device testing.
3. Add Apple signing credentials and generate the signed IPA when ready.
4. Enroll in Google Play, create an upload keystore, and generate the signed AAB.
5. Confirm support and privacy email inboxes receive mail.
6. Complete privacy/data-safety and content-rating questionnaires.
7. Run TestFlight and Play internal testing before production submission.
