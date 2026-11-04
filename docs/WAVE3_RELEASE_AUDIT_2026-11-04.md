# Soul Codex — Wave 3 Release Audit

Date: 2026-11-04

## Brand decision

Keep the public name **Soul Codex**.

Do not rename or fold it into the Bobby's Bench naming family. It already has independent store identity and release history.

Current package version: `4.1.0`.

## Current release risks

### App Store privacy metadata
Issue #346 records a mismatch risk between the public App Store privacy declaration and current server-backed behavior.

Before the next iOS submission:
- reconcile App Store Connect App Privacy with the exact submitted binary
- do not leave "Data Not Collected" if Apple definitions require disclosure for server-backed profile/account/AI behavior
- preserve Tracking = No unless behavior changes
- verify the public privacy-policy URL
- save release evidence of final answers

### Aurelion validation
Issues #486 and #487 keep the Aurelion experience behind provenance, validation, accessibility, mobile, and visual-acceptance gates.

Do not ship:
- unvalidated zodiac/sign values
- null/boolean degree coercion
- silent mixing of verified and legacy placement sources
- unbounded compatibility scores
- AI-generated placements/aspects presented as astronomical computation

## Next executable wave

1. Close the App Store privacy metadata gate for the exact next iOS binary.
2. Complete Aurelion provenance/input validation tests.
3. Complete mobile accessibility/interaction evidence.
4. Run current build/mobile validation scripts against the exact release SHA.
5. Preserve existing store identity and avoid unnecessary branding churn.

## No-claim rule

A previously published store version is not evidence that the next version's privacy metadata, Aurelion behavior, or signed binary is qualified.
