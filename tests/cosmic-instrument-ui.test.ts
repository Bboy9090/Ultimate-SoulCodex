import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const atmosphere = new URL("../client/src/components/CosmicAtmosphere.tsx", import.meta.url);
const app = new URL("../client/src/App.tsx", import.meta.url);
const styles = new URL("../client/src/index.css", import.meta.url);

test("app mounts the decorative atmosphere once outside routed content", async () => {
  const source = await readFile(app, "utf8");
  assert.match(source, /<CosmicAtmosphere\s*\/>/);
  assert.match(source, /sc-cosmic-content/);
  assert.match(source, /<Router\s*\/>/);
});

test("parallax requires fine pointer, allows reduced motion and stops hidden rendering", async () => {
  const source = await readFile(atmosphere, "utf8");
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /hover: hover\) and \(pointer: fine/);
  assert.match(source, /saveData/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /cancelAnimationFrame/);
  assert.match(source, /removeEventListener\("pointermove"/);
  assert.match(source, /aria-hidden="true"/);
  assert.doesNotMatch(source, /geolocation|DeviceOrientationEvent|fetch\(/);
});

test("cosmic styling keeps controls accessible and layers noninteractive", async () => {
  const css = await readFile(styles, "utf8");
  assert.match(css, /\.sc-cosmic-atmosphere\s*\{/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /prefers-contrast: more/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /focus-visible/);
  assert.match(css, /max-width: 767px/);
});
