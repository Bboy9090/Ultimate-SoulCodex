import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { natalChartIdentity } from "../client/src/lib/natalChartIdentity";

// Isolated chart fixtures; no generated values enter production.
const chart = {
  placements: [{ key: "sun", label: "Sun", sign: "Aries", house: 1, degree: 10,
    longitude: 10, element: "Fire", modality: "Cardinal", evidenceState: "verified" as const }],
  houseCusps: [{ house: 1, sign: "Aries", degree: 0, longitude: 0 }],
  supportingPoints: [{ key: "rising" as const, label: "Rising", sign: "Aries", house: 1, degree: 0, longitude: 0 }],
  aspects: [
    { planet1: "Sun", planet2: "Moon", aspect: "trine", orb: 2 },
    { planet1: "Sun", planet2: "Mars", aspect: "square", orb: 1 },
  ],
};
const astrology = { rising: { internalCandidate: { longitude: 0 } } };

test("equivalent chart objects preserve interaction identity", () => {
  assert.equal(natalChartIdentity(astrology, chart), natalChartIdentity(structuredClone(astrology), structuredClone(chart)));
  assert.equal(natalChartIdentity(astrology, chart), natalChartIdentity({ ...astrology, interpretationDepth: true }, chart));
});

test("shorter or reordered aspect lists reset the tour instead of retaining an obsolete index", () => {
  const identity = natalChartIdentity(astrology, chart);
  assert.notEqual(identity, natalChartIdentity(astrology, { ...chart, aspects: [] }));
  assert.notEqual(identity, natalChartIdentity(astrology, { ...chart, aspects: [...chart.aspects].reverse() }));
});

test("changed geometry and restored evidence reset manual selection and tour", () => {
  const identity = natalChartIdentity(astrology, chart);
  for (const field of ["placements", "houseCusps", "supportingPoints"] as const) {
    assert.notEqual(identity, natalChartIdentity(astrology, { ...chart, [field]: [] }));
  }
  assert.notEqual(identity, natalChartIdentity({ rising: { internalCandidate: { longitude: 45 } } }, chart));
  assert.notEqual(identity, natalChartIdentity(astrology, { ...chart, placements: [{ ...chart.placements[0], longitude: 11 }] }));
});

test("chart identity keys the component owning both interaction states before it renders", () => {
  const source = readFileSync(new URL("../client/src/components/VerifiedNatalChart.tsx", import.meta.url), "utf8");
  assert.match(source, /<VerifiedNatalChartContent key=\{natalChartIdentity\(props.astrology, props.synthesis\)\} \{\.\.\.props\} \/>/);
  const content = source.slice(source.indexOf("function VerifiedNatalChartContent"));
  assert.match(content, /\[selection, setSelection\] = useState/);
  assert.match(content, /\[guideIndex, setGuideIndex\] = useState/);
});
