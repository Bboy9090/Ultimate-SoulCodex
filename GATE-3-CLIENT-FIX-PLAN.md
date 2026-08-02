# Gate 3 Client Fix Plan

This branch completes the client-side half of the No Silent Upgrade gate.

## Required source fixes

### PosterPage

- Remove demo/fallback zodiac values from user-facing state.
- Replace `Gemini`/`Pisces` fallbacks with empty values plus explicit pending/unavailable presentation.
- Never export a poster containing fabricated astrology.
- Preserve manual sign selectors only as clearly user-entered values with provenance.

### OnboardingPage

- Remove `SIGN_BOUNDARIES` and `getApproxSunSign` from authoritative profile flow.
- Do not prefetch horoscope or compatibility using an unverified date-boundary estimate.
- Do not fall back to `earlySunSign` after API profile creation.
- Store provenance and verification state with every astrology placement.
- When ephemeris results are unavailable, continue onboarding without astrology-derived warmups.

## Regression gate

`tests/gate3-no-silent-upgrades.test.ts` intentionally fails until both source files are corrected. Do not weaken the test to obtain green CI.
