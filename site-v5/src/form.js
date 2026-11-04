/* Formulaire de devis, partagé par toutes les pages. */

// Service d'envoi du formulaire (Formspree, Getform…). Vide = ouverture d'un e-mail prérempli.
const FORM_ENDPOINT = ''
const CONTACT_EMAIL = 'contact@estalia-studio.com'

const $ = (s, c = document) => c.querySelector(s)

export function form () {
  const f = $('.form')
  if (!f) return
  const status = $('.form__status', f)
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

