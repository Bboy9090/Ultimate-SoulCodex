# Ephemeris Strategy

Soul Codex should treat ephemeris precision as a staged engine upgrade, not a launch-blocking rebuild.

The current app already uses the existing JavaScript stack and includes `astronomy-engine`. This should remain stable while the product doctrine, explanation library, and test fixtures are locked.

## Current Position

Do not:

- Replace the backend.
- Add Python code.
- Add Swiss Ephemeris code.
- Split services.
- Change iOS/App Store hardening.

Do:

- Document the future engine contract.
- Add fixtures.
- Compare candidate engines.
- Track confidence and calculation trace.
- Make a license decision before implementation.

## Candidate: Swiss Ephemeris / pyswisseph

Swiss Ephemeris and `pyswisseph` may be evaluated later as a precision engine, sidecar, or replacement module.

Important license warning:

- The current [`pyswisseph` PyPI page](https://pypi.org/project/pyswisseph/) lists the package license as GNU Affero General Public License v3.
- The [Swiss Ephemeris documentation](https://www.astro.com/swisseph-download/doc/swisseph.pdf) describes a dual licensing model: AGPL or Swiss Ephemeris Professional License.

That means Swiss Ephemeris must be reviewed for commercial, deployment, and architecture fit before any implementation.

## Evaluation Questions

Before adopting a new ephemeris engine, answer:

- What license applies to the app's intended commercial deployment?
- Is the engine embedded, called as a service, or used offline to generate fixtures?
- Can Railway deploy it cleanly?
- Does it require native binaries or ephemeris data files?
- What are the performance and cold-start costs?
- How does it compare against current `astronomy-engine` output?
- How are timezones, geocoding, house systems, nodes, and ayanamsha handled?
- What confidence flags change when birth time or location is missing?

## Comparison Plan

1. Build fixture profiles with known birth date, time, location, and timezone.
2. Run the current engine.
3. Run the candidate precision engine in a research branch only.
4. Compare placements, houses, aspects, nodes, and degree-sensitive outputs.
5. Document deltas and decide whether the improved precision justifies deployment and licensing complexity.

## Decision Rule

Do not upgrade ephemeris infrastructure until it improves user trust, traceability, or calculation precision without destabilizing the TestFlight path.
