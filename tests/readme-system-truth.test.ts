import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readme = readFileSync("README.md", "utf8");

test("README points to the executable production registry as source of truth", () => {
  assert.match(readme, /shared\/system-registry\.ts/);
  assert.match(readme, /governance\/SYSTEM_REGISTRY\.md/);
  assert.match(readme, /Unavailable \/ quarantined from production synthesis/);
  assert.match(readme, /More systems do not automatically mean more certainty/);
});

test("README cannot advertise quarantined systems as live birth-derived identity", () => {
  for (const forbidden of [
    /35\+ systems/i,
    /maps your Gene Key profile/i,
    /Type and wing suggestion based on chart signature/i,
    /Cognitive function stack correlated to chart/i,
    /Dominant and blocked chakras from chart patterns/i,
    /Core geometric archetype from numerology\/chart/i,
    /The engine calculates all .* systems/i,
    /All calculations are performed on the server/i,
  ]) {
    assert.doesNotMatch(readme, forbidden);
  }
});

test("README preserves the user-assessed boundary for personality systems", () => {
  assert.match(
    readme,
    /MBTI \/ Enneagram \/ similar assessments[\s\S]*User-supplied assessment context only/,
  );
  assert.match(readme, /does not infer these types from a birth chart/i);
});

test("README keeps unsupported systems visibly quarantined", () => {
  for (const system of [
    "Vedic astrology / Nakshatras",
    "Gene Keys",
    "Chakras / energy-center profiles",
    "Runes",
    "Sacred geometry",
    "Fixed stars",
    "Astrocartography",
    "Palmistry",
  ]) {
    assert.match(readme, new RegExp(system.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&"), "i"));
  }
});


test("README mirrors the active runtime architecture", () => {
  assert.ok(
    readme.includes(
      "Route layer: `server/routes.ts`, with governed specialized routers under `server/routes/`",
    ),
  );
  assert.equal(readme.includes("Route layer: root `routes.ts`"), false);
  assert.ok(readme.includes("| Build | Vite 8 (client), esbuild (server) |"));
  assert.equal(readme.includes("Vite 5 (client)"), false);
  assert.ok(readme.includes("Navigate to `http://localhost:3000`"));
  assert.equal(readme.includes("Navigate to `http://localhost:5000`"), false);
});


test("README developer setup follows the active repository and scripts", () => {
  assert.match(readme, /git clone https:\/\/github\.com\/Bboy9090\/Ultimate-SoulCodex\.git/);
  assert.match(readme, /npm run build\s+# Build frontend, PWA assets, and bundled server/);
  assert.match(readme, /npm run mobile:validate:ios/);
  assert.match(readme, /npm run mobile:validate:android/);
  assert.match(readme, /server\/routes\.ts/);
  assert.match(readme, /production server listens on port 5000/i);

  for (const stale of [
    /Ultimate-SoulCodex-Engine-of-the-Eternal-Now\.git/,
    /npm run build:client/,
    /npm run build:server/,
    /Routes\*\*: `routes\.ts`/,
    /Total: 38\/38 tests across 6 suites/,
    /natal chart, vedic, transits/i,
    /All features work except persisting new users and payments/i,
  ]) {
    assert.doesNotMatch(readme, stale);
  }
});

test("README makes CI the release authority rather than historical smoke counts", () => {
  assert.match(readme, /authoritative release path is the CI gate stack/i);
  assert.match(readme, /qualified release gates/i);
  assert.match(readme, /Legacy smoke scripts may remain/i);
  assert.match(readme, /does not promote a quarantined system/i);
});
