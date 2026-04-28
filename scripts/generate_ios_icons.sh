#!/bin/bash
ICON_SRC="assets/icon.png"
DEST="ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Helper function to resize
resize() {
  SIZE=$1
  FILENAME=$2
  echo "Generating $FILENAME ($SIZE x $SIZE)..."
  sips -z $SIZE $SIZE "$ICON_SRC" --out "$DEST/$FILENAME"
}

# iPhone
resize 40  "icon-20x20@2x.png"
resize 60  "icon-20x20@3x.png"
resize 58  "icon-29x29@2x.png"
resize 87  "icon-29x29@3x.png"
resize 80  "icon-40x40@2x.png"
resize 120 "icon-40x40@3x.png"
resize 120 "icon-60x60@2x.png"
resize 180 "icon-60x60@3x.png"

# iPad
resize 20  "icon-20x20@1x.png"
resize 29  "icon-29x29@1x.png"
resize 40  "icon-40x40@1x.png"
resize 76  "icon-76x76@1x.png"
resize 152 "icon-76x76@2x.png"
resize 167 "icon-83.5x83.5@2x.png"

# Marketing
resize 1024 "icon-1024x1024@1x.png"
resize 1024 "AppIcon-512@2x.png"

echo "Icons generated successfully!"
