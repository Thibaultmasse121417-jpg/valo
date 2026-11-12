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
/* Identité complète de la boutique (couleurs et polices choisies dans l'administration). */
const POLICES = {
  cormorant: "'Cormorant Garamond', 'Times New Roman', Georgia, serif",
  playfair: "'Playfair Display', Georgia, serif",
  'dm-serif': "'DM Serif Display', Georgia, serif",
  'inter-tight': "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif",
  'dm-sans': "'DM Sans Variable', ui-sans-serif, system-ui, sans-serif"
}
export function appliquerTheme (t = {}) {
  const s = document.documentElement.style
  const set = (k, v) => { if (v) s.setProperty(k, v) }
  set('--bg', t.fond); set('--paper', t.surface); set('--ink', t.texte); set('--mute', t.attenue)
  set('--accent', t.accent); set('--bandeau', t.bandeau)
  if (t.fond && t.texte) set('--line', melange(t.fond, t.texte, 0.14))
  set('--titres', POLICES[t.police_titres]); set('--font', POLICES[t.police_texte])
  s.setProperty('--titres-style', t.titres_italiques ? 'italic' : 'normal')
  const meta = document.querySelector('meta[name="theme-color"]') || Object.assign(document.head.appendChild(document.createElement('meta')), { name: 'theme-color' })
  meta.content = t.fond || '#f3f1ec'
}
function melange (a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const x = p(a); const y = p(b)
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
