#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.resolve(process.cwd(), "dist/public");

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const manifestPath = path.join(OUTPUT_DIR, "manifest.webmanifest");
  const serviceWorkerPath = path.join(OUTPUT_DIR, "sw.js");

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  requireValue(manifest.name === "Ultimate SoulCodex", "PWA manifest name is incorrect");
  requireValue(manifest.short_name === "SoulCodex", "PWA manifest short_name is incorrect");
  requireValue(manifest.display === "standalone", "PWA manifest must use standalone display");
  requireValue(typeof manifest.start_url === "string", "PWA manifest start_url is missing");
  requireValue(typeof manifest.scope === "string", "PWA manifest scope is missing");

  const iconSizes = new Set((manifest.icons ?? []).map((icon) => icon.sizes));
  requireValue(iconSizes.has("192x192"), "PWA manifest is missing the 192x192 icon");
  requireValue(iconSizes.has("512x512"), "PWA manifest is missing the 512x512 icon");

  const serviceWorker = await readFile(serviceWorkerPath, "utf8");
  new Function(serviceWorker);

  for (const required of [
    "soulcodex-shell-",
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
  ]) {
    requireValue(serviceWorker.includes(required), `Generated service worker is missing ${required}`);
  }

  const precacheMatch = serviceWorker.match(/const PRECACHE_PATHS = (\[[\s\S]*?\]);/);
  requireValue(precacheMatch, "Generated service worker does not expose a parseable precache list");
  const precachePaths = JSON.parse(precacheMatch[1]);
  requireValue(precachePaths.includes("./index.html"), "index.html is not precached");
  requireValue(precachePaths.includes("./manifest.webmanifest"), "manifest.webmanifest is not precached");
  requireValue(
    !precachePaths.some((entry) => entry === "./api" || entry.startsWith("./api/")),
    "API routes must never be included in the PWA precache",
  );
  requireValue(
    precachePaths.some((entry) => entry.startsWith("./assets/") && entry.endsWith(".js")),
    "No built JavaScript asset was added to the PWA precache",
  );
  requireValue(
    precachePaths.some((entry) => entry.startsWith("./assets/") && entry.endsWith(".css")),
    "No built stylesheet was added to the PWA precache",
  );

  console.log(`Validated PWA manifest and ${precachePaths.length} service-worker precache entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
