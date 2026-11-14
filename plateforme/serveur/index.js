/* Serveur de la plateforme : une seule application pour toutes les boutiques.
   La boutique est reconnue au nom de domaine ; chaque requête ne voit que ses données. */
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { bodyLimit } from 'hono/body-limit'
import { readFile } from 'node:fs/promises'
import { resolve, extname, normalize, sep } from 'node:path'
import { config } from './config.js'
import { pool } from './db.js'
import { boutiqueDeRequete } from './boutique.js'
import { apercu } from './apercu.js'
import { publique } from './routes-public.js'
import { admin } from './routes-admin.js'
import { lire, estPublic } from './stockage.js'
import { demarrerFile } from './file.js'
import { stripe } from './paiement.js'
import { marquerPayee, annulerCommande } from './commandes.js'
import { preparerDemo } from './demo.js'

const app = new Hono()

app.onError((e, c) => {
  console.error(e)
  return c.json({ erreur: 'Erreur du serveur. Réessayez dans un instant.' }, 500)
})

app.use('*', async (c, next) => {
  await next()
  c.header('x-content-type-options', 'nosniff')
  c.header('referrer-policy', 'strict-origin-when-cross-origin')
  c.header('x-robots-tag', 'noindex, nofollow') // maquette de démonstration : jamais dans les moteurs de recherche
  if (c.req.path.startsWith('/admin')) c.header('x-frame-options', 'DENY')
})

// Webhook Stripe : avant la reconnaissance du domaine (Stripe appelle l'adresse de la plateforme).
app.post('/api/stripe/webhook', async (c) => {
  if (!stripe || !config.stripe.webhook) return c.text('non configuré', 404)
  let ev
  try {
    ev = stripe.webhooks.constructEvent(await c.req.text(), c.req.header('stripe-signature'), config.stripe.webhook)
  } catch { return c.text('signature invalide', 400) }
  const s = ev.data.object; const meta = s.metadata || {}
  if (meta.boutique_id && meta.commande_id) {
    if (ev.type === 'checkout.session.completed' && s.payment_status === 'paid') await marquerPayee(meta.boutique_id, meta.commande_id, s.payment_intent || s.id)
    if (ev.type === 'checkout.session.async_payment_succeeded') await marquerPayee(meta.boutique_id, meta.commande_id, s.payment_intent || s.id)
    if (ev.type === 'checkout.session.expired' || ev.type === 'checkout.session.async_payment_failed') await annulerCommande(meta.boutique_id, meta.commande_id)
  }
  return c.json({ recu: true })
})

// Reconnaissance de la boutique.
app.use('*', async (c, next) => {
  const b = await boutiqueDeRequete(c)
  if (!b) {
    if (c.req.path.startsWith('/api/')) return c.json({ erreur: 'Boutique inconnue.' }, 404)
    return c.html('<!doctype html><meta charset="utf-8"><title>Boutique introuvable</title><p style="font:16px system-ui;padding:40px">Aucune boutique n’est reliée à cette adresse.</p>', 404)
  }
  c.set('boutique', b)
  return next()
})

// Aperçu privé de la proposition pour Comyx Prestige (lien secret)
app.use('*', apercu)

app.use('/api/admin/*', bodyLimit({ maxSize: 160 * 1024 * 1024, onError: (c) => c.json({ erreur: 'Envoi trop lourd.' }, 413) }))
app.use('/api/commandes', bodyLimit({ maxSize: 64 * 1024 }))
app.route('/api/admin', admin)
app.route('/api', publique)

// Fichiers publics des boutiques (images du portant, vignettes, logos) — seulement ceux de la boutique visitée.
app.get('/medias/*', async (c) => {
  const rel = decodeURIComponent(c.req.path.slice('/medias/'.length))
  if (!rel.startsWith(`${c.get('boutique').id}/`) || !estPublic(rel)) return c.notFound()
  try {
    const type = rel.endsWith('.png') ? 'image/png' : 'image/webp'
    return c.body(await lire(rel), 200, { 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable' })
  } catch { return c.notFound() }
})

// Pages (construites par Vite dans web/dist).
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4' }
app.get('*', async (c) => {
  let p = c.req.path
  if (p.endsWith('/')) p += 'index.html'
  const fichier = normalize(resolve(config.web, '.' + p))
  if (!fichier.startsWith(config.web + sep)) return c.notFound()
  try {
    const corps = await readFile(fichier)
    const immuable = p.startsWith('/assets/')
    const entetes = { 'content-type': TYPES[extname(fichier)] || 'application/octet-stream', 'cache-control': immuable ? 'public, max-age=31536000, immutable' : 'no-cache', 'accept-ranges': 'bytes' }
    // Lecture par morceaux (Range) : Safari sur iPhone l'exige pour lire une vidéo, sinon l'écran reste noir
    const plage = /^bytes=(\d*)-(\d*)$/.exec(c.req.header('range') || '')
    if (plage && (plage[1] || plage[2])) {
      const taille = corps.length
      let debut = plage[1] ? Number(plage[1]) : taille - Number(plage[2])
      let fin = plage[1] && plage[2] ? Number(plage[2]) : taille - 1
      debut = Math.max(0, debut); fin = Math.min(fin, taille - 1)
      if (debut > fin || debut >= taille) return c.body(null, 416, { 'content-range': `bytes */${taille}` })
      return c.body(corps.subarray(debut, fin + 1), 206, { ...entetes, 'content-range': `bytes ${debut}-${fin}/${taille}`, 'content-length': String(fin - debut + 1) })
    }
    return c.body(corps, 200, entetes)
  } catch {
    if (!extname(p)) return c.redirect(p + '/')
    return c.notFound()
  }
})

demarrerFile()
setInterval(() => pool.query('select expirer_commandes()').catch((e) => console.error('[expiration]', e.message)), 60_000).unref()
pool.query('select expirer_commandes()').catch(() => {})

serve({ fetch: app.fetch, port: config.port }, (i) => {
  console.log(`Plateforme portant : http://localhost:${i.port}  (paiement ${stripe ? 'Stripe' : config.paiementTest ? 'simulé' : 'désactivé'})`)
  preparerDemo().catch((e) => console.error('[démo]', e.message))
})
