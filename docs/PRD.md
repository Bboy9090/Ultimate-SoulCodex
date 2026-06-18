# Soul Codex - Product Requirements Document (PRD)

**Product Name:** Soul Codex
**Version:** 1.0 (Reforged MVP)
**Last Updated:** 2026-05-23
**Owner:** Bobby's World / Blue Phoenix OS

---

## 1. Product Vision

Soul Codex is a personal insight and journaling application that combines multiple wisdom systems (astrology, numerology, Human Design, Gene Keys, and more) into one unified experience. It provides daily guidance with deep metaphysical calculations underneath, all with explicit confidence labeling.

**Mission:** Help people understand themselves and their relationships through integrated multi-system analysis.

**Not in Scope:** Prediction-first features, fortune-telling tone, social/community features, medical diagnosis.

---

## 2. Target Users

### Primary Audience
- **Self-discovery seekers**: People interested in personal growth and understanding behavioral patterns
- **Spiritual explorers**: Users familiar with astrology, Human Design, or similar systems
- **Journal enthusiasts**: People who want guided reflection prompts tied to their unique profile

### User Personas

**Persona 1: The Explorer**
- Age: 25-40
- Wants to understand their patterns and strengths
- May have basic astrology knowledge
- Looking for actionable insights, not just reading entertainment

**Persona 2: The Practitioner**
- Age: 30-55
- Deep knowledge of one or more systems (astrology, HD, etc.)
- Wants calculation accuracy and system integration
- Values transparency in confidence levels

**Persona 3: The Journaler**
- Age: 20-45
- Uses journaling for self-reflection
- Wants prompts that are personalized, not generic
- Appreciates tracking mood and energy alongside transits

---

## 3. Core Features (MVP)

### 3.1 Profile Onboarding
**What:** Users create their profile with birth data and behavioral pattern questions.

**Requirements:**
- Name (required)
- Birth date (required)
- Birth time (optional but encouraged for accuracy)
- Birth location (optional but encouraged for accuracy)
- Behavioral pattern questions (pressure, escalation, decision-making, drain patterns)

**Success Criteria:**
- Profile can be created with just name and birth date
- Clear messaging about what improves with birth time/location
- Data stored securely (encrypted at rest if DATABASE_URL is set)
- Demo mode works without database (DEMO_MODE=true)

### 3.2 Reading Dashboard
**What:** Multi-system synthesis showing user's complete soul reading.

**Requirements:**
- Daily context page (Today view)
- Profile page with full chart breakdown
- Codex Reading page (AI-synthesized narrative)
- All calculations use real ephemeris data (no lookup tables)
- Confidence badges on all outputs (high/medium/low/unknown)
- Clear labeling when birth time is missing

**Systems Integrated:**
- Western Astrology (Sun, Moon, Rising, planets, houses)
- Human Design (Type, Strategy, Authority, Gates, Channels)
- Gene Keys (Activation Sequence)
- Numerology (Life Path, Expression, Soul Urge, Personality, Maturity)
- I Ching hexagrams
- Tarot daily card

**Success Criteria:**
- All pages load without errors
- Calculations match known reference data (validated via test fixtures)
- Missing birth time shows graceful degradation (no Rising sign, lower confidence)
- No fake or placeholder data in production paths

### 3.3 Journal System
**What:** Guided reflection prompts with mood/energy tracking.

**Requirements:**
- 100+ reflection prompts across 12 categories
- Prompt categories: daily-reflection, shadow-work, gratitude, future-vision, past-healing, relationships, purpose, transits, elemental, archetype, values, growth
- Intensity levels: gentle, moderate, deep, transformative
- CRUD operations for journal entries (Create, Read, Update, Delete)
- Optional mood and energy level (1-10) per entry
- Transit context attached to entries when available

**Backend API (already exists):**
- `GET /api/journal/prompts` - Get all prompts or filter by category/intensity
- `GET /api/journal/prompts/:id` - Get specific prompt
- Additional endpoints for entries (to be implemented in future PR)

**Frontend (pending implementation):**
- Journal page at `/journal` route
- Browse prompts by category
- Write/edit/delete entries
- View past entries with filters (date, mood, tags)

**Success Criteria:**
- Users can browse and select prompts
- Entries are saved and retrievable
- No data loss on page refresh
- Works offline-first (localStorage cache)

### 3.4 Saved Insights
**What:** Bookmark and revisit key reading sections.

**Requirements:**
- Save/unsave any reading section (one-click)
- Saved insights page showing all bookmarks
- Organize by date saved or reading type
- Export/share saved insights (future: PDF)

**Success Criteria:**
- Saved insights persist across sessions
- Clear UI affordance (star/bookmark icon)
- No duplicate saves

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Initial page load < 3 seconds on 3G
- Reading generation < 10 seconds (with AI synthesis)
- Offline-capable after first load (service worker caching)

### 4.2 Security
- No secrets in client-side code
- Session management with httpOnly cookies
- Password hashing with argon2
- Database credentials never exposed to client

### 4.3 Reliability
- No placeholders or mocks in production paths
- All features work end-to-end before merge
- Confidence labeling on all uncertain data
- Graceful degradation when APIs unavailable

### 4.4 Accessibility
- WCAG 2.1 AA compliance (color contrast, keyboard navigation)
- Screen reader support for all interactive elements
- Mobile-responsive (works on phones, tablets, desktop)

### 4.5 Data Privacy
- User data stored securely (encrypted at rest)
- No third-party tracking or analytics (for MVP)
- Clear privacy policy and terms of service
- User can export/delete their data

---

## 5. Known Limitations (MVP)

- **No social features**: No sharing to social media, no community feed
- **Basic personalization**: Not deeply customized readings yet
- **AI requires API keys**: GEMINI_API_KEY or OPENAI_API_KEY needed for synthesis
- **No mobile native app**: PWA-first approach (web app installable)
- **English only**: No i18n/localization in MVP
- **Journal UI pending**: Backend exists, frontend page pending
- **Saved Insights pending**: Backend schema ready, frontend UI pending

---

## 6. Success Metrics

### MVP Launch Criteria
- All four core features work end-to-end
- scripts/healthcheck.sh passes
- scripts/smoke-test.sh passes
- No console errors on page load
- Demo mode works without external dependencies

### Post-Launch Metrics
- User retention (7-day, 30-day)
- Journal entries per active user
- Profile completion rate (birth time/location added)
- AI reading generation success rate
- Page load performance (Core Web Vitals)

---

## 7. Future Roadmap (Post-MVP)

See `ROADMAP.md` for details.

**v1.1 (Next 2-3 Months):**
- Improved onboarding (location autocomplete)
- Profile refinements (inline explainers)
- Daily enhancements (push notifications)
- Compatibility improvements (synastry chart viz)
- PDF polish

**v1.2 (3-6 Months):**
- Enhanced journaling UI
- Mood & frequency tracker
- Transit calendar (30-day view)
- Premium gating (graceful paywall)
- Demo mode improvements

**Intentionally Deferred:**
- Social/community feed
- Coach/practitioner marketplace
- Third-party integrations (Apple Health, etc.)
- Predictive forecasting timeline
- Mobile native app (iOS/Android separate binaries)
- Localization/i18n

---

## 8. Technical Dependencies

### Core Stack
- Node.js 20
- TypeScript 5.7
- React 18.3
- Express 4.22
- Vite 5.4
- PostgreSQL (optional, demo mode uses in-memory storage)

### Key Libraries
- astronomy-engine 2.1.19 (ephemeris calculations)
- @google/generative-ai 0.24 (AI synthesis)
- drizzle-orm 0.39 (database ORM)
- wouter 3.3 (client-side routing)
- framer-motion 11.13 (UI animations)

### External APIs (Optional)
- Google Gemini API (AI synthesis)
- OpenAI API (fallback for AI synthesis)
- Geocoding API (for location lookup, future enhancement)

---

## 9. Release Checklist

See `docs/RELEASE_CHECKLIST.md` for full checklist.

---

## 10. Open Questions / Decisions Needed

- **Q:** Should journal entries be encrypted client-side before storage?
  **Status:** Pending decision (consider for v1.1)

- **Q:** What's the premium tier structure? (features, pricing)
  **Status:** Deferred to v1.2 planning

- **Q:** Native mobile apps or PWA-only?
  **Status:** PWA-first for MVP, native apps in future if demand exists

---

## Appendix A: Glossary

- **Soul Codex**: The application name; also refers to the complete multi-system reading
- **Reading**: The synthesis of all calculation outputs (astrology, HD, numerology, etc.)
- **Confidence**: Label indicating data quality (high/medium/low/unknown)
- **Demo Mode**: In-memory storage mode (DEMO_MODE=true) for testing without database
- **Transit**: Current planetary position and its relationship to natal chart
- **Synastry**: Relationship compatibility analysis between two birth charts
- **Ephemeris**: Astronomical data for planetary positions

---

## Appendix B: References

- Product Doctrine: `docs/soul-codex/product-doctrine.md`
- System Boundaries: `docs/soul-codex/system-boundaries.md`
- Confidence Rules: `docs/soul-codex/confidence-rules.md`
- Calculation Contract: `docs/engine/calculation-contract.md`
