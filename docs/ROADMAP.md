# Soul Codex — Public Roadmap

This is the real roadmap. No vaporware. If it's listed as live, it works today. If it's listed as coming, it has a reason to exist. If it's not on this list, it's intentionally out of scope for now.

---

## ✅ Live Now (v1.0)

These are the four flagship experiences. They work end-to-end.

### 1. Profile
Enter your birth date, time, and place. The engine calculates all 35+ systems in real time and renders your complete Soul Codex — archetype, strengths, shadow, purpose, life path numbers, Human Design type and gates, Gene Keys, and more.

- Real ephemeris calculations (not lookup tables)
- 35+ integrated systems in one unified reading
- Offline-capable after first load

### 2. Daily
Every day produces a fresh Soul Context — your active transits, the Gene Key of the day, a Tarot card, an I Ching reading, and your current Personal Year/Month cycle. All computed, not curated.

- Refreshes at midnight per your timezone
- AI synthesis (Gemini) ties everything together
- No subscription required

### 3. Compatibility
Add any person by their birth data. The engine runs a 5-pillar compatibility analysis: synastry aspects, Human Design inter-type dynamics, Gene Key resonance, numerology harmony, and elemental balance.

- Full composite chart
- Relationship archetype label
- Save multiple people for quick re-analysis

### 4. Codex Reading
A deeper, AI-synthesized narrative of your full reading — streamed, section by section. Export to PDF for offline reading or sharing.

- Google Gemini streaming (OpenAI fallback)
- Shareable profile link generation
- PDF export (profile and compatibility reports)

---

## 🔜 Coming in v1.1 (Next 2–3 Months)

These are improvements to what already exists, not new surfaces.

- **Improved onboarding**: location autocomplete (no manual lat/long), better birth time uncertainty handling
- **Profile refinements**: "What does this mean?" inline explainers for Human Design, Gene Keys, and Nakshatras
- **Daily enhancements**: push notification at your preferred time, weekly digest
- **Compatibility improvements**: synastry chart visualization, overlay mode for two charts
- **PDF polish**: improved layout, cover page, print-optimized styles
- **Auth hardening**: persistent PostgreSQL sessions (currently in-memory), password reset flow, email verification

---

## 🗓 Planned for v1.2 (3–6 Months)

- **Journaling**: prompted daily journal tied to your Gene Key and transit context
- **Mood & frequency tracker**: log energy, emotions, and synchronicities; correlate to transits over time
- **Transit calendar**: 30-day view of upcoming planetary events with personal relevance scores
- **Premium gating**: graceful paywall for AI-heavy features (Codex Reading, Soul Guide, PDF export)
- **Demo / guest mode improvements**: better onboarding for first-time visitors without accounts

---

## ❌ Intentionally Out of Scope (for now)

These are features that have been discussed but are not being built until the four flagship experiences are excellent.

| Feature | Why it's deferred |
|---|---|
| Social / community feed | Adds complexity; not core to personal insight |
| Coach/practitioner marketplace | Requires trust & safety infrastructure not yet built |
| Third-party integrations (Apple Health, etc.) | Not validated by users as a need |
| Predictive / future forecasting timeline | Requires much more UX care to avoid "fortune telling" tone |
| Mobile native app (iOS/Android) | PWA-first approach covers 80% of the use case |
| Localization / i18n | Not prioritized until user base is established |
| Group / synastry for 3+ people | Complexity vs. value ratio too high right now |

---

## How We Decide What Ships

A feature ships when:
1. It works end-to-end (no placeholders, no mock data in production)
2. It does not break existing functionality
3. It fits within the core mission: *help people understand themselves and their relationships through integrated multi-system analysis*

If a feature does not serve the four flagship experiences, it does not ship in v1.x.
