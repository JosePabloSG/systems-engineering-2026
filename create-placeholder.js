const sharp = require('sharp');
const path = require('path');

const width = 1024;
const height = 1024;

// Create a simple gray rectangle with text
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f5f5f5"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#999" text-anchor="middle" dominant-baseline="middle">MEMORIA</text>
</svg>
`;

sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile(path.join(__dirname, 'public', 'textures', 'placeholder.jpg'))
  .then(() => {
    console.log('Placeholder image created successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating placeholder:', err);
    process.exit(1);
  });
