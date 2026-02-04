#!/bin/bash
set -e

echo "Building Ultimate SoulCodex Engine..."

# Create dist directory structure
mkdir -p dist/public

# Build client with esbuild
echo "Building client..."
npm run build:client

# Build server
echo "Building server..."
npm run build:server

echo "Build complete!"
