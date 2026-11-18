import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const css = readFileSync("client/src/index.css", "utf8");
const inputs = readFileSync("client/src/lib/profileBirthEvidence.ts", "utf8");
const release = readFileSync("docs/STORE_SUBMISSION_PACKET.md", "utf8");

test("cosmic interactive focus and selected placement have non-motion cues", () => {
  assert.match(css, /4\.1\.3 cosmic instrument polish/);
  assert.match(css, /\.sc-cosmic-root :is\(\.sc-panel, \.sc-orbit-inspector\):focus-within/);
  assert.match(css, /\.sc-orbit-mobile-option\[aria-pressed="true"\]/);
  assert.match(css, /border-color: var\(--sc-gold-bright\)/);
});

test("touch devices and accessibility settings override decorative movement", () => {
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(prefers-contrast: more\)/);
  assert.match(css, /html:not\(\[data-cosmic-motion="still"\]\)/);
});

test("birth evidence does not coerce nondecimal coordinate notation", () => {
  assert.match(inputs, /Only decimal coordinates are valid birth evidence/);
  assert.match(inputs, /Number\.isFinite\(number\)/);
  assert.match(release, /4\.1\.3 \/ versionCode 4000021/);
  assert.match(release, /4\.1\.3 \/ build 4000017/);
  assert.match(release, /4\.1\.2 Candidate Status/);
});
