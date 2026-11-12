/* Page d'accueil : photo éditoriale, nouvelle collection sur le portant, sélection,
   rayons, meilleures ventes (réelles), présentation de la boutique, newsletter. */
import {
  $, $$, esc, euros, reduce, B, C, PIECES, NOMS_CAT, RAYONS, COLLECTIONS, NOUVEAUTES,
  prix, remise, epuise, prixHtml, carte, lienProduit, lienRayon, ajouter, avantOuvrirPanier, piegerFocus
} from './coquille.js'
import { api } from './commun.js'

const narrow = matchMedia('(max-width: 720px)')
const MAX_PORTANT = 12
document.title = B.slogan ? `${B.nom}, ${B.slogan.charAt(0).toLowerCase()}${B.slogan.slice(1)}` : B.nom

/* ---------- Photo éditoriale ---------- */
$('[data-ban-surtitre]').textContent = C.banniere.surtitre
$('[data-ban-surtitre]').hidden = !C.banniere.surtitre
$('[data-ban-titre]').textContent = C.banniere.titre || B.nom
$('[data-ban-texte]').textContent = C.banniere.texte
$('[data-ban-texte]').hidden = !C.banniere.texte
$('[data-ban-bouton]').textContent = C.banniere.bouton || 'Découvrir la collection'
if (B.banniere) $('[data-ban-img]').innerHTML = `<img src="${esc(B.banniere)}" alt="" fetchpriority="high" width="2000" height="1120">`
else { $('[data-ban-img]').remove(); $('[data-banniere]').classList.add('heros--uni') }

const vide = !PIECES.length
$('[data-accueil-vide]').hidden = !vide
if (vide) { $('[data-ban-bouton]').href = '#newsletter'; $('[data-ban-bouton]').textContent = 'Être prévenue de l’arrivée'; $('.heros__cta .lien').hidden = true }

/* ---------- Nouvelle collection : les vêtements sur cintre, dans l'ordre choisi par la boutique ---------- */
const SUR_PORTANT = PIECES.filter((p) => p.presentation === 'cintre').slice(0, MAX_PORTANT)
$('[data-bloc-collection]').hidden = !SUR_PORTANT.length
$('[data-portant-titre]').textContent = C.portant.titre || 'La nouvelle collection'
$('[data-portant-texte]').textContent = COLLECTIONS[0]?.description || ''
$('[data-portant-texte]').hidden = !COLLECTIONS[0]?.description
$('[data-collection-lien]').href = lienRayon('nouveautes')
$('[data-rail-aide]').textContent = narrow.matches ? 'Faites glisser le portant, touchez une pièce pour la découvrir.' : 'Passez sur une pièce pour la faire tourner, cliquez pour la découvrir.'

/* ---------- Sélection : les pièces choisies par la boutique, sinon les nouveautés ---------- */
const choisies = PIECES.filter((p) => p.mis_en_avant)
const selection = (choisies.length >= 4 ? choisies : NOUVEAUTES).slice(0, 8)
const garde = (n) => n >= 4 ? n - (n % 4) : n // rangées complètes
$('[data-selection]').innerHTML = selection.slice(0, garde(selection.length)).map(carte).join('')
$('[data-bloc-selection]').hidden = !selection.length
if (choisies.length < 4) { $('[data-selection-titre]').textContent = 'Les nouveautés'; $('[data-selection-lien]').href = lienRayon('nouveautes'); $('[data-selection-lien]').textContent = 'Toutes les nouveautés' }

/* ---------- Rayons avec photographies ---------- */
$('[data-categories]').innerHTML = RAYONS.map((c) => {
  const p = c.pieces.find((x) => x.mis_en_avant) || c.pieces[0]
  return `<li class="rayon"><a href="${lienRayon(c.slug)}" data-filtre="${esc(c.slug)}">
    <span class="rayon__img rayon__img--${c.presentation}"><img src="${esc(p.couleurs[0].face)}" alt="" loading="lazy" width="660" height="876"></span>
    <span class="rayon__nom">${esc(c.nom)}<span>${c.pieces.length}</span></span></a></li>`
}).join('')
$('[data-bloc-categories]').hidden = RAYONS.length < 2
$('[data-categories]').style.setProperty('--cols', RAYONS.length <= 4 ? RAYONS.length : [5, 9, 10].includes(RAYONS.length) ? 5 : RAYONS.length === 6 ? 3 : 4)

/* ---------- Meilleures ventes : uniquement des ventes réelles ---------- */
const ventes = PIECES.filter((p) => p.ventes > 0 && !epuise(p)).sort((a, b) => b.ventes - a.ventes).slice(0, 3)
$('[data-ventes]').innerHTML = ventes.map(carte).join('')
$('[data-bloc-ventes]').hidden = ventes.length < 2
if (!narrow.matches) $('.ventes').style.gridTemplateColumns = `repeat(${ventes.length + 1}, minmax(0, 1fr))`

/* ---------- La boutique ---------- */
const pr = C.presentation
$('[data-maison-titre]').textContent = pr.titre || B.nom
$('[data-maison-texte]').innerHTML = (pr.texte || '').split(/\n+/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('')
if (B.presentation_image) $('[data-maison-img]').innerHTML = `<img src="${esc(B.presentation_image)}" alt="L’intérieur de la boutique ${esc(B.nom)}" loading="lazy" width="1120" height="1400">`
else { $('[data-maison-img]').remove(); $('[data-maison]').classList.add('maison--seul') }
const infos = [
  pr.adresse && ['Adresse', esc(pr.adresse)],
  pr.horaires.length && ['Horaires', pr.horaires.map(esc).join('<br>')],
  pr.telephone && ['Téléphone', `<a href="tel:${esc(pr.telephone.replace(/\s/g, ''))}">${esc(pr.telephone)}</a>`],
  pr.email && ['E-mail', `<a href="mailto:${esc(pr.email)}">${esc(pr.email)}</a>`],
  B.retrait && ['Retrait des commandes', 'Gratuit, en boutique']
].filter(Boolean)
$('[data-maison-infos]').innerHTML = infos.map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')
$('[data-maison-infos]').hidden = !infos.length
if (!pr.texte && !infos.length && !B.presentation_image) $('#maison').hidden = true

/* ---------- Newsletter (inscription réelle) ---------- */
$('[data-lettre-titre]').textContent = C.newsletter.titre || 'Les nouvelles pièces, en premier'
$('[data-lettre-texte]').textContent = C.newsletter.texte || 'Recevez un e-mail quand de nouvelles pièces arrivent en boutique.'
$('[data-lettre-consentement]').textContent = `J’accepte de recevoir les e-mails de ${B.nom}. Je peux me désinscrire à tout moment.`
const lettre = $('[data-lettre]'); const etat = $('[data-lettre-etat]')
lettre.addEventListener('submit', async (e) => {
  e.preventDefault()
  etat.classList.remove('is-err')
  const email = lettre.email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { etat.classList.add('is-err'); etat.textContent = 'Indiquez une adresse e-mail valide.'; lettre.email.focus(); return }
  if (!lettre.consentement.checked) { etat.classList.add('is-err'); etat.textContent = 'Cochez la case pour accepter de recevoir nos e-mails.'; return }
  const b = $('button[type=submit]', lettre); b.disabled = true
  try {
    await api('/api/newsletter', { method: 'POST', body: { email, consentement: true } })
    lettre.reset(); etat.textContent = 'Merci, votre inscription est enregistrée.'
  } catch (err) { etat.classList.add('is-err'); etat.textContent = err.message } finally { b.disabled = false }
})

/* ---------- Le portant (vêtements sur cintre) ---------- */
const list = $('[data-rail-list]'); const rail = $('[data-rail]')
list.innerHTML = SUR_PORTANT.map((p, k) => {
  const i = PIECES.indexOf(p)
  return `<li class="piece">
    <button type="button" class="piece__btn" data-i="${i}" aria-label="${esc(p.nom)}, ${euros(prix(p))}. Ouvrir l’aperçu">
      <span class="piece__swing"><img src="${esc(p.couleurs[0].face)}" alt="" width="660" height="876" draggable="false" ${k > 5 ? 'loading="lazy"' : ''}></span>
    </button>
    <span class="piece__tag" aria-hidden="true">${esc(p.nom)}, ${euros(prix(p))}</span>
  </li>`
}).join('')
const pieces = $$('.piece', list).map((el, k) => ({ el, k, btn: $('.piece__btn', el), swing: $('.piece__swing', el), a: 0, v: 0, t: 0, push: 0, phase: Math.random() * Math.PI * 2 }))
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
    p.btn.style.filter = `brightness(${(0.94 + p.t * 0.06).toFixed(3)})`
    p.swing.style.transform = `rotate(${p.a.toFixed(3)}deg)`
    p.el.style.zIndex = String(Math.round(p.t * 10) + 1)
  }
  requestAnimationFrame(frame)
}
const start = () => { if (!running && visible && pieces.length) { running = true; requestAnimationFrame(frame) } }
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

/* ---------- Aperçu rapide ---------- */
const qv = $('[data-qv]'); const qvImg = $('[data-qv-img]')
const ORDRE = SUR_PORTANT.map((p) => PIECES.indexOf(p))
const sel = { i: 0, c: 0, view: 'face', v: null, origin: null }
const dehors = () => [$('main'), $('.haut'), $('.pied'), $('.info')]
function paint (swap) {
  const p = PIECES[sel.i]; const col = p.couleurs[sel.c]
  $('[data-qv-type]').textContent = [NOMS_CAT[p.categorie], col.nom].filter(Boolean).join(', ')
  $('[data-qv-name]').textContent = p.nom
  $('[data-qv-price]').innerHTML = prixHtml(p) + (remise(p) ? ` <span class="etiquette etiquette--promo">−${remise(p)} %</span>` : '')
  $('[data-qv-fiche]').href = lienProduit(p)
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
    qvImg.animate([{ opacity: 1, transform: 'rotateY(0)' }, { opacity: 0, transform: 'rotateY(70deg)' }], { duration: 150, easing: 'ease-in' }).onfinish = () => {
      qvImg.src = src
      qvImg.animate([{ opacity: 0, transform: 'rotateY(-70deg)' }, { opacity: 1, transform: 'rotateY(0)' }], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' })
    }
  } else qvImg.src = src
}
function fly (fromEl, reverse) {
  if (reduce || !fromEl) return Promise.resolve()
  const a = fromEl.getBoundingClientRect(); const b = qvImg.getBoundingClientRect()
  if (!a.width || !b.width) return Promise.resolve()
  const dx = a.left + a.width / 2 - (b.left + b.width / 2); const dy = a.top + a.height / 2 - (b.top + b.height / 2)
  const from = { transform: `translate(${dx}px, ${dy}px) scale(${a.width / b.width})` }; const to = { transform: 'none' }
  return qvImg.animate(reverse ? [to, from] : [from, to], { duration: reverse ? 340 : 480, easing: 'cubic-bezier(.23,1,.32,1)', fill: reverse ? 'forwards' : 'none' }).finished
}
const tailleUnique = (p, c = 0) => { const vs = p.couleurs[c].variantes; return vs.length === 1 && vs[0].disponible ? vs[0].id : null }
let lastFocus = null
function ouvrir (i, fromImg) {
  lastFocus = document.activeElement
  Object.assign(sel, { i, c: 0, view: 'face', v: tailleUnique(PIECES[i]), origin: fromImg })
  qvOpen = true; paint(false); qv.hidden = false
  document.documentElement.classList.add('qv-on')
  for (const el of dehors()) el.inert = true
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
  if (inView && sel.c === 0 && sel.view === 'face') { o.style.visibility = 'hidden'; await fly(o, true); o.style.visibility = '' } else if (!reduce) await new Promise((r) => setTimeout(r, 220))
  qvImg.getAnimations().forEach((a) => a.cancel())
  qv.hidden = true; qvOpen = false
  document.documentElement.classList.remove('qv-on')
  for (const el of dehors()) el.inert = false
  lastFocus?.focus?.({ preventScroll: true })
}
avantOuvrirPanier(fermer)
function pas (d) {
  const k = ORDRE.indexOf(sel.i)
  sel.i = ORDRE[(k + d + ORDRE.length) % ORDRE.length]
  Object.assign(sel, { c: 0, view: 'face', v: tailleUnique(PIECES[sel.i]), origin: $(`.piece__btn[data-i="${sel.i}"] img`) })
  paint(true)
}
$('[data-qv-close]').addEventListener('click', fermer)
$('[data-qv-prev]').addEventListener('click', () => pas(-1))
$('[data-qv-next]').addEventListener('click', () => pas(1))
qv.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]'); if (v) { sel.view = v.dataset.view; paint(true) }
  const c = e.target.closest('[data-c]'); if (c) { sel.c = +c.dataset.c; sel.view = 'face'; sel.v = tailleUnique(PIECES[sel.i], sel.c); paint(true) }
  const s = e.target.closest('[data-v]'); if (s && !s.disabled) { sel.v = s.dataset.v; paint(false) }
  if (e.target === qv || e.target.classList.contains('qv__stage')) fermer()
})
$('[data-qv-add]').addEventListener('click', () => {
  if (!sel.v) { $('[data-qv-err]').textContent = 'Choisissez une taille.'; $('[data-qv-sizes] button:not([disabled])')?.focus(); return }
  ajouter(sel.v)
})
addEventListener('keydown', (e) => {
  if (!qvOpen) return
  if (e.key === 'Escape') fermer()
  if (e.key === 'ArrowRight') pas(1)
  if (e.key === 'ArrowLeft') pas(-1)
  if (e.key === 'Tab') piegerFocus(e, qv)
})
let sx = null
qv.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX }, { passive: true })
qv.addEventListener('touchend', (e) => {
  if (sx == null) return
  const dx = e.changedTouches[0].clientX - sx; sx = null
  if (Math.abs(dx) > 60 && e.target.closest('.qv__stage')) pas(dx < 0 ? 1 : -1)
})
