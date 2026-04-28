# Operation App Store — Publishing Guide

The Soul Codex engine is hardened, the iOS project is initialized, and the metadata is ready. Follow these steps to complete the submission.

## 1. Automated Build Prep
Run the custom publishing script to ensure the latest hardened engine logic is synced to the iOS project:
```bash
./scripts/publish-ios.sh
```
> [!NOTE]
> If asset generation fails due to network, ignore it for now; Xcode will use default icons which you can replace later.

## 2. Xcode Configuration
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. **Signing & Capabilities**:
   - Select the `App` target.
   - Go to the **Signing & Capabilities** tab.
   - Click **+ Capability** and add **Sign In with Apple** (required for the current auth implementation).
   - Select your **Development Team**.
3. **Deployment Target**:
   - Ensure the deployment target is set to **iOS 13.0** or higher.

## 3. App Store Metadata
Use the pre-written metadata in [app_store_metadata.md](file:///Users/bj90-m1/Downloads/Ultimate-SoulCodex-Engine-of-the-Eternal-Now/app_store_metadata.md).
- **Hardened Selling Points**: Highlight the "Personality Physics" and "Loop Mapping" features.
- **Privacy Policy**: Use `https://soulcodex.app/privacy`.

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
**Operation App Store Status: READY FOR ARCHIVE**
