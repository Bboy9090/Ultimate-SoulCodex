import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync("client/src/App.tsx", "utf8");
const people = readFileSync("client/src/pages/ConnectionsPage.tsx", "utf8");

test("People route does not load the native contacts bridge during initial route render", () => {
  assert.doesNotMatch(people, /^import\s+\{[^}]*pickConnectionContacts[^}]*\}\s+from\s+["']@\/lib\/deviceContactPicker["']/m);
  assert.match(people, /await import\("@\/lib\/deviceContactPicker"\)/);
});

test("lazy routes have a bounded loading failure instead of an endless Opening screen", () => {
  assert.match(app, /route_chunk_timeout/);
  assert.match(app, /12000/);
  assert.match(app, /RouteErrorBoundary/);
  assert.match(app, /Retry this section/);
  assert.match(app, /lazyRoute\(\(\) => import\("\.\/pages\/ConnectionsPage"\), "people"\)/);
});


test("People route is proactively preloaded during idle time without preloading contacts", () => {
  assert.match(app, /requestIdleCallback/);
  assert.match(app, /import\("\.\/pages\/ConnectionsPage"\)/);
  assert.match(app, /route-preload/);
  assert.doesNotMatch(app, /deviceContactPicker/);
});
