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
  # Copy specific client files (built artifacts)
  [ -f index.html ] && cp index.html dist/public/
  # Copy JavaScript bundles (matching pattern index*.js)
  find . -maxdepth 1 -name "index*.js" -exec cp {} dist/public/ \; 2>/dev/null || true
  # Copy CSS bundles (matching pattern index*.css)
  find . -maxdepth 1 -name "index*.css" -exec cp {} dist/public/ \; 2>/dev/null || true
  # Copy vendor libraries
  [ -f html2canvas.esm-CBrSDip1.js ] && cp html2canvas.esm-CBrSDip1.js dist/public/
  [ -f jspdf.es.min-A4IT8EFc.js ] && cp jspdf.es.min-A4IT8EFc.js dist/public/
  [ -f purify.es-DfngIMfA.js ] && cp purify.es-DfngIMfA.js dist/public/
  # Copy assets
  [ -f manifest.json ] && cp manifest.json dist/public/
  [ -f sw.js ] && cp sw.js dist/public/
  [ -f favicon.png ] && cp favicon.png dist/public/
  # Copy image assets
  find . -maxdepth 1 -name "*.png" -exec cp {} dist/public/ \; 2>/dev/null || true
  echo "Client files copied to dist/public"
fi

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:../routes.js --external:../ema-scheduler.js

echo "Build complete!"
