/* Test de l'API, de bout en bout, sur deux boutiques.
   node tests/api.js <photo.jpg>   (serveur lancé, boutiques alba et nova créées) */
import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const BASE = process.env.BASE || 'http://localhost:8787'
const photo = process.argv[2]

// fetch ne permet pas de choisir l'en-tête Host : petite requête HTTP à la main.
import http from 'node:http'
function requeteHttp (url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const envoi = async () => {
      let donnees = body
      if (body instanceof FormData) {
        const r = new Request('http://x', { method: 'POST', body })
        headers['content-type'] = r.headers.get('content-type'); donnees = Buffer.from(await r.arrayBuffer())
      }
      const req = http.request({ host: u.hostname, port: u.port, path: u.pathname + u.search, method, headers }, (res) => {
        const morceaux = []
        res.on('data', (m) => morceaux.push(m))
        res.on('end', () => {
          const buf = Buffer.concat(morceaux)
          resolve({ status: res.statusCode, ok: res.statusCode < 300, headers: { get: (k) => [res.headers[k.toLowerCase()]].flat()[0] ?? null },
            json: async () => JSON.parse(buf), arrayBuffer: async () => buf })
        })
      })
      req.on('error', reject)
      if (donnees) req.write(donnees)
      req.end()
    }
    envoi().catch(reject)
  })
}
const fetch = (url, o = {}) => requeteHttp(url, o)

function client (hote) {
  let cookie = ''
  return async (methode, chemin, corps, opts = {}) => {
    const h = { host: hote, 'x-portant': '1', ...(cookie ? { cookie } : {}) }
    let body = corps
    if (corps && !(corps instanceof FormData) && !(corps instanceof Buffer)) { h['content-type'] = 'application/json'; body = JSON.stringify(corps) }
    const r = await fetch(BASE + chemin, { method: methode, headers: h, body })
    const sc = r.headers.get('set-cookie'); if (sc && sc.startsWith('portant_session=')) cookie = sc.split(';')[0]
    const type = r.headers.get('content-type') || ''
    const d = type.includes('json') ? await r.json() : await r.arrayBuffer()
    if (!opts.brut && !r.ok) throw new Error(`${methode} ${chemin} → ${r.status} ${JSON.stringify(d)}`)
    return opts.brut ? { statut: r.status, d } : d
  }
}
const etape = (t) => console.log('✓', t)

const alba = client('alba.localhost'); const nova = client('nova.localhost'); const visiteur = client('alba.localhost')

// 1. Connexion
assert.equal((await alba('GET', '/api/admin/produits', null, { brut: true })).statut, 401)
assert.equal((await alba('POST', '/api/admin/connexion', { email: 'gerant@alba.fr', mdp: 'faux' }, { brut: true })).statut, 401)
await alba('POST', '/api/admin/connexion', { email: 'gerant@alba.fr', mdp: 'motdepasse-alba' })
// un compte d'une boutique ne peut pas se connecter sur une autre
assert.equal((await nova('POST', '/api/admin/connexion', { email: 'gerant@alba.fr', mdp: 'motdepasse-alba' }, { brut: true })).statut, 401)
await nova('POST', '/api/admin/connexion', { email: 'gerant@nova.fr', mdp: 'motdepasse-nova' })
etape('connexion des deux boutiques, comptes cloisonnés')

// 2. Nouveau vêtement + photo
const col = await alba('POST', '/api/admin/collections', { nom: 'Hiver' })
let p = await alba('POST', '/api/admin/produits/brouillon')
const fd = new FormData()
fd.append('photos', new Blob([await readFile(photo)], { type: 'image/png' }), 'pull.png')
const { photos: [ph] } = await alba('POST', `/api/admin/produits/${p.id}/photos`, fd)
let t0 = Date.now(); let etat
do { await new Promise((r) => setTimeout(r, 300)); etat = await alba('GET', `/api/admin/photos/${ph.id}`) } while (['en_attente', 'traitement'].includes(etat.statut) && Date.now() - t0 < 60000)
assert.equal(etat.statut, 'pret', 'la photo doit être détourée')
etape(`photo détourée en ${Date.now() - t0} ms (cintre : ${etat.reglages.cintre_detecte}, couleur : ${etat.reglages.hex})`)

// 3. Fiche : couleur, tailles, stock par variante, collection, mise en ligne
p = await alba('PUT', `/api/admin/produits/${p.id}`, {
  reference: 'PULL-TORS', nom: 'Montmartre, pull torsadé', type: 'Pull', description: 'Laine épaisse.', prix_centimes: 11900,
  tailles: ['S', 'M', 'L'], visible: true, nouveau: true, collections: [col.id],
  couleurs: [{ cle: 'c1', nom: 'Ocre', hex: etat.reglages.hex }],
  photos: [{ id: ph.id, couleur: 'c1', role: 'face', ordre: 0 }],
  stocks: [{ couleur: 'c1', taille: 'S', stock: 2 }, { couleur: 'c1', taille: 'M', stock: 1 }, { couleur: 'c1', taille: 'L', stock: 0 }]
})
assert.equal(p.variantes.length, 3)
assert.equal(p.variantes.find((v) => v.taille === 'M').sku, 'PULL-TORS-OCRE-M')
etape('fiche enregistrée : 3 variantes, références générées, en ligne')

// 4. Correction manuelle : agrandir et décaler, puis masque retouché
const v0 = p.photos[0].version
p = await alba('PUT', `/api/admin/photos/${ph.id}`, { reglages: { echelle: 1.1, dy: 10, cintre: 'ajout' } })
assert.ok(p.photos[0].version > v0)
const masque = await alba('GET', `/api/admin/photos/${ph.id}/masque`)
p = await alba('PUT', `/api/admin/photos/${ph.id}/masque`, Buffer.from(masque))
etape('correction manuelle (position + masque) : image du portant refaite')

// 5. Côté client : le vêtement est sur le portant
const cat = await visiteur('GET', '/api/catalogue')
const pub = cat.produits.find((x) => x.reference === 'PULL-TORS')
assert.ok(pub, 'visible dans le catalogue public')
assert.ok(pub.couleurs[0].face.startsWith('/medias/'))
const img = await fetch(BASE + pub.couleurs[0].face, { headers: { host: 'alba.localhost' } })
assert.equal(img.status, 200)
assert.equal((await fetch(BASE + pub.couleurs[0].face, { headers: { host: 'nova.localhost' } })).status, 404)
assert.equal(cat.collections[0].nom, 'Hiver')
etape('le vêtement apparaît dans le catalogue public avec son image de portant')

// 6. Isolation : Nova ne voit ni ne modifie rien chez Alba
assert.equal((await nova('GET', `/api/admin/produits/${p.id}`, null, { brut: true })).statut, 404)
assert.equal((await nova('DELETE', `/api/admin/produits/${p.id}`, null, { brut: true })).statut, 404) // ne supprime rien chez Alba…
assert.ok((await alba('GET', `/api/admin/produits/${p.id}`)).id) // …la preuve
assert.equal((await nova('GET', `/api/admin/photos/${ph.id}/original`, null, { brut: true })).statut, 404)
assert.equal((await client('nova.localhost')('GET', '/api/catalogue')).produits.length, 0)
etape('isolation : la boutique Nova ne voit et ne modifie rien chez Alba')

// 7. Achat
const vM = pub.couleurs[0].variantes.find((v) => v.taille === 'M')
const vL = pub.couleurs[0].variantes.find((v) => v.taille === 'L')
assert.equal(vL.disponible, false)
assert.equal((await visiteur('POST', '/api/commandes', { client: { email: 'a@b.fr', nom: 'Léa' }, livraison_mode: 'retrait', lignes: [{ variante_id: vL.id, quantite: 1 }] }, { brut: true })).statut, 409)
const cmd = await visiteur('POST', '/api/commandes', {
  client: { email: 'lea@exemple.fr', nom: 'Léa Martin', adresse: { ligne: '3 rue des Lilas', code_postal: '75011', ville: 'Paris' } },
  livraison_mode: 'livraison', lignes: [{ variante_id: vM.id, quantite: 1 }]
})
// la dernière pièce M est réservée : un second client ne peut pas l'acheter
assert.equal((await visiteur('POST', '/api/commandes', { client: { email: 'x@y.fr', nom: 'Max' }, livraison_mode: 'retrait', lignes: [{ variante_id: vM.id, quantite: 1 }] }, { brut: true })).statut, 409)
let suivi = await visiteur('GET', `/api/commandes/${cmd.jeton}`)
assert.equal(suivi.statut, 'en_attente_paiement')
assert.equal(suivi.total_centimes, 11900 + 490)
await visiteur('POST', `/api/paiement-test/${cmd.jeton}`, { action: 'payer' })
suivi = await visiteur('GET', `/api/commandes/${cmd.jeton}`)
assert.equal(suivi.statut, 'payee')
etape(`commande n° ${suivi.numero} payée (${suivi.total_centimes / 100} €, livraison comprise)`)

// 8. La boutique voit la commande et le stock a baissé
const { commandes } = await alba('GET', '/api/admin/commandes')
assert.equal(commandes[0].statut, 'payee')
assert.equal((await nova('GET', '/api/admin/commandes')).commandes.length, 0)
const apres = await alba('GET', `/api/admin/produits/${p.id}`)
assert.equal(apres.variantes.find((v) => v.taille === 'M').stock, 0)
await alba('PUT', `/api/admin/commandes/${commandes[0].id}`, { statut: 'expediee' })
etape('la boutique voit la commande, stock M passé à 0, commande expédiée')

// 9. Paiement abandonné : le stock revient
const cmd2 = await visiteur('POST', '/api/commandes', { client: { email: 'z@z.fr', nom: 'Zoé' }, livraison_mode: 'retrait', lignes: [{ variante_id: pub.couleurs[0].variantes.find((v) => v.taille === 'S').id, quantite: 2 }] })
assert.equal((await alba('GET', `/api/admin/produits/${p.id}`)).variantes.find((v) => v.taille === 'S').stock, 0)
await visiteur('POST', `/api/paiement-test/${cmd2.jeton}`, { action: 'annuler' })
assert.equal((await alba('GET', `/api/admin/produits/${p.id}`)).variantes.find((v) => v.taille === 'S').stock, 2)
etape('paiement annulé : les 2 pièces S reviennent en stock')

// 10. Masquer puis supprimer
await alba('PATCH', `/api/admin/produits/${p.id}`, { visible: false })
assert.ok(!(await visiteur('GET', '/api/catalogue')).produits.some((x) => x.id === p.id))
await alba('PATCH', `/api/admin/produits/${p.id}`, { visible: true })
etape('masquer / remettre en ligne')
console.log('\nTous les tests de l’API passent.')
