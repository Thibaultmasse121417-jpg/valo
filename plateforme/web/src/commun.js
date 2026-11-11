/* Petits outils partagés par les pages. */
export const $ = (s, c = document) => c.querySelector(s)
export const $$ = (s, c = document) => [...c.querySelectorAll(s)]
export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export const euros = (centimes) => (centimes / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: centimes % 100 ? 2 : 0 })

export class ErreurApi extends Error {
  constructor (message, statut) { super(message); this.statut = statut }
}

/* Appel à l'API du serveur. body : objet (JSON), FormData ou Blob. */
export async function api (chemin, { method = 'GET', body } = {}) {
  const headers = { 'x-portant': '1' }
  let corps = body
  if (body && !(body instanceof FormData) && !(body instanceof Blob)) { headers['content-type'] = 'application/json'; corps = JSON.stringify(body) }
  let r
  try {
    r = await fetch(chemin, { method, headers, body: corps, credentials: 'same-origin' })
  } catch {
    throw new ErreurApi('Connexion impossible. Vérifiez votre réseau et réessayez.', 0)
  }
  const type = r.headers.get('content-type') || ''
  const d = type.includes('json') ? await r.json() : null
  if (!r.ok) throw new ErreurApi(d?.erreur || 'Une erreur est survenue.', r.status)
  return d
}

/* Couleurs de la boutique (choisies dans l'administration). */
export function appliquerCouleurs (c = {}) {
  const s = document.documentElement.style
  if (c.fond) { s.setProperty('--bg', c.fond); s.setProperty('--paper', melange(c.fond, '#ffffff', 0.6)) }
  if (c.texte) s.setProperty('--ink', c.texte)
  if (c.accent) s.setProperty('--accent', c.accent)
  const meta = document.querySelector('meta[name="theme-color"]') || Object.assign(document.head.appendChild(document.createElement('meta')), { name: 'theme-color' })
  meta.content = c.fond || '#f3f1ec'
}
function melange (a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const x = p(a); const y = p(b)
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
