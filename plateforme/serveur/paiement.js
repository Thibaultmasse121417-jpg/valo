/* Paiement.
   - stripe : Stripe Checkout sur le compte Stripe de la boutique (Stripe Connect).
     L'argent va directement à la boutique ; la plateforme peut prendre une commission.
   - test : page de paiement simulée, sans argent réel (développement et démonstration). */
import Stripe from 'stripe'
import { config } from './config.js'

export const stripe = config.stripe.cle ? new Stripe(config.stripe.cle) : null

export function modePaiement (boutique) {
  if (boutique.paiement_mode === 'stripe' && stripe && boutique.stripe_compte) return 'stripe'
  if (config.paiementTest) return 'test'
  return null
}

export async function sessionStripe (boutique, commande, origine) {
  const params = {
    mode: 'payment',
    customer_email: commande.email,
    client_reference_id: commande.id,
    metadata: { commande_id: commande.id, boutique_id: boutique.id },
    line_items: commande.lignes.map((l) => ({
      quantity: l.quantite,
      price_data: { currency: boutique.devise.toLowerCase(), unit_amount: l.prix_centimes, product_data: { name: `${l.nom} · ${l.couleur} · ${l.taille}` } }
    })),
    success_url: `${origine}/commande/?n=${commande.jeton}&retour=stripe`,
    cancel_url: `${origine}/commande/?n=${commande.jeton}&retour=annule`,
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60
  }
  if (commande.livraison_centimes) {
    params.line_items.push({ quantity: 1, price_data: { currency: boutique.devise.toLowerCase(), unit_amount: commande.livraison_centimes, product_data: { name: 'Livraison' } } })
  }
  if (config.stripe.commission > 0) {
    params.payment_intent_data = { application_fee_amount: Math.round(commande.total_centimes * config.stripe.commission / 100) }
  }
  return stripe.checkout.sessions.create(params, { stripeAccount: boutique.stripe_compte })
}

export async function verifierSessionStripe (boutique, sessionId) {
  const s = await stripe.checkout.sessions.retrieve(sessionId, { stripeAccount: boutique.stripe_compte })
  return { payee: s.payment_status === 'paid', expiree: s.status === 'expired', ref: s.payment_intent || s.id }
}

/* Lien d'inscription Stripe pour la boutique (compte Express). */
export async function lienStripe (boutique, origine) {
  let compte = boutique.stripe_compte
  if (!compte) compte = (await stripe.accounts.create({ type: 'express', country: 'FR', business_profile: { name: boutique.nom } })).id
  const lien = await stripe.accountLinks.create({ account: compte, type: 'account_onboarding', refresh_url: `${origine}/admin/#boutique`, return_url: `${origine}/admin/#boutique` })
  return { compte, url: lien.url }
}

export async function etatStripe (boutique) {
  if (!stripe || !boutique.stripe_compte) return { configure: !!stripe, connecte: false }
  const a = await stripe.accounts.retrieve(boutique.stripe_compte)
  return { configure: true, connecte: true, paiements_actifs: !!a.charges_enabled }
}
