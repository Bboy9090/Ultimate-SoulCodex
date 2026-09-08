# Operation App Store — Publishing Guide

The Soul Codex native projects and code-side compliance paths are prepared. A signed archive, public policy URLs, physical-device testing, and App Store Connect review fields still require verification before submission.

## 1. Automated Build Prep
Run the custom publishing script to ensure the latest hardened engine logic is synced to the iOS project:
```bash
./scripts/publish-ios.sh
```
Do not submit a build when asset generation or validation fails. Store artifacts must come from a successful, verified build.

## 2. Xcode Configuration
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. **Signing & Capabilities**:
   - Select the `Ultimate Soul Codex` target.
   - Go to the **Signing & Capabilities** tab.
   - Add **Sign In with Apple** only when Apple sign-in is exposed in the submitted app build.
   - Select your **Development Team**.
3. **Deployment Target**:
   - Ensure the deployment target remains iOS 15.0 or higher.

## 3. App Store Metadata
Use the pre-written metadata in `app_store_metadata.md`.
- **Hardened Selling Points**: Highlight the "Personality Physics" and "Loop Mapping" features.
- **Privacy Policy**: Use `https://soulcodex.up.railway.app/privacy`.

## 4. Archive & Upload
1. Set the build destination to **Any iOS Device (arm64)**.
2. Go to **Product > Archive**.
3. Once the archive is complete, click **Distribute App** in the Organizer.
4. Follow the prompts to upload to **App Store Connect**.

## 5. App Store Connect Tasks
1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Create a new App version (`1.0.0`).
3. Upload screenshots (The "Purple Galaxy" theme looks best in high-res).
4. Submit for review.

---
**Operation App Store Status: CODE PREPARED — SIGNED ARCHIVE AND STORE-CONSOLE VERIFICATION PENDING**
