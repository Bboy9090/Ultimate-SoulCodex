# Ephemeris Strategy (Phased)

## Objective

Increase calculation precision over time without destabilizing launch-track delivery.

## Current Phase (Now)

- Keep existing JS/TS engine stack in production path.
- Lock contracts, fixtures, and confidence disclosures first.
- Do not replace backend architecture during TestFlight hardening.

## Future Evaluation Path

Potential precision layer options include Swiss Ephemeris-based tooling, but only after formal review.

Required gates before adoption:
1. license and legal review
2. deployment and runtime fit review
3. contract compatibility review
4. output comparison against baseline fixtures
5. rollback plan

## Sidecar Migration Pattern

1. Keep current engine as baseline.
2. Add precision engine in sidecar mode.
3. Run fixture comparisons for drift visibility.
4. Switch only when acceptance thresholds are met.

## Licensing Caution

If evaluating `pyswisseph`, complete legal review before implementation or distribution decisions. Documentation alone does not authorize integration.

## Anti-Pattern Ban

Do not perform a wholesale backend rewrite as a first step for precision upgrades.
