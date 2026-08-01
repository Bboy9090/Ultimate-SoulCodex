# Soul Codex Constitution v1.0

## Preamble

This document establishes the foundational principles and architecture of Soul Codex. It is the social contract between developers, users, and the platform itself.

The Constitution is intentionally stable. Changes to it require explicit deliberation, review, and versioning—just like database schema or API contracts would.

## The Platform Promise

> Soul Codex is an evidence-traceable Human Intelligence Platform that combines verified calculations, transparent symbolic interpretation, contextual AI reasoning, and continuous personal growth into one unified system.

Users can expect:
- **Verified calculations** (reproducible, testable, auditable)
- **Transparent reasoning** (every conclusion traces to evidence)
- **Honest uncertainty** (unknown data is labeled, never guessed)
- **Inspectable logic** (users can see how conclusions were reached)
- **Coaching support** (not command, not prediction of destiny)
- **Longitudinal intelligence** (tracking growth over time)
- **Governance** (the platform is built on principles, not whims)

## The Five Layers (Architecture)

See: governance/ROADMAP-v1.0.md

The platform is built in sequential layers. No layer stands alone. No layer should leapfrog the one beneath it.

- FOUNDATION: Ground truth (calculations, storage, offline)
- INTELLIGENCE: Understanding (evidence, synthesis, context)
- PREDICTION: Foresight (behavioral modeling, decisions)
- COMPANION: Coaching (memory, growth, journaling)
- ENTERPRISE: Scale (organizational intelligence)

## The Ten Principles

See: governance/PRINCIPLES.md

These are non-negotiable standards:

1. Calculated facts are never altered by AI
2. Every interpretation traces back to evidence
3. Unknown data is labeled, never guessed
4. Users can inspect how conclusions were reached
5. AI supports decisions; it does not replace human judgment
6. Personal growth is measured over time, not isolated readings
7. Transparency is more valuable than certainty
8. The platform supports better decisions, not destiny
9. Every release passes regression testing
10. Governance outlasts features

## The Style Guide

See: governance/SOUL-CODEX-STYLE-GUIDE.md

Every reading must follow a consistent format:
- Headline (active, present tense)
- Summary (context)
- Meaning (why it matters)
- Action (what to do)
- Evidence (show the math)
- Confidence (how certain we are)

## Architecture Decision Records (ADRs)

See: governance/ADRs/

Major irreversible decisions are documented in Architecture Decision Records. Every ADR includes:
- The decision
- The reason (why it matters)
- The consequences (what it enables/prevents)

Future ADRs:
- Why Evidence Engine Exists
- Why Human Design Requires Exact Birth Time
- Why Offline Mode Exists
- Why JSON-First Generation Was Chosen

## Golden Dataset

See: governance/golden-dataset/

The Golden Dataset contains 100+ verified birth charts with known correct outputs. Every release is regression-tested against this dataset.

No silent personality drift. No untracked changes. Reproducibility guaranteed.

## Governance Model

### Three Governance Layers

**Layer 1: Principles** (PRINCIPLES.md)
- Non-negotiable standards
- Require deliberate decision to violate
- Apply to every feature, every prompt, every release

**Layer 2: Architecture** (ROADMAP-v1.0.md, Constitution)
- Five-layer sequential structure
- No leapfrogging allowed
- Exit criteria for each phase

**Layer 3: Specifications** (Style Guide, ADRs)
- How principles are implemented
- Can be updated more frequently
- But never in ways that violate Layer 1 principles

### Change Process

**Changing Principles** (PRINCIPLES.md):
1. Documented reason for change
2. Review by architecture + product team
3. Public announcement to users and developers
4. Version bump (e.g., v1.0 → v2.0)

**Changing Architecture** (Roadmap, Phases):
1. Documented reason
2. Review by product team
3. Impact analysis (what breaks if this changes?)
4. Version bump (e.g., Roadmap v1.0 → v1.1)

**Changing Specifications** (Style Guide, ADRs):
1. Documented reason
2. Review by relevant team (copy + AI for style, engineering for ADRs)
3. Regression test to ensure consistency
4. Version bump within specification

### What Stays Stable

Never change without explicit approval:
- Promise (the platform promise stays the same)
- Layers (never remove/reorder layers)
- Principles (only change with major version bump)
- Core calculations (only with ADR)

### What Can Evolve

Continuously improve without freeze:
- Interpretation prompts (as long as calculations don't change)
- UI/UX (as long as principles aren't violated)
- Performance (as long as behavior is identical)
- Evidence engine (more detailed, better structured)

## Versioning

The Constitution and its foundational documents use semantic versioning:

**CONSTITUTION.md**: v1.0, v2.0, etc. (major changes only)  
**ROADMAP**: v1.0, v1.1, v1.2 (minor tweaks) → v2.0 (major restructure)  
**PRINCIPLES**: v1.0, v2.0, etc. (rarely changes)  
**STYLE-GUIDE**: v1.0, v1.1, v1.2, etc. (can change more frequently)  
**ADRs**: Immutable (once written, not changed; new ADRs supersede old ones)  

## Governance Review Cycle

**Weekly**: Engineering team reviews principle violations in code

**Monthly**: Product team reviews specification compliance

**Quarterly**: Architecture team reviews layer health, roadmap alignment

**Annually**: Full governance audit, public report on platform stability

## The Board of Principles

This Constitution is maintained by:
- **Architecture Team** (ensures layers are coherent)
- **Product Team** (ensures roadmap is aligned with market)
- **Engineering Team** (ensures implementation matches spec)
- **User Advocacy** (ensures promises are kept)

Changes require consensus from at least three groups.

## Amendments

Amendments to this Constitution:
1. Proposed in writing with rationale
2. Public 2-week comment period
3. Review by board of principles
4. Vote (3/4 majority to pass)
5. Version bump + changelog
6. Announced to all stakeholders

## The Sentence

You are not building an astrology app.
You are not building a personality test.
You are building a Human Intelligence Platform.

**Understand your patterns. Inspect the reasoning. Track the change. Make better decisions.**

Everything else follows from that.

---

**Constitution v1.0**  
Adopted: August 1, 2026  
Last Reviewed: August 1, 2026
