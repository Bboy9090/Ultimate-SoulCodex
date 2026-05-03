const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICON_PATH = path.join(process.cwd(), 'assets', 'icon.png');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

async function generateWebIcons() {
  console.log('Generating web icons from:', ICON_PATH);

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // 1. Favicon (32x32)
  await sharp(ICON_PATH)
    .resize(32, 32)
    .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  console.log('Generated: public/favicon.png');

  // 2. Manifest icons
  await sharp(ICON_PATH)
    .resize(192, 192)
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  console.log('Generated: public/icon-192.png');

  await sharp(ICON_PATH)
    .resize(512, 512)
    .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  console.log('Generated: public/icon-512.png');

  // 3. Apple touch icon & extras for index.html
  await sharp(ICON_PATH)
    .resize(180, 180)
    .toFile(path.join(ICONS_DIR, 'icon-180x180.png'));
  console.log('Generated: public/icons/icon-180x180.png');

  await sharp(ICON_PATH)
    .resize(192, 192)
    .toFile(path.join(ICONS_DIR, 'icon-192x192.png'));
  console.log('Generated: public/icons/icon-192x192.png');

  await sharp(ICON_PATH)
    .resize(512, 512)
    .toFile(path.join(ICONS_DIR, 'icon-512x512.png'));
  console.log('Generated: public/icons/icon-512x512.png');

  console.log('Web icons generated successfully.');
}

generateWebIcons().catch(console.error);
