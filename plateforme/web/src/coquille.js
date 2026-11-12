/* Coquille commune à toutes les pages de la vitrine :
   données de la boutique, thème, barre d'information, en-tête (rayons, recherche, panier),
   menu mobile, panier latéral et commande, pied de page.
   Tout vient du serveur : identité, textes, catégories, produits, stock, mode de paiement. */
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/jost'
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/dm-sans'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/500-italic.css'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource/dm-serif-display/400-italic.css'
import './style.css'
import { $, $$, esc, euros, api, appliquerTheme } from './commun.js'
import { IMAGES, PETITS_PRIX, PORTE, REPERES, PROPOSITION } from './textes.js'

export { $, $$, esc, euros }
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

export const [B, CAT] = await Promise.all([api('/api/boutique'), api('/api/catalogue')])
export const PIECES = CAT.produits
// Photos portées, repères et tenues : contenu éditorial propre à la boutique de démonstration
export const EDITO = B.nom === 'Ambre & Strass'
export const porteDe = (p) => (EDITO && PORTE[p.reference]) || null
const survol = matchMedia('(hover: hover) and (pointer: fine)').matches
export const C = B.contenus
export const NOMS_CAT = Object.fromEntries(B.categories.map((c) => [c.slug, c.nom]))

/* ---------- Petits calculs sur les produits ---------- */
export const prix = (p) => p.prix_promo_centimes ?? p.prix_centimes
export const remise = (p) => p.prix_promo_centimes != null ? Math.round((1 - p.prix_promo_centimes / p.prix_centimes) * 100) : 0
export const epuise = (p) => p.couleurs.every((c) => c.variantes.every((v) => !v.disponible))
export const parDate = (a, b) => new Date(b.created_at) - new Date(a.created_at)
export const prixHtml = (p) => p.prix_promo_centimes != null
  ? `<span class="prix prix--promo">${euros(p.prix_promo_centimes)}</span><s class="prix-barre">${euros(p.prix_centimes)}</s>`
  : `<span class="prix">${euros(p.prix_centimes)}</span>`
export const lienProduit = (p) => `/produit/?ref=${encodeURIComponent(p.reference)}`
export const lienRayon = (id) => `/boutique/?cat=${encodeURIComponent(id)}`
export const sansAccents = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Nouveautés : les pièces marquées « nouveau » par la boutique, sinon les plus récentes.
export const NOUVEAUTES = (() => {
  const marquees = PIECES.filter((p) => p.nouveau).sort(parDate)
  return marquees.length ? marquees : [...PIECES].sort(parDate).slice(0, 8)
})()
export const PROMOS = PIECES.filter((p) => p.prix_promo_centimes != null).sort((a, b) => remise(b) - remise(a))
export const RAYONS = B.categories.map((c) => ({ ...c, pieces: PIECES.filter((p) => p.categorie === c.slug) })).filter((c) => c.pieces.length)
export const COLLECTIONS = CAT.collections.map((c) => ({ ...c, pieces: PIECES.filter((p) => p.collections.includes(c.id)) })).filter((c) => c.pieces.length)
export const FETES = COLLECTIONS.find((c) => /f[êe]te|soir|c[ée]r[ée]monie/i.test(c.nom))
export const PETITS = PIECES.filter((p) => prix(p) <= PETITS_PRIX)
export const RETOUR = COLLECTIONS.find((c) => /retour en stock|back in stock/i.test(c.nom))
// Rubriques (Hauts, Bas…) qui regroupent plusieurs rayons, comme dans le menu de la boutique d'origine
export const slugRubrique = (r) => 'r-' + sansAccents(r).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const RUBRIQUES = [...new Set(RAYONS.map((c) => c.rubrique).filter(Boolean))]
  .map((nom) => ({ nom, id: slugRubrique(nom), rayons: RAYONS.filter((c) => c.rubrique === nom) }))
export const dateFr = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

// Tailles disponibles d'une pièce (toutes couleurs confondues), dans l'ordre de la fiche.
export function taillesDe (p) {
  const dispo = new Set(p.couleurs.flatMap((c) => c.variantes.filter((v) => v.disponible).map((v) => v.taille)))
  return p.tailles.map((t) => ({ t, ok: dispo.has(t) }))
}

/* Carte produit : photo (dos au survol si elle existe), étiquettes, nom, prix, tailles. */
export function carte (p) {
  const c0 = p.couleurs[0]
  const tailles = taillesDe(p)
  const unique = tailles.length === 1 && /^(tu|taille unique|unique)$/i.test(tailles[0].t)
  const off = epuise(p)
  const porte = porteDe(p)
  return `<li class="carte">
    <a class="carte__lien" href="${lienProduit(p)}" data-ref="${esc(p.reference)}">
      <span class="carte__img carte__img--${p.presentation}">
        <img src="${esc(c0.face)}" alt="${esc(p.nom)}" width="660" height="876" loading="lazy">
        ${!survol ? '' : porte ? `<img class="carte__dos carte__porte" src="${IMAGES[porte.img]}" alt="" width="560" height="700" loading="lazy" style="object-position:${porte.pos}">` : c0.dos ? `<img class="carte__dos" src="${esc(c0.dos)}" alt="" width="660" height="876" loading="lazy">` : ''}
        <span class="etiquettes">${off ? '<span class="etiquette etiquette--off">Épuisé</span>' : `${p.expedition_prevue ? '<span class="etiquette etiquette--pre">Précommande</span>' : p.nouveau ? '<span class="etiquette">Nouveau</span>' : ''}${remise(p) ? `<span class="etiquette etiquette--promo">−${remise(p)} %</span>` : ''}`}</span>
      </span>
      <span class="carte__txt">
        <span class="carte__nom card__name">${esc(p.nom)}</span>
        <span class="carte__prix">${prixHtml(p)}</span>
        ${tailles.length && !unique ? `<span class="carte__tailles" aria-label="Tailles disponibles">${tailles.map((x) => x.ok ? `<span>${esc(x.t)}</span>` : `<s aria-label="${esc(x.t)} épuisé">${esc(x.t)}</s>`).join('')}</span>` : unique ? '<span class="carte__tailles">Taille unique</span>' : ''}
        ${p.couleurs.length > 1 ? `<span class="carte__couleurs" aria-label="${p.couleurs.length} couleurs">${p.couleurs.map((c) => `<i style="--c:${esc(c.hex)}" title="${esc(c.nom)}"></i>`).join('')}</span>` : ''}
      </span>
    </a>
    ${off ? '' : `<button type="button" class="carte__plus" data-ajout-rapide="${esc(p.reference)}" aria-label="Ajout rapide : ${esc(p.nom)}"><span>Ajout rapide</span><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.4"/></svg></button>`}
  </li>`
}

/* Repères posés sur une photo éditoriale : un point discret, la pièce au survol ou au toucher. */
export function reperes (cle) {
  return (EDITO ? REPERES[cle] || [] : []).map(({ ref, x, y }) => {
    const p = PIECES.find((q) => q.reference === ref); if (!p) return ''
    return `<span class="repere" style="--x:${x}%;--y:${y}%">
      <button type="button" class="repere__point" aria-label="Voir la pièce : ${esc(p.nom)}" aria-expanded="false"><span></span></button>
      <a class="repere__carte" href="${lienProduit(p)}" tabindex="-1"><img src="${esc(p.couleurs[0].face)}" alt="" width="66" height="88" loading="lazy"><span><b>${esc(p.nom)}</b><span class="carte__prix">${prixHtml(p)}</span></span></a>
    </span>`
  }).join('')
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('.repere__point')
  for (const r of document.querySelectorAll('.repere.is-ouvert')) if (!b || r !== b.parentElement) { r.classList.remove('is-ouvert'); r.querySelector('.repere__point').setAttribute('aria-expanded', 'false'); r.querySelector('.repere__carte').tabIndex = -1 }
  if (!b) return
  const r = b.parentElement; const o = !r.classList.contains('is-ouvert')
  r.classList.toggle('is-ouvert', o); b.setAttribute('aria-expanded', String(o)); r.querySelector('.repere__carte').tabIndex = o ? 0 : -1
})

/* Révélation douce des grandes photos éditoriales, une seule fois (désactivée si l'on réduit les animations). */
export function reveler (racine = document) {
  const els = [...racine.querySelectorAll('[data-revele]')]
  if (reduce || !('IntersectionObserver' in window)) return
  const io = new IntersectionObserver((entrees) => {
    for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('is-vu'); io.unobserve(e.target) }
  }, { rootMargin: '0px 0px -12% 0px' })
  for (const el of els) { el.classList.add('revele'); io.observe(el) }
}

/* ---------- Identité ---------- */
appliquerTheme(B.theme)
const ICONES = {
  recherche: '<svg width="19" height="19" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M13 13l5 5" stroke="currentColor" stroke-width="1.4"/></svg>',
  sac: '<svg width="19" height="19" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6.5h13l-1 11h-11z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  menu: '<svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="1.4"/></svg>',
  croix: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.4"/></svg>'
}
export { ICONES }
const logoHtml = B.logo ? `<img src="${esc(B.logo)}" alt="${esc(B.nom)}">` : esc(B.nom).replace(/ &amp; /, ' <em class="logo__et">&amp;</em> ')

// Paiement : on ne dit que ce qui est vrai.
export const PAIEMENT = {
  stripe: { pied: 'Carte bancaire, via la page de paiement Stripe', note: 'Vous réglez par carte bancaire sur la page de paiement Stripe. Vos articles sont réservés 30 minutes.', bouton: 'Payer' },
  test: { pied: 'Paiement de démonstration (aucun débit)', note: 'Boutique de démonstration : le paiement est simulé, aucune somme n’est débitée.', bouton: 'Valider la commande' },
  aucun: { pied: 'Commande en ligne bientôt disponible', note: 'La boutique n’accepte pas encore les commandes en ligne. Vous pouvez réserver par téléphone ou passer en boutique.', bouton: 'Commande en ligne bientôt disponible' }
}[B.paiement || 'aucun']
const honnete = (t) => B.paiement === 'stripe' || !/paiement|payer|carte bancaire/i.test(t)

const page = document.body.dataset.page

/* ---------- Haut de page ---------- */
const annonces = [...(C.bandeau_livraison ? [C.bandeau_livraison] : []), ...C.annonces.filter(honnete)]
if (!annonces.length) annonces.push(`Livraison offerte dès ${euros(B.livraison_offerte_centimes)}${B.retrait ? ', retrait gratuit en boutique' : ''}`)
const vet = RAYONS.filter((c) => c.groupe === 'vetements'); const acc = RAYONS.filter((c) => c.groupe === 'accessoires')
const lienSous = (c) => `<a href="${lienRayon(c.slug)}" data-filtre="${esc(c.slug)}">${esc(c.nom)}<span>${c.pieces.length}</span></a>`
const chaussures = RAYONS.find((c) => c.slug === 'chaussures')
const accSans = acc.filter((c) => c.slug !== 'chaussures')
const nb = (l) => l.reduce((s, c) => s + c.pieces.length, 0)
const visuel = (href, img, titre, sous) => `<a class="mega__visuel" href="${href}"><span class="mega__photo"><img src="${img}" alt="" loading="lazy" width="560" height="700"></span><span class="mega__legende">${esc(titre)}</span><span class="mega__sous">${esc(sous)}</span></a>`
const selections = [
  NOUVEAUTES.length && [lienRayon('nouveautes'), 'Nouveautés'],
  RETOUR && [lienRayon(RETOUR.id), 'Retour en stock'],
  FETES && [lienRayon(FETES.id), FETES.nom],
  PETITS.length && [lienRayon('petits-prix'), `Moins de ${euros(PETITS_PRIX)}`],
  PROMOS.length && [lienRayon('promotions'), 'Promotions']
].filter(Boolean)
const rubriquesVet = RUBRIQUES.filter((r) => r.rayons.some((c) => c.groupe === 'vetements'))
// Rubrique à plusieurs rayons : un titre et « Tout voir » ; rubrique à un seul rayon : un lien direct
const colRubrique = (r) => r.rayons.length > 1
  ? `<p class="mega__t">${esc(r.nom)}</p><a href="${lienRayon(r.id)}">Tout voir<span>${nb(r.rayons)}</span></a>${r.rayons.map(lienSous).join('')}`
  : r.rayons.map(lienSous).join('')
const megaVet = vet.length ? `<div class="mega" data-sous-liste="vetements" hidden><div class="mega__in">
  <div class="mega__col">${rubriquesVet[0] ? colRubrique(rubriquesVet[0]) : ''}<a class="mega__tout" href="${lienRayon('vetements')}">Tous nos vêtements<span>${nb(vet)}</span></a></div>
  <div class="mega__col"><p class="mega__t">Et aussi</p>${rubriquesVet.slice(1).map((r) => `<div class="mega__bloc${r.rayons.length > 1 ? '' : ' mega__bloc--seul'}">${colRubrique(r)}</div>`).join('')}</div>
  <div class="mega__col"><p class="mega__t">Nos sélections</p>${selections.map(([h, n]) => `<a href="${h}">${esc(n)}</a>`).join('')}</div>
  ${FETES ? visuel(lienRayon(FETES.id), IMAGES.fetes, FETES.nom, FETES.description || 'Pour les soirs de fête') : visuel(lienRayon('nouveautes'), IMAGES.vetements, 'La nouvelle collection', 'Satin, maille et velours')}
</div></div>` : ''
const megaAcc = accSans.length ? `<div class="mega" data-sous-liste="accessoires" hidden><div class="mega__in">
  <div class="mega__col"><p class="mega__t">Accessoires</p><a href="${lienRayon('accessoires')}">Tous les accessoires<span>${nb(acc)}</span></a>${accSans.map(lienSous).join('')}${chaussures ? lienSous(chaussures) : ''}</div>
  <div class="mega__col"><p class="mega__t">Nos sélections</p>${selections.map(([h, n]) => `<a href="${h}">${esc(n)}</a>`).join('')}</div>
  ${visuel(lienRayon('accessoires'), IMAGES.accessoires, 'Sacs et bijoux', 'La touche finale')}
  ${chaussures ? visuel(lienRayon('chaussures'), IMAGES.chaussures, 'Chaussures', 'Escarpins, bottines') : ''}
</div></div>` : ''
const courant = (cat) => page === 'catalogue' && new URLSearchParams(location.search).get('cat') === cat ? ' aria-current="page"' : ''

$('[data-haut]').outerHTML = `
  <a class="skip" href="#contenu">Aller au contenu</a>
  ${EDITO ? `<div class="proposition" role="note"><p><span class="proposition__long">${esc(PROPOSITION.bandeau)}</span><span class="proposition__court">${esc(PROPOSITION.court)}</span> <a href="/proposition/">Découvrir la proposition</a></p></div>` : ''}
  <div class="info" role="region" aria-label="Informations"><p data-annonce>${esc(annonces[0])}</p></div>
  <header class="haut" data-haut-barre>
    <div class="haut__in">
      <div class="haut__g">
        <button class="outil burger" type="button" data-burger aria-expanded="false" aria-controls="tiroir" aria-label="Menu">${ICONES.menu}</button>
        <nav class="nav" aria-label="Rayons">
          <a href="${lienRayon('nouveautes')}"${courant('nouveautes')}>Nouveautés</a>
          ${vet.length ? `<div class="nav__groupe"><button type="button" class="nav__btn" aria-expanded="false" data-sous="vetements">Vêtements</button>${megaVet}</div>` : ''}
          ${FETES ? `<a href="${lienRayon(FETES.id)}"${courant(FETES.id)}>${esc(FETES.nom)}</a>` : ''}
          ${accSans.length ? `<div class="nav__groupe"><button type="button" class="nav__btn" aria-expanded="false" data-sous="accessoires">Accessoires</button>${megaAcc}</div>` : ''}
          ${chaussures ? `<a href="${lienRayon('chaussures')}"${courant('chaussures')}>Chaussures</a>` : ''}
          ${RETOUR ? `<a href="${lienRayon(RETOUR.id)}"${courant(RETOUR.id)}>Retour en stock</a>` : ''}
          <a href="${lienRayon('tout')}"${courant('tout')}>Tous nos produits</a>
          ${PROMOS.length ? `<a class="nav__promo" href="${lienRayon('promotions')}"${courant('promotions')} data-lien-promos>Promotions</a>` : ''}
        </nav>
      </div>
      <a class="logo" href="/" data-logo aria-label="${esc(B.nom)}, accueil">${logoHtml}</a>
      <div class="haut__d">
        <button class="outil" type="button" data-ouvrir-recherche aria-label="Rechercher">${ICONES.recherche}<span class="haut__texte">Rechercher</span></button>
        <button class="outil" type="button" data-open-cart aria-label="Panier, 0 article">${ICONES.sac}<span class="haut__texte">Panier</span><span class="panier-n" data-bag-n data-vide>0</span></button>
      </div>
    </div>
  </header>

  <div class="tiroir" id="tiroir" data-tiroir hidden>
    <div class="tiroir__in" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="tiroir__haut"><a class="logo" href="/">${logoHtml}</a><button class="fermer" type="button" data-tiroir-fermer>Fermer ${ICONES.croix}</button></div>
      <nav class="tiroir__liens" data-tiroir-liens aria-label="Rayons">
        <a href="${lienRayon('nouveautes')}">Nouveautés</a>
        ${vet.length ? `<details open><summary>Vêtements</summary><a href="${lienRayon('vetements')}">Tous nos vêtements<span>${nb(vet)}</span></a>${rubriquesVet.map((r) => `<p class="tiroir__rubrique">${esc(r.nom)}</p>${r.rayons.map(lienSous).join('')}`).join('')}</details>` : ''}
        ${FETES ? `<a href="${lienRayon(FETES.id)}">${esc(FETES.nom)}</a>` : ''}
        ${acc.length ? `<details><summary>Accessoires</summary><a href="${lienRayon('accessoires')}">Tous les accessoires</a>${acc.map(lienSous).join('')}</details>` : ''}
        ${PETITS.length ? `<a href="${lienRayon('petits-prix')}">Moins de ${euros(PETITS_PRIX)}</a>` : ''}
        ${PROMOS.length ? `<a href="${lienRayon('promotions')}" data-filtre="promotions">Promotions</a>` : ''}
        ${RETOUR ? `<a href="${lienRayon(RETOUR.id)}">Retour en stock</a>` : ''}
        <a href="${lienRayon('tout')}">Tous nos produits</a>
        <div class="tiroir__sep"></div>
        ${EDITO ? '<a class="tiroir__petit" href="/proposition/">La proposition de refonte</a>' : ''}
        <a class="tiroir__petit" href="/la-boutique/">Notre boutique</a>
        <a class="tiroir__petit" href="/livraison/">Livraison et retours</a>
        <a class="tiroir__petit" href="/contact/">Nous contacter</a>
        <button class="tiroir__petit" type="button" data-ouvrir-recherche style="display:flex;width:100%;min-height:46px;padding:0 var(--g);align-items:center">Rechercher</button>
      </nav>
    </div>
  </div>

  <div class="recherche" data-recherche hidden role="dialog" aria-modal="true" aria-label="Recherche">
    <form class="recherche__barre" data-recherche-form role="search">
      ${ICONES.recherche}
      <label class="sr" for="q">Rechercher une pièce</label>
      <input id="q" name="q" type="search" placeholder="Une robe, un pull, une couleur…" autocomplete="off" enterkeyhint="search" data-recherche-champ>
      <button class="fermer" type="button" data-recherche-fermer>Fermer ${ICONES.croix}</button>
    </form>
    <div class="recherche__res"><div class="wrap" data-recherche-res aria-live="polite"></div></div>
  </div>`

// Annonces : défilent l'une après l'autre, sans animation si l'utilisateur la refuse.
if (annonces.length > 1 && !reduce) {
  const el = $('[data-annonce]'); let ia = 0
  setInterval(() => { ia = (ia + 1) % annonces.length; el.style.opacity = 0; setTimeout(() => { el.textContent = annonces[ia]; el.style.opacity = 1 }, 220) }, 5000)
}
// Filet sous l'en-tête dès qu'on défile
const barre = $('[data-haut-barre]')
addEventListener('scroll', () => barre.classList.toggle('is-defile', scrollY > 40), { passive: true })

// Menus déroulants (bureau) : clic, survol et clavier
for (const b of $$('[data-sous]')) {
  const liste = $(`[data-sous-liste="${b.dataset.sous}"]`); const g = b.closest('.nav__groupe')
  const basculer = (o) => { liste.hidden = !o; b.setAttribute('aria-expanded', String(o)) }
  b.addEventListener('click', () => basculer(liste.hidden))
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let t; g.addEventListener('mouseenter', () => { clearTimeout(t); basculer(true) })
    g.addEventListener('mouseleave', () => { t = setTimeout(() => basculer(false), 120) })
  }
  g.addEventListener('focusout', (e) => { if (!g.contains(e.relatedTarget)) basculer(false) })
}

/* ---------- Couches (tiroir, recherche, panier) : focus, Échap, défilement ---------- */
const piles = []
function ouvrirCouche (el, { focus, fermer }) {
  const retour = document.activeElement
  piles.push({ el, fermer, retour })
  document.documentElement.style.overflow = 'hidden'
  requestAnimationFrame(() => focus?.focus({ preventScroll: true }))
}
function fermerCouche (el) {
  const i = piles.findIndex((c) => c.el === el); if (i < 0) return
  const [c] = piles.splice(i, 1)
  if (!piles.length && !document.documentElement.classList.contains('qv-on')) document.documentElement.style.overflow = ''
  c.retour?.focus?.({ preventScroll: true })
}
export function piegerFocus (e, box) {
  const f = $$('button:not([disabled]), a[href], input:not([type=hidden]), select, summary, [tabindex]:not([tabindex="-1"])', box).filter((x) => x.offsetParent !== null || x === document.activeElement)
  if (!f.length) return
  const first = f[0]; const last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
addEventListener('keydown', (e) => {
  const c = piles[piles.length - 1]; if (!c) return
  if (e.key === 'Escape') { e.preventDefault(); c.fermer() }
  if (e.key === 'Tab') piegerFocus(e, c.el)
})

// Menu mobile
const tiroir = $('[data-tiroir]'); const burger = $('[data-burger]')
function ouvrirTiroir () {
  tiroir.hidden = false; burger.setAttribute('aria-expanded', 'true')
  requestAnimationFrame(() => tiroir.classList.add('is-on'))
  ouvrirCouche(tiroir, { focus: $('[data-tiroir-fermer]'), fermer: fermerTiroir })
}
function fermerTiroir () {
  tiroir.classList.remove('is-on'); burger.setAttribute('aria-expanded', 'false')
  setTimeout(() => { if (!tiroir.classList.contains('is-on')) tiroir.hidden = true }, reduce ? 0 : 360)
  fermerCouche(tiroir)
}
burger.addEventListener('click', ouvrirTiroir)
tiroir.addEventListener('click', (e) => { if (e.target === tiroir || e.target.closest('[data-tiroir-fermer]') || e.target.closest('a')) fermerTiroir() })

/* ---------- Recherche (dans le vrai catalogue) ---------- */
const rech = $('[data-recherche]'); const champ = $('[data-recherche-champ]'); const res = $('[data-recherche-res]')
const indexRecherche = PIECES.map((p) => ({ p, t: sansAccents([p.nom, p.type, p.reference, NOMS_CAT[p.categorie], p.description, ...p.couleurs.map((c) => c.nom)].join(' ')) }))
export function chercher (q) {
  const mots = sansAccents(q).split(/\s+/).filter((m) => m.length > 1)
  if (!mots.length) return []
  return indexRecherche.filter((x) => mots.every((m) => x.t.includes(m.replace(/s$/, '')))).map((x) => x.p)
}
function peindreRecherche () {
  const q = champ.value.trim()
  if (q.length < 2) {
    res.innerHTML = `<p class="recherche__aide">Les nouveautés du moment :</p><ul class="grille">${NOUVEAUTES.slice(0, 4).map(carte).join('')}</ul>`
    return
  }
  const l = chercher(q)
  res.innerHTML = l.length
    ? `<p class="recherche__aide">${l.length} pièce${l.length > 1 ? 's' : ''} pour « ${esc(q)} »${l.length > 8 ? ` · <a class="lien" href="/boutique/?q=${encodeURIComponent(q)}">tout voir</a>` : ''}</p><ul class="grille">${l.slice(0, 8).map(carte).join('')}</ul>`
    : `<div class="vide"><h2>Aucun résultat pour « ${esc(q)} »</h2><p>Essayez un autre mot, une couleur ou un type de vêtement.</p><a class="btn btn--ligne" href="${lienRayon('tout')}">Voir toute la boutique</a></div>`
}
let tr; champ.addEventListener('input', () => { clearTimeout(tr); tr = setTimeout(peindreRecherche, 90) })
$('[data-recherche-form]').addEventListener('submit', (e) => { e.preventDefault(); if (champ.value.trim()) location.href = `/boutique/?q=${encodeURIComponent(champ.value.trim())}` })
function ouvrirRecherche () {
  if (!tiroir.hidden) fermerTiroir()
  rech.hidden = false; rech.classList.add('is-on'); peindreRecherche()
  ouvrirCouche(rech, { focus: champ, fermer: fermerRecherche })
}
function fermerRecherche () { rech.hidden = true; fermerCouche(rech) }
document.addEventListener('click', (e) => { if (e.target.closest('[data-ouvrir-recherche]')) ouvrirRecherche() })
$('[data-recherche-fermer]').addEventListener('click', fermerRecherche)

/* ---------- Bas de page : panier, commande, message, pied ---------- */
const pr = C.presentation
const R = C.reseaux
$('[data-bas]').outerHTML = `
  <footer class="pied">
    <div class="wrap">
      <div class="pied__grille">
        <div class="pied__marque">
          <a class="logo" href="/">${logoHtml}</a>
          <p data-pied-texte>${esc(C.pied || B.slogan || '')}</p>
          ${['instagram', 'facebook', 'tiktok'].some((k) => R[k]) ? `<p class="reseaux">${[['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].filter(([k]) => R[k]).map(([k, n]) => `<a href="${esc(R[k])}" target="_blank" rel="noopener">${n}</a>`).join('')}</p>` : ''}
        </div>
        <div><h3>La boutique</h3><ul>
          <li><a href="${lienRayon('nouveautes')}">Nouveautés</a></li>
          ${vet.length ? `<li><a href="${lienRayon('vetements')}">Vêtements</a></li>` : ''}
          ${FETES ? `<li><a href="${lienRayon(FETES.id)}">${esc(FETES.nom)}</a></li>` : ''}
          ${acc.length ? `<li><a href="${lienRayon('accessoires')}">Accessoires</a></li>` : ''}
          ${PROMOS.length ? `<li><a href="${lienRayon('promotions')}">Promotions</a></li>` : ''}
          <li><a href="${lienRayon('tout')}">Tous nos produits</a></li>
        </ul></div>
        <div><h3>Aide</h3><ul data-pied-aide>
          <li><a href="/livraison/">Livraison et retrait</a></li>
          <li><a href="/retours/">Retours et échanges</a></li>
          <li><a href="/faq/">Questions fréquentes</a></li>
          <li><a href="/contact/">Nous contacter</a></li>
          <li class="pied__paiement">${esc(PAIEMENT.pied)}</li>
        </ul></div>
        <div class="pied__contact"><h3>Nous trouver</h3>
          ${[pr.adresse && `<p>${esc(pr.adresse)}</p>`, pr.horaires.length && `<p>${pr.horaires.map(esc).join('<br>')}</p>`, pr.telephone && `<p><a href="tel:${esc(pr.telephone.replace(/\s/g, ''))}">${esc(pr.telephone)}</a></p>`, pr.email && `<p><a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a></p>`].filter(Boolean).join('') || `<p>${esc(B.nom)}</p>`}
          <p><a class="pied__lien" href="/la-boutique/">Venir en boutique</a></p>
        </div>
      </div>
      <p class="pied__bas"><span>© ${new Date().getFullYear()} ${esc(B.nom)}</span><a href="/mentions-legales/">Mentions légales et conditions de vente</a><span>Site de démonstration réalisé par Estalia Studio</span></p>
    </div>
  </footer>

  <div class="feuille-voile" data-feuille-voile hidden></div>
  <div class="feuille" data-feuille role="dialog" aria-modal="true" aria-labelledby="feuille-nom" hidden></div>

  <div class="voile" data-cart-veil hidden></div>
  <aside class="cart" data-cart aria-label="Panier" aria-hidden="true" inert>
    <div class="cart__head">
      <h2 data-cart-titre>Panier<small data-cart-count></small></h2>
      <button class="fermer" type="button" data-cart-close>Fermer ${ICONES.croix}</button>
    </div>
    <div>
      <ol class="etapes" data-etapes><li data-etape="panier"><span>1</span>Panier</li><li data-etape="commande"><span>2</span>Coordonnées</li><li><span>3</span>${B.paiement === 'stripe' ? 'Paiement' : 'Confirmation'}</li></ol>
      <div class="cart__ship" data-cart-ship><p data-ship-txt></p><div class="meter"><i data-ship-bar></i></div></div>
    </div>
    <ul class="cart__list" data-cart-list role="list"></ul>
    <form class="checkout" data-checkout-form hidden novalidate>
      <fieldset class="ck-mode">
        <legend>Réception</legend>
        <label><input type="radio" name="mode" value="livraison" checked><span>Livraison à domicile <small data-prix-livraison></small></span></label>
        ${B.relais ? `<label><input type="radio" name="mode" value="relais"><span>Point relais <small>${euros(B.relais.prix_centimes)}, offert dès ${euros(B.livraison_offerte_centimes)}</small></span></label>` : ''}
        ${B.retrait ? '<label data-retrait-choix><input type="radio" name="mode" value="retrait"><span>Retrait en boutique <small>Gratuit</small></span></label>' : ''}
      </fieldset>
      ${B.retrait ? `<p class="ck-retrait" data-retrait-adresse hidden>À retirer : ${esc(B.retrait.adresse)}</p>` : ''}
      ${B.relais ? '<p class="ck-retrait" data-relais-info hidden>Indiquez votre code postal : nous vous confirmons par e-mail le point relais le plus proche avant l’expédition.</p>' : ''}
      <p class="ck-titre">Vos coordonnées</p>
      <label class="ck-f"><span>E-mail</span><input name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required></label>
      <label class="ck-f"><span>Nom et prénom</span><input name="nom" autocomplete="name" required></label>
      <label class="ck-f"><span>Téléphone <small>(facultatif)</small></span><input name="telephone" type="tel" autocomplete="tel" inputmode="tel"></label>
      <div data-adresse>
        ${B.relais ? '<label class="ck-f"><span>Pays</span><span class="select select--plein"><select name="pays"><option value="FR">France</option><option value="BE">Belgique (point relais)</option></select></span></label>' : ''}
        <label class="ck-f" data-ligne><span>Adresse</span><input name="ligne" autocomplete="street-address"></label>
        <div class="ck-row">
          <label class="ck-f"><span>Code postal</span><input name="code_postal" autocomplete="postal-code" inputmode="numeric" maxlength="5"></label>
          <label class="ck-f"><span>Ville</span><input name="ville" autocomplete="address-level2"></label>
        </div>
      </div>
      <ul class="ck-recap" data-ck-recap></ul>
      <p class="ck-err" data-ck-err aria-live="polite"></p>
    </form>
    <div class="cart__foot">
      <p class="cart__ligne"><span>Sous-total</span><span data-cart-sous-total></span></p>
      <p class="cart__ligne"><span>Livraison</span><span data-cart-livraison></span></p>
      <p class="cart__total"><span>Total</span><b data-cart-total>0 €</b></p>
      <button class="btn btn--plein" type="button" data-checkout>Commander</button>
      <button class="lien-petit" type="button" data-retour-panier hidden>Revenir au panier</button>
      <p class="cart__note${B.paiement === 'test' ? ' cart__note--test' : ''}" data-cart-note>${esc(PAIEMENT.note)}</p>
    </div>
  </aside>

  <div class="toast" data-toast role="status" aria-live="polite"></div>`

/* ---------- Panier ---------- */
const cart = $('[data-cart]'); const veil = $('[data-cart-veil]'); const form = $('[data-checkout-form]')
const CLE = `panier-${location.host}`
const store = {
  get () { try { return JSON.parse(localStorage.getItem(CLE)) || [] } catch { return [] } },
  set (v) { try { localStorage.setItem(CLE, JSON.stringify(v)) } catch { /* stockage indisponible */ } }
}
export const VAR = new Map()
for (const p of PIECES) for (const c of p.couleurs) for (const v of c.variantes) VAR.set(v.id, { p, c, v })
let items = store.get().filter((x) => VAR.get(x.v)?.v.disponible).map((x) => ({ v: x.v, q: Math.max(1, Math.min(x.q, VAR.get(x.v).v.stock)) }))
let cartOpen = false; let etape = 'panier'
export const dansPanier = (vid) => items.find((x) => x.v === vid)?.q || 0

/* Ajoute q exemplaires d'une variante ; renvoie false si le stock ne suffit pas. */
export function ajouter (vid, q = 1) {
  const { p, c, v } = VAR.get(vid); const hit = items.find((x) => x.v === vid)
  const deja = hit?.q || 0
  if (deja + q > v.stock) { toast(v.stock - deja > 0 ? `Plus que ${v.stock - deja} disponible${v.stock - deja > 1 ? 's' : ''} en ${v.taille}.` : `Vous avez déjà tout le stock en ${v.taille}.`, false); return false }
  if (hit) hit.q += q; else items.push({ v: vid, q })
  save()
  if (!reduce) $('[data-bag-n]').animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' })
  toast(`${p.nom}, ${c.nom.toLowerCase()}, ${v.taille} : ajouté au panier`)
  return true
}
const save = () => { store.set(items); peindrePanier() }
const sousTotal = () => items.reduce((s, x) => s + x.q * prix(VAR.get(x.v).p), 0)
const modeLivraison = () => form.mode.value || 'livraison'
const pays = () => form.pays?.value || 'FR'
const fraisLivraison = () => modeLivraison() === 'retrait' || sousTotal() >= B.livraison_offerte_centimes ? 0 : modeLivraison() === 'relais' ? B.relais.prix_centimes : B.livraison_centimes
function peindrePanier () {
  const n = items.reduce((s, x) => s + x.q, 0); const st = sousTotal()
  const pastille = $('[data-bag-n]'); pastille.textContent = n; pastille.toggleAttribute('data-vide', !n)
  $('[data-open-cart]').setAttribute('aria-label', `Panier, ${n} article${n > 1 ? 's' : ''}`)
  $('[data-cart-count]').textContent = n ? ` (${n})` : ''
  const reste = B.livraison_offerte_centimes - st
  $('[data-ship-txt]').innerHTML = !n ? `Livraison offerte dès ${euros(B.livraison_offerte_centimes)}.` : reste > 0 ? `Plus que <b>${euros(reste)}</b> pour la livraison offerte.` : 'La livraison vous est offerte.'
  $('[data-ship-bar]').style.width = `${Math.min(100, (st / B.livraison_offerte_centimes) * 100)}%`
  const frais = fraisLivraison(); const commande = etape === 'commande'
  $('[data-cart-sous-total]').textContent = euros(st)
  $('[data-cart-livraison]').textContent = modeLivraison() === 'retrait' ? 'Retrait gratuit' : frais ? `${euros(frais)}${modeLivraison() === 'relais' ? ' (point relais)' : ''}` : 'Offerte'
  $('[data-cart-total]').textContent = euros(st + frais)
  $('[data-checkout]').disabled = !n || !B.paiement
  if (commande) $('[data-checkout]').textContent = B.paiement === 'stripe' ? `Payer ${euros(st + frais)}` : PAIEMENT.bouton
  $('[data-ck-recap]').innerHTML = items.map((x) => { const { p, c, v } = VAR.get(x.v); return `<li><span>${x.q} × ${esc(p.nom)}, ${esc(c.nom)}, ${esc(v.taille)}</span><span>${euros(prix(p) * x.q)}</span></li>` }).join('')
  $('.cart__foot').hidden = !n
  $('[data-etapes]').hidden = !n
  $('[data-cart-list]').innerHTML = n
    ? items.map((x, k) => {
      const { p, c, v } = VAR.get(x.v)
      return `<li class="line">
        <a href="${lienProduit(p)}" tabindex="-1" aria-hidden="true"><img src="${esc(c.face)}" alt="" width="76" height="101" loading="lazy"></a>
        <div><p class="line__name"><a href="${lienProduit(p)}">${esc(p.nom)}</a></p><p class="line__meta">${esc(c.nom)}, taille ${esc(v.taille)}</p>
          <div class="qte"><button type="button" data-q="${k}" data-d="-1" aria-label="Retirer un exemplaire">−</button><span aria-live="polite">${x.q}</span><button type="button" data-q="${k}" data-d="1" aria-label="Ajouter un exemplaire" ${x.q >= v.stock ? 'disabled' : ''}>+</button></div></div>
        <div class="line__r"><p>${p.prix_promo_centimes != null ? `<s class="prix-barre">${euros(p.prix_centimes * x.q)}</s><br>` : ''}${euros(prix(p) * x.q)}</p><button type="button" class="lien-petit" data-rm="${k}">Retirer</button></div>
      </li>`
    }).join('')
    : `<li class="cart__vide"><h3>Votre panier est vide</h3><p>Les nouveautés vous attendent.</p><a class="btn btn--ligne" href="${lienRayon('nouveautes')}">Voir les nouveautés</a></li>`
  if (!n && etape === 'commande') passerA('panier')
}
$('[data-cart-list]').addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]'); const rm = e.target.closest('[data-rm]')
  if (q) { const it = items[+q.dataset.q]; it.q = Math.min(VAR.get(it.v).v.stock, it.q + +q.dataset.d); if (it.q < 1) items.splice(+q.dataset.q, 1); save() }
  if (rm) { items.splice(+rm.dataset.rm, 1); save() }
})
export function ouvrirPanier () {
  $('[data-toast]').classList.remove('is-on')
  if (cartOpen) return
  cartOpen = true; veil.hidden = false; cart.inert = false; cart.setAttribute('aria-hidden', 'false')
  requestAnimationFrame(() => { veil.classList.add('is-on'); cart.classList.add('is-on') })
  ouvrirCouche(cart, { focus: $('[data-cart-close]'), fermer: fermerPanier })
}
function fermerPanier () {
  cartOpen = false; veil.classList.remove('is-on'); cart.classList.remove('is-on')
  cart.inert = true; cart.setAttribute('aria-hidden', 'true')
  setTimeout(() => { if (!cartOpen) veil.hidden = true }, reduce ? 0 : 380)
  passerA('panier')
  fermerCouche(cart)
}
$('[data-open-cart]').addEventListener('click', ouvrirPanier)
$('[data-cart-close]').addEventListener('click', fermerPanier)
veil.addEventListener('click', fermerPanier)

/* ---------- Commande ---------- */
$('[data-prix-livraison]').textContent = `${euros(B.livraison_centimes)}, offerte dès ${euros(B.livraison_offerte_centimes)}`
form.addEventListener('change', (e) => {
  // La Belgique n'est livrée qu'en point relais
  if (e.target.name === 'pays' && pays() === 'BE') form.mode.value = 'relais'
  if (e.target.name === 'mode' && modeLivraison() === 'livraison' && form.pays) form.pays.value = 'FR'
  const m = modeLivraison()
  $('[data-adresse]').hidden = m === 'retrait'
  $('[data-ligne]').hidden = m === 'relais'
  if (B.retrait) $('[data-retrait-adresse]').hidden = m !== 'retrait'
  if (B.relais) $('[data-relais-info]').hidden = m !== 'relais'
  form.code_postal.maxLength = pays() === 'BE' ? 4 : 5
  peindrePanier()
})
form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'))
function passerA (e) {
  etape = e
  const c = e === 'commande'
  form.hidden = !c; $('[data-cart-list]').hidden = c; $('[data-cart-ship]').hidden = c
  $('[data-retour-panier]').hidden = !c
  $('[data-cart-titre]').firstChild.textContent = c ? 'Commande' : 'Panier'
  for (const li of $$('[data-etape]')) li.dataset.etape === e ? li.setAttribute('aria-current', 'step') : li.removeAttribute('aria-current')
  $('[data-checkout]').textContent = B.paiement ? 'Commander' : PAIEMENT.bouton
  $('[data-ck-err]').textContent = ''
  peindrePanier()
}
$('[data-retour-panier]').addEventListener('click', () => passerA('panier'))
$('[data-checkout]').addEventListener('click', async () => {
  if (etape === 'panier') { passerA('commande'); form.email.focus(); return }
  const f = form; const err = $('[data-ck-err]')
  const mode = modeLivraison()
  const manque = [['email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()), 'Indiquez une adresse e-mail valide.'],
    ['nom', f.nom.value.trim().length >= 2, 'Indiquez votre nom.'],
    ...(mode === 'livraison' ? [['ligne', !!f.ligne.value.trim(), 'Indiquez votre adresse.']] : []),
    ...(mode !== 'retrait' ? [['code_postal', (pays() === 'BE' ? /^\d{4}$/ : /^\d{5}$/).test(f.code_postal.value.trim()), pays() === 'BE' ? 'Le code postal belge comporte 4 chiffres.' : 'Le code postal comporte 5 chiffres.'], ['ville', !!f.ville.value.trim(), 'Indiquez la ville.']] : [])]
    .find(([, ok]) => !ok)
  if (manque) { err.textContent = manque[2]; f[manque[0]].setAttribute('aria-invalid', 'true'); f[manque[0]].focus(); return }
  const b = $('[data-checkout]'); b.disabled = true; b.textContent = 'Un instant…'; err.textContent = ''
  try {
    const r = await api('/api/commandes', {
      method: 'POST',
      body: {
        client: { email: f.email.value.trim(), nom: f.nom.value.trim(), telephone: f.telephone.value.trim(), adresse: mode !== 'retrait' ? { ligne: mode === 'livraison' ? f.ligne.value.trim() : '', code_postal: f.code_postal.value.trim(), ville: f.ville.value.trim(), pays: pays() } : null },
        livraison_mode: mode,
        lignes: items.map((x) => ({ variante_id: x.v, quantite: x.q }))
      }
    })
    store.set([])
    location.href = r.url
  } catch (e) {
    err.textContent = e.message
    b.disabled = false; peindrePanier()
  }
})
passerA('panier')

/* ---------- Message d'ajout ---------- */
const tst = $('[data-toast]'); let tt
export function toast (msg, avecPanier = true) {
  tst.innerHTML = `<span>${esc(msg)}</span>${avecPanier ? '<button type="button" data-toast-cart>Voir le panier</button>' : ''}`
  tst.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tst.classList.remove('is-on'), 3600)
}
const avantPanier = []
export const avantOuvrirPanier = (f) => avantPanier.push(f)
tst.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-toast-cart]')) return
  tst.classList.remove('is-on')
  for (const f of avantPanier) await f()
  ouvrirPanier()
})

/* ---------- Ajout rapide depuis une carte produit (taille choisie sans quitter la page) ---------- */
const feuille = $('[data-feuille]'); const feuilleVoile = $('[data-feuille-voile]')
const rapide = { p: null, c: 0 }
function peindreFeuille () {
  const p = rapide.p; const col = p.couleurs[rapide.c]
  feuille.innerHTML = `<div class="feuille__poignee" aria-hidden="true"></div>
    <div class="feuille__haut">
      <span class="feuille__img carte__img--${p.presentation}"><img src="${esc(col.face)}" alt="" width="660" height="876"></span>
      <div><p class="feuille__nom" id="feuille-nom">${esc(p.nom)}</p><p class="carte__prix">${prixHtml(p)}</p>
        ${p.expedition_prevue ? `<p class="feuille__note">Précommande : expédition à partir du ${dateFr(p.expedition_prevue)}</p>` : ''}
        <a class="lien-petit" href="${lienProduit(p)}">Voir la fiche complète</a></div>
      <button class="fermer feuille__fermer" type="button" data-feuille-fermer aria-label="Fermer">${ICONES.croix}</button>
    </div>
    ${p.couleurs.length > 1 ? `<p class="feuille__t">Couleur : ${esc(col.nom)}</p><div class="nuancier">${p.couleurs.map((c, k) => `<button type="button" class="sw${k === rapide.c ? ' is-on' : ''}" style="--c:${esc(c.hex)}" data-feuille-c="${k}" aria-pressed="${k === rapide.c}" aria-label="${esc(c.nom)}"></button>`).join('')}</div>` : ''}
    <p class="feuille__t">Choisissez votre taille</p>
    <div class="sizes">${col.variantes.map((v) => `<button type="button" class="size${v.disponible ? '' : ' is-off'}" data-feuille-v="${esc(v.id)}" ${v.disponible ? '' : `disabled aria-label="${esc(v.taille)}, épuisé"`}>${esc(v.taille)}</button>`).join('')}</div>
    <p class="feuille__aide">La pièce est ajoutée au panier dès que vous touchez une taille.</p>`
}
function ouvrirFeuille (p) {
  rapide.p = p; rapide.c = Math.max(0, p.couleurs.findIndex((c) => c.variantes.some((v) => v.disponible)))
  peindreFeuille()
  feuille.hidden = false; feuilleVoile.hidden = false
  requestAnimationFrame(() => { feuille.classList.add('is-on'); feuilleVoile.classList.add('is-on') })
  ouvrirCouche(feuille, { focus: $('.size:not([disabled])', feuille) || $('[data-feuille-fermer]', feuille), fermer: fermerFeuille })
}
function fermerFeuille () {
  feuille.classList.remove('is-on'); feuilleVoile.classList.remove('is-on')
  setTimeout(() => { if (!feuille.classList.contains('is-on')) { feuille.hidden = true; feuilleVoile.hidden = true } }, reduce ? 0 : 300)
  fermerCouche(feuille)
}
feuilleVoile.addEventListener('click', fermerFeuille)
feuille.addEventListener('click', (e) => {
  if (e.target.closest('[data-feuille-fermer]')) fermerFeuille()
  const c = e.target.closest('[data-feuille-c]'); if (c) { rapide.c = +c.dataset.feuilleC; peindreFeuille() }
  const v = e.target.closest('[data-feuille-v]'); if (v && !v.disabled && ajouter(v.dataset.feuilleV)) fermerFeuille()
})
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ajout-rapide]'); if (!b) return
  const p = PIECES.find((x) => x.reference === b.dataset.ajoutRapide); if (!p) return
  const libres = p.couleurs.flatMap((c) => c.variantes.filter((v) => v.disponible))
  if (p.couleurs.length === 1 && libres.length === 1 && p.couleurs[0].variantes.length === 1) ajouter(libres[0].id) // taille unique : directement au panier
  else ouvrirFeuille(p)
})
