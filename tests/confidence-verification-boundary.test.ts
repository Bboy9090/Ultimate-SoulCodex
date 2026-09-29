import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildCodexReadingBadges,
  computeConfidence,
} from "../packages/core/compute/confidence";

test("complete birth inputs do not become Verified without astronomy verification", () => {
  const result = computeConfidence({
    timeUnknown: false,
    hasGeo: true,
    hasTimezone: true,
  });

  assert.equal(result.badge, "partial");
  assert.match(result.reason, /no approved astronomy verification state/i);
  assert.match(result.aiAssuranceNote, /do not by themselves prove/i);
});

test("unknown birth time never promises a stable Moon or estimated Rising", () => {
  const result = computeConfidence({
    timeUnknown: true,
    hasGeo: true,
    hasTimezone: true,
  });

  const rendered = `${result.reason} ${result.aiAssuranceNote}`;
  assert.equal(result.badge, "partial");
  assert.match(rendered, /Rising, houses/);
  assert.match(rendered, /Moon[\s\S]*must not be assumed stable/i);
  assert.doesNotMatch(rendered, /Rising sign is estimated/i);
  assert.doesNotMatch(rendered, /Sun and Moon are stable/i);
});

test("Verified requires an explicit approved astronomy state", () => {
  const result = computeConfidence({
    timeUnknown: false,
    hasGeo: true,
    hasTimezone: true,
    astronomyVerified: true,
  });

  assert.equal(result.badge, "verified");
  assert.match(result.reason, /approved astronomy verification state/i);
  assert.match(result.aiAssuranceNote, /symbolic meaning remains interpretation/i);
});

test("missing geo or timezone stays unresolved without fallback language", () => {
  const result = computeConfidence({
    timeUnknown: false,
    hasGeo: false,
    hasTimezone: false,
    astronomyVerified: true,
  });

  const rendered = `${result.reason} ${result.aiAssuranceNote}`;
  assert.equal(result.badge, "unverified");
  assert.match(rendered, /remain unresolved/i);
  assert.doesNotMatch(rendered, /using general archetype fallbacks/i);
});

test("display labels alone cannot promote legacy records to Verified", () => {
  const labelOnly = buildCodexReadingBadges({
    label: "Verified",
    reason: "legacy display label",
  });
  assert.equal(labelOnly.badge, "unverified");
  assert.equal(labelOnly.label, "Unverified");

  const explicit = buildCodexReadingBadges({
    badge: "verified",
    label: "Verified",
    reason: "explicit structured verification state",
  });
  assert.equal(explicit.badge, "verified");
  assert.equal(explicit.label, "Verified");
});

test("legacy confidence module delegates to the canonical core authority", () => {
  const legacy = readFileSync("soulcodex/compute/confidence.ts", "utf8");
  assert.match(legacy, /from "@soulcodex\/core"/);
  assert.doesNotMatch(legacy, /Rising sign is estimated|general archetype fallbacks/);
});

test("generic confidence badge copy follows the fail-closed doctrine", () => {
  const badge = readFileSync("client/src/components/ConfidenceBadge.tsx", "utf8");
  assert.match(badge, /Time-sensitive layers stay omitted or unresolved rather than estimated/);
  assert.match(badge, /no generic archetype fallback is substituted/);
  assert.doesNotMatch(badge, /Sun and Moon are stable|Rising sign is estimated/);
});
