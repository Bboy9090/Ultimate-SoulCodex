# Confidence & Trust Badges

Soul Codex uses a single confidence model everywhere to separate:

- **Chart confidence** (what the birth data supports)
- **Interpretive text** (guidance; can vary in wording)

## Canonical model

All product surfaces should prefer this shape:

```ts
type ConfidenceBadge = "verified" | "partial" | "unverified";

type Confidence = {
  badge: ConfidenceBadge;
  label: "Verified" | "Partial" | "Unverified";
  reason: string;
  aiAssuranceNote?: string;
};
```

## Badge meaning (source of truth)

Backend computation lives in:

- `packages/core/compute/confidence.ts`
- `soulcodex/compute/confidence.ts` (legacy duplicate — keep in sync)

### `verified`

- **When**: birth time is known **and** geo + timezone are resolved.
- **Implication**: rising sign and houses are included.

### `partial`

- **When**: birth time is unknown (even if location exists).
- **Implication**: omit rising sign/houses; Sun + Moon remain grounded.

### `unverified`

- **When**: geo/timezone is missing/unresolved (location not provided or can’t be resolved).
- **Implication**: rising sign/houses are not reliable.

## Display rules

- Always render the badge using the **machine badge key** (`verified|partial|unverified`).
- Show `reason` near the badge where space allows (Profile/Codex/Today/Timeline).
- Use `aiAssuranceNote` sparingly: it should be **one short sentence** that clarifies the line between “computed” and “interpretive”, without repeating the reason.

## Current usage

- **Onboarding**: `apps/web/src/pages/OnboardingPage.tsx` shows an “Accuracy preview” badge. The API computes the real confidence post-geocode.
- **Profile**: `apps/web/src/pages/ProfilePage.tsx` reads `soulConfidence` or `profile.confidence`.
- **Codex reading**: `/api/codex30/generate` returns `synthesis.badges` with `badge/label/reason/aiAssuranceNote`.
- **Today**: `/api/today/card` returns `card.confidence` and a legacy `card.confidenceLabel`.
- **Timeline**: `services/timeline/*` returns `confidence` object and legacy `confidenceLabel`.

