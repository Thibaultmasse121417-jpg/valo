/* Pages secteur et tarifs : même identité que l'accueil, effets plus sobres. */
import '@fontsource-variable/bodoni-moda/wght.css'
import '@fontsource-variable/bodoni-moda/wght-italic.css'
import '@fontsource-variable/archivo/wght.css'
import './styles.css'

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
const vh = () => window.innerHeight

let lenis = null
if (!reduce) {
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

/* Vidéos : lecture à l'écran seulement */
const play = (v) => {
  if (reduce) return
  if (v.dataset.src && v.getAttribute('src') !== v.dataset.src) { v.src = v.dataset.src; v.load() }
  v.play()?.catch(() => {})
}
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => (isIntersecting ? play(v) : v.pause())), { rootMargin: '25% 0px' })
$$('video[data-src]').forEach((v) => io.observe(v))

/* Hero : titre par lignes, vidéo qui recule doucement */
const lines = $('[data-lines]')
if (lines) {
  lines.innerHTML = lines.innerHTML.split(/<br\s*\/?>/i).map((p) => `<span class="ln" style="display:block;overflow:hidden;padding-bottom:.08em"><span style="display:inline-block">${p.trim()}</span></span>`).join('')
}
if (!reduce) {
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.phero__video', { scale: 1.12, duration: 2.4, ease: 'power3.out' }, 0)
    .from('.phero .label', { opacity: 0, y: 12, duration: 1.2 }, 0.2)
    .from('.phero .ln > span', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.3)
    .from('.phero__cta > *', { opacity: 0, y: 16, duration: 1.2, stagger: 0.08 }, 0.8)
  gsap.to('.phero__video', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } })
  $$('[data-clip]').forEach((fig) => gsap.fromTo(fig, { clipPath: 'inset(16% 10% 16% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: fig, start: 'top 95%', end: 'center 55%', scrub: true } }))
}

/* Révélations */
const els = $$('.label:not(.phero .label), .offers__list li, .pricing__list li, .faq details, .steps li, .chips li, .promise li, .contact__title, .form, .contact__mail, .sector-links a')
els.forEach((el) => el.setAttribute('data-reveal', ''))
if (!reduce) {
  ScrollTrigger.batch(els, { start: 'top 92%', once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, overwrite: true }) })
}

/* Navigation, menu, pastille */
const nav = $('[data-nav]'); const menu = $('#menu'); const menuBtn = $('.nav__menu'); const pill = $('.pill')
let menuOpen = false; let atContact = false; let pastHero = false
const syncPill = () => pill && pill.classList.toggle('is-on', pastHero && !atContact && !menuOpen)
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const y = self.scroll()
    nav.classList.toggle('at-hero', y < vh() * 0.5)
    nav.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > vh() * 0.5)
    pastHero = y > vh() * 0.7; syncPill()
  }
})
if ($('.contact')) ScrollTrigger.create({ trigger: '.contact', start: 'top 85%', end: 'bottom top', onToggle: (s) => { atContact = s.isActive; syncPill() } })
const setMenu = (open) => {
  menuOpen = open; syncPill()
  menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? 'Fermer' : 'Menu'
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); lenis?.stop(); $('a', menu).focus({ preventScroll: true }) }
  else { menu.classList.remove('is-open'); lenis?.start(); setTimeout(() => { if (!menuOpen) menu.hidden = true }, 350) }
}
menuBtn.addEventListener('click', () => setMenu(!menuOpen))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus() } })
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a || a.getAttribute('href').length < 2) return
  const target = $(a.getAttribute('href')); if (!target) return
  e.preventDefault()
  if (a.dataset.plan) { const f = $('#f-formule'); if (f) f.value = a.dataset.plan }
  if (menuOpen) setMenu(false)
  lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView()
  target.setAttribute('tabindex', '-1'); setTimeout(() => target.focus({ preventScroll: true }), lenis ? 1600 : 0)
})

/* Lecteur plein écran */
const dlg = $('.player')
if (dlg) {
  const v = $('video', dlg); let opener = null
  $$('[data-film]').forEach((b) => b.addEventListener('click', () => {
    opener = b; v.src = b.dataset.film; dlg.showModal(); lenis?.stop(); v.muted = false; v.play()?.catch(() => {})
  }))
  $('.player__close', dlg).addEventListener('click', () => dlg.close())
  dlg.addEventListener('close', () => { v.pause(); v.removeAttribute('src'); v.load(); lenis?.start(); opener?.focus({ preventScroll: true }) })
}

/* Activité présélectionnée dans le formulaire */
const sector = document.body.dataset.sector
if (sector) { const sel = $('#f-metier'); if (sel) sel.value = sector }
form()
document.fonts.ready.then(() => ScrollTrigger.refresh())
