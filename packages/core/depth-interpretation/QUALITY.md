# Depth Interpretation Quality Gates

The v1 contract validator answers whether an interpretation is structurally consistent. The quality evaluator answers the product question that matters more:

> Does this interpretation create supported clarity, or did it merely fill every field?

Run `evaluateDepthInterpretationQuality()` after deterministic synthesis and after any provider prose rewrite. A response should not be treated as release-ready depth content until it passes both structural validation and these quality gates.

## Result shape

The evaluator returns:

- `pass`: no error findings and score at or above the configured minimum
- `score`: deterministic score from 0 to 100
- `minimumPassingScore`: defaults to 80
- `findings`: code, severity, category, path, and message
- `metrics`: available and unavailable layers, evidence use, evidence systems, duplicate summaries, and limitation count

Warnings remain visible even when the result passes. They are evidence of a limitation, not decorative lint to hide until the launch screenshot looks calmer.

## Gate categories

### Contract validity

The evaluator reuses `validateDepthInterpretationV1()` and maps its findings into the quality result. It does not maintain a competing copy of structural validation rules.

### Clarity

The first-view clarity summary and grounded action must remain available. Generic self-help filler cannot substitute for a supported interpretation.

### Depth

The evaluator checks:

- unavailable contradiction as a visible warning
- weak available-layer coverage
- duplicate summaries across layers
- thin summaries or explanations
- summary and explanation duplication
- phrases prohibited by the repository blandness standard

### Honesty

The evaluator rejects:

- invented childhood, parental, or biographical causes
- invented trauma or attachment labels
- diagnostic authority
- unsupported hidden causes or motives
- deterministic identity or future claims
- borrowed scientific certainty
- inferred prose that hides its uncertainty

Inference should use calibrated language such as `may`, `can`, `could`, `suggests`, or `one possible interpretation`.

### Traceability

Every available contradiction must cite at least two distinct evidence references. Overall high confidence requires more than one evidence system. Warnings expose severe evidence concentration, low evidence utilization, and visible unknown-time degradation.

### Actionability

The action layer must contain an observable verb such as `write`, `ask`, `track`, `choose`, `test`, `state`, or `clarify`.

## Scoring

Scoring begins at 100.

- each error deducts 12 points
- each warning deducts 3 points
- the result is clamped at zero
- passing requires no errors and a score of at least 80 by default

A high score cannot excuse an honesty error. Likewise, a perfectly shaped object cannot excuse thirteen copies of “trust the process.” Software can count fields. The Codex must explain patterns.

## Locked regression corpus

`DEPTH_QUALITY_FIXTURES` contains five stable fixtures:

1. strong evidence-backed known-time interpretation: pass
2. honest unknown-time interpretation: pass with visible warning
3. shallow repetitive overclaiming interpretation: fail
4. invented-biography interpretation: fail
5. unsupported high-confidence interpretation: fail

Focused regression tests lock both their outcomes and exact scores. These fixtures stabilize evaluator behavior; they do not claim scientific proof for any interpretive system.

## Unknown birth time

Unknown-time content can pass when:

- time-sensitive claims are removed or unavailable
- the missing birth time is disclosed in `missingData`
- supported non-time-sensitive evidence remains traceable
- confidence is reduced where appropriate
- no fabricated completeness is introduced

The correct response to missing data is visible degradation, not confident fog.

## Integration order

1. create or parse `DepthInterpretationV1`
2. run `validateDepthInterpretationV1()`
3. run `evaluateDepthInterpretationQuality()`
4. preserve warnings for review or evidence surfaces
5. release only when the applicable gate passes

The evaluator is pure. It does not mutate source interpretations, call providers, alter formulas, or read UI state.
