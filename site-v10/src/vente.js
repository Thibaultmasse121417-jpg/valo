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

// Vitrine « votre photo → votre vidéo » : les pièces s'enchaînent comme un fil vertical
const vit = document.querySelector('[data-vitrine]')
if (vit) {
  const PIECES = [
    { nom: 'Robe sequins', video: './media/demo/video-robe.mp4', poster: './media/demo/video-robe.jpg', photo: './media/demo/piece-robe.jpg', alt: 'Photo d’origine : robe longue à sequins bronze sur un cintre.',
      prompt: 'Une femme porte exactement la robe de la photo : fines bretelles, décolleté en V, sequins bronze. Plan en pied : elle traverse une boutique au portant doré, le soir. Gros plan : les sequins qui brillent. Plan moyen : elle regarde par-dessus son épaule.' },
    { nom: 'Blazer bijoux', video: './media/demo/video-blazer.mp4', poster: './media/demo/video-blazer.jpg', photo: './media/demo/piece-blazer.jpg', alt: 'Photo d’origine : blazer croisé noir à boutons bijoux sur un cintre.',
      prompt: 'Une femme porte exactement le blazer de la photo : même coupe, mêmes revers, six boutons bijoux. Plan en pied dans un studio ivoire : elle ajuste le revers et avance. Gros plan : les boutons qui scintillent. Profil : elle se tourne vers la caméra. Lumière douce de studio.' },
    { nom: 'Veste fourrure', video: './media/demo/video-fourrure.mp4', poster: './media/demo/video-fourrure.jpg', photo: './media/demo/piece-fourrure.jpg', alt: 'Photo d’origine : veste courte en fausse fourrure camel sur un cintre.',
      prompt: 'Une femme porte exactement la veste de la photo : même couleur, même col, mêmes agrafes. Plan large : elle avance dans une rue de Paris à l’heure dorée. Gros plan : le col et les agrafes dans la lumière. Plan moyen : elle tourne la tête et sourit. Tons chauds, film de campagne.' }
  ]
  const v = vit.querySelector('[data-vitrine-video]'); const barre = vit.querySelector('[data-vitrine-progres]')
  const choix = vit.querySelector('[data-vitrine-choix]')
  choix.innerHTML = PIECES.map((p, i) => `<button type="button" role="tab" aria-selected="false" data-i="${i}">${p.nom}</button>`).join('')
  let k = 0
  const montrer = (i, lire = true) => {
    k = (i + PIECES.length) % PIECES.length; const p = PIECES[k]
    v.src = p.video; v.poster = p.poster; v.setAttribute('aria-label', `Vidéo portée générée à partir de la photo : ${p.nom}`)
    vit.querySelector('[data-vitrine-photo]').src = p.photo; vit.querySelector('[data-vitrine-photo]').alt = p.alt
    vit.querySelector('[data-vitrine-prompt]').textContent = p.prompt
    for (const b of choix.children) b.setAttribute('aria-selected', String(+b.dataset.i === k))
    barre.style.width = '0'
    if (lire && vitVisible && !vitPause) v.play().catch(() => {})
  }
  let vitVisible = false; let vitPause = matchMedia('(prefers-reduced-motion: reduce)').matches
  choix.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { vitPause = false; montrer(+b.dataset.i) } })
  v.addEventListener('ended', () => montrer(k + 1))
  v.addEventListener('timeupdate', () => { if (v.duration) barre.style.width = `${(v.currentTime / v.duration) * 100}%` })
  let x0 = null
  v.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX }, { passive: true })
  v.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) montrer(k + (dx < 0 ? 1 : -1)) })
  new IntersectionObserver(([e]) => { vitVisible = e.isIntersecting; if (vitVisible && !vitPause) v.play().catch(() => {}); else v.pause() }, { threshold: 0.3 }).observe(v)
  const tg = vit.querySelector('[data-vitrine-toggle]')
  const maj = () => { tg.classList.toggle('is-paused', v.paused); tg.setAttribute('aria-label', v.paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause') }
  v.addEventListener('play', maj); v.addEventListener('pause', maj); maj()
  tg.addEventListener('click', () => { if (v.paused) { vitPause = false; v.play().catch(() => {}) } else { vitPause = true; v.pause() } })
  montrer(0, false)
}
