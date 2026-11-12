/* Boutique publique : page d'accueil, portant, catalogue, fiche, panier et commande.
   Tout vient du serveur : identité et textes de la boutique, catégories, produits, stock. */
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/dm-sans'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/500-italic.css'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource/dm-serif-display/400-italic.css'
import './boutique.css'
import './commun.css'
import './vitrine.css'
import { $, $$, esc, euros, api, appliquerTheme } from './commun.js'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const touch = matchMedia('(hover: none), (pointer: coarse)')
const narrow = matchMedia('(max-width: 720px)')
const MAX_PORTANT = 12

const [B, CAT] = await Promise.all([api('/api/boutique'), api('/api/catalogue')])
const PIECES = CAT.produits
const C = B.contenus
const NOMS_CAT = Object.fromEntries(B.categories.map((c) => [c.slug, c.nom]))
const prix = (p) => p.prix_promo_centimes ?? p.prix_centimes
const remise = (p) => p.prix_promo_centimes != null ? Math.round((1 - p.prix_promo_centimes / p.prix_centimes) * 100) : 0
const epuise = (p) => p.couleurs.every((c) => c.variantes.every((v) => !v.disponible))
const prixHtml = (p) => p.prix_promo_centimes != null
  ? `<span class="prix prix--promo">${euros(p.prix_promo_centimes)}</span> <s class="prix-barre">${euros(p.prix_centimes)}</s>`
  : `<span class="prix">${euros(p.prix_centimes)}</span>`

/* ---------- Identité ---------- */
document.title = B.slogan ? `${B.nom} · ${B.slogan}` : B.nom
appliquerTheme(B.theme)
const logoHtml = B.logo ? `<img src="${esc(B.logo)}" alt="${esc(B.nom)}">` : `<span>${esc(B.nom)}</span>`
$('[data-logo]').innerHTML = logoHtml
$('[data-logo]').setAttribute('aria-label', `${B.nom}, accueil`)
$('[data-logo-pied]').innerHTML = logoHtml

// Annonces
const annonces = C.annonces.length ? C.annonces : [B.slogan || B.nom]
const ann = $('[data-annonce]'); ann.textContent = annonces[0]
let ia = 0
if (annonces.length > 1 && !reduce) {
  setInterval(() => {
    ia = (ia + 1) % annonces.length
    ann.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).onfinish = () => { ann.textContent = annonces[ia]; ann.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 }) }
  }, 4500)
}

// Bannière
$('[data-ban-surtitre]').textContent = C.banniere.surtitre
$('[data-ban-titre]').textContent = C.banniere.titre || B.nom
$('[data-ban-texte]').textContent = C.banniere.texte
$('[data-ban-bouton]').textContent = C.banniere.bouton || 'Découvrir'
if (B.banniere) $('[data-banniere]').style.setProperty('--image', `url("${B.banniere}")`)
else $('[data-banniere]').classList.add('banniere--uni')

$('[data-portant-titre]').textContent = C.portant.titre
$('[data-portant-texte]').textContent = C.portant.texte

/* ---------- Cartes produit (nouveautés, populaires, promos, catalogue) ---------- */
const carte = (p, opts = {}) => {
  const i = PIECES.indexOf(p)
  return `<li class="card${opts.large ? ' card--large' : ''}" data-cats="${esc(p.categorie)} ${esc(p.collections.join(' '))}">
    <button type="button" class="card__btn" data-i="${i}">
      <span class="card__img card__img--${p.presentation}"><img src="${esc(p.couleurs[0].face)}" alt="" width="660" height="876" loading="lazy"></span>
      <span class="badges">${p.nouveau ? '<span class="badge">Nouveau</span>' : ''}${remise(p) ? `<span class="badge badge--promo">-${remise(p)} %</span>` : ''}${epuise(p) ? '<span class="badge badge--off">Épuisé</span>' : ''}</span>
      <span class="card__cat">${esc(NOMS_CAT[p.categorie] || '')}</span>
      <span class="card__name">${esc(p.nom)}</span>
      <span class="card__meta"><span>${prixHtml(p)}</span><span class="dots">${p.couleurs.map((c) => `<i style="--c:${esc(c.hex)}" title="${esc(c.nom)}"></i>`).join('')}</span></span>
    </button>
  </li>`
}
const parDate = (a, b) => new Date(b.created_at) - new Date(a.created_at)

// Nouveautés : les plus récentes
const nouveautes = [...PIECES].sort(parDate).slice(0, 8)
$('[data-nouveautes]').innerHTML = nouveautes.map((p) => carte(p)).join('')
$('#nouveautes').hidden = !nouveautes.length

// Populaires : ventes réelles, puis pièces mises en avant par la boutique
const populaires = PIECES.filter((p) => p.ventes > 0 || p.mis_en_avant).sort((a, b) => (b.ventes - a.ventes) || (b.mis_en_avant - a.mis_en_avant)).slice(0, 4)
$('[data-populaires]').innerHTML = populaires.map((p) => carte(p)).join('')
$('[data-bloc-populaires]').hidden = !populaires.length

// Promotions
const promos = PIECES.filter((p) => p.prix_promo_centimes != null).sort((a, b) => remise(b) - remise(a))
$('[data-promos]').innerHTML = promos.map((p) => carte(p)).join('')
$('[data-bloc-promos]').hidden = !promos.length

// Collections
const collections = CAT.collections.map((c) => ({ ...c, pieces: PIECES.filter((p) => p.collections.includes(c.id)) })).filter((c) => c.pieces.length)
$('[data-collections]').innerHTML = collections.map((c) => `<li><button type="button" class="collection" data-filtre="${esc(c.id)}">
  <span class="collection__mosaique">${c.pieces.slice(0, 3).map((p) => `<img src="${esc(p.couleurs[0].face)}" alt="" loading="lazy" width="660" height="876">`).join('')}</span>
  <span class="collection__txt"><span class="collection__nom">${esc(c.nom)}</span>${c.description ? `<span class="collection__desc">${esc(c.description)}</span>` : ''}
  <span class="collection__nb">${c.pieces.length} pièce${c.pieces.length > 1 ? 's' : ''} · Découvrir</span></span>
</button></li>`).join('')
$('[data-bloc-collections]').hidden = !collections.length

// Catégories : celles qui ont des pièces, plus les promotions
const cats = B.categories.map((c) => ({ ...c, pieces: PIECES.filter((p) => p.categorie === c.slug) })).filter((c) => c.pieces.length)
$('[data-categories]').innerHTML = [...cats.map((c) => `<li><button type="button" class="tuile" data-filtre="${esc(c.slug)}">
  <span class="tuile__img tuile__img--${c.presentation}"><img src="${esc(c.pieces[0].couleurs[0].face)}" alt="" loading="lazy" width="660" height="876"></span>
  <span class="tuile__nom">${esc(c.nom)}</span><span class="tuile__nb">${c.pieces.length}</span></button></li>`),
...(promos.length ? [`<li><button type="button" class="tuile tuile--promo" data-filtre="promotions"><span class="tuile__img"><span class="tuile__pct">-${remise(promos[0])} %</span></span><span class="tuile__nom">Promotions</span><span class="tuile__nb">${promos.length}</span></button></li>`] : [])].join('')

/* ---------- Menus ---------- */
const lienCat = (c) => `<a href="#boutique" data-filtre="${esc(c.slug)}">${esc(c.nom)}</a>`
const vet = cats.filter((c) => c.groupe === 'vetements'); const acc = cats.filter((c) => c.groupe === 'accessoires')
$('[data-sous-liste="vetements"]').innerHTML = vet.map(lienCat).join('') || '<span>Bientôt</span>'
$('[data-sous-liste="accessoires"]').innerHTML = acc.map(lienCat).join('') || '<span>Bientôt</span>'
$('[data-pied-vetements]').innerHTML = vet.map((c) => `<li>${lienCat(c)}</li>`).join('')
$('[data-pied-accessoires]').innerHTML = acc.map((c) => `<li>${lienCat(c)}</li>`).join('') + (promos.length ? '<li><a href="#boutique" data-filtre="promotions">Promotions</a></li>' : '')
$('[data-lien-promos]').hidden = !promos.length
if (!acc.length) $('[data-sous="accessoires"]').closest('.nav__groupe').hidden = true
$('[data-tiroir-liens]').innerHTML = `<a href="#nouveautes">Nouveautés</a>
  <p class="tiroir__t">Vêtements</p>${vet.map(lienCat).join('')}
  ${acc.length ? `<p class="tiroir__t">Accessoires</p>${acc.map(lienCat).join('')}` : ''}
  ${promos.length ? '<a href="#boutique" data-filtre="promotions" class="tiroir__promo">Promotions</a>' : ''}
  <a href="#maison">La boutique</a>`
for (const b of $$('[data-sous]')) {
  const liste = $(`[data-sous-liste="${b.dataset.sous}"]`)
  const basculer = (o) => { liste.hidden = !o; b.setAttribute('aria-expanded', String(o)) }
  b.addEventListener('click', () => basculer(liste.hidden))
  b.closest('.nav__groupe').addEventListener('mouseleave', () => basculer(false))
  b.closest('.nav__groupe').addEventListener('focusout', (e) => { if (!b.closest('.nav__groupe').contains(e.relatedTarget)) basculer(false) })
}
const tiroir = $('[data-tiroir]'); const burger = $('[data-burger]')
burger.addEventListener('click', () => { const o = tiroir.hidden; tiroir.hidden = !o; burger.setAttribute('aria-expanded', String(o)) })
tiroir.addEventListener('click', (e) => { if (e.target.closest('a') || e.target === tiroir) { tiroir.hidden = true; burger.setAttribute('aria-expanded', 'false') } })

/* ---------- Catalogue filtrable ---------- */
let filtre = 'tout'; let tri = 'nouveautes'
const filtres = [{ id: 'tout', nom: 'Tout' }, ...cats.map((c) => ({ id: c.slug, nom: c.nom })), ...(promos.length ? [{ id: 'promotions', nom: 'Promotions' }] : []), ...collections.map((c) => ({ id: c.id, nom: c.nom }))]
$('[data-chips]').innerHTML = filtres.map((f) => `<button type="button" class="chip" data-f="${esc(f.id)}" aria-pressed="false">${esc(f.nom)}</button>`).join('')
function peindreCatalogue () {
  let l = PIECES.filter((p) => filtre === 'tout' || (filtre === 'promotions' ? p.prix_promo_centimes != null : filtre === 'nouveautes' ? nouveautes.includes(p) : p.categorie === filtre || p.collections.includes(filtre)))
  l = [...l].sort(tri === 'prix-asc' ? (a, b) => prix(a) - prix(b) : tri === 'prix-desc' ? (a, b) => prix(b) - prix(a) : tri === 'populaires' ? (a, b) => (b.ventes - a.ventes) || (b.mis_en_avant - a.mis_en_avant) : parDate)
  $('[data-grid]').innerHTML = l.map((p) => carte(p)).join('')
  $('[data-grille-vide]').hidden = l.length > 0
  const f = filtres.find((x) => x.id === filtre)
  $('[data-cat-titre]').textContent = filtre === 'tout' ? 'Toute la boutique' : filtre === 'nouveautes' ? 'Nouveautés' : f?.nom || 'Toute la boutique'
  $('[data-cat-compte]').textContent = `${l.length} pièce${l.length > 1 ? 's' : ''}`
  for (const c of $$('[data-f]')) { const on = c.dataset.f === filtre; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)) }
}
function filtrer (f, defiler = true) {
  filtre = f; peindreCatalogue()
  if (defiler) $('#boutique').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
$('[data-chips]').addEventListener('click', (e) => { const c = e.target.closest('[data-f]'); if (c) filtrer(c.dataset.f, false) })
$('[data-tri]').addEventListener('change', (e) => { tri = e.target.value; peindreCatalogue() })
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-filtre]'); if (f) { e.preventDefault(); filtrer(f.dataset.filtre) }
  const v = e.target.closest('[data-voir-tout]'); if (v) { e.preventDefault(); filtrer(v.dataset.voirTout) }
  const c = e.target.closest('.card__btn'); if (c) ouvrir(+c.dataset.i, $('img', c))
})
peindreCatalogue()

/* ---------- Présentation, services, pied ---------- */
const pr = C.presentation
$('[data-maison-titre]').textContent = pr.titre || B.nom
$('[data-maison-texte]').innerHTML = (pr.texte || '').split(/\n+/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('')
$('[data-maison-img]').innerHTML = B.presentation_image ? `<img src="${esc(B.presentation_image)}" alt="La boutique ${esc(B.nom)}" loading="lazy">` : ''
$('[data-maison-img]').hidden = !B.presentation_image
const infos = [
  pr.adresse && ['Adresse', esc(pr.adresse)],
  pr.horaires.length && ['Horaires', pr.horaires.map(esc).join('<br>')],
  pr.telephone && ['Téléphone', `<a href="tel:${esc(pr.telephone.replace(/\s/g, ''))}">${esc(pr.telephone)}</a>`],
  pr.email && ['E-mail', `<a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a>`]
].filter(Boolean)
$('[data-maison-infos]').innerHTML = infos.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')
$('[data-services]').innerHTML = [
  [`Livraison offerte dès ${euros(B.livraison_offerte_centimes)}`, `Sinon ${euros(B.livraison_centimes)}, en France métropolitaine.`],
  ...(B.retrait ? [['Retrait en boutique', 'Gratuit. Commandez en ligne, passez la chercher.']] : []),
  ['Paiement sécurisé', 'Votre panier est réservé 30 minutes pendant le paiement.']
].map(([t, p]) => `<div><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('')
$('[data-pied-texte]').textContent = C.pied || B.slogan || ''
const R = C.reseaux
$('[data-reseaux]').innerHTML = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].filter(([k]) => R[k]).map(([k, n]) => `<a href="${esc(R[k])}" target="_blank" rel="noopener">${n}</a>`).join('')
$('[data-pied-aide]').innerHTML = [`<li>Livraison ${euros(B.livraison_centimes)}, offerte dès ${euros(B.livraison_offerte_centimes)}</li>`, B.retrait ? '<li>Retrait en boutique gratuit</li>' : '', '<li>Paiement sécurisé par carte</li>', '<li><a href="#boutique" data-filtre="tout">Toute la boutique</a></li>'].join('')
$('[data-pied-contact]').innerHTML = [pr.adresse && `<p>${esc(pr.adresse)}</p>`, pr.horaires.length && `<p>${pr.horaires.map(esc).join('<br>')}</p>`, pr.telephone && `<p>${esc(pr.telephone)}</p>`, pr.email && `<p><a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a></p>`].filter(Boolean).join('') || `<p>${esc(B.nom)}</p>`
$('[data-pied-copy]').textContent = `© ${new Date().getFullYear()} ${B.nom}`
const bandTxt = [...annonces, `Livraison offerte dès ${euros(B.livraison_offerte_centimes)}`]
const run = bandTxt.map((t) => `<span>${esc(t)}</span><span aria-hidden="true">✦</span>`).join('')
$('[data-band]').innerHTML = run + run + run

/* ---------- Le portant (vêtements sur cintre uniquement) ---------- */
const list = $('[data-rail-list]'); const rail = $('[data-rail]')
const SUR_PORTANT = PIECES.filter((p) => p.presentation === 'cintre').slice(0, MAX_PORTANT)
$('[data-vide]').hidden = SUR_PORTANT.length > 0
list.innerHTML = SUR_PORTANT.map((p) => {
  const i = PIECES.indexOf(p)
  return `<li class="piece">
    <button type="button" class="piece__btn" data-i="${i}" aria-label="${esc(p.nom)}, ${euros(prix(p))}. Ouvrir la fiche">
      <span class="piece__swing"><img src="${esc(p.couleurs[0].face)}" alt="" width="660" height="876" draggable="false" ${i > 5 ? 'loading="lazy"' : ''}></span>
    </button>
    <span class="piece__tag" aria-hidden="true">${esc(p.nom.split(',')[0])} · ${euros(prix(p))}</span>
  </li>`
}).join('')
const pieces = $$('.piece', list).map((el, k) => ({ el, k, i: +$('.piece__btn', el).dataset.i, btn: $('.piece__btn', el), swing: $('.piece__swing', el), a: 0, v: 0, t: 0, push: 0, phase: Math.random() * Math.PI * 2 }))
const majLong = () => $('.rail-zone').classList.toggle('is-long', list.scrollWidth > list.clientWidth + 2)
majLong(); addEventListener('resize', majLong)

let hovered = -1; let centred = -1; let running = false; let visible = true; let qvOpen = false
const target = (p) => qvOpen ? 0 : narrow.matches ? (p.k === centred ? 1 : 0) : (p.k === hovered ? 1 : 0)
function frame (now) {
  if (!running) return
  const time = now / 1000
  for (const p of pieces) {
    const idle = reduce ? 0 : Math.sin(time * 0.9 + p.phase) * 0.35
    p.v += -0.06 * (p.a - idle) - 0.12 * p.v; p.a += p.v
    p.t += (target(p) - p.t) * (reduce ? 1 : 0.14)
    const gp = !narrow.matches && hovered > -1 && !qvOpen ? Math.sign(p.k - hovered) * Math.max(0, 26 - Math.abs(p.k - hovered) * 8) : 0
    p.push += (gp - p.push) * 0.14
    p.btn.style.transform = `translateX(${p.push.toFixed(2)}px) rotateY(${((1 - p.t) * 34).toFixed(2)}deg) scale(${(1 + p.t * 0.07).toFixed(4)})`
    p.btn.style.filter = `brightness(${(0.93 + p.t * 0.07).toFixed(3)})`
    p.swing.style.transform = `rotate(${p.a.toFixed(3)}deg)`
    p.el.style.zIndex = String(Math.round(p.t * 10) + 1)
  }
  requestAnimationFrame(frame)
}
const start = () => { if (!running && visible) { running = true; requestAnimationFrame(frame) } }
const stop = () => { running = false }
new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() }).observe(rail)
document.addEventListener('visibilitychange', () => document.hidden ? stop() : start())
let lastX = null
rail.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce) return
  const dx = lastX == null ? 0 : e.clientX - lastX; lastX = e.clientX
  for (const p of pieces) {
    const r = p.btn.getBoundingClientRect()
    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) p.v += Math.max(-1.2, Math.min(1.2, dx * 0.05))
  }
})
rail.addEventListener('pointerleave', () => { lastX = null; hovered = -1 })
for (const p of pieces) {
  p.btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = p.k })
  p.btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && hovered === p.k) hovered = -1 })
  p.btn.addEventListener('focus', () => { hovered = p.k; p.v += 0.8 })
  p.btn.addEventListener('blur', () => { if (hovered === p.k) hovered = -1 })
}
let drag = null
list.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && list.scrollWidth > list.clientWidth) drag = { x: e.clientX, left: list.scrollLeft, moved: false } })
addEventListener('pointermove', (e) => {
  if (!drag) return
  const dx = e.clientX - drag.x
  if (Math.abs(dx) > 6) drag.moved = true
  if (drag.moved) { list.scrollLeft = drag.left - dx; list.classList.add('is-drag') }
})
addEventListener('pointerup', () => { setTimeout(() => { drag = null; list.classList.remove('is-drag') }, 0) })
list.addEventListener('click', (e) => {
  const b = e.target.closest('.piece__btn'); if (!b) return
  if (drag?.moved) { e.preventDefault(); return }
  ouvrir(+b.dataset.i, $('img', b))
})
function findCentre () {
  const mid = list.getBoundingClientRect().left + list.clientWidth / 2
  let best = -1; let bd = Infinity
  for (const p of pieces) { const r = p.btn.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = p.k } }
  if (best > -1 && best !== centred && centred > -1) pieces[best].v += 1.4
  centred = best
}
list.addEventListener('scroll', () => { if (narrow.matches) findCentre() }, { passive: true })
let glide = !reduce; let glideDir = 1
const stopGlide = () => { glide = false }
list.addEventListener('touchstart', stopGlide, { passive: true })
list.addEventListener('wheel', stopGlide, { passive: true })
function glideStep () {
  if (glide && narrow.matches && !qvOpen && visible) {
    const max = list.scrollWidth - list.clientWidth
    if (list.scrollLeft >= max - 1) glideDir = -1
    if (list.scrollLeft <= 0) glideDir = 1
    list.scrollLeft += glideDir * 0.6
  }
  if (glide) requestAnimationFrame(glideStep)
}
if (narrow.matches) findCentre()
requestAnimationFrame(glideStep)
start()

/* ---------- Fiche produit ---------- */
const qv = $('[data-qv]'); const qvImg = $('[data-qv-img]')
const sel = { i: 0, c: 0, view: 'face', v: null, origin: null }
const outside = () => [$('main'), $('.top'), $('.pied'), $('.annonces')]
function paint (swap) {
  const p = PIECES[sel.i]; const col = p.couleurs[sel.c]
  $('[data-qv-count]').textContent = NOMS_CAT[p.categorie] || ''
  $('[data-qv-type]').textContent = [p.type, col.nom].filter(Boolean).join(' · ')
  $('[data-qv-name]').textContent = p.nom
  $('[data-qv-price]').innerHTML = prixHtml(p) + (remise(p) ? ` <span class="badge badge--promo">-${remise(p)} %</span>` : '')
  $('[data-qv-txt]').textContent = p.description
  const views = $('[data-qv-views]'); views.hidden = !col.dos
  for (const b of $$('button', views)) { const on = b.dataset.view === sel.view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)) }
  $('[data-qv-colors]').innerHTML = p.couleurs.length > 1
    ? p.couleurs.map((c, k) => `<button type="button" class="sw${k === sel.c ? ' is-on' : ''}" style="--c:${esc(c.hex)}" data-c="${k}" aria-pressed="${k === sel.c}" aria-label="${esc(c.nom)}" title="${esc(c.nom)}"></button>`).join('')
    : ''
  $('[data-qv-sizes]').innerHTML = col.variantes.map((v) => `<button type="button" class="size${v.id === sel.v ? ' is-on' : ''}${v.disponible ? '' : ' is-off'}" data-v="${esc(v.id)}"
    aria-pressed="${v.id === sel.v}" ${v.disponible ? '' : 'disabled aria-label="' + esc(v.taille) + ', épuisé"'}>${esc(v.taille)}</button>`).join('')
  const dispo = col.variantes.some((v) => v.disponible)
  $('[data-qv-add]').disabled = !dispo
  $('[data-qv-add]').textContent = dispo ? 'Ajouter au panier' : 'Épuisé dans cette couleur'
  const reste = col.variantes.find((v) => v.id === sel.v)
  $('[data-qv-err]').textContent = reste && reste.stock <= 2 ? `Plus que ${reste.stock} en ${reste.taille}.` : ''
  qv.classList.toggle('qv--objet', p.presentation === 'objet')
  const src = sel.view === 'dos' && col.dos ? col.dos : col.face
  if (swap && !reduce && qvImg.getAttribute('src') !== src) {
    qvImg.animate([{ opacity: 1, transform: 'rotateY(0)' }, { opacity: 0, transform: 'rotateY(70deg)' }], { duration: 160, easing: 'ease-in' }).onfinish = () => {
      qvImg.src = src
      qvImg.animate([{ opacity: 0, transform: 'rotateY(-70deg)' }, { opacity: 1, transform: 'rotateY(0)' }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' })
    }
  } else qvImg.src = src
}
function fly (fromEl, reverse) {
  if (reduce || !fromEl) return Promise.resolve()
  const a = fromEl.getBoundingClientRect(); const b = qvImg.getBoundingClientRect()
  if (!a.width || !b.width) return Promise.resolve()
  const dx = a.left + a.width / 2 - (b.left + b.width / 2); const dy = a.top + a.height / 2 - (b.top + b.height / 2)
  const from = { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }; const to = { transform: 'none' }
  return qvImg.animate(reverse ? [to, from] : [from, to], { duration: reverse ? 380 : 560, easing: 'cubic-bezier(.2,.8,.2,1)', fill: reverse ? 'forwards' : 'none' }).finished
}
let lastFocus = null
function ouvrir (i, fromImg) {
  lastFocus = document.activeElement
  Object.assign(sel, { i, c: 0, view: 'face', v: null, origin: fromImg })
  const p = PIECES[i]; const libre = p.couleurs[0].variantes.filter((v) => v.disponible)
  if (libre.length === 1 && p.couleurs[0].variantes.length === 1) sel.v = libre[0].id // taille unique : déjà choisie
  qvOpen = true; paint(false); qv.hidden = false
  document.documentElement.classList.add('qv-on')
  for (const el of outside()) el.inert = true
  if (fromImg) fromImg.style.visibility = 'hidden'
  requestAnimationFrame(() => {
    qv.classList.add('is-on')
    fly(fromImg).then(() => { if (fromImg) fromImg.style.visibility = '' })
    $('[data-qv-close]').focus({ preventScroll: true })
  })
}
async function fermer () {
  if (!qvOpen) return
  const o = sel.origin
  const inView = o && o.isConnected && (() => { const r = o.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 })()
  qv.classList.remove('is-on')
  if (inView && sel.c === 0 && sel.view === 'face') { o.style.visibility = 'hidden'; await fly(o, true); o.style.visibility = '' } else if (!reduce) await new Promise((r) => setTimeout(r, 250))
  qvImg.getAnimations().forEach((a) => a.cancel())
  qv.hidden = true; qvOpen = false
  document.documentElement.classList.remove('qv-on')
  for (const el of outside()) el.inert = false
  lastFocus?.focus?.({ preventScroll: true })
}
function pas (d) {
  sel.i = (sel.i + d + PIECES.length) % PIECES.length
  Object.assign(sel, { c: 0, view: 'face', v: null, origin: $(`.piece__btn[data-i="${sel.i}"] img`) })
  const p = PIECES[sel.i]; if (p.couleurs[0].variantes.length === 1 && p.couleurs[0].variantes[0].disponible) sel.v = p.couleurs[0].variantes[0].id
  paint(true)
}
$('[data-qv-close]').addEventListener('click', fermer)
$('[data-qv-prev]').addEventListener('click', () => pas(-1))
$('[data-qv-next]').addEventListener('click', () => pas(1))
qv.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]'); if (v) { sel.view = v.dataset.view; paint(true) }
  const c = e.target.closest('[data-c]'); if (c) {
    sel.c = +c.dataset.c; sel.view = 'face'; sel.v = null
    const vs = PIECES[sel.i].couleurs[sel.c].variantes; if (vs.length === 1 && vs[0].disponible) sel.v = vs[0].id
    paint(true)
  }
  const s = e.target.closest('[data-v]'); if (s && !s.disabled) { sel.v = s.dataset.v; paint(false) }
  if (e.target === qv || e.target.classList.contains('qv__stage')) fermer()
})
$('[data-qv-add]').addEventListener('click', () => {
  if (!sel.v) { $('[data-qv-err]').textContent = 'Choisissez une taille.'; $('[data-qv-sizes] button:not([disabled])')?.focus(); return }
  ajouter(sel.v)
})
addEventListener('keydown', (e) => {
  if (qvOpen) {
    if (e.key === 'Escape') fermer()
    if (e.key === 'ArrowRight') pas(1)
    if (e.key === 'ArrowLeft') pas(-1)
    if (e.key === 'Tab') trap(e, qv)
  } else if (cartOpen) {
    if (e.key === 'Escape') fermerPanier()
    if (e.key === 'Tab') trap(e, cart)
  } else if (e.key === 'Escape' && !tiroir.hidden) { tiroir.hidden = true; burger.setAttribute('aria-expanded', 'false') }
})
function trap (e, box) {
  const f = $$('button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])', box).filter((x) => x.offsetParent !== null)
  if (!f.length) return
  const first = f[0]; const last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}
let sx = null
qv.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX }, { passive: true })
qv.addEventListener('touchend', (e) => {
  if (sx == null) return
  const dx = e.changedTouches[0].clientX - sx; sx = null
  if (Math.abs(dx) > 60 && e.target.closest('.qv__stage')) pas(dx < 0 ? 1 : -1)
})

/* ---------- Panier ---------- */
const cart = $('[data-cart]'); const veil = $('[data-cart-veil]')
const CLE = `panier-${location.host}`
const store = {
  get () { try { return JSON.parse(localStorage.getItem(CLE)) || [] } catch { return [] } },
  set (v) { try { localStorage.setItem(CLE, JSON.stringify(v)) } catch { /* stockage indisponible */ } }
}
const VAR = new Map()
for (const p of PIECES) for (const c of p.couleurs) for (const v of c.variantes) VAR.set(v.id, { p, c, v })
let items = store.get().filter((x) => VAR.get(x.v)?.v.disponible).map((x) => ({ v: x.v, q: Math.min(x.q, VAR.get(x.v).v.stock) }))
let cartOpen = false; let etape = 'panier'
function ajouter (vid) {
  const hit = items.find((x) => x.v === vid); const max = VAR.get(vid).v.stock
  if (hit) { if (hit.q >= max) { toast(`Plus que ${max} disponible${max > 1 ? 's' : ''}.`); return } hit.q++ } else items.push({ v: vid, q: 1 })
  save()
  if (!reduce) $('[data-bag-n]').animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 300 })
  toast(`${PIECES[sel.i].nom.split(',')[0]} ajouté au panier`)
}
const save = () => { store.set(items); peindrePanier() }
const sousTotal = () => items.reduce((s, x) => s + x.q * prix(VAR.get(x.v).p), 0)
const modeLivraison = () => $('[data-checkout-form]').mode.value
const fraisLivraison = () => modeLivraison() === 'retrait' || sousTotal() >= B.livraison_offerte_centimes ? 0 : B.livraison_centimes
function peindrePanier () {
  const n = items.reduce((s, x) => s + x.q, 0); const st = sousTotal()
  $('[data-bag-n]').textContent = n
  $('[data-open-cart]').setAttribute('aria-label', `Ouvrir le panier, ${n} article${n > 1 ? 's' : ''}`)
  $('[data-cart-count]').textContent = n ? `(${n})` : ''
  const left = B.livraison_offerte_centimes - st
  $('[data-ship-txt]').innerHTML = !n ? `Livraison offerte dès ${euros(B.livraison_offerte_centimes)}.` : left > 0 ? `Encore <b>${euros(left)}</b> pour la livraison offerte.` : '<b>Livraison offerte.</b>'
  $('[data-ship-bar]').style.width = `${Math.min(100, (st / B.livraison_offerte_centimes) * 100)}%`
  const commande = etape === 'commande'
  $('[data-ligne-livraison]').hidden = !commande
  $('[data-cart-livraison]').textContent = fraisLivraison() ? euros(fraisLivraison()) : 'offerte'
  $('[data-cart-total]').textContent = euros(st + (commande ? fraisLivraison() : 0))
  $('[data-checkout]').disabled = !n
  $('[data-cart-list]').innerHTML = n
    ? items.map((x, k) => {
      const { p, c, v } = VAR.get(x.v)
      return `<li class="line">
        <img src="${esc(c.face)}" alt="" width="66" height="88">
        <div class="line__txt"><p class="line__name">${esc(p.nom)}</p><p class="line__meta">${esc(c.nom)} · ${esc(v.taille)}</p>
          <div class="qty"><button type="button" data-q="${k}" data-d="-1" aria-label="Retirer un">−</button><span>${x.q}</span><button type="button" data-q="${k}" data-d="1" aria-label="Ajouter un" ${x.q >= v.stock ? 'disabled' : ''}>+</button></div></div>
        <div class="line__r"><p>${euros(prix(p) * x.q)}</p><button type="button" class="lnk lnk--s" data-rm="${k}">Retirer</button></div>
      </li>`
    }).join('')
    : '<li class="empty">Votre panier est vide. Le portant vous attend.</li>'
}
$('[data-cart-list]').addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]'); const rm = e.target.closest('[data-rm]')
  if (q) { const it = items[+q.dataset.q]; it.q = Math.min(VAR.get(it.v).v.stock, it.q + +q.dataset.d); if (it.q < 1) items.splice(+q.dataset.q, 1); save() }
  if (rm) { items.splice(+rm.dataset.rm, 1); save() }
})
let cartFrom = null
function ouvrirPanier () {
  $('[data-toast]').classList.remove('is-on')
  cartFrom = document.activeElement
  cartOpen = true; veil.hidden = false; cart.inert = false; cart.setAttribute('aria-hidden', 'false')
  requestAnimationFrame(() => { veil.classList.add('is-on'); cart.classList.add('is-on') })
  $('[data-cart-close]').focus({ preventScroll: true })
}
function fermerPanier () {
  cartOpen = false; veil.classList.remove('is-on'); cart.classList.remove('is-on')
  cart.inert = true; cart.setAttribute('aria-hidden', 'true')
  setTimeout(() => { if (!cartOpen) veil.hidden = true }, 350)
  passerA('panier')
  cartFrom?.focus?.({ preventScroll: true })
}
$('[data-open-cart]').addEventListener('click', ouvrirPanier)
$('[data-cart-close]').addEventListener('click', fermerPanier)
veil.addEventListener('click', fermerPanier)

/* ---------- Commande ---------- */
const form = $('[data-checkout-form]')
$('[data-prix-livraison]').textContent = `${euros(B.livraison_centimes)}, offerte dès ${euros(B.livraison_offerte_centimes)}`
if (B.retrait) { $('[data-retrait-choix]').hidden = false; $('[data-retrait-adresse]').textContent = `À retirer : ${B.retrait.adresse}` }
form.addEventListener('change', () => {
  const r = modeLivraison() === 'retrait'
  $('[data-adresse]').hidden = r; $('[data-retrait-adresse]').hidden = !r
  peindrePanier()
})
function passerA (e) {
  etape = e
  const c = e === 'commande'
  form.hidden = !c; $('[data-cart-list]').hidden = c; $('[data-cart-ship]').hidden = c
  $('[data-retour-panier]').hidden = !c
  $('[data-cart-titre]').firstChild.textContent = c ? 'Commande ' : 'Panier '
  $('[data-checkout]').textContent = c ? 'Payer' : 'Commander'
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
    ...(mode === 'livraison' ? [['ligne', !!f.ligne.value.trim(), 'Indiquez votre adresse.'], ['code_postal', /^\d{5}$/.test(f.code_postal.value.trim()), 'Code postal à 5 chiffres.'], ['ville', !!f.ville.value.trim(), 'Indiquez la ville.']] : [])]
    .find(([, ok]) => !ok)
  if (manque) { err.textContent = manque[2]; f[manque[0]].focus(); return }
  const b = $('[data-checkout]'); b.disabled = true; b.textContent = 'Un instant…'; err.textContent = ''
  try {
    const r = await api('/api/commandes', {
      method: 'POST',
      body: {
        client: { email: f.email.value.trim(), nom: f.nom.value.trim(), telephone: f.telephone.value.trim(), adresse: mode === 'livraison' ? { ligne: f.ligne.value.trim(), code_postal: f.code_postal.value.trim(), ville: f.ville.value.trim(), pays: 'FR' } : null },
        livraison_mode: mode,
        lignes: items.map((x) => ({ variante_id: x.v, quantite: x.q }))
      }
    })
    store.set([])
    location.href = r.url
  } catch (e) {
    err.textContent = e.message
    b.disabled = false; b.textContent = 'Payer'
  }
})
passerA('panier')

/* ---------- Divers ---------- */
const tst = $('[data-toast]'); let tt
function toast (msg) {
  tst.innerHTML = `<span>${esc(msg)}</span><button type="button" class="lnk" data-toast-cart>Voir le panier</button>`
  tst.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tst.classList.remove('is-on'), 3200)
}
tst.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-toast-cart]')) return
  tst.classList.remove('is-on'); if (qvOpen) await fermer(); ouvrirPanier()
})
document.documentElement.classList.toggle('is-touch', touch.matches)
