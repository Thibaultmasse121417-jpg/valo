/* Catalogue de démonstration, partie 2 : rayons repris de la boutique de référence
   (gilets, écharpes et foulards…) et profondeur de chaque rayon. Contenu fictif.
   Utilisé par tests/creer-ambre.js (création) et tests/ambre-identite.js (mise à jour d'un hébergement existant). */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const PHOTOS = resolve(dirname(fileURLToPath(import.meta.url)), 'donnees-ambre')
const T2 = ['S/M', 'M/L']; const T3 = ['S', 'M', 'L']; const T4 = ['S', 'M', 'L', 'XL']; const TU = ['Taille unique']
const P36 = ['36', '37', '38', '39', '40']; const P41 = ['36', '37', '38', '39', '40', '41']

// [référence, nom, type, catégorie, prix €, promo €, tailles, collections, nouveau, mis en avant, description, [[couleur, hex, photo]]]
export const PRODUITS_V2 = [
  ['GILET-BIJOU', 'Gilet court boutons bijoux', 'Gilet', 'gilets', 39, null, T2, ['essentiels'], true, true, 'Maille douce et légère, encolure ronde, boutons ornés de strass. Se porte ouvert sur un top ou fermé comme un pull.', [['Écru', '#efe8da', '28.jpg']]],
  ['GILET-TORS', 'Gilet long torsadé', 'Gilet', 'gilets', 49, 39, TU, ['hiver'], false, false, 'Grosse maille torsadée, longueur mi-cuisse, poches plaquées. Le gilet cocon de l’hiver.', [['Taupe', '#9b8a78', '29.jpg']]],
  ['GILET-LUREX', 'Cardigan col V lurex', 'Cardigan', 'gilets', 36, null, T2, ['soirees'], true, false, 'Maille fine traversée de fils dorés, col V, petits boutons dorés.', [['Noir et or', '#1d1a16', '30.jpg']]],
  ['GILET-SM', 'Gilet sans manches en maille', 'Gilet', 'gilets', 32, null, T2, ['essentiels'], false, false, 'Col V, bords côtelés. Sur une chemise blanche ou un col roulé.', [['Camel', '#b88a5c', '31.jpg']]],
  ['CHEM-SAPIN', 'Chemise satinée vert sapin', 'Chemise', 'blouses-chemisiers', 37.5, null, T2, ['soirees'], true, false, 'Satin fluide, col pointu, manches longues boutonnées. Une couleur profonde pour les fêtes.', [['Vert sapin', '#24402f', '32.jpg']]],
  ['BLOUSE-BRODEE', 'Blouse en broderie anglaise', 'Blouse', 'blouses-chemisiers', 34.5, null, T3, ['essentiels'], false, false, 'Coton brodé, encolure ronde, manches courtes bouffantes.', [['Blanc', '#f6f4ee', '33.jpg']]],
  ['CHEM-POIS', 'Chemisier à pois', 'Chemisier', 'blouses-chemisiers', 32, 25.6, T2, ['essentiels'], false, false, 'Mousseline légère à petits pois blancs, col chemise, manches longues.', [['Noir à pois', '#161616', '34.jpg']]],
  ['PULL-TORS', 'Pull torsadé col rond', 'Pull', 'pulls-sweats', 39.9, null, TU, ['hiver'], true, false, 'Grosse maille torsadée, coupe légèrement oversize.', [['Écru', '#eee6d6', '35.jpg']]],
  ['PULL-ETOILES', 'Pull étoiles en strass', 'Pull', 'pulls-sweats', 42, null, TU, ['soirees'], true, true, 'Maille douce semée de petites étoiles en strass. Brille sans en faire trop.', [['Bleu nuit', '#1f2a44', '36.jpg']]],
  ['PULL-COLV', 'Pull col V tout doux', 'Pull', 'pulls-sweats', 29.9, null, T2, ['essentiels'], false, false, 'Maille fine et douce, col V, coupe droite. Existe en deux couleurs.', [['Gris chiné', '#a9a6a1', '37.jpg'], ['Rose poudré', '#e5c9c0', '38.jpg']]],
  ['TOP-DENTELLE', 'Caraco en dentelle', 'Caraco', 'tops-tshirts', 24.5, null, T2, ['essentiels'], false, false, 'Dentelle crème, fines bretelles réglables, bas festonné. Sous un blazer ou un gilet.', [['Crème', '#f1eadb', '39.jpg']]],
  ['TEE-PAILLETTE', 'T-shirt pailleté doré', 'T-shirt', 'tops-tshirts', 22, null, T2, ['soirees'], true, false, 'Entièrement couvert de petits sequins dorés, manches courtes.', [['Doré', '#c9a65a', '40.jpg']]],
  ['BODY-CARRE', 'Body col carré', 'Body', 'tops-tshirts', 26.9, null, T3, ['essentiels'], false, false, 'Jersey stretch, col carré, manches longues. Parfait dans un jean taille haute.', [['Noir', '#141414', '41.jpg']]],
  ['TRENCH-BEIGE', 'Trench classique ceinturé', 'Trench', 'vestes-manteaux', 79, null, T4, ['essentiels'], false, true, 'Double boutonnage, pattes d’épaules, ceinture à nouer. Le classique qui traverse les saisons.', [['Beige', '#c9b08c', '42.jpg']]],
  ['VESTE-JEAN', 'Veste en jean à strass', 'Veste', 'vestes-manteaux', 54.9, 44, T3, ['essentiels'], false, false, 'Denim délavé, strass sur le col et les poches poitrine.', [['Bleu clair', '#6f8bad', '43.jpg']]],
  ['JEAN-DROIT', 'Jean droit taille haute', 'Jean', 'pantalons-shorts', 45, null, ['34', '36', '38', '40', '42'], ['essentiels'], false, false, 'Denim brut, taille haute, jambe droite.', [['Bleu brut', '#34466a', '44.jpg']]],
  ['PANT-SIMILI', 'Pantalon en simili cuir', 'Pantalon', 'pantalons-shorts', 39.9, null, T3, ['hiver', 'soirees'], true, false, 'Simili cuir souple, taille haute, coupe droite.', [['Noir', '#121212', '45.jpg']]],
  ['PANT-PINCES', 'Pantalon à pinces', 'Pantalon', 'pantalons-shorts', 42, 33.6, T4, ['essentiels'], false, false, 'Crêpe fluide, pinces devant, jambe large.', [['Crème', '#ece3d2', '46.jpg']]],
  ['ROBE-ARGENT', 'Robe courte à sequins argentée', 'Robe', 'robes-jupes', 62, null, T2, ['soirees'], true, true, 'Sequins argentés, manches longues, longueur mi-cuisse.', [['Argent', '#bfc2c6', '47.jpg']]],
  ['ROBE-VELOURS', 'Robe midi en velours', 'Robe', 'robes-jupes', 55, null, T2, ['soirees', 'hiver'], false, false, 'Velours profond, col V, manches longues, longueur midi.', [['Bordeaux', '#5e1a24', '48.jpg']]],
  ['JUPE-SIMILI', 'Jupe midi en simili cuir', 'Jupe', 'robes-jupes', 36.9, null, T3, ['hiver'], false, false, 'Simili cuir, coupe trapèze, longueur midi.', [['Chocolat', '#4a2c1f', '49.jpg']]],
  ['ENS-TAILLEUR', 'Tailleur blazer et pantalon', 'Ensemble', 'combinaisons-ensembles', 89, 71.2, T4, ['soirees'], false, false, 'Blazer droit et pantalon assorti, vendus ensemble.', [['Crème', '#ede4d3', '50.jpg']]],
  ['BAGUE-COCKTAIL', 'Bague cocktail strass', 'Bague', 'bijoux', 15, null, ['Ajustable'], ['soirees'], false, false, 'Grand cristal entouré de strass, anneau doré ajustable.', [['Doré', '#d4b25e', '51.jpg']]],
  ['JONCS-OR', 'Bracelets joncs dorés', 'Bracelets', 'bijoux', 19, null, TU, ['essentiels'], false, false, 'Lot de trois joncs fins en métal doré.', [['Doré', '#d1ab4c', '52.jpg']]],
  ['CABAS-CAMEL', 'Cabas en cuir grainé', 'Cabas', 'sacs', 69, null, TU, ['essentiels'], false, true, 'Cuir grainé, deux anses, grand format pour tous les jours.', [['Camel', '#a8743f', '53.jpg']]],
  ['SAC-CHAINE', 'Mini sac matelassé à chaîne', 'Sac', 'sacs', 42, 33.6, TU, ['soirees'], false, false, 'Matelassé, chaîne dorée, fermoir doré.', [['Noir', '#141414', '54.jpg']]],
  ['ECH-COTES', 'Écharpe en maille côtelée', 'Écharpe', 'echarpes-foulards', 24.9, null, TU, ['hiver'], true, false, 'Maille côtelée épaisse, petites franges.', [['Camel', '#b8895a', '55.jpg']]],
  ['FOUL-SOIE', 'Foulard carré imprimé', 'Foulard', 'echarpes-foulards', 19.9, null, TU, ['essentiels'], false, false, 'Twill satiné, imprimé chaînes, 70 × 70 cm. Au cou, dans les cheveux ou sur un sac.', [['Caramel et crème', '#b98b57', '56.jpg']]],
  ['ETOLE-LUREX', 'Étole lurex dorée', 'Étole', 'echarpes-foulards', 22, null, TU, ['soirees'], false, false, 'Voile lurex doré, 180 × 70 cm. Sur les épaules, au-dessus d’une robe de soirée.', [['Doré', '#c8a75e', '57.jpg']]],
  ['MOCAS-VERNIS', 'Mocassins vernis à chaîne', 'Mocassins', 'chaussures', 52, null, P36, ['essentiels'], false, false, 'Cuir verni, mors en chaîne dorée, semelle plate.', [['Noir', '#141414', '58.jpg']]],
  ['BASKETS-STRASS', 'Baskets à strass', 'Baskets', 'chaussures', 49, 39, P41, ['essentiels'], true, false, 'Cuir blanc, détails strass sur le côté.', [['Blanc', '#f3f2ee', '59.jpg']]]
]

const M = 'La mannequin mesure 1,65 m et porte'
export const FICHES_V2 = {
  'GILET-BIJOU': `55 % viscose, 30 % polyester, 15 % polyamide.\nLongueur 48 cm en S/M. ${M} du S/M.\nLavage à 30 °C, à plat.`,
  'GILET-TORS': `60 % acrylique, 40 % polyester.\nLongueur 82 cm. Taille unique, du 36 au 44.\nLavage à 30 °C, à plat.`,
  'GILET-LUREX': `70 % viscose, 25 % polyamide, 5 % fil métallisé.\nLongueur 56 cm en S/M. ${M} du S/M.\nLavage à la main.`,
  'GILET-SM': `50 % laine, 50 % acrylique.\nLongueur 58 cm en S/M. ${M} du S/M.\nLavage à 30 °C, à plat.`,
  'CHEM-SAPIN': `100 % polyester satiné.\nLongueur 70 cm en S/M. ${M} du S/M.\nLavage délicat à 30 °C.`,
  'BLOUSE-BRODEE': `100 % coton.\nLongueur 58 cm en S. ${M} du S.\nLavage à 30 °C.`,
  'CHEM-POIS': `100 % polyester mousseline.\nLongueur 66 cm en S/M. ${M} du S/M.\nLavage délicat à 30 °C.`,
  'PULL-TORS': `65 % acrylique, 35 % polyamide.\nLongueur 62 cm. Taille unique, du 36 au 42.\nLavage à 30 °C, à plat.`,
  'PULL-ETOILES': `50 % viscose, 28 % polyester, 22 % polyamide, strass collés.\nLongueur 60 cm. Taille unique, du 36 au 42.\nLavage à la main, sur l’envers.`,
  'PULL-COLV': `70 % viscose, 30 % polyamide.\nLongueur 62 cm en S/M. ${M} du S/M.\nLavage à 30 °C, à plat.`,
  'TOP-DENTELLE': `90 % polyamide, 10 % élasthane, doublure coton.\nBretelles réglables. ${M} du S/M.\nLavage à la main.`,
  'TEE-PAILLETTE': `100 % polyester, sequins cousus.\nLongueur 58 cm en S/M. ${M} du S/M.\nLavage à la main, sur l’envers.`,
  'BODY-CARRE': `95 % viscose, 5 % élasthane.\nFermeture pressions. ${M} du S.\nLavage à 30 °C.`,
  'TRENCH-BEIGE': `65 % polyester, 35 % coton.\nLongueur 100 cm en S. ${M} du S.\nNettoyage à sec.`,
  'VESTE-JEAN': `100 % coton, strass collés.\nLongueur 54 cm en S. ${M} du S.\nLavage à 30 °C sur l’envers.`,
  'JEAN-DROIT': `98 % coton, 2 % élasthane.\nEntrejambe 78 cm. ${M} du 36.\nLavage à 30 °C sur l’envers.`,
  'PANT-SIMILI': `100 % polyuréthane, envers en polyester.\nEntrejambe 76 cm. ${M} du S.\nÀ nettoyer avec un chiffon humide.`,
  'PANT-PINCES': `95 % polyester, 5 % élasthane.\nEntrejambe 78 cm. ${M} du S.\nLavage délicat à 30 °C.`,
  'ROBE-ARGENT': `100 % polyester, sequins cousus, doublure intégrale.\nLongueur 84 cm en S/M. ${M} du S/M.\nLavage à la main, sur l’envers.`,
  'ROBE-VELOURS': `95 % polyester, 5 % élasthane.\nLongueur 112 cm en S/M. ${M} du S/M.\nLavage délicat à 30 °C.`,
  'JUPE-SIMILI': `100 % polyuréthane, doublure polyester.\nLongueur 75 cm. ${M} du S.\nÀ nettoyer avec un chiffon humide.`,
  'ENS-TAILLEUR': `63 % polyester, 33 % viscose, 4 % élasthane.\nBlazer 70 cm, entrejambe 78 cm. ${M} du S.\nNettoyage à sec.`,
  'BAGUE-COCKTAIL': 'Métal doré, verre taillé et strass.\nAnneau ajustable.\nPour des raisons d’hygiène, les bijoux ne sont ni repris ni échangés.',
  'JONCS-OR': 'Acier inoxydable doré.\nDiamètre intérieur 6,5 cm.',
  'CABAS-CAMEL': 'Cuir de vachette grainé, doublure coton.\n38 × 30 × 14 cm, anses 25 cm.',
  'SAC-CHAINE': 'Simili cuir matelassé, chaîne métal doré 110 cm.\n20 × 13 × 6 cm.',
  'ECH-COTES': '50 % laine, 50 % acrylique.\n200 × 30 cm.',
  'FOUL-SOIE': '100 % polyester twill satiné.\n70 × 70 cm. Lavage à la main.',
  'ETOLE-LUREX': '80 % polyester, 20 % fil métallisé.\n180 × 70 cm.',
  'MOCAS-VERNIS': 'Dessus cuir verni, semelle synthétique.\nTalon 1,5 cm. Chaussant normal.',
  'BASKETS-STRASS': 'Dessus cuir, semelle caoutchouc.\nChaussant normal : prenez votre pointure habituelle.'
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms))
const fichier = async (nom) => new Blob([await readFile(resolve(PHOTOS, nom))], { type: 'image/jpeg' })
// Stock de démonstration : quelques tailles épuisées pour montrer l'état, jamais une pièce à taille unique
const stock = (tailles, i) => tailles.map((t, k) => tailles.length > 1 && (k + i) % 6 === 5 ? 0 : 2 + ((k * 3 + i) % 5))

/* Crée une pièce comme une commerçante : fiche masquée, une photo par couleur (détourée par le serveur),
   stock par taille, puis mise en ligne. */
export async function creerProduit (appel, def, idsCol, i) {
  const [reference, nom, type, categorie, prix, promo, tailles, cols, nouveau, avant, description, couleurs] = def
  let p = await appel('POST', '/api/admin/produits/brouillon')
  const base = { reference, nom, type, description, categorie, prix_centimes: Math.round(prix * 100), prix_promo_centimes: promo ? Math.round(promo * 100) : null, tailles, nouveau, mis_en_avant: avant, collections: cols.map((c) => idsCol[c]).filter(Boolean) }
  p = await appel('PUT', `/api/admin/produits/${p.id}`, { ...base, visible: false, couleurs: couleurs.map(([cn, hex], k) => ({ cle: `c${k}`, nom: cn, hex })) })
  for (const [k, [, , photo]] of couleurs.entries()) {
    const fd = new FormData(); fd.append('photos', await fichier(photo), photo); fd.append('couleur_id', p.couleurs[k].id); fd.append('role', 'face')
    await appel('POST', `/api/admin/produits/${p.id}/photos`, fd)
  }
  do { await attendre(400); p = await appel('GET', `/api/admin/produits/${p.id}`) } while (p.photos.some((x) => ['en_attente', 'traitement'].includes(x.statut)))
  if (p.photos.some((x) => x.statut === 'erreur')) throw new Error(`Détourage en erreur pour ${nom}`)
  return appel('PUT', `/api/admin/produits/${p.id}`, {
    ...base, visible: true,
    couleurs: p.couleurs.map((c) => ({ id: c.id, nom: c.nom, hex: c.hex })),
    photos: p.photos.map((x, k) => ({ id: x.id, couleur: x.couleur_id, role: 'face', ordre: k })),
    stocks: p.couleurs.flatMap((c, ci) => tailles.map((t, k) => ({ couleur: c.id, taille: t, stock: stock(tailles, i + ci)[k] })))
  })
}

/* Ajoute les pièces de la partie 2 qui manquent (idempotent). */
export async function completerCatalogue (appel, log = console.log) {
  const json = (t) => typeof t === 'string' ? JSON.parse(t) : t
  const { produits } = json(await appel('GET', '/api/admin/produits'))
  const { collections } = json(await appel('GET', '/api/admin/collections'))
  const idsCol = {
    soirees: collections.find((c) => /f[êe]te|soir/i.test(c.nom))?.id,
    hiver: collections.find((c) => /hiver/i.test(c.nom))?.id,
    essentiels: collections.find((c) => /essentiel/i.test(c.nom))?.id
  }
  const manquants = PRODUITS_V2.filter((d) => !produits.some((p) => p.reference === d[0]))
  for (const [i, d] of manquants.entries()) {
    const t0 = Date.now()
    const p = json(await creerProduit(appel, d, idsCol, i + 3))
    if (FICHES_V2[d[0]]) await appel('PATCH', `/api/admin/produits/${p.id || (json(await appel('GET', '/api/admin/produits')).produits.find((x) => x.reference === d[0])).id}`, { composition: FICHES_V2[d[0]] })
    log(`  + ${d[1]} en ligne en ${Date.now() - t0} ms`)
  }
  return manquants.length
}
