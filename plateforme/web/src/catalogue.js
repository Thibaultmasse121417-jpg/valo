/* Catalogue : rayons, collections, nouveautés, promotions, recherche ; filtre par taille ; tri.
   L'état est dans l'adresse (?cat=…&taille=…&tri=…&q=…) : on peut partager ou revenir en arrière. */
import { $, $$, esc, euros, B, PIECES, RAYONS, COLLECTIONS, NOUVEAUTES, PROMOS, PETITS, FETES, RUBRIQUES, EDITO, prix, epuise, parDate, carte, chercher } from './coquille.js'
import { PETITS_PRIX, IMAGES } from './textes.js'

const ORDRE_TAILLES = ['TU', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '34', '35', '36', '37', '38', '39', '40', '41', '42', '44', '46', '48']
const rang = (t) => { const i = ORDRE_TAILLES.indexOf(String(t).toUpperCase()); return i < 0 ? 999 : i }

const FILTRES = [
  { id: 'tout', nom: 'Tout', titre: 'Tous nos produits', sous: 'Toutes les pièces de la boutique, des dernières arrivées aux essentiels.', l: () => PIECES },
  ...(NOUVEAUTES.length ? [{ id: 'nouveautes', nom: 'Nouveautés', titre: 'Nouveautés', sous: 'Les dernières pièces arrivées en boutique, mises en ligne chaque semaine.', l: () => NOUVEAUTES }] : []),
  ...(RAYONS.some((c) => c.groupe === 'vetements') ? [{ id: 'vetements', nom: 'Vêtements', titre: 'Vêtements', sous: 'Blouses, gilets, pulls, vestes, pantalons et robes : la sélection de la semaine.', l: () => PIECES.filter((p) => RAYONS.find((c) => c.slug === p.categorie)?.groupe === 'vetements'), cache: true }] : []),
  ...(RAYONS.some((c) => c.groupe === 'accessoires') ? [{ id: 'accessoires', nom: 'Accessoires', titre: 'Accessoires', sous: 'Sacs, bijoux, écharpes et foulards : la touche qui change une tenue.', l: () => PIECES.filter((p) => RAYONS.find((c) => c.slug === p.categorie)?.groupe === 'accessoires'), cache: true }] : []),
  ...RUBRIQUES.filter((r) => r.rayons.length > 1).map((r) => ({ id: r.id, nom: r.nom, titre: r.nom, l: () => r.rayons.flatMap((c) => c.pieces), cache: true })),
  ...RAYONS.map((c) => ({ id: c.slug, nom: c.nom, titre: c.nom, sous: c.slug === 'chaussures' ? 'Escarpins, bottines, mocassins et baskets pour finir la tenue.' : '', l: () => c.pieces })),
  ...(PETITS.length ? [{ id: 'petits-prix', nom: `Moins de ${euros(PETITS_PRIX)}`, titre: `Moins de ${euros(PETITS_PRIX)}`, sous: 'Les petits prix de la boutique, pour se faire plaisir sans trop compter.', l: () => PETITS }] : []),
  ...(PROMOS.length ? [{ id: 'promotions', nom: 'Promotions', titre: 'Promotions', l: () => PROMOS }] : []),
  ...COLLECTIONS.map((c) => ({ id: c.id, nom: c.nom, titre: c.nom, sous: c.description, l: () => c.pieces }))
]

const q0 = new URLSearchParams(location.search)
const etat = {
  cat: FILTRES.some((f) => f.id === q0.get('cat')) ? q0.get('cat') : 'tout',
  taille: q0.get('taille') || '',
  tri: ['nouveautes', 'populaires', 'prix-asc', 'prix-desc'].includes(q0.get('tri')) ? q0.get('tri') : 'nouveautes',
  q: (q0.get('q') || '').slice(0, 80),
  dispo: q0.get('dispo') === '1'
}

// Les puces : les rayons principaux, pas les regroupements (Vêtements / Accessoires restent dans le menu).
$('[data-chips]').innerHTML = FILTRES.filter((f) => !f.cache || f.id === etat.cat)
  .map((f) => `<button type="button" class="chip" data-f="${esc(f.id)}" aria-pressed="false">${esc(f.nom)}</button>`).join('')
const tailles = [...new Set(PIECES.flatMap((p) => p.couleurs.flatMap((c) => c.variantes.filter((v) => v.disponible).map((v) => v.taille))))].sort((a, b) => rang(a) - rang(b) || String(a).localeCompare(b))
$('[data-taille]').innerHTML = `<option value="">Toutes les tailles</option>${tailles.map((t) => `<option value="${esc(t)}">Taille ${esc(t)}</option>`).join('')}`
if (!tailles.includes(etat.taille)) etat.taille = ''
$('[data-taille]').value = etat.taille
$('[data-tri]').value = etat.tri

function peindre () {
  const f = FILTRES.find((x) => x.id === etat.cat)
  let l = etat.q ? chercher(etat.q) : f.l()
  if (etat.q && etat.cat !== 'tout') { const base = new Set(f.l()); l = l.filter((p) => base.has(p)) }
  if (etat.dispo) l = l.filter((p) => !epuise(p))
  if (etat.taille) l = l.filter((p) => p.couleurs.some((c) => c.variantes.some((v) => v.disponible && v.taille === etat.taille)))
  const tri = etat.tri
  l = [...l].sort(tri === 'prix-asc' ? (a, b) => prix(a) - prix(b)
    : tri === 'prix-desc' ? (a, b) => prix(b) - prix(a)
      : tri === 'populaires' ? (a, b) => (b.ventes - a.ventes) || (b.mis_en_avant - a.mis_en_avant) || parDate(a, b)
        : (a, b) => (b.nouveau - a.nouveau) || parDate(a, b))

  const titre = etat.q ? `« ${etat.q} »` : f.titre
  $('[data-cat-titre]').textContent = titre
  $('[data-fil]').textContent = etat.q ? 'Recherche' : f.titre
  document.title = `${etat.q ? `Recherche ${titre}` : f.titre}, ${B.nom}`
  $('[data-cat-sous]').textContent = !etat.q && f.sous ? f.sous : ''
  $('[data-cat-sous]').hidden = etat.q || !f.sous
  // Photo d'en-tête des grands rayons (photographies éditoriales de la démonstration)
  const VISUELS = { tout: 'lookbook', nouveautes: 'lookbook', vetements: 'vetements', 'r-hauts': 'vetements', accessoires: 'accessoires', chaussures: 'chaussures', 'petits-prix': 'essentiels', ...(FETES ? { [FETES.id]: 'fetes' } : {}) }
  const vis = EDITO && !etat.q && VISUELS[etat.cat]
  $('[data-cat-visuel]').hidden = !vis
  $('.cat-tete').classList.toggle('cat-tete--visuel', !!vis)
  if (vis) $('[data-cat-visuel]').innerHTML = `<img src="${IMAGES[vis]}" alt="" width="1400" height="1000">`
  $('[data-grid]').innerHTML = l.map(carte).join('')
  $('[data-cat-compte]').textContent = `${l.length} pièce${l.length > 1 ? 's' : ''}${etat.taille ? ` disponible${l.length > 1 ? 's' : ''} en ${etat.taille}` : ''}`
  const vide = !l.length
  $('[data-grille-vide]').hidden = !vide
  $('[data-grid]').hidden = vide
  if (vide) {
    $('[data-vide-titre]').textContent = etat.q ? 'Aucun résultat' : 'Aucune pièce ne correspond'
    $('[data-vide-texte]').textContent = etat.q ? 'Essayez un autre mot, une couleur ou un type de vêtement.'
        : etat.taille ? `Aucune pièce de ce rayon n’est disponible en ${etat.taille}. Essayez une autre taille ou tout le rayon.` : 'Essayez un autre rayon ou retirez un filtre.'
  }
  const filtre = etat.cat !== 'tout' || etat.taille || etat.q || etat.dispo
  for (const b of $$('[data-reinit]')) b.hidden = !filtre || !PIECES.length
  for (const c of $$('[data-f]')) { const on = c.dataset.f === etat.cat && !etat.q; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)) }
  const u = new URLSearchParams()
  if (etat.cat !== 'tout') u.set('cat', etat.cat)
  if (etat.taille) u.set('taille', etat.taille)
  if (etat.tri !== 'nouveautes') u.set('tri', etat.tri)
  if (etat.q) u.set('q', etat.q)
  if (etat.dispo) u.set('dispo', '1')
  history.replaceState(null, '', u.size ? `?${u}` : location.pathname)
}

$('[data-chips]').addEventListener('click', (e) => {
  const c = e.target.closest('[data-f]'); if (!c) return
  etat.cat = c.dataset.f; etat.q = ''; peindre()
  c.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
})
$('[data-taille]').addEventListener('change', (e) => { etat.taille = e.target.value; peindre() })
$('[data-dispo]').checked = etat.dispo
$('[data-dispo]').addEventListener('change', (e) => { etat.dispo = e.target.checked; peindre() })
$('[data-tri]').addEventListener('change', (e) => { etat.tri = e.target.value; peindre() })
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-reinit]')) { Object.assign(etat, { cat: 'tout', taille: '', q: '', dispo: false }); $('[data-taille]').value = ''; $('[data-dispo]').checked = false; peindre() }
})
peindre()
$(`[data-f="${CSS.escape(etat.cat)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' })
scrollTo(0, 0)
