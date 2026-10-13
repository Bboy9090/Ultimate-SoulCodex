import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const app = readFileSync("client/src/App.tsx", "utf8");
const routePatterns = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);

function matchesRoute(href: string) {
  const path = href.split(/[?#]/, 1)[0];
  return routePatterns.some((pattern) => {
    if (!pattern.includes(":")) return path === pattern || path.startsWith(pattern + "/");
    const prefix = pattern.slice(0, pattern.indexOf(":"));
    return path.startsWith(prefix) && path.length > prefix.length;
  });
}

test("literal internal links across the client resolve to declared application routes", () => {
  const failures: Array<{ file: string; href: string }> = [];
  for (const file of walk("client/src").filter((path) => /\.tsx?$/.test(path))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/\bhref=(?:"([^"]+)"|'([^']+)')/g)) {
      const href = match[1] ?? match[2] ?? "";
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      if (!matchesRoute(href)) failures.push({ file, href });
    }
  }
  assert.deepEqual(failures, []);
});
