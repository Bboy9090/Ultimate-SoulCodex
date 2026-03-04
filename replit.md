# Ultimate Soul Codex

## Overview
Ultimate Soul Codex is a mystical identity synthesis application that generates personalized "soul profiles" by integrating spiritual and psychological frameworks (astrology, numerology, Enneagram, MBTI) with AI-generated content. It offers comprehensive spiritual biographies, guidance, and a person-based compatibility system with confidence indicators. The application operates on a freemium model using Stripe subscriptions and is implemented as a Progressive Web App (PWA) for installability, offline access, and push notifications, including a Life Current Tracker for a Congruence Score algorithm.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application features a custom cosmic/mystical theme with a dark mode, purple primary colors, smooth animations, and a refined Glassmorphism design system. It is built with a mobile-first, responsive design approach.

**Technical Implementations:**
The frontend uses React, TypeScript, Vite, Tailwind CSS with shadcn/ui, TanStack Query, Wouter, and React Hook Form with Zod. The backend is a Node.js Express.js RESTful API using TypeScript and Drizzle ORM for PostgreSQL. Authentication supports anonymous users, local email/password (Argon2id hashing), and Replit Auth, with seamless migration of anonymous user data upon sign-up. A profile migration system automatically transfers anonymous user profiles upon authentication.

**Key Features & Systems:**
- **Soul Codex Synthesis Engine**: A deterministic personality synthesis engine generating archetypes, first-person behavioral text for various life aspects, moral codes, and 4-dimension compatibility scoring. It includes a blandness filter to validate AI output and enforce first-person language.
- **Astro Provider Architecture**: A clean, swappable astrology computation layer with in-memory caching, ready to integrate different astronomical sources.
- **World Geocoding + Confidence Badges**: Utilizes Nominatim (OpenStreetMap) for global geocoding with caching and provides confidence badges for birth data accuracy (verified, partial, unverified).
- **Full Chart Engine + Data-Driven Poster**: Generates full astrological charts with planet positions, house cusps, and aspects. It also includes a premium live-editing birth chart poster generator that converts SVG previews to PNG on the server.
- **30-System Synthesis Engine**: A signal-driven narrative synthesis engine processing inputs from astrology, numerology, human design, and moral compass to generate core themes, strengths, shadows, triggers, and prescriptions, culminating in a unique codename and a comprehensive narrative reading.
- **AI Content Generation**: Integrates Gemini AI (gemini-2.5-flash) for personalized biographies, daily guidance, Sabian symbols, and a streaming Soul Guide chat with conversational history and full profile context.
- **Soul Guide Chat** (`/guide`): Streaming SSE chat UI with full profile context injection (localStorage → server fallback). Suggestion chips for quick starts. Graceful "resting" state when AI is offline. Maintains conversation history across turns.
- **Life Current Tracker** (`/tracker`): Daily frequency log (1–10) with color-coded buttons. 14-day SVG sparkline bar chart. Circular SVG congruence score ring (auth only). Editable purpose statement synced via PATCH API. Anonymous users can log; congruence requires sign-in.
- **Compatibility Engine** (`/compat`): Save profile to DB, add persons by birth data, compare two profiles. Shows overall score ring + 4 dimension bars (Identity, Under Stress, Values, Decisions) + synergy/friction bullet lists.
- **Daily Horoscope System**: Calculates daily planetary positions, inter-planetary aspects, personal transits, and provides AI-generated first-person readings with per-day memory caching.
- **Template Bank System**: Manages 77+ templates across 19 mystical categories for daily insights with anti-repetition logic.
- **Person-Based Compatibility**: Enables comparing individuals with compatibility scores.
- **Stripe Subscription & Entitlement Infrastructure**: Handles webhooks for managing premium access with a unified priority-based resolver.
- **Push Notifications**: Comprehensive system with 10 notification types for engagement.
- **Language Policy**: All AI-generated content enforces first-person "inner voice" and bans specific mystical phrases.

**System Design Choices:**
The application uses a RESTful API with shared Zod schemas for validation and centralized error handling. Core data models include Users, Soul Profiles, Assessment Responses, Daily Insights, Persons, Compatibilities, and Push Subscriptions. Session management supports anonymous users.

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

### Form and Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation

### Security
- **Argon2**: Password hashing
- **web-push**: VAPID-based web push notifications

### State Management
- **TanStack Query**: Server state management