/* API publique de la boutique : catalogue, commandes, paiement. */
import { Hono } from 'hono'
import { avecBoutique } from './db.js'
import { boutiquePublique } from './boutique.js'
import { lireProduits } from './catalogue.js'
import { creerCommande, marquerPayee, annulerCommande, lireCommande, ErreurClient } from './commandes.js'
import { modePaiement, sessionStripe, verifierSessionStripe, stripe } from './paiement.js'
import { config } from './config.js'

export const publique = new Hono()

const origine = (c) => {
  const proto = c.req.header('x-forwarded-proto') || (config.dev ? 'http' : 'https')
  return `${proto}://${c.req.header('host')}`
}

publique.get('/boutique', (c) => c.json(boutiquePublique(c.get('boutique'))))

publique.get('/catalogue', async (c) => {
  const b = c.get('boutique')
  const res = await avecBoutique(b.id, async (db) => {
    const produits = (await lireProduits(db, { public: true })).filter((p) => p.couleurs.length)
    const { rows: collections } = await db.query(`select id, nom, description from collections where visible
      and exists (select 1 from produit_collections pc join produits p on p.id = pc.produit_id where pc.collection_id = collections.id and p.visible)
      order by ordre, nom`)
    return { produits, collections }
  })
  c.header('cache-control', 'no-store')
  return c.json(res)
})

publique.post('/commandes', async (c) => {
  const b = c.get('boutique')
  const mode = modePaiement(b)
  if (!mode) return c.json({ erreur: 'Le paiement n’est pas encore activé pour cette boutique.' }, 503)
  try {
    const corps = await c.req.json()
    const cmd = await creerCommande(b, corps, mode)
    if (mode === 'test') return c.json({ jeton: cmd.jeton, url: `/paiement-test/?n=${cmd.jeton}` })
    try {
      const s = await sessionStripe(b, { ...cmd, email: corps.client.email }, origine(c))
      await avecBoutique(b.id, (db) => db.query('update commandes set paiement_ref = $2 where id = $1', [cmd.id, s.id]))
      return c.json({ jeton: cmd.jeton, url: s.url })
    } catch (e) {
      console.error('[stripe]', e.message)
      await annulerCommande(b.id, cmd.id)
      return c.json({ erreur: 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.' }, 502)
    }
  } catch (e) {
    if (e instanceof ErreurClient) return c.json({ erreur: e.message }, e.statut)
    throw e
  }
})

// Suivi d'une commande par son lien secret (page de confirmation).
publique.get('/commandes/:jeton', async (c) => {
  const b = c.get('boutique')
  let cmd = await avecBoutique(b.id, (db) => lireCommande(db, { jeton: c.req.param('jeton') }))
  if (!cmd) return c.json({ erreur: 'Commande introuvable.' }, 404)
  // Retour de Stripe : on vérifie le paiement auprès de Stripe, sans attendre le webhook.
  if (cmd.statut === 'en_attente_paiement' && cmd.paiement_mode === 'stripe' && cmd.paiement_ref && stripe) {
    const v = await verifierSessionStripe(b, cmd.paiement_ref).catch(() => null)
    if (v?.payee) await marquerPayee(b.id, cmd.id, v.ref)
    else if (v?.expiree) await annulerCommande(b.id, cmd.id)
    if (v?.payee || v?.expiree) cmd = await avecBoutique(b.id, (db) => lireCommande(db, { id: cmd.id }))
  }
  return c.json({
    numero: cmd.numero, statut: cmd.statut, livraison_mode: cmd.livraison_mode, client: { nom: cmd.client.nom, email: cmd.client.email },
    sous_total_centimes: cmd.sous_total_centimes, livraison_centimes: cmd.livraison_centimes, total_centimes: cmd.total_centimes,
    paiement_mode: cmd.paiement_mode, expire_at: cmd.expire_at,
    lignes: cmd.lignes.map((l) => ({ nom: l.nom, couleur: l.couleur, taille: l.taille, prix_centimes: l.prix_unitaire_centimes, quantite: l.quantite }))
  })
})

// Paiement simulé (jamais disponible en production).
publique.post('/paiement-test/:jeton', async (c) => {
  if (!config.paiementTest) return c.json({ erreur: 'Indisponible.' }, 404)
  const b = c.get('boutique')
  const cmd = await avecBoutique(b.id, (db) => lireCommande(db, { jeton: c.req.param('jeton') }))
  if (!cmd || cmd.paiement_mode !== 'test') return c.json({ erreur: 'Commande introuvable.' }, 404)
  const { action } = await c.req.json().catch(() => ({}))
  if (action === 'payer') await marquerPayee(b.id, cmd.id, `test_${Date.now()}`)
  else await annulerCommande(b.id, cmd.id)
  return c.json({ ok: true })
})

// Newsletter : inscription réelle, gardée par boutique (consultable et exportable dans l'administration).
publique.post('/newsletter', async (c) => {
  const b = c.get('boutique')
  const { email = '', consentement } = await c.req.json().catch(() => ({}))
  const e = String(email).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) || e.length > 200) return c.json({ erreur: 'Adresse e-mail invalide.' }, 400)
  if (consentement !== true) return c.json({ erreur: 'Cochez la case pour accepter de recevoir nos e-mails.' }, 400)
  await avecBoutique(b.id, (db) => db.query('insert into newsletter (boutique_id, email) values ($1, $2) on conflict do nothing', [b.id, e]))
  return c.json({ ok: true })
})
