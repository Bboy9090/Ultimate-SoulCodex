import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY,
  registrySystemsAllowedInUltimateCodex,
  registrySystemsExcludedFromUltimateCodex,
} from "../shared/system-registry.ts";

const legacyTemplateSystems = [
  "chinese-astrology",
  "ayurveda",
  "vedic-astrology",
  "gene-keys",
  "i-ching",
  "mayan",
  "chakras",
  "runes",
  "tarot",
  "kabbalah",
  "sacred-geometry",
  "sabian-symbols",
  "biorhythms",
  "asteroids",
  "arabic-parts",
  "fixed-stars",
];

test("production System Registry is unique and explicit", () => {
  const ids = SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length >= 25, "registry should inventory governed and legacy systems");
  for (const entry of SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY) {
    assert.ok(entry.label.length > 2);
    assert.ok(entry.evidenceContract.length > 4);
    assert.ok(entry.rule.length > 12);
  }
});

test("every legacy template category is quarantined from Ultimate Codex synthesis", () => {
  for (const id of legacyTemplateSystems) {
    const entry = SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.find((candidate) => candidate.id === id);
    assert.ok(entry, `missing registry entry for legacy template system ${id}`);
    assert.equal(entry?.state, "unavailable");
    assert.equal(entry?.mayInfluenceUltimateCodex, false);
  }
});

test("only evidence-governed or explicitly assessed systems may influence Ultimate Codex", () => {
  const allowed = registrySystemsAllowedInUltimateCodex();
  assert.ok(allowed.length > 0);
  for (const entry of allowed) {
    assert.notEqual(entry.state, "unavailable");
    assert.notEqual(entry.state, "inspect-only");
    assert.match(entry.evidenceContract, /verified|deterministic|explicit user|governed|aggregation|assessment|ASTRO-|HUMAN-DESIGN-/i);
  }
  assert.ok(registrySystemsExcludedFromUltimateCodex().length > 0);
});

test("production server does not import the generic legacy template bank", () => {
  const serverIndex = readFileSync("server/index.ts", "utf8");
  const serverRoutes = readFileSync("server/routes.ts", "utf8");
  assert.doesNotMatch(serverIndex, /template-bank|daily-insights/);
  assert.doesNotMatch(serverRoutes, /template-bank|daily-insights/);
});

test("generic legacy placeholder language cannot masquerade as governed evidence", () => {
  const legacy = readFileSync("services/template-bank.ts", "utf8");
  assert.match(legacy, /divine purpose|Chinese zodiac|your nakshatra/i, "test should continue detecting the legacy placeholder surface");
  const registry = JSON.stringify(SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY);
  assert.match(registry, /quarantined|not production-governed|No .* inferred|excluded/i);
});


test("root profile routes do not silently inject Tarot into identity synthesis", () => {
  const rootRoutes = readFileSync("routes.ts", "utf8");
  assert.doesNotMatch(rootRoutes, /getTarotBirthCards/);
  assert.doesNotMatch(rootRoutes, /tarotCards/);
});


test("legacy blueprint route cannot consume excluded symbolic fields from stored profiles", () => {
  const rootRoutes = readFileSync("routes.ts", "utf8");
  assert.doesNotMatch(rootRoutes, /profile\.geneKeys|profile\.gene_keys/);
  assert.doesNotMatch(rootRoutes, /astro\.planets\?\.chiron\?\.sign/);
  assert.doesNotMatch(rootRoutes, /astro\.northNode|astro\.southNode/);
});


test("legacy ritual and blueprint routes preserve disabled systems as inert compatibility fields", () => {
  const rootRoutes = readFileSync("routes.ts", "utf8");

  assert.match(
    rootRoutes,
    /const ayurvedaData = null;/,
    "legacy rituals must not surface stored or inferred Ayurveda data",
  );
  assert.match(rootRoutes, /geneKeys:\s*""/);
  assert.match(rootRoutes, /chiron:\s*""/);
  assert.match(rootRoutes, /nodes:\s*""/);
});
