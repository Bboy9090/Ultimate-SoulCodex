import assert from "node:assert/strict";
import test from "node:test";
import { selectTemplates } from "../services/template-bank.ts";

const moonSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const phases = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

function contextFor(index: number) {
  const date = new Date(Date.UTC(2026, 0, 1 + index));
  return {
    date: date.toISOString().slice(0, 10),
    personalDayNumber: [1,2,3,4,5,6,7,8,9,11,22,33][index % 12],
    universalDayNumber: (index % 9) + 1,
    moonSign: moonSigns[index % moonSigns.length],
    moonPhase: phases[index % phases.length],
    moonPhasePercentage: (index * 11) % 101,
    currentHDGate: (index % 64) + 1,
    currentHDLine: (index % 6) + 1,
    planetaryHour: "Saturn",
  } as any;
}

test("daily guidance stays deterministic and meaningfully differentiated over 120 days", () => {
  const signatures = new Set<string>();
  const pairTransitions = new Set<string>();
  let previous = "";

  for (let index = 0; index < 120; index += 1) {
    const context = contextFor(index);
    const profile = { id: "corpus-alpha", hdVerified: false };
    const first = selectTemplates(context, profile, []);
    const repeat = selectTemplates(context, profile, []);

    assert.deepEqual(first.templateIds, repeat.templateIds);
    assert.equal(first.selectedTemplates.length, 4);
    assert.deepEqual(
      new Set(first.selectedTemplates.map((entry) => entry.category)),
      new Set(["numerology", "astrology"]),
    );

    const signature = first.templateIds.join("|");
    signatures.add(signature);
    if (previous) pairTransitions.add(previous + "->" + signature);
    previous = signature;
  }

  assert.ok(signatures.size >= 20, `expected at least 20 distinct daily signatures, saw ${signatures.size}`);
  assert.ok(pairTransitions.size >= 30, `expected broad day-to-day movement, saw ${pairTransitions.size} transitions`);
});

test("full profile id participates in deterministic selection", () => {
  const context = contextFor(42);
  const ids = [
    "alpha-profile",
    "another-profile",
    "amber-profile",
    "atlas-profile",
    "alpha-profile-2",
    "alpha-profile-3",
  ];
  const signatures = ids.map((id) =>
    selectTemplates(context, { id, hdVerified: false }, []).templateIds.join("|")
  );

  assert.ok(new Set(signatures).size >= 3, "profiles sharing an initial letter should not collapse to one selection");
});

test("verified Human Design changes eligible mix without opening legacy systems", () => {
  for (let index = 0; index < 60; index += 1) {
    const result = selectTemplates(contextFor(index), {
      id: `verified-hd-${index}`,
      hdVerified: true,
      hdType: "Reflector",
    }, []);

    assert.equal(result.selectedTemplates.length, 4);
    assert.equal(result.selectedTemplates.filter((entry) => entry.category === "humandesign").length, 1);
    assert.equal(
      result.selectedTemplates.every((entry) =>
        ["numerology", "astrology", "humandesign"].includes(entry.category)
      ),
      true,
    );
  }
});

test("recent-template avoidance changes presentation while preserving system policy", () => {
  const context = contextFor(9);
  const profile = { id: "history-sensitive", hdVerified: false };
  const first = selectTemplates(context, profile, []);
  const second = selectTemplates(context, profile, first.templateIds);

  assert.notDeepEqual(second.templateIds, first.templateIds);
  assert.deepEqual(
    new Set(second.selectedTemplates.map((entry) => entry.category)),
    new Set(["numerology", "astrology"]),
  );
});
