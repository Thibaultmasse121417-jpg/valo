"""Mer de nuages procédurale — PLACEHOLDER en attendant les vraies prises de vue drone/avion.
Rendu en perspective (plan de nuages vu d'en haut), soleil bas et chaud. numpy + Pillow uniquement."""
import numpy as np

def fbm_texture(n=1024, beta=3.2, seed=1):
    """Bruit fractal tuilable (spectre 1/f^beta), normalisé 0..1."""
    r = np.random.default_rng(seed)
    fx = np.fft.fftfreq(n)[:, None]; fy = np.fft.rfftfreq(n)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2); f[0, 0] = 1
    spec = (r.normal(size=f.shape) + 1j * r.normal(size=f.shape)) / f ** (beta / 2)
    spec[0, 0] = 0
    t = np.fft.irfft2(spec, s=(n, n)).astype(np.float32)
    t = (t - t.min()) / (t.max() - t.min())
    return t

def sample(tex, u, v):
    n = tex.shape[0]
    x = (u % 1) * n; y = (v % 1) * n
    x0 = np.floor(x).astype(int) % n; y0 = np.floor(y).astype(int) % n
    x1 = (x0 + 1) % n; y1 = (y0 + 1) % n
    fx = x - np.floor(x); fy = y - np.floor(y)
    a = tex[y0, x0] * (1 - fx) + tex[y0, x1] * fx
    b = tex[y1, x0] * (1 - fx) + tex[y1, x1] * fx
    return a * (1 - fy) + b * fy

def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

C_TOP = np.array([30, 42, 66], np.float32)
C_MID = np.array([96, 108, 134], np.float32)
C_HOR = np.array([240, 200, 158], np.float32)
C_LIT = np.array([255, 244, 228], np.float32)
C_SHADE = np.array([104, 112, 136], np.float32)

TEX = fbm_texture(1024, 3.1, 11)
TEX2 = fbm_texture(512, 2.4, 5)

def render(W, H, cam_h, cam_z, horizon=0.42, drift=0.0, fov=1.0):
    """cam_h : altitude au-dessus du plan de nuages (1 = haut, 0 = au contact)."""
    ys = np.arange(H, dtype=np.float32)[:, None]; xs = np.arange(W, dtype=np.float32)[None, :]
    f = fov * W
    hy = horizon * H
    sky_t = np.clip(ys / hy, 0, 1)
    sky = C_TOP + (C_MID - C_TOP) * sky_t[..., None] ** 0.8
    glow = np.exp(-((xs - W * 0.66) ** 2 / (W * 0.6) ** 2 + np.maximum(hy - ys, 0) ** 2 / (H * 0.07) ** 2))
    sky = sky + (C_HOR - sky) * np.clip(sky_t[..., None] ** 6 * 0.75 + glow[..., None] * 0.85, 0, 1)
    out = np.broadcast_to(sky, (H, W, 3)).copy()

    dy = np.maximum(ys - hy, 0.5)
    z = cam_h * f / dy * 0.9  # profondeur
    u = (xs - W / 2) * z / f + drift
    v = z + cam_z
    s = 0.075
    d = sample(TEX, u * s, v * s) * 0.85 + sample(TEX2, u * s * 2.0, v * s * 2.0) * 0.15
    toward_sun = sample(TEX, u * s - 0.012, (v - 0.35) * s) * 0.85 + sample(TEX2, (u * s - 0.012) * 2.0, (v - 0.35) * s * 2.0) * 0.15
    dens = smooth(0.30, 0.52, d)
    light = np.clip(0.35 + (d - toward_sun) * 4.5 + (d - 0.45) * 1.2, 0, 1)
    col = C_SHADE + (C_LIT - C_SHADE) * light[..., None]
    gaps = C_SHADE * 0.55  # dessous sombre entre les nuages
    cloud = gaps + (col - gaps) * dens[..., None]
    fog = 1 - np.exp(-z / 14.0)
    cloud = cloud + (C_HOR * 0.97 - cloud) * fog[..., None] ** 1.4
    mask = (ys > hy).astype(np.float32)
    edge = smooth(hy, hy + H * 0.02, ys)
    out = out * (1 - edge[..., None]) + cloud * edge[..., None] * mask[..., None] + out * (1 - mask[..., None]) * edge[..., None]
    return out

def whiteout(img, k, seed_v=0.0):
    """Entrée dans le nuage : voile blanc chaud texturé (k : 0..1)."""
    H, W, _ = img.shape
    ys = np.linspace(0, 1, H)[:, None]; xs = np.linspace(0, 1, W)[None, :]
    n = sample(TEX, xs * 0.6 + seed_v, ys * 0.35 + seed_v * 0.5)
    veil = np.array([236, 228, 218], np.float32) * (0.9 + 0.12 * n[..., None])
    a = np.clip(k * (0.75 + 0.5 * n), 0, 1)[..., None]
    return img * (1 - a) + veil * a
