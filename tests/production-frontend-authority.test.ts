import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = readFileSync("package.json", "utf8");
const vite = readFileSync("vite.config.ts", "utf8");
const app = readFileSync("client/src/App.tsx", "utf8");

test("production frontend authority is the Vite client tree", () => {
  assert.match(packageJson, /"build": "vite build/);
  assert.match(vite, /root:\s*path\.resolve\(import\.meta\.dirname, "client"\)/);
  assert.match(vite, /"@": path\.resolve\(import\.meta\.dirname, "client", "src"\)/);
  assert.match(app, /<Route path="\/create" component=\{LocalFirstInputForm\}/);
  assert.match(app, /<Route path="\/start" component=\{LocalFirstInputForm\}/);
});

test("production route graph cannot import the legacy Next onboarding tree", () => {
  assert.doesNotMatch(app, /src\/app|app\/onboarding|soul-archetype/);
  assert.doesNotMatch(vite, /src\/app|next\/|next\.config/);
  assert.doesNotMatch(packageJson, /"build"\s*:\s*"[^"]*next build/);
});
