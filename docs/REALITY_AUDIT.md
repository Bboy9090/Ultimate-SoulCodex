# Soul Codex — Reality Audit

A running, honest ledger of what is actually real vs. what is assumed. Update it
whenever a subsystem is validated, fixed, or found broken. "Working" means
observed producing real, correct output — not "the file exists."

_Last updated: 2026-06-20 (astronomy-engine hardening pass)_

---

## ✅ Confirmed working (validated this pass)

| Area | Evidence |
|---|---|
| Western natal chart | `calculateAstrology` → 1990-11-08 14:30 NYC = **Sun Scorpio, Moon Leo, Rising Pisces**, houses present. `/api/astro/fullchart` returns all 10 planets with degrees. |
| Human Design | `/today` renders **Generator / Sacral Authority / 3-6 profile** from real birth data. |
| Numerology | Personal Day, Life Path, Universal Day compute deterministically. |
| Daily card | `/api/today/card` → real `moonPhase` ("Waxing Gibbous"), `personalDay`, today's date. |
| Soul archetype + synthesis | Real archetype, non-empty strengths/shadows/bio/purpose, **no single-letter stubs**, honest `confidence` + `astrologyStatus`. |
| Unknown-time honesty | No birth time → Rising omitted (not faked), status `partial` with reason. |
| Astrology services | `horoscope`, `vedic`, `asteroids`, `transits`, `progressions`, `daily-context` all pass `scripts/smoke-astrology.ts` (**7/7**). |
| Profile persistence | Created profile stored in `localStorage` (~57 KB); survives navigation/reload. |
| Vertical slice | `/start → /today → /codex` renders real per-profile data with no `Unknown`/`undefined`/fetch errors. |
| API routing | `resolveApiUrl` now: VITE_API_URL > Capacitor-native→prod > browser→same-origin. Localhost no longer hits prod. |
| Build / typecheck / boot | `build:server`, `build:client`, `npm run check` (incl. `@soulcodex/astrology`) pass; server boots DB-less (MemStorage). |

## 🟡 Partially working

| Area | Status |
|---|---|
| Codex deep reading (`/api/codex30/generate`) | Returns 200 from localhost; archetype + codename render. Long-form narrative is brief without AI keys (deterministic fallback is minimal). AI keys enhance it. |
| Compatibility | `/api/compatibility/archetype-matches` returns 200 locally; full `compatibility/analyze` flow not yet exercised. |
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

- Compatibility (`/api/compatibility/*`) — endpoints exist, not exercised this pass.
- Premium / Stripe entitlements and paid report generation.
- AI Soul Guide with real provider keys (only fallback path tested).
- Push notifications (VAPID), PDF generation, email capture.
- Capacitor native (iOS) runtime; transit endpoints behind auth (function-level smoke only).

---

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
