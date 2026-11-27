#!/usr/bin/env bash
set -euo pipefail

# Cross-Platform Parity Builder for macOS (.app + .zip) and Linux (ELF binary + .tar.gz)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="$(python3 -c "import json; print(json.load(open('$SCRIPT_DIR/app_meta.json'))['exe_name'])")"
OS_NAME="$(uname -s)"

python3 -m pip install --quiet --upgrade pyinstaller pywebview flask psutil pillow

echo "=== Building $APP_NAME for $OS_NAME ==="
if [[ "$OS_NAME" == "Darwin" ]]; then
  ICON_ARG=""
  if [[ -f "$REPO_DIR/assets/nextwave/icon-1024.png" ]]; then
    ICON_ARG="--icon=$REPO_DIR/assets/nextwave/icon-1024.png"
  elif [[ -f "$REPO_DIR/assets/windows/icon_256.png" ]]; then
    ICON_ARG="--icon=$REPO_DIR/assets/windows/icon_256.png"
  fi
  EXTRA_ARGS=""
  if [[ -f "$REPO_DIR/space_guard_agent.py" ]]; then
    EXTRA_ARGS="--add-data $REPO_DIR/space_guard_agent.py:."
  fi
  pyinstaller --noconfirm --clean --windowed --name "$APP_NAME" $ICON_ARG \
    --distpath "$REPO_DIR/dist_macos" \
    --workpath "$SCRIPT_DIR/.build_macos" \
    --paths "$SCRIPT_DIR" \
    --add-data "$SCRIPT_DIR/app_meta.json:." \
    --add-data "$SCRIPT_DIR/ui:ui" \
    --add-data "$REPO_DIR/assets/windows:assets" \
    $EXTRA_ARGS \
    --hidden-import=app_engine \
    --hidden-import=platform_exclusive \
    --hidden-import=flask \
    --hidden-import=psutil \
    --collect-all=webview \
    "$SCRIPT_DIR/launcher.py"
  cd "$REPO_DIR/dist_macos"
  ditto -c -k --sequesterRsrc --keepParent "$APP_NAME.app" "${APP_NAME}-macOS.zip"
  echo "Built macOS release zip: $REPO_DIR/dist_macos/${APP_NAME}-macOS.zip"
else
  EXTRA_ARGS=""
  if [[ -f "$REPO_DIR/space_guard_agent.py" ]]; then
    EXTRA_ARGS="--add-data $REPO_DIR/space_guard_agent.py:."
  fi
  pyinstaller --noconfirm --clean --onefile --windowed --name "$APP_NAME" \
    --distpath "$REPO_DIR/dist_linux" \
    --workpath "$SCRIPT_DIR/.build_linux" \
    --paths "$SCRIPT_DIR" \
    --add-data "$SCRIPT_DIR/app_meta.json:." \
    --add-data "$SCRIPT_DIR/ui:ui" \
    --add-data "$REPO_DIR/assets/windows:assets" \
    $EXTRA_ARGS \
    --hidden-import=app_engine \
    --hidden-import=platform_exclusive \
    --hidden-import=flask \
    --hidden-import=psutil \
    --collect-all=webview \
    "$SCRIPT_DIR/launcher.py"
  cd "$REPO_DIR/dist_linux"
  tar -czf "${APP_NAME}-Linux-x86_64.tar.gz" "$APP_NAME"
  echo "Built Linux release archive: $REPO_DIR/dist_linux/${APP_NAME}-Linux-x86_64.tar.gz"
fi
