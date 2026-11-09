import '@fontsource-variable/big-shoulders-display'
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { form } from './form.js'

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
root.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const pad = (n) => String(Math.floor(n)).padStart(2, '0')

let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* Vidéos : lecture à l'écran uniquement ; les clips au survol sont gérés à part sur desktop */
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

/* Horloge REC (HH:MM:SS:FF à 24 i/s) */
const clock = $('[data-clock]')
if (clock) {
  const t0 = performance.now()
  const tick = () => {
    const s = (performance.now() - t0) / 1000
    clock.textContent = `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad((s % 1) * 24)}`
  }
  reduce ? tick() : gsap.ticker.add(tick)
}

/* Timecode du viseur */
const vfv = $('[data-viewfinder] video'); const tc = $('[data-tc]')
if (vfv && tc) {
  const fmt = (s) => `${pad(s / 60)}:${pad(s % 60)}`
  const upd = () => { tc.textContent = `${fmt(vfv.currentTime || 0)} / ${fmt(vfv.duration || 21)}` }
  vfv.addEventListener('timeupdate', upd); vfv.addEventListener('loadedmetadata', upd)
}

/* Clips : lecture au survol + barre de progression (desktop) */
if (hoverClips) {
  $$('button.clip').forEach((c) => {
    const v = $('video', c); const bar = $('.clip__bar', c)
    c.addEventListener('pointerenter', () => play(v))
    c.addEventListener('pointerleave', () => { v.pause(); gsap.to(bar, { scaleX: 0, duration: 0.4, ease: 'expo.out' }) })
    v.addEventListener('timeupdate', () => { if (v.duration) gsap.set(bar, { scaleX: v.currentTime / v.duration }) })
  })
}

/* Apparitions */
const els = $$('main .label, main h2, .principle__head .muted, .steps li, .phone, .clip, .films__note, .facts > div, .plans, .billing, .cal li, .year, .table, .faq details, .rdv__text > *, .form')
els.forEach((el) => el.setAttribute('data-reveal', ''))
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__rec', { opacity: 0, duration: 0.8 })
    .from('.hero__title', { opacity: 0, y: 40, duration: 1.3 }, 0.05)
    .from('.hero__side > *', { opacity: 0, y: 20, duration: 1.1, stagger: 0.08 }, 0.25)
    .from('.viewfinder', { opacity: 0, y: 40, duration: 1.4 }, 0.35)
    .from('.corner', { scale: 1.8, opacity: 0, duration: 0.9, stagger: 0.05 }, 0.9)
  ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.05, overwrite: true }) })
  $$('[data-count]').forEach((b) => {
    const n = { v: 0 }
    gsap.to(n, { v: +b.dataset.count, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%', once: true }, onUpdate: () => { b.textContent = Math.round(n.v) } })
  })
  gsap.fromTo('.viewfinder video', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.viewfinder', start: 'top bottom', end: 'bottom top', scrub: true } })
}

/* Barre de navigation sombre au-dessus des sections sombres */
const navEl = $('[data-nav]')
$$('.films, .rdv').forEach((sec) => ScrollTrigger.create({ trigger: sec, start: () => `top ${navEl.offsetHeight}`, end: () => `bottom ${navEl.offsetHeight}`, toggleClass: { targets: navEl, className: 'is-dark' } }))

/* Menu mobile et ancres */
const menu = $('#menu'); const menuBtn = $('.nav__menu'); const nav = $('[data-nav]')
let menuOpen = false
const setMenu = (open) => {
  menuOpen = open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? 'Fermer' : 'Menu'
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis?.stop(); $('a', menu).focus({ preventScroll: true }) }
  else { menu.classList.remove('is-open'); lenis?.start(); setTimeout(() => { if (!menuOpen) menu.hidden = true }, 280) }
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus() } })
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href'); const target = id === '#top' ? 0 : id.length > 1 ? $(id) : null
  if (target === null) return
  e.preventDefault()
  if (a.dataset.plan) $('#f-formule').value = a.dataset.plan
  if (menuOpen) setMenu(false)
  const offset = -nav.offsetHeight
  lenis ? lenis.scrollTo(target, { offset, duration: 1.3 }) : (target === 0 ? window.scrollTo(0, 0) : window.scrollTo(0, target.getBoundingClientRect().top + scrollY + offset))
  if (target !== 0) { target.setAttribute('tabindex', '-1'); setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1300 : 0) }
})

/* Mensuel / annuel */
$$('[data-billing]').forEach((b) => b.addEventListener('click', () => {
  const annual = b.dataset.billing === 'a'
  $$('[data-billing]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  $$('.plan__price b[data-m]').forEach((p) => {
    const to = +(annual ? p.dataset.a : p.dataset.m)
    const n = { v: parseInt(p.textContent.replace(/\D/g, ''), 10) }
    const out = (v) => { p.textContent = Math.round(v).toLocaleString('fr-FR') + ' €' }
    if (reduce) return out(to)
    gsap.to(n, { v: to, duration: 0.5, ease: 'power2.out', onUpdate: () => out(n.v) })
  })
}))

/* Onglets Commerces / Immobilier, avec pastille glissante */
const tabs = $$('[role="tab"]'); const pill = $('.tabs__pill')
const movePill = (t) => { if (pill) { pill.style.width = t.offsetWidth + 'px'; pill.style.transform = `translateX(${t.offsetLeft}px)` } }
const selectTab = (t, focus) => {
  tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on })
  movePill(t)
  if (focus) t.focus()
  const panel = $('#' + t.getAttribute('aria-controls'))
  $$('[data-reveal]', panel).forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
  ScrollTrigger.refresh()
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t))
  t.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (step) { e.preventDefault(); selectTab(tabs[(i + step + tabs.length) % tabs.length], true) }
  })
})
const placePill = () => { const on = tabs.find((t) => t.getAttribute('aria-selected') === 'true'); if (on) { pill.style.transition = 'none'; movePill(on); pill.offsetWidth; pill.style.transition = '' } }
placePill(); addEventListener('resize', placePill)

/* Lecteur */
const dlg = $('.player'); const pv = $('video', dlg); let opener = null
$$('[data-film]').forEach((b) => b.addEventListener('click', () => {
  opener = b; pv.src = b.dataset.film; dlg.showModal(); lenis?.stop(); pv.play()?.catch(() => {})
}))
$('.player__close', dlg).addEventListener('click', () => dlg.close())
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
dlg.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); lenis?.start(); opener?.focus({ preventScroll: true }) })

form()
document.fonts.ready.then(() => { placePill(); ScrollTrigger.refresh() })
window.addEventListener('load', () => ScrollTrigger.refresh())
let rf = 0
$$('img[loading="lazy"]').forEach((img) => img.addEventListener('load', () => { clearTimeout(rf); rf = setTimeout(() => ScrollTrigger.refresh(), 200) }))
