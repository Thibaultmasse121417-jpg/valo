/* Identité « v2 » d'Ambre & Strass, appliquée par l'API d'administration comme le ferait la gérante :
   thème ivoire / noir / champagne, polices Bodoni + Jost, textes de la page d'accueil,
   guide des tailles, photo éditoriale et photo de la boutique.

   node tests/ambre-identite.js          (serveur lancé, boutique « ambre » existante)
   Utilisé aussi par tests/creer-ambre.js et, sur un hébergement de démonstration, par serveur/demo.js. */
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ICI = dirname(fileURLToPath(import.meta.url))
const PHOTOS = resolve(ICI, 'donnees-ambre')

export const IDENTITE = {
  nom: 'Ambre & Strass', slogan: 'Concept store mode femme à Amiens',
  theme: { fond: '#f8f4ee', surface: '#fffcf7', texte: '#171412', attenue: '#6d645b', accent: '#b39770', bandeau: '#171412', police_titres: 'bodoni', police_texte: 'jost', titres_italiques: false },
  contenus: {
    annonces: ['Ouvert du mardi au samedi, 10 h – 19 h, à Amiens', 'Livraison offerte dès 60 €', 'Retrait gratuit en boutique'],
    banniere: { surtitre: 'Collection fêtes', titre: 'Briller, sans en faire trop.', texte: 'Sequins, velours, strass et mailles douces : la nouvelle collection est arrivée en boutique et en ligne.', bouton: 'Découvrir la collection' },
    portant: { titre: 'Arrivée cette semaine', texte: '' },
    presentation: {
      titre: 'Une boutique pour celles qui aiment les détails.',
      texte: 'Ambre & Strass, c’est un concept store en plein centre d’Amiens. Chaque semaine, de nouvelles pièces arrivent sur nos portants : une blouse satinée, une maille dorée, un blazer à boutons bijoux.\nDes collections courtes, renouvelées souvent, à des prix doux. Et une boutique où l’on prend le temps d’essayer.',
      adresse: 'Centre-ville, Amiens', horaires: ['Du mardi au samedi : 10 h – 19 h', 'Dimanche et lundi : fermé'], telephone: '', email: ''
    },
    reseaux: { instagram: '', facebook: '', tiktok: '' },
    pied: 'Concept store mode femme à Amiens. Nouvelles pièces chaque semaine, en boutique et en ligne.',
    newsletter: { titre: 'Les nouveautés, en premier', texte: 'Un e-mail quand les nouvelles pièces arrivent, et les dates des précommandes avant tout le monde.' },
    guide_tailles: [
      'Taille | Équivalence | Poitrine | Taille | Hanches',
      'XS | 34 | 80–84 cm | 62–66 cm | 88–92 cm',
      'S | 36 | 84–88 cm | 66–70 cm | 92–96 cm',
      'M | 38 | 88–92 cm | 70–74 cm | 96–100 cm',
      'L | 40 | 92–96 cm | 74–78 cm | 100–104 cm',
      'XL | 42 | 96–100 cm | 78–82 cm | 104–108 cm',
      'S/M | 36–38 | Coupe ample, convient du 36 au 38',
      'M/L | 38–40 | Coupe ample, convient du 38 au 40',
      'Mesures du corps, en centimètres. Entre deux tailles, prenez la plus grande pour un tombé plus ample.'
    ].join('\n'),
    bandeau_livraison: ''
  },
  livraison_centimes: 800, livraison_offerte_centimes: 6000, relais_centimes: 500,
  retrait_adresse: 'Boutique Ambre & Strass, centre-ville d’Amiens, du mardi au samedi de 10 h à 19 h', paiement_mode: 'test'
}

// Fiches produits : composition, mesures et taille portée (contenu de démonstration)
const M = 'La mannequin mesure 1,65 m et porte'
const FICHES = {
  'BLOUSE-LAVA': `100 % polyester satiné.\nLongueur 66 cm en S/M. ${M} du S/M.\nLavage délicat à 30 °C, repassage doux.`,
  'CHEM-DENT': `90 % polyamide, 10 % élasthane.\nLongueur 64 cm en S/M. ${M} du S/M.\nLavage à la main.`,
  'PULL-LUREX': `70 % acrylique, 25 % polyester, 5 % fil métallisé.\nCoupe ample, longueur 60 cm. Taille unique, du 36 au 42.\nLavage à 30 °C, à plat.`,
  'SWEAT-PERLE': `60 % coton, 40 % polyester.\nCoupe oversize, longueur 62 cm. Taille unique, du 36 au 42.\nLavage à 30 °C sur l’envers.`,
  'TOP-VELOURS': `95 % polyester, 5 % élasthane.\nBretelles réglables. ${M} du S/M.\nLavage à la main.`,
  'TEE-COEUR': `100 % coton épais.\nLongueur 63 cm en S/M. ${M} du S/M.\nLavage à 30 °C sur l’envers, sans repassage sur les strass.`,
  'VESTE-FOUR': `100 % polyester, doublure satinée.\nLongueur 52 cm en S/M. ${M} du S/M.\nNettoyage à sec.`,
  'MANT-LAINE': `50 % laine, 50 % polyester.\nLongueur 100 cm en S. ${M} du S.\nNettoyage à sec.`,
  'BLAZER-BIJOU': `100 % polyester, doublure satinée.\nCoupe droite, longueur 72 cm en S. ${M} du S.\nNettoyage à sec.`,
  'PANT-SATIN': `100 % polyester satiné.\nTaille élastiquée, longueur 104 cm. ${M} du S.\nLavage délicat à 30 °C.`,
  'SHORT-TWEED': `80 % polyester, 15 % viscose, 5 % fil métallisé.\nTaille haute, longueur 34 cm en S. ${M} du S.\nNettoyage à sec.`,
  'ROBE-SEQ': `100 % polyester, sequins cousus main, doublure intégrale.\nLongueur 140 cm en S/M. ${M} du S/M.\nLavage à la main, à l’envers.`,
  'ROBE-PULL': `55 % viscose, 45 % polyamide.\nLongueur 115 cm. ${M} du S/M.\nLavage à 30 °C, à plat.`,
  'JUPE-PLIS': `100 % polyester satiné.\nTaille élastique, longueur 82 cm. Taille unique, du 36 au 42.\nLavage délicat à 30 °C.`,
  'COMBI-FLUIDE': `100 % polyester crêpe.\nLongueur entrejambe 76 cm. ${M} du S/M.\nLavage délicat à 30 °C.`,
  'ENS-MAILLE': `50 % viscose, 28 % polyester, 22 % polyamide.\nGilet 46 cm, jupe 80 cm. ${M} du S/M.\nLavage à 30 °C, à plat.`,
  'COLL-PLAST': 'Métal doré, strass en verre.\nLongueur réglable de 38 à 45 cm.\nÀ conserver à l’abri de l’humidité.',
  'CREOLES-OR': 'Acier inoxydable doré à l’or fin.\nDiamètre 5 cm.\nPour des raisons d’hygiène, les boucles d’oreilles ne sont ni reprises ni échangées.',
  'SAC-VELOURS': 'Velours de polyester, doublure coton, fermoir métal doré.\n26 × 14 × 7 cm, anse 60 cm.',
  'POCH-PERLE': 'Perles d’imitation nacrées, chaîne amovible 110 cm.\nDiamètre 17 cm.',
  'ESCARP-STRASS': 'Dessus satin, semelle synthétique, bride strass.\nTalon 9 cm. Chaussant normal : prenez votre pointure habituelle.',
  'BOTT-DAIM': 'Dessus suédine, semelle caoutchouc.\nTalon carré 6 cm, zip intérieur. Chaussant normal.'
}
const PRECOMMANDES = ['BLAZER-BIJOU', 'SHORT-TWEED']
const RETOUR_EN_STOCK = ['ROBE-PULL', 'TEE-COEUR', 'JUPE-PLIS', 'SAC-VELOURS']

import { completerCatalogue } from './ambre-catalogue.js'

export async function appliquerIdentite (appel, { catalogue = true } = {}) {
  await appel('PUT', '/api/admin/boutique', IDENTITE)
  for (const [route, f] of [['banniere', 'banniere-v2.jpg'], ['presentation', 'boutique-v2.jpg']]) {
    const fd = new FormData(); fd.append('image', new Blob([await readFile(resolve(PHOTOS, f))], { type: 'image/jpeg' }), f)
    await appel('POST', `/api/admin/boutique/${route}`, fd)
  }
  // Collections : « Tenues de fêtes » et « De retour en stock », comme sur une vraie boutique
  const json = (t) => typeof t === 'string' ? JSON.parse(t) : t
  const { collections } = json(await appel('GET', '/api/admin/collections'))
  const soirees = collections.find((c) => /soir|f[êe]te/i.test(c.nom))
  if (soirees) await appel('PUT', `/api/admin/collections/${soirees.id}`, { nom: 'Tenues de fêtes', description: 'Sequins, velours et strass : de quoi briller du réveillon au nouvel an.', ordre: 0 })
  let retour = collections.find((c) => /retour en stock/i.test(c.nom))
  if (!retour) retour = json(await appel('POST', '/api/admin/collections', { nom: 'De retour en stock', description: 'Vous les avez adorées : elles sont revenues en boutique.' }))
  // Catalogue complet : rayons et pièces ajoutés à la démonstration
  if (catalogue) await completerCatalogue(appel)
  // Fiches : composition, mesures, précommandes
  const { produits } = json(await appel('GET', '/api/admin/produits'))
  const dans15j = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10)
  for (const p of produits) {
    const d = {}
    if (FICHES[p.reference]) d.composition = FICHES[p.reference]
    if (PRECOMMANDES.includes(p.reference)) d.expedition_prevue = dans15j
    if (RETOUR_EN_STOCK.includes(p.reference)) d.ajouter_collection = retour.id
    if (Object.keys(d).length) await appel('PATCH', `/api/admin/produits/${p.id}`, d)
  }
}

// Lancement direct
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.PORT || 8787); const HOTE = process.env.HOTE || 'ambre.localhost'
  let cookie = ''
  const appel = (methode, chemin, corps) => new Promise((ok, ko) => {
    const h = { host: HOTE, 'x-portant': '1', ...(cookie ? { cookie } : {}) }
    const envoyer = async () => {
      let donnees = null
      if (corps instanceof FormData) { const r = new Request('http://x', { method: 'POST', body: corps }); h['content-type'] = r.headers.get('content-type'); donnees = Buffer.from(await r.arrayBuffer()) } else if (corps) { h['content-type'] = 'application/json'; donnees = Buffer.from(JSON.stringify(corps)) }
      const req = http.request({ host: 'localhost', port: PORT, path: chemin, method: methode, headers: h }, (res) => {
        const m = []; res.on('data', (x) => m.push(x)); res.on('end', () => {
          const sc = res.headers['set-cookie']?.[0]; if (sc?.startsWith('portant_session=')) cookie = sc.split(';')[0]
          const t = Buffer.concat(m).toString()
          res.statusCode < 300 ? ok(res.headers['content-type']?.includes('json') ? JSON.parse(t) : t) : ko(new Error(`${methode} ${chemin} → ${res.statusCode} ${t}`))
        })
      })
      req.on('error', ko); if (donnees) req.write(donnees); req.end()
    }
    envoyer().catch(ko)
  })
  await appel('POST', '/api/admin/connexion', { email: 'gerante@ambre-strass.fr', mdp: process.env.DEMO_MDP || 'motdepasse-ambre' })
  await appliquerIdentite(appel)
  console.log('Identité de démonstration d’Ambre & Strass appliquée.')
}
