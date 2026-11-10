# Soul Codex Store Submission Packet

Maintained for Soul Codex 4.1.0. Product contracts and suggested copy are versioned here; store-console and binary status must be read from dated provider receipts, not assumed from this packet.

Release authority is intentionally not hard-coded in this document. At submission time, use the exact-head GitHub Actions release receipt/artifact for the candidate being uploaded and verify its SHA matches the signed binary and deployed backend identity.

This is the canonical operator checklist for App Store Connect and Google Play Console. Store answers must be rechecked whenever data collection, third-party services, authentication, payments, or native permissions change.

## Product Identity

| Field | Final value |
|---|---|
| App name | Soul Codex |
| iOS bundle ID | `app.soulcodex.ios` |
| App Store numeric ID | `6764221944` |
| Android application ID | `soulcodex.app` |
| Android release | 4.1.0 / versionCode 4000016 |
| iOS source project release | 4.1.0 / build 4000014 (source setting) |
| Primary category | Lifestyle |
| Secondary iOS category | Entertainment |
| Intended audience | 13+ |
| Backend/runtime origin | Railway deployment — qualification tracked separately from store-review URLs |
| Privacy policy | https://bboy9090.github.io/Ultimate-SoulCodex/privacy/ |
| Support | https://bboy9090.github.io/Ultimate-SoulCodex/support/ |
| Account deletion | https://bboy9090.github.io/Ultimate-SoulCodex/account-deletion/ |
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

Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

### iOS keywords

`astrology,numerology,human design,birth chart,personality,zodiac,compatibility,daily reading`

## iOS subscription metadata gate

Include the Terms of Use (EULA) link above in the App Description for every enabled App Store localization. Verify that the saved live description contains the link before submitting or resubmitting an app with auto-renewable subscriptions. A privacy-policy URL alone does not satisfy this requirement.

Apple's October 24, 2026 Guideline 3.1.2 rejection identified this exact missing metadata. The live English (U.S.) description was corrected on October 28 and build 346 was resubmitted. Future uploads must preserve the correction. If custom terms are introduced, configure the custom EULA in App Store Connect and reconcile this packet before submission.

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

This draft reflects the final release line and the checked-in privacy policy. Confirm the live Play Console wording against current production behavior before submitting it.

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
| Email address | Yes | No* | Optional account, Apple/Google/email authentication, support, and deletion verification |
| User IDs | Yes | No* | Account or anonymous session operation |
| Approximate location | Yes | No* | User-entered birth location for chart calculation; not live device location |
| Other personal information | Yes | No* | Birth date/time and behavioral responses used for personalized readings |
| Other user-generated content | Yes | No* | Journal, profile context, compatibility inputs, and Soul Guide prompts |
| App interactions | Yes | No | Session/usage history needed to operate and improve app functionality |
| Diagnostics | Yes | No* | Request logs and error details used for security and troubleshooting |
| Purchase history | Yes | No* | Store or hosted-payment transaction and subscription state used for entitlement verification, restore, refunds/revocations, fraud prevention, and support |

`*` Google or Apple may process sign-in data when the user explicitly selects those identity-provider buttons. Some requested profile context or prompts may also be processed by contracted AI or infrastructure service providers solely to deliver app functionality. Confirm that each transfer qualifies for Google Play's service-provider exception before selecting “not shared.”

### Not currently collected for the native store app

- Advertising data
- Contacts or address book
- Photos or videos
- Audio files or voice recordings
- Precise/live device location
- Health or fitness data
- SMS, call logs, or device contacts
- Payment card or bank information

## Public Apple privacy-category reconciliation — November 10, 2026

A fresh public App Store listing inspection shows **Data Linked to You**, including
**Location → Precise Location** under both personalization and app functionality.
This **conflicts with the checked-in declaration that the native app does not
collect precise/live device location**. The public metadata is not evidence that
the binary actually accesses device GPS. Do not blindly add a precise-location
permission or change the store declaration to match it: inspect the submitted
binary, installed plugins, network payloads, and App Store Connect responses,
then remove any inaccurate category or amend app disclosures with evidence.

The public listing also continues to link the older Railway privacy route and
displays a 9+ badge. The documented 13+ audience is product intent; Apple owns
the age-rating decision. **All three items require live App Store Connect
reconciliation**, separately from Google Play tester participation. The
public read-only audit records observed differences, not an approval verdict.

## App Store Privacy Draft

Live-storefront reconciliation receipt: [V4_1_APP_STORE_LIVE_DISCLOSURE_READINESS_2026-10-13.md](../governance/release-audits/V4_1_APP_STORE_LIVE_DISCLOSURE_READINESS_2026-10-13.md). That receipt records public storefront observations only and does not claim private App Store Connect product state.

The checked-in `PrivacyInfo.xcprivacy` currently declares these linked, non-tracking categories for app functionality:

- Name
- Email address
- User ID
- Coarse location
- Sensitive information
- Other user content
- Purchase history

The app declares no tracking and no tracking domains. Reconcile this declaration with App Store Connect after the final archive is produced. The live App Store privacy answers must not remain at “Data Not Collected” for a 4.1 build that transmits account/profile information or receives purchase/subscription state.

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

## Current Release Evidence

- Final candidate SHA: take this from the successful exact-head Store Candidate / hardening receipt immediately before submission; do not copy a historical SHA from this document.
- Railway production deployment: verify the live `/health` release SHA matches that exact candidate before submission.
- Static store-review legal/support host: `bboy9090.github.io/Ultimate-SoulCodex` (GitHub Pages, HTTPS verified)
- Android 4.1.0 / versionCode `4000016`: uploaded to Google Play **Alpha closed testing** on November 8, 2026, according to the release tracker and Play edit receipt. This is not a production release. New signed Store Candidate artifacts built from later commits do not automatically replace the uploaded closed-test binary.
- Android release artifact ID and AAB checksum: take these from the successful exact-head GitHub Actions artifact/receipt; do not hard-code them into the source tree because the release payload embeds the source SHA.
- Android app-owned manifest requests `android.permission.INTERNET`; merged store builds also include framework/billing permissions such as network state, Play Billing/license, and an app-scoped dynamic-receiver permission. `READ_CONTACTS` and `WRITE_CONTACTS` are explicitly removed from the merged manifest; Android contact import falls back to manual entry.
- iOS simulator Release and generic-device archive qualification: passed
- App Store listing: Soul Codex, numeric ID `6764221944`
- Google Play developer account: active at `harebugz23@gmail.com`
- Google Play publishing uses a separate **keyless Workload Identity Federation** publisher. It does not require a long-lived `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` key. The publishing workflow must preserve its closed-test/explicit-release boundaries; a green build does not authorize or prove a production upload.

## Remaining Store-Owner Gates

These are outstanding qualification steps, **not instructions to recreate the app or re-upload an already committed Alpha release**.

1. Capture final Android phone screenshots from an actual approved build and verify the screenshot content matches the submitted binary.
2. Complete physical-device Android onboarding, sign-in, offline, entitlement and navigation smoke tests. Native purchase/restore requires its own provider-backed qualification before enabling billing.
3. In Play Console, verify the **existing** `soulcodex.app` Alpha closed-test release `4000016`, preserve its actual binary/track receipt and confirm the currently published test listing metadata. Do not confuse a later successful CI Store Candidate with an automatically uploaded Play release.
4. Reconcile Play Data Safety, app access, content rating, target audience, ads, and privacy declarations against the exact active release and provider contracts.
5. Maintain the verified GitHub Pages privacy, support and account-deletion URLs. Backend/runtime qualification remains independent of the legal-host status.
6. Complete the Play Console production-access qualification required for this account through genuine opted-in participation and qualifying duration. The latest provider-confirmed count on November 8 was **1 opted-in tester**; a configured tester email list is not an opt-in count. This external gate must not block independent code/metadata/QA improvements.
7. Apply for production access and obtain an explicit production release approval only after the Console eligibility and native payment/device gates are satisfied; do not let CI auto-promote an Alpha build.
8. For Apple, reconcile live App Store Connect privacy, age-rating, support URL, EULA and subscription metadata using the exact iOS submission candidate; retain screenshots/receipts. Use its Apple-managed Xcode Cloud archive and record the actual App Store Connect build counter separately from the checked-in `4000014` setting.
9. Preserve exact release-candidate SHA, signed binary checksum, provider upload ID, track, and store acceptance in the release ledger whenever a *new* candidate is intentionally submitted.


## Soul Codex+ 4.1 subscription catalog

The exact operator handoff for creating and qualifying the paid catalog is
[`docs/SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md`](SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md).

Do not mark the subscription catalog complete merely because identifiers are documented. Store products, prices, provider credentials, sandbox evidence, and production activation are separate release evidence classes.
