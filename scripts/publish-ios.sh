#!/bin/bash

# Soul Codex — iOS Publishing Orchestrator
# This script automates the path from web build to Xcode archive.

set -e

echo "🚀 Starting Operation App Store..."

# 1. Clean previous build artifacts
echo "🧹 Cleaning dist/..."
rm -rf dist/public

# 2. Build Web Assets
echo "📦 Building client-side assets..."
npm run build:client

# 3. Synchronize Capacitor
echo "🔄 Synchronizing Capacitor iOS platform..."
npx cap sync ios

# 4. Generate Native Assets (Icons/Splash)
echo "🎨 Generating native assets from assets/..."
# Change to root explicitly to ensure correct asset mapping
(cd "$(dirname "$0")/.." && npx @capacitor/assets generate --ios)

# 5. Open Xcode
echo "🏗️ Opening Xcode project..."
npx cap open ios

echo "✅ Ready for Archive. In Xcode, remember to:"
echo "   1. Set Team in Signing & Capabilities"
echo "   2. Add 'Sign In with Apple' capability"
echo "   3. Increment Build Version"
echo "   4. Product > Archive"
