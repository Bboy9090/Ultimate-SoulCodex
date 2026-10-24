import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const viteConfig = readFileSync("vite.config.ts", "utf8");

test("keeps heavy shared client dependencies out of route chunks", () => {
  assert.match(viteConfig, /@tanstack\/react-query/);
  assert.match(viteConfig, /return "vendor-data"/);
  assert.match(viteConfig, /\/recharts\//);
  assert.match(viteConfig, /\/victory-vendor\//);
  assert.match(viteConfig, /\/d3-/);
  assert.match(viteConfig, /return "vendor-charts"/);
});
