# Ultimate Soul Codex (Engine of the Eternal Now)

> **Enterprise Architecture Master Repository**

This is the central monorepo for the **Ultimate Soul Codex**, a world-class cosmic synthesis and life-mapping platform designed for high performance, dynamic interactions, and rigorous backend data validation. 

## 🌌 System Architecture

The platform operates using a split architecture housed within a seamless full-stack structure:

- **Frontend (`/client/src`)**: A high-performance React application built with Vite, featuring bespoke animations, deep cosmic styling (dark void and starry backdrops), and intuitive Radix UI components styled dynamically via TailwindCSS.
- **Backend (`/server` & direct root scripts)**: A robust Node.js Express server acting as the REST API hub, incorporating Stripe Webhooks, SSE streaming endpoints (`/api/chat/soul-guide`), and complex Drizzle ORM PostgreSQL integration.
- **Engines & Compute (`/soulcodex`, `/services`, `/shared`)**: World-class backend calculation services orchestrating Vedic Astrology, Human Design, Kabbalah, I-Ching, and Numerology logic mapping into unified models.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Wouter (Routing), TailwindCSS, Radix UI, Framer Motion
- **Backend**: Node.js (v20), Express, PostgreSQL (Neon Serverless)
- **Generative AI**: Google Gemini API (`@google/genai`)
- **Database ORM**: Drizzle ORM (`drizzle-kit`)
- **Payments**: Stripe (`stripe-node`)
- **Operations & CI**: TypeScript Checks (`tsc`), GitHub Actions, Prettier 

## 🛠 Operations Command Center

### Development
Launch the interactive development server. Vite proxy routes `/api` calls to Express seamlessly.
```bash
npm run dev
```

### CI / CD Validations (Strict Mode)
We employ a zero-error typescript policy. Run this to verify the enterprise integrity across models, database ORM, and React components.
```bash
npm run check
```

### Production Build
Generates the fully tree-shaken and bundled ESBuild target into `/dist`.
```bash
npm run build
```

## 📜 Repository Directives (AGENTS.md)

This project runs on rigorous engineering standards:
1. **The "No Illusion" Rule**: All user-facing features must work end-to-end. Mocks are isolated to tests only. 
2. **Audit-First**: TypeScript compiler flags must be addressed cleanly at the database layer (`IStorage`, `schema.ts`) to avoid silent runtime errors.
3. **Continuous Enforcement**: The repository leverages comprehensive GitHub Actions to parse changes against our baseline architecture rules.

## ✨ Recent Upgrades
* Transformed legacy Next.js routing patterns securely into Vite dynamic single-page pathways.
* Re-Architected backend memory interfaces for `astronomy-engine` vector calculations and complex JSONB postgres fields.
* Fixed real-time SSE buffering engine for precise AI payload delivery directly onto typing indicators.

---
*Driven by the Engine of the Eternal Now.*
