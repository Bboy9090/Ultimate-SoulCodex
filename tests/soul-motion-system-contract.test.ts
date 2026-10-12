import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
const motion = readFileSync(new URL("../client/src/components/SoulMotion.tsx", import.meta.url), "utf8");
const button = readFileSync(new URL("../client/src/components/ScButton.tsx", import.meta.url), "utf8");
const aureon = readFileSync(new URL("../client/src/components/AureonAvatar.tsx", import.meta.url), "utf8");
const aureonCss = readFileSync(new URL("../client/src/components/AureonAvatar.css", import.meta.url), "utf8");
const natal = readFileSync(new URL("../client/src/components/VerifiedNatalChart.tsx", import.meta.url), "utf8");
const compatibility = readFileSync(new URL("../client/src/pages/CompatibilityPersonPage.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../client/src/pages/home.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

test("motion system keeps user reduced-motion preference authoritative", () => {
  assert.match(app, /<MotionConfig reducedMotion="user">/);
  assert.match(motion, /useReducedMotion\(\)/);
  assert.match(button, /useReducedMotion\(\)/);
  assert.match(aureon, /useReducedMotion\(\)/);
  assert.match(aureonCss, /prefers-reduced-motion: reduce/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("shared motion primitives provide reveal, stagger, and interactive behavior", () => {
  assert.match(motion, /SoulReveal/);
  assert.match(motion, /SoulStagger/);
  assert.match(motion, /SoulStaggerItem/);
  assert.match(motion, /SoulInteractive/);
  assert.match(motion, /whileInView="visible"/);
  assert.match(motion, /whileTap/);
  assert.match(home, /SoulReveal/);
  assert.match(home, /SoulStagger/);
  assert.match(home, /SoulInteractive/);
});

test("Aureon responds to the active experience rather than staying static", () => {
  assert.match(aureon, /"observing" \| "explaining" \| "comparing" \| "confirming"/);
  assert.match(natal, /AureonAvatar state=\{selection \? "explaining" : "observing"\}/);
  assert.match(compatibility, /AureonAvatar state="comparing"/);
});

test("button motion remains tap-driven and haptic while honoring reduced motion", () => {
  assert.match(button, /triggerHapticFeedback\(\)/);
  assert.match(button, /whileTap=\{!reducedMotion/);
  assert.match(button, /whileHover=\{!reducedMotion/);
});
