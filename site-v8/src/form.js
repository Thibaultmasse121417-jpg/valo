/* Formulaire « plan offert » en 4 étapes, avec recommandation de formule. */

// Service d'envoi du formulaire (Formspree, Getform…). Vide = ouverture d'un e-mail prérempli.
const FORM_ENDPOINT = ''
const CONTACT_EMAIL = 'contact@estalia-studio.com'

const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const IMMO = ['Agence immobilière', 'Étude notariale']

let api = { pick () {}, activite () {} }
export const pickPlan = (plan) => api.pick(plan)
export const pickActivite = (v) => api.activite(v)

function recommend (d) {
  const act = d.get('activite'); const r = d.get('rythme'); const obj = d.getAll('objectif')
  if (IMMO.includes(act)) {
    if (r === 'Une vidéo pour tester') return ['À l’annonce', '149 € le bien', 'Une vidéo de 30 à 45 s, horizontale et verticale, livrée en 48 h.']
    if (r === 'À chaque nouveau bien' || r === 'Chaque mois') return ['Agence 10', '990 € / mois', '10 biens par mois, soit 99 € le bien. Agence 5 à 590 € si vous avez moins de mandats.']
    return ['À l’annonce', '149 € le bien', 'Le plus simple pour commencer, sans abonnement.']
  }
  if (r === 'Chaque mois') {
    return obj.includes('Préparer un temps fort')
      ? ['Croissance', '990 € / mois', '8 vidéos courtes, 1 film de 30 s et 1 pack saisonnier inclus chaque mois.']
      : ['Essentiel', '490 € / mois', '4 vidéos courtes par mois, sans engagement.']
  }
  if (r === 'Pour un temps fort') return ['Pack saisonnier', '390 €', 'Un film de 20 s, trois formats et six visuels. Ou l’année complète à 2 790 €.']
  return ['Pack saisonnier', '390 €', 'Le moyen le plus simple de tester sur un vrai temps fort, sans abonnement.']
}

export function form () {
  const f = $('.form')
  if (!f) return
  const status = $('.status', f)
  const steps = $$('[data-step]', f)
  const prev = $('[data-prev]', f); const next = $('[data-next]', f); const submit = $('button[type="submit"]', f)
  const nEl = $('[data-step-n]', f); const bar = $('[data-step-bar]', f)
  const picked = $('[data-picked]', f); const formule = $('#f-formule', f); const reco = $('[data-reco]', f)
  let cur = 0

  const fieldErr = (el, err, msg) => {
    if (el) { el.setAttribute('aria-invalid', String(!!msg)); el.setAttribute('aria-describedby', err.id) }
    err.textContent = msg || ''
    return !msg
  }
  const group = (name, errId, msg) => {
    const ok = $$(`[name="${name}"]`, f).some((i) => i.checked)
    const err = $('#' + errId, f)
    $(`[name="${name}"]`, f).closest('fieldset').setAttribute('aria-invalid', String(!ok))
    err.textContent = ok ? '' : msg
    return ok
  }
  const rules4 = [
    ['#f-nom', '#f-nom-err', (el) => el.value.trim().length >= 2 || 'Indiquez votre nom.'],
    ['#f-email', '#f-email-err', (el) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()) || 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.'],
    ['[name="consentement"]', '#f-consent-err', (el) => el.checked || 'Cochez cette case pour que nous puissions vous répondre.']
  ]
  const check4 = ([s, e, test]) => { const el = $(s, f); const r = test(el); return fieldErr(el, $(e, f), r === true ? '' : r) }
  const validate = (i) => {
    if (i === 0) return group('activite', 'f-activite-err', 'Choisissez votre activité.')
    if (i === 1) return group('objectif', 'f-objectif-err', 'Choisissez au moins un objectif.')
    if (i === 2) return group('rythme', 'f-rythme-err', 'Choisissez un rythme.')
    const res = rules4.map(check4); const bad = res.indexOf(false)
    if (bad > -1) $(rules4[bad][0], f).focus()
    return bad === -1
  }

  const show = (i, focus = true) => {
    cur = i
    steps.forEach((s, k) => { s.hidden = k !== i })
    nEl.textContent = i + 1
    bar.style.transform = `scaleX(${(i + 1) / steps.length})`
    prev.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1
    if (i === steps.length - 1) {
      const [name, price, txt] = recommend(new FormData(f))
      reco.hidden = false
      reco.innerHTML = `<p class="mono">Notre conseil pour vous</p><p><b>${name}</b> · ${price}</p><p>${txt}</p>`
      if (!formule.value) formule.value = `${name} (recommandé)`
    }
    if (focus) { const first = $('input', steps[i]); first?.focus({ preventScroll: true }) }
  }

  next.addEventListener('click', () => { if (validate(cur)) show(cur + 1) })
  prev.addEventListener('click', () => show(cur - 1))
  // Les questions à choix unique passent seules à l'étape suivante
  $$('input[type="radio"]', f).forEach((r) => r.addEventListener('change', () => {
    const i = steps.indexOf(r.closest('[data-step]'))
    validate(i)
    setTimeout(() => { if (cur === i) show(i + 1) }, 280)
  }))
  $$('input[type="checkbox"][name="objectif"]', f).forEach((c) => c.addEventListener('change', () => { if ($('#f-objectif-err', f).textContent) validate(1) }))
  rules4.forEach((r) => {
    const el = $(r[0], f)
    el.addEventListener('blur', () => { if (el.value && el.type !== 'checkbox') check4(r) })
    for (const ev of ['input', 'change']) el.addEventListener(ev, () => { if (el.getAttribute('aria-invalid') === 'true') check4(r) })
  })
  f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && cur < steps.length - 1 && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); next.click() }
  })

  api = {
    pick (plan) { formule.value = plan; picked.hidden = false; picked.textContent = `Formule choisie : ${plan}` },
    activite (v) { const r = $(`[name="activite"][value="${v}"]`, f); if (r) { r.checked = true; if (cur === 0) show(1, false) } }
  }

  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!validate(3)) return
    const data = new FormData(f)
    submit.disabled = true
    if (FORM_ENDPOINT) {
      status.textContent = 'Envoi en cours…'
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error()
        f.classList.add('is-sent')
        status.textContent = 'Merci. Nous revenons vers vous sous 48 h ouvrées avec votre premier plan.'
      } catch {
        status.textContent = `L’envoi n’a pas abouti. Réessayez, ou écrivez-nous à ${CONTACT_EMAIL}.`
        submit.disabled = false
      }
      return
    }
    const body = [
      `Nom : ${data.get('nom')}`, `Établissement : ${data.get('etablissement') || '-'}`,
      `E-mail : ${data.get('email')}`, `Téléphone : ${data.get('telephone') || '-'}`,
      `Activité : ${data.get('activite')}`, `Objectifs : ${data.getAll('objectif').join(', ')}`,
      `Rythme : ${data.get('rythme')}`, `Formule : ${data.get('formule') || 'À définir'}`, '', data.get('message') || ''
    ].join('\n')
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Plan offert — ' + data.get('activite'))}&body=${encodeURIComponent(body)}`
    status.textContent = `Votre messagerie devrait s’ouvrir avec la demande préremplie. Sinon, écrivez-nous à ${CONTACT_EMAIL}.`
    submit.disabled = false
  })

  show(0, false)
}
