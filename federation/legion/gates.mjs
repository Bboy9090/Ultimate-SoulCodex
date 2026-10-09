#!/usr/bin/env node
// Soul Codex verification gates — the Legion federation's final gate.
//
// Runs, on the current checkout:
//   1. every *.test.ts / *.test.tsx file in tests/, packages/, server/, client/ and src/
//      (one process per file)
//   2. the root TypeScript check (npm run check)
//   3. the verified-profile differentiation audit (96 profiles)
//   4. the profile differentiation audit
//   5. the Human Design differential audit against the pinned independent verifier
//   6. the strict golden astrology fixture validator (Astro-Databank rated charts)
//
// Exit code 0 only when every gate that ran passed. Tests that need infrastructure this
// machine does not have (a Postgres DATABASE_URL) are reported as SKIPPED, never as passed.
//
// Usage: node federation/legion/gates.mjs [--json receipt.json] [--jobs N] [--only tests|check|audits]

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const JSON_OUT = opt("--json", null);
const JOBS = Number(opt("--jobs", process.env.GATE_JOBS ?? "4"));
const ONLY = opt("--only", "all");
const FILE_TIMEOUT_MS = Number(process.env.GATE_FILE_TIMEOUT_MS ?? 300_000);

// Tests that require a live Postgres database (see their own setup code).
const NEEDS_DATABASE = new Set([
  "tests/active-consumer-auth-postgres.test.ts",
  "tests/gate4-production-deletion.test.ts",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".test.ts") || name.endsWith(".test.tsx")) out.push(relative(ROOT, full));
  }
  return out;
}

function run(cmd, argv, timeoutMs) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, argv, { cwd: ROOT, env: { ...process.env, CI: "true" } });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    const timer = setTimeout(() => {
      output += `\n[gates] timed out after ${timeoutMs} ms`;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? (signal ? 124 : 1), output, ms: Date.now() - started });
    });
  });
}

function tapCounts(output) {
  const pass = Number(/^# pass (\d+)/m.exec(output)?.[1] ?? 0);
  const fail = Number(/^# fail (\d+)/m.exec(output)?.[1] ?? 0);
  return { pass, fail };
}

function failureDigest(output) {
  const lines = output.split("\n");
  const picked = [];
  for (let i = 0; i < lines.length && picked.length < 12; i += 1) {
    const line = lines[i];
    if (/^\s*not ok \d+ - /.test(line) && !/ - (tests|packages|server)\//.test(line)) picked.push(line.trim());
    else if (/Cannot find (module|package)/.test(line)) picked.push(line.trim().slice(0, 240));
  }
  return picked;
}

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, size) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

const gates = [];

if (ONLY === "all" || ONLY === "tests") {
  const roots = ["tests", "packages", "server", "client", "src"].filter((d) => existsSync(join(ROOT, d)));
  const files = roots.flatMap((d) => walk(join(ROOT, d)))
    .filter((f) => !f.includes("/fixtures/"))
    .sort();
  const results = await pool(
    files,
    async (file) => {
      if (NEEDS_DATABASE.has(file) && !process.env.DATABASE_URL) {
        return { gate: file, kind: "test", status: "SKIPPED", reason: "needs DATABASE_URL (Postgres)" };
      }
      const r = await run(process.execPath, ["--import", "tsx", "--test", file], FILE_TIMEOUT_MS);
      const counts = tapCounts(r.output);
      return {
        gate: file,
        kind: "test",
        status: r.code === 0 ? "PASS" : "FAIL",
        exit: r.code,
        ...counts,
        ms: r.ms,
        failures: r.code === 0 ? [] : failureDigest(r.output),
      };
    },
    JOBS,
  );
  gates.push(...results);
}

if (ONLY === "all" || ONLY === "check") {
  const r = await run("npm", ["run", "--silent", "check"], 900_000);
  const errors = (r.output.match(/error TS\d+/g) ?? []).length;
  gates.push({ gate: "npm run check (tsc)", kind: "check", status: r.code === 0 ? "PASS" : "FAIL", exit: r.code,
    errors, ms: r.ms, failures: r.code === 0 ? [] : r.output.split("\n").filter((l) => l.includes("error TS")).slice(0, 12) });
}

if (ONLY === "all" || ONLY === "audits") {
  const scratch = mkdtempSync(join(tmpdir(), "soulcodex-gates-"));
  const audits = [
    ["verified-profile-differentiation", "scripts/audit-verified-profile-differentiation.ts"],
    ["profile-differentiation", "scripts/audit-profile-differentiation.ts"],
    ["human-design-differential", "scripts/audit-human-design-differential.ts"],
    ["golden-astrology-fixtures", "scripts/validate-astrology-fixtures.ts"],
  ];
  for (const [name, script] of audits) {
    const receipt = join(scratch, `${name}.json`);
    const r = await run(process.execPath, ["--import", "tsx", script, receipt], 900_000);
    let metrics = null;
    const jsonStart = r.output.indexOf("{");
    if (jsonStart >= 0) {
      try { metrics = JSON.parse(r.output.slice(jsonStart)); } catch { metrics = null; }
    }
    const missingVerifier = /Cannot find module 'free-human-design'/.test(r.output);
    gates.push({
      gate: `audit: ${name}`,
      kind: "audit",
      status: r.code === 0 ? "PASS" : "FAIL",
      exit: r.code,
      ms: r.ms,
      metrics,
      failures: r.code === 0 ? [] : missingVerifier
        ? ["independent verifier not installed: npm install --no-save --ignore-scripts free-human-design@1.0.1"]
        : [r.output.trim().split("\n").slice(-6).join(" ").slice(0, 600)],
    });
  }
}

let sha = "unknown";
try { sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT }).toString().trim(); } catch {}
const ran = gates.filter((g) => g.status !== "SKIPPED");
const failed = ran.filter((g) => g.status === "FAIL");
const skipped = gates.filter((g) => g.status === "SKIPPED");
const receipt = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  commit: sha,
  note: "Results describe the working tree of this checkout at the time of the run.",
  totals: { gates: gates.length, passed: ran.length - failed.length, failed: failed.length, skipped: skipped.length },
  gates,
};
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(receipt, null, 2) + "\n");

console.log(`Soul Codex gates @ ${sha.slice(0, 12)}: ${receipt.totals.passed} passed, ${failed.length} failed, ` +
  `${skipped.length} skipped (of ${gates.length})`);
for (const g of failed) {
  console.log(`FAIL ${g.gate}${g.fail ? ` (${g.fail} failing)` : ""}`);
  for (const f of g.failures ?? []) console.log(`     ${f}`);
}
for (const g of skipped) console.log(`SKIP ${g.gate}: ${g.reason}`);
process.exitCode = failed.length ? 1 : 0;
