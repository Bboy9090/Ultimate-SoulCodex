# Ultimate SoulCodex Documentation

## Platform-Specific Guides

### 📱 iOS App Store Build
**File**: `iOS_APP_STORE_BUILD.md`

Complete guide for building and submitting the iOS app to the Apple App Store:
- Workflow overview and configuration
- Prerequisites and setup
- GitHub Secrets configuration
- Build triggers and troubleshooting
- App Store submission instructions

**Quick Start**:
1. Read: `iOS_APP_STORE_BUILD.md`
2. Run setup: `scripts/setup-ios-signing.sh`
3. Configure GitHub Secrets
4. Trigger workflow: `gh workflow run build-ios.yml -f build_type=app-store`

### 📱 Android App Store Build
**File**: `Android_APP_STORE_BUILD.md` (Coming Soon)

Will include:
- Android build workflow configuration
- Google Play Console setup
- Signing key management
- Build triggers and troubleshooting

### 🚀 Deployment
**File**: `DEPLOYMENT.md` (See root DEPLOYMENT.md)

Information about deploying the backend and web app.

## Setup Scripts

### iOS Code Signing Setup
**File**: `scripts/setup-ios-signing.sh`

Interactive script to help configure code signing for iOS app store builds:
```bash
./scripts/setup-ios-signing.sh
```

This script will:
1. Guide you through exporting your signing certificate
2. Encode it to base64 for GitHub Secrets
3. Help you download and configure your provisioning profile
4. Display values for copying to GitHub

## GitHub Workflows

### Build iOS
**File**: `.github/workflows/build-ios.yml`

Builds the iOS app for development or App Store.

**Trigger**: Manual workflow dispatch
**Options**:
- `build_type`: `development` or `app-store`

**Usage**:
```bash
# Development build
gh workflow run build-ios.yml -f build_type=development

# App Store build (requires signing setup)
gh workflow run build-ios.yml -f build_type=app-store
```

### CI Tests
**File**: `.github/workflows/node.js.yml`

Runs automated tests and builds the web app.

**Trigger**: Push to main or pull requests

## Quick Links

- **Apple Developer Portal**: https://developer.apple.com/account
- **Google Play Console**: https://play.google.com/console
- **GitHub Actions**: https://github.com/Bboy9090/Ultimate-SoulCodex/actions
- **Repository Settings**: https://github.com/Bboy9090/Ultimate-SoulCodex/settings

## Team Information

- **Apple Team ID**: `86NUJ8M3B8`
- **App Bundle ID (iOS)**: `com.soulcodex.app`
- **Package Name (Android)**: `com.soulcodex.app` (TBD)

## Support

For issues or questions:
1. Check the relevant guide in this directory
2. Review GitHub workflow logs
3. See troubleshooting sections in the guides

---

**Last Updated**: 2026-07-31
