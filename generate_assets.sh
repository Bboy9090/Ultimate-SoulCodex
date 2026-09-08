#!/bin/bash

ICON_SRC="icon.png"
SPLASH_SRC="splash.png"

ASSETS_DIR="ios/App/App/Assets.xcassets"
ICON_SET="$ASSETS_DIR/AppIcon.appiconset"
SPLASH_SET="$ASSETS_DIR/Splash.imageset"

echo "Resizing App Icons..."

# iPhone
sips -z 40 40   "$ICON_SRC" --out "$ICON_SET/icon-20x20@2x.png"
sips -z 60 60   "$ICON_SRC" --out "$ICON_SET/icon-20x20@3x.png"
sips -z 58 58   "$ICON_SRC" --out "$ICON_SET/icon-29x29@2x.png"
sips -z 87 87   "$ICON_SRC" --out "$ICON_SET/icon-29x29@3x.png"
sips -z 80 80   "$ICON_SRC" --out "$ICON_SET/icon-40x40@2x.png"
sips -z 120 120 "$ICON_SRC" --out "$ICON_SET/icon-40x40@3x.png"
sips -z 120 120 "$ICON_SRC" --out "$ICON_SET/icon-60x60@2x.png"
sips -z 180 180 "$ICON_SRC" --out "$ICON_SET/icon-60x60@3x.png"

# iPad
sips -z 20 20   "$ICON_SRC" --out "$ICON_SET/icon-20x20@1x.png"
sips -z 29 29   "$ICON_SRC" --out "$ICON_SET/icon-29x29@1x.png"
sips -z 40 40   "$ICON_SRC" --out "$ICON_SET/icon-40x40@1x.png"
sips -z 76 76   "$ICON_SRC" --out "$ICON_SET/icon-76x76@1x.png"
sips -z 152 152 "$ICON_SRC" --out "$ICON_SET/icon-76x76@2x.png"
sips -z 167 167 "$ICON_SRC" --out "$ICON_SET/icon-83.5x83.5@2x.png"

# App Store
sips -z 1024 1024 "$ICON_SRC" --out "$ICON_SET/icon-1024x1024@1x.png"

echo "Resizing Splash Screens..."

# Splash Screens
sips -z 2732 2048 "$SPLASH_SRC" --out "$SPLASH_SET/Default@2x~universal~anyany.png"
sips -z 2732 2048 "$SPLASH_SRC" --out "$SPLASH_SET/Default@3x~universal~anyany.png"
sips -z 2732 2048 "$SPLASH_SRC" --out "$SPLASH_SET/Default@1x~universal~anyany-dark.png"
sips -z 2732 2048 "$SPLASH_SRC" --out "$SPLASH_SET/Default@2x~universal~anyany-dark.png"
sips -z 2732 2048 "$SPLASH_SRC" --out "$SPLASH_SET/Default@3x~universal~anyany-dark.png"

echo "Asset generation complete."
