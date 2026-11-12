/* Quelle boutique ? Déduite du nom de domaine de la requête. */
import { requete } from './db.js'
import { config } from './config.js'
import { urlPublique } from './stockage.js'
import { CATEGORIES, lireTheme, lireContenus } from './vitrine.js'

const cache = new Map()
const DUREE = 30_000

export function oublierBoutique (id) { for (const [k, v] of cache) if (v.b?.id === id) cache.delete(k) }

async function chercher (cle, sql, val) {
  const c = cache.get(cle)
  if (c && Date.now() - c.t < DUREE) return c.b
  const { rows: [b] } = await requete(sql, [val])
  cache.set(cle, { b: b || null, t: Date.now() })
  return b || null
}

export async function boutiqueDeRequete (c) {
  const hote = (c.req.header('host') || '').toLowerCase().replace(/:\d+$/, '')
  let b = await chercher(`d:${hote}`, 'select b.* from domaines d join boutiques b on b.id = d.boutique_id where d.domaine = $1 and b.actif', hote)
  if (!b && config.dev) {
    // développement : alba.localhost, ou ?boutique=alba (retenu dans un cookie)
    const sous = hote.endsWith('.localhost') ? hote.slice(0, -'.localhost'.length) : null
    const q = c.req.query('boutique') || (c.req.header('cookie') || '').match(/(?:^|;\s*)boutique_dev=([a-z0-9-]+)/)?.[1]
    const slug = sous || q
    if (slug) b = await chercher(`s:${slug}`, 'select * from boutiques where slug = $1 and actif', slug)
    if (b && c.req.query('boutique')) c.header('set-cookie', `boutique_dev=${b.slug}; Path=/; SameSite=Lax`, { append: true })
  }
  if (!b && config.boutiqueParDefaut) b = await chercher(`s:${config.boutiqueParDefaut}`, 'select * from boutiques where slug = $1 and actif', config.boutiqueParDefaut)
  return b
}

export const boutiquePublique = (b) => ({
  nom: b.nom, slogan: b.slogan, logo: urlPublique(b.logo_chemin), couleurs: b.couleurs, devise: b.devise,
  theme: lireTheme(b), contenus: lireContenus(b), categories: CATEGORIES,
  banniere: urlPublique(b.banniere_chemin), presentation_image: urlPublique(b.presentation_chemin),
  livraison_centimes: b.livraison_centimes, livraison_offerte_centimes: b.livraison_offerte_centimes,
  retrait: b.retrait_adresse ? { adresse: b.retrait_adresse } : null
})
