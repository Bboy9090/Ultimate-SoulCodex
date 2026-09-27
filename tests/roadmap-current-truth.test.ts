import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const roadmap = readFileSync("ROADMAP.md", "utf8");

test("roadmap points to the executable registry authority", () => {
  assert.match(roadmap, /shared\/system-registry\.ts/);
  assert.match(roadmap, /governance\/SYSTEM_REGISTRY\.md/);
  assert.match(roadmap, /Code presence is not the same as production support/i);
});

test("roadmap cannot re-advertise retired 35+ system production claims", () => {
  for (const forbidden of [
    /35\+ integrated systems/i,
    /engine calculates all 35\+ systems/i,
    /Daily Gene Key/i,
    /Daily Tarot/i,
    /Daily I Ching/i,
    /5-pillar compatibility analysis/i,
    /shareable profile link generation/i,
    /mobile native app \(iOS\/Android\).*out of scope/i,
  ]) {
    assert.doesNotMatch(roadmap, forbidden);
  }
});

test("roadmap reflects governed production boundaries", () => {
  assert.match(roadmap, /verified natal astrology/i);
  assert.match(roadmap, /deterministic numerology core/i);
  assert.match(roadmap, /verified Human Design core/i);
  assert.match(roadmap, /does not silently substitute noon/i);
  assert.match(roadmap, /MBTI \/ Enneagram \/ similar frameworks only from explicit user assessment/i);
  assert.match(roadmap, /More systems.*not a quality metric/i);
});

test("roadmap reflects active native release engineering without claiming store publication", () => {
  assert.match(roadmap, /Native iOS and Android release pipelines are active/i);
  assert.match(roadmap, /Xcode bootstrap parity/i);
  assert.match(roadmap, /Android and iOS store-candidate gates/i);
  assert.match(roadmap, /does not by itself mean a store listing is publicly available/i);
});

test("roadmap keeps unavailable systems visibly quarantined", () => {
  for (const system of [
    "Gene Keys",
    "Vedic astrology / Nakshatras",
    "Chakras / energy-center profiles",
    "Runes",
    "Sacred geometry",
    "Fixed stars",
    "Astrocartography",
    "Palmistry",
  ]) {
    assert.match(
      roadmap,
      new RegExp(system.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&"), "i"),
    );
  }
});
