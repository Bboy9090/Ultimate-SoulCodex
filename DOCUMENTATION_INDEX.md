# Soul Codex Documentation Index

**Last Updated:** December 27, 2025  
**Status:** Complete & Shippable  

---

## Overview

This directory contains comprehensive product documentation for Soul Codex, a mobile-first personality and compatibility application that synthesizes 30+ spiritual and psychological systems into actionable insights for self-discovery and relationships.

---

## Documentation Files

### 1. [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)
**546 lines | 26KB**

Complete Product Requirements Document (PRD) covering:
- **Target Users:** 3 detailed personas (Self-Discovery Seeker, Relationship Navigator, Wellness Enthusiast)
- **Problem Statement:** Current pain points and desired state
- **Core Value Proposition:** Multi-system integration with empowering language
- **Features by Release:**
  - MVP (already implemented): Profile creation, 30+ systems, compatibility, AI chat, PDF export
  - v1 (3 months): Enhanced journaling, saved people improvements, advanced charts, premium gating
  - v2 (6-12 months): Social/community, coaching, integrations, predictive tools, localization
- **Technical Architecture:** React + Express + PostgreSQL + OpenAI stack
- **User Stories:** 24+ user stories across 6 epics
- **Success Metrics:** Acquisition, activation, engagement, retention, monetization KPIs
- **Risk Analysis:** 6 major risks with mitigation strategies
- **Competitive Analysis:** vs. Co-Star, The Pattern, Sanctuary, TimePassages, etc.

**Key Sections:**
- Executive Summary
- Target User Personas
- Problem Statement & Value Proposition
- MVP, v1, v2 Feature Roadmap
- Non-Functional Requirements
- Technical Architecture
- User Stories
- Success Metrics & KPIs
- Risks & Mitigations
- Competitive Analysis

---

### 2. [UX_FLOW.md](./UX_FLOW.md)
**998 lines | 33KB**

Comprehensive UX flow documentation covering every screen and interaction:
- **Onboarding Flow:** Landing page → 3-step profile creation → Dashboard
- **Dashboard:** Main navigation, soul blueprint tabs, quick stats, today section
- **Compatibility Flow:** People list → Add person → Select for comparison → Report
- **Daily Insights:** Energy summary, transits, reflection prompts, affirmations
- **AI Soul Guide Chat:** Modal interface, streaming responses, context-aware conversations
- **Export & Share:** PDF generation with lazy loading, shareable links
- **Settings & Account:** Profile editing, subscription management, privacy controls
- **Mobile-Specific:** Touch gestures, keyboard handling, bottom sheets, offline behavior
- **Error States:** Empty states, error handling, edge cases
- **Accessibility:** Screen reader support, keyboard navigation, visual/cognitive accessibility

**Key Sections:**
- Complete screen-by-screen flows with wireframe descriptions
- User actions and system responses
- Design notes and implementation details
- Mobile interactions and gestures
- Offline-first behavior
- Error states and edge cases
- Accessibility requirements
- Performance goals

---

### 3. [DATA_MODEL.md](./DATA_MODEL.md)
**1061 lines | 37KB**

Complete data model with Entity Relationship Diagram, schemas, and SQL:
- **Core Entities:**
  - UserProfile (soul_profiles): Birth data + 30+ system calculations stored as JSONB
  - CompatibilityResult (compatibility_analyses): 5 pillars, synastry, relationship advice
  - Notes/Journal (journal_entries): Reflection prompts, tags, mood tracking
- **Supporting Entities:**
  - Users, LocalUsers, Persons, DailyInsights
  - AccessCodes, PushSubscriptions, Sessions
  - AssessmentResponses, FrequencyLogs
- **Relationships:** One-to-one, one-to-many, many-to-many mappings
- **JSONB Schemas:** Detailed examples for astrology, numerology, Human Design data
- **Indexes:** Primary keys, foreign keys, composite indexes, GIN indexes for JSONB
- **Validation:** Application-level and database-level constraints
- **Security:** Encryption, access control, GDPR compliance
- **Complete PostgreSQL Schema:** Production-ready SQL DDL

**Key Sections:**
- Entity Relationship Diagram (ASCII art)
- Detailed entity specifications with all fields
- JSONB schema examples
- Data relationships and foreign keys
- Data access patterns and indexes
- Validation rules and constraints
- Security and privacy measures
- Performance optimization strategies
- Data lifecycle management
- Complete SQL schema (PostgreSQL)

---

### 4. [PRICING_MODEL.md](./PRICING_MODEL.md)
**510 lines | 19KB**

Detailed pricing strategy with tiers, psychology, and projections:
- **Free Tier ("Soul Seeker"):** $0 forever
  - 1 profile, 5 saved people, 3 compatibility analyses/month
  - 10 AI chat messages/month, 1 PDF export/month
  - All core features accessible
- **Premium Tier ("Soul Master"):** $9.99/month or $89.99/year
  - Unlimited profiles, people, compatibility analyses
  - Advanced insights (transits calendar, progressions, return charts)
  - Unlimited journaling, AI chat, PDF exports
  - Priority support, early feature access
  - 7-day free trial
- **Feature Comparison Table:** Side-by-side free vs. premium
- **Upgrade Flows:** In-app triggers, payment via Stripe, cancellation handling
- **Revenue Projections:** Conservative estimates for Year 1 ($27K ARR)
- **Pricing Psychology:** Why $9.99/month works, value anchoring
- **Competitive Analysis:** Positioned against Co-Star, The Pattern, Sanctuary
- **Future Tiers:** Soul Coach ($29.99/mo), Team/Business ($99/mo), Lifetime ($499)

**Key Sections:**
- Pricing tiers with detailed feature lists
- Free trial and payment flows
- Upgrade and cancellation processes
- Feature comparison table
- Pricing psychology and positioning
- Revenue projections and metrics
- Competitive pricing analysis
- Future tier considerations
- Pricing FAQs

---

### 5. [SAFETY_ETHICS.md](./SAFETY_ETHICS.md)
**564 lines | 21KB**

Mandatory ethical guidelines and safety protocols:
- **Core Principles:**
  - Non-Determinism: Use "may/might", never "will/always"
  - Empowering Language: Growth-oriented, user-centric framing
  - No Medical Advice: Never diagnose, always refer to professionals
  - No Legal/Financial Advice: Out of scope, liability risk
  - Inclusive Language: Gender, sexuality, race, ability-inclusive
- **Content Standards:**
  - Interpretation quality checklist
  - Compatibility report guidelines
  - AI system prompts with safety guardrails
- **Vulnerable User Protections:**
  - Age restrictions (13+ for COPPA)
  - Crisis intervention (suicide, self-harm, abuse resources)
  - Automated detection and response protocols
- **Required Disclaimers:**
  - App-wide footer, profile creation, compatibility reports, AI chat, PDF exports
- **Content Review Process:** Internal review, ongoing monitoring, user feedback loops
- **Team Training:** Ethics certification required for all team members
- **Transparency:** Public commitments, quarterly reports, user recourse

**Key Sections:**
- Core ethical principles with examples
- Content standards and quality checklists
- AI safety guidelines and system prompts
- Vulnerable user protections
- Required disclaimers (comprehensive list)
- Crisis intervention protocols
- Content review and monitoring processes
- Team training requirements
- Transparency and accountability commitments
- Language replacement guide (quick reference)

---

## Documentation Summary

### Total Documentation
- **5 comprehensive documents**
- **3,679 lines of markdown**
- **136KB of detailed specifications**
- **100% coverage of problem statement requirements**

### Coverage Checklist

✅ **PRD:**
- Target user personas
- Problem statement
- Core value proposition
- MVP, v1, v2 feature roadmap

✅ **Feature Set:**
- Profile creation and onboarding
- Charts/reports (30+ systems)
- Compatibility analysis
- Journaling prompts
- Saved people management
- PDF exports

✅ **UX Flow:**
- Onboarding → Dashboard → Report → Compatibility → Insights → Export
- Complete screen-by-screen flows
- Mobile-first interactions
- Offline behavior
- Error handling

✅ **Data Model:**
- UserProfile entity and fields
- ChartResult structure (embedded JSONB)
- CompatibilityResult entity and fields
- Notes/Journal entity and fields
- Complete ERD and SQL schema

✅ **Pricing Model:**
- Free tier features and limits
- Premium tier ($9.99/mo, $89.99/yr)
- Feature gating strategy
- Revenue projections

✅ **Safety & Ethics:**
- Non-medical language requirements
- Disclaimers on all content
- No deterministic "diagnosis" framing
- Empowering, clear language (not mystical word-soup)

### Constraints Met

✅ **Mobile-First:** UX flows designed for touch, responsive design documented  
✅ **Offline-First:** Data model supports local storage, sync strategy documented  
✅ **Clear Language:** Safety guidelines enforce empowering, jargon-free content  
✅ **Shippable:** All documents are detailed enough for dev implementation without guesswork  

---

## How to Use This Documentation

### For Product Managers
- Start with **PRODUCT_REQUIREMENTS.md** for complete feature roadmap
- Reference **PRICING_MODEL.md** for monetization strategy
- Review **SAFETY_ETHICS.md** for ethical guardrails

### For Designers
- Start with **UX_FLOW.md** for screen-by-screen designs
- Reference **PRODUCT_REQUIREMENTS.md** for user personas
- Review **SAFETY_ETHICS.md** for language guidelines

### For Engineers
- Start with **DATA_MODEL.md** for database schema
- Reference **UX_FLOW.md** for interaction patterns
- Review **PRODUCT_REQUIREMENTS.md** for technical architecture

### For Content Writers
- Start with **SAFETY_ETHICS.md** for language requirements
- Reference **UX_FLOW.md** for UI copy context
- Review **PRODUCT_REQUIREMENTS.md** for tone and positioning

### For QA Testers
- Start with **UX_FLOW.md** for test scenarios
- Reference **PRODUCT_REQUIREMENTS.md** for acceptance criteria
- Review **SAFETY_ETHICS.md** for content validation

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Database schema implementation (DATA_MODEL.md)
- Core data models and migrations
- Basic CRUD operations

### Phase 2: MVP Features (Weeks 3-8)
- Onboarding and profile creation (UX_FLOW.md, section 1)
- Soul blueprint dashboard (UX_FLOW.md, section 2)
- Compatibility engine (UX_FLOW.md, section 3)
- Daily insights (UX_FLOW.md, section 4)
- AI chat integration (UX_FLOW.md, section 5)
- PDF export (UX_FLOW.md, section 6)

### Phase 3: Premium Features (Weeks 9-12)
- Subscription system (PRICING_MODEL.md)
- Feature gating (free vs. premium)
- Stripe integration
- Premium feature unlocks

### Phase 4: Safety & Polish (Weeks 13-14)
- Safety guardrails implementation (SAFETY_ETHICS.md)
- Disclaimers on all screens
- Crisis detection in AI chat
- Content quality review
- Accessibility audit
- Performance optimization

### Phase 5: Launch (Week 15)
- Beta testing with 50 users
- Bug fixes and iterations
- Marketing materials
- App Store submission (PWA via PWABuilder)
- Public launch

---

## Document Maintenance

**Review Cycle:**
- **PRODUCT_REQUIREMENTS.md:** Monthly during active development, quarterly after launch
- **UX_FLOW.md:** After each major UX update or user research session
- **DATA_MODEL.md:** With each database migration or schema change
- **PRICING_MODEL.md:** Quarterly or when pricing changes
- **SAFETY_ETHICS.md:** Quarterly or when safety incidents occur

**Version Control:**
All documents are version controlled in Git. Update version numbers and "Last Updated" dates when making changes.

**Document Owners:**
- **PRODUCT_REQUIREMENTS.md:** Product Team
- **UX_FLOW.md:** Product & Design Team
- **DATA_MODEL.md:** Engineering Team
- **PRICING_MODEL.md:** Product & Business Team
- **SAFETY_ETHICS.md:** Ethics & Safety Team

---

## Questions or Feedback?

For questions about this documentation:
- Product questions: [Product Team Email]
- Technical questions: [Engineering Team Email]
- Ethics questions: [Ethics & Safety Team Email]

For documentation updates or corrections, please open a GitHub issue or pull request.

---

**Status:** ✅ Complete & Ready for Development  
**Next Steps:** Begin Phase 1 implementation (database schema)  
**Target Launch:** Q2 2026
