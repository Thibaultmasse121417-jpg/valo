/* De la photo prise au téléphone à la pièce prête pour le portant :
   détourage, nettoyage, cintre, cadrage identique pour toutes les pièces. */

const TAILLE = 320 // taille d'entrée du modèle
export const SORTIE = { l: 660, h: 876 } // format de toutes les pièces du portant
const CROCHET_HAUT = 13 // haut du crochet, aligné sur la tringle

let worker = null
let pret = null
let n = 0
const attente = new Map()

function appel (msg, transfert) {
  return new Promise((resolve, reject) => {
    const id = ++n
    attente.set(id, { resolve, reject })
    worker.postMessage({ ...msg, id }, transfert || [])
  })
}

/* Charge l'outil (une seule fois). progres(p) reçoit 0 → 1 pendant le téléchargement. */
export function preparerOutil (progres = () => {}) {
  if (pret) return pret
  worker = new Worker(new URL('./detourage.worker.js', import.meta.url), { type: 'module' })
  worker.onmessage = (e) => {
    if (e.data.type === 'progres') { progres(e.data.p); return }
    const a = attente.get(e.data.id); if (!a) return
    attente.delete(e.data.id)
    e.data.ok ? a.resolve(e.data) : a.reject(new Error(e.data.erreur))
  }
  worker.onerror = (e) => { for (const a of attente.values()) a.reject(new Error(e.message || 'Erreur du détourage')); attente.clear() }
  const base = new URL('../', location.href)
  pret = appel({ type: 'preparer', modele: new URL('models/silueta.onnx', base).href, wasm: new URL('ort/', base).href })
    .catch((e) => { pret = null; worker?.terminate(); throw e })
  return pret
}

/* Photo du téléphone → toile, orientée et réduite (1600 px au plus). */
export async function chargerPhoto (fichier) {
  let img
  try {
    img = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
  } catch {
    img = await new Promise((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error('Cette photo ne peut pas être lue. Essayez en JPEG ou PNG.'))
      i.src = URL.createObjectURL(fichier)
    })
  }
  const max = 1600
  const k = Math.min(1, max / Math.max(img.width, img.height))
  const c = toile(Math.round(img.width * k), Math.round(img.height * k))
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'
  x.drawImage(img, 0, 0, c.width, c.height)
  img.close?.()
  return c
}

/* Masque de la pièce (toile de même taille que la photo, opacité = pièce). */
export async function calculerMasque (photo) {
  await preparerOutil()
  const petit = toile(TAILLE, TAILLE)
  const px = petit.getContext('2d', { willReadFrequently: true })
  px.drawImage(photo, 0, 0, TAILLE, TAILLE)
  const pixels = px.getImageData(0, 0, TAILLE, TAILLE).data
  const { masque } = await appel({ type: 'masque', pixels }, [pixels.buffer])
  const propre = nettoyer(masque)
  const img = px.createImageData(TAILLE, TAILLE)
  for (let i = 0; i < propre.length; i++) {
    const a = Math.max(0, Math.min(255, (propre[i] - 40) * (255 / 160)))
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = 255
    img.data[i * 4 + 3] = a
  }
  px.putImageData(img, 0, 0)
  const m = toile(photo.width, photo.height)
  const mx = m.getContext('2d', { willReadFrequently: true }); mx.imageSmoothingQuality = 'high'
  mx.drawImage(petit, 0, 0, m.width, m.height)
  return m
}

// Garde la pièce et ce qui la touche ; retire les taches isolées (reflets, objets autour).
function nettoyer (m) {
  const N = TAILLE; const lab = new Int32Array(N * N); const aires = [0]
  const pile = []
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
  const garder = aires.map((a) => a >= max * 0.08)
  // zone proche de ce qu'on garde (pour ne pas couper les bords doux)
  const proche = new Uint8Array(N * N)
  for (let i = 0; i < N * N; i++) if (lab[i] && garder[lab[i]]) proche[i] = 1
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

/* La photo a-t-elle déjà un cintre visible ? (une partie fine qui dépasse en haut) */
export function aUnCintre (masque) {
  const b = boite(masque); if (!b) return false
  const y = Math.round(b.y + b.h * 0.05)
  const d = masque.getContext('2d', { willReadFrequently: true }).getImageData(b.x, y, b.w, 1).data
  let l = 0
  for (let i = 0; i < b.w; i++) if (d[i * 4 + 3] > 128) l++
  return l / b.w < 0.16
}

/* Cadre de la pièce dans le masque. */
export function boite (masque, seuil = 100) {
  const k = Math.min(1, 400 / Math.max(masque.width, masque.height))
  const w = Math.max(1, Math.round(masque.width * k)); const h = Math.max(1, Math.round(masque.height * k))
  const c = toile(w, h); const x = c.getContext('2d', { willReadFrequently: true })
  x.drawImage(masque, 0, 0, w, h)
  const d = x.getImageData(0, 0, w, h).data
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
    if (d[(y * w + i) * 4 + 3] > seuil) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  if (x1 < 0) return null
  return { x: Math.floor(x0 / k), y: Math.floor(y0 / k), w: Math.ceil((x1 - x0 + 1) / k), h: Math.ceil((y1 - y0 + 1) / k) }
}

/* Photo + masque → pièce détourée à la taille de la photo. */
export function detourer (photo, masque) {
  const c = toile(photo.width, photo.height); const x = c.getContext('2d')
  x.drawImage(photo, 0, 0)
  x.globalCompositeOperation = 'destination-in'
  x.drawImage(masque, 0, 0)
  x.globalCompositeOperation = 'source-over'
  return c
}

/* Pièce détourée → image finale 660 × 876, même cadrage que tout le portant.
   cintre : 'mien' (celui de la photo) ou 'ajout' (on dessine un cintre en bois). */
export function composer (photo, masque, { cintre = 'ajout' } = {}) {
  const piece = detourer(photo, masque)
  const b = boite(masque)
  const c = toile(SORTIE.l, SORTIE.h); const x = c.getContext('2d')
  if (!b) return c
  const haut = cintre === 'ajout' ? 64 : CROCHET_HAUT
  const s = Math.min(620 / b.w, (SORTIE.h - haut - 26) / b.h)
  const w = b.w * s; const h = b.h * s
  const dx = (SORTIE.l - w) / 2
  if (cintre === 'ajout') dessinerCintre(x, epaules(masque, b) * s, haut)
  x.imageSmoothingQuality = 'high'
  x.drawImage(piece, b.x, b.y, b.w, b.h, dx, haut, w, h)
  return c
}

// Largeur de la pièce juste sous le col, pour la taille du cintre.
function epaules (masque, b) {
  const y = Math.round(b.y + b.h * 0.08)
  const d = masque.getContext('2d', { willReadFrequently: true }).getImageData(b.x, y, b.w, 1).data
  let g = -1; let dr = -1
  for (let i = 0; i < b.w; i++) if (d[i * 4 + 3] > 128) { if (g < 0) g = i; dr = i }
  return g < 0 ? b.w * 0.7 : (dr - g) * 0.92
}

function dessinerCintre (x, largeur, haut) {
  const cx = SORTIE.l / 2
  const l = Math.max(160, Math.min(560, largeur))
  // barre en bois (en grande partie cachée par la pièce)
  x.save()
  x.lineCap = 'round'
  const yb = haut + 22
  const bois = x.createLinearGradient(0, haut, 0, yb + 16)
  bois.addColorStop(0, '#ddb98e'); bois.addColorStop(1, '#a87d52')
  x.strokeStyle = bois; x.lineWidth = 11
  x.beginPath()
  x.moveTo(cx - l / 2, yb + 14)
  x.quadraticCurveTo(cx - l * 0.18, haut + 6, cx, haut + 4)
  x.quadraticCurveTo(cx + l * 0.18, haut + 6, cx + l / 2, yb + 14)
  x.stroke()
  // crochet métallique
  const r = 11
  const metal = x.createLinearGradient(cx - r, 0, cx + r * 2, 0)
  metal.addColorStop(0, '#8d8d8d'); metal.addColorStop(0.5, '#e4e4e4'); metal.addColorStop(1, '#8a8a8a')
  x.strokeStyle = metal; x.lineWidth = 3.4
  x.beginPath()
  x.moveTo(cx, haut + 6)
  x.lineTo(cx, CROCHET_HAUT + r)
  x.arc(cx + r, CROCHET_HAUT + r, r, Math.PI, Math.PI * 2)
  x.lineTo(cx + r * 2 - 1, CROCHET_HAUT + r + 7)
  x.stroke()
  x.restore()
}

/* Couleur dominante de la pièce, pour la pastille. */
export function couleurDominante (photo, masque) {
  const N = 64
  const a = toile(N, N).getContext('2d', { willReadFrequently: true }); a.drawImage(photo, 0, 0, N, N)
  const m = toile(N, N).getContext('2d', { willReadFrequently: true }); m.drawImage(masque, 0, 0, N, N)
  const p = a.getImageData(0, 0, N, N).data; const q = m.getImageData(0, 0, N, N).data
  // pixels de la pièce, sans les zones d'ombre (on garde la moitié la plus claire)
  const px = []
  for (let i = 0; i < N * N; i++) if (q[i * 4 + 3] > 230) px.push([p[i * 4], p[i * 4 + 1], p[i * 4 + 2]])
  if (!px.length) return '#888888'
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  px.sort((u, v) => lum(u) - lum(v))
  const clairs = px.slice(Math.round(px.length * 0.55), Math.max(Math.round(px.length * 0.55) + 1, Math.round(px.length * 0.95)))
  const med = (k) => clairs.map((c) => c[k]).sort((u, v) => u - v)[clairs.length >> 1]
  return '#' + [med(0), med(1), med(2)].map((v) => v.toString(16).padStart(2, '0')).join('')
}

/* Toile → fichier image (WebP si le navigateur sait le faire, sinon PNG). */
export async function exporter (c) {
  const webp = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86))
  if (webp && webp.type === 'image/webp') return webp
  return new Promise((r) => c.toBlob(r, 'image/png'))
}

export function toile (w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c
}
