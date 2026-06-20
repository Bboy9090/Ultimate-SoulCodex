/**
 * Astrology engine smoke test (no test framework — run with tsx).
 *
 *   npx tsx scripts/smoke-astrology.ts
 *
 * Guards against the astronomy-engine CJS/ESM interop regression: every service
 * must compute real placements and never silently return "Unknown". Exits 1 on
 * any failure so it can gate CI / pre-commit.
 */
import { calculateAstrology } from "../services/astrology";
import { calculateCurrentPlanets } from "../services/horoscope";
import { getMoonSign, getMoonPhase, getDailyContext } from "../services/daily-context";
import { calculateVedicAstrology } from "../services/vedic-astrology";
import { calculateAsteroids } from "../services/asteroids";
import { calculateActiveTransits, extractNatalPositions } from "../transits";
import { calculateSecondaryProgressions } from "../services/progressions";

const ZODIAC = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const isSign = (s: unknown): boolean => typeof s === "string" && ZODIAC.includes(s);
const noUnknown = (o: unknown): boolean => !/\bUnknown\b/.test(JSON.stringify(o ?? null));

// Known reference birth: 1990-11-08 14:30, New York (Scorpio Sun).
const BIRTH = {
  name: "Smoke Test",
  birthDate: "1990-11-08",
  birthTime: "14:30",
  birthLocation: "New York, NY, USA",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
} as const;

type Check = { name: string; pass: boolean; detail: string };
const results: Check[] = [];
function check(name: string, fn: () => { pass: boolean; detail: string }) {
  try {
    const { pass, detail } = fn();
    results.push({ name, pass, detail });
  } catch (e) {
    results.push({ name, pass: false, detail: `THREW: ${(e as Error).message}` });
  }
}

// 1. Core natal chart
check("astrology.calculateAstrology", () => {
  const a = calculateAstrology(BIRTH as any);
  const pass = a.sunSign === "Scorpio" && isSign(a.moonSign) && isSign(a.risingSign) && noUnknown({ s: a.sunSign, m: a.moonSign, r: a.risingSign });
  return { pass, detail: `sun=${a.sunSign} moon=${a.moonSign} rising=${a.risingSign}` };
});

// 2. Current transiting planets
check("horoscope.calculateCurrentPlanets", () => {
  const planets = calculateCurrentPlanets(new Date());
  const pass = Array.isArray(planets) && planets.length > 0 && planets.every((p: any) => isSign(p.sign));
  return { pass, detail: `${planets.length} planets, e.g. ${planets[0]?.planet}=${planets[0]?.sign}` };
});

// 3. Daily context (moon sign/phase + personal day)
check("daily-context.getMoonSign/getMoonPhase/getDailyContext", () => {
  const ms = getMoonSign(new Date());
  const mp = getMoonPhase(new Date());
  const ctx = getDailyContext(BIRTH.birthDate, new Date());
  const pass = isSign(ms) && !!mp?.phase && noUnknown(ctx);
  return { pass, detail: `moonSign=${ms} phase=${mp?.phase}` };
});

// 4. Vedic
check("vedic.calculateVedicAstrology", () => {
  const v: any = calculateVedicAstrology({
    birthDate: BIRTH.birthDate, birthTime: BIRTH.birthTime,
    timezone: BIRTH.timezone, latitude: BIRTH.latitude, longitude: BIRTH.longitude,
  });
  const pass = !!v && noUnknown(v);
  return { pass, detail: `keys=${Object.keys(v || {}).slice(0, 4).join(",")}` };
});

// 5. Asteroids (pure-math service — must still produce real signs)
check("asteroids.calculateAsteroids", () => {
  const a: any = calculateAsteroids(BIRTH.birthDate, BIRTH.birthTime, BIRTH.timezone, 0);
  const pass = !!a && noUnknown(a);
  return { pass, detail: `keys=${Object.keys(a || {}).slice(0, 4).join(",")}` };
});

// 6. Transits (depends on a natal chart)
check("transits.calculateActiveTransits", () => {
  const natalChart = calculateAstrology(BIRTH as any);
  const natal = extractNatalPositions(natalChart);
  const t: any = calculateActiveTransits(natal, new Date());
  const pass = !!t && typeof t === "object" && noUnknown(t);
  return { pass, detail: `transits=${Array.isArray(t?.transits) ? t.transits.length : "n/a"}` };
});

// 7. Progressions
check("progressions.calculateSecondaryProgressions", () => {
  const p: any = calculateSecondaryProgressions(BIRTH as any, new Date());
  const pass = !!p && p.type === "secondary" && noUnknown(p);
  return { pass, detail: `type=${p?.type} planets=${Array.isArray(p?.progressedPlanets) ? p.progressedPlanets.length : "n/a"}` };
});

let failed = 0;
console.log("\n=== Soul Codex astrology smoke test ===");
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(48)} ${r.detail}`);
  if (!r.pass) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`);
process.exit(failed ? 1 : 0);
