import '@fontsource-variable/bodoni-moda/wght.css'
import '@fontsource-variable/bodoni-moda/wght-italic.css'
import '@fontsource-variable/archivo/wght.css'
import './styles.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ═════════ Réglages — À REMPLACER ═════════ */

// Adresse d'envoi du formulaire (Formspree, Getform, Basin…). Vide = ouverture d'un e-mail prérempli.
const FORM_ENDPOINT = ''
const CONTACT_EMAIL = 'contact@estalia-studio.com'

// Séquences d'images du hero (générées par `npm run frames -- hero.mp4`).
const pad = (n) => String(n).padStart(3, '0')
const FRAMES = {
  desktop: { count: 120, src: (i) => `media/frames/desktop/f_${pad(i + 1)}.webp` },
  mobile: { count: 72, src: (i) => `media/frames/mobile/f_${pad(i + 1)}.webp` }
}

// Calendrier des temps forts : texte + vidéo associée.
const MOMENTS = [
  {
    when: 'Tournage conseillé : début janvier',
    title: 'Pour deux.',
    text: 'Coffrets, dîners, week-ends en amoureux : un film chaleureux qui donne une idée de cadeau, ou une raison de réserver.',
    video: 'Film 20 s + 2 formats verticaux',
    for: 'Restaurants, hôtels, chocolatiers, fleuristes',
    src: 'media/videos/notaire.mp4', poster: 'media/images/notaire.jpg',
    filter: 'saturate(1.05) sepia(0.12) hue-rotate(-8deg)'
  },
  {
    when: 'Tournage conseillé : mi-avril',
    title: 'Merci, maman.',
    text: 'Le bouquet qu’on compose, le bijou qu’on emballe, la table qu’on réserve : des portraits produits tout en douceur.',
    video: 'Film 30 s « portraits & produits »',
    for: 'Fleuristes, bijoutiers, instituts, restaurants',
    src: 'media/videos/commerce.mp4', poster: 'media/images/commerce.jpg',
    filter: 'saturate(0.95) brightness(1.04)'
  },
  {
    when: 'Tournage conseillé : avril à mai',
    title: 'La saison commence ici.',
    text: 'La lumière du matin, la piscine, les soirées en terrasse : le film qui remplit les dernières semaines encore libres.',
    video: 'Film séjour 45 s + 3 formats verticaux',
    for: 'Campings, hôtels, terrasses, glaciers',
    src: 'media/videos/camping.mp4', poster: 'media/images/camping.jpg',
    filter: 'saturate(1.1)'
  },
  {
    when: 'Tournage conseillé : fin août',
    title: 'Nouvelle saison.',
    text: 'Nouveaux mandats, nouvelles collections, nouveaux horaires : on relance l’envie quand tout le monde revient.',
    video: 'Film 30 s « nouvelle saison »',
    for: 'Agences immobilières, commerces, études',
    src: 'media/videos/immo.mp4', poster: 'media/images/immo.jpg',
    filter: 'none'
  },
  {
    when: 'Tournage conseillé : mi-octobre',
    title: 'Trois jours, pas plus.',
    text: 'Des teasers courts et rythmés pour annoncer vos offres, sans brader l’image de votre maison.',
    video: '3 teasers de 10 s, montage rapide',
    for: 'Commerces, boutiques en ligne, instituts',
    src: 'media/videos/commerce.mp4', poster: 'media/images/commerce.jpg',
    filter: 'grayscale(0.7) contrast(1.15) brightness(0.85)'
  },
  {
    when: 'Tournage conseillé : début novembre',
    title: 'Les fêtes chez vous.',
    text: 'Vitrines illuminées, menus de fêtes, cartes cadeaux : le film qu’on partage et qui fait venir en décembre.',
    video: 'Film 30 s + carte cadeau animée',
    for: 'Tous commerces, hôtels, restaurants',
    src: 'media/videos/hotel.mp4', poster: 'media/images/hotel.jpg',
    filter: 'saturate(1.15) sepia(0.2) hue-rotate(-12deg) brightness(0.92)'
  }
]

/* ═════════ Contexte ═════════ */

const root = document.documentElement
root.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const small = matchMedia('(max-width: 767.98px)').matches
const touch = matchMedia('(pointer: coarse)').matches
const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]

ScrollTrigger.config({ ignoreMobileResize: true })

/* ═════════ Scroll fluide (Lenis) ═════════ */

let lenis = null
if (!reduce) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

const scrollTo = (target) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView())
}

/* ═════════ Vidéos : chargement paresseux, lecture seulement à l'écran ═════════ */

const ensureSrc = (v) => {
  if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load() }
}
const play = (v) => {
  if (reduce) return
  ensureSrc(v)
  const p = v.play()
  if (p) p.catch(() => {})
}

const videoIO = new IntersectionObserver((entries) => {
  for (const { target: v, isIntersecting } of entries) {
    if (isIntersecting) play(v)
    else v.pause()
  }
}, { rootMargin: '200px 0px' })
$$('video[data-src]').forEach((v) => { if (!v.closest('.trades__media')) videoIO.observe(v) })

/* ═════════ Hero : vidéo image par image dans un canvas ═════════ */

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

const sizeCanvas = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5)
  const { clientWidth: w, clientHeight: h } = canvas
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  drawn = -1
  draw()
}

function draw () {
  const target = Math.round(state.frame)
  // image la plus proche déjà chargée
  let i = target
  while (i > 0 && !frames[i]) i--
  if (!frames[i]) return
  if (i === drawn) return
  drawn = i
  const img = frames[i]
  const cw = canvas.width; const ch = canvas.height
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
  const w = img.naturalWidth * s; const h = img.naturalHeight * s
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
}

const preload = async (onProgress) => {
  await loadFrame(0)
  sizeCanvas()
  // une image sur 6 d'abord (le scroll est utilisable très vite), puis le reste
  const first = []; const rest = []
  for (let i = 1; i < seq.count; i++) (i % 6 === 0 ? first : rest).push(i)
  let done = 1
  const total = first.length + 1
  await Promise.all(first.map((i) => loadFrame(i).then(() => onProgress(++done / total))))
  const queue = rest.slice()
  const worker = async () => { while (queue.length) { await loadFrame(queue.shift()); drawn = -1; draw() } }
  Promise.all([worker(), worker(), worker(), worker()])
}

let resizeRaf = 0
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(sizeCanvas)
})

/* ═════════ Animations au scroll ═════════ */

function heroScroll () {
  if (reduce) return
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: () => '+=' + window.innerHeight * (small ? 1.6 : 2.4),
      pin: true,
      scrub: touch ? 0.6 : true,
      onUpdate: () => draw()
    }
  })
  tl.to(state, { frame: seq.count - 1, ease: 'none', duration: 1, onUpdate: draw }, 0)
    .to('.hero__cue', { autoAlpha: 0, duration: 0.08 }, 0)
    .to('.hero__bars i', { scaleY: 0, ease: 'power2.inOut', duration: 0.3 }, 0)
    .to('.hero__center', { autoAlpha: 0, y: -60, scale: 0.96, ease: 'power2.in', duration: 0.3 }, 0.42)
    .to('.hero__shade', { opacity: 0.6, duration: 0.3 }, 0.42)
    .to('.hero__canvas', { opacity: 0.25, ease: 'power1.in', duration: 0.2 }, 0.8)
}

function heroIntro () {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  if (reduce) {
    tl.from('.hero__center', { opacity: 0, duration: 0.6, ease: 'power1.out' })
    return
  }
  tl.from('.hero__canvas', { scale: 1.08, duration: 2.4, ease: 'power3.out' }, 0)
    .from('.hero__logo', { opacity: 0, y: 16, duration: 1.4 }, 0.2)
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.5, stagger: 0.12 }, 0.3)
    .from('.hero__cta', { opacity: 0, y: 16, duration: 1.2 }, 0.8)
    .from('.hero__cue', { opacity: 0, duration: 1 }, 1.1)
}

function manifesto () {
  const el = $('[data-words]')
  const words = el.textContent.trim().split(/\s+/)
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ')
  el.setAttribute('aria-label', words.join(' '))
  if (reduce) return
  gsap.to($$('.w', el), {
    opacity: 1,
    stagger: 0.1,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true }
  })
}

function portal () {
  if (reduce) return
  const mask = $('.portal__mask')
  const cover = () => {
    const r = mask.getBoundingClientRect()
    const w = r.width / (gsap.getProperty(mask, 'scale') || 1)
    const h = r.height / (gsap.getProperty(mask, 'scale') || 1)
    // l'arche doit dépasser largement l'écran, coins arrondis compris
    return Math.max(window.innerWidth / w, window.innerHeight / h) * 2.4
  }
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.portal',
      start: 'top top',
      end: () => '+=' + window.innerHeight * (small ? 1.3 : 1.8),
      pin: true,
      scrub: touch ? 0.5 : true,
      invalidateOnRefresh: true
    }
  })
  const away = small ? { l: { yPercent: -120 }, r: { yPercent: 120 } } : { l: { xPercent: -40 }, r: { xPercent: 40 } }
  tl.to('.portal__word--l', { ...away.l, autoAlpha: 0, ease: 'power2.in', duration: 0.45 }, 0)
    .to('.portal__word--r', { ...away.r, autoAlpha: 0, ease: 'power2.in', duration: 0.45 }, 0)
    .to('.portal__caption', { autoAlpha: 0, duration: 0.2 }, 0)
    .to(mask, { scale: cover, ease: 'power3.in', duration: 1 }, 0)
    .to('.portal__img', { scale: 1, ease: 'power2.out', duration: 1 }, 0)
    .set(mask, { autoAlpha: 0 }, 1)
    .to('.portal__after', { opacity: 1, duration: 0.3 }, 0.92)
    .from('.portal__after > *', { y: 48, stagger: 0.06, duration: 0.3, ease: 'power2.out' }, 0.92)
    .to({}, { duration: 0.25 })
}

function trades () {
  const items = $$('.trade')
  const figs = $$('.trades__frame')
  const num = $('[data-trade-num]')
  const vids = figs.map((f) => $('video', f))
  let current = -1

  const activate = (i) => {
    if (i === current) return
    figs.forEach((f, k) => {
      f.classList.toggle('was-active', k === current)
      f.classList.toggle('is-active', k === i)
    })
    items.forEach((it, k) => it.classList.toggle('is-active', k === i))
    num.textContent = pad(i + 1).slice(1)
    if (inView) { play(vids[i]); const prev = vids[current]; if (prev) setTimeout(() => prev.pause(), 1200) }
    current = i
  }

  let inView = false
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting
    if (inView) play(vids[Math.max(current, 0)])
    else vids.forEach((v) => v.pause())
  }).observe($('.trades__media'))

  items.forEach((it, i) => {
    ScrollTrigger.create({
      trigger: it,
      start: small ? 'top 75%' : 'top 55%',
      end: small ? 'bottom 75%' : 'bottom 55%',
      onToggle: (self) => self.isActive && activate(i)
    })
  })
  activate(0)
}

function depth () {
  if (reduce) return
  const k = small ? 0.5 : 1
  $$('.depth__layer').forEach((layer) => {
    const s = parseFloat(layer.dataset.speed) * k
    gsap.fromTo(layer, { y: () => (-s * window.innerHeight) / 100 }, {
      y: () => (s * window.innerHeight) / 100,
      ease: 'none',
      scrollTrigger: { trigger: '.depth', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    })
  })
}

function giant () {
  if (reduce) return
  gsap.fromTo('.giant__mask', { scale: 1.3 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.giant', start: 'top bottom', end: 'bottom 75%', scrub: true }
  })
  gsap.fromTo('.giant video', { yPercent: -8 }, {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
  })
}

function reveals () {
  const sel = [
    '.section-head > *', '.section-head > div > *', '.offer', '.plan', '.faq details',
    '.film', '.quote__intro > *', '.form', '.footer__cols > *', '.manifesto__facts li', '.moments__wrap'
  ].join(',')
  const els = $$(sel)
  els.forEach((el) => el.setAttribute('data-reveal', ''))
  if (reduce) return
  ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, overwrite: true })
  })
}

/* ═════════ Timecode : la page se lit comme un film ═════════ */

function hud () {
  const el = $('.hud')
  if (getComputedStyle(el).display === 'none') return
  const scene = $('[data-hud-scene]', el)
  const tc = $('[data-hud-tc]', el)
  const scenes = [
    ['.hero', 'Ouverture'], ['.manifesto', 'Le studio'], ['.portal', 'Entrée'], ['#metiers', 'Métiers'],
    ['.depth', 'Profondeur'], ['#offres', 'Offres'], ['#temps-forts', 'Temps forts'], ['#films', 'Films'],
    ['#tarifs', 'Tarifs'], ['#faq', 'Questions'], ['#devis', 'Devis'], ['.footer', 'Générique']
  ]
  scenes.forEach(([sel, name], i) => ScrollTrigger.create({
    trigger: sel, start: 'top 50%', end: 'bottom 50%',
    onToggle: (self) => { if (self.isActive) scene.textContent = `Sc. ${pad(i + 1).slice(1)} — ${name}` }
  }))
  const TOTAL = 3 * 60 * 25 // la page entière = un film de 3 minutes à 25 i/s
  const two = (n) => String(n).padStart(2, '0')
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const f = Math.round(self.progress * TOTAL)
      tc.textContent = `00:${two(Math.floor(f / 1500))}:${two(Math.floor(f / 25) % 60)}:${two(f % 25)}`
      el.classList.toggle('is-on', self.scroll() > 40)
    }
  })
}

/* ═════════ Navigation ═════════ */

const nav = $('[data-nav]')
const bar = $('.progress span')
const menu = $('#menu')
const burger = $('.nav__burger')
let menuOpen = false

function navTriggers () {
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll()
    nav.classList.toggle('is-scrolled', y > 40)
    nav.classList.toggle('at-hero', y < window.innerHeight * (reduce ? 0.6 : 1.2))
    nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > window.innerHeight * 0.8)
    gsap.set(bar, { scaleX: self.progress })
  }
})

$$('.nav__links a').forEach((a) => {
  const section = $(a.getAttribute('href'))
  if (!section) return
  ScrollTrigger.create({
    trigger: section,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => a.classList.toggle('is-current', self.isActive)
  })
})
}

const setMenu = (open) => {
  menuOpen = open
  burger.setAttribute('aria-expanded', String(open))
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu')
  if (open) {
    menu.hidden = false
    requestAnimationFrame(() => menu.classList.add('is-open'))
    lenis?.stop()
    nav.classList.remove('is-hidden')
    $('a', menu).focus({ preventScroll: true })
  } else {
    menu.classList.remove('is-open')
    lenis?.start()
    setTimeout(() => { if (!menuOpen) menu.hidden = true }, 300)
  }
}
burger.addEventListener('click', () => setMenu(!menuOpen))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus() } })

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href')
  const target = id === '#top' ? 0 : id.length > 1 && $(id)
  if (target === false || target === null) return
  e.preventDefault()
  if (a.dataset.plan) $('#f-formule').value = a.dataset.plan
  if (menuOpen) setMenu(false)
  scrollTo(target)
  if (target !== 0) {
    target.setAttribute('tabindex', '-1')
    setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1600 : 0)
  }
  history.replaceState(null, '', id)
})

/* ═════════ Temps forts (onglets accessibles) ═════════ */

function moments () {
  const tabs = $$('[role="tab"]')
  const panel = $('#moment-panel')
  const vbox = $('.moments__video')
  const info = $('.moments__info')
  const video = $('video', vbox)
  const fields = Object.fromEntries($$('[data-m]', info).map((el) => [el.dataset.m, el]))
  let current = 0
  let timer = 0

  const select = (i, focus = false) => {
    if (i === current) return
    current = i
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i))
      t.tabIndex = k === i ? 0 : -1
    })
    panel.setAttribute('aria-labelledby', tabs[i].id)
    if (focus) tabs[i].focus()
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
    vbox.classList.add('is-switching'); info.classList.add('is-switching')
    clearTimeout(timer)
    timer = setTimeout(() => {
      const m = MOMENTS[i]
      for (const key of ['when', 'title', 'text', 'video', 'for']) fields[key].textContent = m[key]
      video.poster = m.poster
      video.style.filter = m.filter
      if (video.dataset.src !== m.src) {
        video.dataset.src = m.src
        video.removeAttribute('src')
        play(video)
      }
      vbox.classList.remove('is-switching'); info.classList.remove('is-switching')
    }, reduce ? 0 : 260)
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i))
    t.addEventListener('keydown', (e) => {
      const n = tabs.length
      const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
      if (e.key in map) { e.preventDefault(); select((current + map[e.key] + n) % n, true) }
      if (e.key === 'Home') { e.preventDefault(); select(0, true) }
      if (e.key === 'End') { e.preventDefault(); select(n - 1, true) }
    })
  })
  video.style.filter = MOMENTS[0].filter
}

/* ═════════ Films : lecteur plein écran ═════════ */

function lightbox () {
  const dlg = $('.lightbox')
  const player = $('video', dlg)
  let opener = null
  $$('.film').forEach((btn) => btn.addEventListener('click', () => {
    opener = btn
    player.src = btn.dataset.full
    dlg.showModal()
    lenis?.stop()
    player.play().catch(() => {})
  }))
  const close = () => dlg.open && dlg.close()
  $('.lightbox__close', dlg).addEventListener('click', close)
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close() })
  dlg.addEventListener('close', () => {
    player.pause(); player.removeAttribute('src'); player.load()
    lenis?.start()
    opener?.focus({ preventScroll: true })
  })
}

/* ═════════ Formulaire de devis ═════════ */

function form () {
  const f = $('.form')
  const status = $('.form__status', f)
  const rules = [
    ['#f-nom', '#f-nom-err', (el) => el.value.trim().length >= 2 || 'Indiquez votre nom.'],
    ['#f-email', '#f-email-err', (el) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) || 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.'],
    ['#f-metier', '#f-metier-err', (el) => !!el.value || 'Choisissez votre activité.'],
    ['[name="consentement"]', '#f-consent-err', (el) => el.checked || 'Merci de cocher cette case pour que nous puissions vous répondre.']
  ]
  const check = ([s, e, test], show = true) => {
    const el = $(s, f); const err = $(e, f)
    const res = test(el)
    const ok = res === true
    if (show) {
      el.setAttribute('aria-invalid', String(!ok))
      el.setAttribute('aria-describedby', err.id)
      err.textContent = ok ? '' : res
    }
    return ok
  }
  rules.forEach((r) => {
    const el = $(r[0], f)
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid')) check(r) })
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(r) })
    el.addEventListener('change', () => { if (el.getAttribute('aria-invalid') === 'true') check(r) })
  })

  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    const results = rules.map((r) => check(r))
    const firstBad = results.indexOf(false)
    if (firstBad > -1) { $(rules[firstBad][0], f).focus(); return }

    const data = new FormData(f)
    const needs = data.getAll('besoin').join(', ') || 'Non précisé'
    const btn = $('button[type="submit"]', f)
    btn.disabled = true

    if (FORM_ENDPOINT) {
      status.textContent = 'Envoi en cours…'
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error()
        f.classList.add('is-sent')
        status.textContent = 'Merci ! Votre demande est bien partie. Nous revenons vers vous sous 48 h ouvrées.'
      } catch {
        status.textContent = `L’envoi n’a pas abouti. Réessayez, ou écrivez-nous à ${CONTACT_EMAIL}.`
        btn.disabled = false
      }
      return
    }

    const body = [
      `Nom : ${data.get('nom')}`,
      `Établissement : ${data.get('etablissement') || '-'}`,
      `E-mail : ${data.get('email')}`,
      `Téléphone : ${data.get('telephone') || '-'}`,
      `Activité : ${data.get('activite')}`,
      `Besoin : ${needs}`,
      `Formule : ${data.get('formule') || 'À définir'}`,
      '',
      data.get('message') || ''
    ].join('\n')
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Demande de devis — ' + data.get('activite'))}&body=${encodeURIComponent(body)}`
    status.textContent = `Votre messagerie devrait s’ouvrir avec la demande préremplie. Si rien ne s’ouvre, écrivez-nous à ${CONTACT_EMAIL}.`
    btn.disabled = false
  })
}

/* ═════════ Démarrage ═════════ */

const loader = $('.loader')
const loaderBar = $('.loader__bar span')
const finishLoader = () => {
  if (root.classList.contains('is-loaded')) return
  root.classList.add('is-loaded')
  gsap.to(loader, {
    clipPath: 'inset(0 0 100% 0)',
    duration: reduce ? 0.01 : 1.1,
    ease: 'expo.inOut',
    onComplete: () => loader.remove()
  })
  heroIntro()
}

// Les ScrollTriggers sont créés dans l'ordre de la page : les sections épinglées décalent les suivantes.
heroScroll()
manifesto()
portal()
trades()
depth()
reveals()
giant()
navTriggers()
hud()
moments()
lightbox()
form()

if (lenis) lenis.stop()
preload((p) => gsap.to(loaderBar, { scaleX: p, duration: 0.3, ease: 'power2.out' }))
  .then(() => document.fonts.ready)
  .then(() => {
    ScrollTrigger.refresh()
    lenis?.start()
    finishLoader()
  })
// Garde-fou : on n'attend jamais plus de 4 s
setTimeout(() => { lenis?.start(); finishLoader() }, 4000)
