/* Ce qui change d'une boutique à l'autre sans toucher au code :
   catégories proposées, identité visuelle (thème) et textes (contenus). */

// Catégories de la plateforme. « objet » = présenté sans cintre (accessoires).
export const CATEGORIES = [
  { slug: 'blouses-chemisiers', nom: 'Blouses et chemisiers', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'pulls-sweats', nom: 'Pulls et sweats', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'tops-tshirts', nom: 'Tops et t-shirts', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'vestes-manteaux', nom: 'Vestes et manteaux', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'pantalons-shorts', nom: 'Pantalons et shorts', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'robes-jupes', nom: 'Robes et jupes', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'combinaisons-ensembles', nom: 'Combinaisons et ensembles', groupe: 'vetements', presentation: 'cintre' },
  { slug: 'bijoux', nom: 'Bijoux', groupe: 'accessoires', presentation: 'objet' },
  { slug: 'sacs', nom: 'Sacs', groupe: 'accessoires', presentation: 'objet' },
  { slug: 'chaussures', nom: 'Chaussures', groupe: 'accessoires', presentation: 'objet' }
]
export const estCategorie = (s) => CATEGORIES.some((c) => c.slug === s)
export const surCintre = (s) => (CATEGORIES.find((c) => c.slug === s)?.presentation ?? 'cintre') === 'cintre'

export const POLICES = {
  titres: ['bodoni', 'cormorant', 'playfair', 'dm-serif', 'inter-tight', 'jost'],
  texte: ['jost', 'inter-tight', 'dm-sans']
}

const THEME_DEFAUT = {
  fond: '#f8f4ee', surface: '#fffcf7', texte: '#171412', attenue: '#6d645b', accent: '#b39770', bandeau: '#171412',
  police_titres: 'bodoni', police_texte: 'jost', titres_italiques: false
}
const CONTENUS_DEFAUT = {
  annonces: ['Nouvelle collection chaque semaine'],
  banniere: { surtitre: 'Nouvelle collection', titre: 'Bienvenue dans la boutique', texte: '', bouton: 'Découvrir la collection' },
  portant: { titre: 'Sur le portant', texte: 'Passez sur une pièce pour la faire tourner, cliquez pour la découvrir.' },
  presentation: { titre: 'La boutique', texte: '', adresse: '', horaires: [], telephone: '', email: '' },
  reseaux: { instagram: '', facebook: '', tiktok: '' },
  pied: '',
  guide_tailles: '',
  newsletter: { titre: '', texte: '' },
  bandeau_livraison: ''
}

const HEX = /^#[0-9a-fA-F]{6}$/
const txt = (v, max = 400) => String(v ?? '').trim().slice(0, max)
const url = (v) => { const s = txt(v, 300); return /^https:\/\/[^\s]+$/.test(s) ? s : '' }

export function lireTheme (b) {
  const t = { ...THEME_DEFAUT, ...(b.theme || {}) }
  // compatibilité avec les premières boutiques (couleurs: fond, texte, accent)
  if (!b.theme?.fond && b.couleurs?.fond) Object.assign(t, { fond: b.couleurs.fond, texte: b.couleurs.texte, accent: b.couleurs.accent })
  return t
}
export function lireContenus (b) {
  const c = b.contenus || {}
  return {
    ...CONTENUS_DEFAUT, ...c,
    banniere: { ...CONTENUS_DEFAUT.banniere, ...(c.banniere || {}) },
    portant: { ...CONTENUS_DEFAUT.portant, ...(c.portant || {}) },
    presentation: { ...CONTENUS_DEFAUT.presentation, ...(c.presentation || {}) },
    reseaux: { ...CONTENUS_DEFAUT.reseaux, ...(c.reseaux || {}) },
    newsletter: { ...CONTENUS_DEFAUT.newsletter, ...(c.newsletter || {}) }
  }
}

/* Valide ce que l'administration envoie : couleurs hexadécimales, polices connues, textes bornés. */
export function validerTheme (d = {}, actuel) {
  const t = { ...actuel }
  for (const k of ['fond', 'surface', 'texte', 'attenue', 'accent', 'bandeau']) if (HEX.test(d[k] || '')) t[k] = d[k]
  if (POLICES.titres.includes(d.police_titres)) t.police_titres = d.police_titres
  if (POLICES.texte.includes(d.police_texte)) t.police_texte = d.police_texte
  if (typeof d.titres_italiques === 'boolean') t.titres_italiques = d.titres_italiques
  return t
}
export function validerContenus (d = {}) {
  const b = d.banniere || {}; const po = d.portant || {}; const p = d.presentation || {}; const r = d.reseaux || {}
  return {
    annonces: (Array.isArray(d.annonces) ? d.annonces : []).map((x) => txt(x, 140)).filter(Boolean).slice(0, 6),
    banniere: { surtitre: txt(b.surtitre, 60), titre: txt(b.titre, 120), texte: txt(b.texte, 300), bouton: txt(b.bouton, 40) },
    portant: { titre: txt(po.titre, 80), texte: txt(po.texte, 200) },
    presentation: {
      titre: txt(p.titre, 120), texte: txt(p.texte, 1200), adresse: txt(p.adresse, 200),
      horaires: (Array.isArray(p.horaires) ? p.horaires : []).map((x) => txt(x, 80)).filter(Boolean).slice(0, 7),
      telephone: txt(p.telephone, 30), email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(txt(p.email, 120)) ? txt(p.email, 120) : ''
    },
    reseaux: { instagram: url(r.instagram), facebook: url(r.facebook), tiktok: url(r.tiktok) },
    pied: txt(d.pied, 400),
    // Guide des tailles : une ligne par taille, colonnes séparées par « | » (ex. « S | 36 | 84–88 »)
    guide_tailles: txt(d.guide_tailles, 2000),
    newsletter: { titre: txt(d.newsletter?.titre, 120), texte: txt(d.newsletter?.texte, 300) },
    bandeau_livraison: txt(d.bandeau_livraison, 140)
  }
}
