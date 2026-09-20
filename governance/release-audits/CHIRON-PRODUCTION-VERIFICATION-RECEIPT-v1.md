# Chiron Production Verification Receipt v1

Status: APPROVED FOR PRODUCTION POLICY

Runtime source: live NASA/JPL Horizons 2060 Chiron geocentric apparent ecliptic-of-date longitude.

The runtime does **not** use the legacy Soul Codex epoch-rate Chiron approximation.

## Cross-engine qualification

- Evidence workflow run: 35474358663
- Evidence artifact: 10593933139
- Artifact SHA-256: a2d8f9b91cb8ad13a47cb66257bfacefbc9a516e5a35d3933a22b70008dd1d00
- Exact evidence candidate SHA: 284aa019937ae3fdd2bfc4bfb1693219caa3f63a
- Fixtures: 24
- Independent engines: NASA/JPL Horizons and Swiss Ephemeris 2.10.03
- Maximum observed longitude delta: 0.00024446952613743633 degrees
- Swiss asteroid dataset SHA-256: a2cd8fc33807c78ca9a700c91c2e042258b12fc4796519e00781440b5ad8b2e2
- Swiss planetary dataset SHA-256: ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66

## Approved policy

- Policy ID: ASTRO-CHIRON-v1
- Maximum qualified cross-engine delta: 0.001 degrees
- Runtime behavior: fetch live JPL Chiron during explicit online chart verification.
- Failure behavior: unresolved; no local approximation or guessed fallback.

Approved by: Bboy9090
Approved at: 2026-09-19T22:50:45.000Z
