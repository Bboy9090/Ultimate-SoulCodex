/**
 * packages/core/soulcodex-v1/tests/canonical.test.ts
 *
 * Canonical tests — validate the core package path end-to-end.
 * Run: tsx packages/core/soulcodex-v1/tests/canonical.test.ts
 *
 * These supersede soulcodex/anti-generic/tests/anti-generic.test.ts.
 */

import { totalPenaltyScore, containsBannedPhrase } from "../content/banned-language";
import { scoreStatement, REJECT_THRESHOLD } from "../engine/distinctiveness";
import { pickContradiction } from "../content/contradictions";
import {
  getBehavioralStatements,
  checkNarrative,
  assertDistinctOutputs,
  runAntiGenericPass,
} from "../engine/generate";
import type { Statement } from "../content/statements/index";
import type { AntiGenericContext } from "../types";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[1] Banned-language filter (canonical content path)");
// ─────────────────────────────────────────────────────────────────────────────

assert(
  "Hard-reject phrase 'deeply intuitive' scores 1.0",
  totalPenaltyScore("She is deeply intuitive and wise.") >= 1,
);

assert(
  "Clean behavioral text scores 0",
  totalPenaltyScore("I go quiet when I am hurt rather than naming it.") === 0,
);

assert(
  "containsBannedPhrase returns correct phrase",
  containsBannedPhrase("I feel things deeply and connect through emotion.").matches.some(
    m => m.phrase === "feel things deeply"
  ),
);

assert(
  "Partial-penalty phrase 'intensely' has penalty < 1",
  (() => {
    const result = containsBannedPhrase("I work intensely.");
    const match = result.matches.find(m => m.phrase === "intensely");
    return match !== undefined && match.penalty < 1;
  })(),
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[2] Distinctiveness scoring (canonical engine path)");
// ─────────────────────────────────────────────────────────────────────────────

const bannedStatement: Statement = {
  id: "test-bad",
  text: "You are deeply intuitive and a natural leader.",
  section: "core_pattern",
  tags: ["precision"],
  distinctiveness_base: 0.8,
  generic_risk: 0.1,
  has_contradiction: false,
};

const goodStatement: Statement = {
  id: "test-good",
  text: "I delay action until I have mapped the failure modes. Speed feels like recklessness.",
  section: "core_pattern",
  tags: ["precision", "order"],
  behaviorBoosts: ["stressElement:earth", "decisionStyle:calm_logic"],
  distinctiveness_base: 0.85,
  generic_risk: 0.15,
  has_contradiction: false,
};

const themeTags = ["precision", "order", "truth", "craft"];

const badScore = scoreStatement(bannedStatement, themeTags, "earth", "calm_logic");
assert(
  "Banned statement is rejected",
  badScore.rejected === true,
  `reason: ${badScore.rejectedReason}, final: ${badScore.final.toFixed(3)}`,
);

const goodScore = scoreStatement(goodStatement, themeTags, "earth", "calm_logic");
assert(
  "Clean behavioral statement passes threshold",
  !goodScore.rejected && goodScore.final >= REJECT_THRESHOLD,
  `final: ${goodScore.final.toFixed(3)}`,
);

assert(
  "Behavioral boosts increase distinguishing_power",
  goodScore.distinguishing_power > 0,
  `distinguishing_power: ${goodScore.distinguishing_power.toFixed(3)}`,
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[3] Contradiction selection (canonical content path)");
// ─────────────────────────────────────────────────────────────────────────────

const pairFire  = pickContradiction(["intensity", "courage"], "fire",  "gut");
const pairEarth = pickContradiction(["precision", "order"],   "earth", "calm_logic");

assert(
  "Different behavioral inputs pick different contradictions",
  pairFire.id !== pairEarth.id,
  `fire→${pairFire.id}, earth→${pairEarth.id}`,
);

assert(
  "Contradiction has surface + hidden + cost",
  Boolean(pairFire.surface) && Boolean(pairFire.hidden) && Boolean(pairFire.cost),
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[4] Statement diversity — same Sun sign, different behavioral inputs");
// ─────────────────────────────────────────────────────────────────────────────

const ctxFireGut: AntiGenericContext = {
  themeTags: ["intensity", "precision", "courage"],
  stressElement: "fire",
  decisionStyle: "gut",
  socialEnergy: "extrovert",
};

const ctxEarthSleep: AntiGenericContext = {
  themeTags: ["precision", "order", "craft"],
  stressElement: "earth",
  decisionStyle: "sleep_on_it",
  socialEnergy: "introvert",
};

const stmtsA = getBehavioralStatements("pressure_pattern", ctxFireGut,   2);
const stmtsB = getBehavioralStatements("pressure_pattern", ctxEarthSleep, 2);

assert(
  "Different contexts produce different statements",
  assertDistinctOutputs(ctxFireGut, ctxEarthSleep, "pressure_pattern"),
  `A: ${stmtsA[0]?.slice(0, 50)} | B: ${stmtsB[0]?.slice(0, 50)}`,
);

assert("fire+gut context returns statements",   stmtsA.length > 0, `got ${stmtsA.length}`);
assert("earth+sleep context returns statements", stmtsB.length > 0, `got ${stmtsB.length}`);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[5] runAntiGenericPass — convenience wrapper");
// ─────────────────────────────────────────────────────────────────────────────

const pass = runAntiGenericPass(ctxFireGut);
assert(
  "runAntiGenericPass returns contradictionHint (non-empty string)",
  typeof pass.contradictionHint === "string" && pass.contradictionHint.length > 20,
  `length: ${pass.contradictionHint.length}`,
);
assert(
  "runAntiGenericPass returns behavioralStatements (array)",
  Array.isArray(pass.behavioralStatements),
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[6] checkNarrative — post-generation banned-phrase audit");
// ─────────────────────────────────────────────────────────────────────────────

const cleanNarrative = `
I move in short intense bursts and then go dark.
Under pressure I accelerate instead of pausing.
I make more decisions to feel less helpless when the outcome is uncertain.
`;

const dirtyNarrative = `
You are deeply intuitive and have a rich inner life.
Your cosmic signature is aligned with your purpose.
Your healing journey calls you to embrace your truth.
`;

const cleanResult = checkNarrative(cleanNarrative);
assert(
  "Clean narrative passes audit",
  cleanResult.pass,
  `hardRejects: ${cleanResult.hardRejects.join(", ")}`,
);

const dirtyResult = checkNarrative(dirtyNarrative);
assert(
  "Dirty narrative fails audit",
  !dirtyResult.pass && dirtyResult.hardRejects.length > 0,
  `caught: ${dirtyResult.hardRejects.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
