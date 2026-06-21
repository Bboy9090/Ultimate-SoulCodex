# Soul Codex — Reality Audit

A running, honest ledger of what is actually real vs. what is assumed. Update it
whenever a subsystem is validated, fixed, or found broken. "Working" means
observed producing real, correct output — not "the file exists."

_Last updated: 2026-06-20 (AI unknown-time honesty hardening pass)_

---

## ✅ Confirmed working (validated this pass)

| Area | Evidence |
|---|---|
| Western natal chart | `calculateAstrology` → 1990-11-08 14:30 NYC = **Sun Scorpio, Moon Leo, Rising Pisces**, houses present. `/api/astro/fullchart` returns all 10 planets with degrees. |
| Human Design | `/today` renders **Generator / Sacral Authority / 3-6 profile** from real birth data. |
| Numerology | Personal Day, Life Path, Universal Day compute deterministically. |
| Daily card | `/api/today/card` → real `moonPhase` ("Waxing Gibbous"), `personalDay`, today's date. |
| Soul archetype + synthesis | Real archetype, non-empty strengths/shadows/bio/purpose, **no single-letter stubs**, honest `confidence` + `astrologyStatus`. |
| Unknown-time honesty | No birth time → Rising omitted (not faked), status `partial` with reason. AI Soul Guide explicitly forbidden from inferring rising/houses/ascendant via system prompt + profile-block guards. Verified `scripts/smoke-unknown-time.ts` (**7/7**). |
| Astrology services | `horoscope`, `vedic`, `asteroids`, `transits`, `progressions`, `daily-context` all pass `scripts/smoke-astrology.ts` (**7/7**). |
| Profile persistence | Created profile stored in `localStorage` (~57 KB); survives navigation/reload. |
| Vertical slice | `/start → /today → /codex` renders real per-profile data with no `Unknown`/`undefined`/fetch errors. |
| API routing | `resolveApiUrl` now: VITE_API_URL > Capacitor-native→prod > browser→same-origin. Localhost no longer hits prod. |
| Build / typecheck / boot | `build:server`, `build:client`, `npm run check` (incl. `@soulcodex/astrology`) pass; server boots DB-less (MemStorage). |

## 🟡 Partially working

| Area | Status |
|---|---|
| Codex deep reading (`/api/codex30/generate`) | Returns 200 from localhost; archetype + codename render. Long-form narrative is brief without AI keys (deterministic fallback is minimal). AI keys enhance it. |
| Compatibility | **Hardened for scoring honesty.** Astrology + numerology synastry are real; missing systems (Human Design when birth time unknown, personality, moral compass, the 15 advanced) are **excluded and re-normalized**, never scored 0 or a constant 70. Response includes a `confidence` badge + `systemsUsed`/`systemsExcluded`/`missingDataWarnings`. Verified via `scripts/smoke-compatibility.ts` (6/6) + live API. The 15 advanced systems remain unbuilt on the onboarding path — marked unavailable and unweighted, not faked. |
| Narrative richness without AI | Deterministic copy is solid but shorter than AI output. By design: AI enhances, does not rescue. |

## ❌ Broken / fixed this pass

| Issue | Status |
|---|---|
| `astronomy-engine` CJS/ESM interop (`Observer is not a constructor`) → all charts "Unknown" | **Fixed** across all importers (`Astro = default ?? namespace` alias). |
| Synthesis single-letter stubs (`"T."`, `"P."`) | **Fixed** (rewrote `cleanup()` + per-field guards). |
| `astrologyData: null` returned silently | **Fixed** (normalize shape; return `astrologyStatus {state,reason}`). |
| Empty `core_strengths` / `shadow_aspects` | **Fixed** (deterministic archetype profile). |
| Vedic: `Ecliptic(SunPosition())` double-wrap + `.lon`/`.elon` mismatch + plain-object `Observer` | **Fixed** (`services/vedic-astrology.ts`). |
| `localhost` silently calling production Railway | **Fixed** (`resolveApiUrl`). |

## ❓ Untested (no claim made)

- Compatibility full `analyze` flow now exercised + hardened (see above). Remaining untested: the 15 advanced systems on the onboarding path (intentionally unbuilt).
- ~~AI Soul Guide with real provider keys~~ — now verified (Gemini live, 4/4 pass).
- Push notifications (VAPID), PDF generation, email capture.
- Capacitor native (iOS) runtime; transit endpoints behind auth (function-level smoke only).

---

## Premium / entitlement (audited 2026-06-20, **hardened**)

Plumbing was real; the front door was fake — now fixed. Stripe stays intentionally
removed (App Store compliance); monetization path is **access-code entitlement**.
Verified via `scripts/smoke-premium.ts` (7/7) + browser redemption.

| Aspect | Status |
|---|---|
| Entitlement source of truth (`entitlement-service.ts`) | ✅ Real — override → Stripe → access code → legacy → none; memoized 5 min. |
| `/api/entitlements` status endpoint | ✅ Real — owner bypass + session + entitlement. |
| Access-code redemption (`/api/access-codes/validate`) | ✅ Real — validates active/expiry/maxUses, persists redemption + usage increment, flags session + profile. |
| PDF generation (`server/natalReportPdf.ts`, pdfkit) | ✅ Real — verified real `%PDF` bytes for natal/profile/compatibility. |
| Single backend guard (`requirePremium`) | ✅ Added — owner → session → entitlement; returns 403. Applied to `/api/natal-report`, `/api/pdf/profile`, `/api/pdf/compatibility`. |
| `/api/natal-report` gating | ✅ Fixed — now 403 for anon/free; real PDF only when entitled. |
| "Upgrade" button (`PricingPage`) | ✅ Fixed — real access-code redemption calling `/api/access-codes/validate`, then confirms via `/api/entitlements`. No localStorage grant. |
| User-facing redemption UI | ✅ Added — code input + Redeem on Pricing page, clear success/error. |
| Frontend premium pages (Blueprint/Poster/SoulGuide) | ✅ Fixed — backend-authoritative; localStorage is optimistic cache only (cleared when backend says false). |
| Frontend↔backend premium agreement | ✅ Aligned — no client flag unlocks by itself. |
| Stripe payment | ⚪ N/A — removed by design (mock checkout, no-op webhooks). Not "broken." |
| Cancel / restore flow | ⚪ None — access codes don't cancel; re-entering a code restores access. |
| Test-mode safety | ✅ Safe by removal (no Stripe keys, no charge path); premium now requires a real server-side code. |

Fix order (tracked on `claude/harden-premium`): remove fake unlock → real access-code
redemption UI → single `requirePremium` guard (incl. `/api/natal-report`) →
frontend trusts `/api/entitlements` → PDF smoke validation. Stripe stays mocked.

## AI Soul Guide (audited 2026-06-20)

| Aspect | Status |
|---|---|
| Provider selection (Gemini→Groq→OpenAI cascade) | ✅ Real — `getAvailableProvider()` in `ai-provider.ts`, dummy-key sentinel check, 8s per-provider timeout in `ai-router.ts`. |
| Deterministic fallback without keys | ✅ Real — `deterministicFallback()` in `services/deterministic-fallback.ts` returns profile-aware behavioral synthesis (sun/moon nuance, HD type, numerology). Not empty. |
| Premium gating | ✅ Real — `/api/chat/soul-guide` checks session→owner→entitlement. Free: 1-2 questions then 403. Premium: unlimited. |
| Real profile/chart usage | ✅ Real — `ai-respond.ts` + `chat.ts` inject actual sunSign, moonSign, risingSign, lifePath, HD type into prompt. |
| Unknown-time honesty | ✅ Real (hardened) — System prompt + profile block explicitly forbid AI from inferring rising/ascendant/houses when birth time unknown. Verified `scripts/smoke-unknown-time.ts` (7/7). |
| Hallucinated chart facts | ✅ Guarded — CORE_DATA_RULE restricts to 1-3 relevant placements; `finalOutputGuard` rejects low-quality output. |
| Prompt/system-data leakage | ✅ Secure — Response streams only `{ content }` chunks. System prompt never sent to client. |
| Sensitive data in logs | ✅ Clean — Only error messages logged, never prompts, birth data, or API keys. Cache uses SHA256 hashes. |
| Rate limiting | ✅ Real — Session-based chatCount, 1-2 free then 403. No global IP rate limit (acceptable at current scale). |
| Provider failure fallback | ✅ Real — Cascading Gemini(8s)→Groq(8s)→OpenAI(8s)→deterministic. User never sees raw error. |
| Real-key provider smoke | ✅ Real — Gemini responds live (1200-1500 chars), unknown-time guard holds with live AI (no rising/house fabrication), rate limit fires 403 after 2 free. Verified `scripts/smoke-ai-live.ts` (4/4). |

## Routes / pages validated this pass
- API: `/api/health`, `/api/soul-archetype` (known + unknown time), `/api/today/card`, `/api/astro/fullchart`.
- API routing (VITE_API_URL unset): `/api/codex30/generate`, `/api/astro/horoscope/daily`, `/api/compatibility/archetype-matches` all 200 from `localhost` (zero Railway calls).
- UI: `/` (landing), `/today`, `/codex`.
- Service-level (smoke): astrology, horoscope, vedic, asteroids, transits, progressions, daily-context.

## Commands run
```
npm run build:server
npm run build:client
npm run check            # workspaces incl. @soulcodex/astrology
npx tsx scripts/smoke-astrology.ts   # 7/7
curl /api/soul-archetype  (known + unknown time)
curl /api/today/card
curl /api/astro/fullchart
```

## How to re-verify
```
SESSION_SECRET=dev DEMO_MODE=true npm run dev   # boots without a DB
npx tsx scripts/smoke-astrology.ts              # must print 7/7, exit 0
```
