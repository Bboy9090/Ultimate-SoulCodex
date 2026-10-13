import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const system = readFileSync("client/src/components/InteractivePlanetarySystem.tsx", "utf8");
const offline = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
const navigation = readFileSync("client/src/components/navigation.tsx", "utf8");

test("Identity exposes an interactive planetary system before full house geometry is required", () => {
  assert.match(offline, /InteractivePlanetarySystem/);
  assert.match(offline, /ultimateCodex\.placements\.length > 0/);
  assert.doesNotMatch(
    offline,
    /verifiedFullNatal\s*&&\s*[^\n]*InteractivePlanetarySystem/,
  );
});

test("planetary system uses exact longitude when present and refuses invented longitude", () => {
  assert.match(system, /placement\.longitude !== null/);
  assert.match(system, /placement\.longitude === null/);
  assert.match(system, /no exact drawable longitude/i);
  assert.match(system, /rather than placing them at an invented degree/i);
});

test("planetary motion is explicitly decorative rather than fake transit math", () => {
  assert.match(system, /Motion is interface animation only/);
  assert.match(system, /not a claim about real-time transit speed/);
  assert.match(system, /useReducedMotion/);
});

test("every supported placement is directly selectable", () => {
  assert.match(system, /aria-pressed=\{selected\?\.key === placement\.key\}/);
  assert.match(system, /setSelectedKey\(placement\.key\)/);
  assert.match(system, /planetary-system-selection/);
});

test("Systems is a labeled primary navigation destination when a profile exists", () => {
  assert.match(navigation, /href: "\/systems", label: "Systems"/);
  assert.doesNotMatch(navigation, /data-testid="link-underlying-systems"/);
});
