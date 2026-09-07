# Soul Codex Store Submission Packet

Prepared from the shipped app behavior and Android Google Play release-candidate state on September 7, 2026.

This is the canonical operator checklist for App Store Connect and Google Play Console. Store answers must be rechecked whenever data collection, third-party services, authentication, payments, native permissions, AI behavior, or release identity changes.

## Product Identity

| Field | Final value |
|---|---|
| App name | Soul Codex |
| iOS bundle ID | `app.soulcodex.ios` |
| Android application ID | `app.soulcodex.main` |
| Android version name | `4.0.0-rc.4` |
| Android version code | `4000004` |
| Android target SDK | `36` |
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

Not a pile of disconnected horoscopes. One integrated reading that explains how you think, react, and relate while keeping supported facts, symbolic interpretation, and uncertainty distinct.

What you get:

- Your Soul Archetype — one identity synthesis across supported systems
- Sun, Moon, and Rising sign analysis when the required birth inputs and verification evidence are available
- Life Path number and personal-year timing
- Human Design and other symbolic-system context only where the release contract supports it
- Daily personalized guidance based on your available profile context
- Compatibility readings showing where two people naturally match or clash
- An AI-assisted Soul Guide that answers questions using your available profile context and evidence boundaries
- An in-app AI safety report control for generated output that should be reviewed

How it works:

1. Enter your birth data. Date is required; time and location improve precision.
2. Answer a few questions about decisions, stress, energy, and relationships.
3. Soul Codex blends the supported systems into one reading.
4. Explore your archetype, patterns, timing, compatibility, and growth direction.

What makes it different:

- It clearly labels uncertainty instead of guessing when birth details are missing.
- It synthesizes multiple systems instead of presenting disconnected results.
- It uses direct language instead of burying the reading in jargon.
- It is free to start, with no account required for the initial local-first experience.
- AI-generated output can be reported from inside the app for developer safety review.

Soul Codex is intended for self-reflection and entertainment. It does not provide medical, legal, financial, or other professional advice.

### iOS keywords

`astrology,numerology,human design,birth chart,personality,zodiac,compatibility,daily reading`

## Asset Inventory

| Asset | Repository path | Status |
|---|---|---|
| App Store icon | `store-assets/app-store-icon-1024.png` | Ready: 1024×1024 RGB PNG, no alpha |
| Play Store icon | `store-assets/play-store-icon-512.png` | Ready: 512×512 RGB PNG, no alpha |
| Play feature graphic | `store-assets/play-feature-graphic-1024x500.png` | Ready: 1024×500 PNG |
| Screenshot drafts | `store-assets/screenshots/` | Present, but current presentation images use live-web captures |
| Final Android phone screenshots | Not captured | Required from exact native Android release candidate |
| iPad screenshots | Not captured | Required only if iPad remains supported |

## Android Screenshot Capture Plan

Use real screens from the exact signed/native Android release candidate. Do not place claims in the artwork that the shipped build cannot demonstrate.

| Order | Screen | Caption |
|---|---|---|
| 1 | Create profile | Know How You're Wired |
| 2 | Profile / reading | One Blueprint. Every System. |
| 3 | Timeline | Your Daily Signal |
| 4 | Compatibility | See Where You Match — and Clash |
| 5 | Soul Guide / AI safety-capable surface | Ask From Your Actual Profile |

Capture at least five portrait phone screenshots. Avoid real names, email addresses, precise birth details, private journal content, or real AI-safety reports in the demo profile.

## Google Play Data Safety Draft

This draft reflects the September 7, 2026 Android rc.4 source. Confirm production logging, provider contracts, the final merged manifest, and the exact signed AAB before submitting it.

### High-level answers

| Question | Draft answer |
|---|---|
| Does the app collect or share required user-data categories? | Yes, it collects data needed for app functionality and user-requested server-backed features. |
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
| Other user-generated content | Yes | No* | Profile context, compatibility inputs, Soul Guide prompts, and user-submitted AI safety reports |
| App interactions | Yes | No | Session/usage history needed to operate and improve app functionality |
| Diagnostics | Yes | No* | Request logs, error details, and operational safety-report records used for security, moderation, and troubleshooting |

`*` Some requested profile context or prompts may be processed by contracted AI or infrastructure service providers solely to deliver app functionality. Confirm that each transfer qualifies for Google Play's service-provider exception before selecting “not shared.”

### AI-generated content safety

- The Android release exposes an in-app `Report AI output` control.
- Reports are categorized as offensive/hateful, sexual/inappropriate, dangerous/harmful, self-harm concern, misleading/fabricated, privacy concern, or other.
- A report requires the user to submit the AI response or relevant excerpt and may include optional details.
- The report endpoint is `/api/ai-content-report` and returns a unique report ID.
- The release validator fails if the report UI or report endpoint disappears.

### Not currently collected for the native store app

- Advertising data
- Contacts or address book
- Photos or videos
- Audio files or voice recordings
- Precise/live device location
- Health or fitness data
- SMS or call logs
- Payment card or bank information in the native app
- Native in-app purchase history in rc.4

## App Store Privacy Draft

The checked-in `PrivacyInfo.xcprivacy` currently declares linked, non-tracking categories for app functionality. Reconcile the Apple declaration independently from this Android rc.4 packet before the final iOS archive is submitted.

## Content Rating Draft

- Target age: 13+
- No gambling or contests
- No simulated gambling
- No graphic violence
- No sexual content or nudity supplied by the app
- No unrestricted public user-to-user communication
- AI-generated self-reflection content is present
- Metaphysical and horoscope-style material is present

Complete the live Google Play questionnaire from the final shipped behavior; the store determines the final rating.

## Remaining Google Play Gates

1. Complete exact-head AWS Android build validation for rc.4.
2. Produce the production-signed AAB using the governed upload keystore.
3. Verify the AAB signature, SHA-256, versionName `4.0.0-rc.4`, versionCode `4000004`, target SDK 36, and final merged manifest.
4. Capture final native Android screenshots from that exact candidate.
5. Verify the production privacy, support, and account-deletion URLs over public HTTPS.
6. Complete Play Data Safety and content-rating questionnaires from the exact release binary.
7. Confirm Google Play developer identity/package-registration status for `app.soulcodex.main`.
8. Complete any account-specific closed-testing and production-access requirement.
9. Run the exact release candidate on physical Android devices before production submission.
