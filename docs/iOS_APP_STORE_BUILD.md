# iOS App Store Build Workflow

## Overview

This document explains how to build and submit the Ultimate SoulCodex iOS app to the Apple App Store using the GitHub Actions workflow.

## Workflow File

- **Location**: `.github/workflows/build-ios.yml`
- **Trigger**: Manual workflow dispatch (`workflow_dispatch`)
- **Platform**: macOS 14
- **Timeout**: 40 minutes

## Build Types

### Development Build
- **Configuration**: Debug
- **Destination**: iOS Simulator
- **Code Signing**: Disabled
- **Use Case**: Local testing and CI validation

### App Store Build
- **Configuration**: Release
- **Code Signing**: Required (certificate + provisioning profile)
- **Output**: `.ipa` file ready for App Store submission
- **Use Case**: Production release to Apple App Store

## Prerequisites

### 1. Apple Developer Account
- Membership with app signing capabilities
- Team ID: `86NUJ8M3B8`

### 2. GitHub Secrets Setup

Configure the following secrets in GitHub (Settings → Secrets and variables → Actions):

#### `IOS_CERTIFICATE_P12`
Base64-encoded Apple Developer signing certificate in PKCS12 format.

**How to create:**
1. In Keychain Access, select the signing certificate
2. Right-click → Export as `.p12` file
3. Encode as base64:
   ```bash
   base64 -i certificate.p12 -o certificate.p12.base64
   ```
4. Add to GitHub as secret `IOS_CERTIFICATE_P12`

#### `IOS_CERTIFICATE_PASSWORD`
Password used when exporting the `.p12` file.

#### `IOS_PROVISIONING_PROFILE`
Base64-encoded App Store provisioning profile.

**How to create:**
1. Download from Apple Developer Portal (Certificates, Identifiers & Profiles)
2. Encode as base64:
   ```bash
   base64 -i SoulCodex.mobileprovision -o profile.mobileprovision.base64
   ```
3. Add to GitHub as secret `IOS_PROVISIONING_PROFILE`

### 3. GitHub Variables (Optional)

Set the following in GitHub (Settings → Secrets and variables → Variables):

#### `VITE_API_URL`
Backend API endpoint for the app.
- **Default**: `https://soulcodex.up.railway.app`
- **Override**: Set in Variables if you have a different backend

## Workflow Steps

### 1. Checkout Repository
Clones the repository at the current commit.

### 2. Setup Node.js
Installs Node.js 22 with npm dependency caching.

### 3. Setup Xcode
Installs the latest stable version of Xcode.

### 4. Bootstrap JavaScript and Swift
- Runs `ios/App/ci_scripts/ci_post_clone.sh`
- Installs npm dependencies
- Builds Capacitor
- Syncs native files to iOS project
- Patches Swift package manager configuration

### 5. Validate Mobile Release Configuration
Verifies that:
- `VITE_API_URL` is set
- Required build artifacts exist
- Mobile release is properly configured

### 6. Resolve Xcode Package Dependencies
Downloads and resolves Swift package manager dependencies for:
- Capacitor (main framework)
- Keyboard plugin
- Splash Screen plugin
- Status Bar plugin
- Apple Sign-In plugin

### 7. Build Development (if `development` type)
Creates a debug build for iOS Simulator:
- No code signing required
- Useful for CI validation
- Produces `.app` bundle

### 8. Build App Store (if `app-store` type)

#### A. Import Signing Certificate
Uses the P12 certificate to sign the build.

#### B. Install Provisioning Profile
Installs the provisioning profile to macOS.

#### C. Archive
Creates an `.xcarchive` with Release configuration.

#### D. Export
Exports the archive to `.ipa` file using ExportOptions.plist.

### 9. Upload Artifacts
Stores build outputs:
- **App Store**: All files from `build/export/` (retention: 30 days)
- **Development**: Simulator app bundle (retention: 7 days)

## How to Trigger the Workflow

### Method 1: GitHub UI
1. Go to Actions → Build iOS
2. Click "Run workflow"
3. Select build type: `development` or `app-store`
4. Click "Run workflow"

### Method 2: GitHub CLI
```bash
# Development build
gh workflow run build-ios.yml -f build_type=development

# App Store build
gh workflow run build-ios.yml -f build_type=app-store
```

### Method 3: REST API
```bash
curl -X POST https://api.github.com/repos/Bboy9090/Ultimate-SoulCodex/actions/workflows/build-ios.yml/dispatches \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"ref":"main","inputs":{"build_type":"app-store"}}'
```

## Build Artifacts

### App Store Build Output
Located in: `build/export/`

Contains:
- `Soul Codex.ipa` - The compiled app for App Store submission
- `Soul Codex.app.dSYM.zip` - Debug symbols (if enabled)
- `DistribitutionSummary.plist` - Build metadata

### Development Build Output
Located in: `build/Build/Products/Debug-iphonesimulator/`

Contains:
- `Soul Codex.app/` - Simulator app bundle
- Can be tested locally with Xcode or `xcrun` tools

## App Store Submission

After a successful app-store build:

1. Download the `.ipa` file from GitHub Actions artifacts
2. Use Transporter or Xcode to upload to App Store Connect
3. Fill in release notes and metadata
4. Submit for review

### Using Transporter
```bash
xcrun altool --upload-app -f "Soul Codex.ipa" -t ios -u "your-apple-id@example.com" -p "your-app-password"
```

### Using Xcode
1. Open Xcode
2. Window → Organizer
3. Select the archived build
4. Click "Distribute App"
5. Follow the prompts

## Troubleshooting

### Package Dependency Resolution Fails
**Error**: "Missing Swift package dependencies"

**Solution**:
- Ensure all packages are committed to `node_modules/@capacitor/*`
- Run locally: `npm ci && npm run build:capacitor && npx cap sync ios`
- Verify `CapApp-SPM/Package.swift` paths are correct

### Archive Creation Fails
**Error**: "xcodebuild: error: Unable to create archive"

**Solution**:
- Check Xcode version compatibility (requires macOS 14 with latest stable Xcode)
- Verify `App.xcodeproj` is valid
- Check build logs: look for "Build iOS (App Store)" step logs

### Certificate/Provisioning Profile Fails
**Error**: "Code signing certificate or provisioning profile not found"

**Solution**:
- Verify `IOS_CERTIFICATE_P12` and `IOS_CERTIFICATE_PASSWORD` are set correctly
- Verify `IOS_PROVISIONING_PROFILE` is base64 encoded properly
- Ensure certificate is valid (not expired)
- Check team ID in certificate matches `86NUJ8M3B8` in ExportOptions.plist

### IPA Export Fails
**Error**: "Failed to export archive"

**Solution**:
- Check ExportOptions.plist is valid
- Verify provisioning profile supports App Store distribution
- Check team ID in ExportOptions.plist matches the certificate

## Configuration Files

### ExportOptions.plist
**Location**: `ios/App/ExportOptions.plist`

Contains export settings:
- **method**: `app-store` - Exports for App Store
- **signingStyle**: `automatic` - Let Xcode manage signing
- **teamID**: `86NUJ8M3B8` - Apple Developer Team ID
- **stripSwiftSymbols**: `true` - Reduce IPA size
- **uploadSymbols**: `true` - Upload symbols to App Store

### ci_post_clone.sh
**Location**: `ios/App/ci_scripts/ci_post_clone.sh`

Bootstrap script that:
1. Installs Node.js if missing
2. Runs `npm ci` to install dependencies
3. Builds Capacitor web assets
4. Syncs native files
5. Patches Swift package configuration
6. Validates all required files exist

## Environment Variables

- **VITE_API_URL**: Backend API endpoint
  - **Set in**: GitHub Variables or workflow
  - **Default**: `https://soulcodex.up.railway.app`
  - **Used by**: Web app to connect to backend

- **CI_PRIMARY_REPOSITORY_PATH**: Repository root for CI scripts
  - **Set in**: GitHub Actions (automatically)
  - **Used by**: `ci_post_clone.sh`

## Local Testing

To test the iOS build locally:

### 1. Bootstrap
```bash
cd ios/App
sh ci_scripts/ci_post_clone.sh
```

### 2. Resolve Dependencies
```bash
xcodebuild -resolvePackageDependencies \
  -project App.xcodeproj \
  -scheme "Soul Codex"
```

### 3. Build for Simulator
```bash
xcodebuild -project App.xcodeproj \
  -scheme "Soul Codex" \
  -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO \
  build
```

### 4. Build for App Store (requires signing setup)
```bash
xcodebuild -project App.xcodeproj \
  -scheme "Soul Codex" \
  -configuration Release \
  -archivePath build/SoulCodex.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/SoulCodex.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist
```

## Monitoring

View workflow runs:
1. GitHub → Actions → Build iOS
2. Click on workflow run to see real-time logs
3. Check artifacts in "Artifacts" section after completion

## Team Information

- **Team ID**: `86NUJ8M3B8`
- **App Bundle ID**: `com.soulcodex.app` (configured in Xcode)
- **Minimum iOS Version**: 15.0

## References

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Xcode Build Settings Reference](https://help.apple.com/xcode/mac/current/#/itun0b3a993a1)

---

**Last Updated**: 2026-07-31
**Workflow Version**: 2.0
