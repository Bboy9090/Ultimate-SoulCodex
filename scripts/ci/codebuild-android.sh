#!/usr/bin/env bash
set -euo pipefail

BUILD_TYPE="${BUILD_TYPE:-debug}"
case "$BUILD_TYPE" in
  debug|release-apk|release-aab) ;;
  *) echo "Unsupported BUILD_TYPE=$BUILD_TYPE" >&2; exit 2 ;;
esac

mkdir -p evidence/codebuild
ACTUAL_SHA="$(git rev-parse HEAD)"
printf '%s\n' "$ACTUAL_SHA" | tee release-candidate-sha.txt evidence/codebuild/android-source-sha.txt

if [[ -n "${CODEBUILD_RESOLVED_SOURCE_VERSION:-}" && "${CODEBUILD_RESOLVED_SOURCE_VERSION}" =~ ^[0-9a-f]{40}$ ]]; then
  test "$ACTUAL_SHA" = "$CODEBUILD_RESOLVED_SOURCE_VERSION"
fi

npm ci --ignore-scripts
npm run build -w @soulcodex/db
npm run build -w @soulcodex/core
npm run mobile:validate:android
npm run build
npx cap sync android

cd android
chmod +x gradlew

if [[ "$BUILD_TYPE" == "debug" ]]; then
  ./gradlew assembleDebug --stacktrace -i
  test -s app/build/outputs/apk/debug/app-debug.apk
  sha256sum app/build/outputs/apk/debug/app-debug.apk | tee app/build/outputs/apk/debug/APK-SHA256.txt
  exit 0
fi

: "${ANDROID_KEYSTORE:?ANDROID_KEYSTORE is required for release builds}"
: "${ANDROID_KEYSTORE_PASSWORD:?ANDROID_KEYSTORE_PASSWORD is required for release builds}"
: "${ANDROID_KEY_ALIAS:?ANDROID_KEY_ALIAS is required for release builds}"
: "${ANDROID_KEY_PASSWORD:?ANDROID_KEY_PASSWORD is required for release builds}"

printf '%s' "$ANDROID_KEYSTORE" | base64 --decode > app/soul-codex-release.keystore
chmod 600 app/soul-codex-release.keystore
keytool -list -keystore app/soul-codex-release.keystore -storepass "$ANDROID_KEYSTORE_PASSWORD" -alias "$ANDROID_KEY_ALIAS" >/dev/null
trap 'rm -f app/soul-codex-release.keystore' EXIT

if [[ "$BUILD_TYPE" == "release-apk" ]]; then
  ./gradlew assembleRelease \
    -PRELEASE_STORE_FILE=soul-codex-release.keystore \
    -PRELEASE_STORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD" \
    -PRELEASE_KEY_ALIAS="$ANDROID_KEY_ALIAS" \
    -PRELEASE_KEY_PASSWORD="$ANDROID_KEY_PASSWORD" \
    --stacktrace -i
  test -s app/build/outputs/apk/release/app-release.apk
  sha256sum app/build/outputs/apk/release/app-release.apk | tee app/build/outputs/apk/release/APK-SHA256.txt
else
  ./gradlew bundleRelease \
    -PRELEASE_STORE_FILE=soul-codex-release.keystore \
    -PRELEASE_STORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD" \
    -PRELEASE_KEY_ALIAS="$ANDROID_KEY_ALIAS" \
    -PRELEASE_KEY_PASSWORD="$ANDROID_KEY_PASSWORD" \
    --stacktrace -i
  AAB=app/build/outputs/bundle/release/app-release.aab
  test -s "$AAB"
  jarsigner -verify -keystore app/soul-codex-release.keystore -storepass "$ANDROID_KEYSTORE_PASSWORD" "$AAB" "$ANDROID_KEY_ALIAS" | tee app/build/outputs/bundle/release/JARSIGNER-VERIFY.txt
  grep -q "jar verified" app/build/outputs/bundle/release/JARSIGNER-VERIFY.txt
  sha256sum "$AAB" | tee app/build/outputs/bundle/release/AAB-SHA256.txt
  cp ../release-candidate-sha.txt app/build/outputs/bundle/release/RELEASE-CANDIDATE-SHA.txt
fi
