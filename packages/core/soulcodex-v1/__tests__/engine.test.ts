import { test } from "node:test";
import assert from "node:assert/strict";

import { loadEngineLibraries } from "../engine/loaders.js";
import { applyContradictionRules } from "../engine/contradictions.js";
import { selectStatements } from "../engine/statementSelector.js";
import { runSoulCodexEngine } from "../engine/index.js";
import { generateSoulCodexOutputV1 } from "../generate.js";
import { soulCodexOutputV1Schema } from "../schema.js";

import fixture from "./fixture.bobby.json";

test("fixture generates valid SoulCodexOutputV1", () => {
  const out = generateSoulCodexOutputV1({
    profile: fixture as any,
    profileId: "fixture-bobby",
    toneMode: "clean",
  });

  assert.equal(out.profile_id, "fixture-bobby");
  soulCodexOutputV1Schema.parse(out);
});

test("contradiction filtering blocks expected trait keys", () => {
  const libs = loadEngineLibraries();
  const sample = [
    { trait_key: "decision_fast", value: 5, confidence: "medium", sources: ["human_design"] as const },
    { trait_key: "decision_wait", value: 5, confidence: "medium", sources: ["astrology"] as const },
  ];
  const filtered = applyContradictionRules(sample as any, libs.contradictionRules);
  assert.equal(filtered.some((s) => s.trait_key === "decision_fast"), false);
});

test("tone fallback prefers requested tone, else clean", () => {
  const libs = loadEngineLibraries();
  const out = selectStatements({
    toneMode: "deep",
    activeSources: ["astrology"],
    traitSignals: [],
    statements: libs.statements.how_you_work,
    bannedPhrases: [],
    max: 2,
    minConfidence: "medium",
  });
  assert.ok(out.length > 0);
  // If no deep statement exists, selector still returns clean (not empty).
  assert.ok(out.every((s) => s.tone === "deep" || s.tone === "clean"));
});

test("banned language rejection removes matching statements", () => {
  const libs = loadEngineLibraries();
  const pool = [
    { id: "ok", category: "x", tone: "clean", confidence: "high", text: "Clean sentence.", source_support: [], tags: [] },
    {
      id: "bad",
      category: "x",
      tone: "clean",
      confidence: "high",
      text: "This contains destiny and should be rejected.",
      source_support: [],
      tags: [],
    },
  ];
  const out = selectStatements({
    toneMode: "clean",
    activeSources: [],
    traitSignals: [],
    statements: pool as any,
    bannedPhrases: libs.bannedLanguage.phrases,
    max: 10,
  });
  assert.deepEqual(out.map((s) => s.id), ["ok"]);
});

test("section mapping correctness: engine produces all section keys", () => {
  const eng = runSoulCodexEngine({
    toneMode: "clean",
    astrology: fixture.astrologyData as any,
    human_design: fixture.humanDesignData as any,
    numerology: fixture.numerologyData as any,
  });

  const expectedKeys = [
    "core_identity",
    "how_you_work",
    "decision_code",
    "relational_pattern",
    "failure_conditions",
    "optimal_conditions",
    "distortion_mode",
    "power_mode",
    "mission_arc",
  ];
  for (const k of expectedKeys) {
    assert.ok(Array.isArray((eng.statements_by_section as any)[k]), `missing section ${k}`);
  }
});

test("mirror answers produce mirror-driven trait signals", () => {
  const eng = runSoulCodexEngine({
    toneMode: "clean",
    astrology: fixture.astrologyData as any,
    human_design: fixture.humanDesignData as any,
    numerology: fixture.numerologyData as any,
    mirror: {
      reaction: ["fix", "analyze"],
      betrayal: ["dishonesty"],
      drain: ["chaos", "lies"],
      freedomBuild: ["system", "sanctuary"],
    },
  });

  // We don't assert exact ordering; just that the mirror layer emitted key traits.
  const keys = new Set(eng.trait_signals.map((t: any) => t.trait_key));
  assert.ok(keys.has("work_structure"), "expected mirror to emit work_structure");
  assert.ok(keys.has("decision_fast") || keys.has("decision_wait"), "expected mirror to emit a decision trait");
  assert.ok(keys.has("stress_truth_violation"), "expected mirror to emit stress_truth_violation");
});

