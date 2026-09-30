import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync("client/src/pages/offline-profile.tsx", "utf8");

test("unknown-time Identity UI preserves all four evidence states", () => {
  assert.match(source, /data-testid="evidence-state-verified"/);
  assert.match(source, /data-testid="evidence-state-stable-range"/);
  assert.match(source, /data-testid="evidence-state-conditional"/);
  assert.match(source, /data-testid="evidence-state-unavailable"/);
  assert.match(source, />Verified</);
  assert.match(source, />Stable across range</);
  assert.match(source, />Conditional</);
  assert.match(source, />Unavailable</);
});

test("conditional astrology is visibly branch-only rectification evidence", () => {
  assert.match(source, /rectification evidence/);
  assert.match(source, /do not enter the main synthesis/);
  assert.match(source, /startLocalTime/);
  assert.match(source, /endLocalTime/);
});

test("conditional Human Design exposes branch values and time windows", () => {
  assert.match(source, /value\.conditionalValues/);
  assert.match(source, /branch\.value/);
  assert.match(source, /branch\.startLocalTime/);
  assert.match(source, /branch\.endLocalTime/);
});

test("unavailable state explains what exact inputs unlock", () => {
  assert.match(source, /Houses: add an exact birth time/);
  assert.match(source, /Midheaven: add an exact birth time/);
  assert.match(source, /add the full birth name/);
  assert.match(source, /nearest known birth city/);
  assert.match(source, /will not insert one/);
});
