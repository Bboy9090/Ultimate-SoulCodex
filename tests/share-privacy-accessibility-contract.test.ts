import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const shareModalUrl = new URL("../client/src/components/ShareModal.tsx", import.meta.url);

test("share modal never publishes a raw private profile route", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /const shareUrl = window\.location\.origin;/);
  assert.doesNotMatch(source, /\/profile\/\$\{profileId\}/);
  assert.match(source, /Your saved profile remains private/);
  assert.match(source, /does not expose your profile ID, birth inputs, assessments, or verification data/);
});

test("share modal exposes accessible dialog semantics and guarded clipboard behavior", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby="share-soul-codex-title"/);
  assert.match(source, /aria-describedby="share-soul-codex-description"/);
  assert.match(source, /aria-label="Close share dialog"/);
  assert.match(source, /aria-label="Copy Soul Codex link"/);
  assert.match(source, /await navigator\.clipboard\.writeText\(shareUrl\)/);
  assert.match(source, /typeof navigator\.share === "function"/);
});


test("share dialog manages keyboard focus lifecycle", async () => {
  const source = await readFile(shareModalUrl, "utf8");

  assert.match(source, /closeButtonRef\.current\?\.focus\(\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /document\.removeEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /previouslyFocused\?\.focus\(\)/);
});
