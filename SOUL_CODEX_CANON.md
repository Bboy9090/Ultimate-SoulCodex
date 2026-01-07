# Soul Codex Canon — Identity Translation Engine (Final Form)

This document captures the non-negotiable standards for the completed Soul Codex experience. It translates the narrative blueprint into implementation-ready guardrails for engineers, writers, and designers. Every section answers what it is, why it matters, how it shows up for users, and how to integrate it.

## 1) Core Law: No Silent Symbols
- Raw signals (astrology, numerology, Human Design, tarot, I Ching, runes, chakras, elements, Gene Keys, etc.) are never surfaced without contextual meaning.
- Every rendered unit must answer, in order: what it is, why it exists, why it matters to the user, how it shows up (patterns/behaviors), and how to integrate (awareness + choice, never deterministic advice).
- Outputs that cannot satisfy these fields are blocked or downgraded with an explicit "still synthesizing" state.

## 2) Explanation Engine Architecture
- **Pipeline:** Raw calculation → Symbol resolver → Meaning translator → Personal context mapper → Cross-system synthesizer → UX narrator. Failure at any stage stops rendering and surfaces a user-facing state rather than placeholder text.
- **MeaningTranslation contract:**
  - `whatItIs`
  - `whyItExists`
  - `whyItMattersToUser`
  - `realLifeManifestations[]` (patterns, habits, stress responses)
  - `shadowPattern?`
  - `growthPotential`
  - `integrationPrompt`
- **SynthesisInsight contract:**
  - `coreTheme`
  - `supportingSignals[]`
  - `conflictingSignals[]?`
  - `livedExperienceSummary`
  - `integrationGuidance`
- **Explanation density modes:** `essence` (2–3 sentences), `expanded` (1–2 paragraphs), `deepDive` (system mechanics), `scholar` (lineage + math). Scholar is opt-in only.

## 3) System Translation Templates (Applies to 30+ Systems)
Each template includes surface meaning, lived expression, shadow/overuse, and integration. No fatalism, no superiority language, no fear hooks.

This section documents the template patterns using representative systems only. The subsections below (Astrology, Numerology, Human Design, Gene Keys, Tarot, I Ching, Runes, Elements, Chakras / Energy Systems) are examples, not an exhaustive enumeration of all 30+ systems wired into the engine. The full, authoritative list of supported systems MUST be maintained in the living **System Registry** (implementation document) and kept in sync with this canon.
### Astrology (Planets, Signs, Houses, Aspects)
- Planet = function; Sign = style; House = life arena; Aspect = relationship between functions.
- **Moon–Jupiter relationship example (Moon in strong aspect to Jupiter):** emotional regulation operates through meaning and expansion; nourished by purpose; shadow is overextension or bypass via optimism; integration is growth with boundaries.
- **Sun in Venus example:** identity expresses through harmony/beauty/relationship; shadow is approval-seeking; integration pairs truth with beauty.
- **Asteroids:** archetype role → activated domain → behavioral pattern → healthy expression → misalignment → integration (e.g., Chiron = pain-to-wisdom training, not brokenness).
- **Fixed Stars:** psychological theme + modern expression + projection risk; never fate claims.

### Numerology
- Every number: core drive → stress behavior → growth challenge → mature expression → cross-system confirmation. Example Life Path 7: drive to understand truth; stress = withdrawal/over-analysis; growth = trust lived experience; maturity = quiet authority without isolation.

### Human Design (De-cultified)
- Translate into biology + psychology + decision impact + environment alignment + common misuse. Example Sacral Authority: bodily energy approval; success when energy agrees; burnout when mind overrides; integrate by letting energy approve before logic commits.

### Gene Keys
- Shadow (default behavior) → Gift (conscious expression) → real-life example → integration question. Always answer "what does this look like on a random weekday?"

### Tarot / I Ching / Runes
- Mirror patterns, never predictions. Each draw: pattern active → choice highlighted → consequence if ignored → outcome if engaged.

### Elements / Chakras / Energy Systems
- Functional role → behavioral expression → stress signal → integration practice (communication style, somatic habits, emotional regulation). No floating abstractions.

## 4) Great Synthesis Layer
- **Agreement detection:** surface themes confirmed by multiple systems (e.g., autonomy vs harmony echoed by astrology, numerology, Human Design).
- **Tension mapping:** articulate conflicts (e.g., emotional need for safety vs life path demanding risk) without pathologizing.
- **Identity through time:** show childhood expression → adolescent distortion → adult integration → mature potential; identity is developmental, not fixed.

## 5) UX as Teacher
- Every state speaks: loading ("synthesizing layers…"), partial, retrying, delayed, recovered. Transitions explain what changed; empty states explain what's missing; completion states explain what integrated. No silent UI.

## 6) Ethics Lock (Mandatory)
- No death/disaster predictions, no destiny declarations, no superiority language, no dependency loops, no fear hooks. Always frame as patterns + choice with psychological safety language.

## 7) Delivery Readiness Checklist
- Content: every symbol mapped to the MeaningTranslation contract with density variations authored and versioned.
- Engineering: rendering blocked if any contract field is empty; opt-in Scholar mode only; logging for blocked outputs without exposing stack traces to users.
- QA: test cases for agreement detection, tension mapping, and per-system template completeness; verify UI states for calculating/partial/retrying/delayed/recovered.
- Docs: public manifesto line is fixed — "Soul Codex translates identity; it doesn't predict fate."

## 8) Next Execution Steps (Production Track)
1. Generate the full explanation library (per system, per symbol) conforming to templates and density levels.
2. Encode contracts as shared TypeScript types and JSON schemas; enforce server-side validation before render.
3. Wire synthesis engine to surface agreement/tension statements with real-life summaries and integration guidance.
4. Author UX copy for all system states (loading, partial, retrying, delayed, recovered, empty, complete) to maintain the "never silent" rule.
5. Ship ethics/unit tests ensuring no deterministic or superiority language leaks into production outputs.
