/* Tableau de bord de la boutique : vêtements, photos, stock, collections, commandes, réglages. */
import '@fontsource-variable/inter-tight'
import './admin.css'
import { $, $$, esc, euros, api } from './commun.js'

const TAILLES_COURANTES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Taille unique']
const STATUTS = {
  en_attente_paiement: 'Paiement en attente', payee: 'Payée', preparee: 'En préparation', expediee: 'Expédiée',
  retiree: 'Retirée', annulee: 'Annulée', expiree: 'Expirée'
}
const ACTIONS = { payee: ['preparee', 'expediee', 'retiree', 'annulee'], preparee: ['expediee', 'retiree', 'annulee'] }
const LIBELLE_ACTION = { preparee: 'Marquer en préparation', expediee: 'Marquer expédiée', retiree: 'Marquer retirée', annulee: 'Annuler (remet en stock)' }

let produits = []; let collections = []

/* ---------- Démarrage et navigation ---------- */
async function demarrer () {
  const b = await api('/api/boutique').catch(() => null)
  for (const el of $$('[data-nom-boutique]')) el.textContent = b?.nom || ''
  document.title = `Administration · ${b?.nom || ''}`
  try {
    await api('/api/admin/moi')
    entrer()
  } catch { montrer('connexion') }
}
const montrer = (v) => { for (const el of $$('[data-vue]')) el.hidden = el.dataset.vue !== v }
async function entrer () {
  montrer('app')
  await Promise.all([chargerProduits(), chargerCollections(), compterCommandes()])
  route()
}
$('[data-login]').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = e.currentTarget
  $('[data-login-err]').textContent = ''
  try { await api('/api/admin/connexion', { method: 'POST', body: { email: f.email.value, mdp: f.mdp.value } }); f.mdp.value = ''; entrer() } catch (err) { $('[data-login-err]').textContent = err.message }
})
$('[data-deco]').addEventListener('click', async () => { await api('/api/admin/deconnexion', { method: 'POST' }).catch(() => {}); location.reload() })

function route () {
  const o = (location.hash.slice(1) || 'vetements').split('/')[0]
  const onglet = ['vetements', 'collections', 'commandes', 'boutique'].includes(o) ? o : 'vetements'
  for (const p of $$('[data-panneau]')) p.hidden = p.dataset.panneau !== onglet
  for (const a of $$('[data-onglet]')) a.toggleAttribute('aria-current', a.dataset.onglet === onglet)
  if (onglet === 'commandes') chargerCommandes()
  if (onglet === 'boutique') chargerBoutique()
}
addEventListener('hashchange', route)

// Toute erreur « connexion requise » renvoie vers la connexion.
async function appel (chemin, opts) {
  try { return await api(chemin, opts) } catch (e) {
    if (e.statut === 401) { montrer('connexion'); throw e }
    throw e
  }
}

/* ---------- Liste des vêtements ---------- */
async function chargerProduits () {
  produits = (await appel('/api/admin/produits')).produits
  const enLigne = produits.filter((p) => p.visible)
  $('[data-resume]').textContent = `${produits.length} vêtement${produits.length > 1 ? 's' : ''}, ${enLigne.length} en ligne`
  $('[data-liste-produits]').innerHTML = produits.length
    ? produits.map((p, i) => {
      const stock = p.variantes.reduce((s, v) => s + v.stock, 0)
      const ph = p.photos.find((x) => x.role === 'face' && x.vignette) || p.photos.find((x) => x.vignette)
      const surPortant = p.visible && enLigne.indexOf(p) < 12
      return `<div class="ad-tr${p.visible ? '' : ' is-off'}" role="row">
        <span role="cell" class="ad-prod">
          <button type="button" class="ad-prod__btn" data-ouvrir="${p.id}">
            <span class="ad-prod__img">${ph ? `<img src="${esc(ph.vignette)}" alt="" width="66" height="88" loading="lazy">` : '<i aria-hidden="true">?</i>'}</span>
            <span><b>${esc(p.nom)}</b><small>${esc(p.reference)} · ${p.couleurs.length} couleur${p.couleurs.length > 1 ? 's' : ''}${surPortant ? ' · sur le portant' : ''}</small></span>
          </button>
        </span>
        <span role="cell">${euros(p.prix_centimes)}</span>
        <span role="cell" class="${stock ? '' : 'rouge'}">${stock ? `${stock} pièce${stock > 1 ? 's' : ''}` : 'Épuisé'}</span>
        <span role="cell"><label class="interrupteur"><input type="checkbox" data-visible="${p.id}" ${p.visible ? 'checked' : ''} aria-label="${esc(p.nom)} en ligne"><span class="sr">En ligne</span></label></span>
        <span role="cell" class="ad-ordre">
          <button type="button" data-monter="${i}" aria-label="Avancer ${esc(p.nom)}" ${i ? '' : 'disabled'}>↑</button>
          <button type="button" data-descendre="${i}" aria-label="Reculer ${esc(p.nom)}" ${i < produits.length - 1 ? '' : 'disabled'}>↓</button>
        </span>
      </div>`
    }).join('')
    : '<p class="vide">Aucun vêtement pour l’instant. Cliquez sur « Ajouter un vêtement » et importez une photo.</p>'
}
$('[data-liste-produits]').addEventListener('click', async (e) => {
  const o = e.target.closest('[data-ouvrir]'); if (o) { ouvrirFiche(o.dataset.ouvrir); return }
  const up = e.target.closest('[data-monter]'); const down = e.target.closest('[data-descendre]')
  if (up || down) {
    const i = +(up || down).dataset[up ? 'monter' : 'descendre']; const j = up ? i - 1 : i + 1
    const ids = produits.map((p) => p.id); [ids[i], ids[j]] = [ids[j], ids[i]]
    await appel('/api/admin/produits/ordre', { method: 'POST', body: { ids } })
    await chargerProduits(); $(`[data-${up ? 'monter' : 'descendre'}="${j}"]`)?.focus()
  }
})
$('[data-liste-produits]').addEventListener('change', async (e) => {
  const v = e.target.closest('[data-visible]'); if (!v) return
  try { await appel(`/api/admin/produits/${v.dataset.visible}`, { method: 'PATCH', body: { visible: v.checked } }); toast(v.checked ? 'En ligne.' : 'Masqué de la boutique.') } catch (err) { v.checked = !v.checked; toast(err.message) }
  chargerProduits()
})
$('[data-nouveau]').addEventListener('click', async () => {
  const p = await appel('/api/admin/produits/brouillon', { method: 'POST' })
  await chargerProduits()
  ouvrirFiche(p.id, true)
})

/* ---------- Fiche d'un vêtement ---------- */
const fiche = $('[data-fiche]'); const form = $('[data-form-produit]')
let P = null // produit tel qu'enregistré
let E = null // état en cours d'édition
let suivi = null
let nouveau = false

async function ouvrirFiche (id, estNouveau = false) {
  nouveau = estNouveau
  P = await appel(`/api/admin/produits/${id}`)
  E = depuisProduit(P)
  form.nom.value = estNouveau ? '' : P.nom; form.reference.value = P.reference
  form.prix.value = P.prix_centimes ? String(P.prix_centimes / 100).replace('.', ',') : ''
  form.type.value = P.type; form.description.value = P.description
  form.nouveau.checked = P.nouveau; form.visible.checked = P.visible
  $('[data-fiche-titre]').textContent = estNouveau ? 'Nouveau vêtement' : P.nom
  $('[data-err-produit]').textContent = ''
  peindreFiche()
  fiche.hidden = false; document.documentElement.classList.add('bloque')
  fiche.scrollTop = 0
  if (estNouveau) $('[data-depot]').focus()
  suivrePhotos()
}
function depuisProduit (p) {
  const stocks = {}
  for (const v of p.variantes) stocks[`${v.couleur_id}|${v.taille}`] = { stock: v.stock, avant: v.stock, sku: v.sku }
  return {
    tailles: [...p.tailles],
    couleurs: p.couleurs.map((c) => ({ id: c.id, cle: c.id, nom: c.nom, hex: c.hex })),
    collections: new Set(p.collections),
    photos: p.photos.map((x) => ({ ...x, couleur: x.couleur_id })),
    stocks
  }
}
async function fermerFiche () {
  clearTimeout(suivi)
  // Brouillon abandonné sans rien : on le supprime.
  if (nouveau && P && !E.photos.length && !form.nom.value.trim()) await appel(`/api/admin/produits/${P.id}`, { method: 'DELETE' }).catch(() => {})
  fiche.hidden = true; document.documentElement.classList.remove('bloque'); P = null; E = null
  chargerProduits()
}
$('[data-fiche-fermer]').addEventListener('click', fermerFiche)

function peindreFiche () { peindrePhotos(); peindreTailles(); peindreCouleurs(); peindreStock(); peindreCollectionsFiche() }

function peindrePhotos () {
  const opts = (sel) => ['<option value="">Toutes les couleurs</option>', ...E.couleurs.map((c) => `<option value="${esc(c.cle)}" ${c.cle === sel ? 'selected' : ''}>${esc(c.nom || 'Sans nom')}</option>`)].join('')
  $('[data-photos]').innerHTML = E.photos.map((x, k) => {
    const etat = x.statut === 'pret' ? '' : x.statut === 'erreur' ? `<span class="ph-etat ph-etat--err">${esc(x.erreur || 'Erreur')}<button type="button" class="lnk" data-relancer="${k}">Réessayer</button></span>` : '<span class="ph-etat"><i class="rond" aria-hidden="true"></i>Détourage…</span>'
    return `<li class="ph">
      <div class="ph__img">${x.vignette ? `<img src="${esc(x.vignette)}" alt="Photo ${k + 1}" width="132" height="175">` : ''}${etat}</div>
      <label class="f f--s"><span>Vue</span><select data-role="${k}">
        <option value="face" ${x.role === 'face' ? 'selected' : ''}>Devant</option><option value="dos" ${x.role === 'dos' ? 'selected' : ''}>Dos</option><option value="detail" ${x.role === 'detail' ? 'selected' : ''}>Détail</option>
      </select></label>
      <label class="f f--s"><span>Couleur</span><select data-ph-couleur="${k}">${opts(x.couleur)}</select></label>
      <div class="ph__act">
        <button type="button" class="lnk" data-corriger="${k}" ${x.statut === 'pret' ? '' : 'disabled'}>Corriger</button>
        <button type="button" class="lnk lnk--danger" data-suppr-photo="${k}" aria-label="Supprimer la photo ${k + 1}">Supprimer</button>
      </div>
    </li>`
  }).join('')
}
$('[data-photos]').addEventListener('change', (e) => {
  const r = e.target.dataset.role; const c = e.target.dataset.phCouleur
  if (r != null) E.photos[+r].role = e.target.value
  if (c != null) E.photos[+c].couleur = e.target.value || null
})
$('[data-photos]').addEventListener('click', async (e) => {
  const s = e.target.closest('[data-suppr-photo]'); const c = e.target.closest('[data-corriger]'); const r = e.target.closest('[data-relancer]')
  if (s) {
    const x = E.photos[+s.dataset.supprPhoto]
    if (!confirm('Supprimer cette photo ?')) return
    await appel(`/api/admin/photos/${x.id}`, { method: 'DELETE' })
    E.photos.splice(+s.dataset.supprPhoto, 1); peindrePhotos()
  }
  if (c) ouvrirEditeur(E.photos[+c.dataset.corriger])
  if (r) { await appel(`/api/admin/photos/${E.photos[+r.dataset.relancer].id}/detourer`, { method: 'POST' }); E.photos[+r.dataset.relancer].statut = 'en_attente'; peindrePhotos(); suivrePhotos() }
})

// Import des photos (clic ou glisser-déposer)
const depot = $('[data-depot]'); const entree = $('[data-fichiers]')
entree.addEventListener('change', () => { envoyer([...entree.files]); entree.value = '' })
depot.addEventListener('dragover', (e) => { e.preventDefault(); depot.classList.add('is-over') })
depot.addEventListener('dragleave', () => depot.classList.remove('is-over'))
depot.addEventListener('drop', (e) => { e.preventDefault(); depot.classList.remove('is-over'); envoyer([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'))) })
async function envoyer (fichiers) {
  if (!fichiers.length || !P) return
  const fd = new FormData()
  for (const f of fichiers.slice(0, 12)) fd.append('photos', f, f.name)
  depot.classList.add('is-busy'); depot.querySelector('b').textContent = 'Envoi…'
  try {
    const { photos } = await appel(`/api/admin/produits/${P.id}/photos`, { method: 'POST', body: fd })
    for (const x of photos) E.photos.push({ ...x, couleur: x.couleur_id, reglages: {}, vignette: null })
    peindrePhotos(); suivrePhotos()
    if (fichiers.length > 12) toast('12 photos au plus à la fois : les suivantes n’ont pas été envoyées.')
  } catch (err) { toast(err.message) } finally { depot.classList.remove('is-busy'); depot.querySelector('b').textContent = 'Importer des photos' }
}

// Suivi du détourage : on interroge le serveur tant que des photos sont en cours.
function suivrePhotos () {
  clearTimeout(suivi)
  if (!P || !E.photos.some((x) => ['en_attente', 'traitement'].includes(x.statut))) return
  suivi = setTimeout(async () => {
    if (!P) return
    const frais = await appel(`/api/admin/produits/${P.id}`).catch(() => null)
    if (frais && P && frais.id === P.id) {
      for (const x of E.photos) {
        const f = frais.photos.find((y) => y.id === x.id); if (!f) continue
        const devientPrete = x.statut !== 'pret' && f.statut === 'pret'
        Object.assign(x, { statut: f.statut, erreur: f.erreur, vignette: f.vignette, portant: f.portant, reglages: f.reglages, version: f.version })
        // Première photo prête et aucune couleur : on propose la couleur reconnue.
        if (devientPrete && !E.couleurs.length && f.reglages?.hex) {
          const cle = `n${Date.now()}`
          E.couleurs.push({ cle, nom: nomCouleur(f.reglages.hex), hex: f.reglages.hex })
          for (const y of E.photos) if (!y.couleur) y.couleur = cle
          peindreCouleurs(); peindreStock()
          toast(`Couleur reconnue : ${nomCouleur(f.reglages.hex)}. Vous pouvez la renommer.`)
        }
      }
      peindrePhotos()
    }
    suivrePhotos()
  }, 1200)
}

function peindreTailles () {
  const toutes = [...new Set([...TAILLES_COURANTES, ...E.tailles])]
  $('[data-tailles]').innerHTML = toutes.map((t) => `<label class="puce"><input type="checkbox" value="${esc(t)}" ${E.tailles.includes(t) ? 'checked' : ''}><span>${esc(t)}</span></label>`).join('')
}
$('[data-tailles]').addEventListener('change', () => {
  const ordre = [...new Set([...TAILLES_COURANTES, ...E.tailles])]
  E.tailles = ordre.filter((t) => $(`[data-tailles] input[value="${CSS.escape(t)}"]`)?.checked)
  peindreStock()
})
const ajouterTaille = () => {
  const i = $('[data-nouvelle-taille]'); const t = i.value.trim()
  if (t && !E.tailles.includes(t)) { E.tailles.push(t); peindreTailles(); peindreStock() }
  i.value = ''
}
$('[data-ajouter-taille]').addEventListener('click', ajouterTaille)
$('[data-nouvelle-taille]').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterTaille() } })

function peindreCouleurs () {
  $('[data-couleurs]').innerHTML = E.couleurs.map((c, k) => `<li class="couleur">
    <input type="color" value="${esc(c.hex)}" data-hex="${k}" aria-label="Pastille de la couleur ${k + 1}">
    <input value="${esc(c.nom)}" data-nom-couleur="${k}" placeholder="Nom de la couleur" aria-label="Nom de la couleur ${k + 1}">
    <button type="button" class="lnk lnk--danger" data-suppr-couleur="${k}">Retirer</button>
  </li>`).join('') || '<li class="sub">Aucune couleur. Elle est proposée automatiquement quand la première photo est prête.</li>'
}
$('[data-couleurs]').addEventListener('input', (e) => {
  const h = e.target.dataset.hex; const n = e.target.dataset.nomCouleur
  if (h != null) E.couleurs[+h].hex = e.target.value
  if (n != null) { E.couleurs[+n].nom = e.target.value; peindreStockEntetes() }
})
$('[data-couleurs]').addEventListener('change', (e) => { if (e.target.dataset.nomCouleur != null) peindrePhotos() })
$('[data-couleurs]').addEventListener('click', (e) => {
  const s = e.target.closest('[data-suppr-couleur]'); if (!s) return
  const [c] = E.couleurs.splice(+s.dataset.supprCouleur, 1)
  for (const x of E.photos) if (x.couleur === c.cle) x.couleur = null
  peindreCouleurs(); peindreStock(); peindrePhotos()
})
$('[data-ajouter-couleur]').addEventListener('click', () => {
  E.couleurs.push({ cle: `n${Date.now()}`, nom: '', hex: '#888888' })
  peindreCouleurs(); peindreStock(); peindrePhotos()
  $$('[data-nom-couleur]').at(-1)?.focus()
})

function peindreStock () {
  if (!E.couleurs.length || !E.tailles.length) { $('[data-stock]').innerHTML = '<p class="sub">Choisissez au moins une taille et une couleur.</p>'; return }
  const ref = form.reference.value.trim().toUpperCase() || P.reference
  $('[data-stock]').innerHTML = `<table><thead><tr><th scope="col"><span class="sr">Couleur</span></th>${E.tailles.map((t) => `<th scope="col">${esc(t)}</th>`).join('')}<th scope="col">Total</th></tr></thead><tbody>
    ${E.couleurs.map((c) => {
      const cases = E.tailles.map((t) => {
        const s = E.stocks[`${c.cle}|${t}`] || { stock: 0 }
        return `<td><input type="number" min="0" step="1" inputmode="numeric" value="${s.stock}" data-stock-cle="${esc(c.cle)}|${esc(t)}" aria-label="Stock ${esc(c.nom)} ${esc(t)}"><small>${esc(s.sku || skuAuto(ref, c.nom, t))}</small></td>`
      }).join('')
      const total = E.tailles.reduce((n, t) => n + (Number(E.stocks[`${c.cle}|${t}`]?.stock) || 0), 0)
      return `<tr><th scope="row"><i class="dot" style="--c:${esc(c.hex)}"></i><span data-entete-couleur="${esc(c.cle)}">${esc(c.nom || 'Sans nom')}</span></th>${cases}<td class="total">${total}</td></tr>`
    }).join('')}</tbody></table>`
}
function peindreStockEntetes () { for (const c of E.couleurs) { const el = $(`[data-entete-couleur="${CSS.escape(c.cle)}"]`); if (el) el.textContent = c.nom || 'Sans nom' } }
$('[data-stock]').addEventListener('input', (e) => {
  const k = e.target.dataset.stockCle; if (!k) return
  E.stocks[k] = { ...(E.stocks[k] || {}), stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) }
  const tr = e.target.closest('tr'); const tot = [...tr.querySelectorAll('input')].reduce((n, i) => n + (Number(i.value) || 0), 0)
  tr.querySelector('.total').textContent = tot
})
form.reference.addEventListener('change', peindreStock)

function peindreCollectionsFiche () {
  $('[data-fiche-collections]').innerHTML = collections.length
    ? collections.map((c) => `<label class="puce"><input type="checkbox" value="${c.id}" ${E.collections.has(c.id) ? 'checked' : ''}><span>${esc(c.nom)}</span></label>`).join('')
    : '<span class="sub">Aucune collection. Créez-en dans l’onglet Collections.</span>'
}
$('[data-fiche-collections]').addEventListener('change', (e) => { const v = e.target.value; e.target.checked ? E.collections.add(v) : E.collections.delete(v) })

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const err = $('[data-err-produit]'); err.textContent = ''
  const prix = Math.round(Number(form.prix.value.replace(/\s/g, '').replace(',', '.')) * 100)
  const corps = {
    reference: form.reference.value.trim().toUpperCase(), nom: form.nom.value.trim(), type: form.type.value.trim(),
    description: form.description.value.trim(), prix_centimes: Number.isFinite(prix) ? prix : -1,
    tailles: E.tailles, visible: form.visible.checked, nouveau: form.nouveau.checked, collections: [...E.collections],
    couleurs: E.couleurs.map((c) => ({ id: c.id, cle: c.cle, nom: c.nom.trim(), hex: c.hex })),
    photos: E.photos.map((x, i) => ({ id: x.id, couleur: x.couleur, role: x.role, ordre: i })),
    stocks: Object.entries(E.stocks).map(([k, s]) => { const [couleur, ...t] = k.split('|'); return { couleur, taille: t.join('|'), stock: s.stock, avant: s.avant ?? null } })
  }
  if (corps.nom.length < 2) { err.textContent = 'Donnez un nom au vêtement.'; form.nom.focus(); return }
  if (!(corps.prix_centimes >= 0) || (corps.visible && !corps.prix_centimes)) { err.textContent = 'Indiquez le prix, par exemple 89.'; form.prix.focus(); return }
  if (!corps.tailles.length) { err.textContent = 'Cochez au moins une taille.'; return }
  if (corps.couleurs.some((c) => !c.nom)) { err.textContent = 'Chaque couleur a besoin d’un nom.'; $('[data-nom-couleur]')?.focus(); return }
  const b = $('[data-enregistrer]'); b.disabled = true; b.textContent = 'Enregistrement…'
  try {
    P = await appel(`/api/admin/produits/${P.id}`, { method: 'PUT', body: corps })
    const photosLocales = E.photos
    E = depuisProduit(P)
    // garder l'état des photos encore en traitement
    for (const x of E.photos) { const l = photosLocales.find((y) => y.id === x.id); if (l && x.statut !== 'pret') Object.assign(x, { statut: x.statut }) }
    nouveau = false
    $('[data-fiche-titre]').textContent = P.nom
    peindreFiche(); suivrePhotos()
    toast(P.visible ? 'Enregistré. Le vêtement est en ligne.' : 'Enregistré (masqué de la boutique).')
  } catch (er) { err.textContent = er.message } finally { b.disabled = false; b.textContent = 'Enregistrer' }
})
$('[data-supprimer]').addEventListener('click', async () => {
  if (!P || !confirm(`Supprimer « ${P.nom} » et ses photos ? Cette action est définitive.`)) return
  await appel(`/api/admin/produits/${P.id}`, { method: 'DELETE' })
  nouveau = false; await fermerFiche(); toast('Vêtement supprimé.')
})

/* ---------- Correction du détourage et de la position ---------- */
const ed = $('[data-editeur]'); const cv = $('[data-canvas]'); const zone = $('[data-zone]')
const X = { ph: null, original: null, masque: null, outil: 'gomme', taille: 36, histoire: [], cadre: { s: 1, ox: 0, oy: 0 }, curseur: null, modifie: false }

async function ouvrirEditeur (ph) {
  X.ph = ph; X.histoire = []; X.modifie = false
  ed.hidden = false
  $('[data-edit-etat]').textContent = 'Chargement de la photo…'
  majPortant()
  majReglagesUI()
  const [o, m] = await Promise.all([image(`/api/admin/photos/${ph.id}/original`), image(`/api/admin/photos/${ph.id}/masque`)])
  X.original = o
  // masque en niveaux de gris → toile dont l'opacité est le masque
  const c = document.createElement('canvas'); c.width = o.naturalWidth; c.height = o.naturalHeight
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(m, 0, 0, c.width, c.height)
  const d = x.getImageData(0, 0, c.width, c.height)
  for (let i = 0; i < d.data.length; i += 4) { d.data[i + 3] = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255 }
  x.putImageData(d, 0, 0)
  X.masque = c
  $('[data-edit-etat]').textContent = ''
  majBoutonsEditeur(); dessiner()
}
function image (url) {
  return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url })
}
function majPortant () {
  const src = X.ph.portant ? `${X.ph.portant}` : ''
  $('[data-edit-portant]').src = src
}
function majReglagesUI () {
  const r = X.ph.reglages || {}
  for (const b of $$('[data-cintre]')) b.setAttribute('aria-pressed', String((r.cintre || 'auto') === b.dataset.cintre))
  $('[data-reglage="echelle"]').value = r.echelle ?? 1
  $('[data-reglage="dx"]').value = r.dx ?? 0
  $('[data-reglage="dy"]').value = r.dy ?? 0
}
function majBoutonsEditeur () {
  for (const b of $$('[data-outil]')) b.setAttribute('aria-pressed', String(b.dataset.outil === X.outil))
  $('[data-defaire]').disabled = !X.histoire.length
  $('[data-enregistrer-masque]').disabled = !X.modifie
}
function dessiner () {
  if (!X.original || ed.hidden) return
  const dpr = Math.min(2, devicePixelRatio || 1); const W = zone.clientWidth; const H = zone.clientHeight
  if (!W || !H) return
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'
  const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0)
  const o = X.original; const s = Math.min((W - 12) / o.naturalWidth, (H - 12) / o.naturalHeight)
  X.cadre = { s, ox: (W - o.naturalWidth * s) / 2, oy: (H - o.naturalHeight * s) / 2 }
  const t = 12
  for (let yy = 0; yy < H; yy += t) for (let xx = 0; xx < W; xx += t) { x.fillStyle = ((xx + yy) / t) % 2 ? '#e7e4dd' : '#f6f4ef'; x.fillRect(xx, yy, t, t) }
  x.globalAlpha = 0.2; x.drawImage(o, X.cadre.ox, X.cadre.oy, o.naturalWidth * s, o.naturalHeight * s); x.globalAlpha = 1
  const c = document.createElement('canvas'); c.width = o.naturalWidth; c.height = o.naturalHeight
  const cx = c.getContext('2d'); cx.drawImage(o, 0, 0); cx.globalCompositeOperation = 'destination-in'; cx.drawImage(X.masque, 0, 0)
  x.drawImage(c, X.cadre.ox, X.cadre.oy, o.naturalWidth * s, o.naturalHeight * s)
  if (X.curseur) { x.beginPath(); x.arc(X.curseur.x, X.curseur.y, X.taille / 2, 0, Math.PI * 2); x.strokeStyle = X.outil === 'gomme' ? '#b42318' : '#2f6b45'; x.lineWidth = 1.5; x.stroke() }
}
new ResizeObserver(dessiner).observe(zone)
let trait = null; let raf = false
const planifier = () => { if (!raf) { raf = true; requestAnimationFrame(() => { raf = false; dessiner() }) } }
const versPhoto = (e) => { const r = cv.getBoundingClientRect(); const sx = e.clientX - r.left; const sy = e.clientY - r.top; return { sx, sy, x: (sx - X.cadre.ox) / X.cadre.s, y: (sy - X.cadre.oy) / X.cadre.s } }
cv.addEventListener('pointerdown', (e) => {
  if (!X.masque) return
  e.preventDefault(); cv.setPointerCapture(e.pointerId)
  X.histoire.push(X.masque.getContext('2d').getImageData(0, 0, X.masque.width, X.masque.height)); if (X.histoire.length > 6) X.histoire.shift()
  trait = versPhoto(e); peindre(trait, trait); X.modifie = true; majBoutonsEditeur()
})
cv.addEventListener('pointermove', (e) => { const p = versPhoto(e); X.curseur = { x: p.sx, y: p.sy }; if (trait) { peindre(trait, p); trait = p } planifier() })
for (const ev of ['pointerup', 'pointercancel']) cv.addEventListener(ev, () => { trait = null })
cv.addEventListener('pointerleave', () => { X.curseur = null; planifier() })
function peindre (a, b) {
  const x = X.masque.getContext('2d'); x.save()
  x.globalCompositeOperation = X.outil === 'gomme' ? 'destination-out' : 'source-over'
  x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineWidth = X.taille / X.cadre.s
  x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x + 0.01, b.y); x.stroke(); x.restore()
  planifier()
}
for (const b of $$('[data-outil]')) b.addEventListener('click', () => { X.outil = b.dataset.outil; majBoutonsEditeur() })
$('[data-taille-pinceau]').addEventListener('input', (e) => { X.taille = +e.target.value })
$('[data-defaire]').addEventListener('click', () => { const d = X.histoire.pop(); if (d) { X.masque.getContext('2d').putImageData(d, 0, 0); X.modifie = X.histoire.length > 0; majBoutonsEditeur(); dessiner() } })
$('[data-enregistrer-masque]').addEventListener('click', async () => {
  const b = $('[data-enregistrer-masque]'); b.disabled = true; $('[data-edit-etat]').textContent = 'Application de la retouche…'
  try {
    const blob = await new Promise((r) => X.masque.toBlob(r, 'image/png'))
    apresCorrection(await appel(`/api/admin/photos/${X.ph.id}/masque`, { method: 'PUT', body: blob }))
    X.modifie = false; X.histoire = []; $('[data-edit-etat]').textContent = 'Retouche appliquée.'
  } catch (e) { $('[data-edit-etat]').textContent = e.message } finally { majBoutonsEditeur() }
})
let attente = null
function envoyerReglages (r) {
  X.ph.reglages = { ...X.ph.reglages, ...r }
  clearTimeout(attente)
  $('[data-edit-etat]').textContent = 'Mise à jour de l’aperçu…'
  attente = setTimeout(async () => {
    try { apresCorrection(await appel(`/api/admin/photos/${X.ph.id}`, { method: 'PUT', body: { reglages: X.ph.reglages } })); $('[data-edit-etat]').textContent = '' } catch (e) { $('[data-edit-etat]').textContent = e.message }
  }, 350)
}
for (const b of $$('[data-cintre]')) b.addEventListener('click', () => { envoyerReglages({ cintre: b.dataset.cintre }); majReglagesUI() })
for (const i of $$('[data-reglage]')) i.addEventListener('input', () => envoyerReglages({ [i.dataset.reglage]: Number(i.value) }))
$('[data-reinit-position]').addEventListener('click', () => { envoyerReglages({ cintre: 'auto', echelle: 1, dx: 0, dy: 0 }); majReglagesUI() })
function apresCorrection (produit) {
  const f = produit.photos.find((y) => y.id === X.ph.id)
  if (f) { Object.assign(X.ph, { portant: f.portant, vignette: f.vignette, reglages: f.reglages, version: f.version }); majPortant() }
  if (E) { const l = E.photos.find((y) => y.id === X.ph.id); if (l) Object.assign(l, { portant: f.portant, vignette: f.vignette, reglages: f.reglages, version: f.version }); peindrePhotos() }
}
$('[data-edit-fermer]').addEventListener('click', () => {
  if (X.modifie && !confirm('La retouche n’a pas été appliquée. Fermer quand même ?')) return
  ed.hidden = true; X.original = null; X.masque = null
})

/* ---------- Collections ---------- */
async function chargerCollections () {
  collections = (await appel('/api/admin/collections')).collections
  $('[data-liste-collections]').innerHTML = collections.map((c) => `<li class="col">
    <input value="${esc(c.nom)}" data-col-nom="${c.id}" aria-label="Nom de la collection">
    <span class="sub">${c.nb} vêtement${c.nb > 1 ? 's' : ''}</span>
    <label class="interrupteur"><input type="checkbox" data-col-visible="${c.id}" ${c.visible ? 'checked' : ''}> <span>Visible</span></label>
    <button type="button" class="lnk lnk--danger" data-col-suppr="${c.id}">Supprimer</button>
  </li>`).join('') || '<li class="sub">Aucune collection.</li>'
}
$('[data-form-collection]').addEventListener('submit', async (e) => {
  e.preventDefault(); const i = e.currentTarget.nom
  try { await appel('/api/admin/collections', { method: 'POST', body: { nom: i.value } }); i.value = ''; chargerCollections() } catch (er) { toast(er.message) }
})
$('[data-liste-collections]').addEventListener('change', async (e) => {
  const n = e.target.dataset.colNom; const v = e.target.dataset.colVisible
  if (n) await appel(`/api/admin/collections/${n}`, { method: 'PUT', body: { nom: e.target.value } })
  if (v) await appel(`/api/admin/collections/${v}`, { method: 'PUT', body: { visible: e.target.checked } })
  toast('Collection enregistrée.'); chargerCollections()
})
$('[data-liste-collections]').addEventListener('click', async (e) => {
  const s = e.target.closest('[data-col-suppr]'); if (!s || !confirm('Supprimer cette collection ? Les vêtements ne sont pas supprimés.')) return
  await appel(`/api/admin/collections/${s.dataset.colSuppr}`, { method: 'DELETE' }); chargerCollections()
})

/* ---------- Commandes ---------- */
let filtre = 'a_traiter'
async function compterCommandes () {
  const { commandes } = await appel('/api/admin/commandes')
  const n = commandes.filter((c) => ['payee', 'preparee'].includes(c.statut)).length
  const p = $('[data-a-traiter]'); p.hidden = !n; p.textContent = n
  return commandes
}
async function chargerCommandes () {
  const toutes = await compterCommandes()
  const liste = filtre === 'a_traiter' ? toutes.filter((c) => ['payee', 'preparee'].includes(c.statut)) : toutes
  const ca = toutes.filter((c) => !['en_attente_paiement', 'annulee', 'expiree'].includes(c.statut)).reduce((s, c) => s + c.total_centimes, 0)
  $('[data-resume-commandes]').textContent = `${toutes.length} commande${toutes.length > 1 ? 's' : ''} · ${euros(ca)} encaissés`
  $('[data-liste-commandes]').innerHTML = liste.map((c) => `<li><button type="button" class="cmd" data-cmd="${c.id}">
    <span><b>n° ${c.numero}</b> · ${esc(c.client.nom)}<small>${new Date(c.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} · ${c.articles} article${c.articles > 1 ? 's' : ''} · ${c.livraison_mode === 'retrait' ? 'retrait' : 'livraison'}</small></span>
    <span class="cmd__r"><b>${euros(c.total_centimes)}</b><span class="badge badge--${c.statut}">${STATUTS[c.statut]}</span></span>
  </button></li>`).join('') || `<li class="sub">${filtre === 'a_traiter' ? 'Aucune commande à traiter.' : 'Aucune commande.'}</li>`
}
for (const b of $$('[data-filtre]')) b.addEventListener('click', () => { filtre = b.dataset.filtre; for (const o of $$('[data-filtre]')) o.setAttribute('aria-pressed', String(o === b)); chargerCommandes() })
$('[data-liste-commandes]').addEventListener('click', (e) => { const b = e.target.closest('[data-cmd]'); if (b) afficherCommande(b.dataset.cmd) })
async function afficherCommande (id) {
  const c = await appel(`/api/admin/commandes/${id}`)
  const a = c.client.adresse
  const box = $('[data-commande]'); box.hidden = false
  box.innerHTML = `<h2>Commande n° ${c.numero} <span class="badge badge--${c.statut}">${STATUTS[c.statut]}</span></h2>
    <p class="sub">${new Date(c.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}${c.payee_at ? ` · payée le ${new Date(c.payee_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}` : ''}</p>
    <h3>Client</h3>
    <p>${esc(c.client.nom)}<br><a href="mailto:${esc(c.client.email)}">${esc(c.client.email)}</a>${c.client.telephone ? `<br>${esc(c.client.telephone)}` : ''}</p>
    <h3>${c.livraison_mode === 'retrait' ? 'Retrait en boutique' : 'Livraison'}</h3>
    <p>${a ? `${esc(a.ligne)}<br>${esc(a.code_postal)} ${esc(a.ville)}` : 'Le client passe en boutique.'}</p>
    <h3>Articles</h3>
    <ul class="lignes">${c.lignes.map((l) => `<li><span>${esc(l.nom)}<small>${esc(l.couleur)} · ${esc(l.taille)} · réf. ${esc(l.sku)}</small></span><span>× ${l.quantite}</span><b>${euros(l.prix_unitaire_centimes * l.quantite)}</b></li>`).join('')}</ul>
    <p class="totaux">Livraison ${c.livraison_centimes ? euros(c.livraison_centimes) : 'offerte'} · <b>Total ${euros(c.total_centimes)}</b></p>
    <div class="actions">${(ACTIONS[c.statut] || []).map((s) => `<button type="button" class="btn ${s === 'annulee' ? 'btn--line' : ''} btn--s" data-statut="${s}" data-id="${c.id}">${LIBELLE_ACTION[s]}</button>`).join('')}</div>`
  box.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}
$('[data-commande]').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-statut]'); if (!b) return
  if (b.dataset.statut === 'annulee' && !confirm('Annuler cette commande ? Les pièces reviennent en stock. Pensez à rembourser le client depuis Stripe.')) return
  try { await appel(`/api/admin/commandes/${b.dataset.id}`, { method: 'PUT', body: { statut: b.dataset.statut } }); await chargerCommandes(); afficherCommande(b.dataset.id); toast('Commande mise à jour.') } catch (er) { toast(er.message) }
})

/* ---------- Boutique ---------- */
const fb = $('[data-form-boutique]')
async function chargerBoutique () {
  const b = await appel('/api/admin/boutique')
  fb.nom.value = b.nom; fb.slogan.value = b.slogan
  fb.fond.value = b.couleurs.fond; fb.texte.value = b.couleurs.texte; fb.accent.value = b.couleurs.accent
  fb.livraison.value = String(b.livraison_centimes / 100).replace('.', ','); fb.offerte.value = String(b.livraison_offerte_centimes / 100).replace('.', ',')
  fb.retrait.value = b.retrait_adresse
  fb.paiement.value = b.paiement_mode
  $('[data-logo-apercu]').innerHTML = b.logo ? `<img src="${esc(b.logo)}" alt="Logo actuel">` : 'Aucun logo'
  $('[data-domaines]').innerHTML = b.domaines.map((d) => `<li><a href="https://${esc(d)}" target="_blank" rel="noopener">${esc(d)}</a></li>`).join('') || '<li class="sub">Aucun domaine relié.</li>'
  const s = b.stripe
  $('[data-stripe-etat]').textContent = !s.configure ? 'Stripe n’est pas encore activé sur la plateforme : seul le paiement de test est disponible.'
    : !s.connecte ? 'Votre compte Stripe n’est pas encore relié.' : s.paiements_actifs ? 'Compte Stripe relié : les paiements sont actifs.' : 'Compte Stripe relié, inscription à terminer.'
  $('[data-stripe-lier]').hidden = !s.configure || !!s.paiements_actifs
}
const euroVersCentimes = (v) => Math.round(Number(String(v).replace(/\s/g, '').replace(',', '.')) * 100)
fb.addEventListener('submit', async (e) => {
  e.preventDefault(); $('[data-err-boutique]').textContent = ''
  try {
    await appel('/api/admin/boutique', {
      method: 'PUT',
      body: {
        nom: fb.nom.value, slogan: fb.slogan.value, couleurs: { fond: fb.fond.value, texte: fb.texte.value, accent: fb.accent.value },
        livraison_centimes: euroVersCentimes(fb.livraison.value), livraison_offerte_centimes: euroVersCentimes(fb.offerte.value),
        retrait_adresse: fb.retrait.value, paiement_mode: fb.paiement.value
      }
    })
    toast('Réglages enregistrés.'); for (const el of $$('[data-nom-boutique]')) el.textContent = fb.nom.value
  } catch (er) { $('[data-err-boutique]').textContent = er.message }
})
$('[data-logo-fichier]').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return
  const fd = new FormData(); fd.append('logo', f, f.name)
  try { const r = await appel('/api/admin/boutique/logo', { method: 'POST', body: fd }); $('[data-logo-apercu]').innerHTML = `<img src="${esc(r.logo)}" alt="Logo actuel">`; toast('Logo enregistré.') } catch (er) { toast(er.message) }
  e.target.value = ''
})
$('[data-stripe-lier]').addEventListener('click', async () => {
  try { const r = await appel('/api/admin/boutique/stripe', { method: 'POST' }); location.href = r.url } catch (er) { toast(er.message) }
})

/* ---------- Outils ---------- */
const slug = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 16) || 'X'
const skuAuto = (ref, couleur, taille) => `${ref}-${slug(couleur)}-${slug(taille)}`
const PALETTE = [['Noir', 20, 20, 20], ['Anthracite', 60, 60, 62], ['Gris', 140, 140, 140], ['Gris clair', 200, 200, 198], ['Blanc', 245, 245, 242], ['Écru', 236, 228, 210],
  ['Beige', 214, 196, 166], ['Camel', 170, 120, 70], ['Ocre', 160, 100, 20], ['Cognac', 140, 75, 30], ['Marron', 100, 66, 40], ['Chocolat', 70, 45, 30], ['Rouge', 200, 30, 30], ['Bordeaux', 110, 25, 40],
  ['Rose', 236, 170, 185], ['Rose poudré', 238, 198, 200], ['Fuchsia', 210, 40, 130], ['Orange', 235, 120, 40], ['Moutarde', 195, 145, 25], ['Jaune', 240, 210, 60],
  ['Vert', 50, 140, 70], ['Vert forêt', 30, 75, 45], ['Kaki', 110, 110, 70], ['Vert sauge', 160, 175, 145], ['Bleu', 40, 90, 190], ['Bleu ciel', 160, 195, 230],
  ['Marine', 25, 35, 65], ['Indigo', 35, 45, 80], ['Turquoise', 50, 170, 175], ['Violet', 110, 60, 140], ['Lilas', 190, 170, 215]]
function nomCouleur (hex) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); let best = PALETTE[0]; let bd = Infinity
  for (const p of PALETTE) { const r = (v[0] + p[1]) / 2; const d = (2 + r / 256) * (v[0] - p[1]) ** 2 + 4 * (v[1] - p[2]) ** 2 + (2 + (255 - r) / 256) * (v[2] - p[3]) ** 2; if (d < bd) { bd = d; best = p } }
  return best[0]
}
const tst = $('[data-toast]'); let tt
function toast (m) { tst.textContent = m; tst.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tst.classList.remove('is-on'), 3600) }
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (!ed.hidden) $('[data-edit-fermer]').click()
  else if (!fiche.hidden) fermerFiche()
})

demarrer()
