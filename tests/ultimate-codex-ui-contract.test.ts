import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const offline = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
const natal = readFileSync("client/src/components/VerifiedNatalChart.tsx", "utf8");
const bodygraph = readFileSync("client/src/components/HumanDesignBodygraph.tsx", "utf8");
const panel = readFileSync("client/src/components/UltimateCodexPanel.tsx", "utf8");

test("Identity wires the full governed chart surfaces", () => {
  assert.match(offline, /VerifiedNatalChart/);
  assert.match(offline, /HumanDesignBodygraph/);
  assert.match(offline, /UltimateCodexPanel/);
  assert.match(offline, /buildUltimateCodexSynthesis/);
});

test("natal chart exposes planets houses degrees cusps and aspects without sample geometry", () => {
  assert.match(natal, /verified longitudes/i);
  assert.match(natal, /All 12 verified house cusps/);
  assert.match(natal, /verified major aspect/);
  assert.match(natal, /degree unavailable/);
  assert.doesNotMatch(natal, /sample planet|random aspect/i);
});

test("Human Design chart exposes verified centers channels gates and activations", () => {
  assert.match(bodygraph, /Verified Human Design bodygraph/);
  assert.match(bodygraph, /Defined channels/);
  assert.match(bodygraph, /Activated gates/);
  assert.match(bodygraph, /Conscious and unconscious activations/);
  assert.match(bodygraph, /Variables and Incarnation Cross naming remain outside the verified core/);
});

test("combined Codex explains resonance tension coping stelliums and unresolved evidence", () => {
  assert.match(panel, /What works together/);
  assert.match(panel, /What works against or pulls differently/);
  assert.match(panel, /How to cope when the systems pull in different directions/);
  assert.match(panel, /Stellium \/ concentration ledger/);
  assert.match(panel, /Unresolved ledger/);
  assert.match(panel, /not scientific measurements of a soul/i);
});
