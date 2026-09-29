import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const viewer = readFileSync("client/src/components/EvidenceViewer.tsx", "utf8");
const badge = readFileSync("client/src/components/soul-codex/EvidenceBadge.tsx", "utf8");
const drawer = readFileSync("client/src/components/soul-codex/EvidenceDrawer.tsx", "utf8");

test("EvidenceViewer expansion controls are semantic keyboard controls", () => {
  assert.match(viewer, /<button\s+[\s\S]*?type="button"[\s\S]*?aria-expanded=/);
  assert.match(viewer, /aria-controls=\{`evidence-detail-/);
  assert.match(viewer, /role="region"/);
  assert.match(viewer, /aria-label=\{`Evidence details for/);
  assert.doesNotMatch(
    viewer,
    /<div[\s\S]{0,300}onClick=\{\(\) => toggleExpanded/,
    "entry expansion must not depend on a clickable div",
  );
});

test("EvidenceBadge exposes tooltip meaning beyond mouse hover", () => {
  assert.match(badge, /aria-label=\{`\$\{displayLabel\}/);
  assert.match(badge, /displayTooltip/);
});

test("EvidenceDrawer uses labelled disclosure semantics", () => {
  assert.match(drawer, /aria-expanded=\{isOpen\}/);
  assert.match(drawer, /aria-controls=\{drawerId\}/);
  assert.match(drawer, /role="region"/);
  assert.match(drawer, /aria-label="Reading evidence and methods"/);
});
