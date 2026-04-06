# Soul Codex — AI Development Guide

## Overview

Soul Codex is a mobile-first personality and compatibility application that synthesizes 35+ spiritual and psychological systems (Western/Vedic/Chinese/Mayan astrology, numerology, Human Design, Gene Keys, Tarot, I Ching, Runes, Chakras, Ayurveda, Biorhythms, etc.) into actionable personal insights. Users create a "soul blueprint" from their birth data, explore compatibility with others, receive daily AI-powered insights, and chat with an AI Soul Guide.

**Core mission:** Empower users through non-deterministic, empowering personality insights — never fatalistic predictions.

**Business model:** Freemium — Free tier (5 saved people, 3 compatibility analyses/month) vs. Premium tier (unlimited access, advanced journaling, transit calendar, PDF export).

**Current status:** MVP implemented with full backend/frontend structure. Premium features (journaling, transit calendar, PDF export) are implemented. Stripe payments and Gemini AI are integrated.

---

## User Preferences

Preferred communication style: Simple, everyday language.

Additional agent rules (from AGENTS.md — non-negotiable):
- **No illusion rule:** Never invent results, fake success, or use placeholders/mocks in production paths. Mocks only in `tests/`.
- **Audit-first:** Read and understand existing code before making changes. Verify claims by running builds/tests.
- **Proof required:** Show actual build output, test results, lint output — never claim something passed without running it.
- **Small focused PRs only:** One focused change per PR/commit.
- **No uncontrolled command execution:** Validate commands before running.

---

## System Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Radix UI (shadcn/ui) |
| Backend | Node.js 20 + Express.js |
| Database | PostgreSQL via Neon serverless (Drizzle ORM) |
| AI | Google Gemini (primary), OpenAI GPT-4 Turbo (secondary) |
| Payments | Stripe subscriptions |
| Build | esbuild (custom `build-client.js` script) |
| Deployment targets | Railway, Render, Fly.io, VPS |

### Frontend Architecture

- **Location:** `client/src/`
- **Framework:** React 18 + TypeScript, single-page app
- **Styling:** Tailwind CSS with CSS custom properties for theming (5 pre-built themes in `frontend/src/styles/themes/`)
- **UI components:** shadcn/ui (Radix UI primitives), config in `components.json`
- **Module aliases:** `@` → `client/src`, `@shared` → `shared/`, `@assets` → `attached_assets/`
- **Build:** esbuild via `build-client.js`, outputs to `dist/public/`; dev uses Vite
- **Key pages:** LandingPage, SoulArchetypePage, profile creation flow, compatibility, daily insights, AI chat, PDF export

**Theme system:** All color variables are CSS custom properties in theme files. Switching themes changes the imported CSS file. Five themes: Mystical Cyan (default), Cosmic Purple, Solar Gold, Emerald Mystic, Rose Mystic.

### Backend Architecture

- **Location:** Root-level `.ts` files (flat structure — not in a `server/` subdirectory)
- **Framework:** Express.js
- **Entry point pattern:** Express server serves both API routes and the built React SPA
- **Key service files at root level:**
  - `astrology.ts` — Western astrology calculations using `astronomy-engine`
  - `human-design.ts` — Human Design type/authority/gate calculations
  - `numerology` — Life path, expression, soul urge calculations
  - `compatibility.ts` — Multi-system compatibility scoring
  - `daily-insights.ts` — Daily personalized insight generation
  - `horoscope.ts` — Real-time transit-based horoscope generation
  - `gemini.ts` — Google Gemini AI client (streaming + non-streaming)
  - `entitlement-service.ts` — Premium access checking (Stripe + access codes + manual override)
  - `congruence.ts` — Frequency logging and alignment scoring
  - `db.ts` — Neon PostgreSQL pool + Drizzle ORM instance (nullable — falls back to MemStorage if no `DATABASE_URL`)

**Storage pattern:** The app supports a `MemStorage` fallback when `DATABASE_URL` is not set (bootstrap mode). Production always uses PostgreSQL via Neon.

### Database

- **ORM:** Drizzle ORM
- **Dialect:** PostgreSQL (Neon serverless in production)
- **Schema location:** `shared/schema.ts`
- **Migrations:** `./migrations/` directory, managed by `drizzle-kit`
- **Config:** `drizzle.config.ts` (requires `DATABASE_URL` env var)

**Key entities (from DATA_MODEL.md):**
- `users` — Auth and subscription info (Stripe subscription ID, status, plan, manual premium override, access codes)
- `soul_profiles` — 1:1 with users, stores all 35+ system calculation results as JSONB columns
- `persons` — Saved people for compatibility (up to 5 free, unlimited premium)
- `compatibility_analyses` — M:N via persons, cached analysis results
- `daily_insights` — Per-user daily insight cache
- `assessment_responses` — Questionnaire answers
- `frequency_logs` — Daily emotional frequency tracking for congruence scoring
- `local_users` — Local/guest session support

### Authentication & Authorization

- **Entitlement service** (`entitlement-service.ts`): Checks premium status via 3 sources in priority order:
  1. `manualPremiumOverride` flag (admin override)
  2. Stripe subscription (`active` or `trialing` status)
  3. Access codes (time-limited codes stored in DB)
- **Memoization:** Premium status checks are memoized via `memoizee` to reduce DB load
- **Session support:** Both `userId` and `sessionId` (guest sessions) are supported

### AI Integration

- **Primary AI:** Google Gemini (`gemini-1.5-flash` default) via `gemini.ts`
  - Supports both one-shot `generateText()` and streaming `streamChat()` for the AI Soul Guide chat
  - Graceful degradation: if `GEMINI_API_KEY` is missing/dummy, AI features are disabled (not crashed)
- **Secondary AI:** OpenAI GPT-4 Turbo for certain generation tasks
- **Safety layer:** All AI outputs follow non-determinism rules (modal verbs, empowering framing, no fatalistic predictions)

### Calculation Engine (Pure TypeScript)

All 35+ systems are calculated server-side in pure TypeScript:
- `astronomy-engine` npm package for real astronomical calculations (planet positions, aspects, transits)
- `date-fns` + `date-fns-tz` + `geo-tz` for timezone-aware birth time handling
- Custom geocoding via a hardcoded city database (`geocoding.ts`) — no external geocoding API dependency
- All calculations are deterministic given birth data (date, time, location)

### Shared Code

- **Location:** `shared/` directory
- **Purpose:** Types and schema shared between frontend and backend
- **Key file:** `shared/schema.ts` — Drizzle schema + TypeScript types (e.g., `Profile`, `BirthData`)

---

## External Dependencies

### Required Environment Variables

| Variable | Purpose | Required |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Production only (app bootstraps without it) |
| `GEMINI_API_KEY` | Google Gemini AI | For AI features |
| `OPENAI_API_KEY` | OpenAI GPT-4 | For certain AI generation |
| `STRIPE_SECRET_KEY` | Stripe payments backend | For premium subscriptions |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation | For subscription events |

### Third-Party Services

| Service | Purpose | Notes |
|---------|---------|-------|
| **Neon** | Serverless PostgreSQL | Primary database in production |
| **Google Gemini** | AI Soul Guide chat + insight generation | Primary AI, gracefully degrades if unavailable |
| **OpenAI** | Secondary AI generation | GPT-4 Turbo |
| **Stripe** | Subscription payments | Free vs. Premium tier gating |
| **Microsoft Clarity** | Analytics | GDPR-compliant, frontend only |

### Key npm Packages

| Package | Purpose |
|---------|---------|
| `astronomy-engine` | Accurate planet position calculations |
| `date-fns` + `date-fns-tz` | Date math and timezone conversion |
| `geo-tz` | Timezone lookup from lat/lon |
| `@neondatabase/serverless` | Neon PostgreSQL client |
| `drizzle-orm` | ORM layer |
| `@google/generative-ai` | Gemini SDK |
| `memoizee` | Premium status caching |
| `ws` | WebSocket support for Neon serverless |
| `esbuild` | Production frontend build |

### Deployment Targets

The app is explicitly designed for Express-capable hosts (not Vercel/Netlify which expect Next.js or static):
- **Recommended:** Railway, Render, Fly.io
- **Self-hosted:** Any VPS (Hetzner, DigitalOcean, Contabo, Oracle Cloud free tier)
- **Database:** Neon (serverless PostgreSQL, works from any host)