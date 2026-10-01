import assert from "node:assert/strict";
import test from "node:test";
import { calculateCompatibility } from "../services/compatibility.ts";

const placementEvidence = {
  source: "independent ephemeris comparison",
  engine: "compatibility-boundary-test@1",
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

function verifiedProfile(
  name: string,
  birthDate: string,
  sun: string,
  moon: string,
  rising: string,
  hdType: "Generator" | "Projector",
) {
  return {
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
  } as any;
}

test("compatibility rejects naked astrology and unverified Human Design", () => {
  const a = {
    name: "A",
    birthDate: "1990-09-17",
    astrologyData: { sunSign: "Scorpio", moonSign: "Leo", risingSign: "Pisces" },
    humanDesignData: { type: "Generator", authority: "Sacral Authority" },
  } as any;
  const b = {
    name: "B",
    birthDate: "1991-04-23",
    astrologyData: { sunSign: "Taurus", moonSign: "Cancer", risingSign: "Virgo" },
    humanDesignData: { type: "Projector", authority: "Splenic Authority" },
  } as any;

  const result = calculateCompatibility(a, b);
  const used = result.systemsUsed.map((row: any) => row.system);

  assert.equal(used.includes("astrology"), false);
  assert.equal(used.includes("humanDesign"), false);
  assert.equal(used.includes("numerology"), true);
  assert.match(
    result.systemsExcluded.find((row: any) => row.system === "astrology")?.reason ?? "",
    /verified Sun placement/i,
  );
});

test("missing Moon and Rising do not inject placeholder points", () => {
  const a = verifiedProfile("A", "1990-09-17", "Scorpio", "Leo", "Pisces", "Generator");
  const b = verifiedProfile("B", "1991-04-23", "Taurus", "Cancer", "Virgo", "Projector");

  delete a.verifiedAstrologyData.moon;
  delete a.verifiedAstrologyData.rising;
  delete a.verifiedAstrologyData.planets.moon;
  delete b.verifiedAstrologyData.moon;
  delete b.verifiedAstrologyData.rising;
  delete b.verifiedAstrologyData.planets.moon;

  const result = calculateCompatibility(a, b);
  assert.equal(
    result.categories.astrology.details.sunMoonHarmony.score,
    result.categories.astrology.details.elementCompatibility.score,
  );
  assert.equal(
    result.categories.astrology.details.sunMoonHarmony.coverage,
    "Sun verified; Moon excluded",
  );
  assert.equal(
    result.categories.astrology.details.risingSignSynergy.coverage,
    "Rising excluded",
  );
});

test("missing names cannot become perfect zero-vs-zero numerology", () => {
  const a = verifiedProfile("", "1990-09-17", "Scorpio", "Leo", "Pisces", "Generator");
  const b = verifiedProfile("", "1991-04-23", "Taurus", "Cancer", "Virgo", "Projector");

  const result = calculateCompatibility(a, b);
  assert.equal(result.categories.numerology.details.expressionHarmony.score, 0);
  assert.equal(result.categories.numerology.details.soulUrgeAlignment.score, 0);
  assert.equal(
    result.categories.numerology.score,
    result.categories.numerology.details.lifePathCompatibility.score,
  );
});

test("advanced legacy systems do not influence the aggregate score", () => {
  const a = verifiedProfile("Alice Example", "1990-09-17", "Scorpio", "Leo", "Pisces", "Generator");
  const b = verifiedProfile("Bob Example", "1991-04-23", "Taurus", "Cancer", "Virgo", "Projector");
  (a as any).vedicAstrologyData = { vedicSun: "Virgo", vedicMoon: "Leo" };
  (b as any).vedicAstrologyData = { vedicSun: "Virgo", vedicMoon: "Leo" };

  const result = calculateCompatibility(a, b);
  assert.equal(result.systemsUsed.some((row: any) => row.system === "spiritual"), false);
  assert.match(
    result.systemsExcluded.find((row: any) => row.system === "spiritual")?.reason ?? "",
    /provenance contracts/i,
  );
  assert.equal(result.categories.spiritual.score, 0);
});
