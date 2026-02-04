import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Create dist/public directory
const distDir = 'dist/public';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the client bundle with esbuild
await esbuild.build({
  entryPoints: ['client/src/main.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'esm',
  target: ['es2020'],
  outfile: 'dist/public/index.js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js'
  },
  jsx: 'automatic',
});

// Copy index.html
fs.copyFileSync('client/index.html', 'dist/public/index.html');

// Copy static assets if they exist
const staticAssets = ['manifest.json', 'sw.js', 'favicon.png'];
for (const asset of staticAssets) {
  if (fs.existsSync(asset)) {
    fs.copyFileSync(asset, path.join(distDir, asset));
  }
}

// Copy public directory if it exists
const publicDir = 'client/public';
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

console.log('✓ Client build complete');
