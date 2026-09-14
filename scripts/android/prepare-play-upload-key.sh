#!/usr/bin/env bash
set -euo pipefail

KEYSTORE_PATH="${KEYSTORE_PATH:-android/app/soul-codex-release.keystore}"
KEY_ALIAS="${ANDROID_KEY_ALIAS:-soul-codex-upload}"

if ! command -v keytool >/dev/null 2>&1; then
  echo "ERROR: keytool is required (install a JDK)." >&2
  exit 1
fi

if [[ -f "$KEYSTORE_PATH" ]]; then
  if [[ -z "${ANDROID_KEYSTORE_PASSWORD:-}" ]]; then
    echo "Existing keystore found at $KEYSTORE_PATH. Set ANDROID_KEYSTORE_PASSWORD to validate it." >&2
    exit 1
  fi
  keytool -list -keystore "$KEYSTORE_PATH" -storepass "$ANDROID_KEYSTORE_PASSWORD" -alias "$KEY_ALIAS" >/dev/null
  echo "Validated existing Play upload keystore: $KEYSTORE_PATH"
else
  : "${ANDROID_KEYSTORE_PASSWORD:?Set ANDROID_KEYSTORE_PASSWORD before generating a new upload key}"
  : "${ANDROID_KEY_PASSWORD:?Set ANDROID_KEY_PASSWORD before generating a new upload key}"
  mkdir -p "$(dirname "$KEYSTORE_PATH")"
  keytool -genkeypair \
    -v \
    -keystore "$KEYSTORE_PATH" \
    -storepass "$ANDROID_KEYSTORE_PASSWORD" \
    -keypass "$ANDROID_KEY_PASSWORD" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 4096 \
    -validity 10000 \
    -dname "CN=Soul Codex Upload, OU=Mobile Release, O=Soul Codex, L=New York, ST=New York, C=US"
  echo "Generated new Play upload keystore: $KEYSTORE_PATH"
fi

chmod 600 "$KEYSTORE_PATH"

if command -v base64 >/dev/null 2>&1; then
  echo
  echo "GitHub secret names required:"
  echo "  ANDROID_KEYSTORE"
  echo "  ANDROID_KEYSTORE_PASSWORD"
  echo "  ANDROID_KEY_ALIAS"
  echo "  ANDROID_KEY_PASSWORD"
  echo
  echo "To prepare ANDROID_KEYSTORE without printing it to your terminal:"
  echo "  base64 < '$KEYSTORE_PATH' | tr -d '\\n' > /tmp/soul-codex-keystore.b64"
  echo "Then paste the contents of /tmp/soul-codex-keystore.b64 into the GitHub secret field and delete the temp file."
fi
