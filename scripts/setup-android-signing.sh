#!/bin/bash
# Setup script for Android App Store code signing

set -e

echo "🤖 Android Code Signing Setup for GitHub Actions"
echo "================================================="
echo ""

# Check if required tools are available
check_tool() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ Error: $1 is not installed"
    exit 1
  fi
}

check_tool "keytool"
check_tool "base64"

echo "This script will help you generate and configure Android signing credentials."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - This generates a keystore for signing your app"
echo "   - Keep the keystore file secure (don't commit to Git!)"
echo "   - Losing the keystore means you can't update your app on Play Store"
echo "   - Use the same keystore for all updates to maintain app identity"
echo ""

# Create temporary directory for files
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"
echo ""

# Check if user already has a keystore
echo "Do you already have a keystore file for signing Android apps?"
read -p "Enter path to existing keystore (or press Enter to generate new one): " existing_keystore

if [ -n "$existing_keystore" ] && [ -f "$existing_keystore" ]; then
  echo "Using existing keystore: $existing_keystore"
  cp "$existing_keystore" "$TEMP_DIR/soul-codex-release.keystore"
  KEYSTORE_PATH="$TEMP_DIR/soul-codex-release.keystore"
else
  echo ""
  echo "Step 1️⃣  : Generate Android Keystore"
  echo "===================================="
  echo ""
  echo "You'll be asked to provide information for your signing certificate:"
  echo ""

  read -p "👤 Enter your name: " cn
  read -p "🏢 Enter organization name: " ou
  read -p "📍 Enter city/locality: " l
  read -p "🌍 Enter state/province: " st
  read -p "🌐 Enter country code (e.g., US): " c
  read -p "🔐 Enter keystore password: " -s ks_password
  echo ""
  read -p "🔐 Confirm keystore password: " -s ks_password_confirm
  echo ""

  if [ "$ks_password" != "$ks_password_confirm" ]; then
    echo "❌ Passwords do not match!"
    exit 1
  fi

  read -p "🔑 Enter key alias (e.g., soul-codex-key): " key_alias
  read -p "⏰ Enter validity in years (default 25): " validity
  validity=${validity:-25}

  echo ""
  echo "Generating keystore..."
  keytool -genkey -v \
    -keystore "$TEMP_DIR/soul-codex-release.keystore" \
    -keyalg RSA \
    -keysize 2048 \
    -validity $((validity * 365)) \
    -alias "$key_alias" \
    -dname "CN=$cn,OU=$ou,L=$l,ST=$st,C=$c" \
    -storepass "$ks_password" \
    -keypass "$ks_password"

  echo "✅ Keystore generated successfully"
  echo ""

  KEYSTORE_PATH="$TEMP_DIR/soul-codex-release.keystore"
fi

# Get keystore info
echo ""
echo "Step 2️⃣  : Keystore Information"
echo "================================="
echo ""
read -sp "🔐 Enter keystore password: " keystore_password
echo ""

echo "Keystore contents:"
keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$keystore_password" || {
  echo "❌ Failed to read keystore. Check password and try again."
  exit 1
}

read -p "🔑 Enter the key alias name from above: " key_alias_name
read -sp "🔑 Enter the key password (usually same as keystore): " key_password
echo ""

# Encode keystore
echo ""
echo "Step 3️⃣  : Encode Keystore for GitHub"
echo "====================================="
echo ""
echo "Encoding keystore to base64..."
base64 -i "$KEYSTORE_PATH" > "$TEMP_DIR/keystore.base64"
echo "✅ Keystore encoded"
echo ""

# Summary
echo "Step 4️⃣  : GitHub Secrets Configuration"
echo "========================================"
echo ""
echo "Add the following secrets to your GitHub repository:"
echo ""
echo "1. Open: https://github.com/Bboy9090/Ultimate-SoulCodex/settings/secrets/actions"
echo ""

echo "2. Add Secret: ANDROID_KEYSTORE"
echo "   Value: [Base64 content from below]"
echo ""
echo "   You can copy from file:"
echo "   cat $TEMP_DIR/keystore.base64 | pbcopy"
echo ""

echo "3. Add Secret: ANDROID_KEYSTORE_PASSWORD"
echo "   Value: $keystore_password"
echo ""

echo "4. Add Secret: ANDROID_KEY_ALIAS"
echo "   Value: $key_alias_name"
echo ""

echo "5. Add Secret: ANDROID_KEY_PASSWORD"
echo "   Value: $key_password"
echo ""

# Display the encoded value
echo ""
echo "Base64 Encoded Value:"
echo "===================="
echo ""
echo "📄 ANDROID_KEYSTORE (first 100 chars):"
head -c 100 "$TEMP_DIR/keystore.base64"
echo "..."
echo ""

# Offer to save keystore locally
echo "Keystore file location:"
echo "  $TEMP_DIR/keystore.base64"
echo ""

read -p "Would you like to save the keystore to a safe location? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter save location (default: ~/soul-codex-release.keystore): " save_path
  save_path=${save_path:-~/soul-codex-release.keystore}

  mkdir -p "$(dirname "$save_path")"
  cp "$KEYSTORE_PATH" "$save_path"
  chmod 600 "$save_path"
  echo "✅ Keystore saved to: $save_path"
  echo "   (This file is NOT stored in Git - keep it safe!)"
  echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add the secrets to GitHub"
echo "2. (Optional) Add VITE_API_URL variable in GitHub settings"
echo "3. Commit and push your changes"
echo "4. Trigger the Build Android workflow with build_type=release-aab"
echo ""

# Offer to open secrets page
if command -v open &> /dev/null; then
  read -p "Would you like to open GitHub secrets page? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://github.com/Bboy9090/Ultimate-SoulCodex/settings/secrets/actions"
  fi
fi

echo ""
echo "📚 For more information, see: docs/Android_APP_STORE_BUILD.md"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "   - Keystore password should be 6+ characters"
echo "   - Keep keystore file secure (password-protected location)"
echo "   - Never commit keystore to Git"
echo "   - Use same keystore for all app updates on Play Store"
echo "   - Back it up in a secure location"
