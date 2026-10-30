"""Génère les médias TEMPORAIRES du site (python3 scripts/gen_media.py, depuis site/).

- Hero : descente continue nuages → ville → fenêtre → intérieur (images webp pour le canvas)
  + une vidéo de référence « hero-descente-nuages-ville-interieur.mp4 » (= le plan à tourner).
- Ciel : boucle de nuages (mot ESTALIA + fond du contact).
- Métiers et films : clips à partir des photos du dépôt et du vrai film de la villa.
Les nuages sont procéduraux (scripts/clouds.py) : à remplacer par de vraies prises de vue.
"""
import os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
import clouds as C

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(ROOT)
PHOTOS = os.path.join(REPO, 'public', 'images')
FILM = os.path.join(REPO, 'public', 'videos', 'villa-san-peire.mp4')
OUT = os.path.join(ROOT, 'public', 'media')
ONLY = set(sys.argv[1:])  # ex. : hero ciel clips

def run(*args):
    subprocess.run(list(args), check=True)

def ease(t):  # easeInOutSine
    return 0.5 - 0.5 * np.cos(np.pi * np.clip(t, 0, 1))

def seg(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)

def film_frames(start, dur, n, w, h):
    """Images du film de la villa, recadrées en w×h (cover)."""
    d = tempfile.mkdtemp()
    run('ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', FILM,
        '-vf', f'fps={n / dur},scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}',
        '-frames:v', str(n), os.path.join(d, 'i_%03d.png'))
    files = sorted(os.listdir(d))
    return [np.asarray(Image.open(os.path.join(d, f)).convert('RGB'), np.float32) for f in files]

def push_in(img, w, h, zoom, cx, cy):
    """Zoom centré sur (cx, cy) en fraction de l'image source, sortie w×h (cover)."""
    W, H = img.size
    base = max(w / W, h / H)
    cw, ch = w / (base * zoom), h / (base * zoom)
    x0 = min(max(cx * W - cw / 2, 0), W - cw); y0 = min(max(cy * H - ch / 2, 0), H - ch)
    return np.asarray(img.resize((w, h), Image.LANCZOS, box=(x0, y0, x0 + cw, y0 + ch)), np.float32)

def hero(name, w, h, n, quality):
    """Descente : 0–.40 nuages · .32–.52 voile · .46–.84 ville + poussée vers la fenêtre · .80–1 intérieur."""
    d = os.path.join(OUT, 'hero', name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    paris = Image.open(os.path.join(PHOTOS, 'paris-poster.jpg')).convert('RGB')
    n_in = max(8, int(n * 0.22))
    interior = film_frames(2.2, 5.0, n_in, w, h)
    portrait = h > w
    for i in range(n):
        t = i / (n - 1)
        # 1. nuages : l'altitude baisse, la caméra s'incline vers le bas
        if t < 0.52:
            a = ease(seg(t, 0, 0.44))
            cam_h = 1.0 - 0.97 * a
            horizon = (0.46 if portrait else 0.42) - 0.26 * a
            frame = C.render(w, h, cam_h, 9 * a + 2 * t, horizon=horizon, fov=1.6 if portrait else 1.0)
            frame = C.whiteout(frame, ease(seg(t, 0.30, 0.46)), seed_v=t * 0.4)
        # 2. la ville sous le voile, puis poussée vers la fenêtre du balcon
        if t >= 0.44:
            z = 1.0 + 4.2 * ease(seg(t, 0.5, 0.92)) ** 1.8
            city = push_in(paris, w, h, z, 0.345, 0.615)
            k = ease(seg(t, 0.44, 0.56))  # le voile se lève
            city = C.whiteout(city, 1 - k, seed_v=t * 0.4)
            frame = city if t >= 0.52 else frame * (1 - seg(t, 0.44, 0.52)) + city * seg(t, 0.44, 0.52)
        # 3. on entre : l'intérieur (vrai film) apparaît par la fenêtre
        if t >= 0.78:
            j = min(int(seg(t, 0.78, 1.0) * (len(interior) - 1)), len(interior) - 1)
            zi = 1.35 - 0.35 * ease(seg(t, 0.78, 1.0))
            inner = push_in(Image.fromarray(interior[j].astype(np.uint8)), w, h, zi, 0.5, 0.5)
            k = ease(seg(t, 0.78, 0.9))
            frame = frame * (1 - k) + inner * k
        im = Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8))
        im.save(os.path.join(d, f'f_{i + 1:03d}.webp'), quality=quality, method=6)
    return d

def mp4_from_frames(d, out, fps=30):
    run('ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', os.path.join(d, 'f_%03d.webp'),
        '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out)

def sky_loop(out, w=1280, h=720, secs=16, fps=24):
    """Boucle parfaite : la caméra avance d'exactement une période de texture."""
    d = tempfile.mkdtemp(); n = secs * fps
    period = 1 / 0.075  # période de TEX (et 2 périodes de TEX2)
    for i in range(n):
        frame = C.render(w, h, 0.55, period * i / n, horizon=0.62, drift=0.0)
        Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8)).save(os.path.join(d, f'f_{i + 1:03d}.png'))
    run('ffmpeg', '-v', 'error', '-y', '-framerate', str(fps), '-i', os.path.join(d, 'f_%03d.png'),
        '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out)
    run('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(d, 'f_001.png'), '-q:v', '4', out.replace('.mp4', '.jpg'))

def still_clip(src, out, z0, z1, px, py, dur=8):
    """Plan lent (dolly) à partir d'une photo."""
    n = dur * 30
    run('ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', os.path.join(PHOTOS, src), '-t', str(dur), '-filter_complex',
        f"scale=4096:-1,zoompan=z='{z0}+({z1}-{z0})*(0.5-0.5*cos(PI*on/{n}))':"
        f"x='(iw-iw/zoom)/2+({px})*(iw-iw/zoom)/2*(on/{n}-0.5)*2':y='(ih-ih/zoom)/2+({py})*(ih-ih/zoom)/2*(on/{n}-0.5)*2':"
        f"d={n}:s=1280x720:fps=30,eq=contrast=1.04:saturation=0.95,format=yuv420p",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-movflags', '+faststart', '-an', out)
    run('ffmpeg', '-v', 'error', '-y', '-ss', '3', '-i', out, '-frames:v', '1', '-q:v', '4', out.replace('.mp4', '.jpg'))

def film_clip(start, dur, out):
    """Extrait muet du vrai film, recadré 16:9."""
    run('ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', str(dur), '-i', FILM,
        '-vf', 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720', '-c:v', 'libx264',
        '-crf', '25', '-preset', 'slow', '-an', '-movflags', '+faststart', out)
    run('ffmpeg', '-v', 'error', '-y', '-ss', '1', '-i', out, '-frames:v', '1', '-q:v', '4', out.replace('.mp4', '.jpg'))

if __name__ == '__main__':
    V = os.path.join(OUT, 'videos'); F = os.path.join(OUT, 'films'); I = os.path.join(OUT, 'images')
    for p in (V, F, I): os.makedirs(p, exist_ok=True)
    if not ONLY or 'hero' in ONLY:
        dd = hero('desktop', 1280, 720, 150, 60)
        hero('mobile', 720, 1280, 90, 55)
        mp4_from_frames(dd, os.path.join(V, 'hero-descente-nuages-ville-interieur.mp4'))
    if not ONLY or 'ciel' in ONLY:
        sky_loop(os.path.join(V, 'ciel-nuages-boucle.mp4'))
    if not ONLY or 'clips' in ONLY:
        still_clip('paris-poster.jpg', os.path.join(V, 'metier-commerce-vitrine-et-produits.mp4'), 1.15, 1.0, 0.6, 0)
        film_clip(13, 10, os.path.join(V, 'metier-agence-immobiliere-visite-villa.mp4'))
        still_clip('villa-poster.jpg', os.path.join(V, 'metier-camping-hotel-piscine-terrasse.mp4'), 1.0, 1.16, 0.5, 0.2)
        still_clip('chateau-poster.jpg', os.path.join(V, 'metier-notaire-facade-de-l-etude.mp4'), 1.12, 1.0, 0, -0.4)
        still_clip('hero-poster.jpg', os.path.join(F, 'film-hotel-domaine-et-jardins.mp4'), 1.0, 1.18, 0, 0.3)
        still_clip('domaine-poster.jpg', os.path.join(F, 'film-camping-vallee-au-matin.mp4'), 1.0, 1.15, -0.6, 0)
        film_clip(0, 9, os.path.join(F, 'villa-san-peire-extrait.mp4'))
        # le film complet, avec le son, pour le lecteur plein écran
        run('ffmpeg', '-v', 'error', '-y', '-i', FILM, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-crf', '25',
            '-preset', 'slow', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', os.path.join(F, 'villa-san-peire.mp4'))
        # images des moments calmes (vrais plans du film)
        for t, name in ((4.5, 'calme-interieur-jour'), (48, 'calme-interieur-nuit'), (38, 'calme-patio')):
            run('ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', FILM, '-frames:v', '1', '-q:v', '3', os.path.join(I, name + '.jpg'))
    print('ok')
