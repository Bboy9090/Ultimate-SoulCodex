#!/bin/sh
set -eu

REPOSITORY_PATH="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}"
cd "$REPOSITORY_PATH"

export VITE_API_URL="${VITE_API_URL:-https://soulcodex.up.railway.app}"

echo "Xcode Cloud post-clone bootstrap"
echo "Repository: $REPOSITORY_PATH"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

npm ci --include=dev --no-audit --no-fund
npm run build:workspaces
npm run build:capacitor
npx cap sync ios
npm run mobile:patch:ios

APPLE_SIGN_IN_PACKAGE="node_modules/@capawesome/capacitor-apple-sign-in"
for required_path in \
  "$APPLE_SIGN_IN_PACKAGE" \
  "$APPLE_SIGN_IN_PACKAGE/Package.swift" \
  "node_modules/@capacitor/keyboard/Package.swift" \
  "node_modules/@capacitor/splash-screen/Package.swift" \
  "node_modules/@capacitor/status-bar/Package.swift" \
  "ios/App/CapApp-SPM/Package.swift"; do
  if [ ! -e "$required_path" ]; then
    echo "Missing required Xcode Cloud dependency: $required_path" >&2
    exit 1
  fi
done

grep -q 'CapawesomeCapacitorAppleSignIn' ios/App/CapApp-SPM/Package.swift

echo "Xcode Cloud JavaScript and local Swift package dependencies are ready."
