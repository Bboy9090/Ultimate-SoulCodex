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
const identity = readFileSync(new URL("../client/src/pages/profile.tsx", import.meta.url), "utf8");
const timeline = readFileSync(new URL("../client/src/pages/TimelinePage.tsx", import.meta.url), "utf8");
const connections = readFileSync(new URL("../client/src/pages/ConnectionsPage.tsx", import.meta.url), "utf8");

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
  assert.match(aureon, /"observing" \| "focusing" \| "explaining" \| "comparing" \| "confirming" \| "warning"/);
  assert.match(natal, /AureonAvatar state=\{selection \? "explaining" : "observing"\}/);
  assert.match(compatibility, /AureonAvatar state=\{selectedDimension \? "explaining" : "comparing"\}/);
  assert.match(compatibility, /const aureonState: AureonState/);
  assert.match(compatibility, /\? "warning"/);
  assert.match(compatibility, /\? "focusing"/);
  assert.match(compatibility, /\? "explaining"/);
  assert.match(compatibility, /\? "confirming"/);
});

test("button motion remains tap-driven and haptic while honoring reduced motion", () => {
  assert.match(button, /triggerHapticFeedback\(\)/);
  assert.match(button, /whileTap=\{!reducedMotion/);
  assert.match(button, /whileHover=\{!reducedMotion/);
});


test("Identity and Timeline adopt the shared interactive motion language", () => {
  assert.match(identity, /SoulReveal/);
  assert.match(identity, /SoulStagger/);
  assert.match(identity, /SoulInteractive/);
  assert.match(timeline, /SoulReveal/);
  assert.match(timeline, /SoulStagger/);
  assert.match(timeline, /SoulInteractive/);
});

test("Timeline influence exploration is tap-selectable and persists focus", () => {
  assert.match(timeline, /selectedInfluenceIndex/);
  assert.match(timeline, /aria-pressed=\{selectedInfluenceIndex === index\}/);
  assert.match(timeline, /setSelectedInfluenceIndex/);
  assert.match(timeline, /Focused influence/);
});


test("Compatibility dimensions and Connections adopt interactive motion", () => {
  assert.match(compatibility, /SoulStagger/);
  assert.match(compatibility, /SoulInteractive/);
  assert.match(compatibility, /selectedDimension/);
  assert.match(compatibility, /aria-pressed=\{selectedDimension === dimension.key\}/);
  assert.match(compatibility, /Focused relationship signal/);
  assert.match(connections, /SoulReveal/);
  assert.match(connections, /SoulStagger/);
  assert.match(connections, /SoulInteractive/);
  assert.match(connections, /role="list"/);
  assert.match(connections, /role="listitem"/);
});


test("Aureon actively reacts inside Identity and Timeline", () => {
  assert.match(identity, /activeIdentityLayer/);
  assert.match(identity, /const aureonIdentityState: AureonState/);
  assert.match(identity, /AureonAvatar state=\{aureonIdentityState\}/);
  assert.match(identity, /onToggle=\{\(event\) => setActiveIdentityLayer/);
  assert.match(identity, /\? "warning"/);
  assert.match(identity, /\? "explaining"/);
  assert.match(timeline, /const aureonTimelineState: AureonState/);
  assert.match(timeline, /AureonAvatar state=\{aureonTimelineState\}/);
  assert.match(timeline, /AureonAvatar state="warning" compact/);
  assert.match(timeline, /selectedInfluenceIndex !== null/);
});
