const sharp = require('sharp');
const path = require('path');

async function generateFavicon() {
  try {
    // Convert SVG to 32x32 PNG
    await sharp(path.join(process.cwd(), 'public', 'icon.svg'))
      .resize(32, 32)
      .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));

    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon(); 