#!/bin/bash

# Test the app pages using chromium
/opt/pw-browsers/chromium \
  --headless=new \
  --dump-dom \
  "http://localhost:3000/" 2>/dev/null | grep -A 5 "id=\"root\"" | head -20

echo "---TIMELINE PAGE---"
/opt/pw-browsers/chromium \
  --headless=new \
  --dump-dom \
  "http://localhost:3000/timeline" 2>/dev/null | grep -E "Year|Personal Year|Month|Your Current" | head -10

echo "---COMPATIBILITY PAGE---"
/opt/pw-browsers/chromium \
  --headless=new \
  --dump-dom \
  "http://localhost:3000/compatibility" 2>/dev/null | head -300 | tail -100
