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

const placementEvidence = {
  source: "independent ephemeris comparison",
  engine: "compatibility-smoke@1",
  calculatedAt: "2026-09-28T14:00:00.000Z",
};

const verifiedHd = (type: "Generator" | "Projector") => ({
  status: "verified",
  engine: "soulcodex-hd-geocentric-v1",
  source: "Soul Codex deterministic Human Design core engine",
  calculatedAt: "2026-09-28T14:00:00.000Z",
  inputTimestampUtc: "1990-09-17T15:11:00.000Z",
  birthTimeKnown: true,
  candidate: type === "Generator"
    ? { type, strategy: "to respond", authority: "Sacral Authority", profile: "2/4" }
    : { type, strategy: "to wait for invitation", authority: "Splenic Authority", profile: "5/1" },
  verificationReceiptId: "35474994858:human-design-repair-audit",
  independentSource: "free-human-design@1.0.1 differential verifier",
  verifiedAt: "2026-09-19T23:03:08.000Z",
  limitations: [],
});

const known = (
  name: string,
  sun: string,
  moon: string,
  rising: string,
  birthDate: string,
  hdType: "Generator" | "Projector",
  withPersonality = false,
): P => ({
  name,
  birthDate,
  birthTime: "14:30",
  verifiedAstrologyData: {
    sun: { sign: sun, verificationStatus: "verified", evidence: placementEvidence },
    moon: { sign: moon, verificationStatus: "verified", evidence: placementEvidence },
    rising: { sign: rising, verificationStatus: "verified", evidence: placementEvidence },
    planets: {
      sun: { sign: sun, verificationStatus: "verified", evidence: placementEvidence },
      moon: { sign: moon, verificationStatus: "verified", evidence: placementEvidence },
    },
  },
  humanDesignData: verifiedHd(hdType),
  personalityData: withPersonality ? { enneagram: { type: 5 }, mbti: { type: "INTJ" } } : undefined,
});

const rawUnverified = (name: string, birthDate: string): P => ({
  name,
  birthDate,
  astrologyData: { sunSign: "Scorpio", moonSign: "Leo", risingSign: "Pisces" },
  humanDesignData: { type: "Generator", authority: "Sacral Authority" },
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

// 1. verified core systems are admitted; advanced spiritual systems stay excluded
check("1. verified core systems admitted", () => {
  const r = calculateCompatibility(
    known("Alice Example", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator") as any,
    known("Bob Example", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector") as any,
  );
  const used = usedKeys(r), excl = exclKeys(r);
  const pass = used.includes("astrology") && used.includes("numerology") && used.includes("humanDesign")
    && excl.includes("spiritual") && r.confidence?.label === "Partial";
  return { pass, detail: `score=${r.overallScore} used=[${used}] conf=${r.confidence?.label}` };
});

// 2. naked astrology and unverified HD are rejected, while canonical numerology survives
check("2. raw symbolic inputs excluded", () => {
  const r = calculateCompatibility(
    rawUnverified("Raw A", "1990-09-17") as any,
    rawUnverified("Raw B", "1991-04-23") as any,
  );
  const used = usedKeys(r), excl = exclKeys(r);
  const pass = !used.includes("astrology") && used.includes("numerology") && !used.includes("humanDesign")
    && excl.includes("astrology") && excl.includes("humanDesign") && r.confidence?.label === "Limited";
  return { pass, detail: `score=${r.overallScore} used=[${used}] excluded=[${excl}]` };
});

// 3. missing Moon/Rising do not inject neutral placeholder points
check("3. partial verified astrology re-normalizes", () => {
  const a = known("A", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator") as any;
  const b = known("B", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector") as any;
  delete a.verifiedAstrologyData.moon;
  delete a.verifiedAstrologyData.rising;
  delete a.verifiedAstrologyData.planets.moon;
  delete b.verifiedAstrologyData.moon;
  delete b.verifiedAstrologyData.rising;
  delete b.verifiedAstrologyData.planets.moon;
  const r = calculateCompatibility(a, b);
  const pass = usedKeys(r).includes("astrology")
    && r.categories.astrology.details.sunMoonHarmony.score === r.categories.astrology.details.elementCompatibility.score
    && r.categories.astrology.details.sunMoonHarmony.coverage === "Sun verified; Moon excluded";
  return { pass, detail: `astro=${r.categories.astrology.score} sun=${r.categories.astrology.details.elementCompatibility.score} moon=${r.categories.astrology.details.sunMoonHarmony.score}` };
});

// 4. missing name-derived numerology cannot become 0-vs-0 = 100
check("4. missing name numerology cannot inflate score", () => {
  const a = known("", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator") as any;
  const b = known("", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector") as any;
  const r = calculateCompatibility(a, b);
  const pass = r.categories.numerology.details.expressionHarmony.score === 0
    && r.categories.numerology.details.soulUrgeAlignment.score === 0
    && r.categories.numerology.score === r.categories.numerology.details.lifePathCompatibility.score;
  return { pass, detail: `num=${r.categories.numerology.score} expression=${r.categories.numerology.details.expressionHarmony.score}` };
});

// 5. personality changes coverage only when actually supplied
check("5. personality absent vs present", () => {
  const absent = calculateCompatibility(
    known("Alice Example", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator") as any,
    known("Bob Example", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector") as any,
  );
  const present = calculateCompatibility(
    known("Alice Example", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator", true) as any,
    known("Bob Example", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector", true) as any,
  );
  const pass = exclKeys(absent).includes("personality") && usedKeys(present).includes("personality")
    && present.confidence?.label === "High coverage";
  return { pass, detail: `absent=${absent.confidence?.label} present=${present.confidence?.label}` };
});

// 6. normalized weights sum to approximately 100
check("6. admitted weights normalize", () => {
  const r = calculateCompatibility(
    known("Alice Example", "Scorpio", "Leo", "Pisces", "1990-09-17", "Generator") as any,
    known("Bob Example", "Taurus", "Cancer", "Virgo", "1991-04-23", "Projector") as any,
  );
  const wsum = weightsSum(r);
  return { pass: wsum >= 99 && wsum <= 101, detail: `weightsSum=${wsum}%` };
});
console.log("\n=== Soul Codex compatibility smoke test ===");
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name.padEnd(42)} ${r.detail}`);
console.log(`\n${results.length - failed}/${results.length} passed${failed ? ` — ${failed} FAILED` : ""}\n`);
process.exit(failed ? 1 : 0);
