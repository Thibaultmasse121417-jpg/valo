/* Parcours complet sur la vitrine (boutique « ambre », créée par tests/creer-ambre.js) :
   identité modifiée dans l'admin → visible sur la boutique ; accessoire ajouté (sans cintre, hors portant) ;
   vêtement soldé ajouté → sur le portant → acheté au prix soldé → commande et stock côté admin.
   node tests/ambre.e2e.js [dossier-captures] */
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const { chromium, devices } = createRequire(import.meta.url)('playwright')

const ICI = dirname(fileURLToPath(import.meta.url))
const PHOTO = (n) => resolve(ICI, 'donnees-ambre', n)
const URL_B = `http://ambre.localhost:${process.env.PORT || 8787}`
const captures = process.argv[2] || '/tmp/captures-ambre'
mkdirSync(captures, { recursive: true })
const etape = (t) => console.log('✓', t)
const cap = (p, n) => p.screenshot({ path: `${captures}/${n}.png` })
const suffixe = Date.now().toString(36).toUpperCase().slice(-5)

const nav = await chromium.launch()
const erreurs = []
const surveiller = (p, qui) => {
  p.on('pageerror', (e) => erreurs.push(`${qui} : ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error' && !/401|404/.test(m.text())) erreurs.push(`${qui} : ${m.text()}`) })
}

/* ---------- Administration ---------- */
const a = await (await nav.newContext({ viewport: { width: 1360, height: 900 } })).newPage()
surveiller(a, 'admin')
await a.goto(`${URL_B}/admin/`)
await a.fill('[data-login] [name="email"]', 'gerante@ambre-strass.fr')
await a.fill('[data-login] [name="mdp"]', 'motdepasse-ambre')
await a.click('[data-login] button[type="submit"]')
await a.waitForSelector('[data-panneau="vetements"]:not([hidden])')
etape('connexion à l’administration d’Ambre & Strass')

// Identité : on change le titre de la bannière et la couleur d'accent
await a.goto(`${URL_B}/admin/#boutique`)
await a.waitForFunction(() => document.querySelector('[data-form-boutique] [name="b_titre"]').value.length > 0)
const titre = `Briller, sans en faire trop · ${suffixe}`
await a.fill('[data-form-boutique] [name="b_titre"]', titre)
await a.$eval('[data-form-boutique] [name="t_accent"]', (el) => { el.value = '#9a5f34' })
await a.click('[data-form-boutique] button[type="submit"]')
await a.waitForFunction(() => document.querySelector('[data-toast]').textContent.includes('Réglages enregistrés'))
await cap(a, '1-admin-boutique')
etape('identité et textes modifiés depuis l’onglet Boutique')

async function ajouter ({ photo, nom, ref, categorie, prix, promo, stock }) {
  await a.goto(`${URL_B}/admin/#vetements`)
  await a.waitForSelector('[data-nouveau]')
  await a.click('[data-nouveau]')
  await a.waitForSelector('[data-fiche]:not([hidden])')
  await a.selectOption('[data-form-produit] [name="categorie"]', categorie)
  await a.setInputFiles('[data-fichiers]', PHOTO(photo))
  await a.waitForSelector('.ph__img img', { timeout: 60000 })
  await a.waitForFunction(() => document.querySelectorAll('[data-nom-couleur]').length > 0, null, { timeout: 8000 })
  await a.fill('[data-form-produit] [name="nom"]', nom)
  await a.fill('[data-form-produit] [name="reference"]', ref)
  await a.fill('[data-form-produit] [name="prix"]', prix)
  await a.fill('[data-form-produit] [name="promo"]', promo)
  const cases = await a.$$('[data-stock] input')
  for (const [k, c] of cases.entries()) await c.fill(String(stock[k] ?? 2))
  await a.check('[data-form-produit] [name="visible"]', { force: true })
  await a.click('[data-enregistrer]')
  await a.waitForFunction(() => document.querySelector('[data-toast]').textContent.includes('en ligne'), null, { timeout: 15000 })
  const remise = await a.textContent('[data-remise]')
  await a.click('[data-fiche-fermer]')
  await a.waitForSelector('[data-fiche]', { state: 'hidden' })
  return remise
}

// Un accessoire : sac, sans cintre, pas sur le portant
const remiseSac = await ajouter({ photo: '24.jpg', nom: `Sac test ${suffixe}`, ref: `SAC-${suffixe}`, categorie: 'sacs', prix: '35', promo: '28', stock: [3] })
assert.match(remiseSac, /20 %/)
await cap(a, '2-admin-accessoire')
etape('accessoire ajouté : catégorie Sacs, prix soldé 28 € (-20 %)')

// Un vêtement soldé : sur cintre, sur le portant
await ajouter({ photo: '01.jpg', nom: `Blouse test ${suffixe}`, ref: `BLOUSE-${suffixe}`, categorie: 'blouses-chemisiers', prix: '40', promo: '30', stock: [1, 3] })
await cap(a, '3-admin-vetement')
etape('vêtement ajouté : Blouses et chemisiers, 40 € soldé 30 €')

/* ---------- Cliente ---------- */
const c = await (await nav.newContext({ ...devices['iPhone 13'] })).newPage()
surveiller(c, 'cliente')
await c.goto(`${URL_B}/`)
await c.waitForSelector('.piece__btn')
assert.equal(await c.textContent('[data-ban-titre]'), titre, 'la bannière reprend le titre saisi dans l’admin')
const accent = await c.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())
assert.equal(accent, '#9a5f34', 'la couleur d’accent vient de l’admin')
etape('la boutique affiche le titre et la couleur choisis dans l’admin')

const portant = await c.$$eval('.piece__btn', (b) => b.map((x) => x.getAttribute('aria-label')))
assert.ok(portant[0].startsWith(`Blouse test ${suffixe}`), `le vêtement est en tête du portant (${portant[0]})`)
assert.ok(!portant.some((l) => l.startsWith('Sac test')), 'l’accessoire n’est pas sur le portant')
await c.waitForTimeout(500)
await cap(c, '4-portant')
etape('le vêtement est en tête du portant ; le sac n’y est pas')

// Le sac est dans les promotions et dans le rayon Sacs
assert.ok(await c.$eval('[data-promos]', (el, s) => el.textContent.includes(s), `Sac test ${suffixe}`), 'sac dans les promotions')
await c.click('[data-burger]')
await c.click('[data-tiroir-liens] [data-filtre="sacs"]')
await c.waitForFunction(() => document.querySelector('[data-cat-titre]').textContent === 'Sacs')
const sacs = await c.$$eval('[data-grid] .card__name', (n) => n.map((x) => x.textContent))
assert.ok(sacs.includes(`Sac test ${suffixe}`) && sacs.every((n) => /sac|pochette/i.test(n)), `rayon Sacs filtré (${sacs.join(', ')})`)
await cap(c, '5-rayon-sacs')
etape(`rayon Sacs depuis le menu : ${sacs.length} produits, le sac soldé y figure`)

// Achat de la blouse au prix soldé
await c.evaluate(() => document.querySelector('#portant').scrollIntoView())
await c.tap('.piece__btn')
await c.waitForSelector('[data-qv]:not([hidden])')
assert.match(await c.textContent('[data-qv-price]'), /30\s€.*40\s€.*-25 %/s)
await c.tap('[data-qv-sizes] button:not([disabled])')
await cap(c, '6-fiche')
await c.tap('[data-qv-add]')
await c.tap('[data-qv-close]')
await c.waitForSelector('[data-qv]', { state: 'hidden' })
await c.tap('[data-open-cart]')
await c.waitForSelector('[data-cart].is-on')
await c.tap('[data-checkout]')
await c.fill('[data-checkout-form] [name="email"]', 'lea@exemple.fr')
await c.fill('[data-checkout-form] [name="nom"]', 'Léa Martin')
await c.fill('[data-checkout-form] [name="ligne"]', '3 rue des Lilas')
await c.fill('[data-checkout-form] [name="code_postal"]', '59000')
await c.fill('[data-checkout-form] [name="ville"]', 'Lille')
assert.equal((await c.textContent('[data-cart-total]')).replace(/\s/g, ''), '35,90€', '30 € + 5,90 € de livraison')
await c.tap('[data-checkout]')
await c.waitForURL(/paiement-test/)
await c.tap('[data-payer]')
await c.waitForURL(/\/commande\//)
await c.waitForFunction(() => document.querySelector('[data-titre]').textContent === 'Commande confirmée')
await cap(c, '7-confirmation')
etape('achat payé au prix soldé : 30 € + 5,90 € de livraison = 35,90 €')

/* ---------- Retour côté boutique ---------- */
await a.goto(`${URL_B}/admin/#commandes`)
await a.waitForSelector('[data-cmd]')
await a.click('[data-cmd]')
await a.waitForSelector('[data-commande]:not([hidden]) [data-statut]')
const detail = await a.textContent('[data-commande]')
assert.ok(detail.includes(`BLOUSE-${suffixe}`) && /30\s€/.test(detail), 'commande avec la référence et le prix soldé')
await cap(a, '8-admin-commande')
await a.goto(`${URL_B}/admin/#vetements`)
await a.check('[data-filtre-promo]', { force: true })
await a.waitForSelector('[data-ouvrir]')
const enPromo = await a.$$eval('[data-ouvrir] b', (n) => n.map((x) => x.textContent))
assert.ok(enPromo.includes(`Blouse test ${suffixe}`) && enPromo.includes(`Sac test ${suffixe}`), 'filtre « En promotion » de l’admin')
etape(`la commande est dans l’admin ; filtre « En promotion » : ${enPromo.length} produits`)

await nav.close()
if (erreurs.length) { console.error('\nErreurs dans les pages :\n' + erreurs.join('\n')); process.exit(1) }
console.log(`\nParcours vitrine réussi. Captures : ${captures}`)
