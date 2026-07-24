# DepthSoulGuide

`DepthSoulGuide` is the progressive-disclosure renderer for `DepthInterpretationV1`.

## Usage

```tsx
import DepthSoulGuide from "./components/DepthSoulGuide";

<DepthSoulGuide interpretation={depthInterpretation} />;
```

Optional props:

```tsx
<DepthSoulGuide
  interpretation={depthInterpretation}
  defaultOpenGroupIds={["gift-and-shadow"]}
  defaultEvidenceOpen={false}
/>;
```

## First View

The component always begins with:

1. Your Core Pattern
2. The Main Contradiction
3. What To Do With It

All other layers remain available through accessible disclosure buttons.

## Evidence

The layer-evidence toggle exposes claim kind, source support, evidence IDs, and limitations.

The evidence drawer exposes:

- source-system records
- field values
- provenance
- birth-time sensitivity
- evidence notes
- missing data

Interpretation confidence is labeled as source support. The component does not reuse the birth-data `ConfidenceBadge`, because verification of birth data and support for an interpretive claim are different concepts.

## Compatibility

This component is additive. It does not replace the existing Timeline-based `SoulGuide` component, issue provider requests, read profile storage, or generate interpretations. A caller must supply a validated `DepthInterpretationV1`.
