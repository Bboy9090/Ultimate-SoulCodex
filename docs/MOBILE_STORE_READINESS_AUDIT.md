# Mobile Store Readiness Audit

Audit date: 2026-07-16

## Scope

Code-side preparation for the Apple App Store and Google Play while preserving the existing web entitlement model. Native store builds are consumption-only: they recognize an existing server entitlement but do not sell premium access or redeem access codes.

## Findings and Remediation

| Area | Before | Remediation | Verification |
|---|---|---|---|
| Account deletion | API existed, but anonymous session records were not fully purged and persistent deletion could violate foreign-key order | Added complete session purge, entitlement-redemption removal, and ordered journal/share-link deletion; added a confirmed in-app deletion screen | Server smoke test and manual UI test required |
| Public deletion path | No user-facing route | Added `/account-deletion` with in-app deletion and a verified-ownership email request path | Deploy and verify public HTTPS URL |
| Support URL | Store metadata named `/support`, but no route existed | Added `/support` with support, privacy, terms, and deletion links | Deploy and verify public HTTPS URL |
| Native premium policy | Access-code redemption remained reachable through `/pricing`; premium walls used purchase language | Native runtime hides web pricing, disables code redemption, and uses entitlement/help language; web behavior is unchanged | Native UI walkthrough required |
| Native API origin | Store builds could fall back to the WebView origin | Both workflows require an HTTPS `VITE_API_URL`; validation rejects missing, invalid, or localhost origins | `npm run mobile:validate:*` |
| iOS archive workflow | Referenced a missing CocoaPods workspace and lacked a valid shared scheme | Uses the checked-in SPM Xcode project and shared `Soul Codex` scheme | GitHub macOS development build required |
| iOS signing | Export options contained a Team ID placeholder and Release team was empty | Set Team ID `86NUJ8M3B8`; the owner must verify it matches the provisioning profile | Signed archive required |
| iOS privacy | No app privacy manifest | Added `PrivacyInfo.xcprivacy` to the app target resources with app data categories and no tracking declaration | Inspect Xcode privacy report before submission |
| Store disclosures | Privacy and terms claimed Clarity, payment processors, and Apple-only subscriptions not supported by the current app | Aligned legal pages with current AI, entitlement, deletion, technical-data, and platform behavior | Legal/product-owner review required |
| Android privacy | Android backup could restore sensitive app state | Disabled Android application backup | Inspect merged release manifest |

## Remaining External Gates

1. Set the GitHub Actions repository variable `VITE_API_URL` to the deployed HTTPS API origin.
2. Add and verify Android keystore and Apple certificate/provisioning secrets.
3. Produce a signed AAB and IPA through GitHub Actions.
4. Verify deployed privacy, support, and account-deletion URLs.
5. Complete App Store privacy and Play Data Safety declarations from the final binary.
6. Capture final phone/tablet screenshots and create the Play feature graphic.
7. Run TestFlight and Play internal testing on physical devices.
8. Complete store listing questionnaires and submit manually only after those checks pass.
