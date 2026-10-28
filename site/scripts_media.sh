#!/usr/bin/env bash
# Génère les médias TEMPORAIRES à partir des photos du dépôt.
set -e
SRC=../public/images
OUT=public/media
# clip(name, src, zoom-from, zoom-to, pan-x(-1..1), pan-y)
clip() {
  local name=$1 src=$2 z0=$3 z1=$4 px=$5 py=$6 dur=8 fps=30
  local n=$((dur*fps))
  ffmpeg -v error -y -loop 1 -i $SRC/$src -t $dur -filter_complex "\
scale=4096:-1,\
zoompan=z='$z0+($z1-$z0)*(0.5-0.5*cos(PI*on/$n))':x='(iw-iw/zoom)/2+($px)*(iw-iw/zoom)/2*(on/$n-0.5)*2':y='(ih-ih/zoom)/2+($py)*(ih-ih/zoom)/2*(on/$n-0.5)*2':d=$n:s=1280x720:fps=$fps,\
eq=contrast=1.04:saturation=0.95,noise=alls=6:allf=t,format=yuv420p" \
  -c:v libx264 -preset slow -crf 27 -movflags +faststart -an $OUT/videos/$name.mp4
  ffmpeg -v error -y -i $SRC/$src -vf scale=1600:-1 -q:v 4 $OUT/images/$name.jpg
}
[ -z "$HERO_ONLY" ] && clip hotel    hero-poster.jpg     1.00 1.18  0.0  0.3
[ -z "$HERO_ONLY" ] && clip commerce paris-poster.jpg    1.15 1.00  0.6  0.0
[ -z "$HERO_ONLY" ] && clip camping  domaine-poster.jpg  1.00 1.15 -0.6  0.0
[ -z "$HERO_ONLY" ] && clip notaire  chateau-poster.jpg  1.12 1.00  0.0 -0.4
[ -z "$HERO_ONLY" ] && clip immo     villa-poster.jpg    1.00 1.16  0.5  0.2

# Séquence hero : lente plongée de drone vers le domaine (image par image)
hero() {
  local dir=$1 w=$2 h=$3 n=$4 q=$5 crop=$6
  rm -f $OUT/frames/$dir/*
  ffmpeg -v error -y -loop 1 -i $SRC/hero-poster.jpg -frames:v $n -filter_complex "\
${crop}scale=$((w*4)):-1,\
zoompan=z='1+0.9*pow(on/$n,1.6)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(0.5-0.22*pow(on/$n,1.2))':d=$n:s=${w}x${h}:fps=30,\
eq=contrast=1.05:saturation=0.92" \
  -c:v libwebp -quality $q $OUT/frames/$dir/f_%03d.webp
}
hero desktop 1600 900 120 62 ''
hero mobile  720  1280 72 60 'crop=ih*9/16:ih:iw*0.5-ih*9/32:0,'
