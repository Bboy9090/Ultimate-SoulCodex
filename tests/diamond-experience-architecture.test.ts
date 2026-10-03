import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(new URL("../client/src/pages/home.tsx", import.meta.url), "utf8");
const profile = readFileSync(new URL("../client/src/pages/profile.tsx", import.meta.url), "utf8");
const architecture = readFileSync(new URL("../docs/SOUL_CODEX_EXPERIENCE_ARCHITECTURE.md", import.meta.url), "utf8");

test("home is organized around the four user questions", () => {
  for (const phrase of [
    "Tell me about me.",
    "Tell me about today.",
    "Tell me about me and this person.",
    "Explain why.",
  ]) {
    assert.ok(home.includes(phrase), `missing home question: ${phrase}`);
  }
  assert.doesNotMatch(home, /35\+ systems/i);
});

test("core profile uses progressive disclosure", () => {
  assert.match(profile, /<details className="sc-panel p-5">/);
  assert.match(profile, /Your Big 3/);
  assert.match(profile, /Your Core Numbers/);
  assert.match(profile, /Your Human Design/);
  assert.match(profile, /Why am I seeing this\?/);
});

test("human design fails closed when trust is missing", () => {
  assert.match(profile, /humanDesignVerified/);
  assert.match(profile, /Not verified yet/);
  assert.match(profile, /will not invent Type, Strategy, Authority, or Profile/);
});

test("experience architecture requires Diamond Way closure", () => {
  assert.match(architecture, /Complex machinery, clean surface\./);
  assert.match(architecture, /### Clarity/);
  assert.match(architecture, /### Depth/);
  assert.match(architecture, /### Next move/);
  assert.match(architecture, /No reading ends on abstract theory alone\./);
});


test("pricing defines useful Free and deeper Soul Codex Plus", () => {
  const pricing = readFileSync(new URL("../client/src/pages/PricingPage.tsx", import.meta.url), "utf8");
  assert.match(pricing, />Free</);
  assert.match(pricing, /Soul Codex\+/);
  assert.match(pricing, /Accuracy is never paywalled/);
  assert.match(pricing, /up to three qualified influences/);
  assert.match(pricing, /up to five qualified current influences/);
});

test("monetization contract requires durable subscription entitlement truth", () => {
  const contract = readFileSync(new URL("../docs/MONETIZATION_V4_1_CONTRACT.md", import.meta.url), "utf8");
  assert.match(contract, /Soul Codex\+ Monthly/);
  assert.match(contract, /Soul Codex\+ Annual/);
  assert.match(contract, /server owns the entitlement state/i);
  assert.match(contract, /Restore Purchases works after reinstall/i);
});


test("connections surface uses the five transparent relationship dimensions", () => {
  const compatibility = readFileSync(new URL("../client/src/pages/CompatibilityHubPage.tsx", import.meta.url), "utf8");
  for (const label of [
    "Communication",
    "Emotional rhythm",
    "Attraction & chemistry",
    "Life direction",
    "Human Design context",
  ]) {
    assert.ok(compatibility.includes(label), `missing relationship dimension: ${label}`);
  }
  assert.match(compatibility, /advanced_connections/);
  assert.match(compatibility, /Planned · not included in current Soul Codex\+/);
  assert.match(compatibility, /No universal verdict/);
});


test("today surface enforces tier-aware influence budgets", () => {
  const timeline = readFileSync(new URL("../client/src/pages/TimelinePage.tsx", import.meta.url), "utf8");
  assert.match(timeline, /DAILY_INFLUENCE_LIMIT/);
  assert.match(timeline, /Your chart today/);
  assert.match(timeline, /See all five influences/);
  assert.match(timeline, /advanced_daily/);
  assert.match(timeline, /DiamondClosure/);
});
