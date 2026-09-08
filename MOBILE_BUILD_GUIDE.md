# Mobile Build & App Store Submission Guide

Quick reference for building and submitting the Ultimate SoulCodex app to iOS App Store and Google Play Store.

## 📱 Platform Overview

| Platform | Package ID | Min OS | Build Types | Store |
|----------|-----------|--------|-----------|-------|
| **iOS** | `com.soulcodex.app` | iOS 15+ | Development, App Store | Apple App Store |
| **Android** | `app.soulcodex.main` | Android 7.0+ (API 24) | Debug, Release APK, Release AAB | Google Play Store |

## 🚀 Quick Start

### For iOS Developers
```bash
# 1. Setup code signing
./scripts/setup-ios-signing.sh

# 2. Configure GitHub Secrets (follow script instructions)

# 3. Trigger build
gh workflow run build-ios.yml -f build_type=app-store
```

### For Android Developers
```bash
# 1. Generate signing keystore
./scripts/setup-android-signing.sh

# 2. Configure GitHub Secrets (follow script instructions)

# 3. Trigger build
gh workflow run build-android.yml -f build_type=release-aab
```

## 📋 Detailed Guides

### iOS App Store
- **Documentation**: `docs/iOS_APP_STORE_BUILD.md`
- **Setup Script**: `scripts/setup-ios-signing.sh`
- **Workflow**: `.github/workflows/build-ios.yml`

**Key Steps**:
1. Export signing certificate from Keychain as `.p12`
2. Download provisioning profile from Apple Developer Portal
3. Run setup script to encode credentials
4. Add secrets to GitHub
5. Trigger workflow
6. Upload IPA to App Store Connect

### Android Google Play Store
- **Documentation**: `docs/Android_APP_STORE_BUILD.md`
- **Setup Script**: `scripts/setup-android-signing.sh`
- **Workflow**: `.github/workflows/build-android.yml`

**Key Steps**:
1. Generate keystore (or use existing one)
2. Run setup script to encode credentials
3. Add secrets to GitHub
4. Trigger workflow (use `release-aab` for Play Store)
5. Upload AAB to Google Play Console

## 🔐 GitHub Secrets Setup

### iOS Secrets
- `IOS_CERTIFICATE_P12` - Base64-encoded code signing certificate
- `IOS_CERTIFICATE_PASSWORD` - Certificate password
- `IOS_PROVISIONING_PROFILE` - Base64-encoded provisioning profile

### Android Secrets
- `ANDROID_KEYSTORE` - Base64-encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias name
- `ANDROID_KEY_PASSWORD` - Key password

### Optional Variables
- `VITE_API_URL` - Backend API endpoint (default: `https://soulcodex.up.railway.app`)

**Configure at**: https://github.com/Bboy9090/Ultimate-SoulCodex/settings/secrets/actions

## 📊 Build Types

### iOS
| Type | Xcode Config | Signing | Output | Use Case |
|------|------------|---------|--------|----------|
| Development | Debug | None | `.app` | Testing on simulator/device |
| App Store | Release | Required | IPA | App Store submission |

### Android
| Type | Config | Signing | Output | Use Case |
|------|--------|---------|--------|----------|
| Debug | Debug | None | APK | Testing on device/emulator |
| Release APK | Release | Required | APK | Direct APK distribution |
| Release AAB | Release | Required | AAB | **Recommended for Play Store** |

## 🔧 Workflow Triggers

### GitHub UI
1. Go to **Actions** → **Build iOS** or **Build Android**
2. Click **Run workflow**
3. Select build type
4. Click **Run workflow**

### GitHub CLI
```bash
# iOS
gh workflow run build-ios.yml -f build_type=development
gh workflow run build-ios.yml -f build_type=app-store

# Android
gh workflow run build-android.yml -f build_type=debug
gh workflow run build-android.yml -f build_type=release-apk
gh workflow run build-android.yml -f build_type=release-aab
```

### REST API
```bash
# iOS App Store build
curl -X POST https://api.github.com/repos/Bboy9090/Ultimate-SoulCodex/actions/workflows/build-ios.yml/dispatches \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"ref":"main","inputs":{"build_type":"app-store"}}'

# Android Play Store build
curl -X POST https://api.github.com/repos/Bboy9090/Ultimate-SoulCodex/actions/workflows/build-android.yml/dispatches \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"ref":"main","inputs":{"build_type":"release-aab"}}'
```

## 📦 App Store Submission Checklist

### Before Any Submission
- [ ] All features tested on real devices
- [ ] No console errors or warnings
- [ ] App icon and splash screens configured
- [ ] Privacy policy and terms available online
- [ ] Contact email configured
- [ ] Screenshots prepared (for app store)

### iOS App Store
- [ ] App version bumped (iOS)
- [ ] Build number incremented
- [ ] Release notes written
- [ ] Screenshots and preview video ready
- [ ] Create app listing in App Store Connect
- [ ] Download IPA from GitHub Actions
- [ ] Upload via Transporter or Xcode
- [ ] Complete app store listing
- [ ] Submit for review

### Google Play Store
- [ ] App version bumped (Android)
- [ ] Version code incremented
- [ ] Release notes written
- [ ] Screenshots and feature graphics ready
- [ ] Create app listing in Google Play Console
- [ ] Download AAB from GitHub Actions
- [ ] Upload to Play Console
- [ ] Fill in store listing
- [ ] Set pricing and distribution
- [ ] Submit for review

## 🐛 Troubleshooting

### Common Issues

**Workflow fails to build**
- Check `VITE_API_URL` is set in GitHub Variables
- Verify all secrets are configured correctly
- Check workflow logs in GitHub Actions

**Signing fails**
- iOS: Verify certificate isn't expired, provisioning profile is valid
- Android: Verify keystore isn't corrupted, passwords are correct
- Re-run setup scripts if needed

**App Store upload fails**
- Check app version hasn't been used before
- Verify metadata (privacy policy, contact info) are correct
- Check app icon sizes and formats
- Ensure no conflicts with existing app

### Platform-Specific Help

**iOS**: See `docs/iOS_APP_STORE_BUILD.md` troubleshooting section
**Android**: See `docs/Android_APP_STORE_BUILD.md` troubleshooting section

## 📚 Learning Resources

### Apple Developer
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)

### Google Play
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Build Documentation](https://developer.android.com/build)
- [App Publishing Guide](https://developer.android.com/studio/publish)

### Capacitor
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)

## 🔑 Key Information

### Team IDs
- **Apple Team ID**: `86NUJ8M3B8`
- **iOS Bundle ID**: `com.soulcodex.app`
- **Android Package**: `app.soulcodex.main`

### Platform Requirements
- **iOS**: Xcode 14+, Swift 5.5+, iOS 15+
- **Android**: Android SDK 36, Gradle 8+, JDK 21

### Keystore Management (Android)
⚠️ **CRITICAL**: Keep your keystore file safe!
- Never commit to Git
- Back up in password-protected location
- Use same keystore for all app updates
- Losing it means you can't update your app

### Code Signing (iOS)
⚠️ **CRITICAL**: Protect your signing certificate!
- Never commit to Git
- Keep provisioning profiles current
- Renew certificates before expiration
- Use unique certificates for development vs. distribution

## 📞 Support

For issues:
1. Check the relevant platform guide
2. Review GitHub Actions workflow logs
3. See troubleshooting section in guide
4. Check platform-specific documentation

---

**Last Updated**: 2026-07-31
**iOS Workflow Version**: 2.0
**Android Workflow Version**: 2.0
**Repository**: https://github.com/Bboy9090/Ultimate-SoulCodex
