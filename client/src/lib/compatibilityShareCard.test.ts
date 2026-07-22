import assert from "node:assert/strict";
import test from "node:test";
import { buildCompatibilityShareCardSvg } from "./compatibilityShareCard.ts";

test("builds an exact 1080 square card with score and confidence", () => {
  const svg = buildCompatibilityShareCardSvg({ profile1Name:"Bobby", profile2Name:"Jordan", overallScore:78, scoreLabel:"Strong Connection", confidenceLabel:"Partial", systemsUsed:["astrology","numerology"] });
  assert.match(svg, /width="1080" height="1080"/);
  assert.match(svg, />78</);
  assert.match(svg, />Partial</);
});

test("clamps invalid scores and escapes user-controlled names", () => {
  const svg = buildCompatibilityShareCardSvg({ profile1Name:"Bobby <script>", profile2Name:"A & B", overallScore:140, scoreLabel:"Test", confidenceLabel:"Verified" });
  assert.match(svg, />100</);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /Bobby &lt;script&gt; × A &amp; B/);
});
