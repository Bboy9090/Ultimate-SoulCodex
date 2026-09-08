# Natal PDF Restoration Truth Matrix

## Purpose

Restore the full elegant Soul Codex natal-report generator without allowing legacy or unverified fields to masquerade as release-grade evidence.

## Active production path

- UI: `client/src/pages/profile.tsx`
- Download control: `client/src/components/NatalReportDownloadButton.tsx`
- API: `GET /api/pdf/profile/:id`
- Truth adapter: `server/lib/natal-report-contract.ts`
- Renderer: `server/natalReportPdf.ts`

## Evidence policy

| Report field | Production rule |
|---|---|
| Sun | Display only when placement verification status is `verified`. |
| Moon | Display only when placement verification status is `verified`; unknown/missing birth time remains unresolved. |
| Ascendant | Display only when independently verified by the approved Ascendant policy. |
| Planet degrees | Pass to the renderer only when the verified placement carries a finite candidate longitude. |
| Houses / Midheaven | Withheld until approved verification evidence exists. |
| Aspects | Withheld from this report contract until the complete required planetary evidence is approved. |
| Nodes / Chiron / planetary house placements | Withheld until approved verification evidence exists. |
| Life Path | May be displayed as a deterministic numerology calculation; meaning remains symbolic. |
| Human Design | Core fields pass through only when `humanDesignData.status === "verified"`; calculated-unverified candidates are omitted. |
| Biography / guidance | May be used as symbolic synthesis, explicitly separated from verified astronomical evidence. |

## Security and privacy

The report uses the same server-side user/session ownership policy as the profile read path. A profile ID is not treated as a second bearer secret. Non-premium profiles receive `403 premium_required`. PDF responses are `private, no-store` and filenames are sanitized before entering `Content-Disposition`.

## UI restoration

Premium profiles receive a `Download natal chart PDF` action. The browser validates both `Content-Type: application/pdf` and the `%PDF` file signature before offering the generated file. Non-premium profiles receive an explicit pricing/unlock action instead of a broken download.

The profile's full-reading link is also corrected to the canonical `/reading/:id` route.

## Regression proof

`tests/natal-report-contract.test.ts` locks:

- verified-only astronomy promotion;
- rejection of tempting legacy Moon/Rising/planet/house/aspect/node/Chiron values;
- Human Design trust gating;
- filename sanitization;
- canonical UI/API wiring;
- owner authorization policy;
- real PDFKit rendering with a `%PDF` signature and non-trivial byte size.

The test is part of `.github/workflows/ci.yml`.

## Still intentionally unresolved

This restoration does **not** claim completion of:

- verified houses and Midheaven;
- verified nodes, Chiron, or planetary house placements;
- authoritative Human Design interpretation/compatibility;
- Palmistry computer-vision analysis;
- Astrocartography planetary-line calculation and mapping.

Those remain separate engineering/evidence lanes. No simulated production routes are restored as substitutes.
