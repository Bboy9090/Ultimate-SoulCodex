# Soul Codex 4.1 — App Store Live Disclosure Readiness

Audit date: 2026-10-13 (America/New_York)

## Scope

This receipt compares the current public Soul Codex App Store listing with the checked-in 4.1 privacy and billing contracts. It does not claim access to private App Store Connect state.

Public app:
- Name: Soul Codex
- App Store ID: `6764221944`
- Bundle ID authority in repo: `app.soulcodex.ios`
- Public listing: https://apps.apple.com/us/app/soul-codex/id6764221944

## Public storefront observation

At audit time the public US App Store listing:

- shows Soul Codex as **Free**;
- does not expose an **In-App Purchases** section in the public page content;
- shows App Privacy as **Data Not Collected**.

These observations are storefront evidence only.

They do **not** prove that the monthly or annual products are absent from private App Store Connect, sandbox, or TestFlight configuration. Product existence and sandbox availability must still be verified in App Store Connect and by a real StoreKit qualification run.

## 4.1 App Privacy authority

The checked-in iOS privacy manifest and canonical store packet require the 4.1 App Store privacy answers to stop claiming Data Not Collected once 4.1 transmits account/profile information or receives purchase/subscription state.

Current linked, non-tracking categories for **App Functionality**:

| App Store privacy category | 4.1 answer |
|---|---|
| Contact Info → Name | Collected, linked to user, not used for tracking |
| Contact Info → Email Address | Collected, linked to user, not used for tracking |
| Identifiers → User ID | Collected, linked to user, not used for tracking |
| Location → Coarse Location | Collected, linked to user, not used for tracking |
| Sensitive Info | Collected, linked to user, not used for tracking |
| Purchases → Purchase History | Collected, linked to user, not used for tracking |
| User Content → Other User Content | Collected, linked to user, not used for tracking |

Tracking: **No**.

Tracking domains: **None**.

Raw payment-card or bank data: **Not collected by Soul Codex**.

## iOS billing qualification authority

Merged qualification gate authority:
- production iOS billing flag remains separate from qualification;
- `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED` stays `false` during qualification;
- legacy `SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED` stays `false`;
- server qualification gate: `SOUL_CODEX_PLUS_IOS_QUALIFICATION_ENABLED`;
- dedicated TestFlight build markers:
  - `VITE_BILLING_QUALIFICATION_MODE=true`
  - `SOUL_CODEX_IOS_QUALIFICATION_BUILD=true`;
- normal release bootstrap explicitly proves both client qualification keys are false;
- qualification verification may accept Apple **sandbox** evidence only;
- normal production verification does not inherit sandbox allowance;
- signed StoreKit evidence must still pass bundle, product, certificate, environment, account-binding, replay, and entitlement checks.

## Current decision

**BLOCKED — do not enable production iOS billing yet.**

Code/build readiness is no longer the blocker. The remaining Apple-owner/provider evidence is:

1. Update the live App Store Privacy answers so they match the 4.1 manifest and store packet.
2. Confirm the Soul Codex+ subscription group exists in App Store Connect.
3. Confirm monthly product `app.soulcodex.plus.monthly` is available to the intended sandbox/TestFlight qualification build.
4. Confirm annual product `app.soulcodex.plus.annual` is available to the intended sandbox/TestFlight qualification build.
5. Produce a dedicated Xcode Cloud/TestFlight qualification build with both client qualification markers enabled.
6. Enable only the server qualification flag for the bounded test window while production iOS billing remains disabled.
7. Complete every StoreKit qualification checkpoint with redacted evidence.
8. Disable the server qualification flag after the qualification window.
9. Rebuild a normal release archive with qualification mode off.
10. Consider `SOUL_CODEX_PLUS_IOS_BILLING_ENABLED=true` only after the iOS provider receipt is fully PASS.

## Required StoreKit evidence

The iOS provider remains INCONCLUSIVE until real evidence covers:

- localized monthly + annual catalog resolution;
- monthly purchase + server verification;
- annual purchase + server verification;
- failed/cancelled purchase grants nothing;
- persistence after relaunch;
- Restore Purchases;
- reinstall restore;
- second-device restore/verification where available;
- cancellation/expiry fallback;
- refund/revocation;
- StoreKit transaction updates;
- App Store Server Notifications V2;
- wrong environment/replay/product mismatch rejection;
- Free fallback remains usable.

## Non-claims

This receipt does not claim:
- private App Store Connect product status;
- TestFlight processing status;
- sandbox purchase success;
- production billing activation;
- provider approval;
- storefront IAP visibility after the observation timestamp.

Only real provider evidence can change those states.
