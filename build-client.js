import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const distDir = 'dist/public';
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

await esbuild.build({
  entryPoints: ['client/src/main.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  target: ['es2020'],
  outdir: distDir,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
    '.css': 'css',
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'file',
    '.gif': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  jsx: 'automatic',
  alias: {
    '@': path.resolve('client/src'),
    '@shared': path.resolve('shared'),
    '@assets': path.resolve('attached_assets'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ""),
  },
  entryNames: '[name]',
});

let html = fs.readFileSync('client/index.html', 'utf8');
html = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<link rel="stylesheet" href="/main.css">\n    <script src="/main.js" defer></script>'
);
fs.writeFileSync(path.join(distDir, 'index.html'), html);

const staticAssets = ['manifest.json', 'sw.js', 'favicon.png'];
for (const asset of staticAssets) {
  if (fs.existsSync(asset)) {
    fs.copyFileSync(asset, path.join(distDir, asset));
  }
}

const publicDir = 'client/public';
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

console.log('✓ Client build complete');
