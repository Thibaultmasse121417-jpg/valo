/* Atelier : la boutique ajoute ses pièces elle-même, depuis son téléphone.
   Photo → détourage automatique → vérification sur le portant → nom, prix, tailles → en ligne. */
import '@fontsource-variable/inter-tight'
import './atelier.css'
import { donnees, EN_LIGNE } from './donnees.js'
import { preparerOutil, chargerPhoto, calculerMasque, aUnCintre, composer, detourer, couleurDominante, exporter, SORTIE } from './detourage.js'
import { euros } from './catalogue.js'

const MAX_PORTANT = 12 // même valeur que dans boutique.js

const $ = (s, c = document) => c.querySelector(s)
const $$ = (s, c = document) => [...c.querySelectorAll(s)]
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

let pieces = []

/* ---------- Démarrage ---------- */

async function demarrer () {
  const mode = $('[data-mode]')
  mode.hidden = false
  mode.textContent = EN_LIGNE
    ? 'Les pièces enregistrées ici apparaissent tout de suite sur la boutique.'
    : 'Démonstration : les pièces que vous ajoutez restent sur cet appareil. Ajoutez-en une, puis ouvrez la boutique.'
  if (EN_LIGNE) {
    $('[data-deco]').hidden = false
    const s = await donnees.session().catch(() => null)
    if (!s) { montrer('connexion'); return }
  } else {
    $('[data-reinit]').hidden = false
  }
  montrer('liste')
  await recharger()
}

function montrer (vue) {
  for (const v of $$('[data-vue]')) v.hidden = v.dataset.vue !== vue
}

$('[data-login]').addEventListener('submit', async (e) => {
  e.preventDefault()
  const f = e.currentTarget; const err = $('[data-login-err]')
  err.textContent = ''
  try {
    await donnees.connecter(f.email.value.trim(), f.mdp.value)
    montrer('liste'); await recharger()
  } catch {
    err.textContent = 'Adresse ou mot de passe incorrect.'
  }
})
$('[data-deco]').addEventListener('click', async () => { await donnees.deconnecter(); location.reload() })
$('[data-reinit]').addEventListener('click', async () => {
  if (!confirm('Remettre la démo à zéro ? Les pièces ajoutées sur cet appareil seront effacées.')) return
  await donnees.reinitialiser(); await recharger(); toast('La démo est revenue à son état de départ.')
})

/* ---------- Liste ---------- */

async function recharger () {
  try {
    pieces = await donnees.lister({ toutes: true })
  } catch (e) {
    console.error(e)
    $('[data-liste]').innerHTML = '<li class="at-vide">Impossible de charger les pièces. Vérifiez la connexion, puis rechargez la page.</li>'
    return
  }
  const visibles = pieces.filter((p) => p.visible !== false)
  const portant = new Set(visibles.slice(0, MAX_PORTANT).map((p) => p.id))
  $('[data-compte]').textContent = `${visibles.length} pièce${visibles.length > 1 ? 's' : ''} en ligne. Les ${MAX_PORTANT} premières vont sur le portant, l’ordre se règle avec les flèches.`
  $('[data-liste]').innerHTML = pieces.length
    ? pieces.map((p, i) => `
      <li class="at-item${p.visible === false ? ' is-off' : ''}" data-id="${esc(p.id)}">
        <button type="button" class="at-item__main" data-modifier="${esc(p.id)}" aria-label="Modifier ${esc(p.nom)}">
          <span class="at-item__img"><img src="${esc(p.couleurs[0]?.face)}" alt="" width="66" height="88" loading="lazy"></span>
          <span class="at-item__txt">
            <span class="at-item__nom">${esc(p.nom)}</span>
            <span class="at-item__meta">${euros(p.prix)} · ${p.couleurs.length > 1 ? `${p.couleurs.length} couleurs` : esc(p.couleurs[0]?.nom || '')}</span>
            <span class="at-item__etat">${p.visible === false ? 'Masquée' : portant.has(p.id) ? 'Sur le portant' : 'Dans la boutique'}${p.nouveau ? ' · Nouveau' : ''}</span>
          </span>
        </button>
        <div class="at-item__ord">
          <button type="button" data-monter="${i}" aria-label="Avancer ${esc(p.nom)} sur le portant" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-descendre="${i}" aria-label="Reculer ${esc(p.nom)} sur le portant" ${i === pieces.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </li>`).join('')
    : '<li class="at-vide">Aucune pièce pour l’instant. Touchez « Ajouter une pièce » et prenez votre premier vêtement en photo.</li>'
}

$('[data-liste]').addEventListener('click', async (e) => {
  const m = e.target.closest('[data-modifier]')
  if (m) { ouvrirFiche(pieces.find((p) => p.id === m.dataset.modifier)); return }
  const up = e.target.closest('[data-monter]'); const down = e.target.closest('[data-descendre]')
  if (up || down) {
    const i = Number((up || down).dataset[up ? 'monter' : 'descendre']); const j = up ? i - 1 : i + 1
    const ids = pieces.map((p) => p.id); [ids[i], ids[j]] = [ids[j], ids[i]]
    await donnees.ordonner(ids); await recharger()
    $(`[data-${up ? 'monter' : 'descendre'}="${j}"]`)?.focus()
  }
})

/* ---------- Choix de la photo ---------- */

const camera = $('[data-fichier]'); const galerie = $('[data-fichier-galerie]')
let attenteFichier = null
function choisirPhoto (titre) {
  preparerOutil().catch(() => {}) // le téléchargement de l'outil commence pendant la prise de vue
  $('[data-source-titre]').textContent = titre
  $('[data-source]').hidden = false
  $('[data-source-cam]').focus()
  return new Promise((resolve) => { attenteFichier?.(null); attenteFichier = resolve })
}
function finChoix (f) { $('[data-source]').hidden = true; const r = attenteFichier; attenteFichier = null; r?.(f) }
$('[data-source-cam]').addEventListener('click', () => { $('[data-source]').hidden = true; camera.value = ''; camera.click() })
$('[data-source-gal]').addEventListener('click', () => { $('[data-source]').hidden = true; galerie.value = ''; galerie.click() })
$('[data-source-non]').addEventListener('click', () => finChoix(null))
for (const inp of [camera, galerie]) {
  inp.addEventListener('change', () => finChoix(inp.files[0] || null))
  inp.addEventListener('cancel', () => finChoix(null))
}

/* ---------- Studio : détourage et retouche ---------- */

const studio = $('[data-studio]')
const cv = $('[data-canvas]')
const zone = $('[data-zone]')
const S = { photo: null, masque: null, cintre: 'ajout', onglet: 'apercu', outil: 'gomme', taille: 40, histoire: [], fin: null, compo: null, curseur: null }

function etat (txt, p = null, sub = '') {
  $('[data-studio-etat]').hidden = false; $('[data-studio-vue]').hidden = true
  $('[data-etat-txt]').textContent = txt
  $('[data-etat-sub]').innerHTML = sub
  const j = $('[data-etat-jauge]')
  j.parentElement.classList.toggle('is-indet', p == null)
  j.style.width = p == null ? '' : `${Math.round(p * 100)}%`
}

async function ouvrirStudio (fichier, titre) {
  Object.assign(S, { photo: null, masque: null, histoire: [], compo: null, onglet: 'apercu' })
  $('[data-studio-titre]').textContent = titre
  $('[data-studio-ok]').disabled = true
  studio.hidden = false
  document.documentElement.classList.add('at-bloque')
  return new Promise((resolve) => { S.fin = resolve; traiter(fichier) })
}

async function traiter (fichier) {
  try {
    etat('Lecture de la photo…')
    S.photo = await chargerPhoto(fichier)
    etat('Préparation de l’outil de détourage…', 0, 'Une seule fois sur cet appareil (44 Mo). Les fois suivantes, c’est immédiat.')
    await preparerOutil((p) => etat('Préparation de l’outil de détourage…', p, 'Une seule fois sur cet appareil (44 Mo). Les fois suivantes, c’est immédiat.'))
    etat('Détourage de la pièce…')
    S.masque = await calculerMasque(S.photo)
    S.cintre = aUnCintre(S.masque) ? 'mien' : 'ajout'
    $('[data-studio-etat]').hidden = true; $('[data-studio-vue]').hidden = false
    $('[data-studio-ok]').disabled = false
    majBoutons(); onglet('apercu')
  } catch (e) {
    console.error(e)
    etat('Le détourage n’a pas abouti.', 0, `${esc(e.message || '')}<br><button type="button" class="at-btn at-btn--s" data-reessayer>Réessayer</button>`)
    $('[data-reessayer]').addEventListener('click', () => traiter(fichier))
  }
}

function fermerStudio (resultat) {
  studio.hidden = true
  document.documentElement.classList.toggle('at-bloque', !$('[data-fiche]').hidden)
  const f = S.fin; S.fin = null; S.histoire = []
  f?.(resultat)
}
$('[data-studio-annuler]').addEventListener('click', () => fermerStudio(null))
$('[data-reprendre]').addEventListener('click', async () => {
  const f = await choisirPhoto($('[data-studio-titre]').textContent)
  if (f) traiter(f)
})
$('[data-studio-ok]').addEventListener('click', async () => {
  const b = $('[data-studio-ok]'); b.disabled = true; b.textContent = '…'
  try {
    const finale = composer(S.photo, S.masque, { cintre: S.cintre })
    const blob = await exporter(finale)
    fermerStudio({ blob, hex: couleurDominante(S.photo, S.masque) })
  } finally { b.textContent = 'Valider'; b.disabled = false }
})

for (const b of $$('[data-cintre]')) b.addEventListener('click', () => { S.cintre = b.dataset.cintre; S.compo = null; majBoutons(); dessiner() })
for (const b of $$('[data-outil]')) b.addEventListener('click', () => { S.outil = b.dataset.outil; majBoutons() })
for (const b of $$('[data-onglet]')) b.addEventListener('click', () => onglet(b.dataset.onglet))
$('[data-taille]').addEventListener('input', (e) => { S.taille = +e.target.value })
$('[data-defaire]').addEventListener('click', () => {
  const d = S.histoire.pop(); if (!d) return
  S.masque.getContext('2d').putImageData(d, 0, 0); S.compo = null; majBoutons(); dessiner()
})

function majBoutons () {
  for (const b of $$('[data-cintre]')) b.setAttribute('aria-pressed', String(b.dataset.cintre === S.cintre))
  for (const b of $$('[data-outil]')) b.setAttribute('aria-pressed', String(b.dataset.outil === S.outil))
  $('[data-defaire]').disabled = !S.histoire.length
}
function onglet (o) {
  S.onglet = o
  for (const b of $$('[data-onglet]')) b.setAttribute('aria-selected', String(b.dataset.onglet === o))
  $('[data-outils-apercu]').hidden = o !== 'apercu'
  $('[data-outils-retouche]').hidden = o !== 'retouche'
  $('[data-astuce]').textContent = o === 'apercu'
    ? 'Vérifiez la pièce sur le portant. Un défaut ? Ouvrez « Retoucher ».'
    : 'Passez la gomme sur ce qui dépasse. « Restaurer » fait revenir une partie effacée.'
  zone.classList.toggle('is-retouche', o === 'retouche')
  S.compo = null
  dessiner()
}

// Placement de l'image dans la toile d'affichage.
let cadre = { s: 1, ox: 0, oy: 0 }
function dessiner () {
  if (!S.photo || studio.hidden) return
  const dpr = Math.min(2, devicePixelRatio || 1)
  const W = zone.clientWidth; const H = zone.clientHeight
  if (!W || !H) return
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
  cv.style.width = W + 'px'; cv.style.height = H + 'px'
  const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0)
  x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, W, H)
  if (S.onglet === 'apercu') {
    if (!S.compo) S.compo = composer(S.photo, S.masque, { cintre: S.cintre })
    const s = Math.min((W - 24) / SORTIE.l, (H - 16) / SORTIE.h)
    const w = SORTIE.l * s; const h = SORTIE.h * s; const ox = (W - w) / 2; const oy = 8
    // la tringle, à la même hauteur que sur la boutique
    const yr = oy + 0.04 * w
    const g = x.createLinearGradient(0, yr, 0, yr + 5)
    g.addColorStop(0, '#fdfdfd'); g.addColorStop(0.55, '#b9b7b2'); g.addColorStop(1, '#8f8d88')
    x.fillStyle = g; x.fillRect(0, yr, W, 5)
    x.save(); x.shadowColor = 'rgba(40,30,20,.16)'; x.shadowBlur = 18 * s * 2; x.shadowOffsetY = 12 * s * 2
    x.drawImage(S.compo, ox, oy, w, h); x.restore()
  } else {
    const p = S.photo
    const s = Math.min((W - 16) / p.width, (H - 16) / p.height)
    cadre = { s, ox: (W - p.width * s) / 2, oy: (H - p.height * s) / 2 }
    // damier : on voit ce qui est transparent
    const t = 12
    for (let yy = 0; yy < H; yy += t) for (let xx = 0; xx < W; xx += t) { x.fillStyle = ((xx + yy) / t) % 2 ? '#e7e4dd' : '#f6f4ef'; x.fillRect(xx, yy, t, t) }
    x.globalAlpha = 0.22; x.drawImage(p, cadre.ox, cadre.oy, p.width * s, p.height * s); x.globalAlpha = 1
    x.drawImage(detourer(p, S.masque), cadre.ox, cadre.oy, p.width * s, p.height * s)
    if (S.curseur) {
      x.beginPath(); x.arc(S.curseur.x, S.curseur.y, S.taille / 2, 0, Math.PI * 2)
      x.strokeStyle = S.outil === 'gomme' ? '#b42318' : '#2f6b45'; x.lineWidth = 1.5; x.stroke()
    }
  }
}
new ResizeObserver(() => { S.compo = S.compo || null; dessiner() }).observe(zone)

// Gomme et pinceau.
let trait = null
let rafPrevu = false
function planifier () { if (!rafPrevu) { rafPrevu = true; requestAnimationFrame(() => { rafPrevu = false; dessiner() }) } }
function versPhoto (e) {
  const r = cv.getBoundingClientRect()
  const sx = e.clientX - r.left; const sy = e.clientY - r.top
  return { sx, sy, x: (sx - cadre.ox) / cadre.s, y: (sy - cadre.oy) / cadre.s }
}
cv.addEventListener('pointerdown', (e) => {
  if (S.onglet !== 'retouche') return
  e.preventDefault(); cv.setPointerCapture(e.pointerId)
  const mx = S.masque.getContext('2d', { willReadFrequently: true })
  S.histoire.push(mx.getImageData(0, 0, S.masque.width, S.masque.height))
  if (S.histoire.length > 6) S.histoire.shift()
  const p = versPhoto(e); trait = p
  peindre(p, p); majBoutons()
})
cv.addEventListener('pointermove', (e) => {
  if (S.onglet !== 'retouche') return
  const p = versPhoto(e); S.curseur = { x: p.sx, y: p.sy }
  if (trait) { peindre(trait, p); trait = p }
  planifier()
})
for (const ev of ['pointerup', 'pointercancel']) cv.addEventListener(ev, () => { trait = null; S.compo = null })
cv.addEventListener('pointerleave', () => { S.curseur = null; planifier() })
function peindre (a, b) {
  const x = S.masque.getContext('2d')
  x.save()
  x.globalCompositeOperation = S.outil === 'gomme' ? 'destination-out' : 'source-over'
  x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round'
  x.lineWidth = S.taille / cadre.s
  x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x + 0.01, b.y); x.stroke()
  x.restore()
  planifier()
}

/* ---------- Fiche d'une pièce ---------- */

const fiche = $('[data-fiche]')
const form = $('[data-form]')
let F = null // pièce en cours

function ouvrirFiche (p) {
  F = p
    ? { ...p, couleurs: p.couleurs.map((c) => ({ ...c })) }
    : { id: null, nom: '', prix: '', type: '', famille: 'hauts', texte: '', tailles: ['S', 'M', 'L'], visible: true, nouveau: true, couleurs: [] }
  $('[data-fiche-titre]').textContent = p ? 'Modifier la pièce' : 'Nouvelle pièce'
  form.nom.value = F.nom; form.prix.value = F.prix === '' ? '' : String(F.prix).replace('.', ',')
  form.type.value = F.type || ''; form.famille.value = F.famille || 'hauts'; form.texte.value = F.texte || ''
  form.visible.checked = F.visible !== false; form.nouveau.checked = !!F.nouveau
  const t = F.tailles || ['XS', 'S', 'M', 'L', 'XL']
  for (const c of $$('input', $('[data-tailles]'))) c.checked = t.includes(c.value)
  $('[data-supprimer]').hidden = !p
  for (const e of $$('.at-err', form)) e.textContent = ''
  peindreCouleurs()
  fiche.hidden = false
  document.documentElement.classList.add('at-bloque')
  fiche.scrollTop = 0
  if (p) form.nom.focus({ preventScroll: true })
}
function fermerFiche () {
  fiche.hidden = true; F = null
  document.documentElement.classList.remove('at-bloque')
}
$('[data-fermer]').addEventListener('click', fermerFiche)

const apercus = new Map()
function vue (v) {
  if (!(v instanceof Blob)) return v
  if (!apercus.has(v)) apercus.set(v, URL.createObjectURL(v))
  return apercus.get(v)
}
function peindreCouleurs () {
  $('[data-couleurs]').innerHTML = F.couleurs.map((c, k) => `
    <li class="at-col">
      <div class="at-col__imgs">
        <button type="button" class="at-col__img" data-remplacer="${k}" aria-label="Remplacer la photo de face">
          <img src="${esc(vue(c.face))}" alt="" width="132" height="175"><span>Face</span>
        </button>
        <button type="button" class="at-col__img${c.dos ? '' : ' is-vide'}" data-dos="${k}" aria-label="${c.dos ? 'Remplacer' : 'Ajouter'} la photo du dos">
          ${c.dos ? `<img src="${esc(vue(c.dos))}" alt="" width="132" height="175">` : '<b aria-hidden="true">+</b>'}<span>Dos${c.dos ? '' : ' (facultatif)'}</span>
        </button>
      </div>
      <div class="at-col__info">
        <label class="at-f"><span>Couleur</span>
          <span class="at-col__nom"><input type="color" value="${esc(c.hex || '#888888')}" data-hex="${k}" aria-label="Pastille de couleur"><input value="${esc(c.nom)}" data-nomcol="${k}" placeholder="Ex. Vert forêt" autocomplete="off"></span>
        </label>
        ${F.couleurs.length > 1 ? `<button type="button" class="at-lnk at-lnk--danger" data-retirer="${k}">Retirer cette couleur</button>` : ''}
      </div>
    </li>`).join('') || '<li class="at-vide at-vide--s">Pas encore de photo.</li>'
}
$('[data-couleurs]').addEventListener('input', (e) => {
  const h = e.target.dataset.hex; const n = e.target.dataset.nomcol
  if (h != null) F.couleurs[+h].hex = e.target.value
  if (n != null) F.couleurs[+n].nom = e.target.value
})
$('[data-couleurs]').addEventListener('click', async (e) => {
  const r = e.target.closest('[data-remplacer]'); const d = e.target.closest('[data-dos]'); const x = e.target.closest('[data-retirer]')
  if (x) { F.couleurs.splice(+x.dataset.retirer, 1); peindreCouleurs(); return }
  if (!r && !d) return
  const k = +(r || d).dataset[r ? 'remplacer' : 'dos']
  const f = await choisirPhoto(r ? 'Photo de face' : 'Photo du dos'); if (!f) return
  const res = await ouvrirStudio(f, r ? 'Photo de face' : 'Photo du dos'); if (!res) return
  if (r) { F.couleurs[k].face = res.blob; F.couleurs[k].hex = res.hex } else F.couleurs[k].dos = res.blob
  peindreCouleurs()
})
$('[data-ajouter-couleur]').addEventListener('click', async () => {
  const f = await choisirPhoto('Photo de l’autre couleur'); if (!f) return
  const res = await ouvrirStudio(f, 'Autre couleur'); if (!res) return
  F.couleurs.push({ nom: nomCouleur(res.hex), hex: res.hex, face: res.blob })
  peindreCouleurs()
  $$('[data-nomcol]').at(-1)?.select()
})

$('[data-ajouter]').addEventListener('click', async () => {
  const f = await choisirPhoto('Photo de la pièce'); if (!f) return
  const res = await ouvrirStudio(f, 'Nouvelle pièce'); if (!res) return
  ouvrirFiche(null)
  F.couleurs.push({ nom: nomCouleur(res.hex), hex: res.hex, face: res.blob })
  peindreCouleurs()
  form.nom.focus()
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const nom = form.nom.value.trim()
  const prix = Number(form.prix.value.replace(/\s/g, '').replace(',', '.'))
  const tailles = $$('input:checked', $('[data-tailles]')).map((c) => c.value)
  $('[data-err-nom]').textContent = nom ? '' : 'Donnez un nom à la pièce.'
  $('[data-err-prix]').textContent = prix > 0 ? '' : 'Indiquez un prix, par exemple 89.'
  $('[data-err-tailles]').textContent = tailles.length ? '' : 'Cochez au moins une taille.'
  if (!F.couleurs.length) { toast('Ajoutez d’abord une photo de la pièce.'); return }
  if (!nom) { form.nom.focus(); return }
  if (!(prix > 0)) { form.prix.focus(); return }
  if (!tailles.length) return
  const piece = {
    ...F, nom, prix, tailles,
    type: form.type.value.trim() || 'Pièce', famille: form.famille.value, texte: form.texte.value.trim(),
    visible: form.visible.checked, nouveau: form.nouveau.checked,
    couleurs: F.couleurs.map((c) => ({ nom: c.nom.trim() || nomCouleur(c.hex), hex: c.hex, face: c.face, ...(c.dos ? { dos: c.dos } : {}) }))
  }
  delete piece.demo
  const b = $('[data-enregistrer]'); b.disabled = true; b.textContent = 'Enregistrement…'
  try {
    const neuf = !F.id
    await donnees.enregistrer(piece)
    fermerFiche(); await recharger()
    toast(neuf ? `${nom} est sur le portant.` : 'Modifications enregistrées.', true)
  } catch (err) {
    console.error(err)
    toast('L’enregistrement n’a pas abouti. Vérifiez la connexion et réessayez.')
  } finally { b.disabled = false; b.textContent = 'Enregistrer' }
})

$('[data-supprimer]').addEventListener('click', async () => {
  if (!F?.id || !confirm(`Supprimer « ${F.nom} » ? Elle disparaîtra de la boutique.`)) return
  await donnees.supprimer(F.id); fermerFiche(); await recharger(); toast('Pièce supprimée.')
})

addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (!$('[data-source]').hidden) finChoix(null)
  else if (!studio.hidden) fermerStudio(null)
  else if (!fiche.hidden) fermerFiche()
})

/* ---------- Petits outils ---------- */

const PALETTE = [
  ['Noir', 20, 20, 20], ['Anthracite', 60, 60, 62], ['Gris', 140, 140, 140], ['Gris clair', 200, 200, 198], ['Blanc', 245, 245, 242], ['Écru', 236, 228, 210],
  ['Beige', 214, 196, 166], ['Camel', 170, 120, 70], ['Ocre', 160, 100, 20], ['Cognac', 140, 75, 30], ['Marron', 100, 66, 40], ['Chocolat', 70, 45, 30], ['Rouge', 200, 30, 30], ['Bordeaux', 110, 25, 40],
  ['Rose', 236, 170, 185], ['Rose poudré', 238, 198, 200], ['Fuchsia', 210, 40, 130], ['Orange', 235, 120, 40], ['Moutarde', 195, 145, 25], ['Jaune', 240, 210, 60],
  ['Vert', 50, 140, 70], ['Vert forêt', 30, 75, 45], ['Kaki', 110, 110, 70], ['Vert sauge', 160, 175, 145], ['Bleu', 40, 90, 190], ['Bleu ciel', 160, 195, 230],
  ['Marine', 25, 35, 65], ['Indigo', 35, 45, 80], ['Turquoise', 50, 170, 175], ['Violet', 110, 60, 140], ['Lilas', 190, 170, 215]
]
function nomCouleur (hex) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  let best = PALETTE[0]; let bd = Infinity
  for (const p of PALETTE) {
    const r = (v[0] + p[1]) / 2
    const d = (2 + r / 256) * (v[0] - p[1]) ** 2 + 4 * (v[1] - p[2]) ** 2 + (2 + (255 - r) / 256) * (v[2] - p[3]) ** 2
    if (d < bd) { bd = d; best = p }
  }
  return best[0]
}

const tst = $('[data-toast]'); let tt
function toast (msg, lien = false) {
  tst.innerHTML = `<span>${esc(msg)}</span>${lien ? '<a class="at-lnk" href="../">Voir la boutique</a>' : ''}`
  tst.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tst.classList.remove('is-on'), 4200)
}

demarrer()
