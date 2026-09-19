# Astrology Planetary Candidate v1

Scope: Priority 1 calculation layer for Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.

## Guarantees

- Uses the same UTC birth timestamp contract as the production Sun/Moon verifier.
- Produces deterministic geocentric ecliptic-of-date candidates with Astronomy Engine.
- Keeps candidate sign/longitude internal until an approved independent verification policy succeeds.
- Missing birth time/timezone suppresses time-sensitive planetary candidates.
- Production policy currently approves only Sun and Moon; the eight added planets remain pending until an evidence matrix qualifies their tolerance.
- NASA/JPL Horizons command IDs are wired for all ten natal planets so independent evidence collection can proceed.

## Explicit non-goals

- No houses.
- No aspects.
- No nodes.
- No Chiron.
- No interpretation changes.
- No claim that Mercury through Pluto are production-approved yet.

## Next qualification step

Run an independent NASA/JPL Horizons evidence matrix across adversarial timestamps and sign-boundary cases, record per-body maximum longitude deltas and sign disagreements, then propose body-specific production tolerance policy from measured evidence only.
