/**
 * Legacy aggregate compatibility smoke test — retired.
 *
 * The old services/compatibility aggregate scorer is intentionally not a
 * production authority. Production compatibility is served by the
 * evidence-aware routes in routes/compatibility.ts.
 *
 * Keep this script fail-closed so CI or a maintainer cannot accidentally use
 * legacy raw astrology/numerology/Human Design fields as evidence that the
 * current compatibility contract is healthy.
 */
throw new Error(
  'legacy_compatibility_smoke_retired: use evidence-aware compatibility route tests',
);
