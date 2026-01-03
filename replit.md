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