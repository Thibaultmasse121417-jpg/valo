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
  nom: 'Ambre & Strass', slogan: 'Concept store mode femme',
  theme: { fond: '#f8f4ee', surface: '#fffcf7', texte: '#171412', attenue: '#6d645b', accent: '#b39770', bandeau: '#171412', police_titres: 'bodoni', police_texte: 'jost', titres_italiques: false },
  contenus: {
    annonces: ['Livraison offerte dès 80 €', 'Retrait gratuit en boutique, rue de la Clef à Lille', 'Nouvelles pièces chaque semaine'],
    banniere: { surtitre: 'Collection fêtes', titre: 'Briller, sans en faire trop.', texte: 'Satin, velours, sequins et mailles douces : une collection courte, pensée pour les soirs de décembre.', bouton: 'Découvrir la collection' },
    portant: { titre: 'La collection sur le portant', texte: 'Passez sur un vêtement pour le faire tourner, cliquez pour le découvrir.' },
    presentation: {
      titre: 'Une boutique pour celles qui aiment les détails.',
      texte: 'Ambre & Strass sélectionne chaque semaine des pièces qui brillent juste ce qu’il faut : un col en strass, une maille dorée, un velours profond.\nDes collections courtes, renouvelées souvent, à des prix doux. Et une boutique où l’on prend le temps d’essayer.',
      adresse: 'Rue de la Clef, Lille', horaires: ['Mardi au samedi : 10 h – 19 h', 'Dimanche et lundi : fermé'], telephone: '', email: ''
    },
    reseaux: { instagram: '', facebook: '', tiktok: '' },
    pied: 'Concept store mode femme à Lille. Nouvelles pièces chaque semaine, en boutique et en ligne.',
    newsletter: { titre: 'Les nouvelles pièces, en premier', texte: 'Un e-mail quand la collection change sur le portant.' },
    guide_tailles: [
      'Taille | Équivalence | Poitrine | Taille | Hanches',
      'XS | 34 | 80–84 cm | 62–66 cm | 88–92 cm',
      'S | 36 | 84–88 cm | 66–70 cm | 92–96 cm',
      'M | 38 | 88–92 cm | 70–74 cm | 96–100 cm',
      'L | 40 | 92–96 cm | 74–78 cm | 100–104 cm',
      'XL | 42 | 96–100 cm | 78–82 cm | 104–108 cm',
      'Mesures du corps, en centimètres. Entre deux tailles, prenez la plus grande pour un tombé plus ample.'
    ].join('\n'),
    bandeau_livraison: ''
  },
  livraison_centimes: 590, livraison_offerte_centimes: 8000, retrait_adresse: 'Rue de la Clef, Lille, du mardi au samedi de 10 h à 19 h', paiement_mode: 'test'
}

export async function appliquerIdentite (appel) {
  await appel('PUT', '/api/admin/boutique', IDENTITE)
  for (const [route, f] of [['banniere', 'banniere-v2.jpg'], ['presentation', 'boutique-v2.jpg']]) {
    const fd = new FormData(); fd.append('image', new Blob([await readFile(resolve(PHOTOS, f))], { type: 'image/jpeg' }), f)
    await appel('POST', `/api/admin/boutique/${route}`, fd)
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
          res.statusCode < 300 ? ok(t) : ko(new Error(`${methode} ${chemin} → ${res.statusCode} ${t}`))
        })
      })
      req.on('error', ko); if (donnees) req.write(donnees); req.end()
    }
    envoyer().catch(ko)
  })
  await appel('POST', '/api/admin/connexion', { email: 'gerante@ambre-strass.fr', mdp: process.env.DEMO_MDP || 'motdepasse-ambre' })
  await appliquerIdentite(appel)
  console.log('Identité v2 d’Ambre & Strass appliquée.')
}
