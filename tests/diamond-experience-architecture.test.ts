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
