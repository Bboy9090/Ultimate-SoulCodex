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
- AI Soul Guide with real provider keys (only fallback path tested).
- Push notifications (VAPID), PDF generation, email capture.
- Capacitor native (iOS) runtime; transit endpoints behind auth (function-level smoke only).

---

## Premium / entitlement (audited 2026-06-20)

The plumbing is real; the front door is fake. Stripe is intentionally removed
(App Store compliance) — current monetization path is **access-code entitlement**.

| Aspect | Status |
|---|---|
| Entitlement source of truth (`entitlement-service.ts`) | ✅ Real — override → Stripe → access code → legacy → none; memoized 5 min. |
| `/api/entitlements` status endpoint | ✅ Real — owner bypass + session + entitlement. |
| Access-code redemption (`/api/access-codes/validate`) | ✅ Real — validates active/expiry/maxUses, persists redemption + usage increment, flags session + profile, clears cache. |
| PDF generation (`server/natalReportPdf.ts`, pdfkit) | ✅ Real — natal wheel + sections; routes send `application/pdf`. |
| Admin access-code management | ✅ Real. |
| Stripe payment | ⚪ N/A — removed by design (mock checkout returns success, `confirmSubscription` always true, webhooks no-op). Not "broken." |
| Backend gating consistency | 🟡 Inconsistent — mix of `entitlementService`, `req.user.subscriptionStatus==="premium"`, `session.isPremium`, "logged-in only." |
| Frontend premium pages | 🟡 Trust `localStorage.soulPremium` (`if (cachedPremium) setIsPremium(true)`) — cached client flag overrides backend truth. |
| "Upgrade" button (`PricingPage.handlePurchase`) | ❌ Fake — no backend call; just sets `localStorage.soulPremium=true` + navigate. |
| User-facing access-code redemption UI | ❌ Missing — only Admin can create codes; the real entitlement path is unreachable for normal users. |
| `/api/natal-report` | ❌ Ungated — anyone can POST profile data and get the premium PDF. |
| Frontend↔backend premium agreement | ❌ Mismatch — localStorage unlock shows premium UI, but account-gated PDF endpoints 401 for anonymous users. |
| Cancel / restore flow | ⚪ None (access codes don't cancel). |
| Test-mode safety | ✅ Safe by removal (no Stripe keys, no charge path) — but premium has zero integrity (free via the localStorage flip). |

Fix order (tracked on `claude/harden-premium`): remove fake unlock → real access-code
redemption UI → single `requirePremium` guard (incl. `/api/natal-report`) →
frontend trusts `/api/entitlements` → PDF smoke validation. Stripe stays mocked.

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
