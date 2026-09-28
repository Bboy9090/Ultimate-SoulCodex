import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homeUrl = new URL("../client/src/pages/home.tsx", import.meta.url);

test("Home connects the daily return loop to the local People repository", async () => {
  const source = await readFile(homeUrl, "utf8");
  assert.match(source, /loadConnections/);
  assert.match(source, /soulcodex:connections-updated/);
  assert.match(source, /Your circle/);
  assert.match(source, /Three useful ways back in/);
  assert.match(source, /compatibilityLink/);
  assert.match(source, /hasComparableConnectionData/);
});

test("Home social cards remain evidence-aware and local-first", async () => {
  const source = await readFile(homeUrl, "utf8");
  assert.match(source, /Chart facts incomplete/);
  assert.match(source, /leaves unknown chart facts unknown/);
  assert.match(source, /No forecast required/);
  assert.doesNotMatch(source, /joined Soul Codex/i);
  assert.doesNotMatch(source, /verified friend/i);
  assert.doesNotMatch(source, /compatibility score/i);
});

test("Home keeps People accessible when no comparable chart data exists", async () => {
  const source = await readFile(homeUrl, "utf8");
  assert.match(source, /href: leadConnection && hasComparableConnectionData\(leadConnection\)/);
  assert.match(source, /: "\/connections"/);
  assert.match(source, /Add your first person/);
});
