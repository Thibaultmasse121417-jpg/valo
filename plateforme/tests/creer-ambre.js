/* Crée la boutique de démonstration « Ambre & Strass » en passant par l'API d'administration,
   comme le ferait la commerçante : réglages, collections, puis chaque produit
   (photo envoyée → détourage par le serveur → fiche, stock, mise en ligne).

   Prérequis : serveur lancé, boutique créée avec
   npm run boutique:creer -- --slug ambre --nom "Ambre & Strass" --domaine ambre.localhost --email gerante@ambre-strass.fr --mdp "motdepasse-ambre"

   node tests/creer-ambre.js */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { appliquerIdentite } from './ambre-identite.js'

const ICI = dirname(fileURLToPath(import.meta.url))
const PHOTOS = resolve(ICI, 'donnees-ambre')
const PORT = Number(process.env.PORT || 8787)
const HOTE = process.env.HOTE || 'ambre.localhost'

let cookie = ''
function appel (methode, chemin, corps) {
  return new Promise((ok, ko) => {
    const h = { host: HOTE, 'x-portant': '1', ...(cookie ? { cookie } : {}) }
    let donnees = null
    const envoyer = async () => {
      if (corps instanceof FormData) { const r = new Request('http://x', { method: 'POST', body: corps }); h['content-type'] = r.headers.get('content-type'); donnees = Buffer.from(await r.arrayBuffer()) } else if (corps) { h['content-type'] = 'application/json'; donnees = Buffer.from(JSON.stringify(corps)) }
      const req = http.request({ host: 'localhost', port: PORT, path: chemin, method: methode, headers: h }, (res) => {
        const m = []; res.on('data', (x) => m.push(x)); res.on('end', () => {
          const sc = res.headers['set-cookie']?.[0]; if (sc?.startsWith('portant_session=')) cookie = sc.split(';')[0]
          const t = Buffer.concat(m).toString(); const d = t && res.headers['content-type']?.includes('json') ? JSON.parse(t) : t
          res.statusCode < 300 ? ok(d) : ko(new Error(`${methode} ${chemin} → ${res.statusCode} ${t}`))
        })
      })
      req.on('error', ko); if (donnees) req.write(donnees); req.end()
    }
    envoyer().catch(ko)
  })
}
const fichier = async (nom) => new Blob([await readFile(resolve(PHOTOS, nom))], { type: 'image/jpeg' })
const attendre = (ms) => new Promise((r) => setTimeout(r, ms))

const COLLECTIONS = {
  soirees: { nom: 'Soirées scintillantes', description: 'Sequins, strass et velours pour les fêtes.' },
  hiver: { nom: 'Douceur d’hiver', description: 'Mailles, fausse fourrure et laine.' },
  essentiels: { nom: 'Les essentiels', description: 'Les pièces qu’on porte tous les jours.' }
}
const T2 = ['S/M', 'M/L']; const T4 = ['S', 'M', 'L', 'XL']; const TU = ['Taille unique']
// [référence, nom, type, catégorie, prix €, promo €, tailles, collections, nouveau, mis en avant, description, [[couleur, hex, photo], …]]
const PRODUITS = [
  ['BLOUSE-LAVA', 'Blouse lavallière satinée', 'Blouse', 'blouses-chemisiers', 39.9, null, T2, ['essentiels', 'soirees'], true, true, 'Satin fluide, col lavallière à nouer, manches longues resserrées aux poignets.', [['Champagne', '#d8c3a0', '01.jpg'], ['Noir', '#151414', '02.jpg']]],
  ['CHEM-DENT', 'Chemise en dentelle', 'Chemise', 'blouses-chemisiers', 44.9, null, T2, ['soirees'], false, false, 'Dentelle florale légèrement transparente, boutonnée devant. À porter sur un caraco.', [['Noir', '#141313', '03.jpg']]],
  ['PULL-LUREX', 'Pull col montant lurex', 'Pull', 'pulls-sweats', 42, null, TU, ['hiver'], true, false, 'Maille douce traversée de fils dorés, col montant, coupe ample.', [['Choco', '#5b3b2a', '04.jpg'], ['Écru', '#efe6d6', '05.jpg']]],
  ['SWEAT-PERLE', 'Sweat brodé de perles', 'Sweat', 'pulls-sweats', 36, 27, TU, ['essentiels'], false, false, 'Molleton gris chiné, perles nacrées brodées au col et aux poignets.', [['Gris chiné', '#a7a7a8', '06.jpg']]],
  ['TOP-VELOURS', 'Top bustier en velours', 'Top', 'tops-tshirts', 29.9, null, T2, ['soirees'], true, false, 'Velours profond, décolleté cœur, fines bretelles réglables.', [['Bordeaux', '#6e1424', '07.jpg'], ['Noir', '#121111', '08.jpg']]],
  ['TEE-COEUR', 'T-shirt cœur strass', 'T-shirt', 'tops-tshirts', 24.9, null, T2, ['essentiels'], false, true, 'Coton épais, petit cœur en strass sur la poitrine.', [['Blanc', '#f4f4f2', '09.jpg'], ['Noir', '#141414', '10.jpg']]],
  ['VESTE-FOUR', 'Veste courte fausse fourrure', 'Veste', 'vestes-manteaux', 69, null, T2, ['hiver'], true, true, 'Fausse fourrure moelleuse, col rabattu, fermeture à crochets.', [['Camel', '#b98a5a', '11.jpg']]],
  ['MANT-LAINE', 'Manteau long en laine', 'Manteau', 'vestes-manteaux', 119, 95, T4, ['hiver'], false, false, 'Laine double face, revers crantés, ceinture à nouer, longueur genou.', [['Choco', '#4c2f22', '12.jpg']]],
  ['BLAZER-BIJOU', 'Blazer croisé boutons bijoux', 'Blazer', 'vestes-manteaux', 59, null, T4, ['soirees'], false, false, 'Coupe structurée, double boutonnage à boutons strass.', [['Noir', '#121212', '13.jpg']]],
  ['PANT-SATIN', 'Pantalon large satiné', 'Pantalon', 'pantalons-shorts', 45, 35, T4, ['essentiels', 'soirees'], false, false, 'Satin fluide, taille élastiquée, jambes larges.', [['Choco', '#5a301c', '14.jpg']]],
  ['SHORT-TWEED', 'Short en tweed pailleté', 'Short', 'pantalons-shorts', 34.9, null, ['S', 'M', 'L'], ['soirees'], true, false, 'Tweed noir traversé de fils dorés, taille haute, boutons dorés.', [['Noir et or', '#1f1b16', '15.jpg']]],
  ['ROBE-SEQ', 'Robe longue à sequins', 'Robe', 'robes-jupes', 79, null, T2, ['soirees'], true, true, 'Sequins bronze, fines bretelles, décolleté en V. La robe des grands soirs.', [['Bronze', '#8a5a33', '16.jpg']]],
  ['ROBE-PULL', 'Robe pull côtelée', 'Robe', 'robes-jupes', 49, 39, T2, ['hiver'], false, false, 'Maille côtelée, longueur midi, manches longues.', [['Écru', '#ece4d6', '17.jpg']]],
  ['JUPE-PLIS', 'Jupe midi plissée satinée', 'Jupe', 'robes-jupes', 39, null, TU, ['essentiels'], false, false, 'Plissé soleil satiné, taille élastique, longueur midi.', [['Taupe', '#8f7a68', '18.jpg']]],
  ['COMBI-FLUIDE', 'Combinaison fluide ceinturée', 'Combinaison', 'combinaisons-ensembles', 59, null, T2, ['essentiels'], false, false, 'Crêpe fluide, col V, ceinture à nouer, jambes larges.', [['Noir', '#121212', '19.jpg']]],
  ['ENS-MAILLE', 'Ensemble gilet et jupe en maille', 'Ensemble', 'combinaisons-ensembles', 69, null, T2, ['hiver'], true, false, 'Gilet court boutonné et jupe midi assortie, maille douce.', [['Gris perle', '#b7b6b3', '20.jpg']]],
  ['COLL-PLAST', 'Collier plastron strass', 'Collier', 'bijoux', 22, null, TU, ['soirees'], false, false, 'Plastron de strass sur chaîne dorée, fermoir réglable.', [['Doré', '#d4b25e', '21.jpg']]],
  ['CREOLES-OR', 'Créoles dorées torsadées', 'Boucles d’oreilles', 'bijoux', 18, null, TU, ['essentiels'], false, false, 'Grandes créoles en métal doré torsadé.', [['Doré', '#d1ab4c', '22.jpg']]],
  ['SAC-VELOURS', 'Sac baguette en velours', 'Sac', 'sacs', 35, null, TU, ['soirees', 'hiver'], true, false, 'Velours, fermoir doré, porté épaule.', [['Choco', '#4a2a1d', '23.jpg'], ['Noir', '#121111', '24.jpg']]],
  ['POCH-PERLE', 'Pochette perlée de soirée', 'Pochette', 'sacs', 39, 29, TU, ['soirees'], false, false, 'Pochette ronde couverte de perles nacrées, chaîne dorée amovible.', [['Nacre', '#efe7d6', '25.jpg']]],
  ['ESCARP-STRASS', 'Escarpins bride strass', 'Escarpins', 'chaussures', 59, null, ['36', '37', '38', '39', '40'], ['soirees'], false, false, 'Satin noir, bout pointu, bride de cheville en strass, talon fin.', [['Noir', '#141414', '26.jpg']]],
  ['BOTT-DAIM', 'Bottines en daim à talon', 'Bottines', 'chaussures', 79, null, ['36', '37', '38', '39', '40', '41'], ['hiver'], false, false, 'Daim taupe, talon carré, zip sur le côté.', [['Taupe', '#8c7765', '27.jpg']]]
]

await appel('POST', '/api/admin/connexion', { email: 'gerante@ambre-strass.fr', mdp: process.env.DEMO_MDP || 'motdepasse-ambre' })
console.log('Connectée à l’administration d’Ambre & Strass.')

const SEULEMENT_VENTES = process.argv.includes('--ventes')
if (!SEULEMENT_VENTES) {
await appliquerIdentite(appel, { catalogue: false })
console.log('Identité, textes et images de la page d’accueil enregistrés.')

const idsCol = {}
for (const [k, c] of Object.entries(COLLECTIONS)) idsCol[k] = (await appel('POST', '/api/admin/collections', c)).id
console.log('3 collections créées.')

const stock = (tailles, i) => tailles.map((t, k) => (k + i) % 5 === 4 ? 0 : 2 + ((k * 3 + i) % 5))
let n = 0
for (const [i, [reference, nom, type, categorie, prix, promo, tailles, cols, nouveau, avant, description, couleurs]] of [...PRODUITS].reverse().entries()) {
  const t0 = Date.now()
  let p = await appel('POST', '/api/admin/produits/brouillon')
  const base = { reference, nom, type, description, categorie, prix_centimes: Math.round(prix * 100), prix_promo_centimes: promo ? Math.round(promo * 100) : null, tailles, nouveau, mis_en_avant: avant, collections: cols.map((c) => idsCol[c]) }
  // 1. la fiche (catégorie d'abord : elle décide « sur cintre » ou « accessoire »), masquée
  p = await appel('PUT', `/api/admin/produits/${p.id}`, { ...base, visible: false, couleurs: couleurs.map(([cn, hex], k) => ({ cle: `c${k}`, nom: cn, hex })) })
  // 2. une photo par couleur : le serveur la détoure
  for (const [k, [, , photo]] of couleurs.entries()) {
    const fd = new FormData(); fd.append('photos', await fichier(photo), photo); fd.append('couleur_id', p.couleurs[k].id); fd.append('role', 'face')
    await appel('POST', `/api/admin/produits/${p.id}/photos`, fd)
  }
  do { await attendre(400); p = await appel('GET', `/api/admin/produits/${p.id}`) } while (p.photos.some((x) => ['en_attente', 'traitement'].includes(x.statut)))
  if (p.photos.some((x) => x.statut === 'erreur')) throw new Error(`Détourage en erreur pour ${nom}`)
  // 3. stock par taille et couleur, mise en ligne
  p = await appel('PUT', `/api/admin/produits/${p.id}`, {
    ...base, visible: true,
    couleurs: p.couleurs.map((c) => ({ id: c.id, nom: c.nom, hex: c.hex })),
    photos: p.photos.map((x, k) => ({ id: x.id, couleur: x.couleur_id, role: 'face', ordre: k })),
    stocks: p.couleurs.flatMap((c, ci) => tailles.map((t, k) => ({ couleur: c.id, taille: t, stock: stock(tailles, i + ci)[k] })))
  })
  n++
  console.log(`  ${String(n).padStart(2)}. ${nom} (${couleurs.length} couleur${couleurs.length > 1 ? 's' : ''}) en ligne en ${Date.now() - t0} ms`)
}
await appliquerIdentite(appel) // collections, compositions et précommandes, une fois les produits créés
console.log('Compositions, précommandes et collections de démonstration enregistrées.')

}

// Quelques ventes réelles (paiement simulé) pour alimenter « Vos coups de cœur ».
const cat = await appel('GET', '/api/catalogue')
for (const [ref, q] of [['ROBE-SEQ', 2], ['VESTE-FOUR', 1], ['PULL-LUREX', 2]]) {
  const p = cat.produits.find((x) => x.reference === ref)
  const v = p.couleurs.flatMap((c) => c.variantes).find((x) => x.stock >= q)
  const cmd = await appel('POST', '/api/commandes', { client: { email: 'cliente@exemple.fr', nom: 'Cliente démo' }, livraison_mode: 'retrait', lignes: [{ variante_id: v.id, quantite: q }] })
  await appel('POST', `/api/paiement-test/${cmd.jeton}`, { action: 'payer' })
}
console.log('3 commandes de démonstration payées.')
console.log(`\nBoutique prête : http://${HOTE}:${PORT}/  ·  administration : http://${HOTE}:${PORT}/admin/`)
