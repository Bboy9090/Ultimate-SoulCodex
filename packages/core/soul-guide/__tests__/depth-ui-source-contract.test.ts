import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const COMPONENT_PATH = fileURLToPath(
  new URL(
    "../../../../client/src/components/DepthSoulGuide.tsx",
    import.meta.url,
  ),
);

function componentSource(): string {
  return readFileSync(COMPONENT_PATH, "utf8");
}

test("DepthSoulGuide source contract", async (suite) => {
  await suite.test("uses native disclosure accessibility semantics", () => {
    const source = componentSource();

    assert.ok(source.includes('type="button"'));
    assert.ok(source.includes("aria-expanded={open}"));
    assert.ok(source.includes("aria-controls={panelId}"));
    assert.ok(source.includes('role="region"'));
    assert.ok(source.includes("aria-labelledby={buttonId}"));
    assert.ok(source.includes(":focus-visible"));
  });

  await suite.test("keeps evidence disclosure separately accessible", () => {
    const source = componentSource();

    assert.ok(source.includes('id="depth-guide-evidence-button"'));
    assert.ok(source.includes('aria-controls="depth-guide-evidence-panel"'));
    assert.ok(source.includes('id="depth-guide-evidence-panel"'));
    assert.ok(source.includes('aria-labelledby="depth-guide-evidence-button"'));
  });

  await suite.test("does not reuse birth-data verification badges", () => {
    const source = componentSource();

    assert.equal(source.includes("ConfidenceBadge"), false);
    assert.ok(source.includes("High source support"));
    assert.ok(source.includes("Moderate source support"));
    assert.ok(source.includes("Low source support"));
    assert.match(
      source,
      /Confidence (?:describes|reflects) source quality and consistency, not scientific truth\./,
    );
  });

  await suite.test("keeps the clarity-first headings visible", () => {
    const source = componentSource();

    assert.ok(source.includes("Your Core Pattern"));
    assert.ok(source.includes("The Main Contradiction"));
    assert.ok(source.includes("What To Do With It"));
  });

  await suite.test("preserves unavailable and missing-data visibility", () => {
    const source = componentSource();

    assert.ok(source.includes("depth-guide-layer-unavailable"));
    assert.match(source, /This layer (?:remains|stays) visible/);
    assert.ok(source.includes("Missing data"));
    assert.ok(source.includes("model.missingData"));
  });
});
