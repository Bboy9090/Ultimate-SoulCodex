#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPOSITORY_PATH="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)}"
cd "$REPOSITORY_PATH"

export VITE_API_URL="${VITE_API_URL:-https://soulcodex.up.railway.app}"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is missing; installing Node 22 with Homebrew."
  brew install node@22
  export PATH="$(brew --prefix node@22)/bin:$PATH"
fi

echo "Xcode Cloud post-clone bootstrap"
echo "Repository: $REPOSITORY_PATH"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

npm ci --include=dev --no-audit --no-fund
npm run build:workspaces
npm run build:capacitor
npx cap sync ios
npm run mobile:patch:ios
node scripts/patch-capapp-spm-vendored-packages.mjs

for required_path in \
  "ios/App/Vendor/CapacitorSplashScreen/Package.swift" \
  "ios/App/Vendor/CapacitorStatusBar/Package.swift" \
  "ios/App/Vendor/CapawesomeCapacitorAppleSignIn/Package.swift" \
  "ios/App/CapApp-SPM/Package.swift"; do
  if [ ! -e "$required_path" ]; then
    echo "Missing required Xcode Cloud dependency: $required_path" >&2
    exit 1
  fi
done

if grep -q 'node_modules/' ios/App/CapApp-SPM/Package.swift; then
  echo "CapApp-SPM regressed to node_modules-backed Swift packages after sync." >&2
  exit 1
fi

grep -q 'capacitor-swift-pm.git' ios/App/CapApp-SPM/Package.swift
grep -q 'capacitor-keyboard.git' ios/App/CapApp-SPM/Package.swift
grep -q '../Vendor/CapacitorSplashScreen' ios/App/CapApp-SPM/Package.swift
grep -q '../Vendor/CapacitorStatusBar' ios/App/CapApp-SPM/Package.swift
grep -q '../Vendor/CapawesomeCapacitorAppleSignIn' ios/App/CapApp-SPM/Package.swift

echo "Xcode Cloud JavaScript bootstrap complete; clone-ready Swift package graph restored."
