#!/usr/bin/env node
/**
 * Soul Codex — Splash Screen Generator
 *
 * Usage:
 *   node scripts/generate-splash.mjs [source-icon-path]
 *
 * Creates centered-logo splash screens for iOS and Android
 * on the Soul Codex deep void background (#0B0720).
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const SOURCE = process.argv[2] || "assets/icon-master.png";
const BG = { r: 11, g: 7, b: 32, alpha: 255 };

if (!fs.existsSync(SOURCE)) {
  console.error(`\n  Source icon not found: ${SOURCE}`);
  console.error(`  Place a 1024x1024 PNG at assets/icon-master.png and re-run.\n`);
  process.exit(1);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function createSplash(outPath, width, height, logoSize) {
  const logo = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const left = Math.round((width - logoSize) / 2);
  const top = Math.round((height - logoSize) / 2);

  await sharp({ create: { width, height, channels: 4, background: BG } })
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);

  console.log(`  ${width}x${height}  →  ${outPath}`);
}

async function main() {
  console.log("\n── Splash Screens ──\n");

  // iOS splash screens
  const iosSplashDir = "ios/App/App/Assets.xcassets/Splash.imageset";
  ensureDir(iosSplashDir);

  await createSplash(path.join(iosSplashDir, "splash.png"), 2732, 2732, 400);
  await createSplash(path.join(iosSplashDir, "splash-dark.png"), 2732, 2732, 400);

  // Capacitor assets
  ensureDir("assets");
  await createSplash("assets/splash.png", 2732, 2732, 400);
  await createSplash("assets/splash-dark.png", 2732, 2732, 400);

  // Android splash
  const androidDrawable = "android/app/src/main/res/drawable";
  ensureDir(androidDrawable);
  await createSplash(path.join(androidDrawable, "splash.png"), 1920, 1920, 360);

  // PWA / web splash
  await createSplash("public/splash-screen.png", 1242, 2688, 280);

  console.log("\n✓ All splash screens generated.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
