# Soul Codex — App Store Review Notes

Prepared for the September 7, 2026 App Review information request.

## Access model

Soul Codex does **not** require an account or sign-in for the core guest experience. A reviewer can launch the app, create a local profile, and inspect the primary self-reflection experience without credentials.

Optional account functionality exists for account-based persistence and related server-backed features. This distinction is important: the app has an account system, but an account is not required to begin and use the core guest experience.

## Purpose and audience

Soul Codex is a personal clarity and self-reflection application. It combines astrology, numerology, Human Design, timing, compatibility, behavioral reflection, and guided interpretation into a single profile experience.

The intended audience is general users interested in self-reflection, identity exploration, personal patterns, compatibility, and entertainment-oriented metaphysical tools. Soul Codex does not provide medical, legal, financial, or other regulated professional advice.

## Review flow

1. Launch Soul Codex.
2. Start or create a local profile.
3. Enter birth data. Date is required; time and location improve chart precision.
4. Online astronomy verification is optional. When the user opts in, the app may send the birth date, birth time, and user-entered birth location needed for calculation to the production backend.
5. Continue to the generated profile and inspect the available Identity/Profile, Timeline/Today, Compatibility, Tools, Systems, and related reflection experiences.
6. No demo username or password is required for this core guest flow.

The app does not use live device GPS for birth-location input. The relevant location is supplied by the user for chart/timezone calculation.

## External services

- **Railway** hosts the Soul Codex production backend at `https://soulcodex.up.railway.app`.
- **Configured AI service providers** may process user-requested Soul Guide or interpretation requests. Production provider configuration currently supports Gemini and Groq, with application fallback behavior where applicable.
- **Apple Sign in with Apple** is available for optional account authentication. It is not required for the core guest experience.

No separate third-party account is required from the reviewer to use the core guest experience.

## Native premium boundary

The submitted iOS application does not open an external checkout page to sell digital premium features. Existing server-side premium entitlements may be recognized when available. The core guest experience remains accessible without a purchase.

If App Review needs to inspect an entitlement-only feature, provide a suitable review entitlement/account rather than directing the reviewer to an external purchase flow.

## Data and privacy summary

The checked-in iOS privacy manifest declares no tracking. Depending on features used, app functionality may involve name, optional email/account ID, user-entered birth location, birth/profile information, and user-generated profile or prompt content. Birth location is user-entered chart data, not live device location.

## Regional behavior

The same core guest functionality is intended to operate across supported App Store regions. There is no region-specific login requirement for the core experience.

## App Review response template

Hello App Review Team,

Thank you for the additional information request.

Soul Codex is a personal clarity and self-reflection application combining astrology, numerology, Human Design, timing, compatibility, behavioral reflection, and guided interpretation.

An account is not required for the core guest experience. Reviewers can launch the app, create a local profile, and access the primary experience without a username or password. Optional account functionality exists for account-based persistence and related features.

To review the app, launch Soul Codex, create a local profile, enter birth information, and continue to the generated profile. Online astronomy verification is optional. When selected, it uses the birth date, time, and user-entered birth location needed for chart calculation. The app does not require live device location for this flow.

The production backend is hosted on Railway. User-requested AI functionality may use configured AI service providers. Sign in with Apple is available only for optional account functionality and is not required for the core guest experience.

The submitted iOS build does not direct users to an external checkout for digital premium purchases. Existing premium entitlements may be recognized when available, while the core guest experience remains available without purchase.

Soul Codex is intended for self-reflection and entertainment and does not provide medical, legal, financial, or other regulated professional advice. The same core experience is intended to be available across supported App Store regions.

A physical-device screen recording demonstrating launch and the normal user flow is provided with this response.

Please let me know if the review team is unable to access a specific screen or feature and I will address that exact path.

Thank you.
