import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync("client/src/App.tsx", "utf8");

test("lazy routes retain a bounded timeout and error recovery", () => {
  assert.match(app, /route_chunk_timeout:\$\{label\}/);
  assert.match(app, /12000/);
  assert.match(app, /<RouteErrorBoundary key=\{pathname\}>/);
  assert.match(app, /Retry this section/);
});

test("slow route loading communicates delay and offers accessible recovery", () => {
  assert.match(app, /setTimeout\(\(\) => setSlow\(true\), 3500\)/);
  assert.match(app, /Still opening\. Your connection may be slow\./);
  assert.match(app, /Retry loading/);
  assert.match(app, /Back home/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /clearTimeout\(handle\)/);
});

test("idle preload includes People and Tools without eagerly importing either", () => {
  assert.match(app, /void import\("\.\/pages\/ConnectionsPage"\)/);
  assert.match(app, /void import\("\.\/pages\/CodexToolsPage"\)/);
  assert.match(app, /requestIdleCallback\(preloadPrimaryRoutes/);
  assert.match(app, /window\.setTimeout\(preloadPrimaryRoutes, 1200\)/);
});
