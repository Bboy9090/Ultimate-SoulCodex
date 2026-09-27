import assert from "node:assert/strict";
import test from "node:test";
import { selectTemplates } from "../services/template-bank";
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
  planetaryHour: null,
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
    timezone: "America/New_York",
    ...overrides,
  } as any;
}

test("daily insight system eligibility", async (suite) => {
  await suite.test("automatic feed uses only governed calendar numerology and current-sky astrology", () => {
    const result = selectTemplates(dailyContext as any, profile(), []);
    assert.equal(result.selectedTemplates.length, 2);
    assert.deepEqual(
      new Set(result.selectedTemplates.map((template) => template.category)),
      new Set(["numerology", "astrology"]),
    );
    assert.equal(result.templateIds.some((id) => /hd-|chinese|vedic|genekeys|tarot|chakra|runes/i.test(id)), false);
  });

  await suite.test("caller-attested verified Human Design does not bypass package trust boundary", () => {
    const result = selectTemplates(dailyContext as any, profile({
      humanDesignData: {
        status: "verified",
        type: "Reflector",
        strategy: "Wait a lunar cycle",
        authority: "Lunar Authority",
        profile: "2/5",
        verificationReceiptId: "caller-made-up",
        independentSource: "caller-made-up",
        verifiedAt: "2026-09-26T18:00:00.000Z",
      },
    }), []);

    assert.equal(result.selectedTemplates.some((template) => template.category === "humandesign"), false);
    assert.equal(result.selectedTemplates.length, 2);
  });

  await suite.test("affirmations stay reflective and do not promote unrelated legacy systems", () => {
    const affirmations = generateDailyAffirmations(profile({
      astrologyData: { sunSign: "Scorpio" },
      humanDesignData: { status: "verified", type: "Reflector" },
    }), 6, "2026-09-26");

    const text = affirmations.map((item) => item.text).join(" ");
    assert.doesNotMatch(text, /Scorpio|Reflector|Horse|Vedic|Gene Key/i);
    assert.doesNotMatch(text, /universe conspires|divine timing|natural leader|spiritual messenger/i);
  });
});
