/* Fiche produit : galerie (face, dos, détails), zoom, couleurs, tailles, guide des tailles,
   disponibilité réelle, quantité, ajout au panier, description, composition, suggestions. */
import { $, $$, esc, euros, B, C, PIECES, NOMS_CAT, RAYONS, remise, prixHtml, carte, lienRayon, ajouter, dansPanier, piegerFocus, reduce } from './coquille.js'

const ref = new URLSearchParams(location.search).get('ref') || ''
const p = PIECES.find((x) => x.reference === ref)
if (!p) {
  $('[data-introuvable]').hidden = false
  document.title = `Pièce introuvable, ${B.nom}`
} else {
  monter(p)
}

function monter (p) {
  $('[data-fiche]').hidden = false
  document.title = `${p.nom}, ${B.nom}`
  $('meta[name=description]').content = (p.description || `${p.nom}, ${NOMS_CAT[p.categorie] || ''}`).slice(0, 160)
  const rayon = RAYONS.find((c) => c.slug === p.categorie)
  $('[data-fil]').innerHTML = `<a href="/">Accueil</a><span aria-hidden="true">/</span>${rayon ? `<a href="${lienRayon(rayon.groupe)}">${rayon.groupe === 'accessoires' ? 'Accessoires' : 'Vêtements'}</a><span aria-hidden="true">/</span><a href="${lienRayon(rayon.slug)}">${esc(rayon.nom)}</a>` : '<a href="/boutique/">La boutique</a>'}`
  $('[data-nom]').textContent = p.nom
  $('[data-prix]').innerHTML = prixHtml(p) + (remise(p) ? ` <span class="etiquette etiquette--promo">−${remise(p)} %</span>` : '') + (p.nouveau ? ' <span class="etiquette">Nouveau</span>' : '')
  $('[data-description]').innerHTML = (p.description || '').split(/\n+/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('') + (p.type ? `<p>${esc(p.type)}. Référence ${esc(p.reference)}.</p>` : `<p>Référence ${esc(p.reference)}.</p>`)
  if (p.composition) { $('[data-pli-composition]').hidden = false; $('[data-composition]').innerHTML = p.composition.split(/\n+/).map((t) => `<p>${esc(t)}</p>`).join('') }
  $('[data-livraison]').innerHTML = [
    `<p>Livraison à domicile : ${euros(B.livraison_centimes)}, offerte dès ${euros(B.livraison_offerte_centimes)} d’achat.</p>`,
    B.retrait ? `<p>Retrait gratuit en boutique : ${esc(B.retrait.adresse)}.</p>` : '',
    `<p>${B.paiement === 'stripe' ? 'Paiement par carte bancaire via Stripe.' : B.paiement === 'test' ? 'Boutique de démonstration : le paiement est simulé, aucune somme n’est débitée.' : 'La commande en ligne sera bientôt disponible.'}</p>`
  ].join('')
  $('[data-atouts]').innerHTML = [
    `<li>Livraison offerte dès ${euros(B.livraison_offerte_centimes)}</li>`,
    B.retrait ? '<li>Retrait gratuit en boutique</li>' : ''
  ].join('')

  /* État de la sélection */
  const sel = { c: 0, v: null, q: 1 }
  const unique = (c) => { const vs = p.couleurs[c].variantes; return vs.length === 1 && vs[0].disponible ? vs[0].id : null }
  sel.v = unique(0)
  const guide = parseGuide(C.guide_tailles)
  $('[data-guide-ouvrir]').hidden = !guide || p.presentation === 'objet' && !/\d/.test(p.tailles.join(''))

  function vues (col) {
    return [{ src: col.face, nom: 'Devant' }, ...(col.dos ? [{ src: col.dos, nom: 'Dos' }] : []), ...(col.details || []).map((src, i) => ({ src, nom: `Détail ${i + 1}` }))]
  }
  function peindreGalerie () {
    const col = p.couleurs[sel.c]; const v = vues(col)
    const g = $('[data-galerie]')
    g.classList.toggle('galerie--objet', p.presentation === 'objet')
    g.innerHTML = v.map((x, i) => `<figure class="galerie__vue" data-vue="${i}" role="button" tabindex="0" aria-label="Agrandir la photo : ${esc(x.nom)}">
      <img src="${esc(x.src)}" alt="${esc(p.nom)}, ${esc(col.nom)}, ${esc(x.nom.toLowerCase())}" width="660" height="876" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
      ${v.length > 1 ? `<figcaption>${esc(x.nom)}</figcaption>` : ''}</figure>`).join('')
    g.scrollLeft = 0
    $('[data-galerie-pos]').textContent = v.length > 1 ? `1 / ${v.length}` : ''
    $('[data-galerie-pos]').hidden = v.length < 2
  }
  function peindre () {
    const col = p.couleurs[sel.c]
    $('[data-bloc-couleurs]').hidden = p.couleurs.length < 2 && !col.nom
    $('[data-couleur-nom]').textContent = col.nom
    $('[data-couleurs]').innerHTML = p.couleurs.length > 1 ? p.couleurs.map((c, k) => `<button type="button" class="sw${k === sel.c ? ' is-on' : ''}" style="--c:${esc(c.hex)}" data-c="${k}" aria-pressed="${k === sel.c}" aria-label="${esc(c.nom)}" title="${esc(c.nom)}"></button>`).join('') : ''
    const seule = col.variantes.length === 1 && /^(tu|taille unique|unique)$/i.test(col.variantes[0].taille)
    $('[data-bloc-tailles]').hidden = seule
    $('[data-tailles]').innerHTML = col.variantes.map((v) => `<button type="button" class="size${v.id === sel.v ? ' is-on' : ''}${v.disponible ? '' : ' is-off'}" data-v="${esc(v.id)}" aria-pressed="${v.id === sel.v}" ${v.disponible ? '' : `disabled aria-label="${esc(v.taille)}, épuisé"`}>${esc(v.taille)}</button>`).join('')
    const v = col.variantes.find((x) => x.id === sel.v)
    $('[data-taille-choisie]').textContent = v ? ` : ${v.taille}` : ''
    const libres = col.variantes.filter((x) => x.disponible)
    const dispo = $('[data-dispo]')
    dispo.className = 'dispo'
    if (!libres.length) { dispo.classList.add('dispo--off'); dispo.textContent = p.couleurs.length > 1 ? 'Épuisé dans cette couleur' : 'Épuisé' } else if (v) {
      const reste = v.stock - dansPanier(v.id)
      if (v.stock <= 2) dispo.classList.add('dispo--peu')
      dispo.textContent = v.stock <= 2 ? `Plus que ${v.stock} en ${v.taille}` : `En stock en ${v.taille}`
      if (reste <= 0) dispo.textContent = `Tout le stock en ${v.taille} est déjà dans votre panier`
    } else dispo.textContent = libres.length === col.variantes.length ? 'En stock, toutes tailles' : `Disponible en ${libres.map((x) => x.taille).join(', ')}`
    const max = v ? Math.max(1, v.stock - dansPanier(v.id)) : 10
    sel.q = Math.min(sel.q, max)
    $('[data-qte-n]').textContent = sel.q
    $('[data-qte-moins]').disabled = sel.q <= 1
    $('[data-qte-plus]').disabled = !v || sel.q >= max
    const b = $('[data-ajouter]')
    b.disabled = !libres.length || !!(v && v.stock - dansPanier(v.id) <= 0)
    b.textContent = !libres.length ? 'Épuisé' : 'Ajouter au panier'
  }
  peindreGalerie(); peindre()

  const fiche = $('[data-fiche]')
  fiche.addEventListener('click', (e) => {
    const c = e.target.closest('[data-c]'); if (c) { sel.c = +c.dataset.c; sel.v = unique(sel.c); sel.q = 1; $('[data-err]').textContent = ''; peindreGalerie(); peindre() }
    const s = e.target.closest('[data-v]'); if (s && !s.disabled) { sel.v = s.dataset.v; sel.q = 1; $('[data-err]').textContent = ''; peindre() }
    if (e.target.closest('[data-qte-moins]')) { sel.q = Math.max(1, sel.q - 1); peindre() }
    if (e.target.closest('[data-qte-plus]')) { sel.q++; peindre() }
    const vue = e.target.closest('[data-vue]'); if (vue) ouvrirZoom(+vue.dataset.vue)
  })
  fiche.addEventListener('keydown', (e) => { const vue = e.target.closest('[data-vue]'); if (vue && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ouvrirZoom(+vue.dataset.vue) } })
  $('[data-galerie]').addEventListener('scroll', (e) => {
    const g = e.currentTarget; const n = g.children.length
    if (n > 1) $('[data-galerie-pos]').textContent = `${Math.round(g.scrollLeft / g.clientWidth) + 1} / ${n}`
  }, { passive: true })
  $('[data-ajouter]').addEventListener('click', () => {
    if (!sel.v) { $('[data-err]').textContent = 'Choisissez une taille.'; $('[data-tailles] button:not([disabled])')?.focus(); return }
    if (ajouter(sel.v, sel.q)) { sel.q = 1; peindre() }
  })

  /* Zoom plein écran */
  const zoom = $('[data-zoom]'); const scene = $('[data-zoom-scene]'); const zimg = $('[data-zoom-img]')
  let zi = 0; let retour = null
  function montrer (i) {
    const v = vues(p.couleurs[sel.c]); zi = (i + v.length) % v.length
    zimg.src = v[zi].src; zimg.alt = `${p.nom}, ${v[zi].nom.toLowerCase()}`
    scene.classList.remove('is-zoom')
    $('[data-zoom-pos]').textContent = v.length > 1 ? `${zi + 1} / ${v.length}` : ''
    $('[data-zoom-vignettes]').innerHTML = v.length > 1 ? v.map((x, k) => `<button type="button" class="${k === zi ? 'is-on' : ''}" data-zoom-aller="${k}" aria-label="${esc(x.nom)}"><img src="${esc(x.src)}" alt=""></button>`).join('') : ''
    for (const b of $$('[data-zoom-pas]')) b.hidden = v.length < 2
  }
  function ouvrirZoom (i) {
    retour = document.activeElement
    montrer(i); zoom.hidden = false; zoom.classList.add('is-on')
    document.documentElement.style.overflow = 'hidden'
    $('[data-zoom-fermer]').focus({ preventScroll: true })
  }
  function fermerZoom () {
    zoom.hidden = true; document.documentElement.style.overflow = ''
    retour?.focus?.({ preventScroll: true })
  }
  const origine = (e) => { const r = scene.getBoundingClientRect(); zimg.style.setProperty('--ox', `${((e.clientX - r.left) / r.width) * 100}%`); zimg.style.setProperty('--oy', `${((e.clientY - r.top) / r.height) * 100}%`) }
  scene.addEventListener('click', (e) => {
    if (e.target.closest('[data-zoom-pas]')) { montrer(zi + +e.target.closest('[data-zoom-pas]').dataset.zoomPas); return }
    origine(e); scene.classList.toggle('is-zoom')
  })
  scene.addEventListener('pointermove', (e) => { if (scene.classList.contains('is-zoom')) origine(e) })
  zoom.addEventListener('click', (e) => { const a = e.target.closest('[data-zoom-aller]'); if (a) montrer(+a.dataset.zoomAller); if (e.target.closest('[data-zoom-fermer]')) fermerZoom() })
  let sx = null
  scene.addEventListener('touchstart', (e) => { sx = e.touches.length === 1 ? e.touches[0].clientX : null }, { passive: true })
  scene.addEventListener('touchend', (e) => {
    if (sx == null || scene.classList.contains('is-zoom')) return
    const dx = e.changedTouches[0].clientX - sx; sx = null
    if (Math.abs(dx) > 50) { e.preventDefault(); montrer(zi + (dx < 0 ? 1 : -1)) }
  })
  addEventListener('keydown', (e) => {
    if (zoom.hidden) return
    if (e.key === 'Escape') fermerZoom()
    if (e.key === 'ArrowRight') montrer(zi + 1)
    if (e.key === 'ArrowLeft') montrer(zi - 1)
    if (e.key === 'Tab') piegerFocus(e, zoom)
  })

  /* Guide des tailles (texte saisi par la boutique : une ligne par taille, colonnes séparées par « | ») */
  if (guide) {
    const d = $('[data-guide]')
    $('[data-guide-corps]').innerHTML = `<table class="tableau"><thead><tr>${guide.tete.map((t) => `<th scope="col">${esc(t)}</th>`).join('')}</tr></thead>
      <tbody>${guide.lignes.map((l) => `<tr>${l.map((t, i) => i ? `<td>${esc(t)}</td>` : `<th scope="row">${esc(t)}</th>`).join('')}</tr>`).join('')}</tbody></table>
      ${guide.notes.map((n) => `<p class="dialogue__note">${esc(n)}</p>`).join('')}`
    $('[data-guide-ouvrir]').addEventListener('click', () => d.showModal())
    $('[data-guide-fermer]').addEventListener('click', () => d.close())
    d.addEventListener('click', (e) => { if (e.target === d) d.close() })
  }

  /* Suggestions : même rayon, puis même collection, puis le reste */
  const autres = PIECES.filter((x) => x !== p)
  const score = (x) => (x.categorie === p.categorie ? 4 : 0) + (x.collections.some((c) => p.collections.includes(c)) ? 2 : 0) + (x.presentation === p.presentation ? 1 : 0)
  const sugg = autres.map((x, i) => [x, score(x), i]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).slice(0, 4).map(([x]) => x)
  $('[data-suggestions]').innerHTML = sugg.map(carte).join('')
  $('[data-bloc-suggestions]').hidden = !sugg.length
  if (!reduce) scrollTo(0, 0)
}

function parseGuide (txt) {
  const lignes = String(txt || '').split(/\n/).map((l) => l.trim()).filter(Boolean)
  const tab = lignes.filter((l) => l.includes('|')).map((l) => l.split('|').map((c) => c.trim()))
  if (tab.length < 2) return null
  return { tete: tab[0], lignes: tab.slice(1), notes: lignes.filter((l) => !l.includes('|')) }
}
