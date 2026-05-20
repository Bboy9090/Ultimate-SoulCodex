# Calculation Contract (Planning Baseline)

## Goal

Define the stable contract from user inputs to structured Soul Codex outputs without changing runtime behavior in this documentation PR.

## Verified Code Anchors

Core schema and generation:
- `packages/core/soulcodex-v1/schema.ts`
- `packages/core/soulcodex-v1/generate.ts`

Engine internals:
- `packages/core/soulcodex-v1/engine/index.ts`
- `packages/core/soulcodex-v1/engine/traitMapper.ts`
- `packages/core/soulcodex-v1/engine/statementSelector.ts`
- `packages/core/soulcodex-v1/engine/dailyGuidance.ts`

Confidence logic:
- `packages/core/compute/confidence.ts`
- `soulcodex/compute/confidence.ts`

## Contract Stages

1. Input normalization
- birth data and profile data are normalized
- missing fields are explicit

2. Signal extraction
- astrology, human design, numerology, and mirror/context signals become structured traits

3. Rule filtering
- contradictions and low-confidence conflicts are filtered deterministically

4. Statement selection
- trait overlap and confidence thresholds drive selected interpretation statements

5. Section assembly
- output mapped into summary, sections, and daily guidance contract

6. Confidence assignment
- chart/system confidence badges and overall confidence levels assigned

## Stability Rules

- Public output schema remains backward compatible within `soul_codex_v1`.
- Content evolution can expand depth but should not silently break field semantics.
- Confidence enums remain fixed unless versioned API/schema changes are approved.

## Out of Scope for This Phase

- runtime backend replacement
- Python ephemeris implementation
- route rewiring or deployment architecture changes
