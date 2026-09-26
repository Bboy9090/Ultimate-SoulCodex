# Changelog

All notable changes to Soul Codex are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## Current production-status correction — 2026-09-26

The v1.0.0 notes below are preserved as a historical record of what the project described at that time. They are **not** the current production system contract.

Current authority is `shared/system-registry.ts`, mirrored in `governance/SYSTEM_REGISTRY.md`. In particular:

- Soul Codex does **not** currently claim that 35+ systems are production-governed or active in every reading.
- Stable identity synthesis is limited to governed, evidence-qualified natal astrology, deterministic numerology core, and verified Human Design core.
- MBTI / Enneagram are explicit user-assessment context only; they are not inferred from a birth chart.
- Gene Keys, Vedic astrology / Nakshatras, Tarot birth cards, I Ching, Runes, Chinese astrology, Mayan systems, chakras, sacred geometry, fixed stars, astrocartography, and other quarantined systems do not enter current production synthesis unless and until their own contracts are promoted.
- Unknown birth time is never silently replaced with noon. Time-sensitive claims remain unresolved or visibly degraded.
- Human Design core must carry its approved verification receipt and independent-source evidence before it may influence verified synthesis.
- Current Compatibility uses the governed evidence-aware router rather than the historical five-pillar stack.
- Legacy share-link code is not mounted by the production server while its privacy contract remains quarantined.

Historical bullets below may therefore describe retired, experimental, or superseded behavior. They should not be used to infer current product capability.

---

## [1.0.0] — 2026-03-07

### What's in v1.0.0

This is the first shippable release of Soul Codex. The core engine is complete: every calculation runs against real ephemeris data, the 35+ system integrations are wired end-to-end, and the four flagship experiences — Profile, Daily, Compatibility, and Codex Reading — are functional.

### Added

**Profile Engine**
- Birth chart calculation using `astronomy-engine` (real ephemeris, not lookup tables)
- Western astrology: Sun/Moon/Rising, 10 planets, 12 houses, major aspects, Chiron, Black Moon Lilith, North/South Nodes
- Vedic astrology: Jyotish chart, 27 Nakshatras, current Dasha period
- Human Design: Type, Strategy, Authority, Profile, all 9 Centers (defined/open/undefined), active Gates and Channels
- Gene Keys: Full Activation Sequence (Life's Work gate → Evolution → Radiance → Purpose), Shadow → Gift → Siddhi arc
- Numerology: Life Path, Expression, Soul Urge, Personality, Birthday, Maturity, Personal Year numbers
- Tarot: Birth card pair, Year card, Month card (Major Arcana)
- I Ching: Birth hexagram with line reading
- Runes: Birth rune and cycle rune
- Chinese astrology: Year animal, element, inner and secret animals
- Mayan Tzolk'in: Day sign and tone
- Fixed stars: Prominent fixed stars conjunct natal planets within orb
- Elemental medicine: Five-element profile (Wood/Fire/Earth/Metal/Water balance)
- Enneagram: Suggested type and wing based on chart signature
- MBTI overlay: Cognitive function stack correlated to chart
- Chakra system: Dominant and blocked chakras from chart patterns
- Sacred geometry: Core geometric archetype from numerology and chart
- Moral compass: Core values cluster from chart emphasis

**Daily Experience**
- Active planetary transits with orb calculation
- Daily Gene Key (active hexagram)
- Daily Tarot card with AI-interpreted context
- Daily I Ching
- Personal Year / Month / Day numerology
- AI-generated daily synthesis (Google Gemini)

**Compatibility**
- 5-pillar analysis: synastry aspects, Human Design inter-type dynamics, Gene Key resonance, numerology harmony, elemental balance
- Composite chart generation
- Relationship archetype label with interpretation
- Saved people list with quick re-analysis

**Codex Reading**
- Full AI-synthesized narrative reading (Google Gemini, streamed)
- Section-by-section breakdown
- PDF export (profile report and compatibility report)
- Shareable link generation

**Soul Guide**
- AI chat interface (Gemini primary, OpenAI fallback)
- Context-aware: your full profile is in the system prompt
- Conversation history persisted in session

**Infrastructure**
- Express.js backend with PostgreSQL/Drizzle ORM
- In-memory storage fallback (no DB required for development)
- Demo mode (`DEMO_MODE=true`) seeds a complete demo profile
- Passport.js local auth (email + password, Argon2id hashing)
- Apple In-App Purchase integration (Tiered access)
- Push notification support (VAPID)
- Admin dashboard with access codes and analytics
- Health check endpoint (`GET /health`)
- Docker + Railway + Fly.io + Render deployment configs

### Known Limitations in v1.0.0

- Birth time precision: House cusps require accurate birth time. If time is unknown, noon is used as default; Ascendant and house placements will be approximate.
- Human Design authority and profile require exact birth time; without it, results fall back to a simpler calculation.
- AI synthesis requires `GEMINI_API_KEY` or `OPENAI_API_KEY`; without either, AI features return a structured fallback (non-AI) reading.
- Apple App Store configuration required for native in-app purchases.
- Session store uses in-memory by default; configure `DATABASE_URL` for persistent sessions in production.

---

## Upcoming

See [ROADMAP.md](ROADMAP.md) for what's planned in v1.1 and beyond.
