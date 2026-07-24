# Depth Interpretation Contract v1

`DepthInterpretationV1` is the deterministic core contract for Soul Codex readings that explain a pattern rather than merely describing a person.

Its product test is simple:

> After using Soul Codex, does the user understand themselves more clearly than before?

This module defines data shape and validation only. It does not generate prose, change formulas, call an AI provider, alter the UI, or replace `SoulGuideInterpretation` v1.

## Clarity first, depth on demand

A complete interpretation may contain many layers, but the user should first be able to understand three things:

1. the strongest supported pattern
2. the main contradiction or tension
3. one grounded next move

The remaining layers provide depth when requested:

- visible pattern
- inner experience
- hidden need
- protective function
- core contradiction
- gift
- shadow
- common misreading
- relationship impact
- decision impact
- boundary or repair
- action
- evidence, confidence, and missing data

The contract stores these layers separately so a later interface can reveal them progressively instead of presenting a wall of prose.

## Claim kinds

Every layer declares how the claim was produced.

### `observed`

Directly supported by supplied lived, tracker, timeline, or user-stated evidence. An observed claim must reference evidence.

### `derived`

Calculated from an explicit system rule or engine result, such as a numerology calculation or a chart placement. Derived does not mean scientifically proven. It means the software can trace the result to a defined computation.

### `inferred`

An interpretive connection between supported signals. Inference can be useful, but it must include limitations and must never be presented as known biography.

### `unavailable`

The system does not have enough reliable information to make the claim. Unavailable layers must use low confidence and may explain what data is missing, but must not smuggle an interpretation into the explanation.

## Evidence, derivation, and inference

Evidence references are auditable inputs. They identify the source system, source field, value, confidence, provenance, and optional time sensitivity.

A layer then references evidence by ID. This keeps the prose separate from the facts used to support it.

- Evidence says what data exists.
- Derivation says what a defined rule calculated from that data.
- Inference says what the combined signals may suggest.

Those categories must not be blended into one authoritative-sounding paragraph.

## Confidence is not scientific truth

Confidence describes the quality, completeness, verification, and internal consistency of the available data.

It does not declare that astrology, numerology, Human Design, or any other interpretive system is scientifically proven. High confidence is not permitted when all evidence is missing or unverified.

## Lived experience overrides interpretation

The user is the authority on their lived experience. A reading may offer a pattern for reflection. It may not insist that the user is wrong about their own life because a calculated system produced a different story.

When lived experience conflicts with an interpretation, the application should preserve the disagreement, lower confidence where appropriate, and invite correction or further tracking.

## Unknown birth time degradation

Evidence that requires a known birth time must set:

```ts
timeSensitivity: "birth-time-required"
```

Validation context supplies the current birth-time status:

```ts
validateDepthInterpretationV1(reading, {
  birthTimeStatus: "unknown",
});
```

When birth time is unknown, time-sensitive evidence cannot support an available claim. Examples include unsupported Ascendant, house, angle, Moon-degree, and time-sensitive Human Design conclusions.

The correct response is to mark the affected layer unavailable or use only evidence that remains valid without birth time. Vague confidence language is not a substitute for missing data.

## No diagnosis or invented biography

Soul Codex may say:

> Self-reliance may function as protection against uncertainty.

It may not say:

> Your childhood taught you never to trust anyone.

The second statement invents history the system was never given. The validator also rejects diagnostic and deterministic wording such as fixed clinical labels, guaranteed outcomes, or claims that a person will always behave a certain way.

## Acceptable example

The following example is evidence-linked, limited, and honest about inference:

```ts
const acceptableLayer: InterpretationLayer = {
  title: "Self-reliance as protection",
  summary: "You may move toward self-reliance when uncertainty rises.",
  explanation:
    "Recent tracker entries show that asking for help decreased during higher-stress periods. This may indicate that independence becomes a stabilizing response when circumstances feel unpredictable.",
  claimKind: "inferred",
  evidenceIds: ["tracker-help-under-stress"],
  confidence: "moderate",
  limitations: [
    "The tracker period is short and does not establish why the pattern developed.",
    "Your lived experience may provide a different explanation.",
  ],
};
```

## Deliberately rejected example

The following example is shallow, unsupported, deterministic, and falsely biographical:

```ts
const rejectedLayer: InterpretationLayer = {
  title: "You never trust people",
  summary: "You will always push people away.",
  explanation:
    "Your childhood definitely means you cannot change this pattern.",
  claimKind: "observed",
  evidenceIds: [],
  confidence: "high",
  limitations: [],
};
```

Validation rejects it because:

- an observed claim has no evidence
- high confidence has no verified support
- the wording presents behavior as fixed
- the explanation invents biography
- no limitations or missing-data boundary is stated

## Compatibility boundary

`SoulGuideInterpretation` v1 remains unchanged. Existing imports and behavior remain intact. This contract is additive and is exported through the existing `@soulcodex/core` barrel convention.
