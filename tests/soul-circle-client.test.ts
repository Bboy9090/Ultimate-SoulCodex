import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  BIG_THREE,
  EVERYTHING_VERIFIED,
  SHARE_FIELD_OPTIONS,
  SoulCircleError,
  buildShareSelection,
  chartChips,
  comparablePlacements,
  explainSoulCircleError,
  inviteMessage,
  inviteUrl,
  needsVerification,
  toggleField,
} from "../client/src/lib/soulCircleClient";
import { compareFriendCharts } from "../client/src/lib/friendChartCompatibility";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("share selection refuses empty picks and a ticked name with no name", () => {
  assert.equal(buildShareSelection([], "").ok, false);
  const missing = buildShareSelection(["sunSign", "displayName"], "   ");
  assert.equal(missing.ok, false);
  assert.equal(buildShareSelection(["displayName"], "x".repeat(81)).ok, false);
  const ok = buildShareSelection(["sunSign", "sunSign", "displayName"], "  Ada  ");
  assert.deepEqual(ok.ok && ok.selection, { fields: ["sunSign", "displayName"], displayName: "Ada" });
  // A name that was typed but not ticked is never sent.
  assert.deepEqual(buildShareSelection(["sunSign"], "Ada").ok && (buildShareSelection(["sunSign"], "Ada") as any).selection, { fields: ["sunSign"] });
});

test("presets and toggling behave, and every option maps to a server field", () => {
  assert.deepEqual(toggleField(["sunSign"], "moonSign"), ["sunSign", "moonSign"]);
  assert.deepEqual(toggleField(["sunSign", "moonSign"], "sunSign"), ["moonSign"]);
  assert.deepEqual(BIG_THREE, ["sunSign", "moonSign", "risingSign"]);
  assert.ok(!EVERYTHING_VERIFIED.includes("displayName"), "a name is never part of a bulk preset");
  const server = read("server/lib/public-profile-projection.ts");
  for (const option of SHARE_FIELD_OPTIONS) assert.ok(server.includes(`"${option.field}"`), `${option.field} must exist on the server`);
});

test("chips show only what was shared, in a stable order, never inventing values", () => {
  assert.deepEqual(chartChips(null), []);
  assert.deepEqual(chartChips({}), []);
  assert.deepEqual(
    chartChips({ archetypeTitle: "The Builder", lifePath: 9, risingSign: "Scorpio", sunSign: "Virgo" }).map((chip) => `${chip.label}:${chip.value}`),
    ["Sun:Virgo", "Rising:Scorpio", "Life Path:9", "Archetype:The Builder"],
  );
  assert.deepEqual(chartChips({ lifePath: 0 }).map((chip) => chip.value), ["0"]);
});

test("comparison input drops unknown signs instead of guessing and feeds the shared comparison", () => {
  const theirs = comparablePlacements({ comparisonChart: [
    { key: "moon", sign: "Leo", house: 4 },
    { key: "venus", sign: "NotASign", house: 2 },
    { key: "mercury", sign: "Virgo", house: 1 },
  ] });
  assert.deepEqual(theirs.map((row) => row.key), ["moon", "mercury"]);
  const result = compareFriendCharts([{ key: "moon", sign: "Leo", house: 4 }, { key: "mercury", sign: "Gemini", house: 3 }], theirs);
  assert.equal(result.friendshipCoverage.matched, 2);
  assert.deepEqual(comparablePlacements(undefined), []);
});

test("invite links are built only from a safe origin and a server-shaped path", () => {
  const token = "A".repeat(43);
  assert.equal(inviteUrl("https://soulcodex.up.railway.app", `/circle/join/${token}`), `https://soulcodex.up.railway.app/circle/join/${token}`);
  assert.throws(() => inviteUrl("javascript:alert(1)", `/circle/join/${token}`), RangeError);
  assert.throws(() => inviteUrl("https://example.com", "/circle/join/short"), RangeError);
  assert.throws(() => inviteUrl("https://example.com", `//evil.example/${token}`), RangeError);
  const message = inviteMessage(`https://x.example/circle/join/${token}`);
  assert.match(message, /nothing is shared until you decide/i);
});

test("errors map to plain language and verification errors are recognized", () => {
  assert.match(explainSoulCircleError(410, "invite_unavailable"), /no longer available/);
  assert.match(explainSoulCircleError(409, "verified_profile_required"), /verify your chart online/i);
  assert.match(explainSoulCircleError(401), /Sign in/);
  assert.match(explainSoulCircleError(500, "weird", "x".repeat(500)), /Something went wrong/, "never echo long server text");
  assert.equal(needsVerification(new SoulCircleError(409, "verified_profile_required", "x")), true);
  assert.equal(needsVerification(new SoulCircleError(422, "no_verified_fields", "x")), true);
  assert.equal(needsVerification(new SoulCircleError(500, "other", "x")), false);
  assert.equal(needsVerification(new Error("x")), false);
});

test("pages stay on the consent-based path and never ask for a friend's details", () => {
  const pages = ["SoulCirclePage", "SoulCircleJoinPage", "SoulCircleFriendPage"].map((name) => read(`client/src/pages/${name}.tsx`));
  const all = pages.join("\n");
  assert.doesNotMatch(all, /humanDesign|Human Design/i, "Human Design is excluded from friend sharing");
  assert.doesNotMatch(all, /birthDate|birthTime|birthLocation|latitude|longitude/, "no birth data is read or sent");
  assert.doesNotMatch(all, /localStorage|loadConnections|saveConnection/, "friends are never stored on the device list");
  assert.doesNotMatch(all, /navigator\.contacts|requestContacts/, "no contact access");
  assert.match(all, /Joining shares nothing/);
  assert.match(all, /Your account name is never shown/);
  assert.match(all, /Compared on your device/);
  assert.match(all, /Nothing is shared until you save/);
  // Entitlement boundary is unchanged: free keeps a first look, Plus the rest.
  assert.match(pages[2], /tierAllowsCapability\(tier, "interpretation_depth"\)/);
  // The friend page only talks to Soul Circle endpoints through the typed client.
  assert.doesNotMatch(all, /apiFetch\(|fetch\(/);
});

test("routes and entry points are wired", () => {
  const app = read("client/src/App.tsx");
  assert.match(app, /path="\/circle\/join\/:token"/);
  assert.match(app, /path="\/circle\/:id"/);
  assert.ok(app.indexOf('path="/circle/join/:token"') < app.indexOf('path="/circle/:id"'), "join must be matched before :id");
  assert.match(read("client/src/pages/ConnectionsPage.tsx"), /href="\/circle"/);
});
