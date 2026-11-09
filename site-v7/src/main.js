import '@fontsource-variable/inter-tight'
import '@fontsource/instrument-serif/400-italic.css'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { form } from './form.js'

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
root.classList.add('js')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]

let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* Vidéos : lecture à l'écran uniquement, aucune en mouvement réduit */
const play = (v) => {
  if (reduce) return
  if (v.dataset.src && v.getAttribute('src') !== v.dataset.src) { v.src = v.dataset.src; v.load() }
  v.play()?.catch(() => {})
}
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => (isIntersecting ? play(v) : v.pause())), { rootMargin: '20% 0px' })
$$('video').forEach((v) => { if (v.closest('.player')) return; if (reduce) { v.removeAttribute('autoplay'); v.pause() } io.observe(v) })

/* Apparitions */
const els = $$('main h2, main .kicker, .split__text > p, .split__img, .split__phone, .trio__imgs img, .card, .numbers__row > div, .story, .chips li, .item, .pack, .year, .table, .plan, .tile, .pillars__row > div, .talent__text > *, .final__text > *, .form')
els.forEach((el) => el.setAttribute('data-reveal', ''))
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__text > *', { opacity: 0, y: 30, duration: 1.2, stagger: 0.1 })
    .from('.hero__wall', { opacity: 0, duration: 1.6 }, 0.1)
  ScrollTrigger.batch(els, { start: 'top 90%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.05, overwrite: true }) })
  gsap.fromTo('.trio__cards', { y: 60 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.trio', start: 'top bottom', end: 'center center', scrub: true } })
  $$('[data-count]').forEach((b) => {
    const n = { v: 0 }
    gsap.to(n, { v: +b.dataset.count, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%', once: true }, onUpdate: () => { b.textContent = Math.round(n.v) } })
  })
}

/* Menu mobile et ancres */
const menu = $('#menu'); const menuBtn = $('.nav__menu'); const nav = $('[data-nav]')
let menuOpen = false
const setMenu = (open) => {
  menuOpen = open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu')
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis?.stop(); $('a', menu).focus({ preventScroll: true }) }
  else { menu.classList.remove('is-open'); lenis?.start(); setTimeout(() => { if (!menuOpen) menu.hidden = true }, 300) }
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
  lenis ? lenis.scrollTo(target, { offset, duration: 1.4 }) : (target === 0 ? window.scrollTo(0, 0) : target.scrollIntoView())
  if (target !== 0) { target.setAttribute('tabindex', '-1'); setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1400 : 0) }
})

/* Mensuel / annuel */
$$('[data-billing]').forEach((b) => b.addEventListener('click', () => {
  const annual = b.dataset.billing === 'a'
  $$('[data-billing]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  $$('.plan__price b').forEach((p) => {
    const to = +(annual ? p.dataset.a : p.dataset.m)
    const n = { v: parseInt(p.textContent.replace(/\D/g, ''), 10) }
    if (reduce) { p.textContent = to.toLocaleString('fr-FR') + ' €'; return }
    gsap.to(n, { v: to, duration: 0.5, ease: 'power2.out', onUpdate: () => { p.textContent = Math.round(n.v).toLocaleString('fr-FR') + ' €' } })
  })
}))

/* Lecteur */
const dlg = $('.player'); const pv = $('video', dlg); let opener = null
$$('[data-film]').forEach((b) => b.addEventListener('click', () => { opener = b; pv.src = b.dataset.film; dlg.showModal(); lenis?.stop(); pv.play()?.catch(() => {}) }))
$('.player__close', dlg).addEventListener('click', () => dlg.close())
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
dlg.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); lenis?.start(); opener?.focus({ preventScroll: true }) })

form()
document.fonts.ready.then(() => ScrollTrigger.refresh())
