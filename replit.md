# Ultimate Soul Codex

## Overview
Ultimate Soul Codex is a mystical identity synthesis application that creates personalized "soul profiles" by integrating spiritual and psychological frameworks such as astrology, numerology, Enneagram, MBTI, and AI-generated content. It provides comprehensive spiritual biographies and guidance, featuring a person-based compatibility system with confidence indicators. The application operates on a freemium model with Stripe subscriptions and is implemented as a Progressive Web App (PWA) for installability, offline access, and push notifications, including a Life Current Tracker for a Congruence Score algorithm.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application features a custom cosmic/mystical theme with a dark mode, purple primary colors, smooth animations, and a refined Glassmorphism design system. It is built with a mobile-first, responsive design approach.

**Technical Implementations:**
The frontend utilizes React, TypeScript, Vite, Tailwind CSS with shadcn/ui, TanStack Query, Wouter, and React Hook Form with Zod. The backend is a Node.js Express.js RESTful API using TypeScript and Drizzle ORM for PostgreSQL. Data persists using PostgreSQL via DbStorage. Authentication supports anonymous users, local email/password (Argon2id hashing), and Replit Auth, with seamless migration of anonymous user data upon sign-up.

**Profile Migration System (November 2025):**
Implemented automatic profile migration when users authenticate after creating anonymous profiles. When a user creates a profile as an anonymous visitor then signs up or logs in, their profile is automatically transferred to their authenticated account. The system uses `req.sessionID` to track anonymous sessions and migrates both soul profiles and person entries during authentication. Migration process: (1) Capture previous sessionId before login, (2) Execute login/signup, (3) Migrate soul profile from session to userId, (4) Migrate persons from session to userId, (5) Clear sessionId from migrated records. This ensures users never need to re-enter profile information after authentication.

**Astro Provider Architecture (March 2026):**
Clean swappable astrology computation layer under `server/astro/`:
- `types.ts`: `AstroRequest`, `AstroResult`, `AstroProvider` interfaces
- `key.ts`: `astroCacheKey()` — deterministic cache key from date/time/place/lat-lon/houseSystem
- `providers/localProvider.ts`: Wraps `calculateAstrology()` (astronomy-engine) into the provider interface
- `cachedProvider.ts`: `withAstroCache()` — in-memory Map cache; logs HIT/MISS per request
- `provider.ts`: `getAstroProvider()` — singleton that returns `localProvider+cache`
- `POST /api/soul-archetype` uses `getAstroProvider().getChart()` — same birth data is never recomputed twice
- Architecture ready to swap `localProvider` for a paid API or Swiss Ephemeris with one line change

**Birthday Chart Poster Generator (March 2026):**
Premium `/poster` page at `client/src/pages/PosterPage.tsx`:
- Live-editing form (name, birth date/time/location, sun/moon/rising signs, life path, master number)
- Inline SVG preview updates live as user types — `BirthChartPosterSVG.tsx` component
- SVG layout (1080×1350 viewBox): cosmic teal space gradient background with 60 fixed star dots, outer gold ring with `textPath` showing Sun/Moon/Rising, 12-segment zodiac wheel with Unicode glyphs, planet dots at correct longitude, center name/date/location block, large life path number, banner ribbon with archetype label, bottom master number line
- `POST /api/poster/render?width=2048|4096`: server-side SVG → PNG conversion using `sharp` (already installed); returns `image/png` binary for download
- `server/posterSvg.ts`: pure string SVG builder (no JSX) shared between server PNG export and client preview logic
- Nav link "Poster" added

**Soul Codex Synthesis Engine (March 2026):**
New `soulcodex/` directory implements a deterministic personality synthesis engine:
- `types.ts`: Core interfaces — StressElement, DecisionStyle, PressureStyle, SoulSignals, Archetype, Synthesis, SoulProfile, CompatibilityScore
- `compute/archetype.ts`: Element + Role naming system (12 elements × 12 roles = 144 archetypes: Iron Architect, Ocean Sage, Solar Catalyst, etc.)
- `compute/synthesis.ts`: Builds first-person behavioral text for coreEssence, stressPattern, relationshipPattern, powerMode, growthEdges
- `compute/moral.ts`: Derives moral code (The Enforcer, The Sentinel, The Diplomat, etc.) from pressureStyle + nonNegotiables
- `compute/compatibility.ts`: 4-dimension compatibility scoring (identity, stress, values, decisions) with friction/synergy explanations
- `validators/blandnessFilter.ts`: Validates AI output against BANNED phrases list and enforces first-person behavioral language
- `index.ts`: Main `buildSoulProfile(inputs, overrides)` entry point

**Wave 2A: World Geocoding + Confidence Badges (March 2026):**
- `server/geo/nominatim.ts`: Nominatim (OpenStreetMap) geocoder — any city in the world, no API key required. Uses `User-Agent: SoulCodex/1.0`.
- `server/geo/cache.ts`: In-memory `Map` cache for geocoding results. Key format: `geo:v1:{normalized query}`. First call hits static DB or Nominatim; subsequent calls are instant.
- `server/geo/index.ts`: `resolveGeo(place)` — checks cache → static lookup (`geocoding.ts`) → Nominatim. Returns `{ normalizedPlace, lat, lon, provider, cached }`.
- `soulcodex/compute/confidence.ts`: `computeConfidence({ timeUnknown, hasGeo, hasTimezone })` → `{ badge: "verified"|"partial"|"unverified", label, reason }`. Verified = full time + geo locked; Partial = no birth time; Unverified = no geo.
- `POST /api/soul-archetype`: Now uses `resolveGeo()` for world geocoding; returns `confidence` and `geo` in response body.
- `ProfilePage`: Shows colored confidence badge (green=Verified, amber=Partial, gray=Unverified) next to the archetype element+role pill, with reason subtitle.
- `OnboardingPage`: Birth time field relabeled "Accuracy Mode" with contextual helper text.

**Wave 2B: Full Chart Engine + Data-Driven Poster (March 2026):**
- `astrology.ts PlanetData`: Added `longitude: number` to interface and `createPlanetData()` return — exposes full ecliptic longitude (0-360°) for all planets.
- `server/astro/providers/localProvider.ts`: Now uses `.longitude` directly from planet data (exact ecliptic degrees); exposes `aspects` from `calculateAstrology()` via `AstroResult.aspects`.
- `server/astro/types.ts`: Added `aspects?: Array<{ planet1, planet2, aspect, orb }>` to `AstroResult`.
- `POST /api/astro/fullchart`: New endpoint — takes `{ birthDate, birthTime, timeUnknown, birthLocation }`, geocodes via `resolveGeo`, resolves timezone via `geo-tz`, calls the cached astro provider. Returns all 10 planet positions with exact ecliptic longitudes, 12 house cusps, and aspect list.
- `BirthChartPosterSVG.tsx` + `server/posterSvg.ts`: Planet labels upgraded from `"Su","Mo","Me"` to Unicode `☉☽☿♀♂♃♄♅♆♇`. Planet circle indicators now use dark fill with gold border instead of solid gold.
- `PosterPage.tsx`: Added "Compute Chart from Birth Data" button — calls `/api/astro/fullchart`, extracts planet longitudes, sets them on `data.planets` state → planets appear at real ecliptic positions on the live SVG preview and are included in PNG export.

**Language Policy:**
ALL AI-generated content must use first-person "inner voice" (I/my/me). BANNED phrases: "cosmic blueprint," "sacred blueprint," "divine timing," "vibrational frequency," "holistic convergence," "incarnation," "celestial influence," "divine nature," "cosmic signature." Enforced by blandnessFilter.ts.

**Daily Horoscope System (March 2026):**
`horoscope.ts` calculates today's planetary positions (all 10 planets), inter-planetary aspects with behavioral interpretations, personal transits vs natal chart, and AI first-person reading via Gemini (with fallback). `GET /api/profiles/:id/daily-horoscope` endpoint with per-day memory caching.

**Frontend (March 2026):**
Complete React frontend with Wouter routing:
- `OnboardingPage`: 5-step form (birth data → stress element → decision style → non-negotiables → goals/social energy)
- `ProfilePage`: Archetype identity display with synthesis sections (Who I Am, Stress Pattern, Relationships, Moral Compass, Power Mode, Growth Edges)
- `DailyHoroscopePage`: Moon phase, AI reading, interactive PlanetWheel SVG component with colored aspect lines and planet tooltips
- Profile data persists to DB on onboarding completion; profile ID stored in localStorage for daily horoscope lookups
- Auto-geocoding: birthLocation resolved to lat/lng/timezone via `geocoding.ts` + `geo-tz` when not provided

**Feature Specifications:**
Core services include:
- **Astrology, Synastry, Numerology, Personality (Enneagram, MBTI), and Archetype Services**: For comprehensive profile generation.
- **AI Content Generation**: Integrates Gemini AI (gemini-2.5-flash) for personalized biographies, daily guidance, and Sabian symbols, with fallback templates.
- **AI Soul Guide Chat**: Streaming Gemini 2.5 Flash chat with conversational history and full profile context.
- **Daily Context Service**: Provides real-time astronomical, numerological, and Human Design data.
- **Template Bank System**: Manages 77+ templates across 19 mystical categories for daily insights with anti-repetition logic.
- **Person-Based Compatibility**: Enables comparing individuals with compatibility scores.
- **Stripe Subscription Infrastructure**: Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` webhooks for managing premium access.
- **Entitlement Infrastructure**: Unified premium access resolver with priority-based decision logic (Manual Override → Active Stripe Subscription → Valid Access Code → Legacy Flag), caching, and anonymous user support.
- **Push Notifications**: Comprehensive system with 10 notification types for engagement, including daily guidance, compatibility updates, and premium upsells. Supports PWA install prompts and EMA.
- **Performance Optimizations**: Lazy loading for PDF libraries.
- **Analytics Integration**: Microsoft Clarity for user behavior tracking.

**System Design Choices:**
The application uses a RESTful API with Zod schemas shared between client and server for validation. Error handling is centralized. It includes a Premium Access Code System and an analytics dashboard. Core data models include Users, Soul Profiles, Assessment Responses, Daily Insights, Persons, Compatibilities, and Push Subscriptions. Session management uses Express sessions, supporting anonymous users.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL
- **Drizzle Kit**: Migrations and schema management

### Calculation Libraries
- **astronomy-engine**: Astronomical calculations
- **geo-tz**: Timezone detection
- **date-fns**: Date manipulation

### AI Services
- **Gemini AI Integration**: `gemini-2.5-flash` via Replit AI Integrations for content generation and Soul Guide chat.

### Analytics
- **Microsoft Clarity**: User behavior tracking.

### UI Libraries
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component

### Development Tools
- **Vite**: Build tool
- **esbuild**: TypeScript compilation
- **Replit Integration**: Development environment

### Styling and Fonts
- **Google Fonts**: Inter, Crimson Text
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing

### Form and Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

### Security
- **Argon2**: Password hashing
- **web-push**: VAPID-based web push notifications

### State Management
- **TanStack Query**: Server state management