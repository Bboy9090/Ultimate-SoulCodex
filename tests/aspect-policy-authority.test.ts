import assert from "node:assert/strict";
import test from "node:test";
import {
  MAJOR_ASPECT_POLICY_ID,
  MAJOR_ASPECT_POLICY_V1,
  isGovernedMajorAspect,
  majorAspectPolicyEntry,
} from "@soulcodex/core";
import { LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1 } from "../server/services/aspect-engine";

test("major aspect policy has one canonical core authority", () => {
  assert.equal(MAJOR_ASPECT_POLICY_ID, "ASTRO-ASPECT-MAJOR-v1");
  assert.equal(
    LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1,
    MAJOR_ASPECT_POLICY_V1,
  );
  assert.deepEqual(
    MAJOR_ASPECT_POLICY_V1.entries.map((entry) => [
      entry.kind,
      entry.angleDegrees,
      entry.maximumOrbDegrees,
    ]),
    [
      ["conjunction", 0, 10],
      ["sextile", 60, 6],
      ["square", 90, 8],
      ["trine", 120, 8],
      ["opposition", 180, 10],
    ],
  );
});

test("governed aspect validation enforces names and maximum orbs", () => {
  for (const entry of MAJOR_ASPECT_POLICY_V1.entries) {
    assert.equal(isGovernedMajorAspect(entry.kind, 0), true);
    assert.equal(
      isGovernedMajorAspect(entry.kind, entry.maximumOrbDegrees),
      true,
    );
    assert.equal(
      isGovernedMajorAspect(entry.kind, entry.maximumOrbDegrees + 0.001),
      false,
    );
    assert.equal(majorAspectPolicyEntry(entry.kind)?.kind, entry.kind);
  }

  assert.equal(isGovernedMajorAspect("banana", 1), false);
  assert.equal(isGovernedMajorAspect("square", -0.001), false);
  assert.equal(isGovernedMajorAspect("square", Number.NaN), false);
  assert.equal(isGovernedMajorAspect("", 1), false);
});
