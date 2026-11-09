import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { form, pickPlan, pickActivite } from './form.js'

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
root.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]

let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* Vidéos : lecture à l'écran uniquement ; au survol pour les réalisations sur desktop */
const play = (v) => {
  if (reduce) return
  if (v.dataset.src && v.getAttribute('src') !== v.dataset.src) { v.src = v.dataset.src; v.load() }
  v.play()?.catch(() => {})
}
const hoverClips = fine && !reduce
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => (isIntersecting ? play(v) : v.pause())), { rootMargin: '20% 0px' })
$$('video').forEach((v) => {
  if (v.closest('.player')) return
  if (reduce) { v.removeAttribute('autoplay'); v.pause() }
  if (hoverClips && v.closest('.clip')) return
  io.observe(v)
})
if (hoverClips) {
  $$('.clip').forEach((c) => {
    const v = $('video', c); const bar = $('.clip__bar', c)
    c.addEventListener('pointerenter', () => play(v))
    c.addEventListener('pointerleave', () => { v.pause(); gsap.to(bar, { scaleX: 0, duration: 0.4, ease: 'expo.out' }) })
    v.addEventListener('timeupdate', () => { if (v.duration) gsap.set(bar, { scaleX: v.currentTime / v.duration }) })
  })
}

/* Apparitions, discrètes */
const els = $$('main .h2, .head__txt, .offer, .product__media, .product__text, .clip, .board__head, .shots li, .timeline li, .includes, .method__phone, .plans, .cal, .year, .table, .faq__list, .contact__text, .form')
els.forEach((el) => el.setAttribute('data-reveal', ''))
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__title', { opacity: 0, y: 24, duration: 1.2 })
    .from('.hero__side', { opacity: 0, y: 16, duration: 1.1 }, 0.15)
    .from('.hero__film', { opacity: 0, y: 24, duration: 1.3 }, 0.3)
  ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, overwrite: true }) })
}

/* Nav : filet au défilement */
const nav = $('[data-nav]')
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8)
addEventListener('scroll', onScroll, { passive: true }); onScroll()

/* Menu mobile et ancres */
const menu = $('#menu'); const menuBtn = $('.nav__menu')
let menuOpen = false
const setMenu = (open) => {
  menuOpen = open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu')
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis?.stop(); $('a', menu).focus({ preventScroll: true }) }
  else { menu.classList.remove('is-open'); lenis?.start(); setTimeout(() => { if (!menuOpen) menu.hidden = true }, 260) }
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus() } })

/* Onglets Commerces / Immobilier */
const tabs = $$('[role="tab"]'); const pill = $('.tabs__pill'); const billing = $('[data-billing-group]')
const movePill = (t) => { pill.style.width = t.offsetWidth + 'px'; pill.style.transform = `translateX(${t.offsetLeft}px)` }
const selectTab = (t, focus) => {
  tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on })
  movePill(t)
  billing.hidden = t.id !== 'tab-com'
  if (focus) t.focus()
  $$('[data-reveal]', $('#' + t.getAttribute('aria-controls'))).forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
  ScrollTrigger.refresh()
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t))
  t.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (step) { e.preventDefault(); selectTab(tabs[(i + step + tabs.length) % tabs.length], true) }
  })
})
const placePill = () => { const on = tabs.find((t) => t.getAttribute('aria-selected') === 'true'); pill.style.transition = 'none'; movePill(on); pill.offsetWidth; pill.style.transition = '' }
placePill(); addEventListener('resize', placePill)

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href'); const target = id === '#top' ? 0 : id.length > 1 ? $(id) : null
  if (target === null) return
  e.preventDefault()
  if (a.dataset.plan) pickPlan(a.dataset.plan)
  if (a.dataset.activite) pickActivite(a.dataset.activite)
  if (a.dataset.tab) selectTab($('#' + a.dataset.tab))
  if (menuOpen) setMenu(false)
  const offset = -nav.offsetHeight - 16
  lenis ? lenis.scrollTo(target, { offset, duration: 1.2 }) : (target === 0 ? scrollTo(0, 0) : scrollTo(0, target.getBoundingClientRect().top + scrollY + offset))
  if (target !== 0) { target.setAttribute('tabindex', '-1'); setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1200 : 0) }
})

/* Mensuel / annuel */
$$('[data-billing]').forEach((b) => b.addEventListener('click', () => {
  const annual = b.dataset.billing === 'a'
  $$('[data-billing]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  $$('.plan__price b[data-m]').forEach((p) => { p.textContent = (+(annual ? p.dataset.a : p.dataset.m)).toLocaleString('fr-FR') + ' €' })
}))

/* Prochaine échéance saisonnière (commande trois semaines avant) */
{
  const nth = (y, m, dow, k) => { const d = new Date(y, m, 1); d.setDate(1 + ((dow - d.getDay() + 7) % 7) + 7 * (k - 1)); return d }
  const last = (y, m, dow) => { const d = new Date(y, m + 1, 0); d.setDate(d.getDate() - ((d.getDay() - dow + 7) % 7)); return d }
  const evs = (y) => [
    ['nouvel-an', 'le Nouvel An', new Date(y, 0, 1)], ['saint-valentin', 'la Saint-Valentin', new Date(y, 1, 14)],
    ['meres', 'la fête des mères', last(y, 4, 0)], ['peres', 'la fête des pères', nth(y, 5, 0, 3)],
    ['soldes', 'les soldes d’été', last(y, 5, 3)], ['rentree', 'la rentrée', new Date(y, 8, 1)],
    ['halloween', 'Halloween', new Date(y, 9, 31)], ['black-friday', 'le Black Friday', new Date(nth(y, 10, 4, 4).getTime() + 864e5)],
    ['noel', 'Noël', new Date(y, 11, 25)]
  ]
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const nx = [...evs(today.getFullYear()), ...evs(today.getFullYear() + 1)]
    .map(([k, n, d]) => ({ k, n, d, dl: new Date(d.getTime() - 21 * 864e5) }))
    .find((e) => e.dl >= today)
  const box = $('[data-deadline]')
  if (nx && box) {
    const day = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    box.hidden = false
    box.innerHTML = `<span>Prochaine échéance&nbsp;: <b>${nx.n.replace(/^(le |la |les )/, '').replace(/^./, (c) => c.toUpperCase())}</b>, à commander avant le ${day(nx.dl)}.</span>`
    $(`[data-ev="${nx.k}"]`)?.classList.add('is-hot')
  }
}

/* Lecteur */
const dlg = $('.player'); const pv = $('video', dlg); let opener = null
$$('[data-film]').forEach((b) => b.addEventListener('click', () => { opener = b; pv.src = b.dataset.film; dlg.showModal(); lenis?.stop(); pv.play()?.catch(() => {}) }))
$('.player__close', dlg).addEventListener('click', () => dlg.close())
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
dlg.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); lenis?.start(); opener?.focus({ preventScroll: true }) })

form()
document.fonts.ready.then(() => { placePill(); ScrollTrigger.refresh() })
addEventListener('load', () => ScrollTrigger.refresh())
let rf = 0
$$('img[loading="lazy"]').forEach((img) => img.addEventListener('load', () => { clearTimeout(rf); rf = setTimeout(() => ScrollTrigger.refresh(), 200) }))
