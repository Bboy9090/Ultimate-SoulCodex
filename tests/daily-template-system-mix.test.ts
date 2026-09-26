import assert from "node:assert/strict";
import test from "node:test";
import { moonSignReflection, personalDayReflection, selectTemplates } from "../packages/astrology/template-bank.ts";
import type { DailyContext } from "../packages/astrology/daily-context.ts";

const context: DailyContext = {
  date: "2026-09-26",
  personalDayNumber: 9,
  universalDayNumber: 9,
  moonSign: "Aries",
  moonPhase: "Full Moon",
  moonPhasePercentage: 100,
  currentHDGate: 18,
  currentHDLine: 3,
  planetaryHour: null,
};

test("daily guidance does not force Human Design into an unverified profile", () => {
  const result = selectTemplates(context, { id: "unverified-profile" });
  const categories = result.selectedTemplates.map((template) => template.category).sort();

  assert.deepEqual(categories, ["astrology", "numerology"]);
  assert.equal(result.selectedTemplates.length, 2);
  assert.equal(result.templateIds.some((id) => id.startsWith("hd-")), false);
});

test("daily guidance adds Human Design only when the personal HD core is verified", () => {
  const result = selectTemplates(context, {
    id: "verified-hd-profile",
    humanDesignData: {
      status: "verified",
      verificationReceiptId: "hd-receipt-1",
      independentSource: "independent-hd-verifier",
      verifiedAt: "2026-09-26T08:00:00.000Z",
    },
  });
  const categories = result.selectedTemplates.map((template) => template.category).sort();

  assert.deepEqual(categories, ["astrology", "humandesign", "numerology"]);
  assert.equal(result.selectedTemplates.length, 3);
});

test("daily guidance never emits disabled legacy symbolic categories", () => {
  const result = selectTemplates(context, {
    id: "legacy-heavy-profile",
    geneKeysData: { sequence: "legacy" },
    chakraData: { dominantChakra: "Crown" },
    vedicAstrologyData: { nakshatra: "legacy" },
    humanDesignData: { status: "calculated_unverified" },
  });

  for (const template of result.selectedTemplates) {
    assert.ok(["astrology", "numerology"].includes(template.category));
  }
});


test("daily reflection vocabulary stays semantically differentiated", () => {
  const personalDayThemes = new Set(
    [1,2,3,4,5,6,7,8,9,11,22,33].map((number) => {
      const reflection = personalDayReflection(number);
      assert.ok(reflection.theme.length > 8);
      assert.ok(reflection.action.length > 12);
      return `${reflection.theme}|${reflection.action}`;
    }),
  );
  assert.equal(personalDayThemes.size, 12);

  const moonPrompts = new Set(
    [
      "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
      "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
    ].map((sign) => moonSignReflection(sign)),
  );
  assert.equal(moonPrompts.size, 12);

  assert.notEqual(personalDayReflection(1).theme, personalDayReflection(9).theme);
  assert.notEqual(moonSignReflection("Aries"), moonSignReflection("Pisces"));
});

test("daily differentiated prompts remain non-predictive", () => {
  const rendered = [
    ...[1,2,3,4,5,6,7,8,9,11,22,33].flatMap((number) => {
      const reflection = personalDayReflection(number);
      return [reflection.theme, reflection.action];
    }),
    ...[
      "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
      "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
    ].map((sign) => moonSignReflection(sign)),
  ].join(" ");

  assert.doesNotMatch(
    rendered,
    /will happen|guaranteed|destined|fated|luck|you are|you always|you never|must happen/i,
  );
});
