#!/usr/bin/env node
/**
 * Canonical Gate 3 Regression Test Runner
 *
 * Executes server/tests/gate3-silent-upgrades.test.ts with proper ESM/CJS compatibility
 *
 * Usage: node scripts/run-gate3-tests.mjs
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Run test with tsx (TypeScript executor with proper ESM support)
const child = spawn("node", [
  "--import", "tsx",
  "--test",
  "server/tests/gate3-silent-upgrades.test.ts",
], {
  cwd: rootDir,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: "--experimental-loader=tsx",
  },
});

child.on("exit", (code) => {
  process.exit(code);
});

child.on("error", (err) => {
  console.error("Failed to start test runner:", err);
  process.exit(1);
});
