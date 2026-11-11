/* Catalogue de la maquette Comyx Prestige : pièces, prix et tailles repris de comyx.fr
   (nouvelle collection de novembre). Les photos sur cintre ont été recréées à partir
   des photos portées de la boutique, puis détourées. */

// Chemin des images, quel que soit la page (racine ou /atelier/).
// (calcul fait à la main : Vite réécrit les new URL(…, import.meta.url) à la construction)
const RACINE = import.meta.url.replace(/[^/]*\/[^/]*$/, '')
const img = (n) => RACINE + 'media/pieces/' + n + '.webp'

export const PIECES = [
  {
    id: 'pull-strass-col', nom: 'Pull avec des strass sur le col', type: 'Pull', famille: 'hauts', prix: 35.5, nouveau: true,
    tailles: ['Taille unique'],
    texte: 'Un joli pull avec de délicats strass au niveau du col, pour une touche de brillance et de féminité.',
    couleurs: [
      { nom: 'Choco', hex: '#5a4033', face: img('pull-strass-choco') },
      { nom: 'Écru', hex: '#efe7d8', face: img('pull-strass-ecru') },
      { nom: 'Noir', hex: '#161414', face: img('pull-strass-noir') }
    ]
  },
  {
    id: 'haut-sequins', nom: 'Haut transparent à sequins', type: 'Haut', famille: 'hauts', prix: 35.5, nouveau: true,
    tailles: ['S/M', 'M/L'],
    texte: 'Haut transparent orné de sequins et de perles, original et raffiné, pour une touche glamour. Vendu sans débardeur.',
    couleurs: [
      { nom: 'Choco', hex: '#7a4b2c', face: img('haut-sequins-choco') },
      { nom: 'Noir', hex: '#141313', face: img('haut-sequins-noir') }
    ]
  },
  {
    id: 'blazer-strass', nom: 'Blazer noir à strass', type: 'Veste · précommande 17/11', famille: 'vestes', prix: 49.9, nouveau: true,
    tailles: ['S/M', 'M/L'],
    texte: 'En précommande, expédition le 17 novembre. Si votre commande contient cette pièce, tous vos articles partent ensemble le 17 novembre.',
    couleurs: [{ nom: 'Noir', hex: '#121212', face: img('blazer-noir') }]
  },
  {
    id: 'combi-short', nom: 'Combi-short choco', type: 'Combinaison', famille: 'robes', prix: 42.5, nouveau: true,
    tailles: ['S/M', 'M/L'],
    texte: 'Avec ses sequins qui accrochent la lumière, idéal pour une tenue de soirée. Décolleté cache-cœur et manches longues évasées. 95 % polyester, 5 % élasthane.',
    couleurs: [{ nom: 'Choco', hex: '#5b3a28', face: img('combi-short-choco') }]
  },
  {
    id: 'pull-sequins', nom: 'Pull à sequins', type: 'Pull', famille: 'hauts', prix: 33.5,
    tailles: ['Taille unique'],
    texte: 'Un joli pull aux sequins subtilement incrustés, élégant et lumineux.',
    couleurs: [
      { nom: 'Choco', hex: '#4e3a30', face: img('pull-sequins-choco') },
      { nom: 'Noir', hex: '#171616', face: img('pull-sequins-noir') }
    ]
  },
  {
    id: 'blouse-dentelle', nom: 'Blouse noire à manches en dentelle', type: 'Blouse', famille: 'hauts', prix: 29.9,
    tailles: ['S/M', 'M/L'],
    texte: 'Une chemise élégante et raffinée, avec ses manches en dentelle pour une touche féminine.',
    couleurs: [{ nom: 'Noir', hex: '#121111', face: img('blouse-dentelle-noire') }]
  },
  {
    id: 'pull-epaule', nom: 'Pull épaule dénudée', type: 'Pull', famille: 'hauts', prix: 23.5,
    tailles: ['S/M', 'M/L'],
    texte: 'Un pull à épaule dénudée, féminin et tendance, pour une touche d’élégance.',
    couleurs: [
      { nom: 'Noir', hex: '#161515', face: img('pull-epaule-noir') },
      { nom: 'Écru', hex: '#f0ebe1', face: img('pull-epaule-ecru') }
    ]
  },
  {
    id: 'sweat-leopard', nom: 'Sweat léopard avec de la dentelle', type: 'Sweat', famille: 'hauts', prix: 29.9,
    tailles: ['Taille unique'],
    texte: 'Un sweat original avec de délicats détails en dentelle, pour une touche de caractère.',
    couleurs: [
      { nom: 'Taupe', hex: '#9b8672', face: img('sweat-leopard-taupe') },
      { nom: 'Choco', hex: '#4a3328', face: img('sweat-leopard-choco') }
    ]
  },
  {
    id: 'pantalon-pince', nom: 'Pantalon choco à pinces', type: 'Pantalon', famille: 'bas', prix: 33.5,
    tailles: ['S', 'M', 'L', 'XL'],
    texte: 'Un pantalon à pinces couleur café, élégant et intemporel.',
    couleurs: [{ nom: 'Choco', hex: '#6e5a4c', face: img('pantalon-pince-choco') }]
  },
  {
    id: 'jupe-sequins', nom: 'Jupe à sequins', type: 'Jupe', famille: 'bas', prix: 29.9,
    tailles: ['S', 'M', 'L'],
    texte: 'Une jupe à sequins élégante et lumineuse, à l’effet scintillant et raffiné.',
    couleurs: [
      { nom: 'Noir', hex: '#1b1a1c', face: img('jupe-sequins-noire') },
      { nom: 'Choco', hex: '#5e3f2c', face: img('jupe-sequins-choco') }
    ]
  }
]

export const TAILLES = ['S/M', 'M/L']
// Seuil du paiement en 3 fois sans frais (Alma)
export const LIVRAISON_OFFERTE = 100
export const euros = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
