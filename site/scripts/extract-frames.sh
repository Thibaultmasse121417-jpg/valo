#!/usr/bin/env bash
# Découpe VOTRE vidéo hero en images pour le canvas piloté au scroll.
# Usage : npm run frames -- chemin/vers/hero.mp4
#   → public/media/frames/desktop/f_001.webp … (16:9, 1600 px, 120 images)
#   → public/media/frames/mobile/f_001.webp  … (9:16, 720 px, 72 images, recadrage centré)
# Si vous changez le nombre d'images, mettez à jour FRAMES dans src/main.js.
set -e
IN=${1:?"Indiquez la vidéo source : npm run frames -- hero.mp4"}
OUT=public/media/frames
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
mkdir -p $OUT/desktop $OUT/mobile && rm -f $OUT/desktop/*.webp $OUT/mobile/*.webp
ffmpeg -v error -y -i "$IN" -vf "fps=120/$DUR,scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900" -frames:v 120 -c:v libwebp -quality 62 $OUT/desktop/f_%03d.webp
ffmpeg -v error -y -i "$IN" -vf "fps=72/$DUR,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" -frames:v 72 -c:v libwebp -quality 60 $OUT/mobile/f_%03d.webp
echo "OK : $(ls $OUT/desktop | wc -l) images ordinateur, $(ls $OUT/mobile | wc -l) images mobile."
