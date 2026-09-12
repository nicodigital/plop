#!/bin/sh
# Re-encodes the portfolio captures for the web.
#
# The sources are 956x472 VP9 at roughly twice the bitrate these need: they
# are UI scroll captures, shown muted, in a band that never renders them
# larger than 640 CSS px. Encoding at 720 wide keeps a margin over the widest
# tile without paying for pixels that are thrown away on every screen.
#
# Rendered tile widths, for reference:
#   390px viewport  -> 320 CSS px
#   1440px viewport -> 490 CSS px
#   very wide       -> 640 CSS px (capped)
#
# They are also trimmed. The sources run 13 to 38 seconds, but a tile is
# only ever watched for a few of them before it drifts on, and the opening
# seconds are the valuable ones anyway: that is the hero and the first
# section of the client's site. Ten seconds on loop is what a visitor
# actually sees, and it is a third of the bytes.
set -e
OUT=public/assets/portfolio
WIDTH=720
SECONDS_KEPT=10
START=0.5
mkdir -p "$OUT"

for pair in MOVIRUTA:moviruta BERCETCHE:bercetche ADIUM:adium ALOHAUS:alohaus \
            NOMIA-2:nomia SILENTROOM:silentroom BUENAVENTURA:buenaventura \
            JEYDI:jeydi VETCROSS:vetcross PETCREMATION:petcremation; do
  src="assets/portfolio/${pair%%:*}.webm"
  slug="${pair##*:}"

  ffmpeg -v error -y -ss "$START" -t "$SECONDS_KEPT" -i "$src" -an \
    -vf "scale=${WIDTH}:-2:flags=lanczos" \
    -c:v libvpx-vp9 -crf 36 -b:v 0 \
    -row-mt 1 -deadline good -cpu-used 3 "$OUT/project-$slug.webm"

  ffmpeg -v error -y -ss "$START" -t "$SECONDS_KEPT" -i "$src" -an \
    -vf "scale=${WIDTH}:-2:flags=lanczos" \
    -c:v libx264 -crf 28 -preset slow -profile:v main -pix_fmt yuv420p \
    -movflags +faststart "$OUT/project-$slug.mp4"

  # Poster from a frame far enough in that the capture has settled.
  ffmpeg -v error -y -ss 1 -i "$src" -frames:v 1 \
    -vf "scale=${WIDTH}:-2:flags=lanczos" \
    -c:v libwebp -quality 72 "$OUT/project-$slug-poster.webp"
done

echo "PORTFOLIO ENCODE DONE"
du -sh "$OUT"
