import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { synthesisModeForEvidenceState } from "../packages/core/placement/types.ts";
import { deriveConnectionSunSignFromBirthDate } from "../client/src/lib/connectionRepository.ts";

const rangeSource = fs.readFileSync("server/services/unknown-time-range.ts", "utf8");
const verificationRoute = fs.readFileSync("server/routes/profile-verification.ts", "utf8");
const ultimateSource = fs.readFileSync("client/src/lib/ultimateCodexSynthesis.ts", "utf8");
const legacyReading = fs.readFileSync("packages/core/soul-codex-reading-generator-v1.ts", "utf8");
const adr = fs.readFileSync("governance/ADRs/ADR-002-Uncertainty-Is-A-First-Class-State.md", "utf8");

test("permanent four-state synthesis policy is fail-closed", () => {
  assert.equal(synthesisModeForEvidenceState("verified"), "use");
  assert.equal(synthesisModeForEvidenceState("stable_across_range"), "use");
  assert.equal(synthesisModeForEvidenceState("conditional"), "branch_only");
  assert.equal(synthesisModeForEvidenceState("unavailable"), "exclude");
});

test("unknown-time astronomy and Human Design use full-day minute sweeps", () => {
  assert.match(rangeSource, /for \(let minute = 0; minute < 1440; minute \+= 1\)/);
  assert.match(rangeSource, /testedValues: values\.length/);
  assert.match(rangeSource, /values\.length !== 1440/);
  assert.match(rangeSource, /stable_across_range/);
  assert.match(rangeSource, /conditional/);
  assert.match(rangeSource, /Use the listed windows only as rectification branches, not certified chart data/);
  assert.match(rangeSource, /Only Human Design components stable across every possible birth minute/i);
});

test("unknown-time verification exposes the four states and unlock guidance", () => {
  for (const state of ["verified", "stable_across_range", "conditional", "unavailable"]) {
    assert.match(verificationRoute, new RegExp(`["']${state}["']`));
  }
  assert.match(verificationRoute, /conditional: "branch_only"/);
  assert.match(verificationRoute, /unavailable: "exclude"/);
  assert.match(verificationRoute, /Add an exact birth time/);
  assert.match(verificationRoute, /nearest known birth city or coordinates/);
  assert.doesNotMatch(verificationRoute, /default birthplace/i);
});

test("Ultimate Codex consumes range-stable evidence but excludes conditional values", () => {
  assert.match(ultimateSource, /getSynthesisPlacement/);
  assert.match(ultimateSource, /stableHdComponent/);
  assert.match(ultimateSource, /stable_across_range/);
  assert.match(ultimateSource, /unavailable or conditional/);
  assert.doesNotMatch(ultimateSource, /conditional.*identitySignature/i);
});

test("legacy reading modes cannot populate guessed chart or Human Design data", () => {
  assert.match(legacyReading, /Legacy estimated-window data is excluded from synthesis/);
  assert.match(legacyReading, /Date-only legacy input is not synthesis-eligible/);
  assert.match(legacyReading, /Legacy approximation excluded from synthesis/);
  assert.match(legacyReading, /humanDesign: undefined/);
});

test("date-only connection helpers withhold Sun certainty near ingress boundaries", () => {
  assert.equal(deriveConnectionSunSignFromBirthDate("1987-01-19"), undefined);
  assert.equal(deriveConnectionSunSignFromBirthDate("1990-09-17"), "Virgo");
});

test("governance permanently states scope-reduction instead of invented certainty", () => {
  assert.match(adr, /Unknown information never becomes invented certainty/);
  assert.match(adr, /Missing birth time reduces scope/);
  assert.match(adr, /Rectification is evidence gathering, not certification/);
  assert.match(adr, /conditional.*branch/i);
  assert.match(adr, /unavailable.*contributes nothing/i);
});
