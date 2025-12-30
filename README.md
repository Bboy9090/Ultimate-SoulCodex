# 🔮 Soul Codex - Engine of Eternal Now

<div align="center">

![Soul Codex Banner](https://img.shields.io/badge/Soul_Codex-Engine_of_Eternal_Now-7c3aed?style=for-the-badge&labelColor=0a0118)

**The Ultimate Mystical Identity Synthesis Platform**

*Discover your cosmic blueprint through 30+ spiritual and psychological systems*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[🌟 Live Demo](https://soulcodex.app) · [📖 Documentation](./DOCUMENTATION_INDEX.md) · [🎯 Features](#-features)

</div>

---

## ✨ What is Soul Codex?

Soul Codex is a **legendary, production-ready** mobile-first web application that synthesizes **30+ mystical and psychological systems** into a unified soul blueprint. Users receive comprehensive personality analysis, compatibility insights, and AI-powered spiritual guidance.

### 🌌 The Cosmic Experience

- **Complete Soul Profile** — Instant analysis across all 30+ systems
- **Stunning Cosmic UI** — Dark theme with glassmorphism, animations & particle effects
- **AI Soul Guide** — GPT-4 powered chat with full profile context
- **Compatibility Analysis** — Deep relationship insights across all dimensions
- **Daily Cosmic Insights** — Personalized guidance based on transits & biorhythms
- **PWA Ready** — Install on any device, works offline

---

## 🔮 30+ Mystical Systems

<table>
<tr>
<td width="25%">

### ☀️ Western Astrology
- Natal charts
- Houses & aspects
- Transits
- Interpretations

</td>
<td width="25%">

### 🔢 Numerology
- Life Path
- Destiny
- Soul Urge
- Personality

</td>
<td width="25%">

### ⚡ Human Design
- Type & Strategy
- Authority
- Centers & Gates
- Incarnation Cross

</td>
<td width="25%">

### 🌙 Vedic Astrology
- Jyotish chart
- Nakshatras
- Dashas
- Yogas

</td>
</tr>
<tr>
<td>

### 🐉 Chinese Astrology
- Animal signs
- Elements
- Pillars of Destiny

</td>
<td>

### 🧬 Gene Keys
- Life Work
- Evolution
- Radiance
- Purpose

</td>
<td>

### ☯️ I Ching
- Birth Hexagram
- Life Wisdom
- Changing Lines

</td>
<td>

### ✡️ Kabbalah
- Tree of Life
- Soul Path
- Tikkun

</td>
</tr>
<tr>
<td>

### 🌀 Mayan Astrology
- Galactic Signature
- Tzolkin
- Day Sign & Tone

</td>
<td>

### 🪷 Chakra System
- Dominant Chakra
- Balance Analysis
- Activation Tips

</td>
<td>

### 📐 Sacred Geometry
- Soul Shape
- Geometric Blueprint
- Harmonics

</td>
<td>

### ᚱ Runes
- Elder Futhark
- Birth Rune
- Life Guidance

</td>
</tr>
<tr>
<td>

### 🌟 Fixed Stars
- Stellar Influences
- Royal Stars
- Conjunctions

</td>
<td>

### 🏺 Arabic Parts
- Part of Fortune
- Part of Spirit
- Destiny Points

</td>
<td>

### ☄️ Asteroids
- Chiron
- Lilith
- Ceres & more

</td>
<td>

### 🌿 Ayurveda
- Dosha Analysis
- Constitution
- Wellness Tips

</td>
</tr>
<tr>
<td>

### 📈 Biorhythms
- Physical
- Emotional
- Intellectual

</td>
<td>

### 🎴 Tarot
- Birth Cards
- Soul Cards
- Personality Card

</td>
<td>

### ✋ Palmistry
- Life Line
- Heart Line
- Digital Reading

</td>
<td>

### 🌟 Sabian Symbols
- Sun Symbol
- Moon Symbol
- Ascendant Symbol

</td>
</tr>
</table>

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **UI Components** | Radix UI, Custom Glassmorphism Design System |
| **Routing** | Wouter (lightweight client-side) |
| **State Management** | TanStack React Query |
| **Backend** | Node.js 20, Express.js |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Drizzle ORM |
| **AI** | OpenAI GPT-4 Turbo (streaming) |
| **Payments** | Stripe (subscriptions) |
| **Auth** | Passport.js (local + OAuth) |
| **Deployment** | Render.com |
| **Analytics** | Microsoft Clarity (GDPR compliant) |

---

## 🎨 Design System

Soul Codex features a **legendary cosmic design system**:

- **Dark Cosmic Theme** — Deep space blacks with purple/pink/cyan accents
- **Glassmorphism** — Frosted glass cards with blur effects
- **Animated Backgrounds** — Subtle star fields and cosmic orbs
- **Gradient Text** — Eye-catching multi-color text effects
- **Smooth Animations** — Framer Motion transitions and micro-interactions
- **Mobile-First** — Touch-optimized, responsive on all devices

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon account)
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/soul-codex.git
cd soul-codex

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-secret-key
ADMIN_PASSWORD=admin-password
STRIPE_SECRET_KEY=sk_...  # Optional: for payments
```

---

## 📁 Project Structure

```
soul-codex/
├── client/                 # React frontend
│   ├── src/
│   │   ├── main.tsx       # App entry with all components
│   │   └── index.css      # Cosmic design system
│   └── index.html
├── server/
│   └── index.ts           # Express server entry
├── services/              # Business logic (30+ systems)
│   ├── astrology.ts
│   ├── numerology.ts
│   ├── human-design.ts
│   ├── ... (30+ files)
├── routes/                # API route modules
├── shared/                # Shared schemas & types
├── routes.ts              # Main API routes
├── storage.ts             # Database operations
└── vite.config.ts         # Vite configuration
```

---

## 💫 Key Features

### ✅ Already Implemented (Production Ready)

- [x] Complete 30+ system soul profile generation
- [x] Beautiful cosmic UI with glassmorphism
- [x] Real-time astrology calculations
- [x] Human Design chart calculations
- [x] Numerology analysis
- [x] AI Soul Guide chat (GPT-4)
- [x] Compatibility analysis
- [x] Daily insights with transits
- [x] User authentication (local + session)
- [x] Database persistence
- [x] PDF export capability
- [x] Push notifications
- [x] Stripe subscription integration
- [x] Mobile-responsive PWA

### 🔜 Coming Soon

- [ ] Enhanced journaling with prompts
- [ ] Transits calendar
- [ ] Social sharing
- [ ] Multi-language support

---

## 💰 Pricing Tiers

| Feature | Free | Premium ($9.99/mo) |
|---------|------|-------------------|
| Soul Profile | 1 | Unlimited |
| Saved People | 5 | Unlimited |
| Compatibility/month | 3 | Unlimited |
| AI Chat | Basic | Priority |
| PDF Export | ✓ | ✓ |
| Push Notifications | ✓ | ✓ |
| Advanced Reports | ✗ | ✓ |

---

## 🛡️ Safety & Ethics

Soul Codex is committed to ethical guidance:

- **Empowering Language** — Possibilities, not predictions
- **No Medical Advice** — Always refer to professionals
- **Inclusive Design** — Respectful of all identities
- **Crisis Support** — Automated detection & resources
- **Privacy First** — GDPR compliant, no data selling

See [SAFETY_ETHICS.md](./SAFETY_ETHICS.md) for complete guidelines.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | Overview of all docs |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | Complete PRD |
| [UX_FLOW.md](./UX_FLOW.md) | UX flows & patterns |
| [DATA_MODEL.md](./DATA_MODEL.md) | Database schema |
| [PRICING_MODEL.md](./PRICING_MODEL.md) | Monetization strategy |
| [SAFETY_ETHICS.md](./SAFETY_ETHICS.md) | Ethical guidelines |

---

## 📊 Status

| Metric | Status |
|--------|--------|
| **Version** | 2.0 (Legendary Transformation) |
| **Production** | ✅ Ready |
| **Frontend** | ✅ Complete cosmic UI |
| **Backend** | ✅ All 30+ systems |
| **Database** | ✅ PostgreSQL |
| **PWA** | ✅ Installable |
| **App Store** | 📝 Ready for submission |

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 💜 Credits

Built with love for seekers, navigators, and enthusiasts on their soul journey.

**Soul Codex - Engine of Eternal Now**

*Your cosmic blueprint awaits.*

---

<div align="center">

🔮 ✨ 💫 🌙 ⭐

</div>
