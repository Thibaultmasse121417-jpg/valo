/* Où sont rangées les pièces de la boutique.

   - Mode démonstration : base du navigateur (IndexedDB), photos comprises.
   - Mode en ligne : Supabase (table « pieces » et dossier de photos « pieces »).

   Une pièce : { id, nom, type, famille, prix, texte, nouveau, visible, ordre,
                 tailles: ['S', 'M'…], couleurs: [{ nom, hex, face, dos }] }
   face et dos sont des adresses d'image (ou, à l'enregistrement, des fichiers Blob). */

import { SUPABASE_URL, SUPABASE_ANON_KEY, BOUTIQUE } from './config.js'
import { PIECES } from './catalogue.js'

export const EN_LIGNE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/* ---------- Mode démonstration : IndexedDB ---------- */

const DB_NOM = `atelier-${BOUTIQUE}`
let dbP = null
function db () {
  if (!dbP) {
    dbP = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NOM, 1)
      req.onupgradeneeded = () => {
        const d = req.result
        d.createObjectStore('pieces', { keyPath: 'id' })
        d.createObjectStore('meta')
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbP
}
function tx (store, mode, fn) {
  return db().then((d) => new Promise((resolve, reject) => {
    const t = d.transaction(store, mode)
    const res = fn(t.objectStore(store))
    t.oncomplete = () => resolve(res instanceof IDBRequest ? res.result : res)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error)
  }))
}
const toutes = () => tx('pieces', 'readonly', (s) => s.getAll())

// Au premier passage, la démo part du catalogue Alba.
async function amorcer () {
  const deja = await tx('meta', 'readonly', (s) => s.get('amorce'))
  if (deja) return
  await tx('pieces', 'readwrite', (s) => {
    PIECES.forEach((p, i) => s.put({ ...p, visible: true, ordre: i, demo: true }))
  })
  await tx('meta', 'readwrite', (s) => s.put(true, 'amorce'))
}

const urls = new Map()
function versUrl (v) {
  if (!(v instanceof Blob)) return v
  if (!urls.has(v)) urls.set(v, URL.createObjectURL(v))
  return urls.get(v)
}
const avecUrls = (p) => ({ ...p, couleurs: p.couleurs.map((c) => ({ ...c, face: versUrl(c.face), dos: c.dos ? versUrl(c.dos) : undefined })) })

const local = {
  async lister () {
    await amorcer()
    const l = await toutes()
    return l.sort((a, b) => a.ordre - b.ordre).map(avecUrls)
  },
  // couleurs[].face / dos : Blob (nouvelle photo) ou chaîne (photo inchangée).
  async enregistrer (p) {
    await amorcer()
    const l = await toutes()
    const ancien = l.find((x) => x.id === p.id)
    const brut = ancien ? ancien.couleurs : []
    const couleurs = p.couleurs.map((c, k) => ({
      ...c,
      // une adresse blob: créée pour l'affichage renvoie au fichier d'origine
      face: retrouverBlob(c.face, brut, 'face') ?? c.face,
      dos: c.dos ? (retrouverBlob(c.dos, brut, 'dos') ?? c.dos) : undefined
    }))
    const piece = { ...p, id: p.id || crypto.randomUUID(), couleurs, ordre: ancien ? ancien.ordre : -1 - l.length }
    await tx('pieces', 'readwrite', (s) => s.put(piece))
    return piece.id
  },
  async supprimer (id) { await tx('pieces', 'readwrite', (s) => s.delete(id)) },
  async ordonner (ids) {
    const l = await toutes()
    await tx('pieces', 'readwrite', (s) => { for (const p of l) { const i = ids.indexOf(p.id); if (i > -1) s.put({ ...p, ordre: i }) } })
  },
  async basculer (id, visible) {
    const l = await toutes(); const p = l.find((x) => x.id === id); if (!p) return
    await tx('pieces', 'readwrite', (s) => s.put({ ...p, visible }))
  },
  async reinitialiser () {
    await tx('pieces', 'readwrite', (s) => s.clear())
    await tx('meta', 'readwrite', (s) => s.delete('amorce'))
  }
}
function retrouverBlob (v, brut, cle) {
  if (v instanceof Blob) return v
  if (typeof v !== 'string' || !v.startsWith('blob:')) return null
  for (const [blob, u] of urls) if (u === v) return blob
  for (const c of brut) if (c[cle] instanceof Blob && versUrl(c[cle]) === v) return c[cle]
  return null
}

/* ---------- Mode en ligne : Supabase ---------- */

let sbP = null
function sb () {
  if (!sbP) sbP = import('@supabase/supabase-js').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
  return sbP
}
const depuisLigne = (r) => ({
  id: r.id, nom: r.nom, type: r.type, famille: r.famille, prix: Number(r.prix), texte: r.texte,
  nouveau: r.nouveau, visible: r.visible, ordre: r.ordre, tailles: r.tailles, couleurs: r.couleurs
})

const enLigne = {
  async lister ({ toutes: tout = false } = {}) {
    const c = await sb()
    let q = c.from('pieces').select('*').eq('boutique', BOUTIQUE).order('ordre', { ascending: true }).order('created_at', { ascending: false })
    if (!tout) q = q.eq('visible', true)
    const { data, error } = await q
    if (error) throw error
    return data.map(depuisLigne)
  },
  async envoyerPhoto (blob) {
    const c = await sb()
    const ext = blob.type === 'image/webp' ? 'webp' : 'png'
    const chemin = `${BOUTIQUE}/${crypto.randomUUID()}.${ext}`
    const { error } = await c.storage.from('pieces').upload(chemin, blob, { contentType: blob.type, cacheControl: '31536000' })
    if (error) throw error
    return c.storage.from('pieces').getPublicUrl(chemin).data.publicUrl
  },
  async enregistrer (p) {
    const c = await sb()
    const couleurs = []
    for (const col of p.couleurs) {
      couleurs.push({
        nom: col.nom, hex: col.hex,
        face: col.face instanceof Blob ? await enLigne.envoyerPhoto(col.face) : col.face,
        ...(col.dos ? { dos: col.dos instanceof Blob ? await enLigne.envoyerPhoto(col.dos) : col.dos } : {})
      })
    }
    const ligne = {
      boutique: BOUTIQUE, nom: p.nom, type: p.type, famille: p.famille, prix: p.prix, texte: p.texte,
      nouveau: !!p.nouveau, visible: p.visible !== false, tailles: p.tailles, couleurs
    }
    if (p.id) {
      const { error } = await c.from('pieces').update(ligne).eq('id', p.id)
      if (error) throw error
      return p.id
    }
    const { data: premier } = await c.from('pieces').select('ordre').eq('boutique', BOUTIQUE).order('ordre', { ascending: true }).limit(1)
    ligne.ordre = (premier?.[0]?.ordre ?? 1) - 1
    const { data, error } = await c.from('pieces').insert(ligne).select('id').single()
    if (error) throw error
    return data.id
  },
  async supprimer (id) {
    const c = await sb()
    const { error } = await c.from('pieces').delete().eq('id', id)
    if (error) throw error
  },
  async ordonner (ids) {
    const c = await sb()
    for (let i = 0; i < ids.length; i++) {
      const { error } = await c.from('pieces').update({ ordre: i }).eq('id', ids[i])
      if (error) throw error
    }
  },
  async basculer (id, visible) {
    const c = await sb()
    const { error } = await c.from('pieces').update({ visible }).eq('id', id)
    if (error) throw error
  },
  // Connexion de la boutique (compte créé dans Supabase > Authentication).
  async session () { const c = await sb(); return (await c.auth.getSession()).data.session },
  async connecter (email, motdepasse) {
    const c = await sb()
    const { error } = await c.auth.signInWithPassword({ email, password: motdepasse })
    if (error) throw error
  },
  async deconnecter () { const c = await sb(); await c.auth.signOut() }
}

export const donnees = EN_LIGNE ? enLigne : local

// Ce que voit le client : seulement les pièces visibles, dans l'ordre du portant.
export async function piecesDuPortant () {
  try {
    const l = await donnees.lister()
    const visibles = l.filter((p) => p.visible !== false && p.couleurs?.length)
    return visibles.length || EN_LIGNE ? visibles : PIECES
  } catch (e) {
    console.warn('Catalogue indisponible, affichage du catalogue de démonstration.', e)
    return EN_LIGNE ? [] : PIECES
  }
}
