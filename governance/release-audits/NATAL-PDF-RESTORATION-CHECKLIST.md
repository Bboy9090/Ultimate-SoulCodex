# Natal PDF Restoration Acceptance Checklist

- [ ] `npm run check:workspaces` passes.
- [ ] `npm run check` passes.
- [ ] workspace tests pass.
- [ ] `tests/natal-report-contract.test.ts` passes, including real PDFKit byte rendering.
- [ ] Foundation Web RC invariant audit passes.
- [ ] application build passes.
- [ ] native smoke remains green.
- [ ] Railway container smoke remains green.
- [ ] PDF download UI is visible on server-backed premium profiles.
- [ ] non-premium profile sees unlock/pricing action rather than a broken download.
- [ ] report endpoint requires profile ownership and premium entitlement.
- [ ] unknown/unverified Moon, Ascendant, houses, aspects, nodes, Chiron, and Human Design are not promoted as verified facts.
- [ ] canonical full-reading link resolves to `/reading/:id`.

Do not mark the restoration complete from source review alone. CI and runtime PDF generation are required evidence.
