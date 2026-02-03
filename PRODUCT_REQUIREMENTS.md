# Soul Codex - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 2025  
**Status:** Shippable  

---

## Executive Summary

Soul Codex is a mobile-first personality and compatibility application that synthesizes 30+ spiritual and psychological systems (astrology, numerology, Human Design, psychology, etc.) into personalized insights for self-discovery, relationships, and personal growth. The app provides users with a comprehensive "soul blueprint" that helps them understand themselves and their relationships through an empowering, scientifically-informed lens.

---

## 1. Target User

### Primary Personas

#### Persona 1: The Self-Discovery Seeker
- **Age:** 25-35
- **Background:** Millennial or Gen Z professional interested in personal development
- **Goals:** 
  - Understand their personality, strengths, and areas for growth
  - Find clarity on life direction and purpose
  - Make better decisions aligned with their authentic self
- **Pain Points:**
  - Overwhelmed by fragmented personality tools (separate apps for astrology, MBTI, etc.)
  - Skeptical of "woo-woo" spirituality but curious about self-knowledge
  - Wants evidence-based insights without deterministic predictions
- **Tech Savvy:** High - expects intuitive mobile UX, offline capability, and fast performance

#### Persona 2: The Relationship Navigator
- **Age:** 28-45
- **Background:** Dating or in relationships, values emotional intelligence
- **Goals:**
  - Understand compatibility with partners, friends, or colleagues
  - Navigate relationship dynamics with awareness
  - Avoid repeating past relationship patterns
- **Pain Points:**
  - Unsure whether differences with partner are complementary or problematic
  - Wants objective insights without fortune-telling
  - Needs practical guidance, not abstract mysticism
- **Tech Savvy:** Medium to high - uses dating apps and wellness apps regularly

#### Persona 3: The Wellness Enthusiast
- **Age:** 30-50
- **Background:** Invests in therapy, coaching, meditation, and personal growth
- **Goals:**
  - Integrate multiple frameworks for holistic self-awareness
  - Track personal insights and growth over time
  - Share meaningful insights with their community
- **Pain Points:**
  - Has tried multiple personality tools but no centralized hub
  - Wants to journal and reflect on insights
  - Desires exportable reports for therapists or coaches
- **Tech Savvy:** Medium - values clean design and ease of use

---

## 2. Problem Statement

**Current State:**  
People seeking self-knowledge and relationship insights are forced to use multiple disconnected tools (astrology apps, numerology calculators, personality tests, compatibility quizzes). These tools often:
- Provide conflicting or surface-level information
- Use mystical language that feels inaccessible or unscientific
- Lack integration between different personality frameworks
- Don't offer actionable guidance for relationships or personal growth
- Require internet connectivity and don't preserve privacy

**Desired State:**  
Soul Codex provides a unified, mobile-first platform that:
- Synthesizes 30+ personality and compatibility systems into one comprehensive blueprint
- Uses clear, empowering language that respects scientific thinking
- Offers practical, actionable insights for self-improvement and relationships
- Works offline-first with optional cloud sync
- Protects user privacy and data sovereignty

**Success Metrics:**
- User completes profile within first session (>70%)
- User returns within 7 days to check insights (>40%)
- User adds at least one person for compatibility analysis (>30%)
- User exports or shares their report (>15%)
- User upgrades to premium within 30 days (>5%)

---

## 3. Core Value Proposition

**For individuals seeking self-knowledge,**  
Soul Codex is a comprehensive personality platform  
**that synthesizes astrology, numerology, psychology, and more**  
**unlike fragmented single-system apps,**  
Soul Codex provides an integrated soul blueprint with practical relationship insights  
**so users can make empowered decisions aligned with their authentic self.**

### Key Differentiators

1. **Multi-System Integration:** Combines 30+ frameworks (astrology, numerology, Human Design, psychology, biorhythms, etc.) into one unified blueprint
2. **Empowering Language:** Clear, non-deterministic insights that encourage growth, not mystical fortune-telling
3. **Relationship Focus:** Deep compatibility analysis beyond sun signs, with practical guidance
4. **Offline-First:** Core functionality works without internet, respecting privacy and accessibility
5. **Mobile-Native:** Touch-optimized, responsive design built for mobile-first usage
6. **Exportable Insights:** Professional PDF reports for sharing with therapists, coaches, or partners

---

## 4. Features by Release

### MVP Features (Already Implemented)

#### Core Profile Creation
- **User Input:** Name, date of birth, time of birth (optional), birth place
- **Optional Psychology:** Attachment style, love languages
- **Validation:** Real-time form validation, geocoding for birth locations
- **Anonymous Mode:** Use app without creating account (session-based storage)

#### Soul Profile Dashboard
- **30+ System Reports:** Astrology (natal chart, houses, aspects), numerology (life path, destiny, soul urge), Human Design (type, authority, centers, gates), Chinese astrology, Vedic astrology, biorhythms, chakras, and more
- **Visual Charts:** Interactive natal chart with planets and aspects
- **Tabbed Navigation:** Organized sections for different systems
- **Mobile Responsive:** Optimized grid layouts for small screens

#### Compatibility Analysis
- **Multi-Person Management:** Add and save multiple people (partners, friends, family, colleagues)
- **Comparison Engine:** Select two people and generate comprehensive compatibility report
- **5 Pillars Scoring:** Attraction, emotional connection, lifestyle, long-term potential, timing
- **Detailed Aspects:** 11 relationship dimensions (sex, communication, trust, friendship, etc.)
- **Synastry Analysis:** Astrological aspects between charts (golden, diamond, fated aspects)
- **Relationship Categories:** Labels like "Soulmate," "Best Friends," "Karmic Lesson," etc.

#### Daily Insights
- **Context-Aware Prompts:** Personalized questions based on user's chart and current transits
- **Transit Awareness:** Current planetary movements affecting the user
- **Biorhythm Tracking:** Physical, emotional, intellectual cycles
- **Daily Guidance:** Actionable advice for the day

#### AI Soul Guide Chat
- **Conversational AI:** GPT-4 powered chat with full profile context
- **Multi-Turn Dialogue:** Maintains conversation history
- **Profile-Aware:** References user's complete soul blueprint
- **Beautiful UI:** Floating cosmic orb button with glassmorphism modal
- **Anonymous Support:** Works for users without profiles (encourages signup)

#### PDF Export
- **Downloadable Report:** Generate comprehensive PDF of soul profile
- **Lazy Loaded:** Libraries only load on export (reduces bundle size by ~500KB)
- **Professional Formatting:** Clean, printable layout for sharing

#### Database & Persistence
- **PostgreSQL:** Production-ready database (Neon)
- **11 Tables:** Users, profiles, persons, compatibility analyses, daily insights, etc.
- **Session Management:** Express-session with PostgreSQL store
- **Access Codes:** Tiered access control (Admin, Premium, Free)

#### Analytics & Monitoring
- **Microsoft Clarity:** Session recordings, heatmaps, user behavior insights
- **GDPR Compliant:** Privacy-focused analytics

---

### v1 Features (Next Release - 3 Months)

#### Enhanced Journaling
- **Reflection Prompts:** Guided journaling based on soul profile and daily transits
- **Free Writing:** Unstructured note-taking with timestamps
- **Tags & Categories:** Organize entries by theme (relationships, career, emotions, etc.)
- **Search & Filter:** Find past reflections by keyword or date
- **Export Journal:** Download journal entries as PDF or markdown
- **Prompt Library:** 100+ curated prompts for different aspects (shadow work, gratitude, manifestation, etc.)

#### Saved People Enhancements
- **Custom Labels:** Tag people (Partner, Friend, Family, Colleague, Crush, Ex)
- **Relationship Timeline:** Track when you met, key milestones
- **Notes per Person:** Private notes about each relationship
- **Notification Reminders:** Birthday reminders, check-in prompts
- **Bulk Compatibility:** Compare yourself with all saved people at once
- **Shared Reports:** Generate shareable compatibility link (privacy-controlled)

#### Advanced Chart Features
- **Transits Calendar:** Visual timeline of upcoming planetary transits affecting you
- **Progressions:** Secondary progressions and solar arc calculations
- **Return Charts:** Solar return, lunar return charts with interpretations
- **Transit Alerts:** Push notifications for significant transits (Saturn return, Jupiter conjunctions, etc.)
- **Historical Transits:** Look back at what was happening during key life events

#### Export Enhancements
- **Custom PDF Templates:** Choose from multiple report styles (minimal, detailed, mystical)
- **Selective Export:** Export specific sections only (just astrology, just compatibility, etc.)
- **Email Reports:** Send PDF to yourself or others directly from app
- **Print Optimization:** Better formatting for physical printing
- **Shareable Links:** Create public link to view (not edit) your profile

#### Premium Features Gating
- **Subscription System:** Stripe integration for monthly/annual subscriptions
- **Feature Limits:** Free tier limited to 1 full profile, 3 compatibility analyses/month
- **Premium Unlocks:** Unlimited profiles, unlimited compatibility checks, advanced reports, priority AI chat, no ads

---

### v2 Features (6-12 Months Out)

#### Social & Community
- **Friend Connections:** Connect with other users (opt-in, privacy-controlled)
- **Compatibility Leaderboards:** See most compatible users in your area (dating mode, privacy filters)
- **Group Analysis:** Compatibility for teams, families, or friend groups
- **Community Forums:** Discussion boards for different astrology/personality topics
- **Expert Q&A:** Monthly AMAs with astrologers, numerologists, therapists

#### Coaching & Guidance
- **Personalized Pathways:** AI-generated 30/60/90 day personal growth plans
- **Goal Tracking:** Set intentions based on soul profile, track progress
- **Transit Preparation:** Pre-emptive guidance for challenging transits
- **Relationship Workshops:** In-app courses on communication, attachment, compatibility
- **1:1 Coaching:** Book sessions with certified astrologers or life coaches through the app

#### Advanced Integrations
- **Calendar Sync:** Best days for important activities (launch, meetings, dates, etc.)
- **Wearable Integration:** Sync biorhythms with fitness tracker data
- **Therapy Integration:** Export insights for use in therapy sessions (with consent)
- **API Access:** Allow third-party apps to integrate soul profile data

#### Predictive Tools (Ethical Design)
- **Electional Astrology:** Find optimal timing for events (non-deterministic, probability-based)
- **Relationship Forecasting:** Predict compatibility trends over next 6-12 months (with disclaimers)
- **Personal Weather:** Daily "forecast" of emotional/energy trends
- **Major Life Events:** Identify significant periods for career, love, transformation (guide, not mandate)

#### Localization & Accessibility
- **Multi-Language:** Spanish, French, German, Portuguese, Hindi, Japanese
- **Voice Input:** Speech-to-text for journal entries
- **Screen Reader:** Full accessibility for visually impaired users
- **Dyslexia Mode:** Font and spacing options for easier reading
- **Cultural Variations:** Vedic vs. Western astrology toggle, different numerology systems

---

## 5. Non-Functional Requirements

### Performance
- **Load Time:** First meaningful paint < 2 seconds on 3G
- **Time to Interactive:** < 4 seconds on 3G
- **Offline First:** Core features work without internet
- **Bundle Size:** Initial JS bundle < 300KB gzipped
- **Database Queries:** < 100ms for profile load, < 500ms for compatibility calculation

### Security & Privacy
- **Data Encryption:** All data encrypted at rest and in transit (HTTPS, PostgreSQL encryption)
- **Authentication:** Secure password hashing (Argon2), optional OAuth
- **Session Management:** Secure session tokens, auto-logout after 30 days
- **GDPR Compliant:** Right to deletion, data export, clear privacy policy
- **No Third-Party Tracking:** Microsoft Clarity only, no Facebook/Google ads pixels

### Scalability
- **Database:** PostgreSQL with connection pooling, handles 10,000+ concurrent users
- **CDN:** Static assets served from CDN for global low-latency
- **Caching:** Server-side caching for expensive calculations (charts, compatibility)
- **API Rate Limiting:** Prevent abuse, 100 requests/minute per user

### Mobile-First Design
- **Responsive:** Works on all screen sizes (320px to 4K)
- **Touch Optimized:** Large tap targets (44x44px minimum), swipe gestures
- **Viewport Fit:** Safe areas for iOS notch, Android navigation gestures
- **PWA:** Installable, works offline, native-like experience
- **Performance Budget:** Lighthouse score > 90 on mobile

---

## 6. Technical Architecture

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **UI Library:** Radix UI (accessible components) + Tailwind CSS
- **State Management:** React Query (server state) + React Context (local state)
- **Charts:** Recharts (data visualization)
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Session Store:** PostgreSQL-backed express-session
- **Authentication:** Passport.js (local strategy + OAuth ready)

### APIs & Services
- **AI Chat:** OpenAI GPT-4 Turbo (streaming SSE)
- **Geocoding:** geo-tz library for timezone lookup
- **Astronomical Calculations:** astronomy-engine library
- **Payment Processing:** Stripe (subscriptions, one-time payments)
- **Email:** Nodemailer (transactional emails)
- **Push Notifications:** Web Push API

### Deployment
- **Hosting:** Render.com (web service + PostgreSQL)
- **CDN:** Cloudflare (static assets)
- **Domain:** Custom domain with HTTPS
- **CI/CD:** GitHub Actions (automated testing, deployment)
- **Monitoring:** Microsoft Clarity (analytics), Render metrics

---

## 7. User Stories

### Epic 1: Profile Creation
- **US-1.1:** As a new user, I want to create a profile by entering my birth details so I can see my soul blueprint
- **US-1.2:** As a user, I want to optionally add my birth time so I get more accurate astrological insights
- **US-1.3:** As a privacy-conscious user, I want to use the app anonymously without creating an account so I can explore before committing
- **US-1.4:** As a user, I want to edit my profile details later if I made a mistake

### Epic 2: Soul Blueprint
- **US-2.1:** As a user, I want to see my natal chart with planets and aspects so I understand my astrological makeup
- **US-2.2:** As a user, I want to see my numerology numbers so I understand my life path and destiny
- **US-2.3:** As a user, I want to see my Human Design type so I understand my energy and decision-making
- **US-2.4:** As a user, I want clear explanations of each system in plain language so I'm not confused by jargon

### Epic 3: Compatibility
- **US-3.1:** As a user, I want to add people (partner, friends, family) so I can check compatibility with them
- **US-3.2:** As a user, I want to compare myself with another person so I see our relationship strengths and challenges
- **US-3.3:** As a user, I want to see a compatibility score so I have a quick overview
- **US-3.4:** As a user, I want detailed compatibility breakdown so I understand *why* we're compatible or not
- **US-3.5:** As a user, I want practical relationship advice so I can improve my connections

### Epic 4: Daily Guidance
- **US-4.1:** As a user, I want daily personalized prompts so I have something to reflect on
- **US-4.2:** As a user, I want to know today's transits so I'm aware of cosmic influences
- **US-4.3:** As a user, I want to see my biorhythms so I know my energy levels
- **US-4.4:** As a user, I want to journal my reflections so I track my growth over time

### Epic 5: AI Soul Guide
- **US-5.1:** As a user, I want to ask questions about my soul profile so I understand complex concepts
- **US-5.2:** As a user, I want conversational AI that remembers context so I don't repeat myself
- **US-5.3:** As a user, I want the AI to explain things in simple terms so I'm not overwhelmed
- **US-5.4:** As a user, I want the AI to reference my actual chart so advice is personalized

### Epic 6: Export & Share
- **US-6.1:** As a user, I want to download my soul profile as PDF so I can share it with my therapist
- **US-6.2:** As a user, I want to export compatibility reports so I can discuss them with my partner
- **US-6.3:** As a user, I want to print my chart so I can hang it on my wall
- **US-6.4:** As a user, I want to share a link to my profile so others can view it (privacy-controlled)

---

## 8. Out of Scope (Explicitly Not Included)

### MVP
- Multi-language support (English only for MVP)
- Social features (friend connections, leaderboards)
- Native mobile apps (PWA only for MVP)
- Video/audio content (text and images only)
- Community forums or user-generated content
- Live astrologer consultations
- Wearable device integrations
- Calendar sync

### All Versions
- Medical diagnoses or health predictions (violates ethical guidelines)
- Financial advice or investment recommendations (legal liability)
- Legal advice (not qualified, liability)
- Deterministic fortune-telling ("you will meet someone on Tuesday") (ethical concern)
- Dating app functionality (matching users) (different product category)
- Social media platform features (likes, comments, viral content) (different focus)

---

## 9. Success Metrics & KPIs

### Acquisition Metrics
- **New Users:** 1,000 users in first month
- **Organic Growth:** 30% month-over-month after month 3
- **App Store Ranking:** Top 50 in "Lifestyle" category by month 6

### Activation Metrics
- **Profile Completion:** >70% of new users complete profile in first session
- **First Insight View:** >80% of users view at least one soul blueprint section
- **Return Within 7 Days:** >40% of users return within a week

### Engagement Metrics
- **Daily Active Users (DAU):** 15% of monthly active users
- **Session Duration:** Average 8 minutes per session
- **Sessions per User:** 4 sessions per month (weekly check-ins)
- **Feature Usage:** >30% of users add at least one person for compatibility

### Retention Metrics
- **7-Day Retention:** >40%
- **30-Day Retention:** >25%
- **90-Day Retention:** >15%

### Monetization Metrics
- **Free to Paid Conversion:** >5% within 30 days
- **Monthly Recurring Revenue (MRR):** $10,000 by month 6
- **Average Revenue Per User (ARPU):** $3/month (blended free + paid)
- **Churn Rate:** <5% monthly for paid users

### Quality Metrics
- **App Store Rating:** >4.5 stars
- **Lighthouse Performance Score:** >90 on mobile
- **Customer Support Tickets:** <1% of users per month
- **Crash Rate:** <0.1% of sessions

---

## 10. Risks & Mitigations

### Risk 1: Users Misinterpret Insights as Medical Advice
**Impact:** High (legal liability, user harm)  
**Probability:** Medium  
**Mitigation:**
- Clear disclaimers on every screen: "For entertainment and self-reflection only, not medical advice"
- Use empowering, non-deterministic language ("you may find..." instead of "you will...")
- Link to mental health resources in-app
- Include "Consult a professional" CTAs for serious concerns

### Risk 2: AI Chat Gives Inappropriate or Harmful Advice
**Impact:** High (user harm, reputation damage)  
**Probability:** Low to Medium  
**Mitigation:**
- System prompts with strict guardrails (no medical, financial, or legal advice)
- Content moderation filters for harmful topics
- User reporting mechanism for inappropriate responses
- Regular prompt engineering audits
- Human review of flagged conversations

### Risk 3: Compatibility Scores Damage Real Relationships
**Impact:** Medium (user dissatisfaction, ethical concern)  
**Probability:** Medium  
**Mitigation:**
- Frame compatibility as "areas of harmony and growth," not "good or bad"
- Emphasize that all relationships take work, low scores aren't dealbreakers
- Provide actionable advice for all compatibility levels
- Include disclaimer: "Compatibility is just one factor, real relationships require communication and effort"

### Risk 4: Data Breach or Privacy Violation
**Impact:** Critical (legal, financial, reputation damage)  
**Probability:** Low  
**Mitigation:**
- End-to-end encryption for all sensitive data
- Regular security audits and penetration testing
- GDPR/CCPA compliance (data deletion, export, consent)
- No selling of user data to third parties
- Transparent privacy policy, updated regularly

### Risk 5: Low User Engagement After Initial Profile Creation
**Impact:** Medium (poor retention, low revenue)  
**Probability:** Medium  
**Mitigation:**
- Push notifications for daily insights (opt-in)
- Weekly "check your transits" prompts
- AI chat to re-engage users with questions
- Gamification: badges for daily logins, completed reflections
- Email drip campaign with tips for getting more value from app

### Risk 6: Offensive or Culturally Insensitive Interpretations
**Impact:** Medium (reputation, user trust)  
**Probability:** Low  
**Mitigation:**
- Cultural sensitivity review by diverse team
- User feedback mechanism on every interpretation
- Iterative improvements based on reported issues
- Avoid gendered stereotypes (e.g., "women are emotional")
- Inclusive language for all identities, orientations, backgrounds

---

## 11. Dependencies & Assumptions

### Dependencies
- OpenAI API availability and pricing stability
- PostgreSQL database (Neon) uptime and performance
- Stripe payment processing reliability
- Third-party libraries (astronomy-engine, geo-tz) maintenance
- Mobile browser support for PWA features (iOS Safari, Chrome)

### Assumptions
- Users have smartphones with modern browsers (iOS 14+, Android 8+)
- Users are willing to enter accurate birth data (date, time, place)
- Users understand basic astrology/numerology concepts (or are willing to learn)
- Users trust AI-powered guidance (GPT-4 for chat)
- Users prefer mobile-first experience over desktop
- Users value privacy (offline-first, no ads, minimal tracking)
- Market demand exists for holistic personality apps (not over-saturated)

---

## 12. Glossary

- **Soul Blueprint:** Comprehensive personality report synthesizing 30+ systems
- **Natal Chart:** Astrological chart showing planet positions at birth
- **Synastry:** Astrological compatibility analysis between two people
- **Transits:** Current planetary movements affecting a person
- **Human Design:** Personality system combining astrology, I Ching, Kabbalah, and chakras
- **Life Path Number:** Numerology calculation from birth date showing life purpose
- **Biorhythms:** Cyclical physical, emotional, and intellectual rhythms
- **Attachment Style:** Psychological framework for relationship patterns (secure, anxious, avoidant)
- **Love Languages:** Ways people give/receive love (words, touch, gifts, service, time)
- **Aspect:** Angular relationship between planets (conjunction, trine, square, etc.)
- **House:** Division of astrological chart representing life areas (career, relationships, etc.)
- **Pillar:** Core compatibility dimension (attraction, emotional, lifestyle, long-term, timing)

---

## 13. Appendix: Competitive Analysis

| Competitor | Strengths | Weaknesses | Soul Codex Advantage |
|------------|-----------|------------|----------------------|
| **Co-Star** | Beautiful design, push notifications, social features | Astrology-only, vague insights, ads | Multi-system integration, no ads, clearer language |
| **The Pattern** | Personality insights, relationship tracking, no astrology jargon | Proprietary system (not transparent), limited compatibility | 30+ systems, transparent methodologies, deeper compatibility |
| **Sanctuary** | Live astrologer chat, personalized readings | Expensive ($20+/reading), not on-demand, astrology-only | AI chat (instant, affordable), broader systems |
| **TimePassages** | Detailed astrology, professional-grade charts | Complex UI, overwhelming for beginners, astrology-only | Simplified language, multi-system, mobile-first |
| **Human Design App** | Deep Human Design insights, authoritative | Human Design only, niche audience, complex | Human Design + astrology + numerology + more |
| **Numerology App** | Comprehensive numerology | Numerology only, dated UI, limited compatibility | Integrated numerology with astrology, modern design |

**Unique Position:** Soul Codex is the only app that synthesizes astrology, numerology, Human Design, psychology, and more into one mobile-first platform with AI-powered guidance and offline capability.

---

## 14. Next Steps

### Immediate (This Sprint)
1. ✅ Complete PRD documentation
2. ✅ Create UX flow documentation
3. ✅ Document data model
4. ✅ Define pricing tiers
5. ✅ Write safety/ethics guidelines

### Sprint 1 (Weeks 1-2)
1. Implement journaling feature (text editor, save/load)
2. Add prompt library (100+ curated prompts)
3. Build saved people enhancements (labels, notes)

### Sprint 2 (Weeks 3-4)
1. Implement subscription system (Stripe integration)
2. Add feature gating (free vs. premium)
3. Build transits calendar view

### Sprint 3 (Weeks 5-6)
1. Enhanced PDF export (templates, selective export)
2. Email report delivery
3. App Store submission (iOS, Android via PWABuilder)

---

**Document Owner:** Product Team  
**Last Updated:** December 27, 2025  
**Review Cycle:** Monthly  
**Status:** Approved for Development
