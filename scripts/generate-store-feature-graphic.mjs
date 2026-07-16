import sharp from "sharp";

const width = 1024;
const height = 500;
const iconPath = "store-assets/app-store-icon-1024.png";
const outputPath = "store-assets/play-feature-graphic-1024x500.png";

const background = await sharp(iconPath)
  .resize(width, height, { fit: "cover" })
  .blur(10)
  .modulate({ brightness: 0.48, saturation: 0.9 })
  .png()
  .toBuffer();

const icon = await sharp(iconPath)
  .resize(330, 330, { fit: "cover" })
  .png()
  .toBuffer();

const typography = Buffer.from(`
  <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="veil" x1="0" x2="1">
        <stop offset="0" stop-color="#09051a" stop-opacity="0.12"/>
        <stop offset="0.48" stop-color="#09051a" stop-opacity="0.76"/>
        <stop offset="1" stop-color="#09051a" stop-opacity="0.94"/>
      </linearGradient>
      <filter id="shadow"><feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000" flood-opacity="0.7"/></filter>
    </defs>
    <rect width="1024" height="500" fill="url(#veil)"/>
    <rect x="38" y="38" width="948" height="424" rx="28" fill="none" stroke="#d4a85f" stroke-opacity="0.38" stroke-width="2"/>
    <g filter="url(#shadow)" font-family="Georgia, 'Times New Roman', serif">
      <text x="470" y="205" fill="#f6f1e8" font-size="68" font-weight="700" letter-spacing="2">Soul Codex</text>
      <text x="472" y="256" fill="#d4a85f" font-size="25" letter-spacing="4">KNOW HOW YOU'RE WIRED</text>
      <line x1="472" y1="286" x2="913" y2="286" stroke="#d4a85f" stroke-opacity="0.55"/>
      <text x="472" y="331" fill="#eaeaf5" fill-opacity="0.84" font-family="Arial, sans-serif" font-size="23">Astrology · Numerology · Human Design</text>
    </g>
  </svg>
`);

await sharp(background)
  .composite([
    { input: icon, left: 82, top: 85 },
    { input: typography, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath} (${width}x${height})`);
