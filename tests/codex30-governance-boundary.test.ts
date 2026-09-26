import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { astrologySignals } from "../packages/core/codex30/systems/astrology";
import { aspectSignals } from "../packages/core/codex30/systems/aspects";
import { humanDesignSignals } from "../packages/core/codex30/systems/humanDesign";
import {
  collectSignals,
  collectSupportingSignals,
} from "../packages/core/codex30/registry";
import {
  compileBulletLists,
  pickCodename,
} from "../packages/core/codex30/synth/compile";

test("Codex30 astrology requires verified, recognized zodiac evidence", () => {
  const chart = {
    planets: {
      sun: { sign: "Virgo" },
      moon: { sign: "Pisces" },
      rising: { sign: "Scorpio" },
    },
  };

  assert.deepEqual(astrologySignals(chart, false), []);

  const verified = astrologySignals(chart, true);
  assert.equal(verified.length, 3);
  assert.ok(verified.every((signal) => signal.confidence === "high"));
  assert.ok(verified.every((signal) => /verified|astronomical|symbolic/i.test(signal.label)));

  assert.deepEqual(
    astrologySignals({ planets: { sun: { sign: "Ophiuchus" } } }, true),
    [],
  );
});

test("Codex30 aspects never fabricate missing or unsupported geometry", () => {
  assert.deepEqual(
    aspectSignals(
      { aspects: [{ planet1: "Sun", planet2: "Moon", aspect: "trine" }] },
      true,
    ),
    [],
    "missing orb must stay unresolved rather than defaulting to 1 degree",
  );

  assert.deepEqual(
    aspectSignals(
      {
        aspects: [
          { planet1: "Sun", planet2: "Moon", aspect: "quincunx", orb: 1.2 },
        ],
      },
      true,
    ),
    [],
    "non-governed aspect types must not enter the major-aspect signal set",
  );

  assert.deepEqual(
    aspectSignals(
      {
        aspects: [
          { planet1: "Sun", planet2: "Moon", aspect: "trine", orb: 1.2 },
        ],
      },
      false,
    ),
    [],
    "unverified aspect geometry must not influence Codex30",
  );

  const valid = aspectSignals(
    {
      aspects: [
        { planet1: "Sun", planet2: "Moon", aspect: "trine", orb: 1.2 },
      ],
    },
    true,
  );
  assert.equal(valid.length, 1);
  assert.match(valid[0]?.label ?? "", /verified aspect geometry/i);
});

test("Codex30 Human Design requires the complete verified core contract", () => {
  const base = {
    type: "Reflector",
    status: "verified",
    verificationReceiptId: "receipt-1",
    independentSource: "independent-verifier",
    verifiedAt: "2026-09-26T12:00:00.000Z",
  };

  assert.equal(humanDesignSignals(base).length, 1);
  assert.equal(
    humanDesignSignals({ ...base, verificationReceiptId: undefined }).length,
    0,
  );
  assert.equal(
    humanDesignSignals({ ...base, verifiedAt: "not-a-date" }).length,
    0,
  );
  assert.equal(
    humanDesignSignals({ ...base, type: "Unknown Aura Type" }).length,
    0,
  );
});

test("Codex30 stable collector excludes user-assessed moral and legacy element signals", () => {
  const input = {
    profile: {
      signals: { lifePath: 9 },
    },
    userInputs: {
      stressElement: "fire",
      decisionStyle: "analysis",
      pressureStyle: "step_in",
      nonNegotiables: ["no lies"],
    },
  };

  const stable = collectSignals(input as any);
  assert.ok(stable.some((signal) => signal.system === "numerology"));
  assert.equal(
    stable.some(
      (signal) =>
        signal.system === "moralCompass" || signal.system === "elements",
    ),
    false,
  );

  const supporting = collectSupportingSignals(input as any);
  assert.ok(supporting.length > 0);
  assert.ok(supporting.every((signal) => signal.system === "moralCompass"));
});

test("package and legacy Codex30 registries preserve the same separation doctrine", () => {
  const packageRegistry = readFileSync(
    "packages/core/codex30/registry.ts",
    "utf8",
  );
  const legacyRegistry = readFileSync("soulcodex/codex30/registry.ts", "utf8");

  for (const source of [packageRegistry, legacyRegistry]) {
    assert.match(source, /collectSupportingSignals/);
    assert.doesNotMatch(source, /\.\.\.elementSignals\(/);
    assert.doesNotMatch(
      source.match(/export function collectSignals[\s\S]*?return Array\.from\(map\.values\(\)\);\n}/)?.[0] ?? "",
      /moralCompassSignals/,
    );
  }
});


test("Codex30 compiler keeps behavioral guidance reflective and no-fallback", () => {
  assert.equal(pickCodename([]), "Synthesis Pending");

  const themes = [
    { tag: "precision", score: 90, sources: ["test"] },
    { tag: "privacy", score: 80, sources: ["test"] },
  ];
  const compiled = compileBulletLists([], themes as any);
  const rendered = [
    ...compiled.triggers,
    ...compiled.prescriptions,
  ].join(" ");

  assert.match(rendered, /Reflection prompt|Experiment:/);
  assert.doesNotMatch(
    rendered,
    /your nervous system|you are|you always|you never|destined|guaranteed|this drains you/i,
  );
});

test("Codex30 unknown theme names do not fall back to a fabricated legacy archetype", () => {
  const codename = pickCodename([
    { tag: "unmapped_theme", score: 100, sources: ["test"] },
  ] as any);

  assert.match(codename, /Symbolic unmapped theme/i);
  assert.doesNotMatch(codename, /Quiet Storm Architect|legacy|craft/i);
});


test("generic profile badges cannot authorize arbitrary chart data", () => {
  const forged = collectSignals({
    profile: {
      meta: { confidence: { badge: "verified" } },
      signals: { lifePath: 9 },
    },
    fullChart: {
      planets: {
        sun: { sign: "Virgo" },
        moon: { sign: "Pisces" },
      },
      aspects: [
        { planet1: "Sun", planet2: "Moon", aspect: "trine", orb: 1.2 },
      ],
    },
    userInputs: {},
  } as any);

  assert.equal(
    forged.some((signal) => signal.system === "astrology" || signal.system === "aspects"),
    false,
  );
  assert.ok(forged.some((signal) => signal.system === "numerology"));

  const verifiedChart = collectSignals({
    profile: { signals: { lifePath: 9 } },
    fullChart: {
      verification: { complete: true },
      planets: {
        sun: { sign: "Virgo", verificationStatus: "verified" },
        moon: { sign: "Pisces", verificationStatus: "verified" },
        rising: { sign: "Scorpio", verificationStatus: "verified" },
      },
      aspects: [
        { planet1: "Sun", planet2: "Moon", aspect: "trine", orb: 1.2 },
      ],
    },
    userInputs: {},
  } as any);

  assert.ok(verifiedChart.some((signal) => signal.system === "astrology"));
  assert.ok(verifiedChart.some((signal) => signal.system === "aspects"));
});


test("legacy elemental inference remains unavailable", () => {
  for (const stressElement of ["fire", "water", "earth", "air", "metal"]) {
    assert.deepEqual(elementSignals({ stressElement }), []);
  }
});

test("Moral Compass remains explicit self-reported supporting context", () => {
  const signals = moralCompassSignals({
    decisionStyle: "analysis",
    pressureStyle: "step_in",
    nonNegotiables: ["no lies"],
  });

  assert.ok(signals.length >= 2);
  assert.ok(
    signals.every((signal) =>
      signal.label.startsWith("Self-reported reflection:"),
    ),
  );
  assert.ok(signals.every((signal) => signal.confidence === "medium"));
});
