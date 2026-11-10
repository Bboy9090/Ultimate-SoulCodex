import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const preview = readFileSync("client/src/components/InteractivePlanetaryPreview.tsx", "utf8");

test("planetary orbit keeps accessible buttons and a wide pointer target", () => {
  assert.match(preview, /const PLANET_ORBIT_HIT_RADIUS = 33;/);
  assert.match(preview, /r=\{PLANET_ORBIT_HIT_RADIUS\}/);
  assert.match(preview, /data-testid=\{\`planetary-hit-target-\$\{planet\.key\}\`\}/);
  assert.match(preview, /aria-label=\{"Explore " \+ planet\.label\}/);
  assert.match(preview, /aria-pressed=\{active\}/);
  assert.match(preview, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(preview, /<button[\s\S]*?aria-pressed=\{selectedKey === planet\.key\}/);
  assert.match(preview, /useReducedMotion/);
  assert.match(preview, /positions are decorative, not calculated/);
});
