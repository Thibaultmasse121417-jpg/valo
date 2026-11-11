/* Catalogue de la boutique de démonstration « Alba ».
   Pour une vraie boutique, ce fichier est remplacé par les produits du client
   (ou chargé depuis Shopify). */

// Chemins relatifs à la page /demo/ (fonctionne en local comme une fois publié dans un sous-dossier).
const img = (n) => `../media/pieces/${n}.webp`

export const PIECES = [
  {
    id: 'oxford', nom: 'Rivoli, chemise oxford', type: 'Chemise', famille: 'hauts', prix: 89,
    texte: 'Oxford de coton épais, col boutonné, pan arrondi. Elle se porte rentrée le lundi, ouverte le samedi.',
    couleurs: [{ nom: 'Blanc', hex: '#f4f3ef', face: img('chemise-oxford') }]
  },
  {
    id: 'ringer', nom: 'Oberkampf, t-shirt ringer', type: 'T-shirt', famille: 'hauts', prix: 45,
    texte: 'Jersey de 240 g, bords côtes contrastés, signature brodée sur la poitrine.',
    couleurs: [{ nom: 'Noir et crème', hex: '#151515', face: img('tee-ringer') }]
  },
  {
    id: 'pull', nom: 'Belleville, pull grosse maille', type: 'Pull', famille: 'mailles', prix: 129,
    texte: 'Laine et alpaga tricotés en grosse côte, épaules tombantes. Chaud sans être lourd.',
    couleurs: [{ nom: 'Avoine', hex: '#d8c9ae', face: img('pull-laine') }]
  },
  {
    id: 'hoodie', nom: 'Buttes, sweat à capuche', type: 'Sweat', famille: 'hauts', prix: 95,
    texte: 'Molleton gratté de 420 g, cordons plats, broderie ton sur ton.',
    couleurs: [{ nom: 'Vert forêt', hex: '#1f4a2e', face: img('hoodie-foret') }]
  },
  {
    id: 'colombe', nom: 'Colombe, gilet sans manches', type: 'Gilet', famille: 'mailles', prix: 85, nouveau: true,
    texte: 'Maille jacquard, colombe dessinée à la main sur le devant, signature brodée au dos.',
    couleurs: [
      { nom: 'Rouge tomate', hex: '#d42a1c', face: img('gilet-colombe-rouge'), dos: img('gilet-colombe-rouge-dos') },
      { nom: 'Noir', hex: '#141414', face: img('gilet-colombe-noir') }
    ]
  },
  {
    id: 'jean', nom: 'Canal, veste en jean brut', type: 'Veste', famille: 'vestes', prix: 139,
    texte: 'Denim brut de 14 oz, boutons cuivre. Il se patine avec vous.',
    couleurs: [{ nom: 'Indigo brut', hex: '#1d2738', face: img('veste-jean') }]
  },
  {
    id: 'rayee', nom: 'Martyrs, chemise rayée', type: 'Chemise', famille: 'hauts', prix: 79,
    texte: 'Popeline légère à rayures fines, coupe ample, manches bouffantes au poignet.',
    couleurs: [{ nom: 'Bleu ciel', hex: '#9fc0e6', face: img('chemise-rayee') }]
  },
  {
    id: 'cardigan', nom: 'Abbesses, cardigan mohair', type: 'Cardigan', famille: 'mailles', prix: 115,
    texte: 'Mohair brossé, col en V, boutons nacrés. Le plus doux de la collection.',
    couleurs: [{ nom: 'Rose poudré', hex: '#f0bfca', face: img('cardigan-rose') }]
  },
  {
    id: 'surchemise', nom: 'Charonne, surchemise en laine', type: 'Surchemise', famille: 'vestes', prix: 149,
    texte: 'Drap de laine, deux poches à rabat, boutons en corne. Entre la chemise et la veste.',
    couleurs: [{ nom: 'Camel', hex: '#9a6a3f', face: img('surchemise-camel') }]
  },
  {
    id: 'polo', nom: 'Bastille, polo en maille', type: 'Polo', famille: 'mailles', prix: 75,
    texte: 'Maille fine de coton, col liseré crème, trois boutons.',
    couleurs: [{ nom: 'Marine', hex: '#16213b', face: img('polo-marine') }]
  }
]

export const TAILLES = ['XS', 'S', 'M', 'L', 'XL']
export const LIVRAISON_OFFERTE = 120
export const euros = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 })
