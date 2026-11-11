/* Page de vente : vidéo de la démo, choix de formule, formulaire, apparitions. */
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/ibm-plex-mono/500.css'
import './vente.css'
import { form, pickPlan } from './form.js'

const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

// La vidéo du portant ne joue que lorsqu'elle est visible (et pas d'elle-même si l'utilisateur limite les animations).
const video = $('[data-hero-video]')
const toggle = $('[data-video-toggle]')
let userPaused = reduce
const setBtn = () => {
  toggle.classList.toggle('is-paused', video.paused)
  toggle.setAttribute('aria-label', video.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause')
}
video.addEventListener('play', setBtn)
video.addEventListener('pause', setBtn)
toggle.addEventListener('click', () => {
  if (video.paused) { userPaused = false; video.play().catch(() => {}) } else { userPaused = true; video.pause() }
})
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !userPaused) video.play().catch(() => {})
  else video.pause()
}, { threshold: 0.25 }).observe(video)
setBtn()

for (const a of $$('[data-plan]')) a.addEventListener('click', () => pickPlan(a.dataset.plan))
form()

// Bouton mobile : visible une fois le haut de page passé, caché au formulaire.
const sticky = $('.sticky-cta')
let pastHero = false
let atContact = false
const upd = () => sticky.classList.toggle('is-on', pastHero && !atContact)
new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd() }).observe($('.hero'))
new IntersectionObserver(([e]) => { atContact = e.isIntersecting; upd() }).observe($('#contact'))

// Apparitions discrètes.
if (!reduce) {
  const els = $$('.head, .feats li, .steps li, .plan, .shot, .why__grid > *, .faq__grid > *, .contact__grid > *')
  els.forEach((el) => el.classList.add('rv'))
  const io = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }, { rootMargin: '0px 0px -8% 0px' })
  els.forEach((el) => io.observe(el))
}
