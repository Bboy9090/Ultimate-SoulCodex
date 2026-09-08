const sharp = require("sharp");
const path = require("path");

const NEBULA_BG = path.join(__dirname, "..", "client", "public", "nebula-bg.png");
const STAR_LOGO = path.join(__dirname, "..", "client", "public", "soul-codex-logo-star.png");
const OUTPUT_ICON = path.join(__dirname, "..", "assets", "icon.png");
const OUTPUT_SPLASH = path.join(__dirname, "..", "assets", "splash.png");
const OUTPUT_SPLASH_DARK = path.join(__dirname, "..", "assets", "splash-dark.png");

async function createAssets() {
  console.log("Creating Star Icon and Nebula Splash...");

  // Create Icon
  const bg = await sharp(NEBULA_BG)
    .resize(1024, 1024, { fit: "cover" })
    .toBuffer();

  const starIcon = await sharp(STAR_LOGO)
    .resize(800, 800, { fit: "inside" })
    .toBuffer();

  const title = path.join(__dirname, "..", "assets", "title-overlay.svg");

  // Icon (Star Only - Center)
  await sharp(bg)
    .composite([{ input: starIcon, gravity: "center" }])
    .png()
    .toFile(OUTPUT_ICON);
  
  console.log("  ✓ Created icon.png (Star + Nebula)");

  // Create Splash (Star + Title)
  await sharp(NEBULA_BG)
    .resize(2732, 2732, { fit: "cover" })
    .composite([
      { input: await sharp(STAR_LOGO).resize(1200, 1200).toBuffer(), gravity: "center", top: 600, left: 766 },
      { input: await sharp(title).resize(2732, 2732).toBuffer(), gravity: "center" }
    ])
    .png()
    .toFile(OUTPUT_SPLASH);
  
  await sharp(OUTPUT_SPLASH)
    .toFile(OUTPUT_SPLASH_DARK);

  console.log("  ✓ Created splash.png and splash-dark.png");
}

createAssets().catch(console.error);
