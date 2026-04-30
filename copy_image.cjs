const fs = require('fs');
const src = '/Users/bj90-m1/.gemini/antigravity/brain/78da2679-a7a3-48c5-ba5d-f8403bf9dd81/nebula_background_v2_1777544316186.png';
const dest = 'nebula_background.png';

try {
    fs.copyFileSync(src, dest);
    console.log('Successfully copied background image to workspace.');
} catch (err) {
    console.error('Error copying image:', err.message);
}
