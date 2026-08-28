#!/usr/bin/env bash
# Encode web derivatives from canonical originals. Never moves files.
#
# Usage: bash tools/optimize-images.sh
# Requires ffmpeg with libwebp.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="assets/images/_originals"
OUT="assets/images"
mkdir -p "$SRC" "$OUT"

encode() {
  local in="$1" dest="$2" width="$3" quality="$4"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$in" \
    -vf "scale='min($width,iw)':-2:flags=lanczos" \
    -map_metadata -1 \
    -c:v libwebp -quality "$quality" -compression_level 6 -preset photo \
    "$dest"
}

# Keep exactly two web derivatives per photographic image:
# - 800px thumbnails for inline display (loaded while browsing)
# - high-quality lightbox files (loaded only after interaction)
# The encoder never upscales sources smaller than the requested width.
# The logo is the sole exception: one 672px file covers every display role.
#
# name|source|thumb_w|lightbox_w
JOBS="
hero|hero.jpg|800|3200
galerie1|galerie1.jpg|800|3200
galerie2|galerie2.jpg|800|3200
dirigent|dirigent.jpg|600|900
vorstand|vorstand.png|800|1000
concert-licht-schatten|flyer-licht-schatten.webp|800|2400
concert-into-the-west|concert-into-the-west.png|800|2400
concert-across-borders|concert-across-borders.jpg|800|2800
concert-misty-mountains|concert-misty-mountains.png|800|3200
concert-green-gold|concert-green-gold.png|800|2800
across-orchestra|across-orchestra.jpeg|800|3200
across-brass|across-brass.jpeg|800|3200
orchestra-weekend-2026|orchestra-weekend-2026.jpeg|800|3200
misty-dirigent|misty-dirigent.jpg|800|3200
logo|logo.png|336|672
"

echo "$JOBS" | while IFS='|' read -r name src thumb full; do
  [ -n "${name:-}" ] || continue
  in="$SRC/$src"
  if [ ! -e "$in" ]; then
    echo "skip (missing): $src" >&2
    continue
  fi
  if [ "$name" = "logo" ]; then
    encode "$in" "$OUT/${name}.webp" "$full" 84
    printf '%-28s %s\n' "$name" "$(du -h "$OUT/${name}.webp" | awk '{print $1}')"
    continue
  fi
  encode "$in" "$OUT/${name}-thumb.webp" "$thumb" 78
  encode "$in" "$OUT/${name}.webp" "$full" 84
  printf '%-28s %s\n' "$name" "$(du -h "$OUT/${name}-thumb.webp" "$OUT/${name}.webp" | awk '{print $1}' | xargs echo)"
done

# Share image for Open Graph (JPEG, ~1200px).
if [ -e "$SRC/hero.jpg" ]; then
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$SRC/hero.jpg" \
    -vf "scale=1200:-2:flags=lanczos" -map_metadata -1 -q:v 4 \
    "$OUT/og.jpg"
fi

echo
echo "Originals remain in $SRC (not deployed)."
echo "Web derivatives: $(du -ch "$OUT"/*.webp 2>/dev/null | tail -1 | cut -f1)"
