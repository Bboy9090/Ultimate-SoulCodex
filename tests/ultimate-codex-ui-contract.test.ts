import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const offline = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
const natal = readFileSync("client/src/components/VerifiedNatalChart.tsx", "utf8");
const bodygraph = readFileSync("client/src/components/HumanDesignBodygraph.tsx", "utf8");
const panel = readFileSync("client/src/components/UltimateCodexPanel.tsx", "utf8");
const systems = readFileSync("client/src/pages/SystemsDetailsPage.tsx", "utf8");

test("Identity keeps governed charts visible while technical fusion moves to Systems", () => {
  assert.match(offline, /VerifiedNatalChart/);
  assert.match(offline, /HumanDesignBodygraph/);
  assert.doesNotMatch(offline, /<UltimateCodexPanel/);
  assert.match(offline, /View underlying systems/);
  assert.match(offline, /buildUltimateCodexSynthesis/);
  assert.match(systems, /<UltimateCodexPanel synthesis={ultimateCodex}/);
  assert.match(systems, /See the underlying systems/);
});

test("natal chart exposes planets houses degrees cusps and aspects without sample geometry", () => {
  assert.match(natal, /verified longitudes/i);
  assert.match(natal, /All 12 verified house cusps/);
  assert.match(natal, /sign-on-house meanings/);
  assert.match(natal, /A cusp sign describes the symbolic style of a house/);
  assert.match(natal, /verified major aspect/);
  assert.match(natal, /degree unavailable/);
  assert.match(natal, /Explore your chart/);
  assert.match(natal, /<AureonAvatar \/>/);
  assert.match(natal, /Planet · what/);
  assert.match(natal, /Sign · how/);
  assert.match(natal, /House · where/);
  assert.match(natal, /data-testid="interactive-chart-guide"/);
  assert.match(natal, /Tap a planet/);
  assert.match(natal, /Tap a house number/);
  assert.match(natal, /Tap an aspect line/);
  assert.match(natal, /Angles, Nodes &amp; Chiron/);
  assert.match(natal, /Watch point/);
  assert.match(natal, /Try this:/);
  assert.doesNotMatch(natal, /<summary[^>]*>\s*Placement meanings · planet \+ sign \+ house/);
  assert.doesNotMatch(natal, /sample planet|random aspect/i);
});

test("Human Design chart exposes verified centers channels gates and activations", () => {
  assert.match(bodygraph, /Verified Human Design bodygraph/);
  assert.match(bodygraph, /Defined channels/);
  assert.match(bodygraph, /Activated gates/);
  assert.match(bodygraph, /Conscious and unconscious activations/);
  assert.match(bodygraph, /What each center represents/);
  assert.match(bodygraph, /names, centers, and keywords/);
  assert.match(bodygraph, /Variables and Incarnation Cross naming remain outside the verified core/);
});

test("combined Codex separates cross-system reinforcement tension jobs and experiments", () => {
  assert.match(panel, /Cross-system synthesis/);
  assert.match(panel, /Reinforcement/);
  assert.match(panel, /Tension/);
  assert.match(panel, /Different jobs/);
  assert.match(panel, /Test it/);
  assert.match(panel, /symbolic intersections, not verified psychology/);
  assert.match(panel, /Stellium \/ concentration ledger/);
  assert.match(panel, /Verified angles, Nodes &amp; Chiron/);
  assert.match(panel, /Excluded \/ inspect-only system ledger/);
  assert.match(panel, /Unresolved ledger/);
});


test("Systems inspector exposes separate and combined multi-system views", () => {
  assert.match(systems, /aria-label="System view navigation"/);
  assert.match(systems, /href="#combined-synthesis"/);
  assert.match(systems, /href="#astrology-system"/);
  assert.match(systems, /href="#numerology-system"/);
  assert.match(systems, /href="#human-design-system"/);
  assert.match(systems, /id="combined-synthesis"/);
  assert.match(systems, /id="astrology-system"/);
  assert.match(systems, /id="numerology-system"/);
  assert.match(systems, /id="human-design-system"/);
});
