import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../client/src/components/VerifiedNatalChart.tsx", import.meta.url), "utf8");
const atlas = readFileSync(new URL("../client/src/lib/astrologyAtlas.ts", import.meta.url), "utf8");

test("verified natal wheel exposes an accessible sign-first walkthrough", () => {
  assert.match(source, /kind: "sign"; sign: AtlasSign/);
  assert.match(source, /\.\.\.Object\.keys\(SIGN_GLYPH\)\.map\(\(sign\) => \(\{ kind: "sign"/);
  assert.match(source, /Walk me through it/);
  assert.match(source, /Step \{guideIndex \+ 1\} of \{guideStops\.length\}/);
  assert.match(source, />Back<\/button>/);
  assert.match(source, /Finish walk/);
  assert.match(source, /Open \$\{sign\} sign meaning/);
});

test("manual chart selection exits walkthrough mode", () => {
  assert.match(source, /function selectChartItem\(item: ChartSelection\) \{\s*setGuideIndex\(null\);\s*setSelection\(item\);/s);
  assert.match(source, /onClick=\{\(\) => selectChartItem\(\{ kind: "sign"/);
  assert.match(source, /onClick=\{\(\) => selectChartItem\(\{ kind: "planet"/);
});

test("sign walkthrough keeps core meaning free and deeper sign tension/practice behind interpretation depth", () => {
  assert.match(source, /This sign’s symbolic style is \{meaning\.approach\}\. Its possible gift is \{meaning\.gift\.toLowerCase\(\)\}/);
  assert.match(source, /interpretationDepth \? <div className="mt-4 grid gap-3 sm:grid-cols-2">/);
  assert.match(source, /Watch point/);
  assert.match(source, /Ground it/);
  assert.match(source, /: <InterpretationDepthGate \/>/);
});

test("sign atlas exposes governed sign-level meaning used by the walkthrough", () => {
  assert.match(atlas, /export function atlasSignMeaning/);
  assert.match(atlas, /approach/);
  assert.match(atlas, /gift/);
  assert.match(atlas, /tension/);
  assert.match(atlas, /practice/);
});
