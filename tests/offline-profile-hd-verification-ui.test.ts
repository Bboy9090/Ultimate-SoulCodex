import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("client/src/pages/offline-profile.tsx", "utf8");

test("offline profile renders Human Design only through the shared verification gate", () => {
  assert.match(
    source,
    /getVerifiedHumanDesignRecord\(humanDesign\)/,
  );
  assert.doesNotMatch(
    source,
    /humanDesign\.status\s*===\s*["']verified["']\s*\?\s*humanDesign/,
  );
  assert.match(source, /verifiedHumanDesign\s*&&\s*\(/);
  assert.match(source, /verifiedHumanDesign\s*&&\s*<HumanDesignBodygraph/);
});
