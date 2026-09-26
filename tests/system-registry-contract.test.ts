import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY,
  registrySystemsAllowedInUltimateCodex,
  registrySystemsExcludedFromUltimateCodex,
  registrySystemsForUseContext,
  registryDisplayManifest,
} from "../shared/system-registry.ts";
import { SOUL_CODEX_SYSTEM_POLICIES } from "../shared/system-visibility.ts";

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

test("legacy daily template service delegates to a selector that rotates only governed systems", () => {
  const legacyService = readFileSync("services/template-bank.ts", "utf8");
  const governedPackage = readFileSync("packages/astrology/template-bank.ts", "utf8");

  assert.match(legacyService, /export \* from ['"]\.\.\/packages\/astrology\/template-bank['"]/);

  const selectorStart = governedPackage.indexOf("export function selectTemplates");
  assert.ok(selectorStart >= 0, "governed template selector must exist");
  const selector = governedPackage.slice(selectorStart);

  assert.match(selector, /numerology:\s*numerologyTemplates/);
  assert.match(selector, /astrology:\s*eligibleAstrologyTemplates/);
  assert.match(selector, /humandesign:\s*humanDesignTemplates/);
  assert.doesNotMatch(
    selector,
    /chinese:\s*|ayurveda:\s*|vedic:\s*|genekeys:\s*|iching:\s*|mayan:\s*|chakras:\s*|runes:\s*|tarot:\s*|kabbalah:\s*|sacredgeom:\s*|sabian:\s*|biorhythms:\s*|asteroids:\s*|arabicparts:\s*|fixedstars:\s*/,
  );
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


test("governed daily template module contains no dormant disabled-system corpus", () => {
  const governedPackage = readFileSync("packages/astrology/template-bank.ts", "utf8");

  assert.doesNotMatch(
    governedPackage,
    /const (?:personality|chinese|ayurveda|vedic|geneKeys|iChing|mayan|chakra|runes|tarot|kabbalah|sacredGeom|sabian|biorhythms|asteroids|arabicParts|fixedStars)Templates/,
  );
  assert.doesNotMatch(
    governedPackage,
    /birth rune|nakshatra|dosha|hexagram|Sabian Symbol|Part of Fortune|fixed star|Gene Key|biorhythm/i,
  );
});


test("use-context selector prevents system pile-on", () => {
  const stable = registrySystemsForUseContext("stable-identity").map((entry) => entry.id);
  const current = registrySystemsForUseContext("current-guidance").map((entry) => entry.id);
  const supporting = registrySystemsForUseContext("supporting-reflection").map((entry) => entry.id);
  const technical = registrySystemsForUseContext("technical-inspection").map((entry) => entry.id);

  assert.ok(stable.includes("natal-astrology"));
  assert.ok(stable.includes("numerology-core"));
  assert.ok(stable.includes("human-design-core"));
  assert.equal(stable.includes("numerology-cycles"), false);
  assert.equal(stable.includes("personality-assessments"), false);
  assert.equal(stable.includes("gene-keys"), false);

  assert.ok(current.includes("natal-astrology"));
  assert.ok(current.includes("numerology-core"));
  assert.ok(current.includes("human-design-core"));
  assert.ok(current.includes("numerology-cycles"));
  assert.equal(current.includes("personality-assessments"), false);
  assert.equal(current.includes("gene-keys"), false);

  assert.deepEqual(
    supporting.sort(),
    ["moral-compass", "personality-assessments"].sort(),
  );

  assert.equal(technical.length, SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.length);
  assert.ok(technical.includes("gene-keys"));
  assert.ok(technical.includes("fixed-stars"));
});


test("legacy visibility policy cannot outrank the production registry", () => {
  assert.equal(
    SOUL_CODEX_SYSTEM_POLICIES.personalityAssessments.mayInfluencePrimarySynthesis,
    false,
  );
  assert.equal(SOUL_CODEX_SYSTEM_POLICIES.runes.visibility, "unavailable");
  assert.equal(SOUL_CODEX_SYSTEM_POLICIES.sacredGeometry.visibility, "unavailable");

  for (const [legacyKey, registryId] of [
    ["runes", "runes"],
    ["sacredGeometry", "sacred-geometry"],
  ] as const) {
    const registry = SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.find(
      (entry) => entry.id === registryId,
    );
    assert.ok(registry);
    assert.equal(SOUL_CODEX_SYSTEM_POLICIES[legacyKey].visibility, registry?.state);
    assert.equal(
      SOUL_CODEX_SYSTEM_POLICIES[legacyKey].mayInfluencePrimarySynthesis,
      registry?.mayInfluenceUltimateCodex,
    );
  }
});


test("display manifest mirrors governance without implying per-user verification", () => {
  const manifest = registryDisplayManifest();
  assert.equal(manifest.length, SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.length);

  const byId = new Map(manifest.map((entry) => [entry.id, entry]));
  assert.equal(byId.get("natal-astrology")?.state, "Governed");
  assert.equal(byId.get("personality-assessments")?.state, "Supporting");
  assert.equal(byId.get("human-design-advanced")?.state, "Inspect only");
  assert.equal(byId.get("gene-keys")?.state, "Unavailable");

  for (const entry of manifest) {
    const source = SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.find(
      (candidate) => candidate.id === entry.id,
    );
    assert.ok(source);
    assert.equal(
      entry.stableIdentityEligible,
      source?.mayInfluenceUltimateCodex,
      entry.id,
    );
  }

  assert.equal(
    manifest.some((entry) => /verified for this user|user verified/i.test(entry.state)),
    false,
  );
});

test("supporting, inspect-only, and unavailable display states never become stable identity eligible", () => {
  for (const entry of registryDisplayManifest()) {
    if (entry.state !== "Governed") {
      assert.equal(entry.stableIdentityEligible, false, entry.id);
    }
  }
});
