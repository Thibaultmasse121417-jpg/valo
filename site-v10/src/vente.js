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
  const els = $$('.head, .feats li, .steps li, .plan, .shot, .phone, .atelier__txt, .why__grid > *, .faq__grid > *, .contact__grid > *')
  els.forEach((el) => el.classList.add('rv'))
  const io = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }, { rootMargin: '0px 0px -8% 0px' })
  els.forEach((el) => io.observe(el))
}

// Film promotionnel : lecture quand la section est visible, bouton pause
const film = document.querySelector('[data-film]')
const filmBtn = document.querySelector('[data-film-toggle]')
if (film && filmBtn) {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches
  let filmPause = reduit
  const maj = () => { filmBtn.classList.toggle('is-paused', film.paused); filmBtn.setAttribute('aria-label', film.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause') }
  film.addEventListener('play', maj); film.addEventListener('pause', maj); maj()
  filmBtn.addEventListener('click', () => { if (film.paused) { filmPause = false; film.play().catch(() => {}) } else { filmPause = true; film.pause() } })
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !filmPause) film.play().catch(() => {}); else film.pause() }, { threshold: 0.3 }).observe(film)
}

// Film de boutique complet, dans une fenêtre
const dlg = document.querySelector('[data-dialogue-film]')
if (dlg) {
  const v = dlg.querySelector('video')
  document.querySelector('[data-ouvrir-film]').addEventListener('click', () => { dlg.showModal(); v.play().catch(() => {}) })
  const fermer = () => { v.pause(); dlg.close() }
  dlg.querySelector('[data-fermer-film]').addEventListener('click', fermer)
  dlg.addEventListener('click', (e) => { if (e.target === dlg) fermer() })
  dlg.addEventListener('close', () => v.pause())
}
