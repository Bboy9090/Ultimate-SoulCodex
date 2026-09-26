import assert from "node:assert/strict";
import test from "node:test";
import { selectTemplates } from "../packages/astrology/template-bank.ts";
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
