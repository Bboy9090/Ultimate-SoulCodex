const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BACKGROUND_PATH = '/Users/bj90-m1/.gemini/antigravity/brain/78da2679-a7a3-48c5-ba5d-f8403bf9dd81/nebula_background_v2_1777544316186.png';
const LOGO_PATH = path.join(process.cwd(), 'icon1.png');
const ASSETS_DIR = path.join(process.cwd(), 'ios/App/App/Assets.xcassets');

async function generateAssets() {
  console.log('Generating iOS assets...');

  // 1. Generate Splash Screen (2732x2732)
  const splashDir = path.join(ASSETS_DIR, 'Splash.imageset');
  if (!fs.existsSync(splashDir)) fs.mkdirSync(splashDir, { recursive: true });

  await sharp(BACKGROUND_PATH)
    .resize(2732, 2732)
    .composite([{
      input: await sharp(LOGO_PATH).resize(800, 800).toBuffer(),
      gravity: 'center'
    }])
    .toFile(path.join(splashDir, 'splash.png'));
  
  console.log('Splash screen generated.');

  // 2. Generate App Icons
  const iconDir = path.join(ASSETS_DIR, 'AppIcon.appiconset');
  if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

  const iconSizes = [
    { size: 20, scale: 2 },
    { size: 20, scale: 3 },
    { size: 29, scale: 1 },
    { size: 29, scale: 2 },
    { size: 29, scale: 3 },
    { size: 40, scale: 1 },
    { size: 40, scale: 2 },
    { size: 40, scale: 3 },
    { size: 60, scale: 2 },
    { size: 60, scale: 3 },
    { size: 76, scale: 1 },
    { size: 76, scale: 2 },
    { size: 83.5, scale: 2 },
    { size: 1024, scale: 1 }
  ];

  for (const item of iconSizes) {
    const dimension = Math.floor(item.size * item.scale);
    const fileName = `icon-${item.size}x${item.size}@${item.scale}x.png`;
    
    await sharp(BACKGROUND_PATH)
      .resize(dimension, dimension)
      .composite([{
        input: await sharp(LOGO_PATH).resize(Math.floor(dimension * 0.7)).toBuffer(),
        gravity: 'center'
      }])
      .toFile(path.join(iconDir, fileName));
    
    console.log(`Generated icon: ${fileName}`);
  }

  console.log('All iOS assets generated successfully.');
}

generateAssets().catch(console.error);
