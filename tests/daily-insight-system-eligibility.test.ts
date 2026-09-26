import assert from "node:assert/strict";
import test from "node:test";
import { selectTemplates } from "../services/template-bank";
import { extractDailyProfileSummary } from "../services/daily-insights";
import { generateDailyAffirmations } from "../services/affirmations";

const dailyContext = {
  date: "2026-09-26",
  personalDayNumber: 4,
  universalDayNumber: 9,
  moonSign: "Aries",
  moonPhase: "Full Moon",
  moonPhasePercentage: 99,
  currentHDGate: 18,
  currentHDLine: 3,
  planetaryHour: "Saturn",
};

const evidence = {
  source: "independent ephemeris comparison",
  engine: "test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

function profile(overrides: Record<string, unknown> = {}) {
  return {
    id: "daily-policy-profile",
    name: "Daily Policy",
    birthDate: "1990-09-17",
    astrologyData: {},
    numerologyData: { lifePath: 9 },
    humanDesignData: { status: "calculated_unverified", type: "Manifestor" },
    personalityData: { enneagram: { type: 5 } },
    chineseAstrologyData: { yearAnimal: "Horse" },
    vedicAstrologyData: { sunSign: "Leo" },
    geneKeysData: { lifeWork: { gift: "Insight" } },
    ...overrides,
  } as any;
}

test("daily insight system eligibility", async (suite) => {
  await suite.test("automatic feed uses only governed daily numerology and current-sky astrology by default", () => {
    const summary = extractDailyProfileSummary(profile());
    const result = selectTemplates(dailyContext as any, summary, []);

    assert.equal(result.selectedTemplates.length, 4);
    assert.deepEqual(
      new Set(result.selectedTemplates.map((template) => template.category)),
      new Set(["numerology", "astrology"]),
    );
    assert.equal(result.templateIds.some((id) => /chinese|vedic|genekeys|tarot|chakra|runes/i.test(id)), false);
  });

  await suite.test("unverified natal aliases and Human Design do not enter the daily identity summary", () => {
    const summary = extractDailyProfileSummary(profile({
      astrologyData: {
        sunSign: "Virgo",
        moonSign: "Pisces",
        sun: { sign: "Virgo", verificationStatus: "calculated" },
        moon: { sign: "Pisces", verificationStatus: "pending_independent_verification" },
      },
      humanDesignData: {
        status: "calculated_unverified",
        type: "Projector",
        authority: "Splenic Authority",
      },
    }));

    assert.equal(summary.sunSign, undefined);
    assert.equal(summary.moonSign, undefined);
    assert.equal(summary.hdVerified, false);
    assert.equal(summary.hdType, undefined);
  });

  await suite.test("verified Human Design earns one daily slot but never opens legacy categories", () => {
    const summary = extractDailyProfileSummary(profile({
      humanDesignData: {
        status: "verified",
        type: "Reflector",
        profile: "2/5",
        authority: "Lunar Authority",
      },
    }));
    const result = selectTemplates(dailyContext as any, summary, []);

    assert.equal(result.selectedTemplates.length, 4);
    assert.equal(result.selectedTemplates.filter((template) => template.category === "humandesign").length, 1);
    assert.equal(
      result.selectedTemplates.every((template) =>
        ["numerology", "astrology", "humandesign"].includes(template.category)
      ),
      true,
    );
  });

  await suite.test("verified natal Sun can enter the summary only with provenance", () => {
    const summary = extractDailyProfileSummary(profile({
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified",
          evidence,
          internalCandidate: { longitude: 174.2 },
        },
      },
    }));

    assert.equal(summary.sunSign, "Virgo");
  });

  await suite.test("affirmations do not promote unverified astrology, HD, or legacy systems", () => {
    const affirmations = generateDailyAffirmations(profile({
      astrologyData: { sunSign: "Scorpio" },
      humanDesignData: { status: "calculated_unverified", type: "Manifestor" },
    }), 6, "2026-09-26");

    const text = affirmations.map((item) => item.text).join(" ");
    assert.doesNotMatch(text, /Scorpio|Manifestor|Horse|Vedic|Gene Key/i);
    assert.doesNotMatch(text, /universe conspires|divine timing|natural leader|spiritual messenger/i);
    assert.match(text, /Life Path 9|clearest evidence|concrete action|change my mind/i);
  });
});
