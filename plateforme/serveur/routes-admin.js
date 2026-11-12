/* API du tableau de bord : réservée au compte de la boutique, données de sa seule boutique. */
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import sharp from 'sharp'
import { randomUUID } from 'node:crypto'
import { avecBoutique } from './db.js'
import { verifier, nouveauJeton, hashJeton } from './auth.js'
import { lireProduits, enregistrerProduit } from './catalogue.js'
import { lireCommande } from './commandes.js'
import { normaliserOriginal } from './images.js'
import { ecrire, lire, supprimer } from './stockage.js'
import { reveil, recomposer } from './file.js'
import { oublierBoutique } from './boutique.js'
import { CATEGORIES, estCategorie, surCintre, lireTheme, lireContenus, validerTheme, validerContenus } from './vitrine.js'
import { stripe, lienStripe, etatStripe } from './paiement.js'
import { config } from './config.js'

export const admin = new Hono()
const COOKIE = 'portant_session'

const ok = (c, d = { ok: true }) => c.json(d)
const err = (c, message, s = 400) => c.json({ erreur: message }, s)

/* ---------- Connexion ---------- */

const essais = new Map() // limite simple contre les attaques par force brute
admin.post('/connexion', async (c) => {
  const b = c.get('boutique')
  const cle = `${b.id}|${c.req.header('x-forwarded-for') || 'local'}`
  const e = essais.get(cle) || { n: 0, t: Date.now() }
  if (Date.now() - e.t > 10 * 60_000) { e.n = 0; e.t = Date.now() }
  if (e.n >= 10) return err(c, 'Trop d’essais. Réessayez dans quelques minutes.', 429)
  const { email = '', mdp = '' } = await c.req.json().catch(() => ({}))
  const u = await avecBoutique(b.id, async (db) => (await db.query('select * from utilisateurs where email = $1', [String(email).trim().toLowerCase()])).rows[0])
  if (!u || !(await verifier(String(mdp), u.mot_de_passe))) {
    e.n++; essais.set(cle, e)
    return err(c, 'Adresse ou mot de passe incorrect.', 401)
  }
  essais.delete(cle)
  const jeton = nouveauJeton()
  await avecBoutique(b.id, (db) => db.query(`insert into sessions (jeton_hash, boutique_id, utilisateur_id, expire_at)
    values ($1, $2, $3, now() + make_interval(days => $4))`, [hashJeton(jeton), b.id, u.id, config.sessionJours]))
  setCookie(c, COOKIE, jeton, { httpOnly: true, sameSite: 'Lax', secure: !config.dev, path: '/', maxAge: config.sessionJours * 86400 })
  return ok(c, { email: u.email })
})

// Toutes les autres routes : session valide pour CETTE boutique, et en-tête anti-CSRF pour les écritures.
admin.use('*', async (c, next) => {
  if (c.req.path.endsWith('/connexion')) return next()
  const b = c.get('boutique')
  const jeton = getCookie(c, COOKIE)
  if (!jeton) return err(c, 'Connexion requise.', 401)
  const s = await avecBoutique(b.id, async (db) => (await db.query(`select s.utilisateur_id, u.email from sessions s join utilisateurs u on u.id = s.utilisateur_id
    where s.jeton_hash = $1 and s.expire_at > now()`, [hashJeton(jeton)])).rows[0])
  if (!s) return err(c, 'Connexion requise.', 401)
  if (c.req.method !== 'GET' && c.req.header('x-portant') !== '1') return err(c, 'Requête refusée.', 403)
  c.set('utilisateur', s)
  return next()
})

admin.post('/deconnexion', async (c) => {
  const jeton = getCookie(c, COOKIE)
  await avecBoutique(c.get('boutique').id, (db) => db.query('delete from sessions where jeton_hash = $1', [hashJeton(jeton)]))
  deleteCookie(c, COOKIE, { path: '/' })
  return ok(c)
})
admin.get('/moi', (c) => ok(c, { email: c.get('utilisateur').email, boutique: { nom: c.get('boutique').nom, slug: c.get('boutique').slug } }))

const db = (c, fn) => avecBoutique(c.get('boutique').id, fn)

/* ---------- Produits ---------- */

admin.get('/produits', async (c) => ok(c, { produits: await db(c, (x) => lireProduits(x)) }))
admin.get('/produits/:id', async (c) => {
  const [p] = await db(c, (x) => lireProduits(x, { id: c.req.param('id') }))
  return p ? ok(c, p) : err(c, 'Produit introuvable.', 404)
})

// Brouillon : créé dès qu'on commence un nouveau vêtement, pour pouvoir y déposer les photos.
admin.post('/produits/brouillon', async (c) => {
  const b = c.get('boutique')
  const id = await db(c, async (x) => {
    const { rows: [n] } = await x.query("select count(*)::int + 1 as n from produits")
    let ref = `REF${String(n.n).padStart(4, '0')}`
    while ((await x.query('select 1 from produits where reference = $1', [ref])).rowCount) ref = `REF${Math.floor(1000 + Math.random() * 9000)}`
    return enregistrerProduit(x, b.id, null, { reference: ref, nom: 'Nouveau vêtement', prix_centimes: 0, tailles: ['S', 'M', 'L'], visible: false, nouveau: true, couleurs: [] })
  })
  const [p] = await db(c, (x) => lireProduits(x, { id }))
  return ok(c, p)
})

function validerProduit (d) {
  const nom = String(d.nom || '').trim(); const reference = String(d.reference || '').trim().toUpperCase()
  const prix = Math.round(Number(d.prix_centimes))
  const tailles = [...new Set((d.tailles || []).map((t) => String(t).trim()).filter(Boolean))]
  if (nom.length < 2) return 'Donnez un nom au vêtement.'
  if (!/^[A-Z0-9][A-Z0-9-]{1,30}$/.test(reference)) return 'Référence invalide (lettres, chiffres et tirets).'
  if (!(prix >= 0) || prix > 10_000_000) return 'Prix invalide.'
  if (!tailles.length) return 'Choisissez au moins une taille.'
  if (d.visible && !(prix > 0)) return 'Indiquez un prix avant de mettre le vêtement en ligne.'
  for (const col of d.couleurs || []) if (!String(col.nom || '').trim() || !/^#[0-9a-fA-F]{6}$/.test(col.hex || '')) return 'Chaque couleur a besoin d’un nom.'
  const categorie = estCategorie(d.categorie) ? d.categorie : 'pulls-sweats'
  let promo = d.prix_promo_centimes === null || d.prix_promo_centimes === '' || d.prix_promo_centimes === undefined ? null : Math.round(Number(d.prix_promo_centimes))
  if (promo !== null && !(promo >= 0 && promo < prix)) return 'Le prix soldé doit être inférieur au prix normal.'
  if (promo === 0) promo = null
  return { ...d, nom, reference, prix_centimes: prix, prix_promo_centimes: promo, categorie, mis_en_avant: !!d.mis_en_avant, tailles, couleurs: (d.couleurs || []).map((x) => ({ ...x, nom: String(x.nom).trim() })) }
}

admin.put('/produits/:id', async (c) => {
  const v = validerProduit(await c.req.json())
  if (typeof v === 'string') return err(c, v)
  if (v.visible) {
    const pretes = await db(c, async (x) => (await x.query("select count(*)::int n from photos where produit_id = $1 and statut = 'pret' and role = 'face'", [c.req.param('id')])).rows[0].n)
    if (!pretes) return err(c, 'Ajoutez au moins une photo de face prête avant de mettre le vêtement en ligne.')
  }
  try {
    const avant = await db(c, async (x) => (await x.query('select categorie from produits where id = $1', [c.req.param('id')])).rows[0])
    const id = await db(c, (x) => enregistrerProduit(x, c.get('boutique').id, c.req.param('id'), v))
    if (!id) return err(c, 'Produit introuvable.', 404)
    // Passage vêtement ↔ accessoire : les photos sont refaites avec ou sans cintre.
    if (avant && surCintre(avant.categorie) !== surCintre(v.categorie)) await representer(c, id, surCintre(v.categorie) ? 'auto' : 'aucun')
    const [p] = await db(c, (x) => lireProduits(x, { id }))
    return ok(c, p)
  } catch (e) {
    if (e.code === '23505') return err(c, e.constraint?.includes('sku') ? 'Deux variantes ont la même référence.' : 'Cette référence est déjà utilisée.', 409)
    throw e
  }
})

admin.patch('/produits/:id', async (c) => { // masquer / afficher rapidement
  const { visible } = await c.req.json()
  const r = await db(c, (x) => x.query('update produits set visible = $2, updated_at = now() where id = $1 and (not $2 or exists (select 1 from photos where produit_id = $1 and statut = \'pret\' and role = \'face\') and prix_centimes > 0)', [c.req.param('id'), !!visible]))
  return r.rowCount ? ok(c) : err(c, visible ? 'Il faut un prix et une photo prête pour mettre en ligne.' : 'Produit introuvable.', visible ? 400 : 404)
})

admin.delete('/produits/:id', async (c) => {
  const fichiers = await db(c, async (x) => {
    const { rows } = await x.query('select original_chemin, masque_chemin, portant_chemin, vignette_chemin from photos where produit_id = $1', [c.req.param('id')])
    const r = await x.query('delete from produits where id = $1', [c.req.param('id')])
    return r.rowCount ? rows.flatMap((r) => Object.values(r)).filter(Boolean) : null
  })
  if (!fichiers) return err(c, 'Produit introuvable.', 404)
  await Promise.all(fichiers.map(supprimer))
  return ok(c)
})

admin.post('/produits/ordre', async (c) => {
  const { ids } = await c.req.json()
  if (!Array.isArray(ids)) return err(c, 'Liste attendue.')
  await db(c, async (x) => { for (const [i, id] of ids.entries()) await x.query('update produits set ordre = $2 where id = $1', [id, i]) })
  return ok(c)
})

/* ---------- Photos ---------- */

admin.post('/produits/:id/photos', async (c) => {
  const b = c.get('boutique'); const pid = c.req.param('id')
  const corps = await c.req.parseBody({ all: true })
  const fichiers = [corps.photos].flat().filter((f) => f && typeof f === 'object' && 'arrayBuffer' in f)
  if (!fichiers.length) return err(c, 'Aucune photo reçue.')
  if (fichiers.length > 12) return err(c, '12 photos au plus à la fois.')
  const existe = await db(c, async (x) => (await x.query('select 1 from produits where id = $1', [pid])).rowCount)
  if (!existe) return err(c, 'Produit introuvable.', 404)
  const couleur = corps.couleur_id || null; const role = ['face', 'dos', 'detail'].includes(corps.role) ? corps.role : null
  const crees = []
  for (const f of fichiers) {
    if (f.size > 25 * 1024 * 1024) return err(c, 'Photo trop lourde (25 Mo au plus).')
    let o
    try { o = await normaliserOriginal(Buffer.from(await f.arrayBuffer())) } catch { return err(c, `« ${f.name} » n’est pas une image lisible.`) }
    const id = randomUUID()
    const chemin = await ecrire(`${b.id}/${id}-original.jpg`, o.buffer)
    const ph = await db(c, async (x) => {
      const { rows: [n] } = await x.query(`select count(*)::int n, count(*) filter (where role = 'face')::int f,
        (select categorie from produits where id = $1) as categorie from photos where produit_id = $1`, [pid])
      const r = role || (n.f === 0 ? 'face' : 'dos')
      const reglages = { cintre: surCintre(n.categorie) ? 'auto' : 'aucun', echelle: 1, dx: 0, dy: 0 }
      return (await x.query(`insert into photos (id, boutique_id, produit_id, couleur_id, role, ordre, original_chemin, reglages)
        values ($1, $2, $3, (select id from couleurs where id = $4::uuid and produit_id = $3), $5, $6, $7, $8) returning id, role, couleur_id, statut`, [id, b.id, pid, couleur, r, n.n, chemin, reglages])).rows[0]
    })
    crees.push(ph)
  }
  reveil.emit('photo')
  return ok(c, { photos: crees })
})

const unePhoto = (c) => db(c, async (x) => (await x.query('select * from photos where id = $1', [c.req.param('id')])).rows[0])

admin.get('/photos/:id', async (c) => {
  const ph = await unePhoto(c)
  return ph ? ok(c, { id: ph.id, statut: ph.statut, erreur: ph.erreur, reglages: ph.reglages, version: ph.version }) : err(c, 'Photo introuvable.', 404)
})
// Fichiers privés (pour l'éditeur de détourage)
for (const type of ['original', 'masque']) {
  admin.get(`/photos/:id/${type}`, async (c) => {
    const ph = await unePhoto(c)
    const chemin = ph?.[`${type}_chemin`]
    if (!chemin) return err(c, 'Fichier introuvable.', 404)
    return c.body(await lire(chemin), 200, { 'content-type': type === 'original' ? 'image/jpeg' : 'image/png', 'cache-control': 'private, no-store' })
  })
}

// Réglages : cintre, échelle, position ; et rattachement couleur / rôle.
admin.put('/photos/:id', async (c) => {
  const b = c.get('boutique'); const d = await c.req.json()
  let ph = await unePhoto(c)
  if (!ph) return err(c, 'Photo introuvable.', 404)
  ph = await db(c, async (x) => (await x.query(`update photos set
      couleur_id = case when $2::boolean then (select id from couleurs where id = $3::uuid and produit_id = photos.produit_id) else couleur_id end,
      role = coalesce($4, role), reglages = reglages || coalesce($5::jsonb, '{}'::jsonb), updated_at = now()
    where id = $1 returning *`, [ph.id, 'couleur_id' in d, d.couleur_id || null, ['face', 'dos', 'detail'].includes(d.role) ? d.role : null,
    d.reglages ? JSON.stringify(pick(d.reglages, ['cintre', 'echelle', 'dx', 'dy'])) : null])).rows[0])
  if (d.reglages && ph.statut === 'pret') await recomposer(b.id, ph)
  return ok(c, (await db(c, (x) => lireProduits(x, { id: ph.produit_id })))[0])
})

// Masque corrigé à la main (PNG en niveaux de gris, à la taille de l'original).
admin.put('/photos/:id/masque', async (c) => {
  const b = c.get('boutique'); const ph = await unePhoto(c)
  if (!ph || ph.statut !== 'pret') return err(c, 'Photo introuvable ou pas encore prête.', 404)
  const meta = await sharp(await lire(ph.original_chemin)).metadata()
  let masque
  try {
    // PNG avec transparence (éditeur : opacité = pièce) ou en niveaux de gris (blanc = pièce).
    const entree = Buffer.from(await c.req.arrayBuffer())
    const m = await sharp(entree).metadata()
    const canal = m.hasAlpha ? sharp(entree).extractChannel(m.channels - 1) : sharp(entree).greyscale()
    masque = await canal.resize(meta.width, meta.height, { fit: 'fill' }).png().toBuffer()
  } catch { return err(c, 'Masque illisible.') }
  const chemin = await ecrire(`${b.id}/${ph.id}-masque.png`, masque)
  await recomposer(b.id, ph, null, masque, chemin)
  return ok(c, (await db(c, (x) => lireProduits(x, { id: ph.produit_id })))[0])
})

// Relancer le détourage automatique (ex. après une erreur).
admin.post('/photos/:id/detourer', async (c) => {
  const r = await db(c, (x) => x.query("update photos set statut = 'en_attente', erreur = null, reglages = reglages - 'cintre_detecte' where id = $1", [c.req.param('id')]))
  if (!r.rowCount) return err(c, 'Photo introuvable.', 404)
  reveil.emit('photo')
  return ok(c)
})

admin.delete('/photos/:id', async (c) => {
  const ph = await unePhoto(c)
  if (!ph) return err(c, 'Photo introuvable.', 404)
  await db(c, (x) => x.query('delete from photos where id = $1', [ph.id]))
  await Promise.all([ph.original_chemin, ph.masque_chemin, ph.portant_chemin, ph.vignette_chemin].filter(Boolean).map(supprimer))
  return ok(c)
})

/* ---------- Collections ---------- */

admin.get('/collections', async (c) => ok(c, {
  collections: await db(c, async (x) => (await x.query(`select c.*, (select count(*)::int from produit_collections pc where pc.collection_id = c.id) as nb
    from collections c order by ordre, nom`)).rows)
}))
admin.post('/collections', async (c) => {
  const { nom } = await c.req.json(); if (!String(nom || '').trim()) return err(c, 'Donnez un nom à la collection.')
  const r = await db(c, async (x) => (await x.query('insert into collections (boutique_id, nom, ordre) values ($1, $2, (select coalesce(max(ordre), 0) + 1 from collections)) returning *', [c.get('boutique').id, String(nom).trim()])).rows[0])
  return ok(c, r)
})
admin.put('/collections/:id', async (c) => {
  const d = await c.req.json()
  const r = await db(c, (x) => x.query('update collections set nom = coalesce($2, nom), visible = coalesce($3, visible), ordre = coalesce($4, ordre) where id = $1',
    [c.req.param('id'), d.nom ? String(d.nom).trim() : null, typeof d.visible === 'boolean' ? d.visible : null, Number.isInteger(d.ordre) ? d.ordre : null]))
  return r.rowCount ? ok(c) : err(c, 'Collection introuvable.', 404)
})
admin.delete('/collections/:id', async (c) => {
  await db(c, (x) => x.query('delete from collections where id = $1', [c.req.param('id')]))
  return ok(c)
})

/* ---------- Commandes ---------- */

admin.get('/commandes', async (c) => {
  const statut = c.req.query('statut')
  const rows = await db(c, async (x) => (await x.query(`select id, numero, statut, client, livraison_mode, total_centimes, created_at,
    (select sum(quantite)::int from lignes_commande l where l.commande_id = commandes.id) as articles
    from commandes where ($1::text is null or statut = $1) order by created_at desc limit 200`, [statut || null])).rows)
  return ok(c, { commandes: rows })
})
admin.get('/commandes/:id', async (c) => {
  const cmd = await db(c, (x) => lireCommande(x, { id: c.req.param('id') }))
  return cmd ? ok(c, cmd) : err(c, 'Commande introuvable.', 404)
})
const SUITES = { payee: ['preparee', 'expediee', 'retiree', 'annulee'], preparee: ['expediee', 'retiree', 'annulee'], expediee: [], retiree: [] }
admin.put('/commandes/:id', async (c) => {
  const { statut } = await c.req.json()
  const r = await db(c, async (x) => {
    const { rows: [cmd] } = await x.query('select statut from commandes where id = $1 for update', [c.req.param('id')])
    if (!cmd) return 404
    if (!(SUITES[cmd.statut] || []).includes(statut)) return 400
    await x.query('update commandes set statut = $2 where id = $1', [c.req.param('id'), statut])
    // Commande payée puis annulée par la boutique : les pièces reviennent en stock (le remboursement se fait dans Stripe).
    if (statut === 'annulee') {
      await x.query(`update variantes v set stock = v.stock + l.q from (select variante_id, sum(quantite) q from lignes_commande
        where commande_id = $1 and variante_id is not null group by variante_id) l where v.id = l.variante_id`, [c.req.param('id')])
    }
    return 200
  })
  return r === 200 ? ok(c) : err(c, r === 404 ? 'Commande introuvable.' : 'Ce changement de statut n’est pas possible.', r)
})

/* ---------- Boutique : identité, livraison, paiement ---------- */

admin.get('/boutique', async (c) => {
  const b = c.get('boutique')
  const domaines = await db(c, async (x) => (await x.query('select domaine from domaines where boutique_id = $1 order by domaine', [b.id])).rows.map((r) => r.domaine))
  const s = await etatStripe(b).catch(() => ({ configure: !!stripe, connecte: !!b.stripe_compte }))
  return ok(c, {
    nom: b.nom, slogan: b.slogan, logo: b.logo_chemin ? `/medias/${b.logo_chemin}` : null,
    banniere: b.banniere_chemin ? `/medias/${b.banniere_chemin}` : null, presentation_image: b.presentation_chemin ? `/medias/${b.presentation_chemin}` : null,
    theme: lireTheme(b), contenus: lireContenus(b),
    livraison_centimes: b.livraison_centimes, livraison_offerte_centimes: b.livraison_offerte_centimes, retrait_adresse: b.retrait_adresse,
    paiement_mode: b.paiement_mode, stripe: s, domaines
  })
})
admin.put('/boutique', async (c) => {
  const b = c.get('boutique'); const d = await c.req.json()
  const nom = String(d.nom ?? b.nom).trim(); if (nom.length < 2) return err(c, 'Nom de boutique trop court.')
  const centimes = (v, def) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.round(Number(v)) : def)
  const theme = validerTheme(d.theme || {}, lireTheme(b))
  const contenus = d.contenus ? validerContenus(d.contenus) : lireContenus(b)
  await db(c, (x) => x.query(`update boutiques set nom = $2, slogan = $3, couleurs = $4, livraison_centimes = $5, livraison_offerte_centimes = $6, retrait_adresse = $7,
    paiement_mode = $8, theme = $9, contenus = $10 where id = $1`, [b.id, nom, String(d.slogan ?? b.slogan).trim().slice(0, 120),
    { fond: theme.fond, texte: theme.texte, accent: theme.accent }, centimes(d.livraison_centimes, b.livraison_centimes),
    centimes(d.livraison_offerte_centimes, b.livraison_offerte_centimes), String(d.retrait_adresse ?? b.retrait_adresse).trim().slice(0, 200),
    d.paiement_mode === 'stripe' ? 'stripe' : 'test', theme, contenus]))
  oublierBoutique(b.id)
  return ok(c)
})
// Images de la page d'accueil : bannière et photo de la boutique.
for (const [route, colonne, largeur] of [['banniere', 'banniere_chemin', 2400], ['presentation', 'presentation_chemin', 1400]]) {
  admin.post(`/boutique/${route}`, async (c) => {
    const b = c.get('boutique'); const f = (await c.req.parseBody()).image
    if (!f || typeof f !== 'object') return err(c, 'Aucune image reçue.')
    let webp
    try { webp = await sharp(Buffer.from(await f.arrayBuffer())).rotate().resize({ width: largeur, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer() } catch { return err(c, 'Image illisible.') }
    const chemin = await ecrire(`${b.id}/${route}-${Date.now()}-vitrine.webp`, webp)
    await db(c, (x) => x.query(`update boutiques set ${colonne} = $2 where id = $1`, [b.id, chemin]))
    if (b[colonne]) await supprimer(b[colonne])
    oublierBoutique(b.id)
    return ok(c, { url: `/medias/${chemin}` })
  })
}
admin.get('/categories', (c) => ok(c, { categories: CATEGORIES }))
admin.post('/boutique/logo', async (c) => {
  const b = c.get('boutique'); const corps = await c.req.parseBody()
  const f = corps.logo
  if (!f || typeof f !== 'object') return err(c, 'Aucun fichier reçu.')
  let png
  try { png = await sharp(Buffer.from(await f.arrayBuffer())).resize({ height: 160, width: 640, fit: 'inside', withoutEnlargement: true }).png().toBuffer() } catch { return err(c, 'Image illisible.') }
  const chemin = await ecrire(`${b.id}/logo-${Date.now()}.png`, png)
  await db(c, (x) => x.query('update boutiques set logo_chemin = $2 where id = $1', [b.id, chemin]))
  if (b.logo_chemin) await supprimer(b.logo_chemin)
  oublierBoutique(b.id)
  return ok(c, { logo: `/medias/${chemin}` })
})
admin.post('/boutique/stripe', async (c) => {
  if (!stripe) return err(c, 'Le paiement Stripe n’est pas encore configuré sur la plateforme.', 503)
  const b = c.get('boutique')
  const origine = `${c.req.header('x-forwarded-proto') || (config.dev ? 'http' : 'https')}://${c.req.header('host')}`
  const { compte, url } = await lienStripe(b, origine)
  if (compte !== b.stripe_compte) { await db(c, (x) => x.query('update boutiques set stripe_compte = $2 where id = $1', [b.id, compte])); oublierBoutique(b.id) }
  return ok(c, { url })
})

function pick (o, cles) { const r = {}; for (const k of cles) if (k in o) r[k] = o[k]; return r }

// Refait les images d'un produit avec ou sans cintre (changement de catégorie).
async function representer (c, produitId, cintre) {
  const b = c.get('boutique')
  const photos = await db(c, async (x) => (await x.query(`update photos set reglages = reglages || jsonb_build_object('cintre', $2::text)
    where produit_id = $1 returning *`, [produitId, cintre])).rows)
  for (const ph of photos) if (ph.statut === 'pret') await recomposer(b.id, ph)
}
