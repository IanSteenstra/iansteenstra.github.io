#!/usr/bin/env bash
# Generates web-sized WebP derivatives of the site images. Originals are left untouched.
# Requires: cwebp (brew install webp) and sips (built into macOS).
# Usage: tools/optimize-images.sh   (re-run after adding images to images/gallery or images/portfolio)
set -euo pipefail
cd "$(dirname "$0")/../images"

width() { sips -g pixelWidth "$1" | awk '/pixelWidth/{print $2}'; }

# webp <src> <dest> <max-width> <quality>
webp() {
    local src=$1 dest=$2 max=$3 q=$4 resize=0
    [ "$(width "$src")" -gt "$max" ] && resize=$max
    cwebp -quiet -q "$q" -m 6 -resize "$resize" 0 "$src" -o "$dest"
}

mkdir -p gallery/large gallery/thumb portfolio/web

for src in gallery/*.jpg gallery/*.jpeg gallery/*.png; do
    [ -e "$src" ] || continue
    name=$(basename "${src%.*}")
    webp "$src" "gallery/large/$name.webp" 1600 80
    webp "$src" "gallery/thumb/$name.webp" 480 75
done

for src in portfolio/*.jpg portfolio/*.jpeg portfolio/*.png; do
    [ -e "$src" ] || continue
    webp "$src" "portfolio/web/$(basename "${src%.*}").webp" 800 80
done

webp profile_image_larger.jpg profile-600.webp 600 82

# Favicons from the square profile picture.
sips -s format png -z 32 32 profile-pic.png --out favicon-32.png >/dev/null
sips -s format png -z 180 180 profile-pic.png --out apple-touch-icon.png >/dev/null

echo "Done."
