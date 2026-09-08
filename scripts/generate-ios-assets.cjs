const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SOURCE_ICON = path.join(__dirname, "..", "assets", "icon.png");
const SOURCE_SPLASH = path.join(__dirname, "..", "assets", "splash.png");
const SOURCE_SPLASH_DARK = path.join(__dirname, "..", "assets", "splash-dark.png");

const ICON_DIR = path.join(__dirname, "..", "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset");
const SPLASH_DIR = path.join(__dirname, "..", "ios", "App", "App", "Assets.xcassets", "Splash.imageset");

const IOS_ICON_SIZES = [
  { size: 20, scales: [2, 3], idiom: "iphone" },
  { size: 29, scales: [1, 2, 3], idiom: "iphone" },
  { size: 40, scales: [2, 3], idiom: "iphone" },
  { size: 60, scales: [2, 3], idiom: "iphone" },
  { size: 20, scales: [1, 2], idiom: "ipad" },
  { size: 29, scales: [1, 2], idiom: "ipad" },
  { size: 40, scales: [1, 2], idiom: "ipad" },
  { size: 76, scales: [1, 2], idiom: "ipad" },
  { size: 83.5, scales: [2], idiom: "ipad" },
  { size: 1024, scales: [1], idiom: "ios-marketing" },
];

async function generate() {
  console.log("Generating iOS assets...");

  // Generate Icons
  fs.mkdirSync(ICON_DIR, { recursive: true });
  const contentsImages = [];
  
  for (const entry of IOS_ICON_SIZES) {
    for (const scale of entry.scales) {
      const px = Math.round(entry.size * scale);
      const filename = `icon-${entry.size}x${entry.size}@${scale}x.png`;
      
      await sharp(SOURCE_ICON)
        .resize(px, px)
        .png()
        .toFile(path.join(ICON_DIR, filename));
      
      contentsImages.push({
        filename,
        idiom: entry.idiom,
        scale: `${scale}x`,
        size: `${entry.size}x${entry.size}`,
      });
      console.log(`  ✓ Icon ${filename}`);
    }
  }

  fs.writeFileSync(
    path.join(ICON_DIR, "Contents.json"),
    JSON.stringify({ images: contentsImages, info: { version: 1, author: "Soul Codex" } }, null, 2)
  );

  // Generate Splashes
  fs.mkdirSync(SPLASH_DIR, { recursive: true });
  
  const splashConfigs = [
    { filename: "Default@1x~universal~anyany.png", scale: "1x", source: SOURCE_SPLASH },
    { filename: "Default@2x~universal~anyany.png", scale: "2x", source: SOURCE_SPLASH },
    { filename: "Default@3x~universal~anyany.png", scale: "3x", source: SOURCE_SPLASH },
    { filename: "Default@1x~universal~anyany-dark.png", scale: "1x", source: SOURCE_SPLASH_DARK, dark: true },
    { filename: "Default@2x~universal~anyany-dark.png", scale: "2x", source: SOURCE_SPLASH_DARK, dark: true },
    { filename: "Default@3x~universal~anyany-dark.png", scale: "3x", source: SOURCE_SPLASH_DARK, dark: true },
  ];

  const splashImages = [];

  for (const config of splashConfigs) {
    const scale = parseInt(config.scale);
    // Typical splash sizes for universal (2732x2732 for 3x, 1821x1821 for 2x, etc. - or just large)
    // Capacitor assets uses 2732x2732 for splash
    const size = 1000 * scale; // Just a reasonable large size, sharp will handle the source aspect ratio
    
    await sharp(config.source)
      .resize(Math.round(2732 / (3 / scale))) 
      .png()
      .toFile(path.join(SPLASH_DIR, config.filename));

    const imgEntry = {
      filename: config.filename,
      idiom: "universal",
      scale: config.scale
    };
    if (config.dark) {
      imgEntry.appearances = [{ appearance: "luminosity", value: "dark" }];
    }
    splashImages.push(imgEntry);
    console.log(`  ✓ Splash ${config.filename}`);
  }

  fs.writeFileSync(
    path.join(SPLASH_DIR, "Contents.json"),
    JSON.stringify({ images: splashImages, info: { version: 1, author: "Soul Codex" } }, null, 2)
  );

  console.log("\n✅ iOS Assets Generated Successfully!");
}

generate().catch(console.error);
