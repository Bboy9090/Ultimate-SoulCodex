# Soul Codex - replit.md

## Overview

Soul Codex is a comprehensive spiritual/personality profiling web application that maps users' psychological and metaphysical patterns using a wide array of systems — astrology, numerology, Human Design, Enneagram, MBTI, Gene Keys, Kabbalah, Mayan astrology, I Ching, Chinese astrology, chakra systems, and more. The app synthesizes these systems into unified "soul archetypes" and provides daily guidance, compatibility analysis, AI-powered chat, and journaling features.

The app is a full-stack TypeScript monorepo with:
- A React SPA frontend (in `client/`)
- An Express.js backend (in `server/`)
- Shared schema and types (in `shared/`)
- A PostgreSQL database accessed via Drizzle ORM
- Google Gemini AI for natural language generation and chat

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript, compiled as a Single Page Application (SPA)
- **Build Tool**: Vite for development; custom `build-client.js` using esbuild for production
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS with CSS variables for theming, PostCSS, dark mode support
- **State Management**: TanStack Query (React Query) for server state; local React state for UI
- **Forms**: React Hook Form with Zod resolvers
- **Routing**: Client-side SPA routing (all paths return `index.html`)
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`
- **PWA**: App ships with a `manifest.json` and `sw.js` service worker; supports push notifications

The frontend entry point is `client/src/main.tsx`. The HTML template is `client/index.html`.

### Backend Architecture

- **Framework**: Express.js on Node.js, written in TypeScript
- **Entry Point**: `server/index.ts`
- **API Routes**: Defined in `routes.ts` (main routes) and modular files in `routes/` (chat, compatibility)
- **Auth**: Session-based with Passport.js local strategy (email/password), argon2id password hashing, MemoryStore sessions
- **AI Integration**: Google Gemini (`gemini-1.5-flash`) via `gemini.ts` — used for biography generation, daily guidance, and streaming chat
- **Push Notifications**: `web-push` library with VAPID keys via `push-notifications.ts`
- **Geocoding**: Built-in city database (`geocoding.ts`) for birth location → lat/lon conversion used in synastry/astrology calculations
- **Serving**: In development, Vite dev server middleware; in production, serves static files from `dist/public/`

Key server-side service modules (all in `services/`):
- `astrology.ts` — Western natal chart using `astronomy-engine`
- `numerology.ts` — Life path, expression, personal year numbers
- `human-design.ts` — HD type, authority, profile, gates/channels
- `compatibility.ts`, `synastry.ts`, `compatibility-insights.ts` — Relationship analysis
- `daily-context.ts`, `daily-insights.ts`, `horoscope.ts` — Daily personalized data
- `transits.ts`, `transits-calendar.ts` — Planetary transit tracking
- `vedic-astrology.ts`, `gene-keys.ts`, `i-ching.ts`, `chinese-astrology.ts`, `kabbalah.ts`, `mayan-astrology.ts`, `chakra-system.ts`, `sacred-geometry.ts`, `runes.ts`, `sabian-symbols.ts`, `ayurveda.ts`, `biorhythms.ts`, `asteroids.ts`, `arabic-parts.ts`, `fixed-stars.ts` — 15+ esoteric systems
- `archetype.ts`, `openai.ts` — Synthesis and AI-powered narrative generation
- `elemental-medicine.ts`, `moral-compass.ts`, `parental-influence.ts` — Additional profile dimensions
- `journaling.ts`, `affirmations.ts` — Self-reflection tools
- `congruence.ts` — Progress tracking metric
- `entitlement-service.ts` — Premium access gating

### Data Storage

- **Database**: PostgreSQL (required via `DATABASE_URL` env var)
- **ORM**: Drizzle ORM with schema in `shared/schema.ts`
- **Migrations**: In `migrations/` directory, managed via `drizzle-kit`
- **Storage Interface**: `storage.ts` defines `IStorage` interface — the app defaults to in-memory storage for bootstrap/testing; DB-backed implementation plugs in when `DATABASE_URL` is set
- **Sessions**: `express-session` with `memorystore` (ephemeral; not persisted to DB)

Key entities: `users`, `local_users` (email/password auth), `profiles` (soul data), `persons` (for compatibility), `assessments` (Enneagram/MBTI answers), `access_codes`, `daily_insights`, `push_subscriptions`

### Authentication & Authorization

- Local email/password auth using Passport.js `LocalStrategy`
- Passwords hashed with argon2id (secure settings: 19 MiB memory, 2 time cost)
- Sessions stored in memory (MemoryStore) with 7-day cookie lifetime
- `SESSION_SECRET` env var is required at startup
- Premium access checked via `entitlement-service.ts` — supports Stripe subscriptions, manual overrides, and access codes
- Guest/session-based usage allowed before account creation; session data migrated to user account on signup

### Payments

- Stripe integration (`@stripe/react-stripe-js`, `@stripe/stripe-js`) for subscription-based premium access
- Subscription status tracked in user record (`stripeSubscriptionId`, `subscriptionStatus`, `subscriptionPlan`)

### Poster Generation

- `server/posterSvg.ts` generates SVG birth chart posters server-side
- `sharp` library converts SVG to PNG for download

### Analytics

- Microsoft Clarity embedded in `client/index.html`

---

## External Dependencies

| Service/Library | Purpose | Configuration |
|---|---|---|
| **PostgreSQL** (via Neon serverless) | Primary data store | `DATABASE_URL` env var |
| **Google Gemini AI** (`gemini-1.5-flash`) | Text generation, chat, daily horoscopes | `GEMINI_API_KEY` or `AI_INTEGRATIONS_GEMINI_API_KEY` env var |
| **Stripe** | Subscription payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` env vars |
| **web-push / VAPID** | Browser push notifications | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` env vars |
| **astronomy-engine** | Planetary position calculations | No API key, pure computation |
| **argon2** | Password hashing | No config needed |
| **date-fns / date-fns-tz** | Date manipulation and timezone handling | No config needed |
| **geo-tz** | Timezone lookup from lat/lon | No config needed |
| **sharp** | SVG → PNG image conversion for posters | No config needed |
| **Microsoft Clarity** | Frontend analytics | Hardcoded tag ID in `index.html` |
| **Google Fonts** | Typography (Inter, Space Grotesk, Playfair Display, Fira Code) | CDN link in `index.html` |

### Required Environment Variables

```
DATABASE_URL         # PostgreSQL connection string
SESSION_SECRET       # Express session signing secret
GEMINI_API_KEY       # Google Gemini AI key (or AI_INTEGRATIONS_GEMINI_API_KEY)
VAPID_PUBLIC_KEY     # Web push public key
VAPID_PRIVATE_KEY    # Web push private key
VAPID_SUBJECT        # Web push contact email (default: mailto:support@soulcodex.app)
STRIPE_SECRET_KEY    # Stripe payments (if payments enabled)
STRIPE_WEBHOOK_SECRET # Stripe webhook verification
```

### Development Notes

- Run with `npm run dev` (uses `tsx` to run `server/index.ts` directly)
- Build with `npm run build` (esbuild for server, custom script for client)
- Database migrations: `npm run db:push` (push schema) or `npm run db:generate` (generate SQL)
- The app gracefully degrades when Gemini is unavailable (AI features disabled, fallback text used)
- Push notifications fall back to temporary VAPID keys if env vars are missing (subscriptions break on restart)