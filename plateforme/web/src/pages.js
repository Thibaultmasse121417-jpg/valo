/* Pages simples : confirmation de commande et paiement de test. */
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/jost'
import './pages.css'
import { $, esc, euros, api, appliquerTheme } from './commun.js'

const jeton = new URLSearchParams(location.search).get('n') || ''
const page = document.body.dataset.page

const B = await api('/api/boutique').catch(() => null)
if (B) {
  appliquerTheme(B.theme)
  $('[data-logo]').innerHTML = B.logo ? `<img src="${esc(B.logo)}" alt="${esc(B.nom)}">` : esc(B.nom)
}

const ETATS = {
  en_attente_paiement: ['En attente', 'Paiement en cours', 'Votre commande est réservée. Elle sera confirmée dès la réception du paiement.'],
  payee: ['Merci', 'Commande confirmée', 'Le paiement est reçu, la boutique prépare votre commande. Gardez cette page : elle permet de suivre la commande.'],
  preparee: ['En préparation', 'Commande en préparation', 'La boutique prépare votre commande.'],
  expediee: ['Expédiée', 'Commande expédiée', 'Votre colis est en route.'],
  retiree: ['Retirée', 'Commande retirée', 'Merci et à bientôt.'],
  annulee: ['Annulée', 'Commande annulée', 'Aucun montant n’a été prélevé. Vos articles sont de nouveau disponibles.'],
  expiree: ['Expirée', 'Délai de paiement dépassé', 'La réservation a expiré. Vous pouvez recommencer votre commande depuis la boutique.']
}

function recap (cmd) {
  $('[data-lignes]').innerHTML = cmd.lignes.map((l) => `<li><span>${esc(l.nom)}<small>${esc(l.couleur)}, taille ${esc(l.taille)}, quantité ${l.quantite}</small></span><b>${euros(l.prix_centimes * l.quantite)}</b></li>`).join('')
  $('[data-totaux]').innerHTML = `<dt>Sous-total</dt><dd>${euros(cmd.sous_total_centimes)}</dd>
    <dt>${cmd.livraison_mode === 'retrait' ? 'Retrait en boutique' : cmd.livraison_mode === 'relais' ? 'Point relais' : 'Livraison'}</dt><dd>${cmd.livraison_centimes ? euros(cmd.livraison_centimes) : 'offerte'}</dd>
    <dt class="pg-total">Total</dt><dd class="pg-total">${euros(cmd.total_centimes)}</dd>`
}

if (page === 'commande') {
  try {
    const cmd = await api(`/api/commandes/${encodeURIComponent(jeton)}`)
    const [k, t, p] = ETATS[cmd.statut] || ETATS.en_attente_paiement
    document.title = `${t}, ${B?.nom || ''}`
    $('[data-etat]').textContent = `${k}, commande n° ${cmd.numero}`
    $('[data-titre]').textContent = t
    $('[data-texte]').textContent = p
    recap(cmd)
  } catch (e) {
    $('[data-etat]').textContent = ''
    $('[data-titre]').textContent = 'Commande introuvable'
    $('[data-texte]').textContent = e.message
  }
}

if (page === 'paiement') {
  try {
    const cmd = await api(`/api/commandes/${encodeURIComponent(jeton)}`)
    if (cmd.statut !== 'en_attente_paiement') location.replace(`/commande/?n=${encodeURIComponent(jeton)}`)
    $('[data-titre]').textContent = `Commande n° ${cmd.numero}`
    recap(cmd)
    $('[data-payer]').textContent = `Simuler le paiement de ${euros(cmd.total_centimes)}`
  } catch (e) { $('[data-err]').textContent = e.message }
  const agir = async (action) => {
    $('[data-payer]').disabled = true; $('[data-annuler]').disabled = true
    try {
      await api(`/api/paiement-test/${encodeURIComponent(jeton)}`, { method: 'POST', body: { action } })
      location.href = action === 'payer' ? `/commande/?n=${encodeURIComponent(jeton)}` : '/'
    } catch (e) { $('[data-err]').textContent = e.message; $('[data-payer]').disabled = false; $('[data-annuler]').disabled = false }
  }
  $('[data-payer]').addEventListener('click', () => agir('payer'))
  $('[data-annuler]').addEventListener('click', () => agir('annuler'))
  $('[data-payer]').disabled = false; $('[data-annuler]').disabled = false // prêts : jamais de clic perdu avant le chargement
}
