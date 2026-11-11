/* Détourage dans un fil séparé, pour que la page reste fluide.
   Modèle « silueta » (U²-Net, licence Apache 2.0), exécuté dans le navigateur :
   aucune photo ne quitte le téléphone pendant le détourage. */
import * as ort from 'onnxruntime-web/wasm'

const TAILLE = 320
let session = null

async function telechargerModele (url, progres) {
  let cache = null
  try { cache = await caches.open('atelier-modele-v1') } catch { /* Cache indisponible */ }
  const deja = cache && await cache.match(url)
  if (deja) return new Uint8Array(await deja.arrayBuffer())
  const rep = await fetch(url)
  if (!rep.ok) throw new Error(`Modèle introuvable (${rep.status})`)
  const total = Number(rep.headers.get('content-length')) || 44e6
  const lecteur = rep.body.getReader()
  const morceaux = []; let recu = 0
  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    morceaux.push(value); recu += value.length
    progres(Math.min(0.99, recu / total))
  }
  const octets = new Uint8Array(recu); let o = 0
  for (const m of morceaux) { octets.set(m, o); o += m.length }
  try { await cache?.put(url, new Response(octets, { headers: { 'content-type': 'application/octet-stream' } })) } catch { /* plein ou refusé */ }
  return octets
}

async function preparer ({ modele, wasm }) {
  if (session) return
  ort.env.wasm.wasmPaths = wasm
  ort.env.wasm.numThreads = 1
  const octets = await telechargerModele(modele, (p) => postMessage({ type: 'progres', p }))
  postMessage({ type: 'progres', p: 1 })
  session = await ort.InferenceSession.create(octets, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })
}

// pixels : RGBA de l'image réduite à 320 × 320.
async function masque (pixels) {
  const n = TAILLE * TAILLE
  const x = new Float32Array(3 * n)
  const moy = [0.485, 0.456, 0.406]; const ec = [0.229, 0.224, 0.225]
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) x[c * n + i] = (pixels[i * 4 + c] / 255 - moy[c]) / ec[c]
  }
  const entree = new ort.Tensor('float32', x, [1, 3, TAILLE, TAILLE])
  const sortie = await session.run({ [session.inputNames[0]]: entree })
  const m = sortie[session.outputNames[0]].data
  let min = Infinity; let max = -Infinity
  for (let i = 0; i < n; i++) { if (m[i] < min) min = m[i]; if (m[i] > max) max = m[i] }
  const out = new Uint8ClampedArray(n)
  for (let i = 0; i < n; i++) out[i] = ((m[i] - min) / (max - min + 1e-8)) * 255
  return out
}

onmessage = async (e) => {
  const { id, type } = e.data
  try {
    if (type === 'preparer') { await preparer(e.data); postMessage({ id, ok: true }) }
    if (type === 'masque') { const m = await masque(e.data.pixels); postMessage({ id, ok: true, masque: m }, [m.buffer]) }
  } catch (err) {
    postMessage({ id, ok: false, erreur: String(err?.message || err) })
  }
}
