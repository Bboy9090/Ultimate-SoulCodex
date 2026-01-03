const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgTemplate = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#0a0118"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="url(#grad)" opacity="0.8"/>
  <path d="M ${size*0.3} ${size*0.5} L ${size*0.5} ${size*0.3} L ${size*0.7} ${size*0.5} L ${size*0.5} ${size*0.7} Z" 
        fill="white" opacity="0.9" stroke="white" stroke-width="${size*0.02}"/>
</svg>`;

console.log('Generating PWA icons...');

sizes.forEach(size => {
  const svgContent = svgTemplate(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  fs.writeFileSync(filename.replace('.png', '.svg'), svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('\nNote: Convert SVG files to PNG manually or use imagemagick:');
console.log('for file in client/public/icons/*.svg; do convert "$file" "${file%.svg}.png"; done');
