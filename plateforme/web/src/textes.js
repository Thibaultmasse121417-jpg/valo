/* Textes de service (livraison, retours, FAQ) calculés à partir des vrais réglages de la boutique,
   et photographies éditoriales de la démonstration. */
import imgFetes from './img/fetes.webp'
import imgVetements from './img/vetements.webp'
import imgAccessoires from './img/accessoires.webp'
import imgChaussures from './img/chaussures.webp'
import imgLookbook from './img/lookbook.webp'
import imgEssentiels from './img/essentiels.webp'
import { euros } from './commun.js'

export const IMAGES = { fetes: imgFetes, vetements: imgVetements, accessoires: imgAccessoires, chaussures: imgChaussures, lookbook: imgLookbook, essentiels: imgEssentiels }
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
