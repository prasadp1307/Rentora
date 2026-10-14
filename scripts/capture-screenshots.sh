#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/screenshots"
BASE="${1:-http://localhost:3000}"

mkdir -p "$OUT"

CHROME="${CHROME:-google-chrome}"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

capture() {
  local name="$1"
  local path="$2"
  local width="${3:-1920}"
  local height="${4:-1080}"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --disable-extensions \
    --no-first-run \
    --no-default-browser-check \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${width},${height}" \
    --user-agent="$UA" \
    --virtual-time-budget=25000 \
    --run-all-compositor-stages-before-draw \
    --screenshot="$OUT/$name" \
    "$BASE$path"
  echo "Saved $OUT/$name (${width}x${height})"
}

capture "home.png" "/" 1920 2200
capture "browse-properties.png" "/properties" 1920 1400
capture "login.png" "/login"
capture "register.png" "/register"
capture "about.png" "/about"
