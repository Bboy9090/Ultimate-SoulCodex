# ADR-002: Uncertainty Is a First-Class Product State

- Status: Accepted
- Date: 2026-08-02
- Scope: Soul Codex Foundation and all later intelligence layers

## Context

Soul Codex combines deterministic calculations, time-sensitive astronomical placements, user-entered behavioral data, symbolic systems, and AI-generated interpretation. These inputs do not all carry the same level of certainty.

Earlier implementations allowed approximation, legacy values, or form completeness to appear more authoritative than the underlying evidence justified. That creates a trust failure: the presentation layer can make an unknown or provisional value feel verified simply because it is displayed confidently.

## Decision

Missing, unresolved, provisional, inferred, and verified information are distinct product states. They must remain distinguishable throughout the full pipeline:

```text
Raw input
→ Calculation
→ Verification
→ Interpretation
→ Presentation
```

State may only be promoted by the calculation and verification layers. Interpretation and presentation may render state, but may not originate or upgrade it.

## Canonical evidence states

Every calculated or derived system value must resolve to exactly one of these user-facing evidence states:

- `verified` — exact required input exists, the calculation completed, and the domain verification contract passed.
- `stable_across_range` — one or more inputs are missing or uncertain, but an exhaustive supported range sweep shows the result is identical across every plausible value tested. This state may contribute to synthesis, but must retain range provenance and must never be relabeled verified.
- `conditional` — multiple legitimate values occur across the supported uncertainty range. Conditional values may be displayed only as explicit branches with their time/input windows. They do not contribute to the main synthesis.
- `unavailable` — required information is missing or the supported range cannot be evaluated completely. The value contributes nothing.

Lifecycle states such as `pending_independent_verification`, `calculated`, or `unresolved` may exist internally, but presentation and synthesis must map them into the four evidence states above. They may never silently collapse into `verified`.

## Permanent rules

1. Unknown information never becomes invented certainty.
2. Missing birth time reduces scope; it does not authorize a default noon/midnight chart, a guessed Rising sign, or a fake Human Design result.
3. When birth time is unknown and date/timezone are sufficient, Soul Codex performs a full supported 24-hour range analysis at minute resolution.
4. A planetary sign that is identical across every tested birth minute may be used as `stable_across_range`. A planetary sign that changes must be `conditional` and expose each legitimate time window.
5. Ascendant, houses, Midheaven, and other time-sensitive angles are never promoted from a guessed time. Possible Ascendants may be shown only as rectification branches.
6. Rectification is evidence gathering, not certification. Behavioral resemblance can help test a time window but cannot upgrade chart state by itself.
7. Human Design is evaluated component by component across the full supported range when birth time is unknown. Type, Strategy, Authority, Profile, Definition, Centers, Channels, Gates, and Incarnation Cross may be used only if that component is invariant across the entire range. Changing components remain conditional and excluded from synthesis.
8. Date-based numerology (Life Path, Birthday Number, Personal Year, and other date-only values) may be calculated deterministically when the birth date is known. Name-based numerology (Expression/Destiny, Soul Urge, Personality, Maturity where name-dependent) is unavailable until the required full birth name exists.
9. Missing birthplace never triggers a default city. Location-sensitive astronomy remains unavailable and the product asks for the nearest known city or coordinates.
10. A profile-level confidence badge cannot override weaker field-level evidence.
11. Interpretation and presentation may consume evidence state but may not originate or upgrade it.
12. `verified` and `stable_across_range` may influence the main synthesis. `conditional` may only create labeled branches. `unavailable` contributes nothing.
13. Psychological prose must inherit evidence scope. A verified or range-stable astronomical symbol may support symbolic interpretation, but it does not become verified psychology.
14. Every incomplete reading should explain what remains available now and what additional input would unlock.
15. Regression tests must fail when an unavailable or conditional value influences the main synthesis, when a stable-across-range value loses its provenance, or when a fallback/default input is silently inserted.

## Required unknown-time flow

```text
Birth date known
+ birth time unknown
+ location/timezone sufficient

→ calculate the complete supported 24-hour range
→ identify invariant placements/components
→ mark invariants stable_across_range
→ identify changing placements/components
→ mark changing values conditional
→ expose branch windows for conditional values
→ exclude conditional/unavailable values from main synthesis
→ explain what exact birth time would unlock
```

If location/timezone is insufficient for a domain, that domain remains `unavailable`; Soul Codex does not invent a location or UTC offset.

## Applies to

- Unknown birth time
- Incomplete names
- Moon, Ascendant, houses, and planetary placements
- Human Design
- Compatibility confidence
- Timeline confidence
- Behavioral inference
- AI-generated guidance
- Predictions and future trajectory

## Consequences

### Positive

- Users can see what the system knows, what it infers, and what remains unknown.
- Future engines can improve calculations without rewriting the trust model.
- AI cannot quietly convert missing data into confident biography.
- Evidence and confidence become inspectable product features rather than decorative labels.

### Trade-offs

- Some readings will contain fewer claims.
- The interface must communicate incomplete states clearly.
- Runtime validation may add latency.
- Developers must carry provenance metadata instead of passing naked values.

These costs are accepted. Trust is more important than theatrical certainty.

## Product principle

> The system is allowed to say, “I do not know this yet.”

That is not a failure state. It is an honest intelligence state.
