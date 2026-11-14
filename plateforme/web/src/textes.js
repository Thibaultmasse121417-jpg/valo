/* Textes de service (livraison, retours, FAQ) calculés à partir des vrais réglages de la boutique,
   et photographies éditoriales de la démonstration. */
import imgFetes from './img/fetes.webp'
import imgVetements from './img/vetements.webp'
import imgAccessoires from './img/accessoires.webp'
import imgChaussures from './img/chaussures.webp'
import imgLookbook from './img/lookbook.webp'
import imgEssentiels from './img/essentiels.webp'
import imgComyxHeros from './img/comyx-heros.webp'
import imgComyxBoutique from './img/comyx-boutique.webp'
import filmFourrure from './img/film-fourrure.mp4'
import filmFourrureGalerie from './img/film-fourrure-galerie.mp4'
import posFourrure from './img/film-fourrure.webp'
import posFourrureCampagne from './img/film-fourrure-campagne.webp'
import { euros } from './commun.js'

export const IMAGES = { comyxHeros: imgComyxHeros, comyxBoutique: imgComyxBoutique, fetes: imgFetes, vetements: imgVetements, accessoires: imgAccessoires, chaussures: imgChaussures, lookbook: imgLookbook, essentiels: imgEssentiels }
// Film de campagne de la démonstration : un seul article pour l'exemple (direction artistique « une pièce, une lumière, un geste »)
export const VIDEOS = {
  'VESTE-FOUR': {
    src: filmFourrure, galerie: filmFourrureGalerie, poster: posFourrure, posterCampagne: posFourrureCampagne,
    campagne: { titre: 'La veste, en mouvement', texte: 'Fausse fourrure dense, col arrondi, trois crochets en métal. Une pièce courte qui se porte sur une robe fluide comme sur un jean, de la première fraîcheur aux soirs d’hiver.' }
  }
}
export const JOURS_RETOUR = 14
export const PETITS_PRIX = 2500

export function tarifs (B) {
  const seuil = euros(B.livraison_offerte_centimes)
  return [
    B.retrait && { nom: 'Retrait en boutique', prix: 'Gratuit', detail: `${B.retrait.adresse}. Votre commande vous attend dès qu’elle est prête, nous vous prévenons par e-mail.` },
    B.relais && { nom: 'Point relais', prix: `${euros(B.relais.prix_centimes)}, offert dès ${seuil}`, detail: 'En France et en Belgique. Nous vous indiquons le point relais le plus proche de chez vous par e-mail.' },
    { nom: 'Livraison à domicile', prix: `${euros(B.livraison_centimes)}, offerte dès ${seuil}`, detail: 'En France métropolitaine, en Colissimo suivi.' }
  ].filter(Boolean)
}

export function faq (B) {
  const pr = B.contenus.presentation
  return [
    ['Quels sont les frais de livraison ?', tarifs(B).map((t) => `${t.nom} : ${t.prix.toLowerCase()}.`).join(' ')],
    ['Sous combien de temps ma commande est-elle expédiée ?', 'Les commandes sont préparées en boutique et expédiées sous 3 jours ouvrés après le paiement. Les pièces en précommande partent à la date indiquée sur leur fiche, avec le reste de la commande.'],
    ['Puis-je retourner un article ?', `Oui, vous avez ${JOURS_RETOUR} jours après réception pour changer d’avis. L’article doit être neuf, non porté, avec son étiquette. Le retour est gratuit en boutique ; par la poste, les frais restent à votre charge.`],
    ['Quand serai-je remboursée ?', 'Sous 48 heures après la réception et la vérification de votre retour, sur le moyen de paiement utilisé.'],
    ...(B.retrait ? [['Puis-je retirer ma commande en boutique ?', `Oui, gratuitement : choisissez « Retrait en boutique » au moment de commander. Nous vous prévenons par e-mail dès qu’elle est prête.${pr.horaires.length ? ` Horaires : ${pr.horaires.join(' ; ')}.` : ''}`]] : []),
    ['Comment choisir ma taille ?', 'Chaque fiche indique la composition, les mesures de la pièce et la taille portée par la mannequin. Le guide des tailles donne les équivalences. Un doute ? Écrivez-nous, on vous répond avec plaisir.']
  ]
}

/* Photographies portées : chaque pièce phare a sa photo en situation (cadrage indiqué). */
export const PORTE = {
  'BLOUSE-LAVA': { img: 'vetements', pos: '50% 22%' },
  'PANT-SATIN': { img: 'vetements', pos: '50% 80%' },
  'ROBE-SEQ': { img: 'fetes', pos: '45% 60%' },
  'VESTE-FOUR': { img: 'fetes', pos: '35% 25%' },
  'ENS-MAILLE': { img: 'essentiels', pos: '62% 50%' },
  'SAC-VELOURS': { img: 'accessoires', pos: '45% 35%' },
  'COLL-PLAST': { img: 'accessoires', pos: '22% 70%' },
  'ESCARP-STRASS': { img: 'chaussures', pos: '55% 50%' }
}

/* Repères « achetables » posés sur les photos éditoriales (position en % de l'image). */
export const REPERES = {
  fetes: [{ ref: 'VESTE-FOUR', x: 36, y: 46 }, { ref: 'ROBE-SEQ', x: 47, y: 68 }]
}

/* Tenues composées en boutique : « Complétez la tenue » sur la fiche. */
export const TENUES = {
  'ROBE-SEQ': ['VESTE-FOUR', 'ESCARP-STRASS', 'POCH-PERLE'],
  'VESTE-FOUR': ['ROBE-SEQ', 'ESCARP-STRASS', 'SAC-VELOURS'],
  'BLOUSE-LAVA': ['PANT-SATIN', 'CREOLES-OR', 'SAC-VELOURS'],
  'PANT-SATIN': ['BLOUSE-LAVA', 'ESCARP-STRASS', 'CREOLES-OR'],
  'BLAZER-BIJOU': ['SHORT-TWEED', 'TOP-VELOURS', 'ESCARP-STRASS'],
  'SHORT-TWEED': ['BLAZER-BIJOU', 'TOP-VELOURS', 'BOTT-DAIM'],
  'TOP-VELOURS': ['SHORT-TWEED', 'BLAZER-BIJOU', 'COLL-PLAST'],
  'ENS-MAILLE': ['SAC-VELOURS', 'CREOLES-OR', 'BOTT-DAIM'],
  'CHEM-DENT': ['JUPE-PLIS', 'COLL-PLAST', 'ESCARP-STRASS'],
  'JUPE-PLIS': ['CHEM-DENT', 'PULL-LUREX', 'BOTT-DAIM'],
  'MANT-LAINE': ['ROBE-PULL', 'BOTT-DAIM', 'SAC-VELOURS'],
  'ROBE-PULL': ['MANT-LAINE', 'BOTT-DAIM', 'CREOLES-OR'],
  'COMBI-FLUIDE': ['ESCARP-STRASS', 'POCH-PERLE', 'CREOLES-OR'],
  'TEE-COEUR': ['PANT-SATIN', 'VESTE-FOUR', 'CREOLES-OR'],
  'SWEAT-PERLE': ['JUPE-PLIS', 'SAC-VELOURS', 'BOTT-DAIM'],
  'PULL-LUREX': ['JUPE-PLIS', 'BOTT-DAIM', 'CREOLES-OR']
}

/* Cadre de la démonstration : maquette commerciale non officielle, adressée à la boutique de référence. */
export const PROPOSITION = {
  client: 'Comyx Prestige',
  studio: 'Estalia Studio',
  bandeau: 'Proposition de refonte non officielle pour Comyx Prestige : boutique fictive, commandes et paiements simulés.',
  court: 'Maquette non officielle pour Comyx Prestige',
  apercu: 'Aperçu privé : proposition de refonte non officielle réalisée par Estalia Studio pour Comyx Prestige. Produits d’exemple, commandes et paiements simulés.',
  apercuCourt: 'Aperçu privé, proposition non officielle'
}
