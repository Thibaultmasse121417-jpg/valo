/* Lecture et écriture des produits d'une boutique (toujours dans avecBoutique). */
import { urlPublique } from './stockage.js'
import { surCintre } from './vitrine.js'

const slug = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16) || 'X'
export const skuAuto = (reference, couleur, taille) => `${reference}-${slug(couleur)}-${slug(taille)}`

const urlPhoto = (p) => p.portant_chemin ? urlPublique(p.portant_chemin) : null

/* Produits complets (couleurs, photos, variantes, collections). public = vue client. */
export async function lireProduits (c, { public: pub = false, id = null } = {}) {
  const cond = []; const params = []
  if (pub) cond.push('p.visible')
  if (id) { params.push(id); cond.push(`p.id = $${params.length}`) }
  const where = cond.length ? `where ${cond.join(' and ')}` : ''
  const { rows: produits } = await c.query(`select * from produits p ${where} order by p.ordre, p.created_at desc`, params)
  if (!produits.length) return []
  const ids = produits.map((p) => p.id)
  const [couleurs, photos, variantes, liens, ventes] = await Promise.all([
    c.query('select * from couleurs where produit_id = any($1) order by ordre, nom', [ids]),
    c.query('select * from photos where produit_id = any($1) order by ordre, created_at', [ids]),
    c.query('select * from variantes where produit_id = any($1)', [ids]),
    c.query('select produit_id, collection_id from produit_collections where produit_id = any($1)', [ids]),
    c.query('select produit_id, ventes from ventes_produits where produit_id = any($1)', [ids])
  ])
  return produits.map((p) => {
    const cols = couleurs.rows.filter((x) => x.produit_id === p.id)
    const phs = photos.rows.filter((x) => x.produit_id === p.id)
    const vars = variantes.rows.filter((x) => x.produit_id === p.id)
    const base = {
      id: p.id, reference: p.reference, nom: p.nom, type: p.type, description: p.description,
      prix_centimes: p.prix_centimes, prix_promo_centimes: p.prix_promo_centimes, tailles: p.tailles, nouveau: p.nouveau, composition: p.composition,
      categorie: p.categorie, presentation: surCintre(p.categorie) ? 'cintre' : 'objet', mis_en_avant: p.mis_en_avant,
      ventes: ventes.rows.find((v) => v.produit_id === p.id)?.ventes || 0, created_at: p.created_at,
      collections: liens.rows.filter((l) => l.produit_id === p.id).map((l) => l.collection_id)
    }
    if (pub) {
      // Une couleur n'apparaît que si elle a une photo de face prête.
      const pretes = (cid, role) => phs.filter((x) => x.statut === 'pret' && x.role === role && (x.couleur_id === cid || (!x.couleur_id && cid === cols[0]?.id)))
      return {
        ...base,
        couleurs: cols.map((col) => ({
          id: col.id, nom: col.nom, hex: col.hex,
          face: urlPhoto(pretes(col.id, 'face')[0] || {}),
          dos: urlPhoto(pretes(col.id, 'dos')[0] || {}) || undefined,
          details: pretes(col.id, 'detail').map(urlPhoto).filter(Boolean),
          variantes: p.tailles.map((t) => {
            const v = vars.find((x) => x.couleur_id === col.id && x.taille === t)
            return v ? { id: v.id, taille: t, disponible: v.stock > 0, stock: Math.min(v.stock, 10) } : null
          }).filter(Boolean)
        })).filter((col) => col.face)
      }
    }
    return {
      ...base, visible: p.visible, ordre: p.ordre,
      couleurs: cols.map((col) => ({ id: col.id, nom: col.nom, hex: col.hex })),
      photos: phs.map((x) => ({
        id: x.id, couleur_id: x.couleur_id, role: x.role, ordre: x.ordre, statut: x.statut, erreur: x.erreur,
        reglages: x.reglages, version: x.version,
        portant: urlPhoto(x), vignette: x.vignette_chemin ? urlPublique(x.vignette_chemin) : null
      })),
      variantes: vars.map((v) => ({ id: v.id, couleur_id: v.couleur_id, taille: v.taille, sku: v.sku, stock: v.stock }))
    }
  })
}

/* Enregistre un produit complet envoyé par l'administration.
   donnees : { reference, nom, type, description, prix_centimes, tailles[], visible, nouveau,
               collections[], couleurs: [{ id?, cle, nom, hex }], stocks: [{ couleur (id ou cle), taille, stock, sku? }] } */
export async function enregistrerProduit (c, boutiqueId, id, d) {
  const champs = [d.reference, d.nom, d.type || '', d.description || '', d.prix_centimes, d.tailles, d.visible !== false, !!d.nouveau,
    d.categorie || 'pulls-sweats', d.prix_promo_centimes ?? null, !!d.mis_en_avant, String(d.composition || '').trim().slice(0, 300)]
  let pid = id
  if (pid) {
    const r = await c.query(`update produits set reference = $1, nom = $2, type = $3, description = $4, prix_centimes = $5,
      tailles = $6, visible = $7, nouveau = $8, categorie = $9, prix_promo_centimes = $10, mis_en_avant = $11, composition = $12, updated_at = now() where id = $13`, [...champs, pid])
    if (!r.rowCount) return null
  } else {
    const { rows: [o] } = await c.query('select coalesce(min(ordre), 1) - 1 as o from produits')
    const { rows: [p] } = await c.query(`insert into produits (boutique_id, reference, nom, type, description, prix_centimes, tailles, visible, nouveau,
      categorie, prix_promo_centimes, mis_en_avant, composition, ordre) values ($13, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $14) returning id`, [...champs, boutiqueId, o.o])
    pid = p.id
  }
  // Collections
  await c.query('delete from produit_collections where produit_id = $1', [pid])
  for (const col of d.collections || []) {
    await c.query(`insert into produit_collections (boutique_id, produit_id, collection_id)
      select $1, $2, id from collections where id = $3 on conflict do nothing`, [boutiqueId, pid, col])
  }
  // Couleurs : mises à jour, ajouts, suppressions.
  const { rows: existantes } = await c.query('select id from couleurs where produit_id = $1', [pid])
  const gardees = new Set(); const parCle = new Map()
  for (const [i, col] of (d.couleurs || []).entries()) {
    let cid = col.id && existantes.some((e) => e.id === col.id) ? col.id : null
    if (cid) await c.query('update couleurs set nom = $1, hex = $2, ordre = $3 where id = $4', [col.nom, col.hex, i, cid])
    else cid = (await c.query('insert into couleurs (boutique_id, produit_id, nom, hex, ordre) values ($1, $2, $3, $4, $5) returning id', [boutiqueId, pid, col.nom, col.hex, i])).rows[0].id
    gardees.add(cid); parCle.set(col.cle || col.id, cid); parCle.set(cid, cid)
  }
  for (const e of existantes) if (!gardees.has(e.id)) await c.query('delete from couleurs where id = $1', [e.id])
  // Photos rattachées à une couleur encore non enregistrée (clé provisoire).
  for (const ph of d.photos || []) {
    if (!ph.id) continue
    const cid = ph.couleur ? parCle.get(ph.couleur) ?? null : null
    await c.query('update photos set couleur_id = $1, role = $2, ordre = $3 where id = $4 and produit_id = $5', [cid, ph.role || 'face', ph.ordre || 0, ph.id, pid])
  }
  // Variantes : une par couleur × taille, avec son stock et sa référence.
  const { rows: couleursFinales } = await c.query('select id, nom from couleurs where produit_id = $1', [pid])
  const voulues = []
  for (const col of couleursFinales) for (const t of d.tailles) {
    const s = (d.stocks || []).find((x) => parCle.get(x.couleur) === col.id && x.taille === t)
    const avant = s && Number.isFinite(Number(s.avant)) && s.avant !== null && s.avant !== '' ? Math.floor(Number(s.avant)) : null
    voulues.push({ couleur_id: col.id, taille: t, stock: Math.max(0, Math.floor(Number(s?.stock) || 0)), avant, sku: (s?.sku || '').trim() || skuAuto(d.reference, col.nom, t) })
  }
  await c.query('delete from variantes where produit_id = $1 and not ((couleur_id, taille) in (select * from unnest($2::uuid[], $3::text[])))',
    [pid, voulues.map((v) => v.couleur_id), voulues.map((v) => v.taille)])
  for (const v of voulues) {
    // « avant » = stock affiché quand le formulaire a été ouvert : on applique l'écart,
    // pour ne pas effacer les ventes faites entre-temps.
    await c.query(`insert into variantes (boutique_id, produit_id, couleur_id, taille, sku, stock) values ($1, $2, $3, $4, $5, $6)
      on conflict (couleur_id, taille) do update set sku = excluded.sku,
        stock = case when $7::int is null then excluded.stock else greatest(0, variantes.stock + excluded.stock - $7::int) end`,
    [boutiqueId, pid, v.couleur_id, v.taille, v.sku, v.stock, v.avant])
  }
  return pid
}
