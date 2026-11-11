/* Boutique de démonstration « Alba » : le portant, l’aperçu rapide, la grille et le panier. */
import '@fontsource-variable/inter-tight'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import './boutique.css'
import './comyx.css'
import { TAILLES, LIVRAISON_OFFERTE, euros } from './catalogue.js'
import { piecesDuPortant } from './donnees.js'

// Les pièces viennent de l'Atelier (ajoutées par la boutique), dans l'ordre choisi.
const PIECES = await piecesDuPortant()
// Le portant montre les premières pièces (l'ordre se règle dans l'Atelier), la grille montre tout.
const MAX_PORTANT = 12 // même valeur que dans atelier.js
const SUR_PORTANT = PIECES.slice(0, MAX_PORTANT)

const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const touch = matchMedia('(hover: none), (pointer: coarse)')
const narrow = matchMedia('(max-width: 720px)')

const store = {
  get (k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set (k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* stockage indisponible */ } }
}

/* ---------- Le portant ---------- */

const list = $('[data-rail-list]')
const rail = $('[data-rail]')

list.innerHTML = SUR_PORTANT.map((p, i) => `
  <li class="piece" style="--i:${i}">
    <button type="button" class="piece__btn" data-i="${i}" aria-label="${esc(p.nom)}, ${euros(p.prix)}. Ouvrir l’aperçu">
      <span class="piece__swing"><img src="${esc(p.couleurs[0].face)}" alt="" width="660" height="876" draggable="false" ${i > 5 ? 'loading="lazy"' : ''}></span>
    </button>
    <span class="piece__tag" aria-hidden="true">${esc(p.nom.split(',')[0])} · ${euros(p.prix)}</span>
  </li>`).join('')

const pieces = $$('.piece', list).map((el, i) => ({
  el, i, btn: $('.piece__btn', el), swing: $('.piece__swing', el),
  a: 0, v: 0, t: 0, push: 0, phase: Math.random() * Math.PI * 2
}))

const majLong = () => $('.rail-zone').classList.toggle('is-long', list.scrollWidth > list.clientWidth + 2)
majLong(); addEventListener('resize', majLong)

let hovered = -1
let centred = -1
let running = false
let visible = true
let qvOpen = false

function target (p) {
  if (qvOpen) return 0
  if (narrow.matches) return p.i === centred ? 1 : 0
  return p.i === hovered ? 1 : 0
}

function frame (now) {
  if (!running) return
  const time = now / 1000
  for (const p of pieces) {
    // Balancement : ressort amorti, plus une légère respiration à l’arrêt.
    const idle = reduce ? 0 : Math.sin(time * 0.9 + p.phase) * 0.35
    const acc = -0.06 * (p.a - idle) - 0.12 * p.v
    p.v += acc; p.a += p.v
    // La pièce touchée se tourne vers vous.
    const goal = target(p)
    p.t += (goal - p.t) * (reduce ? 1 : 0.14)
    // Les voisines s’écartent un peu.
    const gp = !narrow.matches && hovered > -1 && !qvOpen ? Math.sign(p.i - hovered) * Math.max(0, 26 - Math.abs(p.i - hovered) * 8) : 0
    p.push += (gp - p.push) * 0.14
    const yaw = (1 - p.t) * 34
    const s = 1 + p.t * 0.07
    p.btn.style.transform = `translateX(${p.push.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) scale(${s.toFixed(4)})`
    p.btn.style.filter = `brightness(${(0.93 + p.t * 0.07).toFixed(3)})`
    p.swing.style.transform = `rotate(${p.a.toFixed(3)}deg)`
    p.el.style.zIndex = String(Math.round(p.t * 10) + 1)
  }
  requestAnimationFrame(frame)
}
function start () { if (!running && visible) { running = true; requestAnimationFrame(frame) } }
function stop () { running = false }

new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() }).observe(rail)
document.addEventListener('visibilitychange', () => document.hidden ? stop() : start())

// Effleurer : le pointeur qui traverse le portant pousse les pièces.
let lastX = null
rail.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || reduce) return
  const dx = lastX == null ? 0 : e.clientX - lastX
  lastX = e.clientX
  for (const p of pieces) {
    const r = p.btn.getBoundingClientRect()
    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
      p.v += Math.max(-1.2, Math.min(1.2, dx * 0.05))
    }
  }
})
rail.addEventListener('pointerleave', () => { lastX = null; hovered = -1 })
for (const p of pieces) {
  p.btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovered = p.i })
  p.btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && hovered === p.i) hovered = -1 })
  p.btn.addEventListener('focus', () => { hovered = p.i; p.v += 0.8 })
  p.btn.addEventListener('blur', () => { if (hovered === p.i) hovered = -1 })
}

// Glisser le portant (souris) sans déclencher l’ouverture.
let drag = null
list.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || list.scrollWidth <= list.clientWidth) return
  drag = { x: e.clientX, left: list.scrollLeft, moved: false }
})
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
  openQV(+b.dataset.i, $('img', b))
})

// Sur téléphone : la pièce au centre se tourne, et le portant défile seul tant qu’on n’y touche pas.
function findCentre () {
  const mid = list.getBoundingClientRect().left + list.clientWidth / 2
  let best = -1; let bd = Infinity
  for (const p of pieces) {
    const r = p.btn.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid)
    if (d < bd) { bd = d; best = p.i }
  }
  if (best !== centred && centred > -1) pieces[best].v += 1.4
  centred = best
}
list.addEventListener('scroll', () => { if (narrow.matches) findCentre() }, { passive: true })

let glide = !reduce
let glideDir = 1
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
if (narrow.matches) { list.scrollLeft = 0; findCentre() }
requestAnimationFrame(glideStep)
narrow.addEventListener('change', () => { centred = -1; if (narrow.matches) findCentre() })

start()

/* ---------- Bandeau ---------- */
const bandTxt = ['Nouvelle collection chaque semaine', 'Concept store à Amiens', 'Paiement en 3 fois sans frais dès 100 €', '-10 % sur la première commande avec THANKYOU10', 'Satisfaite ou remboursée sous 14 jours']
const band = $('[data-band]')
const run = bandTxt.map((t) => `<span>${t}</span><span aria-hidden="true">✦</span>`).join('')
band.innerHTML = run + run + run + run

/* ---------- Grille ---------- */
const grid = $('[data-grid]')
grid.innerHTML = PIECES.map((p, i) => `
  <li class="card" data-fam="${p.famille}">
    <button type="button" class="card__btn" data-i="${i}">
      <span class="card__img"><img src="${esc(p.couleurs[0].face)}" alt="" width="660" height="876" loading="lazy"></span>
      ${p.nouveau ? '<span class="card__new">Nouveau</span>' : ''}
      <span class="card__name">${esc(p.nom)}</span>
      <span class="card__meta"><span>${euros(p.prix)}</span><span class="dots">${p.couleurs.map((c) => `<i style="--c:${esc(c.hex)}" title="${esc(c.nom)}"></i>`).join('')}</span></span>
    </button>
  </li>`).join('')
grid.addEventListener('click', (e) => {
  const b = e.target.closest('.card__btn'); if (b) openQV(+b.dataset.i, $('img', b))
})
for (const c of $$('[data-f]')) {
  c.addEventListener('click', () => {
    for (const o of $$('[data-f]')) { o.classList.toggle('is-on', o === c); o.setAttribute('aria-pressed', String(o === c)) }
    for (const card of $$('.card', grid)) card.hidden = c.dataset.f !== 'tout' && card.dataset.fam !== c.dataset.f
  })
}

/* ---------- Aperçu rapide ---------- */
const qv = $('[data-qv]')
const qvImg = $('[data-qv-img]')
const sel = { i: 0, c: 0, view: 'face', size: null, origin: null }
const outside = () => [$('main'), $('.top'), $('.demo-bar'), $('.foot')]

function paintQV (swap) {
  const p = PIECES[sel.i]; const col = p.couleurs[sel.c]
  $('[data-qv-count]').textContent = `${String(sel.i + 1).padStart(2, '0')} / ${String(PIECES.length).padStart(2, '0')}`
  $('[data-qv-type]').textContent = `${p.type} · ${col.nom}`
  $('[data-qv-name]').textContent = p.nom
  $('[data-qv-price]').textContent = euros(p.prix)
  $('[data-qv-txt]').textContent = p.texte
  const views = $('[data-qv-views]')
  views.hidden = !col.dos
  for (const b of $$('button', views)) { const on = b.dataset.view === sel.view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)) }
  $('[data-qv-colors]').innerHTML = p.couleurs.length > 1
    ? p.couleurs.map((c, k) => `<button type="button" class="sw${k === sel.c ? ' is-on' : ''}" style="--c:${esc(c.hex)}" data-c="${k}" aria-pressed="${k === sel.c}" aria-label="${esc(c.nom)}"></button>`).join('')
    : ''
  $('[data-qv-sizes]').innerHTML = (p.tailles?.length ? p.tailles : TAILLES).map((t) => `<button type="button" class="size${t === sel.size ? ' is-on' : ''}" data-s="${t}" aria-pressed="${t === sel.size}">${t}</button>`).join('')
  $('[data-qv-err]').textContent = ''
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
  const dx = a.left + a.width / 2 - (b.left + b.width / 2)
  const dy = a.top + a.height / 2 - (b.top + b.height / 2)
  const s = a.width / b.width
  const from = { transform: `translate(${dx}px, ${dy}px) scale(${s})` }
  const to = { transform: 'none' }
  return qvImg.animate(reverse ? [to, from] : [from, to], { duration: reverse ? 380 : 560, easing: 'cubic-bezier(.2,.8,.2,1)', fill: reverse ? 'forwards' : 'none' }).finished
}

let lastFocus = null
function openQV (i, fromImg) {
  lastFocus = document.activeElement
  Object.assign(sel, { i, c: 0, view: 'face', size: null, origin: fromImg })
  qvOpen = true
  paintQV(false)
  qv.hidden = false
  document.documentElement.classList.add('qv-on')
  for (const el of outside()) el.inert = true
  if (fromImg) fromImg.style.visibility = 'hidden'
  requestAnimationFrame(() => {
    qv.classList.add('is-on')
    fly(fromImg).then(() => { if (fromImg) fromImg.style.visibility = '' })
    $('[data-qv-close]').focus({ preventScroll: true })
  })
}
async function closeQV () {
  if (!qvOpen) return
  const o = sel.origin
  const inView = o && o.isConnected && (() => { const r = o.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 })()
  qv.classList.remove('is-on')
  if (inView && sel.c === 0 && sel.view === 'face') {
    o.style.visibility = 'hidden'
    await fly(o, true)
    o.style.visibility = ''
  } else if (!reduce) await new Promise((r) => setTimeout(r, 250))
  qvImg.getAnimations().forEach((a) => a.cancel())
  qv.hidden = true
  qvOpen = false
  document.documentElement.classList.remove('qv-on')
  for (const el of outside()) el.inert = false
  lastFocus?.focus?.({ preventScroll: true })
}
function stepQV (d) {
  sel.i = (sel.i + d + PIECES.length) % PIECES.length
  Object.assign(sel, { c: 0, view: 'face', size: null, origin: $(`.piece__btn[data-i="${sel.i}"] img`) })
  paintQV(true)
}

$('[data-qv-close]').addEventListener('click', closeQV)
$('[data-qv-prev]').addEventListener('click', () => stepQV(-1))
$('[data-qv-next]').addEventListener('click', () => stepQV(1))
qv.addEventListener('click', (e) => {
  const v = e.target.closest('[data-view]'); if (v) { sel.view = v.dataset.view; paintQV(true) }
  const c = e.target.closest('[data-c]'); if (c) { sel.c = +c.dataset.c; sel.view = 'face'; paintQV(true) }
  const s = e.target.closest('[data-s]'); if (s) { sel.size = s.dataset.s; paintQV(false) }
  if (e.target === qv || e.target.classList.contains('qv__stage')) closeQV()
})
$('[data-qv-add]').addEventListener('click', () => {
  if (!sel.size) { $('[data-qv-err]').textContent = 'Choisissez une taille.'; $('[data-qv-sizes] button').focus(); return }
  addToCart(PIECES[sel.i].id, sel.c, sel.size)
  toast(`${esc(PIECES[sel.i].nom.split(',')[0])} ajouté au panier`)
})
addEventListener('keydown', (e) => {
  if (qvOpen) {
    if (e.key === 'Escape') closeQV()
    if (e.key === 'ArrowRight') stepQV(1)
    if (e.key === 'ArrowLeft') stepQV(-1)
    if (e.key === 'Tab') trap(e, qv)
  } else if (cartOpen) {
    if (e.key === 'Escape') closeCart()
    if (e.key === 'Tab') trap(e, cart)
  }
})
function trap (e, box) {
  const f = $$('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', box).filter((x) => x.offsetParent !== null)
  if (!f.length) return
  const first = f[0]; const last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

// Balayer l’aperçu sur téléphone.
let sx = null
qv.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX }, { passive: true })
qv.addEventListener('touchend', (e) => {
  if (sx == null) return
  const dx = e.changedTouches[0].clientX - sx; sx = null
  if (Math.abs(dx) > 60 && e.target.closest('.qv__stage')) stepQV(dx < 0 ? 1 : -1)
})

/* ---------- Panier ---------- */
const cart = $('[data-cart]')
const veil = $('[data-cart-veil]')
let items = store.get('comyx-panier', []).filter((x) => PIECES.some((p) => p.id === x.id))
let cartOpen = false

function addToCart (id, c, size) {
  const hit = items.find((x) => x.id === id && x.c === c && x.size === size)
  hit ? hit.q++ : items.push({ id, c, size, q: 1 })
  saveCart()
  const n = $('[data-bag-n]'); if (!reduce) n.animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 300 })
}
function saveCart () { store.set('comyx-panier', items); paintCart() }
function paintCart () {
  const n = items.reduce((s, x) => s + x.q, 0)
  const total = items.reduce((s, x) => s + x.q * (PIECES.find((p) => p.id === x.id)?.prix ?? 0), 0)
  $('[data-bag-n]').textContent = n
  $('[data-open-cart]').setAttribute('aria-label', `Ouvrir le panier, ${n} article${n > 1 ? 's' : ''}`)
  $('[data-cart-count]').textContent = n ? `(${n})` : ''
  $('[data-cart-total]').textContent = euros(total)
  const left = LIVRAISON_OFFERTE - total
  $('[data-ship-txt]').innerHTML = !n ? `Paiement en 3 fois sans frais avec Alma dès ${euros(LIVRAISON_OFFERTE)}.` : left > 0 ? `Encore <b>${euros(left)}</b> pour payer en 3 fois sans frais.` : '<b>Paiement en 3 fois sans frais disponible.</b>'
  $('[data-ship-bar]').style.width = `${Math.min(100, (total / LIVRAISON_OFFERTE) * 100)}%`
  $('[data-checkout]').disabled = !n
  $('[data-cart-list]').innerHTML = n
    ? items.map((x, k) => {
      const p = PIECES.find((q) => q.id === x.id); if (!p) return ''
      const col = p.couleurs[x.c] ?? p.couleurs[0]
      return `<li class="line">
        <img src="${esc(col.face)}" alt="" width="66" height="88">
        <div class="line__txt"><p class="line__name">${esc(p.nom)}</p><p class="line__meta">${esc(col.nom)} · ${esc(x.size)}</p>
          <div class="qty"><button type="button" data-q="${k}" data-d="-1" aria-label="Retirer un">−</button><span>${x.q}</span><button type="button" data-q="${k}" data-d="1" aria-label="Ajouter un">+</button></div></div>
        <div class="line__r"><p>${euros(p.prix * x.q)}</p><button type="button" class="lnk lnk--s" data-rm="${k}">Retirer</button></div>
      </li>`
    }).join('')
    : '<li class="empty">Votre panier est vide. Le portant vous attend.</li>'
}
$('[data-cart-list]').addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]'); const rm = e.target.closest('[data-rm]')
  if (q) { const it = items[+q.dataset.q]; it.q += +q.dataset.d; if (it.q < 1) items.splice(+q.dataset.q, 1); saveCart() }
  if (rm) { items.splice(+rm.dataset.rm, 1); saveCart() }
})
let cartFrom = null
function openCart () {
  cartFrom = document.activeElement
  cartOpen = true; veil.hidden = false; cart.inert = false; cart.setAttribute('aria-hidden', 'false')
  requestAnimationFrame(() => { veil.classList.add('is-on'); cart.classList.add('is-on') })
  $('[data-cart-close]').focus({ preventScroll: true })
}
function closeCart () {
  cartOpen = false; veil.classList.remove('is-on'); cart.classList.remove('is-on')
  cart.inert = true; cart.setAttribute('aria-hidden', 'true')
  setTimeout(() => { if (!cartOpen) veil.hidden = true }, 350)
  $('[data-cart-note]').textContent = ''
  cartFrom?.focus?.({ preventScroll: true })
}
$('[data-open-cart]').addEventListener('click', openCart)
$('[data-cart-close]').addEventListener('click', closeCart)
veil.addEventListener('click', closeCart)
$('[data-checkout]').addEventListener('click', () => {
  $('[data-cart-note]').textContent = 'Maquette : sur le site en ligne, ce bouton mène au paiement sécurisé (carte bancaire ou Alma).'
})
paintCart()

/* ---------- Petits éléments ---------- */
const tst = $('[data-toast]')
let tt
function toast (msg) {
  tst.innerHTML = `<span>${msg}</span><button type="button" class="lnk" data-toast-cart>Voir le panier</button>`
  tst.classList.add('is-on'); clearTimeout(tt)
  tt = setTimeout(() => tst.classList.remove('is-on'), 3200)
}
tst.addEventListener('click', async (e) => {
  if (!e.target.closest('[data-toast-cart]')) return
  tst.classList.remove('is-on')
  if (qvOpen) await closeQV()
  openCart()
})

const menuBtn = $('[data-open-menu]'); const menu = $('#menu')
menuBtn.addEventListener('click', () => {
  const open = menu.hidden; menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open))
})
menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false') } })

document.documentElement.classList.toggle('is-touch', touch.matches)
touch.addEventListener('change', () => document.documentElement.classList.toggle('is-touch', touch.matches))

/* ---------- Bandeau d'annonces (repris de comyx.fr) ---------- */
const annonces = ['Sortie d’une nouvelle collection chaque semaine !', 'La boutique est ouverte du mardi au samedi, de 10 h à 19 h à Amiens !',
  '-10 % sur votre première commande avec le code THANKYOU10, hors ventes privées et soldes', 'Réglez en 3 fois sans frais dès 100 € avec Alma !']
const annonce = $('[data-annonce]')
let ia = 0
if (annonce && !reduce) {
  setInterval(() => {
    ia = (ia + 1) % annonces.length
    annonce.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).onfinish = () => {
      annonce.textContent = annonces[ia]
      annonce.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
    }
  }, 4500)
}

// Liens du menu vers une catégorie
for (const a of $$('[data-menu-f]')) a.addEventListener('click', () => $(`[data-f="${a.dataset.menuF}"]`)?.click())
