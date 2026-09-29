import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const htmlUrl = new URL("../client/index.html", import.meta.url);
const appUrl = new URL("../client/src/App.tsx", import.meta.url);
const navUrl = new URL("../client/src/components/navigation.tsx", import.meta.url);
const sheetUrl = new URL("../client/src/components/ui/sheet.tsx", import.meta.url);
const checkboxUrl = new URL("../client/src/components/ui/checkbox.tsx", import.meta.url);
const cssUrl = new URL("../client/src/index.css", import.meta.url);

test("mobile viewport preserves zoom and safe-area support", async () => {
  const source = await readFile(htmlUrl, "utf8");
  assert.match(source, /width=device-width, initial-scale=1\.0, viewport-fit=cover/);
  assert.doesNotMatch(source, /maximum-scale/i);
  assert.doesNotMatch(source, /user-scalable=no/i);
});

test("boot and lazy-route states are announced and boot failure is recoverable", async () => {
  const [html, app] = await Promise.all([
    readFile(htmlUrl, "utf8"),
    readFile(appUrl, "utf8"),
  ]);

  assert.match(html, /id="soulcodex-boot-shell" role="status" aria-live="polite"/);
  assert.match(html, /role="alert" aria-live="assertive"/);
  assert.match(html, /id="soulcodex-boot-retry"/);
  assert.match(html, /min-height:44px/);
  assert.match(html, /window\.location\.reload\(\)/);

  assert.match(app, /role="status"/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /MotionConfig reducedMotion="user"/);
  assert.match(app, /href="#main-content"/);
  assert.match(app, /id="main-content" tabIndex=\{-1\}/);
});

test("navigation and shared close controls preserve touch-sized targets", async () => {
  const [nav, sheet, checkbox] = await Promise.all([
    readFile(navUrl, "utf8"),
    readFile(sheetUrl, "utf8"),
    readFile(checkboxUrl, "utf8"),
  ]);

  assert.match(nav, /group flex min-h-11 items-center/);
  assert.match(nav, /button-create-profile-nav[\s\S]*?h-11|h-11[\s\S]*?button-create-profile-nav/);
  assert.match(sheet, /h-11 w-11 place-items-center/);
  assert.match(nav, /pb-\[max\(1\.25rem,env\(safe-area-inset-bottom\)\)\]/);
  assert.match(nav, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(nav, /aria-current=\{isActive\(pathname, "\/systems"\) \? "page" : undefined\}/);
  assert.match(nav, /aria-current=\{isActive\(pathname, "\/settings"\) \? "page" : undefined\}/);
  assert.match(checkbox, /peer relative h-6 w-6/);
  assert.match(checkbox, /after:-inset-2\.5/);
});

test("global styles preserve text scaling and reduced-motion preferences", async () => {
  const css = await readFile(cssUrl, "utf8");

  assert.match(css, /-webkit-text-size-adjust:\s*100%/);
  assert.match(css, /text-size-adjust:\s*100%/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms !important/);
  assert.match(css, /transition-duration:\s*0\.01ms !important/);
});
