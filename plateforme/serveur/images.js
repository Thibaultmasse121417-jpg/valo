/* Préparation des photos pour le portant, sur le serveur.

   photo du commerçant → original (conservé) → masque (IA de détourage) →
   image du portant 660 × 876 (pièce cadrée, cintre virtuel) + vignette.

   Modèle : silueta (famille U²-Net, licence Apache 2.0) avec onnxruntime-node. */
import sharp from 'sharp'
import * as ort from 'onnxruntime-node'
import { config } from './config.js'

export const SORTIE = { l: 660, h: 876 }
const ENTREE = 320
const CROCHET_HAUT = 13

let session = null
async function modele () {
  if (!session) session = await ort.InferenceSession.create(config.modele, { graphOptimizationLevel: 'all', intraOpNumThreads: 2 })
  return session
}

/* Photo envoyée → JPEG orienté, 2000 px au plus. Refuse ce qui n'est pas une image. */
export async function normaliserOriginal (buffer) {
  const img = sharp(buffer, { failOn: 'error', limitInputPixels: 60e6 }).rotate()
  const meta = await img.metadata()
  if (!meta.width || !meta.height) throw new Error('Image illisible')
  const sortie = await img.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer({ resolveWithObject: true })
  return { buffer: sortie.data, largeur: sortie.info.width, hauteur: sortie.info.height }
}

/* Masque de la pièce, en niveaux de gris à la taille de l'original (PNG). */
export async function calculerMasque (original) {
  const { data: rgb } = await sharp(original).resize(ENTREE, ENTREE, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const n = ENTREE * ENTREE
  const x = new Float32Array(3 * n)
  const moy = [0.485, 0.456, 0.406]; const ec = [0.229, 0.224, 0.225]
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) x[c * n + i] = (rgb[i * 3 + c] / 255 - moy[c]) / ec[c]
  const s = await modele()
  const out = await s.run({ [s.inputNames[0]]: new ort.Tensor('float32', x, [1, 3, ENTREE, ENTREE]) })
  const m = out[s.outputNames[0]].data
  let min = Infinity; let max = -Infinity
  for (let i = 0; i < n; i++) { if (m[i] < min) min = m[i]; if (m[i] > max) max = m[i] }
  const brut = new Uint8ClampedArray(n)
  for (let i = 0; i < n; i++) brut[i] = ((m[i] - min) / (max - min + 1e-8)) * 255
  const propre = nettoyer(brut)
  const alpha = Buffer.alloc(n)
  for (let i = 0; i < n; i++) alpha[i] = Math.max(0, Math.min(255, (propre[i] - 40) * (255 / 160)))
  const { width, height } = await sharp(original).metadata()
  return sharp(alpha, { raw: { width: ENTREE, height: ENTREE, channels: 1 } })
    .resize(width, height, { fit: 'fill', kernel: 'cubic' }).png().toBuffer()
}

// Garde la pièce et ce qui la touche ; retire les taches isolées.
function nettoyer (m) {
  const N = ENTREE; const lab = new Int32Array(N * N); const aires = [0]; const pile = []
  for (let i = 0; i < N * N; i++) {
    if (m[i] < 128 || lab[i]) continue
    const id = aires.length; let aire = 0
    pile.push(i); lab[i] = id
    while (pile.length) {
      const p = pile.pop(); aire++
      const x = p % N; const y = (p / N) | 0
      if (x > 0 && !lab[p - 1] && m[p - 1] >= 128) { lab[p - 1] = id; pile.push(p - 1) }
      if (x < N - 1 && !lab[p + 1] && m[p + 1] >= 128) { lab[p + 1] = id; pile.push(p + 1) }
      if (y > 0 && !lab[p - N] && m[p - N] >= 128) { lab[p - N] = id; pile.push(p - N) }
      if (y < N - 1 && !lab[p + N] && m[p + N] >= 128) { lab[p + N] = id; pile.push(p + N) }
    }
    aires.push(aire)
  }
  const max = Math.max(...aires)
  const proche = new Uint8Array(N * N)
  for (let i = 0; i < N * N; i++) if (lab[i] && aires[lab[i]] >= max * 0.08) proche[i] = 1
  for (let pass = 0; pass < 3; pass++) {
    const c = proche.slice()
    for (let i = 0; i < N * N; i++) {
      if (c[i]) continue
      const x = i % N
      if ((x > 0 && c[i - 1]) || (x < N - 1 && c[i + 1]) || (i >= N && c[i - N]) || (i < N * N - N && c[i + N])) proche[i] = 1
    }
  }
  const out = new Uint8ClampedArray(N * N)
  for (let i = 0; i < N * N; i++) out[i] = proche[i] ? m[i] : 0
  return out
}

/* Masque (PNG) → valeurs brutes, cadre de la pièce, présence d'un cintre, largeur d'épaules. */
async function analyser (masque) {
  const { data, info } = await sharp(masque).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  let x0 = W; let y0 = H; let x1 = -1; let y1 = -1
  for (let y = 0; y < H; y++) {
    const o = y * W
    for (let x = 0; x < W; x++) if (data[o + x] > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  if (x1 < 0) return null
  const boite = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
  const largeurLigne = (y) => {
    let g = -1; let d = -1; const o = y * W
    for (let x = x0; x <= x1; x++) if (data[o + x] > 128) { if (g < 0) g = x; d = x }
    return g < 0 ? 0 : d - g + 1
  }
  const cintre = largeurLigne(Math.round(y0 + boite.h * 0.05)) / boite.w < 0.16
  const epaules = largeurLigne(Math.round(y0 + boite.h * 0.08)) * 0.92 || boite.w * 0.7
  return { boite, cintre, epaules, W, H }
}

function svgCintre (largeur, haut) {
  const cx = SORTIE.l / 2
  const l = Math.max(160, Math.min(560, largeur))
  const yb = haut + 22; const r = 11
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SORTIE.l}" height="${SORTIE.h}">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ddb98e"/><stop offset="1" stop-color="#a87d52"/></linearGradient>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d8d8d"/><stop offset=".5" stop-color="#e4e4e4"/><stop offset="1" stop-color="#8a8a8a"/></linearGradient>
  </defs>
  <path d="M${cx - l / 2} ${yb + 14} Q${cx - l * 0.18} ${haut + 6} ${cx} ${haut + 4} Q${cx + l * 0.18} ${haut + 6} ${cx + l / 2} ${yb + 14}" fill="none" stroke="url(#b)" stroke-width="11" stroke-linecap="round"/>
  <path d="M${cx} ${haut + 6} L${cx} ${CROCHET_HAUT + r} A${r} ${r} 0 0 1 ${cx + 2 * r} ${CROCHET_HAUT + r} L${cx + 2 * r - 1} ${CROCHET_HAUT + r + 7}" fill="none" stroke="url(#m)" stroke-width="3.4" stroke-linecap="round"/>
</svg>`)
}

/* Original + masque + réglages → image du portant (WebP 660 × 876) et vignette.
   reglages : { cintre: 'auto' | 'ajout' | 'mien', echelle: 1, dx: 0, dy: 0 } */
export async function composer (original, masque, reglages = {}) {
  const a = await analyser(masque)
  if (!a) throw new Error('Aucune pièce trouvée sur la photo')
  // 'aucun' : accessoire (sac, bijou, chaussure), posé au centre sans cintre.
  const cintre = ['ajout', 'mien', 'aucun'].includes(reglages.cintre) ? reglages.cintre : (a.cintre ? 'mien' : 'ajout')
  const echelle = clamp(Number(reglages.echelle) || 1, 0.3, 2.5)
  const dx = clamp(Number(reglages.dx) || 0, -400, 400)
  const dy = clamp(Number(reglages.dy) || 0, -400, 400)
  const { boite: b } = a
  const haut = cintre === 'ajout' ? 64 : CROCHET_HAUT
  const s = (cintre === 'aucun' ? Math.min(560 / b.w, 640 / b.h) : Math.min(620 / b.w, (SORTIE.h - haut - 26) / b.h)) * echelle
  const w = Math.max(1, Math.round(b.w * s)); const h = Math.max(1, Math.round(b.h * s))
  const left = Math.round((SORTIE.l - w) / 2 + dx)
  const top = Math.round((cintre === 'aucun' ? (SORTIE.h - h) / 2 : haut) + dy)

  // Pièce détourée, recadrée et mise à l'échelle.
  const alpha = await sharp(masque).greyscale().extract({ left: b.x, top: b.y, width: b.w, height: b.h }).raw().toBuffer()
  const rgb = await sharp(original).extract({ left: b.x, top: b.y, width: b.w, height: b.h }).removeAlpha().raw().toBuffer()
  const px = Buffer.alloc(b.w * b.h * 4)
  for (let i = 0, n = b.w * b.h; i < n; i++) {
    px[i * 4] = rgb[i * 3]; px[i * 4 + 1] = rgb[i * 3 + 1]; px[i * 4 + 2] = rgb[i * 3 + 2]; px[i * 4 + 3] = alpha[i]
  }
  const rgba = await sharp(px, { raw: { width: b.w, height: b.h, channels: 4 } }).png().toBuffer()
  // (sharp applique toujours le redimensionnement avant l'ajout de canal : on le fait en deux temps)
  let piece = await sharp(rgba).resize(w, h, { fit: 'fill' }).png().toBuffer()
  // Partie visible dans le cadre (la pièce peut dépasser si on l'agrandit).
  const vx = Math.max(0, -left); const vy = Math.max(0, -top)
  const vw = Math.min(w - vx, SORTIE.l - Math.max(0, left)); const vh = Math.min(h - vy, SORTIE.h - Math.max(0, top))
  const calques = []
  if (cintre === 'ajout') calques.push({ input: svgCintre(a.epaules * s, haut), left: 0, top: 0 })
  if (vw > 0 && vh > 0) {
    if (vx || vy || vw !== w || vh !== h) piece = await sharp(piece).extract({ left: vx, top: vy, width: vw, height: vh }).toBuffer()
    calques.push({ input: piece, left: Math.max(0, left), top: Math.max(0, top) })
  }
  const toile = sharp({ create: { width: SORTIE.l, height: SORTIE.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(calques)
  const png = await toile.png().toBuffer()
  const portant = await sharp(png).webp({ quality: 86, alphaQuality: 90, effort: 5 }).toBuffer()
  const vignette = await sharp(png).resize(220).webp({ quality: 80 }).toBuffer()
  return { portant, vignette, cintre, hex: await couleurDominante(original, masque) }
}

/* Couleur de la pièce (moitié claire des pixels, pour ignorer les ombres). */
export async function couleurDominante (original, masque) {
  const N = 64
  const p = await sharp(original).resize(N, N, { fit: 'fill' }).removeAlpha().raw().toBuffer()
  const q = await sharp(masque).greyscale().resize(N, N, { fit: 'fill' }).raw().toBuffer()
  const px = []
  for (let i = 0; i < N * N; i++) if (q[i] > 230) px.push([p[i * 3], p[i * 3 + 1], p[i * 3 + 2]])
  if (!px.length) return '#888888'
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  px.sort((u, v) => lum(u) - lum(v))
  const d = Math.round(px.length * 0.55)
  const clairs = px.slice(d, Math.max(d + 1, Math.round(px.length * 0.95)))
  const med = (k) => clairs.map((c) => c[k]).sort((u, v) => u - v)[clairs.length >> 1]
  return '#' + [med(0), med(1), med(2)].map((v) => v.toString(16).padStart(2, '0')).join('')
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
