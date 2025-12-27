# Soul Codex - Engine of Eternal Now

A mobile-first personality and compatibility application that synthesizes 30+ spiritual and psychological systems (astrology, numerology, Human Design, psychology, and more) into personalized insights for self-discovery and relationships.

## 🌟 What is Soul Codex?

Soul Codex provides users with a comprehensive "soul blueprint" combining multiple mystical and psychological frameworks into one unified platform. Users can:

- Generate complete personality profiles (natal charts, numerology, Human Design, etc.)
- Check compatibility with partners, friends, family, or colleagues
- Receive daily personalized insights based on current transits
- Chat with an AI Soul Guide for clarification and guidance
- Export professional PDF reports
- Track personal growth through journaling (coming soon)

## 📚 Documentation

Complete product documentation is available in the following files:

- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Start here! Overview of all documentation
- **[PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)** - Product Requirements Document (PRD)
- **[UX_FLOW.md](./UX_FLOW.md)** - Complete UX flows and interaction patterns
- **[DATA_MODEL.md](./DATA_MODEL.md)** - Database schema and data architecture
- **[PRICING_MODEL.md](./PRICING_MODEL.md)** - Pricing tiers and monetization strategy
- **[SAFETY_ETHICS.md](./SAFETY_ETHICS.md)** - Ethical guidelines and safety protocols

### Quick Links

- [Target Users & Problem Statement](./PRODUCT_REQUIREMENTS.md#2-problem-statement)
- [Feature Roadmap (MVP, v1, v2)](./PRODUCT_REQUIREMENTS.md#4-features-by-release)
- [Complete UX Flow](./UX_FLOW.md)
- [Database Schema](./DATA_MODEL.md#appendix-sql-schema-postgresql)
- [Free vs Premium Features](./PRICING_MODEL.md#feature-comparison-table)
- [Safety Guidelines](./SAFETY_ETHICS.md#core-ethical-principles)

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend:** Node.js 20 + Express.js
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **AI:** OpenAI GPT-4 Turbo (streaming)
- **Payments:** Stripe (subscriptions)
- **Deployment:** Render.com + Cloudflare CDN
- **Analytics:** Microsoft Clarity (GDPR compliant)

## ✨ Key Features

### Already Implemented (MVP)

- ✅ Complete soul profile generation (30+ systems)
- ✅ Natal chart visualization with planets, houses, aspects
- ✅ Numerology (life path, destiny, soul urge, etc.)
- ✅ Human Design (type, authority, centers, gates)
- ✅ Compatibility analysis (5 pillars, synastry, detailed reports)
- ✅ Save unlimited people (partners, friends, family)
- ✅ Daily insights with transits and biorhythms
- ✅ AI Soul Guide chat (GPT-4 powered)
- ✅ PDF export with lazy loading
- ✅ Offline-first functionality
- ✅ Mobile-responsive PWA
- ✅ Database persistence (PostgreSQL)
- ✅ Access code system (tiered)

### Coming Soon (v1 - 3 Months)

- 🔜 Enhanced journaling with 100+ reflection prompts
- 🔜 Advanced transits calendar
- 🔜 Progressions and return charts
- 🔜 Premium subscription system (Stripe)
- 🔜 Push notifications for significant transits
- 🔜 Custom PDF templates
- 🔜 Shareable profile links

### Future (v2 - 6-12 Months)

- 🔮 Social features (friend connections, compatibility leaderboards)
- 🔮 Coaching integrations (1:1 sessions with astrologers)
- 🔮 Group compatibility analysis (teams, families)
- 🔮 Wearable integrations (biorhythm sync)
- 🔮 Multi-language support

## 🎯 Getting Started

### For Users

Visit [https://soulcodex.app](https://soulcodex.app) to create your soul profile. No credit card required for free tier.

### For Developers

See [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md#6-technical-architecture) for technical architecture and [DATA_MODEL.md](./DATA_MODEL.md) for database setup.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your DATABASE_URL, OPENAI_API_KEY, etc.

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 💰 Pricing

- **Free Tier:** 1 profile, 5 saved people, 3 compatibility analyses/month
- **Premium Tier:** $9.99/month or $89.99/year - Unlimited everything + advanced features

See [PRICING_MODEL.md](./PRICING_MODEL.md) for complete pricing details.

## 🛡️ Safety & Ethics

Soul Codex is committed to providing empowering, ethical insights:

- **Non-deterministic language:** We provide possibilities, not predictions
- **No medical advice:** Always refer to licensed professionals
- **Inclusive language:** Respecting all identities and cultures
- **Crisis support:** Automated detection and resources for users in distress
- **Transparency:** Clear disclaimers on all content

See [SAFETY_ETHICS.md](./SAFETY_ETHICS.md) for complete ethical guidelines.

## 📊 Status

**Current Version:** 1.0 (MVP)  
**Production Status:** ✅ Deployed and operational  
**App Store Status:** Ready for submission (PWA)  
**Documentation Status:** ✅ Complete and shippable  

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

For major changes, please open an issue first to discuss what you would like to change.

## 📧 Contact

_Note: The following email addresses are illustrative placeholders. Please use the project's GitHub issues for contact until official channels are published._
- **Support:** support@soulcodex.app
- **Ethics Questions:** ethics@soulcodex.app
- **Business Inquiries:** business@soulcodex.app

---

**Built with 💜 for seekers, navigators, and enthusiasts on their soul journey.**
