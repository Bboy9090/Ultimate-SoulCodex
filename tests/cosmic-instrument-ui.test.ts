import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const atmosphere = new URL("../client/src/components/CosmicAtmosphere.tsx", import.meta.url);
const app = new URL("../client/src/App.tsx", import.meta.url);
const styles = new URL("../client/src/index.css", import.meta.url);
const settings = new URL("../client/src/pages/SettingsPage.tsx", import.meta.url);
const preference = new URL("../client/src/lib/cosmicMotionPreference.ts", import.meta.url);
const orbit = new URL("../client/src/components/CosmicComparisonOrbit.tsx", import.meta.url);
const comparison = new URL("../client/src/pages/CompatibilityPersonPage.tsx", import.meta.url);

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

test("device motion choices have local persistence, accessible controls and system safeguards", async () => {
  const [settingsSource, prefsSource, atmosphereSource, css, appSource] = await Promise.all([
    readFile(settings, "utf8"), readFile(preference, "utf8"),
    readFile(atmosphere, "utf8"), readFile(styles, "utf8"), readFile(app, "utf8"),
  ]);
  assert.match(settingsSource, /role="radiogroup" aria-label="Celestial motion intensity"/);
  assert.match(settingsSource, /aria-checked={cosmicMotion === level}/);
  assert.match(settingsSource, /writeCosmicMotion\(value\)/);
  assert.match(prefsSource, /soulcodex\.cosmic-motion\.v1/);
  assert.match(prefsSource, /localStorage\.setItem/);
  assert.match(atmosphereSource, /readCosmicMotion\(\) !== "full"/);
  assert.match(css, /data-cosmic-motion="still"/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(appSource, /className="sc-cosmic-route"/);
  assert.match(appSource, /id="main-content" tabIndex=\{-1\}/);
});

test("interactive shared orbit is evidence-bounded and keyboard accessible", async () => {
  const [orbitSource, compareSource, css] = await Promise.all([
    readFile(orbit, "utf8"), readFile(comparison, "utf8"), readFile(styles, "utf8"),
  ]);
  assert.match(compareSource, /<CosmicComparisonOrbit pairs={placementComparisons\.map/);
  assert.match(orbitSource, /aria-pressed={active\.key === pair\.key}/);
  assert.match(orbitSource, /type="button"/);
  assert.match(orbitSource, /aria-live="polite"/);
  assert.match(orbitSource, /NOT astronomical longitudes or aspects/);
  assert.match(orbitSource, /supported = pairs\.filter/);
  assert.doesNotMatch(orbitSource, /Math\.random|Date\.now|fetch\(/);
  assert.match(css, /\.sc-orbit-body:focus-visible/);
  assert.match(orbitSource, /sc-orbit-mobile-picker/);
  assert.match(orbitSource, /sc-orbit-mobile-option/);
  assert.match(css, /@media \(max-width: 639px\)/);
  assert.match(css, /\.sc-orbit-mobile-option\[aria-pressed="true"\]/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /\.sc-orbit-stage \{ display: none; \}/);
  assert.match(css, /data-cosmic-motion="still"/);
});
