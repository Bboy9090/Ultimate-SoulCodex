#!/bin/bash
set -e

echo "Building Ultimate SoulCodex Engine..."

# Create dist directory structure
mkdir -p dist/public

# Try to build client with vite, if it fails, copy existing client files
echo "Building client..."
if npm run build:client 2>/dev/null; then
  echo "Client built with vite"
else
  echo "Vite build not available, copying existing client files..."
  # Copy HTML
  cp index.html dist/public/
  # Copy JavaScript files
  cp *.js dist/public/ 2>/dev/null || true
  # Copy CSS files  
  cp *.css dist/public/ 2>/dev/null || true
  # Copy other assets
  cp *.png *.json sw.js dist/public/ 2>/dev/null || true
  echo "Client files copied to dist/public"
fi

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:../routes.js --external:../ema-scheduler.js

echo "Build complete!"
