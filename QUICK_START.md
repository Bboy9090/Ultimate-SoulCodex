# ⚡ Quick Start — Soul Codex

## Run the App

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (see below for minimum config)

# 3. Build
npm run build

# 4. Start
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

> **`npm run dev`** uses Vite for hot-reload. It requires a Vite-capable environment (e.g., Replit, or with `vite` installed). For standard local use, `npm run build && npm start` is the reliable path.

---

## Minimum Configuration

For local development without a database, enable demo mode:

```env
DEMO_MODE=true
SESSION_SECRET=any-random-string-here
```

For full functionality:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SESSION_SECRET=your-random-secret-here
GEMINI_API_KEY=your-gemini-key          # AI synthesis
OPENAI_API_KEY=your-openai-key          # AI fallback
STRIPE_SECRET_KEY=sk_test_...           # Payments (optional)
```

---

## Core Pages

| URL | What it does |
|---|---|
| `/` | Onboarding — enter birth data, create your profile |
| `/profile` | Your full Soul Codex (35+ systems) |
| `/today` | Daily soul context — transits, Gene Key, Tarot |
| `/compat` | Compatibility — add people, run 5-pillar analysis |
| `/codex` | Deep AI-powered Codex reading with PDF export |
| `/guide` | AI Soul Guide chat |
| `/horoscope` | Daily horoscope & transit calendar |
| `/poster` | Generate a shareable soul profile poster |

---

## Build & Database

```bash
# Build for production
npm run build

# Push DB schema (requires DATABASE_URL)
npm run db:push

# Generate migration files
npm run db:generate

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

---

## Customize the Theme

All colors are controlled via Tailwind CSS. The color palette is defined in `tailwind.config.ts` and documented in [COLOR_SYSTEM.md](COLOR_SYSTEM.md).

---

## Deployment

- [Railway](RAILWAY_DEPLOY.md)
- [Fly.io](FLY_IO_DEPLOY.md)
- [VPS / Docker](VPS_SELF_HOSTING.md)
