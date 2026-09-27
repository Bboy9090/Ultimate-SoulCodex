import assert from "node:assert/strict";
import test from "node:test";
import { selectTemplates } from "../packages/astrology/template-bank.ts";

const moonSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function contextFor(index: number) {
  const date = new Date(Date.UTC(2026, 0, 1 + index));
  const dateISO = date.toISOString().slice(0, 10);
  return {
    date: dateISO,
    personalDayNumber: [1,2,3,4,5,6,7,8,9,11,22,33][index % 12],
    universalDayNumber: (index % 9) + 1,
    moonSign: moonSigns[index % moonSigns.length],
    moonPhase: ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"][index % 8],
    moonPhasePercentage: (index * 7) % 101,
    currentHDGate: (index % 64) + 1,
    currentHDLine: (index % 6) + 1,
    planetaryHour: null,
  };
}

test("daily selector stays deterministic while differentiating across a 60-day corpus", () => {
  const signatures = new Set<string>();
  const templateIds = new Set<string>();

  for (let index = 0; index < 60; index += 1) {
    const context = contextFor(index);
    const first = selectTemplates(context as any, { id: "corpus-a" }, []);
    const repeat = selectTemplates(context as any, { id: "corpus-a" }, []);

    assert.deepEqual(first.templateIds, repeat.templateIds);
    assert.equal(first.selectedTemplates.length, 2);
    assert.deepEqual(
      new Set(first.selectedTemplates.map((entry) => entry.category)),
      new Set(["numerology", "astrology"]),
    );

    signatures.add(first.templateIds.join("|"));
    first.templateIds.forEach((id) => templateIds.add(id));
  }

  assert.ok(signatures.size >= 8, `expected daily differentiation, saw only ${signatures.size} signatures`);
  assert.ok(templateIds.size >= 8, `expected broad template usage, saw only ${templateIds.size} templates`);
});

test("daily selector does not admit HD or legacy systems through caller-attested profile fields", () => {
  const spoofedProfile = {
    id: "spoofed-hd",
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      verificationReceiptId: "caller-made-up",
      independentSource: "caller-made-up",
      verifiedAt: "2026-09-26T00:00:00.000Z",
    },
    chineseAstrologyData: { yearAnimal: "Horse" },
    geneKeysData: { lifeWork: { gift: "Insight" } },
    tarotData: { card: "The Hermit" },
  };

  for (let index = 0; index < 30; index += 1) {
    const result = selectTemplates(contextFor(index) as any, spoofedProfile, []);
    assert.equal(
      result.selectedTemplates.every((entry) =>
        entry.category === "numerology" || entry.category === "astrology"
      ),
      true,
    );
    assert.equal(result.templateIds.some((id) => /^hd-|chinese|gene|tarot|rune|chakra/i.test(id)), false);
  }
});

test("profile seed contributes variation without changing system eligibility", () => {
  let differences = 0;

  for (let index = 0; index < 30; index += 1) {
    const context = contextFor(index);
    const a = selectTemplates(context as any, { id: "profile-alpha" }, []);
    const b = selectTemplates(context as any, { id: "profile-beta" }, []);
    if (a.templateIds.join("|") !== b.templateIds.join("|")) differences += 1;

    for (const result of [a, b]) {
      assert.equal(result.selectedTemplates.length, 2);
      assert.deepEqual(
        new Set(result.selectedTemplates.map((entry) => entry.category)),
        new Set(["numerology", "astrology"]),
      );
    }
  }

  assert.ok(differences > 0, "profile seed should produce at least some presentation variation");
});
