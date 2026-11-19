import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("client/src/pages/CompatibilityPersonPage.tsx", "utf8");
const hub = readFileSync("client/src/pages/CompatibilityHubPage.tsx", "utf8");
const model = readFileSync("client/src/lib/friendChartCompatibility.ts", "utf8");

test("friendship conversation is based only on matched saved chart facts", () => {
  assert.match(model, /function conversationMoments\(matches: ChartPlacementMatch\[\]\)/);
  assert.match(model, /FRIENDSHIP_KEYS\.includes\(match\.key/);
  assert.match(model, /conversationMoments: conversationMoments\(friendshipMatches\)/);
  assert.match(page, /data-testid="friend-conversation-lab"/);
  assert.match(page, /moment\.basis/);
  assert.match(page, /moment\.question/);
  assert.match(page, /moment\.followUp/);
  assert.match(page, /visibleConversationMoments\.length \?/);
  assert.match(hub, /open Conversation Lab/);
});

test("Free sees useful two-way questions; Plus can see all supported placements", () => {
  assert.match(page, /const visibleConversationMoments = deeperInterpretationUnlocked/);
  assert.match(page, /friendChartComparison\.conversationMoments\.slice\(0, 2\)/);
  assert.match(page, /friendChartComparison\.conversationMoments\s*\n/);
  assert.match(page, /data-testid="friend-conversation-plus-boundary"/);
  assert.match(page, /href="\/pricing"/);
});

test("conversation lab does not collect, export or diagnose friend answers", () => {
  const start = page.indexOf('data-testid="friend-conversation-lab"');
  const end = page.indexOf("{visibleFriendshipPerspectives.length", start);
  const section = page.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.match(section, /No answers are collected or shared/);
  assert.match(section, /not psychological assessments/);
  assert.doesNotMatch(section, /apiFetch|fetch\(|localStorage|sendBeacon|navigator\.share|clipboard|postMessage/);
});
