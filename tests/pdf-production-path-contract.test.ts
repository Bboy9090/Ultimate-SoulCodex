import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url);
const serverRoutes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const serverIndex = readFileSync(new URL("../server/index.ts", import.meta.url), "utf8");
const button = readFileSync(new URL("../client/src/components/NatalReportDownloadButton.tsx", import.meta.url), "utf8");
const truthAdapter = readFileSync(new URL("../server/lib/natal-report-contract.ts", import.meta.url), "utf8");
const elegantRenderer = readFileSync(new URL("../server/natalReportPdf.ts", import.meta.url), "utf8");

function filesUnder(relative: string): string[] {
  const start = new URL(`../${relative}`, import.meta.url);
  const startPath = start.pathname;
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const full = join(directory, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry)) files.push(full);
    }
  };
  walk(startPath);
  return files;
}

test("production PDF route uses the truth adapter and elegant PDFKit renderer", () => {
  assert.match(serverRoutes, /\/api\/pdf\/profile\/:id/);
  assert.match(serverRoutes, /buildNatalReportInput/);
  assert.match(serverRoutes, /buildNatalReportPdf/);
  assert.match(truthAdapter, /verificationStatus === "verified"/);
  assert.match(truthAdapter, /houses:\s*\[\]/);
  assert.match(truthAdapter, /aspects:\s*\[\]/);
  assert.match(elegantRenderer, /PREMIUM_THEME/);
  assert.match(elegantRenderer, /drawNatalWheel/);
});

test("client verifies MIME type and PDF signature before download", () => {
  assert.match(button, /\/api\/pdf\/profile\//);
  assert.match(button, /application\/pdf/);
  assert.match(button, /signature !== "%PDF"/);
  assert.match(button, /Download natal chart PDF/);
});

test("production server and client do not import legacy template PDF generators", () => {
  const forbidden = [
    "services/pdf-generator",
    "packages/astrology/pdf-generator",
  ];

  for (const file of [...filesUnder("server"), ...filesUnder("client/src")]) {
    const source = readFileSync(file, "utf8");
    for (const path of forbidden) {
      assert.equal(source.includes(path), false, `${file} must not import ${path}`);
    }
  }

  // The production entry point is server/index.ts -> server/routes.ts. The old
  // repository-root routes.ts may remain as legacy source while retirement is
  // completed, but it is not allowed to become the production entry point.
  assert.match(serverIndex, /from "\.\/routes\.js"/);
  assert.doesNotMatch(serverIndex, /\.\.\/routes\.js/);
});

test("verified evidence is separated from symbolic narrative in the PDF adapter", () => {
  assert.match(truthAdapter, /deterministic numerology calculation/);
  assert.match(truthAdapter, /symbolic interpretation/);
  assert.match(truthAdapter, /Human Design is not independently verified/);
  assert.match(truthAdapter, /House emphasis, Midheaven, nodes, Chiron/);
});
