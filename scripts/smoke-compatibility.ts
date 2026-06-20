/**
 * Compatibility scoring-honesty smoke test (no framework — run with tsx).
 *
 *   npx tsx scripts/smoke-compatibility.ts
 *
 * Verifies the availability-aware scoring: missing systems lower confidence,
 * never poison (0) or inflate (constant) the score; unknown birth time excludes
 * Human Design rather than faking it; the response declares what was used,
 * excluded, and why. Exits 1 on any failure.
 */
import { calculateCompatibility } from "../services/compatibility";

type P = Record<string, any>;
const known = (name: string, sun: string, moon: string, rising: string, lifePath: number, hdType: string, withPersonality = false): P => ({
  name, birthTime: "14:30",
  astrologyData: { sunSign: sun, moonSign: moon, risingSign: rising },
  numerologyData: { lifePath },
  humanDesignData: { type: hdType, authority: "Sacral" },
  personalityData: withPersonality ? { enneagram: { type: 5 }, mbti: { type: "INTJ" } } : undefined,
});
const unknown = (name: string, sun: string, moon: string, lifePath: number): P => ({
  name, // no birthTime
  astrologyData: { sunSign: sun, moonSign: moon }, // no rising
  numerologyData: { lifePath },
  // no humanDesignData
});

let failed = 0;
const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, fn: () => { pass: boolean; detail: string }) {
  try { const r = fn(); results.push({ name, ...r }); if (!r.pass) failed++; }
  catch (e) { results.push({ name, pass: false, detail: `THREW: ${(e as Error).message}` }); failed++; }
}

const usedKeys = (r: any) => (r.systemsUsed || []).map((s: any) => s.system);
const exclKeys = (r: any) => (r.systemsExcluded || []).map((s: any) => s.system);
const hasNoConstantInUsed = (r: any) =>
  (r.systemsUsed || []).every((s: any) => !["spiritual"].includes(s.system)); // spiritual is the constant-prone one
const weightsSum = (r: any) => (r.systemsUsed || []).reduce((a: number, s: any) => a + s.weight, 0);

// 1. known × known (no personality/moral/spiritual data)
check("1. known × known", () => {
  const r = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator") as any, known("B", "Taurus", "Cancer", "Virgo", 3, "Projector") as any);
  const used = usedKeys(r), excl = exclKeys(r);
  const pass = used.includes("astrology") && used.includes("numerology") && used.includes("humanDesign")
    && excl.includes("spiritual") && excl.includes("personality")
    && r.confidence?.label === "Partial" && hasNoConstantInUsed(r);
  return { pass, detail: `score=${r.overallScore} used=[${used}] conf=${r.confidence?.label}` };
});

// 2. known × unknown (HD must be excluded for birth-time reason, not scored 0)
check("2. known × unknown", () => {
  const r = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator") as any, unknown("B", "Taurus", "Cancer", 3) as any);
  const used = usedKeys(r), excl = exclKeys(r);
  const hdReason = (r.systemsExcluded || []).find((s: any) => s.system === "humanDesign")?.reason || "";
  const pass = used.includes("astrology") && used.includes("numerology") && !used.includes("humanDesign")
    && /birth time/i.test(hdReason) && r.confidence?.label === "Partial";
  return { pass, detail: `score=${r.overallScore} used=[${used}] hdReason="${hdReason.slice(0, 40)}..."` };
});

// 3. unknown × unknown
check("3. unknown × unknown", () => {
  const r = calculateCompatibility(unknown("A", "Scorpio", "Leo", 8) as any, unknown("B", "Taurus", "Cancer", 3) as any);
  const used = usedKeys(r);
  const pass = used.includes("astrology") && used.includes("numerology") && !used.includes("humanDesign") && hasNoConstantInUsed(r);
  return { pass, detail: `score=${r.overallScore} used=[${used}] conf=${r.confidence?.label}` };
});

// 4. missing advanced systems → spiritual always excluded, never a constant in the score
check("4. advanced systems excluded", () => {
  const r = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator") as any, known("B", "Taurus", "Cancer", "Virgo", 3, "Projector") as any);
  const pass = exclKeys(r).includes("spiritual") && !usedKeys(r).includes("spiritual");
  return { pass, detail: `spiritual excluded=${exclKeys(r).includes("spiritual")}` };
});

// 5. personality absent → excluded; present → used
check("5. personality absent vs present", () => {
  const absent = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator") as any, known("B", "Taurus", "Cancer", "Virgo", 3, "Projector") as any);
  const present = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator", true) as any, known("B", "Taurus", "Cancer", "Virgo", 3, "Projector", true) as any);
  const pass = exclKeys(absent).includes("personality") && usedKeys(present).includes("personality") && present.confidence?.label === "Verified";
  return { pass, detail: `absent: excluded=${exclKeys(absent).includes("personality")} | present: used=${usedKeys(present).includes("personality")} conf=${present.confidence?.label}` };
});

// 6 & 7. numerology + astrology present are always used; weights normalize ~100
check("6/7. astrology+numerology used, weights ~100%", () => {
  const r = calculateCompatibility(known("A", "Scorpio", "Leo", "Pisces", 8, "Generator") as any, unknown("B", "Taurus", "Cancer", 3) as any);
  const used = usedKeys(r);
  const wsum = weightsSum(r);
  const pass = used.includes("astrology") && used.includes("numerology") && wsum >= 99 && wsum <= 101;
  return { pass, detail: `used=[${used}] weightsSum=${wsum}%` };
});

console.log("\n=== Soul Codex compatibility smoke test ===");
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(42)} ${r.detail}`);
console.log(`\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`);
process.exit(failed ? 1 : 0);
