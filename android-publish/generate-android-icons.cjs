const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SOURCE_SVG = path.join(__dirname, "..", "client", "public", "soul-codex-logo.svg");
const OUTPUT_DIR = path.join(__dirname, "icons");
const ANDROID_DIR = path.join(__dirname, "android-assets");

// Android launcher icon densities (square + round + adaptive foreground)
const ANDROID_DENSITIES = [
  { folder: "mipmap-mdpi",    px: 48 },
  { folder: "mipmap-hdpi",    px: 72 },
  { folder: "mipmap-xhdpi",   px: 96 },
  { folder: "mipmap-xxhdpi",  px: 144 },
  { folder: "mipmap-xxxhdpi", px: 192 },
];

// Adaptive icon foreground must be 108dp; safe zone is 72dp (centered).
// Native size = density * 108
const ADAPTIVE_FG = [
  { folder: "mipmap-mdpi",    px: 108 },
  { folder: "mipmap-hdpi",    px: 162 },
  { folder: "mipmap-xhdpi",   px: 216 },
  { folder: "mipmap-xxhdpi",  px: 324 },
  { folder: "mipmap-xxxhdpi", px: 432 },
];

// Play Store listing assets
const PLAY_STORE_ASSETS = [
  { name: "play-store-icon-512.png",      width: 512,  height: 512  },
  { name: "play-store-feature-graphic.png", width: 1024, height: 500 },
];

async function generateIcons() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(ANDROID_DIR, { recursive: true });

  const svgBuffer = fs.readFileSync(SOURCE_SVG);
  const svgWithBackground = Buffer.from(
    svgBuffer
      .toString()
      .replace(
        '<svg width="512" height="512"',
        '<svg width="512" height="512" style="background:#1A0E07"'
      )
  );

  // ── Square + round launcher icons (legacy, pre-Android 8) ────────────────
  for (const { folder, px } of ANDROID_DENSITIES) {
    const dir = path.join(ANDROID_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });

    await sharp(svgWithBackground, { density: 300 })
      .resize(px, px, { fit: "cover", background: { r: 26, g: 14, b: 7, alpha: 1 } })
      .flatten({ background: { r: 26, g: 14, b: 7 } })
      .png({ quality: 100 })
      .toFile(path.join(dir, "ic_launcher.png"));

    // Round variant: same source, but Android masks it. We provide the same square; the mask handles shape.
    fs.copyFileSync(
      path.join(dir, "ic_launcher.png"),
      path.join(dir, "ic_launcher_round.png")
    );

    console.log(`  ✓ ${folder}/ic_launcher.png (${px}x${px}px)`);
  }

  // ── Adaptive icon foreground (Android 8+) ────────────────────────────────
  // Render at ~67% scale so the logo lives inside the 72dp safe zone.
  for (const { folder, px } of ADAPTIVE_FG) {
    const dir = path.join(ANDROID_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });

    const safe = Math.round(px * (72 / 108)); // safe zone scale

    const fg = await sharp(svgBuffer, { density: 300 })
      .resize(safe, safe, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 100 })
      .toBuffer();

    await sharp({
      create: {
        width: px,
        height: px,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: fg, gravity: "center" }])
      .png({ quality: 100 })
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    console.log(`  ✓ ${folder}/ic_launcher_foreground.png (${px}x${px}px)`);
  }

  // ── Adaptive icon XML (mipmap-anydpi-v26) ────────────────────────────────
  const anydpiDir = path.join(ANDROID_DIR, "mipmap-anydpi-v26");
  fs.mkdirSync(anydpiDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, "ic_launcher.xml"), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, "ic_launcher_round.xml"), adaptiveXml);

  // Background color resource
  const valuesDir = path.join(ANDROID_DIR, "values");
  fs.mkdirSync(valuesDir, { recursive: true });
  fs.writeFileSync(
    path.join(valuesDir, "ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1A0E07</color>
</resources>
`
  );

  console.log(`  ✓ mipmap-anydpi-v26/ic_launcher.xml`);
  console.log(`  ✓ values/ic_launcher_background.xml`);

  // ── Play Store listing assets ────────────────────────────────────────────
  for (const { name, width, height } of PLAY_STORE_ASSETS) {
    const isFeature = width !== height;
    const out = path.join(OUTPUT_DIR, name);

    if (isFeature) {
      // Feature graphic: logo centered on dark gradient background
      const logoSize = Math.round(height * 0.7);
      const logo = await sharp(svgBuffer, { density: 300 })
        .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      await sharp({
        create: {
          width, height, channels: 4,
          background: { r: 26, g: 14, b: 7, alpha: 1 },
        },
      })
        .composite([{ input: logo, gravity: "center" }])
        .png({ quality: 100 })
        .toFile(out);
    } else {
      await sharp(svgWithBackground, { density: 300 })
        .resize(width, height, { fit: "cover", background: { r: 26, g: 14, b: 7, alpha: 1 } })
        .flatten({ background: { r: 26, g: 14, b: 7 } })
        .png({ quality: 100 })
        .toFile(out);
    }
    console.log(`  ✓ ${name} (${width}x${height}px)`);
  }

  console.log(`\n✅ Android icons generated`);
  console.log(`📁 Play Store assets:  ${OUTPUT_DIR}`);
  console.log(`📁 Android resources:  ${ANDROID_DIR}`);
  console.log(`\nAfter \`npx cap add android\`, copy android-assets/* into:`);
  console.log(`  android/app/src/main/res/`);
}

generateIcons().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
