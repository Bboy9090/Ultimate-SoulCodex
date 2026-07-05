#!/usr/bin/env node
/**
 * Soul Codex — App Icon & Splash Generator
 *
 * Usage:
 *   node scripts/generate-icons.mjs [source-icon-path]
 *
 * Defaults to assets/icon-master.png (1024x1024, square, no rounded corners).
 * Generates all sizes for: iOS, Android (adaptive), PWA, and favicon.
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const SOURCE = process.argv[2] || "assets/icon-master.png";

if (!fs.existsSync(SOURCE)) {
  console.error(`\n  Source icon not found: ${SOURCE}`);
  console.error(`  Place a 1024x1024 PNG at assets/icon-master.png and re-run.\n`);
  process.exit(1);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function resize(src, outPath, size) {
  await sharp(src)
    .resize(size, size, { fit: "cover", position: "center" })
    .png()
    .toFile(outPath);
  console.log(`  ${size}x${size}  →  ${outPath}`);
}

async function main() {
  const meta = await sharp(SOURCE).metadata();
  console.log(`\nSource: ${SOURCE} (${meta.width}x${meta.height})`);
  if (meta.width < 1024 || meta.height < 1024) {
    console.warn("  ⚠ Source is smaller than 1024x1024 — icons may look blurry.");
  }

  // ── iOS App Icons ──
  console.log("\n── iOS Icons ──");
  const iosDir = "ios/App/App/Assets.xcassets/AppIcon.appiconset";
  ensureDir(iosDir);

  const iosSizes = [
    { name: "icon-20x20@1x.png", size: 20 },
    { name: "icon-20x20@2x.png", size: 40 },
    { name: "icon-20x20@3x.png", size: 60 },
    { name: "icon-29x29@1x.png", size: 29 },
    { name: "icon-29x29@2x.png", size: 58 },
    { name: "icon-29x29@3x.png", size: 87 },
    { name: "icon-40x40@1x.png", size: 40 },
    { name: "icon-40x40@2x.png", size: 80 },
    { name: "icon-40x40@3x.png", size: 120 },
    { name: "icon-60x60@2x.png", size: 120 },
    { name: "icon-60x60@3x.png", size: 180 },
    { name: "icon-76x76@1x.png", size: 76 },
    { name: "icon-76x76@2x.png", size: 152 },
    { name: "icon-83.5x83.5@2x.png", size: 167 },
    { name: "icon-1024x1024@1x.png", size: 1024 },
  ];

  for (const icon of iosSizes) {
    await resize(SOURCE, path.join(iosDir, icon.name), icon.size);
  }

  // ── Android Adaptive Icons ──
  console.log("\n── Android Icons ──");
  const androidDensities = [
    { folder: "mipmap-mdpi", size: 48, fgSize: 108 },
    { folder: "mipmap-hdpi", size: 72, fgSize: 162 },
    { folder: "mipmap-xhdpi", size: 96, fgSize: 216 },
    { folder: "mipmap-xxhdpi", size: 144, fgSize: 324 },
    { folder: "mipmap-xxxhdpi", size: 192, fgSize: 432 },
  ];

  for (const d of androidDensities) {
    const dir = `android/app/src/main/res/${d.folder}`;
    ensureDir(dir);

    // Standard icon
    await resize(SOURCE, path.join(dir, "ic_launcher.png"), d.size);

    // Round icon
    const roundBuf = await sharp(SOURCE)
      .resize(d.size, d.size, { fit: "cover" })
      .png()
      .toBuffer();
    const mask = Buffer.from(
      `<svg width="${d.size}" height="${d.size}"><circle cx="${d.size / 2}" cy="${d.size / 2}" r="${d.size / 2}" fill="white"/></svg>`
    );
    await sharp(roundBuf)
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toFile(path.join(dir, "ic_launcher_round.png"));
    console.log(`  ${d.size}x${d.size} round  →  ${dir}/ic_launcher_round.png`);

    // Adaptive foreground (icon centered in 108dp safe zone)
    const fg = await sharp(SOURCE)
      .resize(Math.round(d.fgSize * 0.65), Math.round(d.fgSize * 0.65), { fit: "cover" })
      .png()
      .toBuffer();
    const padding = Math.round((d.fgSize - Math.round(d.fgSize * 0.65)) / 2);
    await sharp({
      create: { width: d.fgSize, height: d.fgSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: fg, left: padding, top: padding }])
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"));
    console.log(`  ${d.fgSize}x${d.fgSize} fg  →  ${dir}/ic_launcher_foreground.png`);
  }

  // Android adaptive icon XML
  const adaptiveDir = "android/app/src/main/res/mipmap-anydpi-v26";
  ensureDir(adaptiveDir);

  fs.writeFileSync(
    path.join(adaptiveDir, "ic_launcher.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
  );
  fs.writeFileSync(
    path.join(adaptiveDir, "ic_launcher_round.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
  );

  // Background color resource
  const valuesDir = "android/app/src/main/res/values";
  ensureDir(valuesDir);
  const colorsPath = path.join(valuesDir, "ic_launcher_background.xml");
  if (!fs.existsSync(colorsPath)) {
    fs.writeFileSync(
      colorsPath,
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B0720</color>
</resources>
`
    );
    console.log(`  Created ${colorsPath}`);
  }

  // ── PWA Icons ──
  console.log("\n── PWA Icons ──");
  ensureDir("public/icons");
  const pwaSizes = [
    { name: "public/favicon.png", size: 64 },
    { name: "public/icon-192.png", size: 192 },
    { name: "public/icon-512.png", size: 512 },
    { name: "public/icons/icon-180x180.png", size: 180 },
    { name: "public/icons/icon-192x192.png", size: 192 },
    { name: "public/icons/icon-512x512.png", size: 512 },
  ];
  for (const icon of pwaSizes) {
    await resize(SOURCE, icon.name, icon.size);
  }

  // ── Capacitor assets directory ──
  console.log("\n── Capacitor Assets ──");
  ensureDir("assets");
  await resize(SOURCE, "assets/icon.png", 1024);

  // ── Google Play Store (512x512) ──
  console.log("\n── Store Assets ──");
  ensureDir("store-assets");
  await resize(SOURCE, "store-assets/play-store-icon-512.png", 512);
  await resize(SOURCE, "store-assets/app-store-icon-1024.png", 1024);

  console.log("\n✓ All icons generated.\n");
  console.log("Next steps:");
  console.log("  1. Review the icons visually");
  console.log("  2. npx cap sync        — sync web build to native projects");
  console.log("  3. npx cap open ios    — open Xcode");
  console.log("  4. npx cap open android — open Android Studio\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
