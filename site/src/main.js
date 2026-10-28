import '@fontsource-variable/bodoni-moda/wght.css'
import '@fontsource-variable/bodoni-moda/wght-italic.css'
import '@fontsource-variable/archivo/wght.css'
import './styles.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ═════════ Réglages — À REMPLACER ═════════ */

// Service d'envoi du formulaire (Formspree, Getform…). Vide = ouverture d'un e-mail prérempli.
const FORM_ENDPOINT = ''
const CONTACT_EMAIL = 'contact@estalia-studio.com'

// Descente du hero : images générées depuis le plan « hero-descente-nuages-ville-interieur.mp4 ».
const pad = (n) => String(n).padStart(3, '0')
const FRAMES = {
  desktop: { count: 150, src: (i) => `media/hero/desktop/f_${pad(i + 1)}.webp` },
  mobile: { count: 90, src: (i) => `media/hero/mobile/f_${pad(i + 1)}.webp` }
}
// Légendes de la descente (progression 0 → 1 du hero).
const CHAPTERS = [
  [0, 'Au-dessus des nuages'],
  [0.32, 'À travers les nuages'],
  [0.5, 'La ville'],
  [0.68, 'Une rue, une fenêtre'],
  [0.84, 'À l’intérieur']
]
// Temps forts : texte + vidéo associée.
const MOMENTS = [
  { text: 'Film 20 s « Pour deux » · tourné début janvier', src: 'media/films/villa-san-peire-extrait.mp4', poster: 'media/images/calme-interieur-nuit.jpg', filter: 'saturate(1.05) sepia(0.12)' },
  { text: 'Portraits & produits, 30 s · tournés mi-avril', src: 'media/videos/metier-commerce-vitrine-et-produits.mp4', poster: 'media/videos/metier-commerce-vitrine-et-produits.jpg', filter: 'none' },
  { text: 'Film séjour 45 s + 3 formats verticaux · tourné en mai', src: 'media/films/film-camping-vallee-au-matin.mp4', poster: 'media/films/film-camping-vallee-au-matin.jpg', filter: 'saturate(1.1)' },
  { text: 'Film « nouvelle saison », 30 s · tourné fin août', src: 'media/videos/metier-agence-immobiliere-visite-villa.mp4', poster: 'media/videos/metier-agence-immobiliere-visite-villa.jpg', filter: 'none' },
  { text: '3 teasers de 10 s, montage rapide · tournés mi-octobre', src: 'media/videos/metier-commerce-vitrine-et-produits.mp4', poster: 'media/videos/metier-commerce-vitrine-et-produits.jpg', filter: 'grayscale(0.7) contrast(1.15) brightness(0.85)' },
  { text: 'Film des fêtes, 30 s · tourné début novembre', src: 'media/films/film-hotel-domaine-et-jardins.mp4', poster: 'media/films/film-hotel-domaine-et-jardins.jpg', filter: 'saturate(1.15) sepia(0.2) brightness(0.92)' }
]

/* ═════════ Contexte ═════════ */

const root = document.documentElement
root.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const small = matchMedia('(max-width: 767.98px)').matches
const touch = matchMedia('(pointer: coarse)').matches
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const vh = () => window.innerHeight

ScrollTrigger.config({ ignoreMobileResize: true })

/* ═════════ Scroll fluide ═════════ */

let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView()
}

/* ═════════ Vidéos : source posée au besoin, lecture uniquement à l'écran ═════════ */

const ensureSrc = (v) => { if (v.dataset.src && v.getAttribute('src') !== v.dataset.src) { v.src = v.dataset.src; v.load() } }
const play = (v) => { if (!v || reduce) return; ensureSrc(v); v.play()?.catch(() => {}) }
const managed = new Set()
const io = new IntersectionObserver((entries) => {
  for (const { target: v, isIntersecting } of entries) {
    if (managed.has(v)) continue
    isIntersecting ? play(v) : v.pause()
  }
}, { rootMargin: '25% 0px' })
$$('video[data-src]').forEach((v) => io.observe(v))

/* ═════════ 1. Hero : la descente, image par image ═════════ */

const canvas = $('.hero__canvas')
const ctx = canvas.getContext('2d', { alpha: false })
const seq = small ? FRAMES.mobile : FRAMES.desktop
const frames = new Array(seq.count)
const state = { frame: 0 }
let drawn = -1

const loadFrame = (i) => new Promise((resolve) => {
  const img = new Image()
  img.decoding = 'async'
  img.onload = () => { frames[i] = img; resolve() }
  img.onerror = resolve
  img.src = seq.src(i)
})
function draw () {
  let i = Math.round(state.frame)
  while (i > 0 && !frames[i]) i--
  if (!frames[i] || i === drawn) return
  drawn = i
  const img = frames[i]; const cw = canvas.width; const ch = canvas.height
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
  const w = img.naturalWidth * s; const h = img.naturalHeight * s
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
}
const sizeCanvas = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5)
  canvas.width = Math.round(canvas.clientWidth * dpr)
  canvas.height = Math.round(canvas.clientHeight * dpr)
  drawn = -1; draw()
}
const preload = async (onProgress) => {
  await loadFrame(0); sizeCanvas()
  const first = []; const rest = []
  for (let i = 1; i < seq.count; i++) (i % 5 === 0 ? first : rest).push(i)
  let done = 0
  await Promise.all(first.map((i) => loadFrame(i).then(() => onProgress(++done / first.length))))
  const queue = rest.slice()
  const worker = async () => { while (queue.length) { await loadFrame(queue.shift()); drawn = -1; draw() } }
  for (let k = 0; k < 4; k++) worker()
}
let rz = 0
window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(sizeCanvas) })

function hero () {
  const chapter = $('[data-chapter]')
  let current = 0
  const setChapter = (p) => {
    let k = 0
    CHAPTERS.forEach(([at], i) => { if (p >= at) k = i })
    if (k === current) return
    current = k
    gsap.to(chapter, { opacity: 0, y: -6, duration: 0.25, ease: 'power2.in', onComplete: () => {
      chapter.textContent = CHAPTERS[k][1]
      gsap.fromTo(chapter, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' })
    } })
  }
  if (reduce) return
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: () => '+=' + vh() * (small ? 3.4 : 5),
      pin: true, scrub: touch ? 0.6 : true,
      onUpdate: (self) => setChapter(self.progress)
    }
  })
  tl.to(state, { frame: seq.count - 1, ease: 'none', duration: 1, onUpdate: draw }, 0)
    .to('.hero__cue', { autoAlpha: 0, duration: 0.04 }, 0)
    .to('.hero__center', { autoAlpha: 0, y: -40, ease: 'power2.in', duration: 0.12 }, 0.08)
    .to('.hero__veil', { opacity: 0, duration: 0.1 }, 0.12)
    .to('.hero__veil', { opacity: 1, background: 'rgba(10, 12, 17, 0.38)', duration: 0.06 }, 0.86)
    .to('.hero__end', { opacity: 1, duration: 0.06, ease: 'none' }, 0.88)
    .fromTo('.hero__end', { y: 30 }, { y: 0, duration: 0.08, ease: 'power2.out' }, 0.88)
}

function heroIntro () {
  if (reduce) { gsap.from('.hero__center', { opacity: 0, duration: 0.6 }); return }
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__canvas', { scale: 1.1, duration: 2.6, ease: 'power3.out' }, 0)
    .from('.logo', { opacity: 0, letterSpacing: '1.2em', duration: 2 }, 0.2)
    .from('.hero__title', { opacity: 0, y: 30, filter: 'blur(8px)', duration: 1.6 }, 0.45)
    .from('.hero__chapter, .hero__cue', { opacity: 0, duration: 1 }, 1.1)
}

/* ═════════ Respirations : lignes masquées, image qui s'ouvre ═════════ */

function calm () {
  $$('[data-lines]').forEach((el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i)
    el.innerHTML = parts.map((p) => `<span class="ln" style="display:block;overflow:hidden;padding-bottom:.08em"><span style="display:inline-block">${p.trim()}</span></span>`).join('')
    if (reduce) return
    gsap.from($$('.ln > span', el), {
      yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 80%' }
    })
  })
  if (reduce) return
  $$('[data-clip]').forEach((fig) => {
    gsap.fromTo(fig, { clipPath: 'inset(22% 12% 22% 12%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top 95%', end: 'center 55%', scrub: true }
    })
    gsap.fromTo($('img', fig), { scale: 1.18 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true }
    })
  })
}

/* ═════════ 3. ESTALIA : le ciel dans les lettres, puis on traverse le « I » ═════════ */

function sign () {
  const svg = $('.sign__mask')
  const text = $('text', svg)
  const video = $('.sign__video')
  managed.add(video)
  new IntersectionObserver(([e]) => (e.isIntersecting ? play(video) : video.pause()), { rootMargin: '20% 0px' }).observe($('.sign'))
  if (reduce) return

  // centre du fût du « I » (6e lettre), en pixels dans la boîte du SVG
  const target = () => {
    gsap.set(svg, { scale: 1 })
    const box = svg.getBoundingClientRect()
    let cx = box.width * 0.705; let cy = box.height * 0.5; let stem = box.width * 0.03
    try {
      const r = text.getExtentOfChar(5)
      const m = svg.getScreenCTM()
      const p = new DOMPoint(r.x + r.width / 2, r.y + r.height * 0.62).matrixTransform(m)
      cx = p.x - box.left; cy = p.y - box.top; stem = r.width * m.a * 0.32
    } catch {}
    return { cx, cy, stem }
  }
  let t = target()
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.sign', start: 'top top', end: () => '+=' + vh() * (small ? 1.8 : 2.6),
      pin: true, scrub: touch ? 0.5 : true, invalidateOnRefresh: true,
      onRefreshInit: () => { t = target() }
    }
  })
  tl.to('.sign__caption', { autoAlpha: 0, y: 20, duration: 0.15 }, 0.05)
    .fromTo(svg, { scale: 1 }, {
      scale: () => Math.max(window.innerWidth / t.stem, 20) * 3.2,
      transformOrigin: () => `${t.cx}px ${t.cy}px`,
      ease: 'expo.in', duration: 1
    }, 0.1)
    .set(svg, { autoAlpha: 0 }, 1.1)
    .fromTo(video, { scale: 1.3, yPercent: -12 }, { scale: 1, yPercent: 0, ease: 'power2.out', duration: 1 }, 0.1)
}

/* ═════════ 4. Métiers : un univers plein écran par métier ═════════ */

function trades () {
  const layers = $$('[data-trade]')
  const names = $$('[data-name]')
  const sky = $('.trades__layer.is-sky video')
  const count = $('[data-count]')
  const vids = [sky, ...layers.map((l) => $('video', l))]
  vids.forEach((v) => managed.add(v))
  layers.forEach((l, i) => l.setAttribute('data-label', names[i].textContent))

  let inView = false; let active = 0
  const sync = () => vids.forEach((v, i) => (inView && Math.abs(i - active) <= 1 ? play(v) : v.pause()))
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() }, { rootMargin: '10% 0px' }).observe($('.trades'))
  if (reduce) { inView = true; return }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.trades', start: 'top top', end: () => '+=' + vh() * (small ? 3 : 4.2),
      pin: true, scrub: touch ? 0.5 : true,
      onUpdate: (self) => {
        const k = Math.min(3, Math.floor(self.progress * 4.3 - 0.15))
        const a = Math.max(0, k) + 1
        if (a !== active) { active = a; sync(); count.textContent = pad(a).slice(1) }
      }
    }
  })
  gsap.set(names.map((n) => $('span', n)), { yPercent: 110, opacity: 1 })
  tl.to('.trades__count', { opacity: 1, duration: 0.2 }, 0.2)
  layers.forEach((layer, i) => {
    const at = i * 1 + 0.1
    tl.fromTo(layer, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.inOut' }, at)
      .to($('span', names[i]), { yPercent: 0, duration: 0.4, ease: 'expo.out' }, at + 0.35)
    if (i < layers.length - 1) tl.to($('span', names[i]), { yPercent: -110, duration: 0.3, ease: 'power2.in' }, at + 0.95)
  })
  tl.to({}, { duration: 0.3 })
}

/* ═════════ 5. Offres : aperçu vidéo qui suit le curseur ═════════ */

function offers () {
  if (!fine || reduce) return
  const box = $('.offers__preview')
  const v = $('video', box)
  const x = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' })
  const y = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' })
  $$('.offers__list li').forEach((li) => {
    li.addEventListener('pointerenter', (e) => {
      gsap.set(box, { x: e.clientX, y: e.clientY })
      if (v.getAttribute('src') !== li.dataset.preview) v.src = li.dataset.preview
      v.play()?.catch(() => {})
      box.classList.add('is-on')
    })
    li.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY) })
    li.addEventListener('pointerleave', () => { box.classList.remove('is-on'); v.pause() })
  })
}

/* ═════════ 6. Films : le cadre s'ouvre jusqu'au plein écran ═════════ */

function films () {
  if (reduce) return
  const isSmall = small
  gsap.fromTo('.films__frame', { clipPath: isSmall ? 'inset(24% 8% 30% 8%)' : 'inset(18% 22% 18% 22%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
    scrollTrigger: { trigger: '.films__feature', start: 'top 85%', end: 'top top', scrub: true }
  })
  gsap.from('.films__meta > *', {
    opacity: 0, y: 30, duration: 1.2, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.films__feature', start: 'top 15%' }
  })
}

function player () {
  const dlg = $('.player'); const v = $('video', dlg)
  let opener = null
  $$('[data-film]').forEach((b) => b.addEventListener('click', () => {
    opener = b
    v.src = b.dataset.film
    dlg.setAttribute('aria-label', 'Lecture : ' + (b.dataset.title || 'film'))
    dlg.showModal(); lenis?.stop()
    v.muted = false
    v.play()?.catch(() => {})
  }))
  $('.player__close', dlg).addEventListener('click', () => dlg.close())
  dlg.addEventListener('close', () => {
    v.pause(); v.removeAttribute('src'); v.load()
    lenis?.start(); opener?.focus({ preventScroll: true })
  })
}

/* ═════════ 7. Saisons (onglets accessibles) ═════════ */

function seasons () {
  const tabs = $$('[role="tab"]')
  const detail = $('#season-detail')
  const box = $('.seasons__video'); const v = $('video', box)
  let cur = 0; let timer = 0
  v.style.filter = MOMENTS[0].filter
  const select = (i, focus) => {
    if (i === cur) return
    cur = i
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1 })
    detail.setAttribute('aria-labelledby', tabs[i].id)
    detail.textContent = MOMENTS[i].text
    if (focus) tabs[i].focus()
    box.classList.add('is-switching')
    clearTimeout(timer)
    timer = setTimeout(() => {
      const m = MOMENTS[i]
      v.poster = m.poster; v.style.filter = m.filter
      if (v.dataset.src !== m.src) { v.dataset.src = m.src; play(v) }
      box.classList.remove('is-switching')
    }, reduce ? 0 : 260)
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i))
    t.addEventListener('keydown', (e) => {
      const n = tabs.length
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
      if (step) { e.preventDefault(); select((cur + step + n) % n, true) }
      if (e.key === 'Home') { e.preventDefault(); select(0, true) }
      if (e.key === 'End') { e.preventDefault(); select(n - 1, true) }
    })
  })
}

/* ═════════ 10. Contact : le ciel remonte ═════════ */

function contact () {
  if (reduce) return
  gsap.fromTo('.contact__sky', { yPercent: -10, scale: 1.15 }, {
    yPercent: 0, scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top top', scrub: true }
  })
  gsap.from('.footer__word', {
    yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer', start: 'top 85%' }
  })
}

function reveals () {
  const els = $$('.calm .label, .offers__list li, .pricing__list li, .faq details, .films__more .film, .seasons__body, .contact__title, .form, .contact__mail')
  els.forEach((el) => el.setAttribute('data-reveal', ''))
  if (reduce) return
  ScrollTrigger.batch(els, {
    start: 'top 90%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, overwrite: true })
  })
}

/* ═════════ Navigation ═════════ */

const nav = $('[data-nav]')
const menu = $('#menu')
const menuBtn = $('.nav__menu')
let menuOpen = false

function navTriggers () {
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll()
      nav.classList.toggle('at-hero', y < vh() * 0.5)
      nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > vh() * 0.5)
    }
  })
}
const setMenu = (open) => {
  menuOpen = open
  menuBtn.setAttribute('aria-expanded', String(open))
  menuBtn.textContent = open ? 'Fermer' : 'Menu'
  if (open) {
    menu.hidden = false
    requestAnimationFrame(() => menu.classList.add('is-open'))
    lenis?.stop(); nav.classList.remove('is-hidden')
    $('a', menu).focus({ preventScroll: true })
  } else {
    menu.classList.remove('is-open'); lenis?.start()
    setTimeout(() => { if (!menuOpen) menu.hidden = true }, 350)
  }
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus() } })
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href')
  const target = id === '#top' ? 0 : id.length > 1 ? $(id) : null
  if (target === null) return
  e.preventDefault()
  if (a.dataset.plan) $('#f-formule').value = a.dataset.plan
  if (menuOpen) setMenu(false)
  scrollTo(target)
  if (target !== 0) { target.setAttribute('tabindex', '-1'); setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1800 : 0) }
  history.replaceState(null, '', id)
})

/* ═════════ Formulaire ═════════ */

function form () {
  const f = $('.form'); const status = $('.form__status', f)
  const rules = [
    ['#f-nom', '#f-nom-err', (el) => el.value.trim().length >= 2 || 'Indiquez votre nom.'],
    ['#f-email', '#f-email-err', (el) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) || 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.'],
    ['#f-metier', '#f-metier-err', (el) => !!el.value || 'Choisissez votre activité.'],
    ['[name="consentement"]', '#f-consent-err', (el) => el.checked || 'Cochez cette case pour que nous puissions vous répondre.']
  ]
  const check = ([s, e, test]) => {
    const el = $(s, f); const err = $(e, f); const res = test(el); const ok = res === true
    el.setAttribute('aria-invalid', String(!ok)); el.setAttribute('aria-describedby', err.id)
    err.textContent = ok ? '' : res
    return ok
  }
  rules.forEach((r) => {
    const el = $(r[0], f)
    el.addEventListener('blur', () => { if (el.value && el.type !== 'checkbox') check(r) })
    for (const ev of ['input', 'change']) el.addEventListener(ev, () => { if (el.getAttribute('aria-invalid') === 'true') check(r) })
  })
  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const bad = rules.map(check).indexOf(false)
    if (bad > -1) { $(rules[bad][0], f).focus(); return }
    const data = new FormData(f); const btn = $('button[type="submit"]', f)
    btn.disabled = true
    if (FORM_ENDPOINT) {
      status.textContent = 'Envoi en cours…'
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error()
        f.classList.add('is-sent')
        status.textContent = 'Merci. Nous revenons vers vous sous 48 h ouvrées.'
      } catch {
        status.textContent = `L’envoi n’a pas abouti. Réessayez, ou écrivez-nous à ${CONTACT_EMAIL}.`
        btn.disabled = false
      }
      return
    }
    const body = [`Nom : ${data.get('nom')}`, `E-mail : ${data.get('email')}`, `Activité : ${data.get('activite')}`,
      `Formule : ${data.get('formule') || 'À définir'}`, '', data.get('message') || ''].join('\n')
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Demande de devis — ' + data.get('activite'))}&body=${encodeURIComponent(body)}`
    status.textContent = `Votre messagerie devrait s’ouvrir avec la demande préremplie. Sinon, écrivez-nous à ${CONTACT_EMAIL}.`
    btn.disabled = false
  })
}

/* ═════════ Démarrage (ScrollTriggers créés dans l'ordre de la page) ═════════ */

hero()
calm()
sign()
trades()
films()
contact()
reveals()
navTriggers()
offers()
seasons()
player()
form()

const loader = $('.loader')
const bar = $('.loader__bar i')
const finish = () => {
  if (root.classList.contains('is-loaded')) return
  root.classList.add('is-loaded')
  lenis?.start()
  gsap.to(loader, { opacity: 0, duration: reduce ? 0.01 : 0.9, ease: 'power2.out', onComplete: () => loader.remove() })
  heroIntro()
}
lenis?.stop()
preload((p) => gsap.to(bar, { scaleX: p, duration: 0.3, ease: 'power2.out' }))
  .then(() => document.fonts.ready)
  .then(() => { ScrollTrigger.refresh(); finish() })
setTimeout(finish, 4500)
