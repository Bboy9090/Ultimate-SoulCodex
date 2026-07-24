# Evidence-Backed Depth Synthesis

PR 2 maps normalized source signals into `DepthInterpretationV1` without replacing the existing `synthesizeCodex()` API.

## Flow

1. `normalizeSoulProfileForDepth()` converts the application `SoulProfile` into stable evidence seeds.
2. Each seed records its source system, field, value, confidence, provenance, time sensitivity, supported facets, and possible tension axes.
3. `synthesizeDepthInterpretationV1()` selects the strongest supported seeds for each layer.
4. Defined contradiction rules may identify coexistence between two supported signals.
5. `validateDepthInterpretationV1()` remains the final contract gate.

## Evidence Priority

User-supplied Mirror answers and stated values receive higher selection priority than generalized symbolic mappings. This does not make them universal certainty. It means lived input should override a conflicting generalized interpretation.

## Unknown Birth Time

When birth time is unknown, the synthesizer removes evidence marked `birth-time-required` before layer construction. Rising sign and time-sensitive Human Design evidence therefore cannot support an available claim. Sun sign, date-derived numerology, and supplied Mirror answers remain usable.

Approximate birth time retains time-sensitive evidence at low confidence and adds an explicit limitation.

## Contradictions

The deterministic rules currently recognize these supported tensions:

- independence with consistency, partnership, or recognition
- speed with analysis
- structure with sensitivity
- harmony with directness
- freedom with stability

A detected contradiction means both signals are present. It does not establish why the tension developed, diagnose a cause, or invent biography.

## Compatibility

The adapter calls the existing `synthesizeCodex(profile)` function for established deterministic text where useful. It does not mutate the profile, replace the current synthesis return type, or alter existing callers.

## Validation Boundary

The synthesis implementation is validated through the repository's permanent workspace build, type-check, test, and production-build workflows. The documentation records behavior and guardrails; passing examples remain enforced by executable tests rather than prose alone.
