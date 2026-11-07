import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));

test("Capacitor CLI is build tooling, not a production dependency", () => {
  assert.equal(packageJson.dependencies?.["@capacitor/cli"], undefined);
  assert.equal(packageJson.devDependencies?.["@capacitor/cli"], "8.6.0");

  const root = lock.packages?.[""];
  assert.equal(root?.dependencies?.["@capacitor/cli"], undefined);
  assert.equal(root?.devDependencies?.["@capacitor/cli"], "8.6.0");
  assert.equal(lock.packages?.["node_modules/@capacitor/cli"]?.dev, true);
});

test("Capacitor CLI cleanup toolchain is omitted from the production lock graph", () => {
  for (const path of [
    "node_modules/rimraf",
    "node_modules/glob",
    "node_modules/minimatch",
  ]) {
    assert.equal(lock.packages?.[path]?.dev, true, path);
  }
});
