import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const core = readFileSync("packages/core/verified-synthesis.ts", "utf8");
const coreIndex = readFileSync("packages/core/index.ts", "utf8");
const client = readFileSync("client/src/lib/foundationOfflineCodex.ts", "utf8");
const reconciliation = readFileSync(
  "client/src/lib/profileVerificationReconciliation.ts",
  "utf8",
);

test("verified synthesis evidence contract is owned by core", () => {
  assert.match(core, /export type VerifiedAstrologyForSynthesis/);
  assert.match(core, /export type VerifiedPlacementForSynthesis/);
  assert.match(coreIndex, /verified-synthesis\.js/);
});

test("client synthesis consumes and re-exports the core contract without redefining it", () => {
  assert.match(
    client,
    /type VerifiedAstrologyForSynthesis[\s\S]*from "@soulcodex\/core"/,
  );
  assert.match(
    client,
    /export type \{ VerifiedAstrologyForSynthesis \} from "@soulcodex\/core"/,
  );
  assert.doesNotMatch(
    client,
    /export type VerifiedAstrologyForSynthesis\s*=/,
  );
});

test("profile reconciliation depends on the core evidence contract", () => {
  assert.match(
    reconciliation,
    /VerifiedAstrologyForSynthesis[\s\S]*from "@soulcodex\/core"/,
  );
  assert.doesNotMatch(
    reconciliation,
    /type VerifiedAstrologyForSynthesis[\s\S]*from "\.\/foundationOfflineCodex"/,
  );
});
