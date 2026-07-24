# Layered Soul Guide

The layered Soul Guide consumes a deterministic `DepthInterpretationV1` and may improve only its user-facing prose.

## Locked Metadata

The provider cannot change:

- evidence or evidence IDs
- claim kind
- confidence
- limitations
- provenance
- missing data
- generated time
- contract version
- overall confidence

The prompt requests only `title`, `summary`, and `explanation` for every layer. The parser rejects additional fields and merges accepted prose back onto the original deterministic interpretation.

## Safety Boundary

The parser rejects prose that introduces:

- diagnoses or clinical labels
- invented childhood or parental causes
- trauma or attachment labels
- unsupported hidden motives
- fixed identity or guaranteed future claims

The merged interpretation must still pass `validateDepthInterpretationV1`.

## Fallback

`createDepthSoulGuideFallback()` renders the same contract without an AI provider.

The primary order is:

1. Core Pattern
2. Main Contradiction
3. Next Move

Deeper cards retain claim kind, confidence, evidence IDs, limitations, and unavailable status. Unknown birth time therefore remains visibly degraded in both live and fallback responses.

## Compatibility

The existing `SoulGuideInterpretation` v1 prompt, parser, cache key, and storage behavior remain unchanged. The layered API is additive.
