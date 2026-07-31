#!/bin/bash
# Setup script for iOS App Store code signing

set -e

echo "🍎 iOS Code Signing Setup for GitHub Actions"
echo "=============================================="
echo ""

# Check if required tools are available
check_tool() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ Error: $1 is not installed"
    exit 1
  fi
}

check_tool "base64"

echo "This script will help you configure iOS code signing for GitHub Actions."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - You must have Apple Developer credentials"
echo "   - You need Xcode installed with signing certificates"
echo "   - You need a valid provisioning profile for your app"
echo ""

# Create temporary directory for files
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"
echo ""

# Step 1: Certificate
echo "Step 1️⃣  : iOS Code Signing Certificate"
echo "========================================="
echo ""
echo "You need to export your code signing certificate from Keychain:"
echo ""
echo "1. Open Keychain Access"
echo "2. Select 'Certificates' in the left sidebar"
echo "3. Find your 'Apple Development' or 'Apple Distribution' certificate"
echo "4. Right-click → Export"
echo "5. Save as: certificate.p12"
echo "6. Set a password (you'll need it for GitHub)"
echo ""

read -p "📁 Enter path to your certificate.p12 file: " cert_path

if [ ! -f "$cert_path" ]; then
  echo "❌ File not found: $cert_path"
  exit 1
fi

echo "Encoding certificate to base64..."
base64 -i "$cert_path" > "$TEMP_DIR/certificate.p12.base64"
echo "✅ Certificate encoded"
echo ""

# Step 2: Certificate Password
echo "Step 2️⃣  : Certificate Password"
echo "================================="
read -sp "🔐 Enter the password for your certificate.p12: " cert_password
echo ""
echo "✅ Password captured"
echo ""

# Step 3: Provisioning Profile
echo "Step 3️⃣  : Provisioning Profile"
echo "================================"
echo ""
echo "You need to download your provisioning profile from Apple Developer:"
echo ""
echo "1. Go to: https://developer.apple.com/account/resources/certificates/list"
echo "2. Navigate to Provisioning Profiles"
echo "3. Download your App Store provisioning profile"
echo "4. It will be named like: SoulCodex_App_Store.mobileprovision"
echo ""

read -p "📁 Enter path to your .mobileprovision file: " profile_path

if [ ! -f "$profile_path" ]; then
  echo "❌ File not found: $profile_path"
  exit 1
fi

echo "Encoding provisioning profile to base64..."
base64 -i "$profile_path" > "$TEMP_DIR/profile.mobileprovision.base64"
echo "✅ Provisioning profile encoded"
echo ""

# Summary
echo "Step 4️⃣  : GitHub Secrets Configuration"
echo "========================================"
echo ""
echo "Add the following secrets to your GitHub repository:"
echo ""
echo "1. Open: https://github.com/Bboy9090/Ultimate-SoulCodex/settings/secrets/actions"
echo ""

echo "2. Add Secret: IOS_CERTIFICATE_P12"
echo "   Value: [Base64 content from below]"
echo ""
echo "   You can copy from file:"
echo "   cat $TEMP_DIR/certificate.p12.base64 | pbcopy"
echo ""

echo "3. Add Secret: IOS_CERTIFICATE_PASSWORD"
echo "   Value: $cert_password"
echo ""

echo "4. Add Secret: IOS_PROVISIONING_PROFILE"
echo "   Value: [Base64 content from below]"
echo ""
echo "   You can copy from file:"
echo "   cat $TEMP_DIR/profile.mobileprovision.base64 | pbcopy"
echo ""

# Display the encoded values
echo ""
echo "Base64 Encoded Values:"
echo "====================="
echo ""
echo "📄 IOS_CERTIFICATE_P12 (first 100 chars):"
head -c 100 "$TEMP_DIR/certificate.p12.base64"
echo "..."
echo ""

echo "📄 IOS_PROVISIONING_PROFILE (first 100 chars):"
head -c 100 "$TEMP_DIR/profile.mobileprovision.base64"
echo "..."
echo ""

# Save to files for easy copy-paste
echo "Files saved for copy-paste:"
echo "  - Certificate: $TEMP_DIR/certificate.p12.base64"
echo "  - Profile: $TEMP_DIR/profile.mobileprovision.base64"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add the secrets to GitHub"
echo "2. (Optional) Add VITE_API_URL variable in GitHub settings"
echo "3. Trigger the Build iOS workflow with build_type=app-store"
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
echo "📚 For more information, see: docs/iOS_APP_STORE_BUILD.md"
