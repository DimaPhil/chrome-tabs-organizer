// Simple script to generate placeholder PNG icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Base64-encoded minimal PNG files (blue squares with grid pattern)
// These are placeholder icons - replace with proper designed icons for production

const icons = {
  'icon16.png':
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhklEQVQ4y2NgGGngPwMDwwsGBob/DAwMjFAMMH5oAJjzAof8fwYGhn8MDAwfgfQ/IP0JiD8D6a9A+gcQ/wZiDIAR5gJMAGQ4I8xghv8MDIwwg/7D1EEV/4O5DKoRZhDD/0EJILn/QPqfYYcwQp0D1/AfKvePgYHhP0wjkOVIbgDNqUgZQHXvAwCvcGTF+18STQAAAABJRU5ErkJggg==',
  'icon48.png':
    'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA4UlEQVR4Ae2ZMQ7CMBAE7/8fDR0FJUVC4k5s7Wwxmtqxb+6c+A4AAAAAAAAA8K0Abuu6F/Bd9nAA53XdC/guezgAnNd1L+C77OEAcF7XvYDvsocDwHld9wK+yx4OAOd13Qv4Lns4AJzXdS/guxh2cAA4r+tewHfZwwHgvK57Ad9lDweA87ruBXyXPRwAzuu6F/Bd9nAAOK/rXsB32cMB4LyuewHfZQ8HgPO67gV8lz0cAM7ruhfwXfZwADiv617Ad9nDAeC8rnsB32UPB4Dzuu4FfBfDDnzhPxvPJfj1gj4AAAAASUVORK5CYII=',
  'icon128.png':
    'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABNklEQVR4Ae3dMQ7CMBAE0Pz/0VAhUVBQJCTuxNbOFqOpHfvmzolvAAAAAAAAAAD4LgDXdd0L+C57OICc13Uv4Lvs4QBwXte9gO+yhwPAeV33Ar7LHg4A53XdC/guezgAnNd1L+C77OEAcF7XvYDvsocDwHld9wK+yx4OAOd13Qv4Lns4AJzXdS/gu+zhAHBe172A77KHA8B5XfcCvsseDgDndd0L+C57OACc13Uv4Lvs4QBwXte9gO+yhwPAeV33Ar7LHg4A53XdC/guezgAnNd1L+C77OEAcF7XvYDvsocDwHld9wK+yx4OAOd13Qv4Lns4AJzXdS/gu+zhAHBe172A77KHA8B5XfcCvsseDgDndd0L+C57OACc13Uv4LsYdvCF/2w8l+DXCwAAAABgMAD+r9AAJJP2MQAAAABJRU5ErkJggg==',
};

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write PNG files
for (const [filename, base64Data] of Object.entries(icons)) {
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
  console.log(`Created ${filename}`);
}

console.log('Done! Replace these placeholder icons with properly designed ones for production.');
