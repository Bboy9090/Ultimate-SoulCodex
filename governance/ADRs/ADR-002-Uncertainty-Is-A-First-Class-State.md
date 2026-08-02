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

## Required states

At minimum, systems must support:

- `unresolved`
- `pending_independent_verification`
- `partial`
- `verified`

Additional domain-specific states may be added, but none may silently collapse into `verified`.

## Rules

1. A populated field is not automatically verified.
2. Birth time and location do not by themselves verify Moon, Ascendant, houses, or Human Design.
3. A profile-level label cannot override weaker placement-level evidence.
4. AI synthesis must skip unresolved inputs or state their uncertainty explicitly.
5. UI components may display verification state but cannot manufacture it.
6. Fallbacks must be labeled and must never impersonate calculated truth.
7. Verification requires evidence appropriate to the domain, including source, engine or method, and calculation timestamp when applicable.
8. Regression tests must fail when uncertainty is promoted without evidence.

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
