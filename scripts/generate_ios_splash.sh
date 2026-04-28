#!/bin/bash
SPLASH_SRC="assets/splash.png"
SPLASH_DARK_SRC="assets/splash-dark.png"
DEST="ios/App/App/Assets.xcassets/Splash.imageset"

# Resize function
resize_splash() {
  SRC=$1
  FILENAME=$2
  echo "Generating $FILENAME (2732 x 2732)..."
  sips -z 2732 2732 "$SRC" --out "$DEST/$FILENAME"
}

# Universal Splash
resize_splash "$SPLASH_SRC" "Default@1x~universal~anyany.png"
resize_splash "$SPLASH_SRC" "Default@2x~universal~anyany.png"
resize_splash "$SPLASH_SRC" "Default@3x~universal~anyany.png"

# Universal Dark Splash
resize_splash "$SPLASH_DARK_SRC" "Default@1x~universal~anyany-dark.png"
resize_splash "$SPLASH_DARK_SRC" "Default@2x~universal~anyany-dark.png"
resize_splash "$SPLASH_DARK_SRC" "Default@3x~universal~anyany-dark.png"

echo "Splash screens generated successfully!"
