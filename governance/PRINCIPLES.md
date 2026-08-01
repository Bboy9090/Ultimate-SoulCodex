# Soul Codex Principles

These are the non-negotiable standards against which every feature, every prompt, every release is evaluated.

## 1. Calculated Facts Are Never Altered by AI

If the math says Sun is in Virgo, the AI cannot reframe it as "Virgo-Libra cusp" for narrative purposes.

**Implementation**:
- Calculation code is separate from interpretation code
- Calculated facts are stored as immutable records
- Tests verify calculations against ephemeris data
- Gold Standard Dataset catches silent drift

**What This Enables**:
- Users can verify our math independently
- Users trust because they can check
- Reproducibility across time (same chart = same calculations)

## 2. Every Interpretation Must Trace Back to Evidence

No floating claims. No interpretations without sources.

**Implementation**:
- Every reading shows "Evidence" button
- Evidence links specific statements to specific calculations
- Confidence levels are shown
- Sources are cited (astrology, numerology, Human Design, etc.)

**What This Enables**:
- Transparency (users understand reasoning)
- Accountability (we can be questioned)
- Consistency (interpretations are linked to facts)

## 3. Unknown Data Is Labeled, Never Guessed

If we don't know something, we say so. We don't fill gaps with AI speculation.

**Implementation**:
- Birth time fields show certainty level (known, estimated, unknown)
- Provisional readings show which parts are uncertain
- Calculations requiring unknown data show confidence reduction
- Users can trigger "show uncertainty" mode

**What This Enables**:
- Trust (users know what's verified vs. provisional)
- Better decisions (users weight uncertain readings appropriately)
- Data improvement (users can add missing info to improve future readings)

## 4. Users Can Inspect How Every Conclusion Was Reached

No black boxes. Show your work.

**Implementation**:
- Every reading has an "Evidence" button that expands
- Every prediction shows calculation basis
- Every recommendation shows which chart factors support it
- Source calculations are visible (not just conclusions)

**What This Enables**:
- Intellectual honesty (we can't hide weak reasoning)
- User learning (people understand astrology/numerology better)
- Criticism (users can point out if reasoning is wrong)

## 5. AI Supports Decisions; It Does Not Replace Human Judgment

We're a tool for thinking, not a replacement for thinking.

**Implementation**:
- Language guardrails prevent prescriptive language
- Prompts use "consider," "explore," "suggests" not "must," "should," "will"
- Every recommendation acknowledges human agency
- Users remain in control of decisions

**What This Enables**:
- Ethical responsibility (we don't pretend to run lives)
- Legal protection (users choose, we advise)
- User empowerment (people trust themselves more)

## 6. Personal Growth Is Measured Over Time, Not in Isolated Readings

One reading is a data point. Six months of readings is a trajectory.

**Implementation**:
- Memory engine tracks patterns across time
- Soul Replay shows quantified change
- Growth metrics are visible (anxiety reduction, relationship improvement, etc.)
- Coaching is longitudinal, not episodic

**What This Enables**:
- Real change detection (we can see actual growth)
- Coaching effectiveness (memory-based guidance)
- User stickiness (people return for tracking, not just readings)

## 7. Transparency Is More Valuable Than Certainty

"I don't know, but here's what the data suggests" beats "I know" with no evidence.

**Implementation**:
- Confidence levels are always shown
- Uncertainty is explicit, not hidden
- Provisional interpretations are labeled
- Trade-offs are acknowledged (e.g., "birth time estimated")

**What This Enables**:
- Trust building (we admit what we don't know)
- User wisdom (people learn to weight information)
- Long-term credibility (we never get caught bullshitting)

## 8. The Platform Exists to Support Better Decisions, Not Predict Destinies

Prediction should enable agency, not remove it.

**Implementation**:
- Guidance is probabilistic, not deterministic
- Readers are positioned as co-creators of their story
- Behavioral predictions are "likely patterns" not "fates"
- Timeline guidance enables choice-making, not fate acceptance

**What This Enables**:
- User autonomy (people feel empowered, not controlled)
- Legal safety (we're not claiming to read futures)
- Ethical clarity (we're coaching, not fortune-telling)

## 9. Every Release Must Pass Regression Testing

Silent personality drift is the death of trust.

**Implementation**:
- Gold Standard Dataset is mandatory before release
- Automated comparison of new output vs. known-good output
- Mismatches halt release until investigated
- Every mismatch generates an incident report

**What This Enables**:
- Continuous safety (personality can't drift silently)
- Accountability (every change is logged)
- Regression detection (we catch bugs before users do)

## 10. Governance Outlasts Features

Principles, standards, and architecture constrain code. That's healthy.

**Implementation**:
- Canonical documents are versioned (Constitution v1.0)
- Changes to principles require review (like API changes)
- ADRs document major decisions
- Style guide is enforced in every prompt

**What This Enables**:
- Coherence (platform doesn't drift in ten directions)
- Onboarding (new contributors learn the "why")
- Defense (we can explain every major decision)

---

## How Principles Are Enforced

### During Development
- Code review checks for principle violations
- Prompt review ensures style guide compliance
- Tests verify principles (e.g., calculation immutability)

### Before Release
- Gold Standard Dataset run catches drift
- Principle compliance audit by product team
- Manual review of new AI-generated output

### After Release
- User reports flagged for principle concerns
- Weekly review of customer feedback for violations
- Monthly principles audit against live platform

### Quarterly
- Dedicated principles review meeting
- Examination of any principle trade-offs
- Updates to enforcement mechanisms

---

## Trade-offs

These principles sometimes conflict with speed, feature volume, or user convenience.

When conflicts arise:
1. **Acknowledge the conflict explicitly** (in writing)
2. **Evaluate the trade-off** (which principle matters more here?)
3. **Make the deliberate choice** (principle wins, or we document the exception)
4. **Record the decision** (ADR or decision log)

We may sometimes choose speed over perfect transparency. But that's a **deliberate choice we can explain**, not an accident.

---

## The Sentence

**Every product decision should pass this test: Does it make the platform more trustworthy?**

If yes, do it.
If no, don't.
