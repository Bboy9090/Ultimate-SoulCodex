const sharp = require("sharp");
const path = require("path");

const SOURCE_GEN = "/Users/bj90-m1/.gemini/antigravity/brain/4e5097b8-df2f-4677-81b9-b2d65b16636e/soulcodex_splash_raw_1777086234968.png";
const OUTPUT_ICON = path.join(__dirname, "..", "assets", "icon.png");
const OUTPUT_SPLASH = path.join(__dirname, "..", "assets", "splash.png");
const OUTPUT_SPLASH_DARK = path.join(__dirname, "..", "assets", "splash-dark.png");

async function process() {
  console.log("Processing titled assets...");

  // Splash
  await sharp(SOURCE_GEN)
    .resize(2732, 2732, { fit: "cover" })
    .toFile(OUTPUT_SPLASH);
  
  await sharp(SOURCE_GEN)
    .resize(2732, 2732, { fit: "cover" })
    .toFile(OUTPUT_SPLASH_DARK);

  // Icon (Center crop with the star and maybe a bit of text)
  await sharp(SOURCE_GEN)
    .resize(1024, 1024, { fit: "cover" })
    .toFile(OUTPUT_ICON);

  console.log("  ✓ Assets updated with titled versions.");
}

process().catch(console.error);
