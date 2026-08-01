# ADR-001: Separation of Calculated Facts from Interpretation

## Status
Accepted

## Date
August 1, 2026

## Decision

Soul Codex strictly separates **calculated facts** from **interpretation**.

### Calculated Facts
- Birth chart positions (Sun sign, Moon sign, Rising sign, planets, houses)
- Numerological reductions (Life Path, Personal Year, Personal Month, Personal Day)
- Human Design type and authority
- Tarot card draw results
- Transit calculations
- Aspect calculations

**Rule**: Calculated facts are never modified, reframed, or altered by AI for narrative purposes.

### Interpretation
- Meaning of placements
- Behavioral predictions
- Advice and recommendations
- Compatibility analysis
- Personal growth guidance
- Coaching suggestions

**Rule**: Interpretation must always trace back to calculated facts. Interpretations can change, but the facts they're based on cannot.

## Reason

This decision serves four critical functions:

### 1. Trust
Users can verify that calculations are correct. If they know their birth time and location, they can independently check the birth chart. If calculations match, they trust the platform.

### 2. Reproducibility
Every reading can be regenerated. If a user loads their profile six months later, the same birth chart produces the same calculations. This enables coaching and pattern-tracking over time.

### 3. QA and Regression Detection
We maintain a Gold Standard Dataset of 100+ birth charts with known correct outputs. Every release compares new output against known outputs. A mismatch means either:
- The calculation changed (would require an ADR)
- The interpretation changed (acceptable, logged)
- A bug was introduced (must be fixed)

### 4. Transparency and Accountability
When users ask "why am I a Virgo?", we can say: "Your Sun is at position X degrees in the zodiac. That's the Virgo range. Here's the calculation." No ambiguity. No AI bullshit.

## Consequences

### For Developers
- Calculation code and interpretation code must be separate
- Calculated facts must be stored as immutable records
- Any change to calculation logic requires its own ADR
- Tests must verify calculations against ephemeris data (astronomy engine)

### For AI/Prompt Engineers
- Prompts can never contain instructions like "adjust the reading to sound better"
- Prompts must always reference evidence
- Interpretations must be traceable to specific calculated facts
- Confidence levels are required for all interpretations

### For Product Design
- Every reading must show "Evidence" button that reveals calculations
- Every prediction must show confidence level and calculation basis
- When interpretations change, the change is logged and versioned
- Users can always request to see the math

### For QA
- Every release runs against Gold Standard Dataset
- Output comparison is automated
- Regression detection is automatic
- No personality drift goes undetected

## Trade-offs

### Benefit: Trust
Users know we're not manipulating data for entertainment value.

### Cost: Flexibility
We can't "improve" a reading by adjusting the chart to make it sound better. If we want to improve readings, we improve interpretation or add more data, not alter calculations.

### Benefit: Defensibility
If a user claims our reading was wrong, we can show them the calculation. We can prove we didn't make it up.

### Cost: Complexity
We need to maintain two separate systems (calculation + interpretation) instead of one unified system.

## Examples of This Principle in Action

### Allowed
- "Your Virgo Sun suggests analytical thinking. This aligns with your Life Path 8 (leadership through systems)."
  - ✅ Facts are correct
  - ✅ Interpretation connects to facts
  - ✅ Confidence is implied (high)

### Not Allowed
- "Your Virgo Sun suggests analytical thinking, but we'll soften that because tarot pulled Hermit (which contradicts it)."
  - ❌ Facts being reinterpreted to match narrative
  - ❌ Calculation basis is being masked
  - ❌ User can't verify the logic

### Allowed
- "Your Virgo Sun is analytical. However, you also have Sagittarius rising, which loves exploring. This creates internal tension between analysis and adventure."
  - ✅ All facts stated
  - ✅ Interpretation acknowledges apparent contradiction
  - ✅ User can verify both facts

### Not Allowed
- "You're a Virgo (simplified for user engagement, even though technically your chart is more complex)."
  - ❌ Fact is being oversimplified without disclosure
  - ❌ User thinks chart is simpler than it is
  - ❌ Future coaching based on wrong model

## Monitoring

- [ ] Every release: Run Golden Dataset test
- [ ] Every quarter: Audit interpretation prompts for calculation references
- [ ] Every release: Verify confidence levels are present where required
- [ ] Ongoing: User reports of "reading changed" trigger investigation

## Related ADRs
- ADR-002: Why Evidence Engine Exists (interpretation traceability)
- ADR-003: Why Golden Dataset is Mandatory (regression detection)

## Approved By
Product team, engineering team, data QA team
