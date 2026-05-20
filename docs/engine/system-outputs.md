# System Outputs Contract

## Purpose

Define required output objects for daily guidance surface and advanced engine surface while preserving shared meaning and confidence transparency.

## Daily Guidance Surface

Required output traits:
- concise focus
- actionable do/don't guidance
- watch-out pattern
- decision guidance
- visible confidence context

Primary anchor:
- `packages/core/soulcodex-v1/schema.ts` (`daily_guidance` and `confidence`)

## Advanced Engine Surface

Required output traits:
- structured core-system snapshot
- sectioned interpretation blocks
- signal traceability at section level
- confidence and uncertainty exposure

Primary anchors:
- `packages/core/soulcodex-v1/schema.ts`
- `packages/core/soulcodex-v1/generate.ts`
- `packages/core/soulcodex-v1/engine/types.ts`

## Confidence and Missing-Data Metadata

Every major output payload should carry:
- chart/system confidence badge
- overall confidence level
- input summary with known missing precision fields

Required behavior:
- if precision is missing, outputs still render where valid
- outputs must disclose limits instead of pretending full certainty

## Explanation Contract Coupling

Symbol-level explanation templates in `docs/soul-codex/explanation-template.md` should remain compatible with structured output sections so daily and advanced surfaces do not contradict each other.
