const sharp = require('sharp');
const src = '/Users/bj90-m1/.gemini/antigravity/brain/78da2679-a7a3-48c5-ba5d-f8403bf9dd81/nebula_background_v2_1777544316186.png';

sharp(src)
    .metadata()
    .then(meta => console.log('Metadata:', meta))
    .catch(err => console.error('Error:', err.message));
