/* File de détourage : les photos envoyées sont traitées une par une, en arrière-plan.
   L'original est conservé ; le masque et l'image du portant sont refaits à chaque correction. */
import { EventEmitter } from 'node:events'
import { pool, avecBoutique } from './db.js'
import { lire, ecrire, supprimer } from './stockage.js'
import { calculerMasque, composer } from './images.js'

export const reveil = new EventEmitter()
let actif = false

export function demarrerFile () {
  pool.query('select photos_relancer()').catch((e) => console.error('[file] relance :', e.message))
  const boucle = async () => {
    if (actif) return
    actif = true
    try {
      for (;;) {
        const { rows: [p] } = await pool.query('select * from photo_suivante()')
        if (!p?.id) break
        await traiter(p.boutique_id, p.id)
      }
    } catch (e) {
      console.error('[file]', e)
    } finally { actif = false }
  }
  reveil.on('photo', boucle)
  setInterval(boucle, 5000).unref()
  boucle()
}

async function traiter (boutiqueId, photoId) {
  const t0 = Date.now()
  try {
    const ph = await avecBoutique(boutiqueId, async (c) => (await c.query('select * from photos where id = $1', [photoId])).rows[0])
    if (!ph) return
    const original = await lire(ph.original_chemin)
    const masque = await calculerMasque(original)
    const masqueChemin = await ecrire(`${boutiqueId}/${photoId}-masque.png`, masque)
    await recomposer(boutiqueId, ph, original, masque, masqueChemin)
    console.log(`[file] photo ${photoId} prête en ${Date.now() - t0} ms`)
  } catch (e) {
    console.error(`[file] photo ${photoId} :`, e.message)
    await avecBoutique(boutiqueId, (c) => c.query("update photos set statut = 'erreur', erreur = $2, updated_at = now() where id = $1",
      [photoId, e.message === 'Aucune pièce trouvée sur la photo' ? 'Aucun vêtement reconnu sur la photo.' : 'Le détourage a échoué.']))
  }
}

/* Refait l'image du portant à partir de l'original, du masque et des réglages de la photo. */
export async function recomposer (boutiqueId, ph, original, masque, masqueChemin = ph.masque_chemin) {
  original ??= await lire(ph.original_chemin)
  masque ??= await lire(ph.masque_chemin)
  const r = await composer(original, masque, ph.reglages)
  const version = (ph.version || 0) + 1
  const portant = await ecrire(`${boutiqueId}/${ph.id}-portant-${version}.webp`, r.portant)
  const vignette = await ecrire(`${boutiqueId}/${ph.id}-vignette-${version}.webp`, r.vignette)
  const reglages = { ...ph.reglages, cintre_detecte: r.cintre, hex: r.hex }
  await avecBoutique(boutiqueId, async (c) => {
    await c.query(`update photos set statut = 'pret', erreur = null, masque_chemin = $2, portant_chemin = $3, vignette_chemin = $4,
      reglages = $5, version = $6, updated_at = now() where id = $1`, [ph.id, masqueChemin, portant, vignette, reglages, version])
  })
  // les anciennes versions ne servent plus
  if (ph.portant_chemin && ph.portant_chemin !== portant) await supprimer(ph.portant_chemin)
  if (ph.vignette_chemin && ph.vignette_chemin !== vignette) await supprimer(ph.vignette_chemin)
  return { portant, vignette, reglages, version }
}
