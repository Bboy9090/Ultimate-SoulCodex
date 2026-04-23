const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SOURCE_SVG = path.join(__dirname, "..", "client", "public", "soul-codex-logo.svg");
const OUTPUT_DIR = path.join(__dirname, "icons");
const XCODE_DIR = path.join(__dirname, "xcode-assets", "AppIcon.appiconset");

const IOS_ICON_SIZES = [
  { size: 20, scales: [2, 3], idiom: "iphone" },
  { size: 29, scales: [2, 3], idiom: "iphone" },
  { size: 40, scales: [2, 3], idiom: "iphone" },
  { size: 60, scales: [2, 3], idiom: "iphone" },
  { size: 20, scales: [1, 2], idiom: "ipad" },
  { size: 29, scales: [1, 2], idiom: "ipad" },
  { size: 40, scales: [1, 2], idiom: "ipad" },
  { size: 76, scales: [1, 2], idiom: "ipad" },
  { size: 83.5, scales: [2], idiom: "ipad" },
  { size: 1024, scales: [1], idiom: "ios-marketing" },
];

async function generateIcons() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(XCODE_DIR, { recursive: true });

  const svgBuffer = fs.readFileSync(SOURCE_SVG);

  const svgWithBackground = Buffer.from(
    svgBuffer
      .toString()
      .replace(
        '<svg width="512" height="512"',
        '<svg width="512" height="512" style="background:#1A0E07"'
      )
  );

  const contentsImages = [];
  const generated = new Set();

  for (const entry of IOS_ICON_SIZES) {
    for (const scale of entry.scales) {
      const px = Math.round(entry.size * scale);
      const filename = `icon-${entry.size}x${entry.size}@${scale}x.png`;

      if (!generated.has(filename)) {
        await sharp(svgWithBackground, { density: 300 })
          .resize(px, px, { fit: "cover", background: { r: 26, g: 14, b: 7, alpha: 1 } })
          .flatten({ background: { r: 26, g: 14, b: 7 } })
          .png({ quality: 100 })
          .toFile(path.join(OUTPUT_DIR, filename));

        fs.copyFileSync(
          path.join(OUTPUT_DIR, filename),
          path.join(XCODE_DIR, filename)
        );

        generated.add(filename);
        console.log(`  ✓ ${filename} (${px}x${px}px)`);
      }

      contentsImages.push({
        filename,
        idiom: entry.idiom,
        scale: `${scale}x`,
        size: `${entry.size}x${entry.size}`,
      });
    }
  }

  const appStoreIcon = "icon-1024x1024.png";
  await sharp(svgWithBackground, { density: 300 })
    .resize(1024, 1024, { fit: "cover", background: { r: 26, g: 14, b: 7, alpha: 1 } })
    .flatten({ background: { r: 26, g: 14, b: 7 } })
    .png({ quality: 100 })
    .toFile(path.join(OUTPUT_DIR, appStoreIcon));
  console.log(`  ✓ ${appStoreIcon} (App Store submission)`);

  const contentsJson = {
    images: contentsImages,
    info: { version: 1, author: "Soul Codex icon generator" },
  };

  fs.writeFileSync(
    path.join(XCODE_DIR, "Contents.json"),
    JSON.stringify(contentsJson, null, 2)
  );

  console.log(`\n✅ Generated ${generated.size} unique icons`);
  console.log(`📁 Icons:        ${OUTPUT_DIR}`);
  console.log(`📁 Xcode Assets: ${XCODE_DIR}`);
}

generateIcons().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
