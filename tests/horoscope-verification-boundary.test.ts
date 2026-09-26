import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { calculateCurrentPlanets, calculatePersonalTransitsFromProfile, generateDailyHoroscope } from "../packages/astrology/horoscope";

test("daily horoscope personal transits require verified natal geometry", () => {
  const rawLegacyProfile = {
    astrologyData: {
      sunSign: "Virgo",
      moonSign: "Scorpio",
      planets: {
        sun: { sign: "Virgo", longitude: 174 },
      },
    },
  };

  assert.deepEqual(
    calculatePersonalTransitsFromProfile(rawLegacyProfile, new Date("2026-09-25T12:00:00Z")),
    [],
  );
});

test("daily horoscope may calculate personal transits from verified natal placements", () => {
  const profile = {
    astrologyData: {
      planets: {
        sun: {
          sign: "Virgo",
          longitude: 174,
          verificationStatus: "verified",
          evidence: {
            source: "independent reference",
            engine: "verified-test-engine",
            calculatedAt: "2026-09-25T12:00:00.000Z",
          },
        },
      },
    },
  };

  const transits = calculatePersonalTransitsFromProfile(
    profile,
    new Date("2026-09-25T12:00:00Z"),
  );
  assert.ok(Array.isArray(transits));
});


test("daily horoscope AI prompt cannot consume natal Sun/Moon through a weaker local verifier", () => {
  const source = readFileSync("packages/astrology/horoscope.ts", "utf8");

  assert.doesNotMatch(source, /function verifiedNatalSign/);
  assert.doesNotMatch(source, /Verified natal Sun:/);
  assert.doesNotMatch(source, /Verified natal Moon:/);
  assert.match(source, /Natal Sun\/Moon are not supplied here; do not infer them/);
  assert.match(source, /Verified-natal personal transits:/);
});


test("daily horoscope fallback language stays reflective rather than predictive", () => {
  const source = readFileSync("packages/astrology/horoscope.ts", "utf8");

  assert.doesNotMatch(source, /genuinely good day for connection/i);
  assert.doesNotMatch(source, /hear surprising news/i);
  assert.doesNotMatch(source, /things in this area come easier today/i);
  assert.doesNotMatch(source, /heightened intuition/i);
  assert.doesNotMatch(source, /practical effort pays off/i);
  assert.match(source, /reflection prompt/i);
  assert.match(source, /without assuming an event will occur/i);
});

test("daily horoscope rejects an explicit invalid timezone instead of silently using UTC", async () => {
  await assert.rejects(
    () => generateDailyHoroscope({
      id: "invalid-zone",
      birthDate: "1990-09-17",
      timezone: "Mars/Olympus_Mons",
    }),
    /Invalid horoscope timezone/,
  );
});

test("daily horoscope cache requires a stable profile id", () => {
  const source = readFileSync("packages/astrology/horoscope.ts", "utf8");

  assert.match(source, /const cacheKey = stableProfileId\s*\?/);
  assert.match(source, /if \(cacheKey\) \{\s*const cached = horoscopeCache\.get\(cacheKey\)/);
  assert.match(source, /if \(cacheKey\) \{\s*horoscopeCache\.set\(cacheKey, result\)/);
  assert.doesNotMatch(source, /profile\.id\}\+\$\{dateKey/);
});


test("daily horoscope current-sky calculation requires a valid date and complete ten-body payload", () => {
  assert.throws(
    () => calculateCurrentPlanets(new Date("not-a-date")),
    /Horoscope sky date must be valid/,
  );

  const planets = calculateCurrentPlanets(new Date("2026-09-25T12:00:00Z"));
  assert.equal(planets.length, 10);
  assert.deepEqual(
    planets.map((planet) => planet.name),
    ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"],
  );
  for (const planet of planets) {
    assert.equal(Number.isFinite(planet.longitude), true);
    assert.equal(Number.isFinite(planet.degree), true);
  }
});


test("daily horoscope AI prompt treats symbolic sky and numerology as observation experiments", () => {
  const source = readFileSync("packages/astrology/horoscope.ts", "utf8");

  assert.match(source, /Do not claim it is already happening/);
  assert.match(source, /reflection lens/);
  assert.match(source, /not validated predictors of behavior or guaranteed events/);
  assert.match(source, /do not prove what I will do, feel, encounter, or become/);
  assert.doesNotMatch(source, /What I might notice today — specific and behavioral/);
});
