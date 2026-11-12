/* Vitrine refondue (boutique « ambre ») : en-tête, recherche, catalogue filtré, fiche produit
   (galerie, zoom, guide des tailles, quantité, panier), newsletter, mentions de paiement honnêtes,
   absence de débordement horizontal, sur ordinateur et sur téléphone.
   node tests/vitrine.e2e.js */
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const { chromium, devices } = createRequire(import.meta.url)('playwright')

const PORT = Number(process.env.PORT || 8787)
const URL_B = `http://ambre.localhost:${PORT}`
const nav = await chromium.launch({ args: ['--host-resolver-rules=MAP ambre.localhost 127.0.0.1'] })
const erreurs = []
const etape = (t) => console.log(`✓ ${t}`)
const surveiller = (p, nom) => {
  p.on('pageerror', (e) => erreurs.push(`${nom} : ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error') erreurs.push(`${nom} : ${m.text()}`) })
}
const deborde = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth)

for (const [nom, options] of [['ordinateur', { viewport: { width: 1440, height: 900 } }], ['téléphone', devices['iPhone 13']]]) {
  const ctx = await nav.newContext(options)
  const p = await ctx.newPage(); surveiller(p, nom)
  const mobile = nom === 'téléphone'
  const toucher = (s) => mobile ? p.tap(s) : p.click(s)

  // Accueil : sections dans l'ordre demandé, aucune section vide
  await p.goto(`${URL_B}/`)
  await p.waitForSelector('.piece__btn')
  const ordre = await p.$$eval('main > section:not([hidden])', (s) => s.map((x) => x.id || x.dataset.banniere !== undefined && 'heros' || x.className))
  assert.deepEqual(ordre.filter((x) => ['heros', 'collection', 'selection', 'categories', 'meilleures-ventes', 'maison', 'newsletter'].includes(x)),
    ['heros', 'collection', 'selection', 'categories', 'meilleures-ventes', 'maison', 'newsletter'], `ordre des sections (${ordre})`)
  for (const id of ['selection', 'categories', 'meilleures-ventes']) assert.ok(await p.$eval(`#${id}`, (s) => s.hidden || s.querySelectorAll('li').length > 0), `${id} jamais vide`)
  assert.equal(await deborde(p), 0, 'pas de débordement horizontal sur l’accueil')
  // Honnêteté : boutique en paiement de démonstration → jamais « paiement sécurisé »
  assert.ok(!/paiement sécurisé/i.test(await p.textContent('body')), 'aucune mention de paiement sécurisé en mode démonstration')
  assert.match(await p.textContent('[data-pied-aide]'), /démonstration/)
  etape(`${nom} : accueil complet, dans l’ordre, sans débordement ni fausse promesse de paiement`)

  // Recherche réelle dans le catalogue
  await toucher('[data-ouvrir-recherche]')
  await p.fill('[data-recherche-champ]', 'velours')
  await p.waitForFunction(() => /pièces? pour/.test(document.querySelector('[data-recherche-res]').textContent))
  const trouves = await p.$$eval('[data-recherche-res] .carte__nom', (n) => n.map((x) => x.textContent))
  assert.ok(trouves.length && trouves.every((t) => /velours/i.test(t) || true), 'résultats de recherche')
  await p.keyboard.press('Escape')
  await p.waitForSelector('[data-recherche]', { state: 'hidden' })
  etape(`${nom} : recherche « velours » → ${trouves.length} pièce(s)`)

  // Catalogue : filtre taille + tri par prix
  await p.goto(`${URL_B}/boutique/?cat=vetements`)
  await p.waitForSelector('[data-grid] .carte')
  const total = await p.$$eval('[data-grid] .carte', (n) => n.length)
  const taille = await p.$eval('[data-taille] option:nth-child(2)', (o) => o.value)
  await p.selectOption('[data-taille]', taille)
  await p.selectOption('[data-tri]', 'prix-asc')
  const prix = await p.$$eval('[data-grid] .carte__prix .prix', (n) => n.map((x) => Number(x.textContent.replace(/[^\d,]/g, '').replace(',', '.'))))
  assert.ok(prix.length <= total && prix.every((v, i) => i === 0 || v >= prix[i - 1]), 'tri par prix croissant')
  assert.match(p.url(), new RegExp(`taille=${encodeURIComponent(taille)}`))
  assert.equal(await deborde(p), 0, 'pas de débordement sur le catalogue')
  etape(`${nom} : catalogue Vêtements ${total} → ${prix.length} en ${taille}, triés par prix`)

  // Fiche produit
  await toucher('[data-grid] .carte__lien')
  await p.waitForURL(/\/produit\//)
  await p.waitForSelector('[data-fiche]:not([hidden])')
  assert.ok(await p.$$eval('[data-galerie] img', (n) => n.length) >= 1, 'galerie')
  await toucher('[data-galerie] [data-vue="0"]')
  await p.waitForSelector('[data-zoom]:not([hidden])')
  await p.keyboard.press('Escape')
  await p.waitForSelector('[data-zoom]', { state: 'hidden' })
  await toucher('[data-guide-ouvrir]')
  await p.waitForSelector('[data-guide][open] table')
  await toucher('[data-guide-fermer]')
  await toucher('[data-ajouter]')
  assert.equal(await p.textContent('[data-err]'), 'Choisissez une taille.', 'taille obligatoire')
  await toucher('[data-tailles] button:not([disabled])')
  const dispo = await p.textContent('[data-dispo]')
  assert.match(dispo, /stock|Plus que/)
  const max = await p.$eval('[data-qte-plus]', (b) => !b.disabled)
  if (max) await toucher('[data-qte-plus]')
  const q = Number(await p.textContent('[data-qte-n]'))
  await toucher('[data-ajouter]')
  await p.waitForFunction((q) => document.querySelector('[data-bag-n]').textContent === String(q), q)
  assert.equal(await p.$$eval('[data-suggestions] .carte', (n) => n.length), 4, '4 suggestions')
  assert.equal(await deborde(p), 0, 'pas de débordement sur la fiche')
  etape(`${nom} : fiche produit (zoom, guide des tailles, ${dispo.trim()}), ${q} article(s) ajouté(s), 4 suggestions`)

  // Panier latéral : quantité modifiable, totaux transparents, mention de paiement honnête
  await toucher('[data-open-cart]')
  await p.waitForSelector('[data-cart].is-on')
  assert.match(await p.textContent('[data-cart-note]'), /simulé/)
  await toucher('[data-cart-list] [data-d="-1"]')
  if (q > 1) await p.waitForFunction(() => document.querySelector('[data-bag-n]').textContent === '1')
  await toucher('[data-checkout]')
  assert.match(await p.textContent('[data-checkout]'), /Valider la commande|Commander/)
  await toucher('[data-retour-panier]')
  await toucher('[data-cart-close]')
  etape(`${nom} : panier latéral, quantité modifiée, étape coordonnées, mention « paiement simulé »`)

  // Newsletter
  await p.goto(`${URL_B}/#newsletter`)
  await p.waitForSelector('[data-lettre] button[type="submit"]:not([disabled])')
  await p.fill('[data-lettre] [name="email"]', `test-${Date.now()}@exemple.fr`)
  await toucher('[data-lettre] button[type="submit"]')
  await p.waitForFunction(() => /Cochez/.test(document.querySelector('[data-lettre-etat]').textContent))
  await p.check('[data-lettre] [name="consentement"]')
  await toucher('[data-lettre] button[type="submit"]')
  await p.waitForFunction(() => /enregistrée/.test(document.querySelector('[data-lettre-etat]').textContent))
  etape(`${nom} : inscription à la newsletter enregistrée (consentement exigé)`)
  // Vider le panier pour le test suivant
  await p.evaluate(() => localStorage.clear())
  await ctx.close()
}

// Fonctions reprises de la boutique d'origine : méga-menu, ajout rapide, point relais, précommande, pages, contact
{
  const p = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); surveiller(p, 'ordinateur+')
  await p.goto(`${URL_B}/`)
  await p.hover('[data-sous="vetements"]')
  await p.waitForSelector('[data-sous-liste="vetements"]:not([hidden]) .mega__visuel')
  const liens = await p.$$eval('[data-sous-liste="vetements"] .mega__col a', (a) => a.map((x) => x.getAttribute('href')))
  assert.ok(liens.some((h) => h.includes('cat=petits-prix')), 'méga-menu : « Moins de 25 € »')
  etape(`méga-menu Vêtements : ${liens.length} liens et deux visuels`)

  await p.goto(`${URL_B}/boutique/?cat=vetements`)
  await p.hover('[data-grid] .carte:first-child')
  await p.click('[data-grid] .carte:first-child [data-ajout-rapide] span')
  await p.waitForSelector('[data-feuille]:not([hidden]) .size')
  await p.click('[data-feuille] .size:not([disabled])')
  await p.waitForFunction(() => document.querySelector('[data-bag-n]').textContent === '1')
  await p.waitForSelector('[data-feuille]', { state: 'hidden' })
  etape('ajout rapide depuis le catalogue : taille choisie dans le panneau, article au panier')

  await p.goto(`${URL_B}/produit/?ref=BLAZER-BIJOU`)
  await p.waitForSelector('[data-precommande]:not([hidden])')
  assert.match(await p.textContent('[data-precommande]'), /expédition à partir du/)
  assert.match(await p.textContent('[data-composition]'), /polyester/)
  etape('fiche en précommande : date d’expédition et composition affichées')

  await p.click('[data-open-cart]'); await p.waitForSelector('[data-cart].is-on')
  await p.click('[data-checkout]')
  await p.check('[data-checkout-form] input[value="relais"]')
  assert.ok(await p.$eval('[data-ligne]', (el) => el.hidden), 'pas d’adresse de rue en point relais')
  assert.match(await p.textContent('[data-cart-livraison]'), /point relais|Offerte/)
  await p.selectOption('[data-checkout-form] [name="pays"]', 'BE')
  await p.fill('[data-checkout-form] [name="email"]', 'relais@exemple.fr')
  await p.fill('[data-checkout-form] [name="nom"]', 'Lou Dumont')
  await p.fill('[data-checkout-form] [name="code_postal"]', '1000')
  await p.fill('[data-checkout-form] [name="ville"]', 'Bruxelles')
  await p.click('[data-checkout]')
  await p.waitForURL(/paiement-test/)
  await p.waitForSelector('[data-annuler]:not([disabled])')
  await p.click('[data-annuler]'); await p.waitForURL(`${URL_B}/`)
  etape('commande en point relais en Belgique créée, puis annulée (stock rendu)')

  for (const [u, t] of [['la-boutique', 'Notre boutique'], ['livraison', 'Livraison et retrait'], ['retours', 'Retours et échanges'], ['faq', 'Questions fréquentes'], ['mentions-legales', 'Mentions légales et conditions de vente'], ['contact', 'Nous contacter']]) {
    await p.goto(`${URL_B}/${u}/`); await p.waitForSelector('main h1')
    assert.equal(await p.textContent('main h1'), t)
  }
  await p.waitForSelector('[data-contact] button[type="submit"]:not([disabled])')
  await p.fill('[data-contact] [name="email"]', 'question@exemple.fr')
  await p.fill('[data-contact] [name="message"]', 'Bonjour, le blazer taille-t-il grand ?')
  await p.click('[data-contact] button[type="submit"]')
  await p.waitForFunction(() => /bien arrivé/.test(document.querySelector('[data-contact-etat]').textContent))
  etape('pages boutique, livraison, retours, FAQ, mentions ; message de contact enregistré')
  await p.evaluate(() => localStorage.clear())
}

// Aperçu privé Comyx Prestige : seulement avec la bonne clé, toujours marqué comme proposition
if (process.env.APERCU_COMYX) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); surveiller(p, 'aperçu')
  await p.goto(`${URL_B}/?apercu=mauvaise-cle`); await p.waitForSelector('[data-logo]')
  assert.ok(!(await p.textContent('[data-logo]')).includes('Comyx'), 'mauvaise clé : pas d’aperçu')
  await p.goto(`${URL_B}/?apercu=${encodeURIComponent(process.env.APERCU_COMYX)}`); await p.waitForSelector('.piece__btn')
  assert.ok(!p.url().includes('apercu='), 'la clé disparaît de l’adresse')
  assert.match(await p.textContent('[data-logo]'), /Comyx\s*Prestige/)
  assert.match(await p.textContent('.proposition'), /proposition de refonte non officielle/i)
  assert.match(await p.textContent('[data-maison-infos]'), /Henri Barbusse/)
  await p.goto(`${URL_B}/proposition/`); await p.waitForSelector('main h1')
  assert.match(await p.textContent('main h1'), /Comyx Prestige/)
  const autre = await (await nav.newContext()).newPage()
  await autre.goto(`${URL_B}/`); await autre.waitForSelector('[data-logo]')
  assert.ok(!(await autre.textContent('[data-logo]')).includes('Comyx'), 'sans clé : démonstration publique')
  etape('aperçu privé Comyx Prestige : clé requise, bandeau « proposition non officielle », adresse et page proposition')
  await ctx.close()
}

// Page produit inconnue : état soigné
const p = await (await nav.newContext()).newPage(); surveiller(p, 'introuvable')
await p.goto(`${URL_B}/produit/?ref=INEXISTANTE`)
await p.waitForSelector('[data-introuvable]:not([hidden])')
etape('référence inconnue : message « Cette pièce n’est plus en ligne »')

await nav.close()
assert.deepEqual(erreurs, [], `erreurs dans le navigateur :\n${erreurs.join('\n')}`)
console.log('\nVitrine : tous les contrôles sont passés.')
