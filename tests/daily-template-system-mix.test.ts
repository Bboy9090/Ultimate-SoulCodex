import assert from "node:assert/strict";
import test from "node:test";
import { moonPhaseReflection, moonSignReflection, personalDayReflection, selectTemplates, universalDayReflection } from "../packages/astrology/template-bank.ts";
import type { DailyContext } from "../packages/astrology/daily-context.ts";
import { APPROVED_HUMAN_DESIGN_TRUST } from "../packages/core/human-design-trust.ts";

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

test("daily guidance adds Human Design only when the personal HD core passes canonical trust", () => {
  const result = selectTemplates(context, {
    id: "verified-hd-profile",
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      profile: "2/5",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      engine: APPROVED_HUMAN_DESIGN_TRUST.engine,
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
      independentSource: APPROVED_HUMAN_DESIGN_TRUST.independentSource,
      verifiedAt: APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
    },
  });
  const categories = result.selectedTemplates.map((template) => template.category).sort();

  assert.deepEqual(categories, ["astrology", "humandesign", "numerology"]);
  assert.equal(result.selectedTemplates.length, 3);
});

test("daily guidance rejects status-only or partial Human Design trust", () => {
  for (const humanDesignData of [
    { status: "verified" },
    {
      status: "verified",
      verificationReceiptId: APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
      independentSource: APPROVED_HUMAN_DESIGN_TRUST.independentSource,
      verifiedAt: APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
    },
    {
      status: "verified",
      type: "Reflector",
      profile: "2/5",
      strategy: "Wait a lunar cycle",
      authority: "Sacral Authority",
      engine: APPROVED_HUMAN_DESIGN_TRUST.engine,
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
      independentSource: APPROVED_HUMAN_DESIGN_TRUST.independentSource,
      verifiedAt: APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
    },
  ]) {
    const result = selectTemplates(context, {
      id: "spoofed-hd-profile",
      humanDesignData,
    });
    assert.equal(
      result.selectedTemplates.some((template) => template.category === "humandesign"),
      false,
      JSON.stringify(humanDesignData),
    );
  }
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

  const moonPhasePrompts = new Set(
    [
      "New Moon","Waxing Crescent","First Quarter","Waxing Gibbous",
      "Full Moon","Waning Gibbous","Last Quarter","Waning Crescent",
    ].map((phase) => moonPhaseReflection(phase)),
  );
  assert.equal(moonPhasePrompts.size, 8);

  const universalDayThemes = new Set(
    [1,2,3,4,5,6,7,8,9,11,22,33].map((number) => {
      const reflection = universalDayReflection(number);
      assert.ok(reflection.theme.length > 8);
      assert.ok(reflection.action.length > 20);
      return `${reflection.theme}|${reflection.action}`;
    }),
  );
  assert.equal(universalDayThemes.size, 12);

  assert.notEqual(personalDayReflection(1).theme, personalDayReflection(9).theme);
  assert.notEqual(moonSignReflection("Aries"), moonSignReflection("Pisces"));
  assert.notEqual(moonPhaseReflection("New Moon"), moonPhaseReflection("Full Moon"));
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
    ...[
      "New Moon","Waxing Crescent","First Quarter","Waxing Gibbous",
      "Full Moon","Waning Gibbous","Last Quarter","Waning Crescent",
    ].map((phase) => moonPhaseReflection(phase)),
    ...[1,2,3,4,5,6,7,8,9,11,22,33].flatMap((number) => {
      const reflection = universalDayReflection(number);
      return [reflection.theme, reflection.action];
    }),
  ].join(" ");

  assert.doesNotMatch(
    rendered,
    /will happen|guaranteed|destined|fated|luck|you are|you always|you never|must happen/i,
  );
});


test("active daily templates preserve context-specific substance", () => {
  const personalOne = personalDayReflection(1);
  const personalNine = personalDayReflection(9);
  const universalOne = universalDayReflection(1);
  const universalNine = universalDayReflection(9);

  assert.notEqual(personalOne.action, personalNine.action);
  assert.notEqual(universalOne.action, universalNine.action);
  assert.match(moonSignReflection("Virgo"), /practical detail|small correction/i);
  assert.match(moonSignReflection("Scorpio"), /honesty|depth|boundaries/i);
  assert.match(moonPhaseReflection("Full Moon"), /visible|evaluate|completion/i);
  assert.match(moonPhaseReflection("Waning Crescent"), /rest|closure|less stimulation/i);
});
